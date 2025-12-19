import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// ============================================
// FALLBACK DATA - Never show empty dashboard
// ============================================
const FALLBACK_DATA = {
  marketIndices: [
    { name: "S&P 500", value: "5,870", change: "+0.3%", trend: "Up" as const },
    { name: "Dow Jones Industrial Average", value: "43,500", change: "+0.2%", trend: "Up" as const },
    { name: "Nasdaq Composite", value: "19,400", change: "+0.4%", trend: "Up" as const }
  ],
  marketSentiment: { score: 50, label: "Neutral", primaryDriver: "Loading real-time data..." },
  sectorRotation: [
    { name: "Technology", performance: "Bullish" as const, change: "+1.2%" },
    { name: "Healthcare", performance: "Neutral" as const, change: "+0.3%" },
    { name: "Energy", performance: "Bearish" as const, change: "-0.8%" }
  ],
  redditTrends: [
    { symbol: "GME", name: "GameStop", mentions: 5000, sentiment: "Bullish" as const, sentimentScore: 75, discussionSummary: "Retail interest continues", volumeChange: "+20%", keywords: ["SQUEEZE", "HOLD", "DRS", "MOON", "APES"], recentNews: [] },
    { symbol: "TSLA", name: "Tesla", mentions: 4500, sentiment: "Neutral" as const, sentimentScore: 65, discussionSummary: "Mixed sentiment on deliveries", volumeChange: "+15%", keywords: ["EV", "MUSK", "FSD", "CYBERTRUCK", "CALLS"], recentNews: [] },
    { symbol: "NVDA", name: "NVIDIA", mentions: 4000, sentiment: "Bullish" as const, sentimentScore: 85, discussionSummary: "AI chip demand strong", volumeChange: "+25%", keywords: ["AI", "CHIPS", "DATACENTER", "BLACKWELL", "CALLS"], recentNews: [] },
    { symbol: "PLTR", name: "Palantir", mentions: 3500, sentiment: "Bullish" as const, sentimentScore: 80, discussionSummary: "Government contracts expanding", volumeChange: "+18%", keywords: ["AI", "GOVERNMENT", "DATA", "DEFENSE", "MOON"], recentNews: [] },
    { symbol: "AMD", name: "AMD", mentions: 3000, sentiment: "Bullish" as const, sentimentScore: 78, discussionSummary: "Competing well in AI space", volumeChange: "+12%", keywords: ["CHIPS", "AI", "DATACENTER", "MI300", "CALLS"], recentNews: [] },
    { symbol: "AMC", name: "AMC Entertainment", mentions: 2800, sentiment: "Neutral" as const, sentimentScore: 60, discussionSummary: "Box office recovery hopes", volumeChange: "+10%", keywords: ["MOVIES", "APES", "HOLD", "SQUEEZE", "POPCORN"], recentNews: [] },
    { symbol: "AAPL", name: "Apple", mentions: 2500, sentiment: "Neutral" as const, sentimentScore: 68, discussionSummary: "iPhone sales steady", volumeChange: "+8%", keywords: ["IPHONE", "SERVICES", "AI", "VISION", "BUFFETT"], recentNews: [] },
    { symbol: "MSFT", name: "Microsoft", mentions: 2200, sentiment: "Bullish" as const, sentimentScore: 82, discussionSummary: "Azure and AI growth", volumeChange: "+10%", keywords: ["AI", "AZURE", "COPILOT", "CLOUD", "OPENAI"], recentNews: [] },
    { symbol: "META", name: "Meta Platforms", mentions: 2000, sentiment: "Bullish" as const, sentimentScore: 77, discussionSummary: "Ad revenue rebounding", volumeChange: "+12%", keywords: ["AI", "REELS", "ADS", "METAVERSE", "LLAMA"], recentNews: [] },
    { symbol: "GOOGL", name: "Alphabet", mentions: 1800, sentiment: "Neutral" as const, sentimentScore: 70, discussionSummary: "Search dominance questioned", volumeChange: "+7%", keywords: ["SEARCH", "AI", "GEMINI", "CLOUD", "ADS"], recentNews: [] }
  ],
  news: [
    { title: "Markets await Fed decision on interest rates", source: "Reuters", url: "#", timestamp: "1h ago", summary: "Investors positioning ahead of policy announcement", impact: "Critical" as const },
    { title: "Tech sector leads market gains", source: "Bloomberg", url: "#", timestamp: "2h ago", summary: "AI-related stocks continue upward momentum", impact: "High" as const },
    { title: "Oil prices stabilize amid supply concerns", source: "CNBC", url: "#", timestamp: "3h ago", summary: "Energy markets find equilibrium", impact: "Medium" as const }
  ],
  picks: [
    { symbol: "VZ", name: "Verizon Communications", price: "$42.15", sector: "Telecommunications", metrics: { peRatio: "8.5", freeCashFlow: "$18B", marketCap: "$177B", dividendYield: "6.5%" }, analysis: "Strong dividend with 5G growth potential", conviction: "Strong Buy" as const },
    { symbol: "PFE", name: "Pfizer", price: "$26.50", sector: "Healthcare", metrics: { peRatio: "12.3", freeCashFlow: "$12B", marketCap: "$150B", dividendYield: "5.8%" }, analysis: "Undervalued pharma with strong pipeline", conviction: "Buy" as const },
    { symbol: "CVX", name: "Chevron", price: "$148.00", sector: "Energy", metrics: { peRatio: "11.2", freeCashFlow: "$20B", marketCap: "$275B", dividendYield: "4.2%" }, analysis: "Cash flow machine with solid dividend", conviction: "Hold" as const }
  ],
  insiderTrades: [],
  lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  isFallback: true
};

// ============================================
// CACHE
// ============================================
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// ============================================
// FAST DATA FETCHERS (with tight timeouts)
// ============================================
async function getFearGreedIndex(): Promise<{ score: number; label: string; primaryDriver: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s max
    
    const response = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      return {
        score: Math.round(data.fear_and_greed.score),
        label: data.fear_and_greed.rating,
        primaryDriver: data.fear_and_greed.rating_description || "Market sentiment"
      };
    }
  } catch (e) {
    console.warn('⚠️ Fear & Greed fetch failed, using fallback');
  }
  return { score: 50, label: "Neutral", primaryDriver: "Data temporarily unavailable" };
}

async function getMarketIndices() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    
    const response = await fetch(
      'https://query1.finance.yahoo.com/v7/finance/quote?symbols=^GSPC,^DJI,^IXIC',
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      const quotes = data.quoteResponse?.result || [];
      
      const nameMap: Record<string, string> = {
        '^GSPC': 'S&P 500',
        '^DJI': 'Dow Jones Industrial Average', 
        '^IXIC': 'Nasdaq Composite'
      };
      
      return quotes.map((q: any) => ({
        name: nameMap[q.symbol] || q.shortName,
        value: q.regularMarketPrice?.toLocaleString() || 'N/A',
        change: `${q.regularMarketChangePercent >= 0 ? '+' : ''}${q.regularMarketChangePercent?.toFixed(2)}%`,
        trend: q.regularMarketChangePercent >= 0 ? 'Up' : 'Down'
      }));
    }
  } catch (e) {
    console.warn('⚠️ Market indices fetch failed');
  }
  return FALLBACK_DATA.marketIndices;
}

// ============================================
// GEMINI - with strict timeout
// ============================================
async function getGeminiData(apiKey: string) {
  const ai = new GoogleGenAI({ apiKey });
  const currentTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
  
  // MUCH shorter prompt for speed
  const prompt = `Wall Street analyst report. Time: ${currentTime} ET. Return JSON only.

Search "reddit wallstreetbets hot stocks today" - Return top 10 trending tickers with: symbol, name, mentions (number), sentiment (Bullish/Bearish/Neutral), sentimentScore (0-100), discussionSummary (10 words), volumeChange, keywords (5 words), recentNews (empty array).

Search "stock market news today" - Return 5 news items: title, source, url, timestamp, summary (1 sentence), impact (Critical/High/Medium).

Return 3 value stocks from VZ/PFE/CVX/XOM/JNJ with current price and metrics.

JSON format:
{"redditTrends":[{"symbol":"GME","name":"GameStop","mentions":5000,"sentiment":"Bullish","sentimentScore":75,"discussionSummary":"Short squeeze talk","volumeChange":"+20%","keywords":["SQUEEZE","MOON","APES","HOLD","DRS"],"recentNews":[]}],"news":[{"title":"...","source":"Reuters","url":"...","timestamp":"1h ago","summary":"...","impact":"Critical"}],"picks":[{"symbol":"VZ","name":"Verizon","price":"$42.00","sector":"Telecom","metrics":{"peRatio":"8.5","freeCashFlow":"$18B","marketCap":"$177B","dividendYield":"6.5%"},"analysis":"Value play","conviction":"Strong Buy"}],"sectorRotation":[{"name":"Technology","performance":"Bullish","change":"+1.5%"}]}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.2,
    },
  });
  
  return response.text || "";
}

function extractJSON(text: string): any {
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch {
    const start = text.indexOf('{');
    if (start === -1) throw new Error("No JSON found");
    
    let depth = 0, end = -1;
    for (let i = start; i < text.length; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') depth--;
      if (depth === 0) { end = i; break; }
    }
    
    if (end !== -1) return JSON.parse(text.substring(start, end + 1));
    throw new Error("Invalid JSON");
  }
}

// ============================================
// MAIN HANDLER
// ============================================
export const dynamic = 'force-dynamic';
export const maxDuration = 25; // Stay well under Vercel's limit

export async function GET() {
  const startTime = Date.now();
  console.log('📊 Dashboard API called');
  
  // Check cache first
  const cached = cache.get('dashboard');
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`✅ Cache hit (${Math.floor((Date.now() - cached.timestamp) / 1000)}s old)`);
    return NextResponse.json({ ...cached.data, fromCache: true }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
    });
  }
  
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  // No API key? Return fallback immediately
  if (!apiKey) {
    console.warn('⚠️ No API key, returning fallback');
    return NextResponse.json({ ...FALLBACK_DATA, error: "API key not configured" });
  }
  
  try {
    // Race: Get data OR timeout after 20 seconds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 20000)
    );
    
    const dataPromise = (async () => {
      // Fetch fast data in parallel
      const [sentiment, indices] = await Promise.all([
        getFearGreedIndex(),
        getMarketIndices(),
      ]);
      
      // Try Gemini with its own timeout
      let geminiData = null;
      try {
        const geminiTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Gemini timeout')), 15000)
        );
        const geminiText = await Promise.race([
          getGeminiData(apiKey),
          geminiTimeout
        ]) as string;
        geminiData = extractJSON(geminiText);
      } catch (e) {
        console.warn('⚠️ Gemini failed/timeout, using fallback trends');
      }
      
      return {
        marketIndices: indices,
        marketSentiment: sentiment,
        sectorRotation: geminiData?.sectorRotation || FALLBACK_DATA.sectorRotation,
        redditTrends: geminiData?.redditTrends || FALLBACK_DATA.redditTrends,
        news: geminiData?.news || FALLBACK_DATA.news,
        picks: geminiData?.picks || FALLBACK_DATA.picks,
        insiderTrades: [],
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: !geminiData,
      };
    })();
    
    const dashboardData = await Promise.race([dataPromise, timeoutPromise]) as any;
    
    // Cache the result
    cache.set('dashboard', { data: dashboardData, timestamp: Date.now() });
    
    console.log(`✅ Response in ${Date.now() - startTime}ms`);
    
    return NextResponse.json({
      ...dashboardData,
      fromCache: false,
      responseTime: Date.now() - startTime,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    
    // Return cached data if available (even if stale)
    if (cached) {
      return NextResponse.json({ 
        ...cached.data, 
        fromCache: true, 
        stale: true,
        cacheAge: Math.floor((Date.now() - cached.timestamp) / 1000)
      });
    }
    
    // Last resort: return fallback data (NEVER return error text!)
    return NextResponse.json({
      ...FALLBACK_DATA,
      error: "Using fallback data",
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }
}
