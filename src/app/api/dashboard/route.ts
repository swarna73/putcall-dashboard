import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes - reduces slow loads

function extractJSON(text: string): any {
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    const startIndex = text.indexOf('{');
    if (startIndex === -1) throw new Error("No JSON start found in response");

    let braceCount = 0;
    let endIndex = -1;

    for (let i = startIndex; i < text.length; i++) {
      if (text[i] === '{') braceCount++;
      else if (text[i] === '}') braceCount--;

      if (braceCount === 0) {
        endIndex = i;
        break;
      }
    }

    if (endIndex !== -1) {
      const jsonStr = text.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonStr);
    }
    
    throw new Error("Could not extract valid JSON object from response");
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60; // Maximum allowed on Vercel Pro (10s on free tier)

export async function GET() {
  console.log('🔄 Dashboard API called');
  
  const cacheKey = 'dashboard-data';
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('✅ Serving from cache');
    return NextResponse.json({
      ...cached.data,
      fromCache: true,
      cacheAge: Math.floor((Date.now() - cached.timestamp) / 1000),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache-Status': 'HIT',
      },
    });
  }

  console.log('❌ Cache miss - fetching fresh data');
  
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  if (!apiKey) {
    console.error('❌ API Key missing');
    return NextResponse.json(
      { error: "API Key is missing. Please configure GEMINI_API_KEY in your environment." },
      { status: 500 }
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash';
  
  const currentTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

  // SIMPLIFIED prompt - removed insider trading, reduced complexity
  const prompt = `
    Act as a Senior Wall Street Analyst. The current time in New York is: ${currentTime}.
    Generate a JSON market report using **REAL-TIME** data from Google Search.
    
    **CRITICAL**: Keep searches minimal to avoid timeout. Focus on speed.

    **Part 1: REDDIT TRENDS (Quick Search)**
    - Search "wallstreetbets reddit trending stocks" 
    - Return TOP 5 most discussed tickers
    - For each: symbol, name, mentions (estimate), sentiment (Bullish/Bearish/Neutral), sentimentScore (0-100), discussionSummary (one sentence), volumeChange, keywords (5 words)
    
    **Part 2: MARKET NEWS (Quick Search)**
    - Search "breaking financial news today"
    - Return 5 news items from last 6 hours
    - For each: title, source, url, timestamp, summary (one sentence), impact (Critical/Normal)

    **Part 3: VALUE STOCKS (Quick Search)**
    - Search "best value stocks low PE high FCF"
    - Return 3 stocks with strong fundamentals
    - For each: symbol, name, price, sector, metrics (peRatio, roe, debtToEquity, freeCashFlow, marketCap, dividendYield), technicalLevels (support, resistance, stopLoss), catalyst, analysis, conviction

    **CRITICAL RULES:**
    1. NO FABRICATION - Real data only
    2. If data unavailable, return empty arrays
    3. Keep it FAST - minimal searches
    4. NO insider trading data (removed for speed)

    **Output JSON (No Markdown)**:
    {
      "marketIndices": [ 
        { "name": "S&P 500", "value": "...", "change": "...", "trend": "Up" },
        { "name": "Dow Jones Industrial Average", "value": "...", "change": "...", "trend": "Up" },
        { "name": "Nasdaq Composite", "value": "...", "change": "...", "trend": "Up" }
      ],
      "marketSentiment": { "score": 75, "label": "Greed", "primaryDriver": "..." },
      "sectorRotation": [ 
        { "name": "Technology", "performance": "Bullish", "change": "+1.5%" }
      ],
      "redditTrends": [ 
         { "symbol": "NVDA", "name": "NVIDIA", "mentions": 5000, "sentiment": "Bullish", "sentimentScore": 90, "discussionSummary": "...", "volumeChange": "+20% vs Avg", "keywords": ["AI", "Blackwell", "Calls", "Moon", "Jensen"] }
      ],
      "news": [ 
        { "title": "...", "source": "Bloomberg", "url": "...", "timestamp": "2h ago", "summary": "...", "impact": "Critical" }
      ],
      "picks": [ 
         { "symbol": "VZ", "name": "Verizon", "price": "$42.15", "sector": "Telecom", "metrics": { "peRatio": "8.5", "roe": "15%", "debtToEquity": "1.8", "freeCashFlow": "$18B", "marketCap": "177B", "dividendYield": "6.5%" }, "technicalLevels": { "support": "41.00", "resistance": "44.00", "stopLoss": "40.50" }, "catalyst": "5G Expansion", "analysis": "...", "conviction": "Strong Buy" }
      ],
      "insiderTrades": []
    }
  `;

  try {
    console.log('📡 Calling Gemini API...');
    const startTime = Date.now();
    
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    const endTime = Date.now();
    console.log(`✅ Gemini responded in ${endTime - startTime}ms`);

    const text = response.text || "";
    const rawData = extractJSON(text);

    const dashboardData = {
      marketIndices: rawData.marketIndices || [],
      marketSentiment: rawData.marketSentiment || { score: 50, label: "Neutral", primaryDriver: "Data Unavailable" },
      sectorRotation: rawData.sectorRotation || [],
      redditTrends: rawData.redditTrends || [],
      news: rawData.news || [],
      picks: rawData.picks || [],
      insiderTrades: [],
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };

    // Store in cache
    cache.set(cacheKey, {
      data: dashboardData,
      timestamp: Date.now(),
    });

    console.log('💾 Data cached successfully');

    return NextResponse.json({
      ...dashboardData,
      fromCache: false,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache-Status': 'MISS',
      },
    });

  } catch (error: any) {
    console.error("❌ Gemini API Error:", error);
    
    // If there's cached data (even expired), serve it as fallback
    const staleCache = cache.get(cacheKey);
    if (staleCache) {
      console.log('⚠️ Serving stale cache due to error');
      return NextResponse.json({
        ...staleCache.data,
        fromCache: true,
        cacheAge: Math.floor((Date.now() - staleCache.timestamp) / 1000),
        stale: true,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300',
          'X-Cache-Status': 'STALE',
        },
      });
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch dashboard data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
