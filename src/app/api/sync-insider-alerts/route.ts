// API Route: /api/sync-insider-alerts
// Combined approach: API Ninjas first, SEC EDGAR fallback
// Ensures we always get data

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const MIN_TRANSACTION_VALUE = 100000; // $100K minimum
const SEC_USER_AGENT = 'PutCall.nl contact@putcall.nl';

// Top traded stocks to monitor
const WATCHLIST = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'AMD', 'INTC',
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'V', 'MA', 'PYPL',
  'JNJ', 'PFE', 'UNH', 'MRK', 'ABBV', 'LLY',
  'XOM', 'CVX', 'COP', 'OXY',
  'DIS', 'NFLX', 'WMT', 'COST', 'HD', 'NKE',
  'BA', 'CAT', 'GE', 'UPS', 'FDX',
  'CRM', 'ORCL', 'ADBE', 'NOW', 'SNOW', 'PLTR'
];

interface InsiderTrade {
  id: string;
  ticker: string;
  insiderName: string;
  insiderTitle: string;
  transactionType: 'BUY' | 'SELL';
  shares: number;
  pricePerShare: number;
  totalValue: number;
  transactionDate: string;
  filingDate: string;
  companyName: string;
  secFilingUrl: string;
  source: 'api_ninjas' | 'sec_edgar';
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// OPTION 1: API Ninjas
// ============================================
async function fetchFromApiNinjas(): Promise<InsiderTrade[]> {
  const apiKey = process.env.NEXT_PUBLIC_API_NINJAS_KEY;
  
  if (!apiKey) {
    console.log('API Ninjas key not configured, skipping...');
    return [];
  }

  const allTrades: InsiderTrade[] = [];

  for (const ticker of WATCHLIST) {
    await delay(250); // Rate limit
    
    try {
      const response = await fetch(
        `https://api.api-ninjas.com/v1/insidertransactions?ticker=${ticker}`,
        { headers: { 'X-Api-Key': apiKey } }
      );

      if (!response.ok) continue;

      const transactions = await response.json();
      if (!Array.isArray(transactions)) continue;

      for (const t of transactions) {
        const price = t.transaction_price || 0;
        const shares = Math.abs(t.shares || 0);
        const totalValue = t.transaction_value || (shares * price);
        
        if (totalValue < MIN_TRANSACTION_VALUE) continue;
        
        const txType = (t.transaction_type || '').toLowerCase();
        const txCode = t.transaction_code;
        
        let transactionType: 'BUY' | 'SELL' | null = null;
        
        if ((txType.includes('purchase') || txCode === 'P') && price > 0) {
          transactionType = 'BUY';
        } else if ((txType.includes('sale') || txCode === 'S') && price > 0) {
          transactionType = 'SELL';
        }
        
        if (!transactionType) continue;
        
        const tradeId = `${ticker}-${t.insider_name}-${t.transaction_date}-${shares}`.replace(/\s/g, '_');
        
        allTrades.push({
          id: tradeId,
          ticker: ticker.toUpperCase(),
          insiderName: t.insider_name || 'Unknown',
          insiderTitle: t.insider_position || 'Insider',
          transactionType,
          shares,
          pricePerShare: Math.round(price * 100) / 100,
          totalValue: Math.round(totalValue),
          transactionDate: t.transaction_date || t.filing_date,
          filingDate: t.filing_date,
          companyName: ticker,
          secFilingUrl: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ticker}&type=4&dateb=&owner=include&count=10`,
          source: 'api_ninjas',
        });
      }
    } catch (err) {
      console.log(`API Ninjas error for ${ticker}:`, err);
    }
  }

  return allTrades;
}

// ============================================
// OPTION 2: SEC EDGAR Direct
// ============================================
async function fetchFromSecEdgar(): Promise<InsiderTrade[]> {
  const allTrades: InsiderTrade[] = [];
  
  // Try to fetch from SEC daily index
  const date = new Date();
  const year = date.getFullYear();
  const quarter = `QTR${Math.ceil((date.getMonth() + 1) / 3)}`;
  
  try {
    // Fetch the form index
    const indexUrl = `https://www.sec.gov/Archives/edgar/daily-index/${year}/${quarter}/form.idx`;
    
    const response = await fetch(indexUrl, {
      headers: { 'User-Agent': SEC_USER_AGENT }
    });
    
    if (!response.ok) {
      console.log('SEC daily index not available');
      return [];
    }
    
    const text = await response.text();
    const lines = text.split('\n');
    
    // Parse Form 4 entries
    const form4Entries: any[] = [];
    
    for (const line of lines) {
      if (line.startsWith('4 ') || line.match(/^4\s+/)) {
        const parts = line.split(/\s{2,}/).filter(p => p.trim());
        if (parts.length >= 5) {
          form4Entries.push({
            formType: parts[0].trim(),
            companyName: parts[1].trim(),
            cik: parts[2].trim(),
            dateFiled: parts[3].trim(),
            fileName: parts[4].trim(),
          });
        }
      }
    }

    // Process up to 20 filings
    for (const entry of form4Entries.slice(0, 20)) {
      await delay(150); // SEC rate limit
      
      try {
        const cik = entry.cik.replace(/^0+/, '');
        const accessionMatch = entry.fileName.match(/(\d{10}-\d{2}-\d{6})/);
        if (!accessionMatch) continue;
        
        const accessionNumber = accessionMatch[1];
        const accessionForUrl = accessionNumber.replace(/-/g, '');
        const baseUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${accessionForUrl}`;
        
        // Get index to find XML file
        const indexResponse = await fetch(`${baseUrl}/index.json`, {
          headers: { 'User-Agent': SEC_USER_AGENT }
        });
        
        if (!indexResponse.ok) continue;
        
        const indexData = await indexResponse.json();
        const items = indexData.directory?.item || [];
        const xmlFile = items.find((f: any) => 
          f.name.endsWith('.xml') && !f.name.includes('xsl')
        );
        
        if (!xmlFile) continue;
        
        // Fetch and parse XML
        const xmlResponse = await fetch(`${baseUrl}/${xmlFile.name}`, {
          headers: { 'User-Agent': SEC_USER_AGENT }
        });
        
        if (!xmlResponse.ok) continue;
        
        const xml = await xmlResponse.text();
        
        // Extract data
        const tickerMatch = xml.match(/<issuerTradingSymbol>([^<]+)<\/issuerTradingSymbol>/i);
        const insiderMatch = xml.match(/<rptOwnerName>([^<]+)<\/rptOwnerName>/i);
        
        if (!tickerMatch) continue;
        
        // Parse transactions
        let totalShares = 0;
        let priceSum = 0;
        let priceCount = 0;
        let transactionType: 'BUY' | 'SELL' | null = null;
        
        const txRegex = /<nonDerivativeTransaction>([\s\S]*?)<\/nonDerivativeTransaction>/gi;
        let match;
        
        while ((match = txRegex.exec(xml)) !== null) {
          const tx = match[1];
          
          const codeMatch = tx.match(/<transactionAcquiredDisposedCode>[\s\S]*?<value>([AD])<\/value>/i);
          if (codeMatch && !transactionType) {
            transactionType = codeMatch[1] === 'A' ? 'BUY' : 'SELL';
          }
          
          const sharesMatch = tx.match(/<transactionShares>[\s\S]*?<value>([\d.]+)<\/value>/i);
          if (sharesMatch) {
            totalShares += parseFloat(sharesMatch[1]);
          }
          
          const priceMatch = tx.match(/<transactionPricePerShare>[\s\S]*?<value>([\d.]+)<\/value>/i);
          if (priceMatch) {
            priceSum += parseFloat(priceMatch[1]);
            priceCount++;
          }
        }
        
        if (!transactionType || totalShares === 0) continue;
        
        const avgPrice = priceCount > 0 ? priceSum / priceCount : 0;
        const totalValue = totalShares * avgPrice;
        
        if (totalValue < MIN_TRANSACTION_VALUE) continue;
        
        const ticker = tickerMatch[1].toUpperCase();
        const insiderName = insiderMatch ? insiderMatch[1] : 'Unknown';
        
        allTrades.push({
          id: accessionNumber,
          ticker,
          insiderName,
          insiderTitle: 'Insider',
          transactionType,
          shares: Math.round(totalShares),
          pricePerShare: Math.round(avgPrice * 100) / 100,
          totalValue: Math.round(totalValue),
          transactionDate: entry.dateFiled,
          filingDate: entry.dateFiled,
          companyName: entry.companyName,
          secFilingUrl: baseUrl,
          source: 'sec_edgar',
        });
        
      } catch (err) {
        console.log(`SEC parsing error:`, err);
      }
    }
    
  } catch (err) {
    console.log('SEC EDGAR fetch error:', err);
  }
  
  return allTrades;
}

// ============================================
// MAIN HANDLER
// ============================================
export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get('x-cron-secret') || 
                     new URL(request.url).searchParams.get('secret');
  
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = {
    source: '' as string,
    tradesFound: 0,
    stored: 0,
    skipped: 0,
    errors: [] as string[],
  };

  try {
    // Try API Ninjas first
    console.log('Trying API Ninjas...');
    let trades = await fetchFromApiNinjas();
    results.source = 'api_ninjas';
    
    // Fallback to SEC EDGAR if no results
    if (trades.length === 0) {
      console.log('API Ninjas returned no results, trying SEC EDGAR...');
      trades = await fetchFromSecEdgar();
      results.source = 'sec_edgar';
    }
    
    // Still no results
    if (trades.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No qualifying insider trades found from any source',
        results,
      });
    }

    results.tradesFound = trades.length;

    // Check for existing entries
    const tradeIds = trades.map(t => t.id);
    const { data: existing } = await supabase
      .from('insider_alerts')
      .select('reddit_id')
      .in('reddit_id', tradeIds);

    const existingIds = new Set(existing?.map(e => e.reddit_id) || []);
    const newTrades = trades.filter(t => !existingIds.has(t.id));
    results.skipped = trades.length - newTrades.length;

    // Store new trades
    for (const trade of newTrades) {
      const { error } = await supabase
        .from('insider_alerts')
        .insert({
          reddit_id: trade.id,
          ticker: trade.ticker,
          transaction_type: trade.transactionType,
          amount: trade.totalValue >= 1000000 
            ? `$${(trade.totalValue / 1000000).toFixed(1)}M`
            : `$${(trade.totalValue / 1000).toFixed(0)}K`,
          shares: trade.shares,
          price_per_share: trade.pricePerShare,
          trade_date: trade.transactionDate,
          filing_date: trade.filingDate,
          insider_name: trade.insiderName,
          company_name: trade.companyName,
          cik: null,
          reddit_url: null,
          reddit_score: 0,
          posted_at: new Date().toISOString(),
          raw_text: `${trade.insiderName} (${trade.insiderTitle}) ${trade.transactionType === 'BUY' ? 'bought' : 'sold'} ${trade.shares.toLocaleString()} shares of $${trade.ticker} at $${trade.pricePerShare}`,
          verification_status: 'verified',
          verification_message: `From SEC via ${trade.source === 'api_ninjas' ? 'API Ninjas' : 'SEC EDGAR'}`,
          sec_filing_url: trade.secFilingUrl,
          synced_at: new Date().toISOString(),
        });

      if (error) {
        results.errors.push(`${trade.ticker}: ${error.message}`);
      } else {
        results.stored++;
      }
    }

    return NextResponse.json({
      success: true,
      results,
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

