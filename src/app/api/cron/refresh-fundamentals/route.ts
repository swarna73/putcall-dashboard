// app/api/cron/refresh-fundamentals/route.ts
// Pre-computes and caches fundamental data for the value screener
// This runs on a schedule to ensure the dashboard loads instantly

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// app/api/cron/refresh-fundamentals/route.ts
// Simplified: Just calls the dashboard API to warm the cache
// The dashboard API fetches from Yahoo Finance and saves to Supabase

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
          console.error('Unauthorized fundamentals refresh request');
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    const startTime = Date.now();
    console.log('Starting fundamentals cache refresh via dashboard API...');
  
    try {
          const baseUrl = process.env.VERCEL_URL
                  ? `https://${process.env.VERCEL_URL}`
                  : process.env.NEXT_PUBLIC_BASE_URL || 'https://putcall.nl';
      
          // Call the dashboard API - this will fetch from Yahoo Finance
          // and save fundamentals to Supabase cache
          const response = await fetch(`${baseUrl}/api/dashboard`, {
                  method: 'GET',
                  headers: {
                            'User-Agent': 'Vercel-Cron-Bot',
                            'Cache-Control': 'no-cache',
                  },
          });
      
          if (!response.ok) {
                  throw new Error(`Dashboard API returned ${response.status}`);
          }
      
          const data = await response.json();
          const totalTime = Date.now() - startTime;
      
          console.log(`Fundamentals cache refreshed in ${totalTime}ms`);
      
          return NextResponse.json({
                  success: true,
                  message: 'Fundamentals cache refreshed via dashboard',
                  valuePicks: data.valuePicks?.picks?.length || 0,
                  fromCache: data.fromCache,
                  timestamp: new Date().toISOString(),
                  duration: `${totalTime}ms`
          });
      
    } catch (error: any) {
          console.error('Fundamentals refresh failed:', error);
          return NextResponse.json({
                  success: false,
                  error: error.message,
                  timestamp: new Date().toISOString(),
          }, { status: 500 });
    }
}export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Stock universe (same as dashboard/route.ts)
const STOCK_UNIVERSE: Array<{ symbol: string; name: string; sector: string }> = [
  // Telecommunications
  { symbol: 'VZ', name: 'Verizon', sector: 'Telecommunications' },
  { symbol: 'T', name: 'AT&T', sector: 'Telecommunications' },
  { symbol: 'TMUS', name: 'T-Mobile', sector: 'Telecommunications' },

  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'PFE', name: 'Pfizer', sector: 'Healthcare' },
  { symbol: 'MRK', name: 'Merck', sector: 'Healthcare' },
  { symbol: 'ABBV', name: 'AbbVie', sector: 'Healthcare' },
  { symbol: 'BMY', name: 'Bristol-Myers Squibb', sector: 'Healthcare' },
  { symbol: 'AMGN', name: 'Amgen', sector: 'Healthcare' },
  { symbol: 'GILD', name: 'Gilead Sciences', sector: 'Healthcare' },

  // Energy
  { symbol: 'CVX', name: 'Chevron', sector: 'Energy' },
  { symbol: 'XOM', name: 'Exxon Mobil', sector: 'Energy' },
  { symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy' },
  { symbol: 'EOG', name: 'EOG Resources', sector: 'Energy' },
  { symbol: 'SLB', name: 'Schlumberger', sector: 'Energy' },

  // Consumer Staples
  { symbol: 'KO', name: 'Coca-Cola', sector: 'Consumer Staples' },
  { symbol: 'PEP', name: 'PepsiCo', sector: 'Consumer Staples' },
  { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer Staples' },
  { symbol: 'CL', name: 'Colgate-Palmolive', sector: 'Consumer Staples' },
  { symbol: 'KMB', name: 'Kimberly-Clark', sector: 'Consumer Staples' },
  { symbol: 'GIS', name: 'General Mills', sector: 'Consumer Staples' },
  { symbol: 'MO', name: 'Altria', sector: 'Consumer Staples' },
  { symbol: 'PM', name: 'Philip Morris', sector: 'Consumer Staples' },

  // Technology
  { symbol: 'IBM', name: 'IBM', sector: 'Technology' },
  { symbol: 'CSCO', name: 'Cisco', sector: 'Technology' },
  { symbol: 'TXN', name: 'Texas Instruments', sector: 'Technology' },
  { symbol: 'INTC', name: 'Intel', sector: 'Technology' },
  { symbol: 'HPQ', name: 'HP Inc', sector: 'Technology' },

  // Financials
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financials' },
  { symbol: 'BAC', name: 'Bank of America', sector: 'Financials' },
  { symbol: 'WFC', name: 'Wells Fargo', sector: 'Financials' },
  { symbol: 'USB', name: 'U.S. Bancorp', sector: 'Financials' },
  { symbol: 'PNC', name: 'PNC Financial', sector: 'Financials' },
  { symbol: 'C', name: 'Citigroup', sector: 'Financials' },

  // Utilities
  { symbol: 'DUK', name: 'Duke Energy', sector: 'Utilities' },
  { symbol: 'SO', name: 'Southern Company', sector: 'Utilities' },
  { symbol: 'D', name: 'Dominion Energy', sector: 'Utilities' },
  { symbol: 'AEP', name: 'American Electric Power', sector: 'Utilities' },
  { symbol: 'XEL', name: 'Xcel Energy', sector: 'Utilities' },

  // Industrials
  { symbol: 'MMM', name: '3M', sector: 'Industrials' },
  { symbol: 'CAT', name: 'Caterpillar', sector: 'Industrials' },
  { symbol: 'HON', name: 'Honeywell', sector: 'Industrials' },
  { symbol: 'UPS', name: 'UPS', sector: 'Industrials' },
  { symbol: 'LMT', name: 'Lockheed Martin', sector: 'Industrials' },

  // Real Estate
  { symbol: 'O', name: 'Realty Income', sector: 'Real Estate' },
  { symbol: 'SPG', name: 'Simon Property', sector: 'Real Estate' },
  { symbol: 'VTR', name: 'Ventas', sector: 'Real Estate' },
];

function calculateValueScore(pe: number | null, divYield: number | null, marketCap: number | null): number {
  let score = 50;
  if (pe !== null && pe > 0) {
    if (pe < 10) score += 30;
    else if (pe < 15) score += 20;
    else if (pe < 20) score += 10;
    else if (pe > 30) score -= 10;
  }
  if (divYield !== null) {
    if (divYield > 5) score += 25;
    else if (divYield > 4) score += 20;
    else if (divYield > 3) score += 15;
    else if (divYield > 2) score += 10;
  }
  if (marketCap !== null && marketCap > 100e9) score += 5;
  return Math.min(100, Math.max(0, score));
}

async function fetchAllQuotes(): Promise<any[]> {
  const allSymbols = STOCK_UNIVERSE.map(s => s.symbol);
  const batchSize = 15;
  const allQuotes: any[] = [];

  for (let i = 0; i < allSymbols.length; i += batchSize) {
    const batch = allSymbols.slice(i, i + batchSize);
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${batch.join(',')}`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0' },
          signal: AbortSignal.timeout(10000),
          cache: 'no-store'
        }
      );
      if (response.ok) {
        const data = await response.json();
        allQuotes.push(...(data.quoteResponse?.result || []));
      }
    } catch (e: any) {
      console.warn(`⚠️ Batch failed: ${batch.join(',')}: ${e.message}`);
    }
    // Small delay between batches
    if (i + batchSize < allSymbols.length) {
      await new Promise(r => setTimeout(r, 50));
    }
  }

  return allQuotes;
}

export async function GET(request: Request) {
  // Verify authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('❌ Unauthorized fundamentals refresh request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  console.log('🔄 Starting fundamentals cache refresh...');

  try {
    // Fetch all stock quotes from Yahoo Finance
    const allQuotes = await fetchAllQuotes();

    if (allQuotes.length === 0) {
      throw new Error('Failed to fetch any stock quotes');
    }

    console.log(`📊 Fetched ${allQuotes.length}/${STOCK_UNIVERSE.length} stock quotes`);

    // Transform quotes into cache format
    const dataToCache = allQuotes.map(q => {
      const universe = STOCK_UNIVERSE.find(s => s.symbol === q.symbol);
      const pe = q.trailingPE || q.forwardPE || null;
      const divYield = q.dividendYield ? q.dividendYield * 100 : null;
      const marketCap = q.marketCap || null;

      return {
        symbol: q.symbol,
        name: q.shortName || universe?.name || q.symbol,
        sector: universe?.sector || 'Unknown',
        price: q.regularMarketPrice,
        pe_ratio: pe,
        dividend_yield: divYield,
        market_cap: marketCap,
        change_percent: q.regularMarketChangePercent,
        value_score: calculateValueScore(pe, divYield, marketCap),
        updated_at: new Date().toISOString()
      };
    });

    // Upsert to Supabase
    const { error: upsertError } = await supabase
      .from('fundamentals_cache')
      .upsert(dataToCache, {
        onConflict: 'symbol',
        ignoreDuplicates: false
      });

    if (upsertError) {
      throw new Error(`Supabase upsert failed: ${upsertError.message}`);
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ Fundamentals cache refreshed in ${totalTime}ms`);

    return NextResponse.json({
      success: true,
      message: 'Fundamentals cache refreshed',
      stocksCached: dataToCache.length,
      timestamp: new Date().toISOString(),
      duration: `${totalTime}ms`
    });

  } catch (error: any) {
    console.error('❌ Fundamentals refresh failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

