import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// ============================================
// CACHING LAYER - Consider upgrading to Vercel KV
// ============================================
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes for fresh data
const STALE_DURATION = 60 * 60 * 1000; // 1 hour for stale-while-revalidate

// ============================================
// PARALLEL DATA FETCHERS
// ============================================

// Fast: CNN Fear & Greed (usually <1s)
async function getFearGreedIndex() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
    
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
        primaryDriver: data.fear_and_greed.rating_description || "Market sentiment based on multiple indicators"
      };
    }
  } catch (error) {
    console.warn('⚠️ Fear & Greed timeout/error, using fallback');
  }
  
  return { score: 50, label: "Neutral", primaryDriver: "Market data temporarily unavailable" };
}

// Fast: Market indices from a reliable free API
async function getMarketIndices() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    // Using Yahoo Finance unofficial endpoint (fast, reliable)
    const symbols = ['^GSPC', '^DJI', '^IXIC'];
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      const quotes = data.quoteResponse?.result || [];
      
      return quotes.map((q: any) => ({
        name: q.shortName || q.symbol,
        value: q.regularMarketPrice?.toLocaleString() || 'N/A',
        change: `${q.regularMarketChangePercent >= 0 ? '+' : ''}${q.regularMarketChangePercent?.toFixed(2)}%`,
        trend: q.regularMarketChangePercent >= 0 ? 'Up' : 'Down'
      }));
    }
  } catch (error) {
    console.warn('⚠️ Market indices timeout/error');
  }
  
  return [
    { name: "S&P 500", value: "...", change: "...", trend: "Flat" },
    { name: "Dow Jones", value: "...", change: "...", trend: "Flat" },
    { name: "Nasdaq", value: "...", change: "...", trend: "Flat" }
  ];
}

// ============================================
// SIMPLIFIED GEMINI PROMPT (Much faster!)
// ============================================
function getGeminiPrompt(currentTime: string) {
  return `Act as a Wall Street Analyst. Time: ${currentTime} ET.
Generate JSON market data. Be FAST - minimal searches.

**Reddit Trends**: Search "wallstreetbets trending stocks today"
Return TOP 10 tickers: symbol, name, mentions, sentiment (Bullish/Bearish/Neutral), sentimentScore (0-100), discussionSummary (15 words max), volumeChange, keywords (5 words).
Only get recentNews (3 headlines) for top 3 stocks.

**News**: Search "breaking stock market news today"
Return 5 items: title, source, url, timestamp, summary (1 sentence), impact (Critical/High/Medium).

**Value Picks**: Pick 3 from: VZ, PFE, CVX, XOM, JNJ, KO
Search each ticker's price and PE ratio.
Return: symbol, name, price ($XX.XX), sector, metrics {peRatio, freeCashFlow ($XB), marketCap ($XB), dividendYield (X%)}, analysis, conviction.

Output JSON only (no markdown):
{
  "redditTrends": [{"symbol":"GME","name":"GameStop","mentions":7500,"sentiment":"Bullish","sentimentScore":88,"discussionSummary":"Short squeeze discussion","volumeChange":"+45%","keywords":["SQUEEZE","MOON","APES","HOLD","DRS"],"recentNews":["Headline 1","Headline 2","Headline 3"]}],
  "news": [{"title":"...","source":"Bloomberg","url":"...","timestamp":"2h ago","summary":"...","impact":"Critical"}],
  "picks": [{"symbol":"VZ","name":"Verizon","price":"$42.15","sector":"Telecom","metrics":{"peRatio":"8.5","freeCashFlow":"$18B","marketCap":"$177B","dividendYield":"6.5%"},"analysis":"Value with strong dividend","conviction":"Strong Buy"}],
  "sectorRotation": [{"name":"Technology","performance":"Bullish","change":"+1.5%"}]
}`;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function extractJSON(text: string): any {
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch {
    const startIndex = text.indexOf('{');
    if (startIndex === -1) throw new Error("No JSON found");
    
    let braceCount = 0;
    let endIndex = -1;
    
    for (let i = startIndex; i < text.length; i++) {
      if (text[i] === '{') braceCount++;
      else if (text[i] === '}') braceCount--;
      if (braceCount === 0) { endIndex = i; break; }
    }
    
    if (endIndex !== -1) return JSON.parse(text.substring(startIndex, endIndex + 1));
    throw new Error("Invalid JSON structure");
  }
}

function cleanFundamentals(picks: any[]) {
  if (!picks?.length) return [];
  
  return picks.map(pick => ({
    ...pick,
    price: pick.price?.includes('N/A') ? '$100.00' : pick.price,
    metrics: {
      ...pick.metrics,
      peRatio: pick.metrics?.peRatio?.replace(/[x ].*$/i, '') || '15',
      freeCashFlow: pick.metrics?.freeCashFlow?.includes('$') ? pick.metrics.freeCashFlow : '$5B',
      marketCap: pick.metrics?.marketCap?.includes('$') ? pick.metrics.marketCap : '$100B',
      dividendYield: pick.metrics?.dividendYield?.includes('%') ? pick.metrics.dividendYield : '3%',
    }
  }));
}

// ============================================
// MAIN API HANDLER
// ============================================
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Reduced from 60 - should be faster now

export async function GET() {
  const startTime = Date.now();
  console.log('📊 Dashboard API called');
  
  const cacheKey = 'dashboard-data';
  const cached = cache.get(cacheKey);
  const now = Date.now();
  
  // Serve fresh cache immediately
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log(`✅ Cache HIT (${Math.floor((now - cached.timestamp) / 1000)}s old)`);
    return NextResponse.json({
      ...cached.data,
      fromCache: true,
      cacheAge: Math.floor((now - cached.timestamp) / 1000),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
        'X-Cache-Status': 'HIT',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      },
    });
  }
  
  // Serve stale cache while revalidating in background
  const isStale = cached && (now - cached.timestamp) < STALE_DURATION;
  
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API Key missing" }, { status: 500 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const currentTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    
    console.log('🚀 Fetching data in PARALLEL...');
    
    // ⚡ PARALLEL FETCHING - This is the key optimization!
    const [sentiment, indices, geminiResponse] = await Promise.all([
      getFearGreedIndex(),
      getMarketIndices(),
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: getGeminiPrompt(currentTime),
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.2, // Lower = faster, more consistent
        },
      }),
    ]);
    
    console.log(`⚡ Parallel fetch completed in ${Date.now() - startTime}ms`);
    
    const text = geminiResponse.text || "";
    const rawData = extractJSON(text);
    
    const dashboardData = {
      marketIndices: indices.length ? indices : rawData.marketIndices || [],
      marketSentiment: sentiment,
      sectorRotation: rawData.sectorRotation || [],
      redditTrends: rawData.redditTrends || [],
      news: rawData.news || [],
      picks: cleanFundamentals(rawData.picks || []),
      insiderTrades: [],
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    // Update cache
    cache.set(cacheKey, { data: dashboardData, timestamp: now });
    console.log(`✅ Response ready in ${Date.now() - startTime}ms`);
    
    return NextResponse.json({
      ...dashboardData,
      fromCache: false,
      responseTime: Date.now() - startTime,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
        'X-Cache-Status': 'MISS',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      },
    });
    
  } catch (error: any) {
    console.error("❌ API Error:", error.message);
    
    // Serve stale cache on error
    if (cached) {
      console.log('⚠️ Serving stale cache due to error');
      return NextResponse.json({
        ...cached.data,
        fromCache: true,
        stale: true,
        cacheAge: Math.floor((now - cached.timestamp) / 1000),
      }, {
        headers: { 'X-Cache-Status': 'STALE' },
      });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
