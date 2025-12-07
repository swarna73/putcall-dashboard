// UPDATED API ROUTE: Better sentiment calculation + logging
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

// CRYPTO/FOREX FILTER
const CRYPTO_FOREX_PATTERNS = [
  '-USD', '-JPY', '-EUR', 'USDT', '/USD', '.X', 'IBIT', 'GBTC', 'ETHE',
];

function isActualStock(symbol: string): boolean {
  for (const pattern of CRYPTO_FOREX_PATTERNS) {
    if (symbol.includes(pattern)) return false;
  }
  if (symbol.length === 1) return false;
  if (!/^[A-Z]{1,5}$/.test(symbol)) return false;
  return true;
}

// Fetch StockTwits trending
async function getStockTwitsTrending(): Promise<TrendingStock[]> {
  try {
    const response = await fetch('https://api.stocktwits.com/api/2/trending/symbols.json', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) throw new Error('StockTwits API failed');
    
    const data = await response.json();
    
    console.log('📊 StockTwits sample data:', data.symbols[0]); // DEBUG
    
    return data.symbols
      .filter((stock: any) => isActualStock(stock.symbol))
      .slice(0, 10)
      .map((stock: any) => {
        const score = calculateStockTwitsSentiment(stock);
        console.log(`📈 ${stock.symbol}: score=${score}, watchlist=${stock.watchlist_count}`); // DEBUG
        
        return {
          symbol: stock.symbol,
          name: stock.title,
          sentiment: score > 55 ? 'Bullish' : score < 45 ? 'Bearish' : 'Neutral',
          sentimentScore: score,
          source: 'StockTwits',
          mentions: stock.watchlist_count || 0,
        };
      });
  } catch (error) {
    console.error('❌ StockTwits API failed:', error);
    return [];
  }
}

// Fetch Yahoo Finance trending
async function getYahooTrending(): Promise<TrendingStock[]> {
  try {
    const response = await fetch('https://query1.finance.yahoo.com/v1/finance/trending/US', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) throw new Error('Yahoo API failed');
    
    const data = await response.json();
    
    console.log('📊 Yahoo sample data:', data.finance.result[0].quotes[0]); // DEBUG
    
    return data.finance.result[0].quotes
      .filter((stock: any) => isActualStock(stock.symbol))
      .slice(0, 10)
      .map((stock: any) => {
        const changePercent = stock.regularMarketChangePercent || 0;
        const score = calculateYahooSentiment(changePercent);
        console.log(`📈 ${stock.symbol}: score=${score}, change=${changePercent}%`); // DEBUG
        
        return {
          symbol: stock.symbol,
          name: stock.longName || stock.shortName,
          change: changePercent.toFixed(2) + '%',
          sentiment: changePercent > 0 ? 'Bullish' : changePercent < 0 ? 'Bearish' : 'Neutral',
          sentimentScore: score,
          source: 'Yahoo',
        };
      });
  } catch (error) {
    console.error('❌ Yahoo API failed:', error);
    return [];
  }
}

// IMPROVED: Calculate sentiment for StockTwits
function calculateStockTwitsSentiment(stock: any): number {
  let score = 50;
  
  // Watchlist count indicates interest level
  const watchlistCount = stock.watchlist_count || 0;
  
  if (watchlistCount > 100000) score += 20;
  else if (watchlistCount > 50000) score += 15;
  else if (watchlistCount > 20000) score += 10;
  else if (watchlistCount > 10000) score += 5;
  
  // If we have price change data, use it
  if (stock.change_pct) {
    const change = parseFloat(stock.change_pct);
    if (change > 5) score += 15;
    else if (change > 2) score += 10;
    else if (change < -5) score -= 15;
    else if (change < -2) score -= 10;
  }
  
  return Math.max(0, Math.min(100, score));
}

// IMPROVED: Calculate sentiment for Yahoo
function calculateYahooSentiment(changePercent: number): number {
  let score = 50;
  
  // More weight to larger moves
  if (changePercent > 10) score += 30;
  else if (changePercent > 5) score += 20;
  else if (changePercent > 2) score += 10;
  else if (changePercent > 0) score += 5;
  else if (changePercent < -10) score -= 30;
  else if (changePercent < -5) score -= 20;
  else if (changePercent < -2) score -= 10;
  else if (changePercent < 0) score -= 5;
  
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
    const [stocktwits, yahoo] = await Promise.all([
      getStockTwitsTrending(),
      getYahooTrending(),
    ]);
    
    console.log(`📊 StockTwits: ${stocktwits.length} stocks`);
    console.log(`📊 Yahoo: ${yahoo.length} stocks`);
    
    const data = {
      stocktwits: stocktwits,
      yahoo: yahoo,
      lastUpdated: new Date().toISOString(),
    };
    
    cache.set(cacheKey, { data, timestamp: Date.now() });
    console.log('💾 Trending sources cached');
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Trending sources error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
