// API Route: /api/sync-insider-alerts
// Direct SEC EDGAR monitoring - fetches Form 4 filings and filters large transactions
// No Reddit dependency

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const SEC_USER_AGENT = 'PutCall.nl contact@putcall.nl';
const MIN_TRANSACTION_VALUE = 100000; // $100K minimum

interface Form4Transaction {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  ticker: string;
  companyName: string;
  cik: string;
  insiderName: string;
  insiderTitle: string;
  transactionType: 'BUY' | 'SELL';
  shares: number;
  pricePerShare: number;
  totalValue: number;
  secFilingUrl: string;
}

// Fetch recent Form 4 filings from SEC
async function fetchRecentForm4s(): Promise<any[]> {
  const response = await fetch(
    'https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=4&company=&dateb=&owner=only&count=100&output=atom',
    { headers: { 'User-Agent': SEC_USER_AGENT } }
  );

  if (!response.ok) {
    throw new Error(`SEC feed returned ${response.status}`);
  }

  const text = await response.text();
  
  // Parse Atom feed entries
  const entries: any[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(text)) !== null) {
    const entry = match[1];
    
    const titleMatch = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    const linkMatch = entry.match(/<link[^>]*href="([^"]+)"/);
    const updatedMatch = entry.match(/<updated>([^<]+)<\/updated>/);
    const summaryMatch = entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/);

    if (titleMatch && linkMatch) {
      entries.push({
        title: titleMatch[1].trim(),
        link: linkMatch[1],
        updated: updatedMatch ? updatedMatch[1] : null,
        summary: summaryMatch ? summaryMatch[1].trim() : '',
      });
    }
  }

  return entries;
}

// Parse Form 4 filing details
async function parseForm4Filing(entry: any): Promise<Form4Transaction | null> {
  try {
    // Extract accession number from link
    const accessionMatch = entry.link.match(/accession-number=(\d{10}-\d{2}-\d{6})/);
    if (!accessionMatch) return null;
    
    const accessionNumber = accessionMatch[1];
    const accessionFormatted = accessionNumber.replace(/-/g, '');
    
    // Extract CIK from title (format: "4 - Company Name (0001234567) (Reporting)")
    const titleParts = entry.title.match(/4\s*-\s*(.+?)\s*\((\d+)\)/);
    if (!titleParts) return null;
    
    const companyName = titleParts[1].trim();
    const cik = titleParts[2].padStart(10, '0');

    // Fetch the Form 4 XML
    const xmlUrl = `https://www.sec.gov/Archives/edgar/data/${cik.replace(/^0+/, '')}/${accessionFormatted}`;
    
    // Get the filing index to find the XML file
    const indexResponse = await fetch(`${xmlUrl}/index.json`, {
      headers: { 'User-Agent': SEC_USER_AGENT }
    });
    
    if (!indexResponse.ok) return null;
    
    const indexData = await indexResponse.json();
    const xmlFile = indexData.directory?.item?.find((f: any) => 
      f.name.endsWith('.xml') && !f.name.includes('primary')
    );
    
    if (!xmlFile) return null;

    // Fetch and parse the XML
    const xmlResponse = await fetch(`${xmlUrl}/${xmlFile.name}`, {
      headers: { 'User-Agent': SEC_USER_AGENT }
    });
    
    if (!xmlResponse.ok) return null;
    
    const xmlText = await xmlResponse.text();
    
    // Parse key fields from XML
    const tickerMatch = xmlText.match(/<issuerTradingSymbol>([^<]+)<\/issuerTradingSymbol>/);
    const insiderNameMatch = xmlText.match(/<rptOwnerName>([^<]+)<\/rptOwnerName>/);
    const insiderTitleMatch = xmlText.match(/<officerTitle>([^<]+)<\/officerTitle>/) ||
                              xmlText.match(/<rptOwnerRelationship>[\s\S]*?<isDirector>true<\/isDirector>/) ||
                              xmlText.match(/<rptOwnerRelationship>[\s\S]*?<isTenPercentOwner>true<\/isTenPercentOwner>/);
    
    // Parse transactions (can be multiple)
    const transactionRegex = /<nonDerivativeTransaction>([\s\S]*?)<\/nonDerivativeTransaction>/g;
    let txMatch;
    let totalShares = 0;
    let avgPrice = 0;
    let transactionType: 'BUY' | 'SELL' | null = null;
    let priceCount = 0;
    let reportDate = '';

    while ((txMatch = transactionRegex.exec(xmlText)) !== null) {
      const tx = txMatch[1];
      
      // Transaction date
      const dateMatch = tx.match(/<transactionDate>[\s\S]*?<value>([^<]+)<\/value>/);
      if (dateMatch && !reportDate) {
        reportDate = dateMatch[1];
      }
      
      // Acquisition (A) or Disposition (D)
      const codeMatch = tx.match(/<transactionAcquiredDisposedCode>[\s\S]*?<value>([AD])<\/value>/);
      if (codeMatch) {
        const code = codeMatch[1];
        if (!transactionType) {
          transactionType = code === 'A' ? 'BUY' : 'SELL';
        }
      }
      
      // Shares
      const sharesMatch = tx.match(/<transactionShares>[\s\S]*?<value>([^<]+)<\/value>/);
      if (sharesMatch) {
        totalShares += parseFloat(sharesMatch[1]);
      }
      
      // Price per share
      const priceMatch = tx.match(/<transactionPricePerShare>[\s\S]*?<value>([^<]+)<\/value>/);
      if (priceMatch) {
        avgPrice += parseFloat(priceMatch[1]);
        priceCount++;
      }
    }

    if (!tickerMatch || !transactionType || totalShares === 0) return null;
    
    // Calculate average price
    if (priceCount > 0) {
      avgPrice = avgPrice / priceCount;
    }
    
    const totalValue = totalShares * avgPrice;
    
    // Filter for significant transactions
    if (totalValue < MIN_TRANSACTION_VALUE) return null;

    // Get filing date from entry
    const filingDate = entry.updated ? entry.updated.split('T')[0] : new Date().toISOString().split('T')[0];

    let insiderTitle = 'Insider';
    if (insiderTitleMatch) {
      if (typeof insiderTitleMatch[1] === 'string') {
        insiderTitle = insiderTitleMatch[1];
      } else if (insiderTitleMatch[0].includes('isDirector')) {
        insiderTitle = 'Director';
      } else if (insiderTitleMatch[0].includes('isTenPercentOwner')) {
        insiderTitle = '10% Owner';
      }
    }

    return {
      accessionNumber,
      filingDate,
      reportDate: reportDate || filingDate,
      ticker: tickerMatch[1].toUpperCase(),
      companyName,
      cik,
      insiderName: insiderNameMatch ? insiderNameMatch[1] : 'Unknown',
      insiderTitle,
      transactionType,
      shares: Math.round(totalShares),
      pricePerShare: Math.round(avgPrice * 100) / 100,
      totalValue: Math.round(totalValue),
      secFilingUrl: `https://www.sec.gov/Archives/edgar/data/${cik.replace(/^0+/, '')}/${accessionFormatted}`,
    };

  } catch (error) {
    console.error('Error parsing Form 4:', error);
    return null;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get('x-cron-secret') || 
                     new URL(request.url).searchParams.get('secret');
  
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = {
    fetched: 0,
    parsed: 0,
    qualified: 0,
    stored: 0,
    skipped: 0,
    errors: [] as string[],
  };

  try {
    // Step 1: Fetch recent Form 4s from SEC
    const entries = await fetchRecentForm4s();
    results.fetched = entries.length;

    // Step 2: Parse each filing (with rate limiting)
    const transactions: Form4Transaction[] = [];
    
    for (const entry of entries.slice(0, 50)) { // Process up to 50
      await delay(120); // SEC rate limit: 10 req/sec
      
      const tx = await parseForm4Filing(entry);
      if (tx) {
        transactions.push(tx);
        results.parsed++;
      }
    }
    
    results.qualified = transactions.length;

    // Step 3: Check for existing entries
    const accessionNumbers = transactions.map(t => t.accessionNumber);
    const { data: existing } = await supabase
      .from('insider_alerts')
      .select('reddit_id') // Using reddit_id field to store accession number
      .in('reddit_id', accessionNumbers);

    const existingIds = new Set(existing?.map(e => e.reddit_id) || []);
    const newTransactions = transactions.filter(t => !existingIds.has(t.accessionNumber));
    results.skipped = transactions.length - newTransactions.length;

    // Step 4: Store new transactions
    for (const tx of newTransactions) {
      const { error } = await supabase
        .from('insider_alerts')
        .insert({
          reddit_id: tx.accessionNumber, // Reusing field for unique ID
          ticker: tx.ticker,
          transaction_type: tx.transactionType,
          amount: `$${(tx.totalValue / 1000000).toFixed(2)}M`,
          shares: tx.shares,
          price_per_share: tx.pricePerShare,
          trade_date: tx.reportDate,
          filing_date: tx.filingDate,
          insider_name: tx.insiderName,
          company_name: tx.companyName,
          cik: tx.cik,
          reddit_url: null, // No Reddit source
          reddit_score: 0,
          posted_at: new Date().toISOString(),
          raw_text: `${tx.insiderName} (${tx.insiderTitle}) ${tx.transactionType === 'BUY' ? 'bought' : 'sold'} ${tx.shares.toLocaleString()} shares at $${tx.pricePerShare}`,
          verification_status: 'verified', // Direct from SEC = always verified
          verification_message: 'Direct SEC EDGAR Form 4 filing',
          sec_filing_url: tx.secFilingUrl,
          synced_at: new Date().toISOString(),
        });

      if (error) {
        results.errors.push(`Insert error for ${tx.ticker}: ${error.message}`);
      } else {
        results.stored++;
      }
    }

    return NextResponse.json({
      success: true,
      results,
      source: 'SEC EDGAR Direct',
      minTransactionValue: MIN_TRANSACTION_VALUE,
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

export async function GET(request: NextRequest) {
  return POST(request);
}
