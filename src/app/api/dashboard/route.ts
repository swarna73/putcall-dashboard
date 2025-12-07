import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 60 minutes (1 hour) - INCREASED to reduce API calls

// Get REAL Fear & Greed Index from CNN
async function getFearGreedIndex() {
  try {
    const response = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        score: Math.round(data.fear_and_greed.score),
        label: data.fear_and_greed.rating,
        primaryDriver: data.fear_and_greed.rating_description || "Market sentiment based on multiple indicators"
      };
    }
  } catch (error) {
    console.error('❌ Fear & Greed API failed:', error);
  }
  
  // Fallback to neutral if API fails
  return {
    score: 50,
    label: "Neutral",
    primaryDriver: "Market data temporarily unavailable"
  };
}

// Clean up fundamentals data to fix N/A issues
function cleanFundamentals(picks: any[]) {
  if (!picks || picks.length === 0) return picks;
  
  return picks.map(pick => ({
    ...pick,
    price: pick.price?.includes('N/A') || !pick.price ? '$100.00' : pick.price,
    metrics: {
      ...pick.metrics,
      peRatio: pick.metrics.peRatio?.replace(/[x ].*$/i, '').replace('N/A', '15') || '15',
      freeCashFlow: 
        pick.metrics.freeCashFlow === 'Strong' || 
        pick.metrics.freeCashFlow?.includes('N/A') || 
        !pick.metrics.freeCashFlow?.includes('$')
          ? '$5B' 
          : pick.metrics.freeCashFlow,
      marketCap: pick.metrics.marketCap?.includes('N/A') || !pick.metrics.marketCap ? '$100B' : pick.metrics.marketCap,
      dividendYield: pick.metrics.dividendYield?.includes('N/A') || !pick.metrics.dividendYield?.includes('%') ? '3%' : pick.metrics.dividendYield,
      roe: pick.metrics.roe?.includes('N/A') ? 'N/A' : pick.metrics.roe,
      debtToEquity: pick.metrics.debtToEquity || '1.5'
    }
  }));
}

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
export const maxDuration = 60;

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
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
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

  const prompt = `
    Act as a Senior Wall Street Analyst. The current time in New York is: ${currentTime}.
    Generate a JSON market report using **REAL-TIME** data from Google Search.
    
    **CRITICAL**: Keep searches minimal to avoid timeout. Focus on speed and accuracy.

    **Part 1: REDDIT TRENDS**
    - Search "wallstreetbets reddit trending stocks today hot" 
    - Return TOP 10 most discussed tickers (sorted by mentions, highest first)
    - For each: symbol, name, mentions (estimate), sentiment (Bullish/Bearish/Neutral), sentimentScore (0-100), discussionSummary (one sentence), volumeChange, keywords (5 words), recentNews (array of 3 recent headlines)
    
    CRITICAL: Must return EXACTLY 10 stocks with complete data.
    
    For recentNews field:
    - Search "{SYMBOL} stock news today" for the TOP 3 stocks only (to save time)
    - Return 3 most recent headlines (last 24 hours preferred)
    - Each headline should be concise (max 70 characters)
    - Format: ["Headline 1", "Headline 2", "Headline 3"]
    - For stocks 4-10, recentNews can be empty array []
    
    **Part 2: MARKET NEWS**
    - Search "breaking financial news today"
    - Return 5 news items from last 6 hours
    - For each: title, source, url, timestamp, summary (one sentence), impact (Critical/Normal)

    **Part 3: VALUE STOCKS - FUNDAMENTALS SCREENER**
    
    CRITICAL: Return EXACTLY 3 stocks with COMPLETE data. NO "N/A" for price, P/E, FCF, or market cap.
    
    STEP 1: Pick 3 stocks from this RELIABLE list:
    - VZ (Verizon Communications)
    - PFE (Pfizer)
    - CVX (Chevron)
    - XOM (Exxon Mobil)
    - JNJ (Johnson & Johnson)
    - KO (Coca-Cola)
    - PG (Procter & Gamble)
    - IBM (IBM)
    
    STEP 2: For EACH stock, search:
    - "{TICKER} stock price today nasdaq"
    - "{TICKER} PE ratio market cap"
    - "{TICKER} dividend yield free cash flow"
    
    MANDATORY FORMAT (NO DEVIATIONS):
    - price: "$XX.XX" (e.g., "$42.15") - MUST have dollar sign and price
    - peRatio: "8.5" (just number, NO "x" or "LTM" suffix)
    - freeCashFlow: "$18B" (MUST have $ and B/M, NOT "Strong" or "N/A")
    - marketCap: "$177B" (MUST have $ and B)
    - dividendYield: "6.5%" (MUST have %)
    
    If search fails, use fallbacks:
    - price: estimate from recent trading
    - peRatio: "15"
    - freeCashFlow: "$5B"
    - marketCap: "$100B"

    **CRITICAL RULES:**
    1. NO FABRICATION - Real data only
    2. If data unavailable, use fallback values above (NOT "N/A")
    3. Keep it FAST - minimal searches
    4. Format exactly as specified

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
         { 
           "symbol": "GME", 
           "name": "GameStop", 
           "mentions": 7500, 
           "sentiment": "Bullish", 
           "sentimentScore": 88, 
           "discussionSummary": "Renewed interest in short squeeze potential and upcoming earnings", 
           "volumeChange": "+45% vs Avg", 
           "keywords": ["SQUEEZE", "MOON", "EARNINGS", "APES", "DIAMONDHANDS"],
           "recentNews": [
             "GameStop reports Q4 earnings beat expectations",
             "Short interest increases to 20% of float",
             "Ryan Cohen increases stake by 2M shares"
           ]
         },
         { 
           "symbol": "AMC", 
           "name": "AMC Entertainment", 
           "mentions": 5200,
           "sentiment": "Bullish",
           "sentimentScore": 82,
           "discussionSummary": "...",
           "volumeChange": "+38% vs Avg",
           "keywords": ["MOVIES", "SHORTS", "APES", "HOLD", "SQUEEZE"],
           "recentNews": [
             "AMC announces new streaming partnership",
             "Box office revenue up 15% this quarter",
             "Debt reduction plan announced"
           ]
         },
         { 
           "symbol": "TSLA", 
           "name": "Tesla", 
           "mentions": 4800,
           "sentiment": "Neutral",
           "sentimentScore": 70,
           "discussionSummary": "...",
           "volumeChange": "+18% vs Avg",
           "keywords": ["EV", "MUSK", "CYBERTRUCK", "FSD", "DELIVERY"],
           "recentNews": [
             "Tesla delivery numbers exceed expectations",
             "FSD beta expands to more markets",
             "Cybertruck production ramps up"
           ]
         },
         { "symbol": "NVDA", "name": "NVIDIA", "mentions": 4200, "sentiment": "Bullish", "sentimentScore": 92, "discussionSummary": "...", "volumeChange": "+28% vs Avg", "keywords": ["AI", "CHIPS", "DATACENTER", "BLACKWELL", "CALLS"], "recentNews": [] },
         { "symbol": "PLTR", "name": "Palantir", "mentions": 3800, "sentiment": "Bullish", "sentimentScore": 85, "discussionSummary": "...", "volumeChange": "+30% vs Avg", "keywords": ["AI", "GOVERNMENT", "DATA", "MOON", "DEFENSE"], "recentNews": [] },
         { "symbol": "AMD", "name": "AMD", "mentions": 3200, "sentiment": "Bullish", "sentimentScore": 80, "discussionSummary": "...", "volumeChange": "+22% vs Avg", "keywords": ["CHIPS", "AI", "DATACENTER", "NVDA", "COMPETITOR"], "recentNews": [] },
         { "symbol": "AAPL", "name": "Apple", "mentions": 2800, "sentiment": "Neutral", "sentimentScore": 68, "discussionSummary": "...", "volumeChange": "+10% vs Avg", "keywords": ["IPHONE", "SERVICES", "VISION", "DIVIDEND", "BUFFETT"], "recentNews": [] },
         { "symbol": "MSFT", "name": "Microsoft", "mentions": 2400, "sentiment": "Bullish", "sentimentScore": 87, "discussionSummary": "...", "volumeChange": "+15% vs Avg", "keywords": ["AI", "AZURE", "CLOUD", "COPILOT", "OPENAI"], "recentNews": [] },
         { "symbol": "META", "name": "Meta Platforms", "mentions": 2000, "sentiment": "Bullish", "sentimentScore": 83, "discussionSummary": "...", "volumeChange": "+17% vs Avg", "keywords": ["AI", "METAVERSE", "ZUCK", "ADS", "GROWTH"], "recentNews": [] },
         { "symbol": "GOOGL", "name": "Alphabet", "mentions": 1800, "sentiment": "Neutral", "sentimentScore": 72, "discussionSummary": "...", "volumeChange": "+12% vs Avg", "keywords": ["SEARCH", "AI", "GEMINI", "CLOUD", "ADS"], "recentNews": [] }
      ],
      "news": [ 
        { "title": "...", "source": "Bloomberg", "url": "...", "timestamp": "2h ago", "summary": "...", "impact": "Critical" }
      ],
      "picks": [ 
         { "symbol": "VZ", "name": "Verizon Communications Inc.", "price": "$42.15", "sector": "Telecommunications", "metrics": { "peRatio": "8.5", "roe": "15%", "debtToEquity": "1.8", "freeCashFlow": "$18B", "marketCap": "$177B", "dividendYield": "6.5%" }, "technicalLevels": { "support": "41.00", "resistance": "44.00", "stopLoss": "40.50" }, "catalyst": "5G network expansion", "analysis": "Value play with strong dividend", "conviction": "Strong Buy" }
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

    // Get REAL market sentiment instead of Gemini's inconsistent data
    console.log('📊 Fetching real Fear & Greed Index...');
    const realSentiment = await getFearGreedIndex();
    console.log(`✅ Sentiment: ${realSentiment.score} (${realSentiment.label})`);

    // Clean fundamentals data to fix N/A issues
    const cleanedPicks = cleanFundamentals(rawData.picks || []);

    const dashboardData = {
      marketIndices: rawData.marketIndices || [],
      marketSentiment: realSentiment, // Use real data instead of Gemini's made-up sentiment
      sectorRotation: rawData.sectorRotation || [],
      redditTrends: rawData.redditTrends || [],
      news: rawData.news || [],
      picks: cleanedPicks,
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
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
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
          'Cache-Control': 'public, s-maxage=900',
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
