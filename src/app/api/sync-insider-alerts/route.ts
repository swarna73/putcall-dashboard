// API Route: /api/sync-insider-alerts
// Automated pipeline: Reddit → SEC Verification → Supabase storage
// Called by cron job (GitHub Actions or Vercel Cron)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface ParsedInsiderAlert {
  redditId: string;
  ticker: string;
  type: 'BUY' | 'SELL';
  amount: string | null;
  shares: number | null;
  pricePerShare: number | null;
  tradeDate: string | null;
  filingDate: string | null;
  insiderName: string | null;
  companyName: string | null;
  redditUrl: string;
  redditScore: number;
  postedAt: string;
  rawText: string;
}

interface SecVerification {
  verified: boolean | 'partial';
  message: string;
  companyName?: string;
  cik?: string;
  secFilingUrl?: string;
}

// Verify a single alert against SEC EDGAR
async function verifyWithSec(alert: ParsedInsiderAlert): Promise<SecVerification> {
  const userAgent = 'PutCall.nl insider-verification tool contact@putcall.nl';

  try {
    // Get ticker to CIK mapping
    const tickerMapResponse = await fetch(
      'https://www.sec.gov/files/company_tickers.json',
      { headers: { 'User-Agent': userAgent } }
    );

    if (!tickerMapResponse.ok) {
      return { verified: false, message: 'Failed to fetch SEC data' };
    }

    const tickerMap = await tickerMapResponse.json();
    
    // Find CIK for ticker
    let cik: string | null = null;
    let companyName: string | null = null;
    
    for (const key in tickerMap) {
      if (tickerMap[key].ticker === alert.ticker) {
        cik = String(tickerMap[key].cik_str).padStart(10, '0');
        companyName = tickerMap[key].title;
        break;
      }
    }

    if (!cik) {
      return { verified: false, message: `Ticker ${alert.ticker} not found in SEC` };
    }

    // Get company filings
    const filingsResponse = await fetch(
      `https://data.sec.gov/submissions/CIK${cik}.json`,
      { headers: { 'User-Agent': userAgent } }
    );

    if (!filingsResponse.ok) {
	return { verified: false, message: 'Failed to fetch filings', cik: cik ?? undefined, companyName: companyName ?? undefined };
    }


    const filingsData = await filingsResponse.json();
    const recentFilings = filingsData.filings?.recent;

    if (!recentFilings?.form) {
      return { verified: false, message: 'No recent filings', cik, companyName };
    }

    // Find Form 4 filings
    for (let i = 0; i < recentFilings.form.length && i < 20; i++) {
      if (recentFilings.form[i] === '4') {
        const filingDate = recentFilings.filingDate[i];
        const reportDate = recentFilings.reportDate?.[i];
        
        // Check if dates match (if we have a trade date)
        if (alert.tradeDate) {
          if (reportDate === alert.tradeDate || filingDate === alert.filingDate) {
            const accession = recentFilings.accessionNumber[i].replace(/-/g, '');
            const cleanCik = cik.replace(/^0+/, '');
            const secFilingUrl = `https://www.sec.gov/Archives/edgar/data/${cleanCik}/${accession}/${recentFilings.primaryDocument[i]}`;
            
            return {
              verified: true,
              message: `Verified: Form 4 filed ${filingDate}`,
              companyName,
              cik,
              secFilingUrl,
            };
          }
        } else {
          // No trade date to match, but Form 4 exists recently
          const accession = recentFilings.accessionNumber[i].replace(/-/g, '');
          const cleanCik = cik.replace(/^0+/, '');
          const secFilingUrl = `https://www.sec.gov/Archives/edgar/data/${cleanCik}/${accession}/${recentFilings.primaryDocument[i]}`;
          
          return {
            verified: 'partial',
            message: `Form 4 found (${filingDate}), no exact date match`,
            companyName,
            cik,
            secFilingUrl,
          };
        }
      }
    }

    return {
      verified: 'partial',
      message: 'Company found but no recent Form 4 match',
      companyName,
      cik,
    };

  } catch (error) {
    console.error(`SEC verification error for ${alert.ticker}:`, error);
    return { verified: false, message: 'SEC verification failed' };
  }
}

// Rate limiting helper - SEC allows 10 req/sec
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  // Verify cron secret for security
  const cronSecret = request.headers.get('x-cron-secret') || 
                     new URL(request.url).searchParams.get('secret');
  
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = {
    fetched: 0,
    parsed: 0,
    verified: 0,
    partial: 0,
    stored: 0,
    skipped: 0,
    errors: [] as string[],
  };

  try {
    // Step 1: Fetch from Reddit
    const redditUrl = 'https://www.reddit.com/r/InsiderData/new.json?limit=50';
    const redditResponse = await fetch(redditUrl, {
      headers: {
        'User-Agent': 'PutCall.nl:insider-monitor:v1.0 (by /u/putcall_nl)',
      },
    });

    if (!redditResponse.ok) {
      throw new Error(`Reddit API returned ${redditResponse.status}`);
    }

    const redditData = await redditResponse.json();
    const posts = redditData.data.children.map((child: any) => child.data);
    results.fetched = posts.length;

    // Step 2: Parse posts for insider alerts
    const alerts: ParsedInsiderAlert[] = [];
    
    for (const post of posts) {
      const text = `${post.title} ${post.selftext}`;
      
      // Check for insider alert indicators
      if (!text.toLowerCase().includes('insider') && 
          !text.toLowerCase().includes('form 4')) {
        continue;
      }

      // Extract ticker
      const tickerMatch = text.match(/\$([A-Z]{1,5})\b/i);
      if (!tickerMatch) continue;

      const ticker = tickerMatch[1].toUpperCase();
      
      // Determine buy or sell
      const isBuy = text.toLowerCase().includes('buy') || 
                    text.toLowerCase().includes('purchased');
      const isSell = text.toLowerCase().includes('sell') || 
                     text.toLowerCase().includes('sold');
      
      if (!isBuy && !isSell) continue;

      // Extract other fields
      const amountMatch = text.match(/\$(\d+\.?\d*)\s*([MBK])/i);
      const sharesMatch = text.match(/(\d{1,3}(?:,\d{3})*)\s*shares/i);
      const priceMatch = text.match(/\$(\d+\.?\d*)\s*per share/i);
      const tradeDateMatch = text.match(/Trade Date[:\s]*(\d{4}-\d{2}-\d{2})/i);
      const filingDateMatch = text.match(/Filing Date[:\s]*(\d{4}-\d{2}-\d{2})/i);

      alerts.push({
        redditId: post.id,
        ticker,
        type: isBuy ? 'BUY' : 'SELL',
        amount: amountMatch ? amountMatch[0] : null,
        shares: sharesMatch ? parseInt(sharesMatch[1].replace(/,/g, '')) : null,
        pricePerShare: priceMatch ? parseFloat(priceMatch[1]) : null,
        tradeDate: tradeDateMatch ? tradeDateMatch[1] : null,
        filingDate: filingDateMatch ? filingDateMatch[1] : null,
        insiderName: null,
        companyName: null,
        redditUrl: `https://reddit.com${post.permalink}`,
        redditScore: post.score,
        postedAt: new Date(post.created_utc * 1000).toISOString(),
        rawText: text.slice(0, 500),
      });
    }

    results.parsed = alerts.length;

    // Step 3: Check which alerts we already have
    const redditIds = alerts.map(a => a.redditId);
    const { data: existingAlerts } = await supabase
      .from('insider_alerts')
      .select('reddit_id')
      .in('reddit_id', redditIds);

    const existingIds = new Set(existingAlerts?.map(a => a.reddit_id) || []);
    const newAlerts = alerts.filter(a => !existingIds.has(a.redditId));
    results.skipped = alerts.length - newAlerts.length;

    // Step 4: Verify new alerts with SEC and store
    for (const alert of newAlerts) {
      try {
        // Rate limit for SEC API
        await delay(150);
        
        const verification = await verifyWithSec(alert);
        
        if (verification.verified === true) {
          results.verified++;
        } else if (verification.verified === 'partial') {
          results.partial++;
        }

        // Store in Supabase
        const { error: insertError } = await supabase
          .from('insider_alerts')
          .insert({
            reddit_id: alert.redditId,
            ticker: alert.ticker,
            transaction_type: alert.type,
            amount: alert.amount,
            shares: alert.shares,
            price_per_share: alert.pricePerShare,
            trade_date: alert.tradeDate,
            filing_date: alert.filingDate,
            insider_name: alert.insiderName,
            company_name: verification.companyName || alert.companyName,
            cik: verification.cik,
            reddit_url: alert.redditUrl,
            reddit_score: alert.redditScore,
            posted_at: alert.postedAt,
            raw_text: alert.rawText,
            verification_status: verification.verified === true ? 'verified' 
              : verification.verified === 'partial' ? 'partial' : 'unverified',
            verification_message: verification.message,
            sec_filing_url: verification.secFilingUrl,
            synced_at: new Date().toISOString(),
          });

        if (insertError) {
          results.errors.push(`Insert error for ${alert.ticker}: ${insertError.message}`);
        } else {
          results.stored++;
        }

      } catch (error) {
        results.errors.push(`Error processing ${alert.ticker}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      results,
      syncedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        results,
      },
      { status: 500 }
    );
  }
}

// Also allow GET for manual testing (still requires secret)
export async function GET(request: NextRequest) {
  return POST(request);
}
