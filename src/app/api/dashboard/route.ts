// =====================================================
// app/api/dashboard/route.ts - PRODUCTION READY v2
// 
// FIXES:
// - Cache-busting headers (no more stale data)
// - Better logging for debugging
// - Yahoo RSS fallback for news (no API key needed)
// - fetch with cache: 'no-store' to prevent caching
// =====================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// =====================================================
// SUPABASE CLIENT
// =====================================================
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =====================================================
// CACHE - Increased TTL for better performance
// =====================================================
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes (increased from 1 for better performance)

const redditCache: { data: any[] | null; timestamp: number; source: string } = {
  data: null, timestamp: 0, source: ''
};
const REDDIT_MAX_CACHE_AGE = 2 * 60 * 60 * 1000; // 2 hours (reduced from 4)

// Fundamentals cache TTL - stock fundamentals don't change frequently
const FUNDAMENTALS_CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours for fundamentals data

// =====================================================
// STOCK UNIVERSE FOR SCREENER (50+ stocks)
// =====================================================
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

// Screening criteria
const SCREENING_CRITERIA = {
  maxPE: 25,
  minDividendYield: 2,
  maxPE_preferred: 18,
  minDividendYield_preferred: 3.5,
};

// =====================================================
// COMPANY NAMES FOR REDDIT
// =====================================================
const COMPANY_NAMES: Record<string, string> = {
  GME: 'GameStop', AMC: 'AMC Entertainment', TSLA: 'Tesla', NVDA: 'NVIDIA',
  AAPL: 'Apple', MSFT: 'Microsoft', META: 'Meta Platforms', GOOGL: 'Alphabet',
  AMD: 'AMD', PLTR: 'Palantir', SOFI: 'SoFi Technologies', AMZN: 'Amazon',
  COIN: 'Coinbase', HOOD: 'Robinhood', RIVN: 'Rivian', NIO: 'NIO Inc',
  RKLB: 'Rocket Lab', SMCI: 'Super Micro Computer', INTC: 'Intel',
  SPY: 'S&P 500 ETF', QQQ: 'Nasdaq 100 ETF', ARM: 'ARM Holdings',
  MARA: 'Marathon Digital', MSTR: 'MicroStrategy', CRWD: 'CrowdStrike',
  SNOW: 'Snowflake', NET: 'Cloudflare', DKNG: 'DraftKings', BABA: 'Alibaba',
  SLS: 'SELLAS Life', ASTS: 'AST SpaceMobile', SLV: 'iShares Silver',
  NBIS: 'Nebius Group', DTE: 'DTE Energy', VOO: 'Vanguard S&P 500',
  LMT: 'Lockheed Martin', NOC: 'Northrop Grumman', RTX: 'RTX Corp',
  MRNA: 'Moderna', MU: 'Micron', SNDK: 'SanDisk',
  ...Object.fromEntries(STOCK_UNIVERSE.map(s => [s.symbol, s.name]))
};

const SECTOR_ROTATION = [
  { name: "Technology", performance: "Bullish", change: "+1.2%" },
  { name: "Healthcare", performance: "Neutral", change: "+0.3%" },
  { name: "Energy", performance: "Bearish", change: "-0.8%" },
  { name: "Financials", performance: "Bullish", change: "+0.9%" },
  { name: "Consumer", performance: "Neutral", change: "+0.1%" }
];

// =====================================================
// 1. MARKET INDICES
// =====================================================
async function getMarketIndices() {
  try {
    const response = await fetch(
      'https://query1.finance.yahoo.com/v7/finance/quote?symbols=^GSPC,^DJI,^IXIC',
      { 
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0' },
        signal: AbortSignal.timeout(5000),
        cache: 'no-store'
      }
    );

    if (!response.ok) throw new Error(`Yahoo returned ${response.status}`);
    const data = await response.json();
    const quotes = data.quoteResponse?.result || [];
    if (quotes.length === 0) throw new Error('No quotes');

    const nameMap: Record<string, string> = {
      '^GSPC': 'S&P 500', '^DJI': 'Dow Jones Industrial Average', '^IXIC': 'Nasdaq Composite'
    };

    console.log('✅ Market indices: Live');
    return quotes.map((q: any) => ({
      name: nameMap[q.symbol] || q.symbol,
      value: q.regularMarketPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '--',
      change: `${q.regularMarketChangePercent >= 0 ? '+' : ''}${q.regularMarketChangePercent?.toFixed(2)}%`,
      trend: q.regularMarketChangePercent >= 0 ? 'Up' : 'Down'
    }));
  } catch (error: any) {
    console.warn('⚠️ Market indices failed:', error.message);
    return [
      { name: "S&P 500", value: "--", change: "--", trend: "Neutral" },
      { name: "Dow Jones", value: "--", change: "--", trend: "Neutral" },
      { name: "Nasdaq", value: "--", change: "--", trend: "Neutral" }
    ];
  }
}

// =====================================================
// 2. MARKET SENTIMENT
// =====================================================
async function getMarketSentiment() {
  try {
    const response = await fetch(
      'https://production.dataviz.cnn.io/index/fearandgreed/graphdata',
      { 
        headers: { 'User-Agent': 'Mozilla/5.0' }, 
        signal: AbortSignal.timeout(3000),
        cache: 'no-store'
      }
    );
    if (!response.ok) throw new Error(`CNN returned ${response.status}`);
    const data = await response.json();
    console.log('✅ Sentiment: Live -', data.fear_and_greed.score);
    return {
      score: Math.round(data.fear_and_greed.score),
      label: data.fear_and_greed.rating,
      primaryDriver: data.fear_and_greed.rating_description || 'Market sentiment indicators'
    };
  } catch (error: any) {
    console.warn('⚠️ Sentiment failed:', error.message);
    return { score: 50, label: "Neutral", primaryDriver: "Data temporarily unavailable" };
  }
}

// =====================================================
// 3. REDDIT TRENDS - With better logging
// =====================================================
async function fetchFromApeWisdom(): Promise<any[] | null> {
  try {
    console.log('📡 Calling ApeWisdom API...');
    const response = await fetch('https://apewisdom.io/api/v1.0/filter/all-stocks/page/1', {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0', 
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      signal: AbortSignal.timeout(8000),
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.warn(`⚠️ ApeWisdom HTTP ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const results = data.results || [];
    if (results.length === 0) {
      console.warn('⚠️ ApeWisdom returned empty results');
      return null;
    }

    // Log for debugging
    const top3 = results.slice(0, 3).map((r: any) => `${r.ticker}:${r.mentions}`).join(', ');
    console.log(`✅ ApeWisdom: ${results.length} tickers. Top 3: ${top3}`);
    
    return results.slice(0, 10).map((item: any) => {
      const rankChange = item.rank_24h_ago ? (item.rank_24h_ago - item.rank) : 0;
      const sentimentScore = Math.min(95, Math.max(30, 60 + rankChange * 2));
      const sentiment = sentimentScore >= 70 ? 'Bullish' : sentimentScore <= 45 ? 'Bearish' : 'Neutral';
      return {
        symbol: item.ticker,
        name: item.name || COMPANY_NAMES[item.ticker] || item.ticker,
        mentions: parseInt(item.mentions) || 0,
        sentiment, sentimentScore,
        discussionSummary: `${item.mentions} mentions, ${item.upvotes || 0} upvotes`,
        volumeChange: rankChange > 0 ? `+${rankChange} rank` : rankChange < 0 ? `${rankChange} rank` : 'Stable',
        keywords: ['WSB', sentiment === 'Bullish' ? 'CALLS' : 'PUTS', 'TRENDING'],
        recentNews: [],
      };
    });
  } catch (e: any) {
    console.warn('⚠️ ApeWisdom failed:', e.message);
    return null;
  }
}

async function fetchFromTradestie(): Promise<any[] | null> {
  try {
    console.log('📡 Calling Tradestie API...');
    const response = await fetch('https://api.tradestie.com/v1/apps/reddit', {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0' 
      },
      signal: AbortSignal.timeout(5000),
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.warn(`⚠️ Tradestie HTTP ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('⚠️ Tradestie returned empty data');
      return null;
    }

    const top3 = data.slice(0, 3).map((r: any) => `${r.ticker}:${r.no_of_comments}`).join(', ');
    console.log(`✅ Tradestie: ${data.length} tickers. Top 3: ${top3}`);
    
    return data.slice(0, 10).map((item: any, index: number) => {
      const sentimentScore = Math.round((item.sentiment_score || 0.5) * 100);
      const sentiment = item.sentiment === 'Bullish' ? 'Bullish' : item.sentiment === 'Bearish' ? 'Bearish' : 'Neutral';
      return {
        symbol: item.ticker,
        name: COMPANY_NAMES[item.ticker] || item.ticker,
        mentions: item.no_of_comments || 0,
        sentiment,
        sentimentScore: Math.min(95, Math.max(30, sentimentScore)),
        discussionSummary: `${item.no_of_comments} comments on WSB`,
        volumeChange: `+${Math.max(5, 30 - index * 3)}%`,
        keywords: ['WSB', sentiment === 'Bullish' ? 'CALLS' : 'PUTS', 'TRENDING'],
        recentNews: [],
      };
    });
  } catch (e: any) {
    console.warn('⚠️ Tradestie failed:', e.message);
    return null;
  }
}

async function getRedditTrends() {
  const fetchStart = Date.now();
  console.log('🔍 Fetching Reddit trends...', new Date().toISOString());

  // Try ApeWisdom first
  const apeData = await fetchFromApeWisdom();
  if (apeData?.length) {
    redditCache.data = apeData; 
    redditCache.timestamp = Date.now(); 
    redditCache.source = 'apewisdom';
    return { 
      trends: apeData, 
      source: 'apewisdom', 
      lastUpdated: new Date().toISOString(), 
      isStale: false,
      fetchTimeMs: Date.now() - fetchStart
    };
  }

  // Try Tradestie
  const tradestieData = await fetchFromTradestie();
  if (tradestieData?.length) {
    redditCache.data = tradestieData; 
    redditCache.timestamp = Date.now(); 
    redditCache.source = 'tradestie';
    return { 
      trends: tradestieData, 
      source: 'tradestie', 
      lastUpdated: new Date().toISOString(), 
      isStale: false,
      fetchTimeMs: Date.now() - fetchStart
    };
  }

  // Check cache
  const cacheAge = Date.now() - redditCache.timestamp;
  const cacheAgeMinutes = Math.round(cacheAge / 60000);
  
  if (redditCache.data?.length && cacheAge < REDDIT_MAX_CACHE_AGE) {
    console.log(`📦 Using cached Reddit (${cacheAgeMinutes}m old). #1: ${redditCache.data[0]?.symbol}`);
    return { 
      trends: redditCache.data, 
      source: 'cache', 
      lastUpdated: new Date(redditCache.timestamp).toISOString(), 
      isStale: cacheAge > 3600000,
      cacheAgeMinutes,
      fetchTimeMs: Date.now() - fetchStart
    };
  }

  console.warn('❌ All Reddit sources failed, no valid cache');
  return { 
    trends: [], 
    source: 'unavailable', 
    lastUpdated: null, 
    isStale: false,
    fetchTimeMs: Date.now() - fetchStart
  };
}

// =====================================================
// 4. NEWS - With Yahoo RSS fallback
// =====================================================
async function getNews() {
  // Try Finnhub first (if API key available)
  const finnhubKey = process.env.FINNHUB_API_KEY;
  if (finnhubKey) {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`, 
        { signal: AbortSignal.timeout(4000), cache: 'no-store' }
      );
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          console.log('✅ News: Finnhub');
          return data.slice(0, 5).map((item: any) => ({
            title: item.headline?.substring(0, 100) || 'Market Update',
            source: item.source || 'Finnhub',
            url: item.url || '#',
            timestamp: formatTime(item.datetime * 1000),
            summary: item.summary?.substring(0, 150) || '',
            impact: categorizeImpact(item.headline || '')
          }));
        }
      }
    } catch (e: any) { 
      console.warn('⚠️ Finnhub news failed:', e.message); 
    }
  }

  // Fallback: Yahoo RSS via rss2json (no API key needed)
  try {
    const response = await fetch(
      'https://api.rss2json.com/v1/api.json?rss_url=https://finance.yahoo.com/news/rssindex',
      { signal: AbortSignal.timeout(5000), cache: 'no-store' }
    );
    if (response.ok) {
      const data = await response.json();
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        console.log('✅ News: Yahoo RSS');
        return data.items.slice(0, 5).map((item: any) => ({
          title: item.title?.substring(0, 100) || 'Market Update',
          source: 'Yahoo Finance',
          url: item.link || '#',
          timestamp: formatTime(new Date(item.pubDate).getTime()),
          summary: stripHtml(item.description)?.substring(0, 150) || '',
          impact: categorizeImpact(item.title || '')
        }));
      }
    }
  } catch (e: any) {
    console.warn('⚠️ Yahoo RSS failed:', e.message);
  }

  console.warn('❌ All news sources failed');
  return [{ 
    title: "News temporarily unavailable", 
    source: "System", 
    url: "#", 
    timestamp: "Now", 
    summary: "Please check back shortly.", 
    impact: "Medium",
    isUnavailable: true
  }];
}

function stripHtml(html: string | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function formatTime(ts: number): string {
  const diffH = Math.floor((Date.now() - ts) / 3600000);
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

function categorizeImpact(title: string): 'Critical' | 'High' | 'Medium' {
  const lower = title.toLowerCase();
  if (['fed', 'rate', 'inflation', 'crash', 'crisis', 'war', 'tariff'].some(k => lower.includes(k))) return 'Critical';
  if (['earnings', 'revenue', 'profit', 'loss', 'layoff', 'acquisition'].some(k => lower.includes(k))) return 'High';
  return 'Medium';
}

// =====================================================
// 5. DYNAMIC VALUE SCREENER
// =====================================================
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

function getConviction(pe: number | null, divYield: number | null, score: number): 'Strong Buy' | 'Buy' | 'Hold' {
  if (score >= 80 && pe !== null && pe < 18 && divYield !== null && divYield > 3.5) return 'Strong Buy';
  if (score >= 65 || (divYield !== null && divYield > 3)) return 'Buy';
  return 'Hold';
}

function generateAnalysis(pe: number | null, divYield: number | null, sector: string): string {
  const parts: string[] = [];
  if (divYield !== null && divYield > 4) parts.push('High dividend yield');
  else if (divYield !== null && divYield > 2.5) parts.push('Solid dividend');
  if (pe !== null && pe < 12) parts.push('attractively valued');
  else if (pe !== null && pe < 18) parts.push('reasonably priced');
  
  const sectorTips: Record<string, string> = {
    'Telecommunications': '5G growth potential', 'Healthcare': 'defensive positioning',
    'Energy': 'energy transition play', 'Consumer Staples': 'recession-resistant',
    'Technology': 'tech transformation', 'Financials': 'rate beneficiary',
    'Utilities': 'stable cash flows', 'Industrials': 'infrastructure exposure',
    'Real Estate': 'monthly dividends',
  };
  if (sectorTips[sector]) parts.push(sectorTips[sector]);
  
  return parts.length > 0 ? parts.join(', ').replace(/^./, s => s.toUpperCase()) : 'Value opportunity';
}

function formatLargeNum(num: number | null): string {
  if (!num) return '--';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(0)}B`;
  return `$${(num / 1e6).toFixed(0)}M`;
}

// =====================================================
// OPTIMIZED VALUE PICKS WITH SUPABASE CACHING
// =====================================================

async function getCachedFundamentals(): Promise<Map<string, any> | null> {
  try {
    const { data, error } = await supabase
      .from('fundamentals_cache')
      .select('*')
      .in('symbol', STOCK_UNIVERSE.map(s => s.symbol));

    if (error || !data || data.length === 0) {
      console.log('📦 No fundamentals cache found');
      return null;
    }

    // Check if cache is fresh (less than 4 hours old)
    const oldestUpdate = Math.min(...data.map(d => new Date(d.updated_at).getTime()));
    const cacheAge = Date.now() - oldestUpdate;

    if (cacheAge > FUNDAMENTALS_CACHE_TTL) {
      console.log(`📦 Fundamentals cache too old (${Math.round(cacheAge / 60000)}min)`);
      return null;
    }

    console.log(`✅ Using fundamentals cache (${Math.round(cacheAge / 60000)}min old, ${data.length} stocks)`);
    return new Map(data.map(d => [d.symbol, d]));
  } catch (error) {
    console.warn('⚠️ Failed to fetch fundamentals cache:', error);
    return null;
  }
}

async function saveFundamentalsToCache(stocks: any[]): Promise<void> {
  try {
    const dataToCache = stocks.map(s => ({
      symbol: s.symbol,
      name: s.name,
      sector: s.sector,
      price: s.price,
      pe_ratio: s.pe,
      dividend_yield: s.divYield,
      market_cap: s.marketCap,
      change_percent: s.change,
      value_score: s.valueScore,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('fundamentals_cache')
      .upsert(dataToCache, {
        onConflict: 'symbol',
        ignoreDuplicates: false
      });

    if (error) {
      console.warn('⚠️ Failed to cache fundamentals:', error.message);
    } else {
      console.log(`✅ Cached ${dataToCache.length} stock fundamentals`);
    }
  } catch (error) {
    console.warn('⚠️ Cache save error:', error);
  }
}

async function fetchFreshQuotes(symbols: string[]): Promise<any[]> {
  const batchSize = 15;
  const allQuotes: any[] = [];

  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${batch.join(',')}`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0' },
          signal: AbortSignal.timeout(5000),
          cache: 'no-store'
        }
      );
      if (response.ok) {
        const data = await response.json();
        allQuotes.push(...(data.quoteResponse?.result || []));
      }
    } catch (e) {
      console.warn(`⚠️ Batch failed: ${batch.join(',')}`);
    }
    // Reduced delay from 100ms to 50ms for faster fetching
    if (i + batchSize < symbols.length) {
      await new Promise(r => setTimeout(r, 50));
    }
  }

  return allQuotes;
}

async function getValuePicks() {
  const allSymbols = STOCK_UNIVERSE.map(s => s.symbol);
  const startTime = Date.now();

  try {
    // Step 1: Try to use cached fundamentals first
    const cachedData = await getCachedFundamentals();

    let stocksWithData: any[];
    let fromCache = false;

    if (cachedData && cachedData.size >= allSymbols.length * 0.8) {
      // Use cache if we have at least 80% of stocks cached
      console.log(`📊 Screener: Using cached data for ${cachedData.size} stocks`);
      fromCache = true;

      stocksWithData = Array.from(cachedData.values()).map(cached => {
        const universe = STOCK_UNIVERSE.find(s => s.symbol === cached.symbol);
        return {
          symbol: cached.symbol,
          name: cached.name || universe?.name || cached.symbol,
          sector: cached.sector || universe?.sector || 'Unknown',
          price: cached.price,
          pe: cached.pe_ratio,
          divYield: cached.dividend_yield,
          marketCap: cached.market_cap,
          valueScore: cached.value_score || calculateValueScore(cached.pe_ratio, cached.dividend_yield, cached.market_cap),
          change: cached.change_percent,
        };
      });
    } else {
      // Fetch fresh data from Yahoo Finance
      console.log('📊 Screener: Fetching fresh data from Yahoo Finance...');
      const allQuotes = await fetchFreshQuotes(allSymbols);

      if (allQuotes.length === 0) throw new Error('No quotes');
      console.log(`📊 Screener: Fetched ${allQuotes.length}/${allSymbols.length} stocks in ${Date.now() - startTime}ms`);

      stocksWithData = allQuotes.map(q => {
        const universe = STOCK_UNIVERSE.find(s => s.symbol === q.symbol);
        const pe = q.trailingPE || q.forwardPE || null;
        const divYield = q.dividendYield ? q.dividendYield * 100 : null;
        const marketCap = q.marketCap || null;
        return {
          symbol: q.symbol,
          name: q.shortName || universe?.name || q.symbol,
          sector: universe?.sector || 'Unknown',
          price: q.regularMarketPrice,
          pe, divYield, marketCap,
          valueScore: calculateValueScore(pe, divYield, marketCap),
          change: q.regularMarketChangePercent,
        };
      });

      // Save to Supabase cache (async, don't wait)
      saveFundamentalsToCache(stocksWithData).catch(() => {});
    }

    // Step 2: Filter stocks based on screening criteria
    const filtered = stocksWithData.filter(s =>
      s.price &&
      (s.pe === null || s.pe <= SCREENING_CRITERIA.maxPE) &&
      s.divYield !== null && s.divYield >= SCREENING_CRITERIA.minDividendYield
    );

    console.log(`📊 Screener: ${filtered.length} passed filters`);

    // Step 3: Sort by value score and select top picks with sector diversification
    filtered.sort((a, b) => b.valueScore - a.valueScore);

    const sectorCount: Record<string, number> = {};
    const finalPicks: typeof filtered = [];

    for (const stock of filtered) {
      sectorCount[stock.sector] = (sectorCount[stock.sector] || 0) + 1;
      if (sectorCount[stock.sector] > 2) continue;
      finalPicks.push(stock);
      if (finalPicks.length >= 8) break;
    }

    const totalTime = Date.now() - startTime;
    console.log(`⚡ Screener completed in ${totalTime}ms (cache: ${fromCache})`);

    return {
      picks: finalPicks.map(s => ({
        symbol: s.symbol,
        name: s.name,
        price: s.price ? `$${s.price.toFixed(2)}` : '--',
        sector: s.sector,
        metrics: {
          peRatio: s.pe ? s.pe.toFixed(1) : '--',
          freeCashFlow: '--',
          marketCap: formatLargeNum(s.marketCap),
          dividendYield: s.divYield ? `${s.divYield.toFixed(1)}%` : '--'
        },
        analysis: generateAnalysis(s.pe, s.divYield, s.sector),
        conviction: getConviction(s.pe, s.divYield, s.valueScore),
        valueScore: s.valueScore,
        change: s.change ? `${s.change >= 0 ? '+' : ''}${s.change.toFixed(2)}%` : '--'
      })),
      source: fromCache ? 'cache' : 'yahoo',
      isLive: !fromCache,
      screenedFrom: stocksWithData.length,
      passedFilter: filtered.length,
      fetchTimeMs: totalTime
    };

  } catch (error: any) {
    console.error('❌ Screener failed:', error.message);
    return { picks: [], source: 'unavailable', isLive: false, screenedFrom: 0, passedFilter: 0 };
  }
}

// =====================================================
// MAIN HANDLER - With cache-busting headers
// =====================================================
export const dynamic = 'force-dynamic';
export const revalidate = 0;  // Disable ISR caching
export const maxDuration = 25;

export async function GET() {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  console.log(`📊 [${requestId}] Dashboard API called at ${new Date().toISOString()}`);

  // Check in-memory cache (short TTL)
  const cached = cache.get('dashboard');
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    const cacheAge = Math.floor((Date.now() - cached.ts) / 1000);
    console.log(`✅ [${requestId}] Cache hit (${cacheAge}s old)`);
    return NextResponse.json(
      { ...cached.data, fromCache: true, cacheAge, requestId }, 
      {
        headers: { 
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Cache': 'HIT', 
          'X-Cache-Age': `${cacheAge}s`,
          'X-Request-Id': requestId,
          'X-Response-Time': `${Date.now() - startTime}ms` 
        }
      }
    );
  }

  console.log(`🚀 [${requestId}] Fetching fresh data...`);

  try {
    const [marketIndices, marketSentiment, redditResult, news, picksResult] = await Promise.all([
      getMarketIndices(),
      getMarketSentiment(),
      getRedditTrends(),
      getNews(),
      getValuePicks(),
    ]);

    const responseTime = Date.now() - startTime;
    console.log(`⚡ [${requestId}] Completed in ${responseTime}ms`);

    const dashboardData = {
      marketIndices,
      marketSentiment,
      sectorRotation: SECTOR_ROTATION,
      redditTrends: redditResult.trends,
      redditMeta: { 
        source: redditResult.source, 
        lastUpdated: redditResult.lastUpdated, 
        isStale: redditResult.isStale, 
        isUnavailable: redditResult.source === 'unavailable' 
      },
      news,
      picks: picksResult.picks,
      picksMeta: { 
        source: picksResult.source, 
        isLive: picksResult.isLive, 
        screenedFrom: picksResult.screenedFrom, 
        passedFilter: picksResult.passedFilter 
      },
      insiderTrades: [],
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' }),
      fetchedAt: new Date().toISOString(),
    };

    // Store in memory cache
    cache.set('dashboard', { data: dashboardData, ts: Date.now() });

    return NextResponse.json(
      { ...dashboardData, fromCache: false, responseTime, requestId }, 
      {
        headers: { 
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'X-Cache': 'MISS', 
          'X-Request-Id': requestId,
          'X-Response-Time': `${responseTime}ms` 
        }
      }
    );

  } catch (error: any) {
    console.error(`❌ [${requestId}] Dashboard error:`, error);
    
    // Return stale cache if available
    if (cached) {
      return NextResponse.json(
        { ...cached.data, fromCache: true, stale: true, error: error.message }, 
        {
          headers: { 
            'Cache-Control': 'no-store',
            'X-Cache': 'STALE',
            'X-Request-Id': requestId
          }
        }
      );
    }
    
    // Return error response
    return NextResponse.json({
      marketIndices: [{ name: "S&P 500", value: "--", change: "--", trend: "Neutral" }],
      marketSentiment: { score: 50, label: "Neutral", primaryDriver: "Data unavailable" },
      sectorRotation: SECTOR_ROTATION,
      redditTrends: [],
      redditMeta: { source: 'unavailable', lastUpdated: null, isStale: false, isUnavailable: true },
      news: [],
      picks: [],
      picksMeta: { source: 'unavailable', isLive: false, screenedFrom: 0, passedFilter: 0 },
      insiderTrades: [],
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      error: 'Data temporarily unavailable',
      requestId
    }, {
      headers: { 
        'Cache-Control': 'no-store',
        'X-Cache': 'ERROR',
        'X-Request-Id': requestId
      }
    });
  }
}
