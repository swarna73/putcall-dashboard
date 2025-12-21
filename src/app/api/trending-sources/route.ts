import { NextResponse } from 'next/server';

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000;

interface TrendingStock {
  symbol: string;
  name: string;
  sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
  sentimentScore?: number;
  source: 'StockTwits' | 'Yahoo';
  mentions?: number;
  change?: string;
}

const CRYPTO_FOREX_PATTERNS = ['-USD', '-JPY', '-EUR', 'USDT', '/USD', '.X', 'IBIT', 'GBTC', 'ETHE'];

function isActualStock(symbol: string): boolean {
  for (const pattern of CRYPTO_FOREX_PATTERNS) {
    if (symbol.includes(pattern)) return false;
  }
  if (symbol.length === 1) return false;
  if (!/^[A-Z]{1,5}$/.test(symbol)) return false;
  return true;
}

async function getStockTwitsTrending(): Promise<TrendingStock[]> {
  try {
    const response = await fetch('https://api.stocktwits.com/api/2/trending/symbols.json', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) throw new Error('StockTwits API failed');
    const data = await response.json();
    
    // Scores for 10 stocks (descending)
    const scores = [85, 82, 78, 75, 72, 68, 65, 62, 58, 55];
    
    return data.symbols
      .filter((stock: any) => isActualStock(stock.symbol))
      .slice(0, 10)  // Changed from 5 to 10
      .map((stock: any, index: number) => ({
        symbol: stock.symbol,
        name: stock.title || stock.name || stock.symbol,
        sentiment: 'Bullish',
        sentimentScore: scores[index] || 50,
        source: 'StockTwits',
        mentions: stock.watchlist_count || 0,
      }));
  } catch (error) {
    console.error('❌ StockTwits failed:', error);
    return [];
  }
}

async function getYahooTrending(): Promise<TrendingStock[]> {
  try {
    const response = await fetch('https://query1.finance.yahoo.com/v1/finance/trending/US', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) throw new Error('Yahoo API failed');
    const data = await response.json();
    
    // Scores for 10 stocks (descending)
    const scores = [82, 79, 76, 73, 70, 67, 64, 61, 58, 55];
    
    return data.finance.result[0].quotes
      .filter((stock: any) => isActualStock(stock.symbol))
      .slice(0, 10)  // Changed from 5 to 10
      .map((stock: any, index: number) => {
        const changePercent = stock.regularMarketChangePercent || 0;
        
        return {
          symbol: stock.symbol,
          name: stock.longName || stock.shortName || stock.symbol,
          change: changePercent.toFixed(2) + '%',
          sentiment: changePercent > 0 ? 'Bullish' : changePercent < 0 ? 'Bearish' : 'Neutral',
          sentimentScore: scores[index] || 50,
          source: 'Yahoo',
        };
      });
  } catch (error) {
    console.error('❌ Yahoo failed:', error);
    return [];
  }
}

export async function GET() {
  const cacheKey = 'trending-sources';
  
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }
  
  try {
    const [stocktwits, yahoo] = await Promise.all([
      getStockTwitsTrending(),
      getYahooTrending(),
    ]);
    
    console.log('✅ StockTwits:', stocktwits.length, 'stocks');
    console.log('✅ Yahoo:', yahoo.length, 'stocks');
    
    const data = {
      stocktwits,
      yahoo,
      lastUpdated: new Date().toISOString(),
    };
    
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';
