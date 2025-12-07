// UPDATED API ROUTE: Filters out crypto/forex, only returns stocks
// File: /src/app/api/trending-sources/route.ts

import { NextResponse } from 'next/server';

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface TrendingStock {
  symbol: string;
  name: string;
  sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
  sentimentScore?: number;
  source: 'StockTwits' | 'Yahoo';
  mentions?: number;
  change?: string;
}

// CRYPTO/FOREX FILTER - Reject these patterns
const CRYPTO_FOREX_PATTERNS = [
  '-USD', // BTC-USD, ETH-USD, XRP-USD
  '-JPY', // CHF/JPY
  '-EUR',
  'USDT',
  '/USD',
  '.X',    // MOODENG.X, PMV.X, BYTE.X
  'IBIT',  // Bitcoin ETF (still crypto-related)
  'GBTC',
  'ETHE',
];

function isActualStock(symbol: string): boolean {
  // Reject crypto/forex patterns
  for (const pattern of CRYPTO_FOREX_PATTERNS) {
    if (symbol.includes(pattern)) {
      return false;
    }
  }
  
  // Reject single-letter symbols (usually forex)
  if (symbol.length === 1) {
    return false;
  }
  
  // Only accept uppercase letters (US stocks)
  if (!/^[A-Z]{1,5}$/.test(symbol)) {
    return false;
  }
  
  return true;
}

// Fetch StockTwits trending (STOCKS ONLY)
async function getStockTwitsTrending(): Promise<TrendingStock[]> {
  try {
    const response = await fetch('https://api.stocktwits.com/api/2/trending/symbols.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) throw new Error('StockTwits API failed');
    
    const data = await response.json();
    
    return data.symbols
      .filter((stock: any) => isActualStock(stock.symbol)) // ← FILTER CRYPTO/FOREX
      .slice(0, 10)
      .map((stock: any) => ({
        symbol: stock.symbol,
        name: stock.title,
        sentiment: stock.watchlist_count > 10000 ? 'Bullish' : 'Neutral',
        sentimentScore: calculateSentiment(stock),
        source: 'StockTwits',
        mentions: stock.watchlist_count || 0,
      }));
  } catch (error) {
    console.error('❌ StockTwits API failed:', error);
    return [];
  }
}

// Fetch Yahoo Finance trending (STOCKS ONLY)
async function getYahooTrending(): Promise<TrendingStock[]> {
  try {
    const response = await fetch('https://query1.finance.yahoo.com/v1/finance/trending/US', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) throw new Error('Yahoo API failed');
    
    const data = await response.json();
    
    return data.finance.result[0].quotes
      .filter((stock: any) => isActualStock(stock.symbol)) // ← FILTER CRYPTO/FOREX
      .slice(0, 10)
      .map((stock: any) => ({
        symbol: stock.symbol,
        name: stock.longName || stock.shortName,
        change: stock.regularMarketChangePercent?.toFixed(2) + '%' || '0%',
        sentiment: stock.regularMarketChangePercent > 0 ? 'Bullish' : 
                   stock.regularMarketChangePercent < 0 ? 'Bearish' : 'Neutral',
        sentimentScore: calculateYahooSentiment(stock),
        source: 'Yahoo',
      }));
  } catch (error) {
    console.error('❌ Yahoo API failed:', error);
    return [];
  }
}

// Calculate sentiment score for StockTwits
function calculateSentiment(stock: any): number {
  let score = 50; // Start neutral
  
  // More watchers = more interest
  if (stock.watchlist_count > 10000) score += 10;
  if (stock.watchlist_count > 50000) score += 10;
  
  // Positive price change
  const change = parseFloat(stock.change_pct || 0);
  if (change > 5) score += 15;
  if (change > 10) score += 15;
  
  // Negative price change
  if (change < -5) score -= 15;
  if (change < -10) score -= 15;
  
  return Math.max(0, Math.min(100, score));
}

// Calculate sentiment score for Yahoo
function calculateYahooSentiment(stock: any): number {
  const change = stock.regularMarketChangePercent || 0;
  
  let score = 50;
  if (change > 5) score += 20;
  else if (change > 2) score += 10;
  else if (change < -5) score -= 20;
  else if (change < -2) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

export async function GET() {
  console.log('🔄 Trending Sources API called');
  
  const cacheKey = 'trending-sources';
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('✅ Serving from cache');
    return NextResponse.json(cached.data);
  }
  
  try {
    // Fetch from both sources in parallel
    const [stocktwits, yahoo] = await Promise.all([
      getStockTwitsTrending(),
      getYahooTrending(),
    ]);
    
    console.log(`📊 StockTwits: ${stocktwits.length} stocks (crypto filtered)`);
    console.log(`📊 Yahoo: ${yahoo.length} stocks (crypto filtered)`);
    
    const data = {
      stocktwits: stocktwits,
      yahoo: yahoo,
      lastUpdated: new Date().toISOString(),
    };
    
    // Cache the result
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
    
    console.log('💾 Trending sources cached');
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Trending sources error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
