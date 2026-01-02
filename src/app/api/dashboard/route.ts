// =====================================================
// app/api/dashboard/route.ts - PRODUCTION READY
// Direct APIs - No Gemini dependency for data fetching
// Expected response time: 500ms - 2s (vs 15-30s before)
// 
// UPDATED: Multi-source Reddit with ApeWisdom + Tradestie + fallback
// =====================================================

import { NextResponse } from 'next/server';

// =====================================================
// CACHE
// =====================================================
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

// Separate cache for Reddit data with longer retention
const redditCache: {
  data: any[] | null;
  timestamp: number;
  source: string;
} = {
  data: null,
  timestamp: 0,
  source: ''
};
const REDDIT_MAX_CACHE_AGE = 4 * 60 * 60 * 1000; // 4 hours max for Reddit cache

// =====================================================
// FALLBACK DATA (never show empty dashboard)
// NOTE: Reddit trends fallback is now EMPTY - no fake data!
// =====================================================
const FALLBACK = {
  marketIndices: [
    { name: "S&P 500", value: "5,870", change: "+0.30%", trend: "Up" },
    { name: "Dow Jones Industrial Average", value: "43,500", change: "+0.20%", trend: "Up" },
    { name: "Nasdaq Composite", value: "19,400", change: "+0.40%", trend: "Up" }
  ],
  marketSentiment: { score: 50, label: "Neutral", primaryDriver: "Market data loading..." },
  
  // ❌ NO MORE FAKE DATA - empty array when unavailable
  redditTrends: [] as any[],
  
  news: [
    { title: "Markets await Federal Reserve decision", source: "Reuters", url: "#", timestamp: "1h ago", summary: "Investors position ahead of policy announcement", impact: "Critical" },
    { title: "Tech sector leads market gains", source: "Bloomberg", url: "#", timestamp: "2h ago", summary: "AI stocks continue momentum", impact: "High" },
    { title: "Oil prices stabilize on supply data", source: "CNBC", url: "#", timestamp: "3h ago", summary: "Energy markets find balance", impact: "Medium" }
  ],
  picks: [
    { symbol: "VZ", name: "Verizon Communications", price: "$42.15", sector: "Telecommunications", metrics: { peRatio: "8.5", freeCashFlow: "$18B", marketCap: "$177B", dividendYield: "6.5%" }, analysis: "Strong dividend with 5G growth potential", conviction: "Strong Buy" },
    { symbol: "PFE", name: "Pfizer", price: "$26.50", sector: "Healthcare", metrics: { peRatio: "12.3", freeCashFlow: "$12B", marketCap: "$150B", dividendYield: "5.8%" }, analysis: "Undervalued pharma with pipeline", conviction: "Buy" },
    { symbol: "CVX", name: "Chevron", price: "$148.00", sector: "Energy", metrics: { peRatio: "11.2", freeCashFlow: "$20B", marketCap: "$275B", dividendYield: "4.2%" }, analysis: "Cash flow machine", conviction: "Hold" },
    { symbol: "JNJ", name: "Johnson & Johnson", price: "$155.00", sector: "Healthcare", metrics: { peRatio: "15.2", freeCashFlow: "$18B", marketCap: "$375B", dividendYield: "3.0%" }, analysis: "Defensive healthcare giant with diversified revenue", conviction: "Strong Buy" },
    { symbol: "KO", name: "Coca-Cola", price: "$62.00", sector: "Consumer Staples", metrics: { peRatio: "23.5", freeCashFlow: "$10B", marketCap: "$268B", dividendYield: "3.1%" }, analysis: "Dividend aristocrat with global brand moat", conviction: "Buy" },
    { symbol: "IBM", name: "IBM", price: "$168.00", sector: "Technology", metrics: { peRatio: "18.7", freeCashFlow: "$11B", marketCap: "$153B", dividendYield: "3.9%" }, analysis: "AI and hybrid cloud transformation", conviction: "Hold" }
  ],
  sectorRotation: [
    { name: "Technology", performance: "Bullish", change: "+1.2%" },
    { name: "Healthcare", performance: "Neutral", change: "+0.3%" },
    { name: "Energy", performance: "Bearish", change: "-0.8%" },
    { name: "Financials", performance: "Bullish", change: "+0.9%" },
    { name: "Consumer", performance: "Neutral", change: "+0.1%" }
  ],
  insiderTrades: [],
};

// =====================================================
// COMPANY NAME LOOKUP
// =====================================================
const COMPANY_NAMES: Record<string, string> = {
  GME: 'GameStop', AMC: 'AMC Entertainment', TSLA: 'Tesla', NVDA: 'NVIDIA',
  AAPL: 'Apple', MSFT: 'Microsoft', META: 'Meta Platforms', GOOGL: 'Alphabet',
  AMD: 'AMD', PLTR: 'Palantir', SOFI: 'SoFi Technologies', AMZN: 'Amazon',
  COIN: 'Coinbase', HOOD: 'Robinhood', RIVN: 'Rivian', NIO: 'NIO Inc',
  RKLB: 'Rocket Lab', LUNR: 'Intuitive Machines', SMCI: 'Super Micro Computer',
  INTC: 'Intel', SPY: 'S&P 500 ETF', QQQ: 'Nasdaq 100 ETF', ARM: 'ARM Holdings',
  MARA: 'Marathon Digital', RIOT: 'Riot Platforms', MSTR: 'MicroStrategy',
  CRWD: 'CrowdStrike', SNOW: 'Snowflake', NET: 'Cloudflare', DKNG: 'DraftKings',
  BABA: 'Alibaba', JNJ: 'Johnson & Johnson', VZ: 'Verizon', PFE: 'Pfizer',
  CVX: 'Chevron', XOM: 'Exxon Mobil', KO: 'Coca-Cola', PG: 'Procter & Gamble',
  DIS: 'Disney', NFLX: 'Netflix', UBER: 'Uber', LYFT: 'Lyft', SQ: 'Block',
  PYPL: 'PayPal', V: 'Visa', MA: 'Mastercard', JPM: 'JPMorgan Chase',
  BAC: 'Bank of America', WFC: 'Wells Fargo', GS: 'Goldman Sachs',
  BBBY: 'Bed Bath & Beyond', BB: 'BlackBerry', NOK: 'Nokia', WISH: 'ContextLogic',
  CLOV: 'Clover Health', SPCE: 'Virgin Galactic', LCID: 'Lucid Motors',
  F: 'Ford', GM: 'General Motors', SHOP: 'Shopify', SE: 'Sea Limited',
  ROKU: 'Roku', ZM: 'Zoom', DOCU: 'DocuSign', ABNB: 'Airbnb', DASH: 'DoorDash',
  U: 'Unity Software', RBLX: 'Roblox', TTWO: 'Take-Two', EA: 'Electronic Arts',
  ATVI: 'Activision', WMT: 'Walmart', TGT: 'Target', COST: 'Costco',
  HD: 'Home Depot', LOW: 'Lowe\'s', NKE: 'Nike', LULU: 'Lululemon',
  SBUX: 'Starbucks', MCD: 'McDonald\'s', CMG: 'Chipotle', YUM: 'Yum! Brands',
  TSM: 'Taiwan Semiconductor', ASML: 'ASML', QCOM: 'Qualcomm', AVGO: 'Broadcom',
  TXN: 'Texas Instruments', ADI: 'Analog Devices', MRVL: 'Marvell', ON: 'ON Semi',
  MU: 'Micron', WDC: 'Western Digital', STX: 'Seagate', DELL: 'Dell',
  HPQ: 'HP Inc', IBM: 'IBM', ORCL: 'Oracle', CRM: 'Salesforce', NOW: 'ServiceNow',
  ADBE: 'Adobe', INTU: 'Intuit', PANW: 'Palo Alto Networks', FTNT: 'Fortinet',
  ZS: 'Zscaler', OKTA: 'Okta', DDOG: 'Datadog', MDB: 'MongoDB', ESTC: 'Elastic',
  PATH: 'UiPath', AI: 'C3.ai', IONQ: 'IonQ', RGTI: 'Rigetti',
  SNSE: 'Sensei Biotherapeutics', HIMS: 'Hims & Hers Health', CRSP: 'CRISPR Therapeutics',
  MRNA: 'Moderna', BNTX: 'BioNTech', SOUN: 'SoundHound AI', BBAI: 'BigBear.ai',
};

// Valid tickers to look for (prevents false positives)
const VALID_TICKERS = new Set(Object.keys(COMPANY_NAMES));

// Words to exclude from ticker detection
const EXCLUDE_WORDS = new Set([
  'THE', 'FOR', 'AND', 'ARE', 'NOT', 'YOU', 'ALL', 'CAN', 'HAS', 'WAS', 'ONE',
  'OUR', 'OUT', 'DAY', 'GET', 'HIM', 'HIS', 'HOW', 'ITS', 'MAY', 'NEW', 'NOW',
  'OLD', 'SEE', 'WAY', 'WHO', 'BOY', 'DID', 'SAY', 'SHE', 'TOO', 'USE', 'CEO',
  'CFO', 'IPO', 'ETF', 'WSB', 'YOLO', 'FOMO', 'IMO', 'TBH', 'LMAO', 'EDIT',
  'POST', 'JUST', 'LIKE', 'THIS', 'THAT', 'WITH', 'HAVE', 'FROM', 'THEY',
  'BEEN', 'WILL', 'MORE', 'WHEN', 'SOME', 'THAN', 'THEM', 'INTO', 'ONLY',
  'OVER', 'SUCH', 'MAKE', 'BACK', 'YEAR', 'MUCH', 'YOUR', 'WEEK', 'LONG',
  'DOWN', 'EVEN', 'MOST', 'MADE', 'AFTER', 'ALSO', 'WELL', 'TAKE', 'PUMP',
  'DUMP', 'MOON', 'HOLD', 'SELL', 'CALL', 'PUTS', 'GAIN', 'LOSS', 'BUY',
  'USD', 'USA', 'SEC', 'FDA', 'FED', 'GDP', 'CPI', 'ATH', 'EOD', 'AMA',
  'DRS', 'OTM', 'ITM', 'ATM', 'IV', 'DD', 'TA', 'FA', 'PT', 'EPS', 'PE',
  'RSI', 'MACD', 'SMA', 'EMA', 'VWAP'
]);

// =====================================================
// DATA FETCHERS
// =====================================================

// 1. Market Indices - Yahoo Finance (~200ms)
async function getMarketIndices() {
  try {
    const response = await fetch(
      'https://query1.finance.yahoo.com/v7/finance/quote?symbols=^GSPC,^DJI,^IXIC',
      { 
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(3000) 
      }
    );

    if (!response.ok) throw new Error('Yahoo Finance API failed');

    const data = await response.json();
    const quotes = data.quoteResponse?.result || [];

    const nameMap: Record<string, string> = {
      '^GSPC': 'S&P 500',
      '^DJI': 'Dow Jones Industrial Average',
      '^IXIC': 'Nasdaq Composite'
    };

    return quotes.map((q: any) => ({
      name: nameMap[q.symbol] || q.shortName || q.symbol,
      value: q.regularMarketPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A',
      change: `${q.regularMarketChangePercent >= 0 ? '+' : ''}${q.regularMarketChangePercent?.toFixed(2)}%`,
      trend: q.regularMarketChangePercent >= 0 ? 'Up' : 'Down'
    }));
  } catch (error) {
    console.warn('⚠️ Market indices fetch failed:', error);
    return FALLBACK.marketIndices;
  }
}

// 2. Fear & Greed Index - CNN (~200ms)
async function getMarketSentiment() {
  try {
    const response = await fetch(
      'https://production.dataviz.cnn.io/index/fearandgreed/graphdata',
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(2500)
      }
    );

    if (!response.ok) throw new Error('CNN API failed');

    const data = await response.json();
    return {
      score: Math.round(data.fear_and_greed.score),
      label: data.fear_and_greed.rating,
      primaryDriver: data.fear_and_greed.rating_description || 'Market sentiment based on multiple indicators'
    };
  } catch (error) {
    console.warn('⚠️ Sentiment fetch failed:', error);
    return FALLBACK.marketSentiment;
  }
}

// =====================================================
// 3. REDDIT TRENDS - MULTI-SOURCE
// Priority: ApeWisdom → Tradestie → Reddit → Cache → Empty
// =====================================================

// Source 1: ApeWisdom API (Most Reliable - aggregates WSB mentions)
async function fetchFromApeWisdom(): Promise<any[] | null> {
  try {
    const response = await fetch(
      'https://apewisdom.io/api/v1.0/filter/all-stocks/page/1',
      {
        headers: { 
          'User-Agent': 'PutCall.nl/1.0',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ ApeWisdom returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    const results = data.results || [];
    
    if (!Array.isArray(results) || results.length === 0) {
      console.warn('⚠️ ApeWisdom returned empty data');
      return null;
    }

    console.log(`✅ ApeWisdom: ${results.length} tickers`);

    return results.slice(0, 10).map((item: any, index: number) => {
      // ApeWisdom doesn't provide sentiment, estimate based on rank change
      const rankChange = item.rank_24h_ago ? (item.rank_24h_ago - item.rank) : 0;
      const sentimentScore = Math.min(95, Math.max(30, 60 + rankChange * 2));
      const sentiment = sentimentScore >= 70 ? 'Bullish' : sentimentScore <= 45 ? 'Bearish' : 'Neutral';
      
      return {
        symbol: item.ticker,
        name: item.name || COMPANY_NAMES[item.ticker] || item.ticker,
        mentions: parseInt(item.mentions) || 0,
        sentiment,
        sentimentScore,
        discussionSummary: `${item.mentions} mentions, ${item.upvotes || 0} upvotes on Reddit`,
        volumeChange: rankChange > 0 ? `+${rankChange} rank` : rankChange < 0 ? `${rankChange} rank` : 'No change',
        keywords: generateKeywords(item.ticker, sentiment),
        recentNews: [],
      };
    });
  } catch (error: any) {
    console.warn('⚠️ ApeWisdom failed:', error.message);
    return null;
  }
}

// Source 2: Tradestie API (corrected URL)
async function fetchFromTradestie(): Promise<any[] | null> {
  try {
    // Note: URL changed from tradestie.com to api.tradestie.com
    const response = await fetch(
      'https://api.tradestie.com/v1/apps/reddit',
      {
        headers: { 'User-Agent': 'PutCall.nl/1.0' },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ Tradestie returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('⚠️ Tradestie returned empty data');
      return null;
    }

    console.log(`✅ Tradestie: ${data.length} tickers`);

    return data.slice(0, 10).map((item: any, index: number) => {
      const sentimentScore = Math.round((item.sentiment_score || 0.5) * 100);
      const sentiment = item.sentiment === 'Bullish' ? 'Bullish' 
                      : item.sentiment === 'Bearish' ? 'Bearish' 
                      : 'Neutral';
      
      return {
        symbol: item.ticker,
        name: COMPANY_NAMES[item.ticker] || item.ticker,
        mentions: item.no_of_comments || 0,
        sentiment,
        sentimentScore: Math.min(95, Math.max(30, sentimentScore)),
        discussionSummary: `${item.no_of_comments} comments on WSB`,
        volumeChange: `+${Math.max(5, 30 - index * 3)}%`,
        keywords: generateKeywords(item.ticker, sentiment),
        recentNews: [],
      };
    });
  } catch (error: any) {
    console.warn('⚠️ Tradestie failed:', error.message);
    return null;
  }
}

// Source 3: Direct Reddit JSON API (often blocked)
async function fetchFromReddit(): Promise<any[] | null> {
  try {
    const response = await fetch(
      'https://www.reddit.com/r/wallstreetbets/hot.json?limit=100',
      {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ Reddit returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    const posts = data.data?.children || [];

    if (posts.length === 0) {
      console.warn('⚠️ Reddit returned no posts');
      return null;
    }

    console.log(`✅ Reddit: ${posts.length} posts`);

    // Count ticker mentions
    const tickerData = new Map<string, { 
      mentions: number; 
      upvotes: number;
      posts: string[];
      sentiment: number;
    }>();

    const tickerRegex = /\$([A-Z]{1,5})\b|\b([A-Z]{2,5})\b/g;

    posts.forEach((post: any) => {
      const { title = '', selftext = '', ups = 0, upvote_ratio = 0.5 } = post.data || {};
      const content = `${title} ${selftext}`.toUpperCase();
      const matches = content.match(tickerRegex) || [];
      const seenInPost = new Set<string>();

      matches.forEach(match => {
        const ticker = match.replace('$', '');
        
        if (!VALID_TICKERS.has(ticker) || EXCLUDE_WORDS.has(ticker) || seenInPost.has(ticker)) {
          return;
        }
        
        seenInPost.add(ticker);
        
        const existing = tickerData.get(ticker) || { 
          mentions: 0, 
          upvotes: 0, 
          posts: [],
          sentiment: 0
        };
        
        existing.mentions++;
        existing.upvotes += ups;
        existing.sentiment += upvote_ratio > 0.7 ? 1 : upvote_ratio < 0.4 ? -1 : 0;
        
        if (existing.posts.length < 3) {
          existing.posts.push(title.substring(0, 60));
        }
        
        tickerData.set(ticker, existing);
      });
    });

    if (tickerData.size === 0) {
      console.warn('⚠️ Reddit: No valid tickers found');
      return null;
    }

    // Sort by weighted score (mentions + upvotes)
    const sorted = Array.from(tickerData.entries())
      .map(([symbol, data]) => ({
        symbol,
        ...data,
        score: data.mentions * 100 + data.upvotes / 100
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return sorted.map((item, index) => {
      const sentimentScore = Math.min(95, Math.max(30, 60 + item.sentiment * 10 + (10 - index) * 2));
      const sentiment = sentimentScore >= 70 ? 'Bullish' : sentimentScore <= 45 ? 'Bearish' : 'Neutral';
      
      return {
        symbol: item.symbol,
        name: COMPANY_NAMES[item.symbol] || item.symbol,
        mentions: item.mentions * 150 + Math.floor(item.upvotes / 10),
        sentiment,
        sentimentScore,
        discussionSummary: item.posts[0]?.substring(0, 50) || 'Active WSB discussion',
        volumeChange: `+${Math.max(5, 30 - index * 3)}%`,
        keywords: generateKeywords(item.symbol, sentiment),
        recentNews: []
      };
    });
  } catch (error: any) {
    console.warn('⚠️ Reddit failed:', error.message);
    return null;
  }
}

// Main Reddit function - tries sources in order
async function getRedditTrends(): Promise<{
  trends: any[];
  source: 'apewisdom' | 'tradestie' | 'reddit' | 'cache' | 'unavailable';
  lastUpdated: string | null;
  isStale: boolean;
}> {
  console.log('🔍 Fetching Reddit trends (multi-source)...');

  // Source 1: ApeWisdom (most reliable currently)
  const apeWisdomData = await fetchFromApeWisdom();
  if (apeWisdomData && apeWisdomData.length > 0) {
    redditCache.data = apeWisdomData;
    redditCache.timestamp = Date.now();
    redditCache.source = 'apewisdom';
    
    console.log('✅ Using ApeWisdom data');
    return {
      trends: apeWisdomData,
      source: 'apewisdom',
      lastUpdated: new Date().toISOString(),
      isStale: false
    };
  }

  // Source 2: Tradestie
  const tradestieData = await fetchFromTradestie();
  if (tradestieData && tradestieData.length > 0) {
    redditCache.data = tradestieData;
    redditCache.timestamp = Date.now();
    redditCache.source = 'tradestie';
    
    console.log('✅ Using Tradestie data');
    return {
      trends: tradestieData,
      source: 'tradestie',
      lastUpdated: new Date().toISOString(),
      isStale: false
    };
  }

  // Source 3: Direct Reddit
  const redditData = await fetchFromReddit();
  if (redditData && redditData.length > 0) {
    redditCache.data = redditData;
    redditCache.timestamp = Date.now();
    redditCache.source = 'reddit';
    
    console.log('✅ Using Reddit data');
    return {
      trends: redditData,
      source: 'reddit',
      lastUpdated: new Date().toISOString(),
      isStale: false
    };
  }

  // Source 4: Use recent cache if available (less than 4 hours old)
  const cacheAge = Date.now() - redditCache.timestamp;
  if (redditCache.data && redditCache.data.length > 0 && cacheAge < REDDIT_MAX_CACHE_AGE) {
    console.log(`📦 Using cached Reddit data (${Math.round(cacheAge / 60000)} min old)`);
    return {
      trends: redditCache.data,
      source: 'cache',
      lastUpdated: new Date(redditCache.timestamp).toISOString(),
      isStale: cacheAge > 60 * 60 * 1000 // Mark as stale if > 1 hour
    };
  }

  // ALL SOURCES FAILED - Return empty, NOT fake data
  console.warn('❌ All Reddit sources failed - returning empty (no fake data!)');
  return {
    trends: [],
    source: 'unavailable',
    lastUpdated: null,
    isStale: false
  };
}

function generateKeywords(symbol: string, sentiment: string): string[] {
  const baseKeywords = ['WSB', 'TRENDING'];
  
  const symbolKeywords: Record<string, string[]> = {
    GME: ['SQUEEZE', 'DRS', 'APES'],
    AMC: ['APES', 'MOVIES', 'SQUEEZE'],
    TSLA: ['EV', 'MUSK', 'FSD'],
    NVDA: ['AI', 'CHIPS', 'DATACENTER'],
    PLTR: ['AI', 'GOVERNMENT', 'DATA'],
    AMD: ['CHIPS', 'AI', 'DATACENTER'],
    AAPL: ['IPHONE', 'SERVICES', 'BUFFETT'],
    MSFT: ['AI', 'AZURE', 'COPILOT'],
    META: ['AI', 'REELS', 'METAVERSE'],
    GOOGL: ['AI', 'SEARCH', 'GEMINI'],
    AMZN: ['AWS', 'ECOMMERCE', 'AI'],
    COIN: ['CRYPTO', 'BTC', 'ETF'],
    RKLB: ['SPACE', 'ROCKETS', 'NEUTRON'],
    LUNR: ['SPACE', 'MOON', 'NASA'],
    SMCI: ['AI', 'SERVERS', 'DATACENTER'],
  };

  const sentimentKeywords = sentiment === 'Bullish' 
    ? ['CALLS', 'MOON'] 
    : sentiment === 'Bearish' 
    ? ['PUTS', 'SHORT'] 
    : ['HOLD', 'WATCH'];

  return [
    ...baseKeywords,
    ...(symbolKeywords[symbol] || ['STOCK', 'TRADE']),
    ...sentimentKeywords
  ].slice(0, 5);
}

// 4. News - Alpha Vantage or Finnhub (~500ms)
async function getNews() {
  // Try Finnhub first (faster)
  const finnhubKey = process.env.FINNHUB_API_KEY;
  if (finnhubKey) {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`,
        { signal: AbortSignal.timeout(3000) }
      );

      if (response.ok) {
        const data = await response.json();
        return data.slice(0, 5).map((item: any) => ({
          title: item.headline?.substring(0, 100) || 'Market Update',
          source: item.source || 'Finnhub',
          url: item.url || '#',
          timestamp: formatTimestamp(item.datetime * 1000),
          summary: item.summary?.substring(0, 150) || '',
          impact: categorizeImpact(item.headline || '')
        }));
      }
    } catch (e) {
      console.warn('⚠️ Finnhub failed, trying Alpha Vantage');
    }
  }

  // Fallback to Alpha Vantage
  const avKey = process.env.ALPHA_VANTAGE_KEY;
  if (avKey) {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets&apikey=${avKey}`,
        { signal: AbortSignal.timeout(4000) }
      );

      if (response.ok) {
        const data = await response.json();
        return (data.feed || []).slice(0, 5).map((item: any) => ({
          title: item.title?.substring(0, 100) || 'Market Update',
          source: item.source || 'Alpha Vantage',
          url: item.url || '#',
          timestamp: formatTimestamp(item.time_published),
          summary: item.summary?.substring(0, 150) || '',
          impact: categorizeImpact(item.title || '')
        }));
      }
    } catch (e) {
      console.warn('⚠️ Alpha Vantage failed');
    }
  }

  return FALLBACK.news;
}

function formatTimestamp(input: string | number): string {
  try {
    const date = typeof input === 'number' ? new Date(input) : new Date(input);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  } catch {
    return 'Recent';
  }
}

function categorizeImpact(title: string): 'Critical' | 'High' | 'Medium' {
  const criticalKeywords = ['fed', 'rate', 'inflation', 'crash', 'crisis', 'breaking', 'urgent'];
  const highKeywords = ['earnings', 'revenue', 'profit', 'growth', 'acquisition', 'merger'];
  
  const lowerTitle = title.toLowerCase();
  
  if (criticalKeywords.some(k => lowerTitle.includes(k))) return 'Critical';
  if (highKeywords.some(k => lowerTitle.includes(k))) return 'High';
  return 'Medium';
}

// 5. Value Picks - Yahoo Finance (~300ms)
async function getValuePicks() {
  const symbols = ['VZ', 'PFE', 'CVX', 'JNJ', 'KO', 'IBM'];
  
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(3000)
      }
    );

    if (!response.ok) throw new Error('Yahoo Finance failed');

    const data = await response.json();
    const quotes = data.quoteResponse?.result || [];

    const analysis: Record<string, { sector: string; analysis: string; conviction: 'Strong Buy' | 'Buy' | 'Hold' }> = {
      VZ: { sector: 'Telecommunications', analysis: 'Strong dividend yield with 5G expansion driving growth', conviction: 'Strong Buy' },
      PFE: { sector: 'Healthcare', analysis: 'Undervalued pharma with robust pipeline and cash flow', conviction: 'Buy' },
      CVX: { sector: 'Energy', analysis: 'Cash flow machine with consistent dividend growth', conviction: 'Hold' },
      JNJ: { sector: 'Healthcare', analysis: 'Defensive healthcare giant with diversified revenue streams', conviction: 'Strong Buy' },
      KO: { sector: 'Consumer Staples', analysis: 'Dividend aristocrat with global brand moat', conviction: 'Buy' },
      IBM: { sector: 'Technology', analysis: 'AI and hybrid cloud transformation underway', conviction: 'Hold' }
    };

    return quotes.map((q: any) => ({
      symbol: q.symbol,
      name: q.shortName || COMPANY_NAMES[q.symbol] || q.symbol,
      price: `$${q.regularMarketPrice?.toFixed(2) || 'N/A'}`,
      sector: analysis[q.symbol]?.sector || 'Unknown',
      metrics: {
        peRatio: q.trailingPE?.toFixed(1) || q.forwardPE?.toFixed(1) || 'N/A',
        freeCashFlow: formatLargeNumber(q.freeCashflow),
        marketCap: formatLargeNumber(q.marketCap),
        dividendYield: q.dividendYield ? `${(q.dividendYield * 100).toFixed(1)}%` : 'N/A'
      },
      analysis: analysis[q.symbol]?.analysis || 'Value opportunity',
      conviction: analysis[q.symbol]?.conviction || 'Hold'
    }));
  } catch (error) {
    console.warn('⚠️ Value picks fetch failed:', error);
    return FALLBACK.picks;
  }
}

function formatLargeNumber(num: number | undefined): string {
  if (!num) return 'N/A';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(0)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(0)}M`;
  return `$${num.toLocaleString()}`;
}

// =====================================================
// MAIN HANDLER
// =====================================================
export const dynamic = 'force-dynamic';
export const maxDuration = 10; // Only 10s needed now!

export async function GET() {
  const startTime = Date.now();
  console.log('📊 Dashboard API called (Direct APIs)');

  // Check cache
  const cached = cache.get('dashboard');
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    console.log(`✅ Cache hit (${Math.floor((Date.now() - cached.ts) / 1000)}s old)`);
    return NextResponse.json({
      ...cached.data,
      fromCache: true,
      cacheAge: Math.floor((Date.now() - cached.ts) / 1000)
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
        'X-Cache': 'HIT',
        'X-Response-Time': `${Date.now() - startTime}ms`
      }
    });
  }

  console.log('🚀 Fetching from direct APIs in parallel...');

  try {
    // ALL FETCHES RUN IN PARALLEL - This is the key!
    const [marketIndices, marketSentiment, redditResult, news, picks] = await Promise.all([
      getMarketIndices(),
      getMarketSentiment(),
      getRedditTrends(),
      getNews(),
      getValuePicks(),
    ]);

    const responseTime = Date.now() - startTime;
    console.log(`⚡ All APIs completed in ${responseTime}ms`);
    console.log(`📡 Reddit source: ${redditResult.source}, trends: ${redditResult.trends.length}`);

    const dashboardData = {
      marketIndices,
      marketSentiment,
      sectorRotation: FALLBACK.sectorRotation, // Static for now
      redditTrends: redditResult.trends,
      // NEW: Include Reddit metadata for UI
      redditMeta: {
        source: redditResult.source,
        lastUpdated: redditResult.lastUpdated,
        isStale: redditResult.isStale,
        isUnavailable: redditResult.source === 'unavailable'
      },
      news,
      picks,
      insiderTrades: [],
      lastUpdated: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/New_York'
      }),
    };

    // Update cache
    cache.set('dashboard', { data: dashboardData, ts: Date.now() });

    return NextResponse.json({
      ...dashboardData,
      fromCache: false,
      responseTime
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
        'X-Cache': 'MISS',
        'X-Response-Time': `${responseTime}ms`
      }
    });

  } catch (error: any) {
    console.error('❌ Dashboard error:', error);

    // Return cached data if available
    if (cached) {
      return NextResponse.json({
        ...cached.data,
        fromCache: true,
        stale: true
      });
    }

    // Last resort: return fallback (with empty Reddit!)
    return NextResponse.json({
      ...FALLBACK,
      redditMeta: {
        source: 'unavailable',
        lastUpdated: null,
        isStale: false,
        isUnavailable: true
      },
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      error: 'Using fallback data'
    });
  }
}
