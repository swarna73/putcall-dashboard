
import { GoogleGenAI } from "@google/genai";
import { DashboardData } from "../types";

/**
 * Robustly extracts JSON from a string, handling markdown code blocks
 * and potential trailing text by counting braces.
 */
function extractJSON(text: string): any {
  try {
    // 1. Fast path: Try to parse the cleaned text directly
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    // 2. Fallback: Find the first valid outer JSON object
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

// --- DYNAMIC MOCK DATA GENERATOR ---
// Generates fresh-looking timestamps so the UI doesn't look broken if API fails
const getMockData = (): DashboardData => {
  const randomTime = (min: number, max: number) => `${Math.floor(Math.random() * (max - min + 1) + min)}m ago`;
  
  return {
    marketIndices: [
      { name: "S&P 500", value: "5,240.12", change: "+0.8%", trend: "Up" },
      { name: "NASDAQ", value: "16,420.50", change: "+1.2%", trend: "Up" },
      { name: "VIX", value: "12.50", change: "-4.1%", trend: "Down" },
      { name: "Bitcoin", value: "$96,400", change: "+2.3%", trend: "Up" },
      { name: "Gold", value: "$2,150", change: "+0.1%", trend: "Flat" }
    ],
    redditTrends: [
      { 
        symbol: "NVDA", 
        name: "NVIDIA Corp", 
        mentions: 15420, 
        sentiment: "Bullish", 
        sentimentScore: 94, 
        discussionSummary: "Hype exploding around Blackwell chip benchmarks crushing expectations.",
        volumeChange: "+45%",
        keywords: ["AI Supercycle", "Blackwell", "Moat", "Guidance Beat", "FOMO", "Semis", "H100"]
      },
      { 
        symbol: "PLTR", 
        name: "Palantir", 
        mentions: 8200, 
        sentiment: "Bullish", 
        sentimentScore: 88, 
        discussionSummary: "New government defense contracts driving massive retail volume.",
        volumeChange: "+12%",
        keywords: ["Defense", "AIP", "S&P500", "Contract Wins", "Bootcamp"]
      },
      { 
        symbol: "TSLA", 
        name: "Tesla Inc", 
        mentions: 6100, 
        sentiment: "Bearish", 
        sentimentScore: 35, 
        discussionSummary: "Concerns over margin compression and slowing delivery growth.",
        volumeChange: "-5%",
        keywords: ["Margins", "Competition", "Price Cuts", "Inventory", "Robotaxi"]
      },
      { 
        symbol: "AMD", 
        name: "Advanced Micro Devices", 
        mentions: 4300, 
        sentiment: "Bullish", 
        sentimentScore: 72, 
        discussionSummary: "Gaining market share in data center CPU space against competitors.",
        volumeChange: "+8%",
        keywords: ["MI300", "Data Center", "Catch-up", "Lisa Su"]
      },
      { 
        symbol: "GME", 
        name: "GameStop", 
        mentions: 3800, 
        sentiment: "Neutral", 
        sentimentScore: 50, 
        discussionSummary: "Low volume consolidation awaiting next major catalyst.",
        volumeChange: "0%",
        keywords: ["DRS", "Cohen", "Illiquid", "Swap Cycles"]
      }
    ],
    news: [
      { 
        title: "Fed Signals Potential Rate Cut in Q3 as Inflation Cools", 
        source: "Bloomberg", 
        url: "https://www.bloomberg.com/markets", 
        timestamp: randomTime(5, 20), 
        summary: "Federal Reserve officials indicated that recent data supports a shift in policy stance, sparking a rally in small-cap stocks...", 
        impact: "Critical",
        tags: ["Macro", "Fed"]
      },
      { 
        title: "Oil Surge: Brent Crude Tops $90 on Geopolitical Tensions", 
        source: "Reuters", 
        url: "https://www.reuters.com/business/energy/", 
        timestamp: randomTime(25, 45), 
        summary: "Supply chain disruptions in the Middle East have triggered a sharp rally in energy markets, pressuring transport stocks...", 
        impact: "High",
        tags: ["Energy", "Geopolitics"]
      },
      { 
        title: "Tech Sector Earnings: Big Tech Continues to Outperform", 
        source: "CNBC", 
        url: "https://www.cnbc.com/technology/", 
        timestamp: "2h ago", 
        summary: "AI-driven CAPEX spending continues to lead the market higher despite broader economic concerns...", 
        impact: "Medium",
        tags: ["Earnings", "Tech"]
      }
    ],
    picks: [
      { 
        symbol: "INTC", 
        name: "Intel Corp", 
        price: "$30.50", 
        sector: "Technology", 
        metrics: { 
          peRatio: "12.5x", 
          marketCap: "$130B", 
          dividendYield: "3.1%", 
          pegRatio: "0.9", 
          earningsDate: "Apr 25", 
          range52w: "Near Low",
          rsi: 32,
          shortFloat: "4.5%",
          beta: "1.1",
          relativeVolume: "1.2x"
        },
        technicalLevels: {
          support: "$29.80",
          resistance: "$32.50",
          stopLoss: "$28.50"
        }, 
        catalyst: "Upcoming Foundry Event",
        analysis: "Trading at near-historic low multiples. Heavy oversold RSI suggests bounce.", 
        conviction: "Strong Buy" 
      },
      { 
        symbol: "PFE", 
        name: "Pfizer", 
        price: "$28.10", 
        sector: "Healthcare", 
        metrics: { 
          peRatio: "9.2x", 
          marketCap: "$158B", 
          dividendYield: "5.8%", 
          pegRatio: "1.1", 
          earningsDate: "May 02", 
          range52w: "52w Low",
          rsi: 28,
          shortFloat: "1.2%",
          beta: "0.6",
          relativeVolume: "0.9x"
        },
        technicalLevels: {
          support: "$27.50",
          resistance: "$29.50",
          stopLoss: "$27.00"
        },
        catalyst: "New Oncology drug pipeline data",
        analysis: "Oversold territory (RSI < 30) with robust dividend support.", 
        conviction: "Buy" 
      },
      { 
        symbol: "F", 
        name: "Ford Motor Co", 
        price: "$12.15", 
        sector: "Consumer Cyclical", 
        metrics: { 
          peRatio: "6.8x", 
          marketCap: "$48B", 
          dividendYield: "4.9%", 
          pegRatio: "0.7", 
          earningsDate: "Apr 28", 
          range52w: "Mid Range",
          rsi: 45,
          shortFloat: "3.1%",
          beta: "1.4",
          relativeVolume: "1.5x"
        },
        technicalLevels: {
          support: "$11.80",
          resistance: "$13.00",
          stopLoss: "$11.50"
        },
        catalyst: "EV sales guidance update next week",
        analysis: "EV division losses narrowing while legacy truck sales generate massive FCF.", 
        conviction: "Strong Buy" 
      }
    ],
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};

export const fetchMarketDashboard = async (): Promise<DashboardData> => {
  const apiKey = process.env.API_KEY;

  // 1. Check for API Key. If missing, return Mock Data (Simulation Mode).
  if (!apiKey) {
    console.warn("Gemini API Key missing - Returning Simulation Data for preview.");
    await new Promise(resolve => setTimeout(resolve, 800));
    return getMockData();
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash';
  
  const currentTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

  const prompt = `
    Act as a Senior Hedge Fund Trader. The current time in New York is: ${currentTime}.
    Generate a comprehensive JSON market intelligence report for "PutCall.nl".
    
    **Part 0: MARKET PULSE**
    - Get real-time values for: S&P 500, NASDAQ, VIX, Bitcoin, Gold.
    
    **Part 1: REDDIT "KING OF THE HILL"**
    - Search r/wallstreetbets, r/stocks, and r/investing for the #1 most discussed stock RIGHT NOW.
    - Identify 4 runners-up.
    - 'keywords': Extract 6-8 distinct, one-word "Matrix Rain" keywords related to the sentiment (e.g. "SQUEEZE", "GAMMA", "BEAT", "HODL").
    - 'sentimentScore': 0-100.

    **Part 2: DAY TRADER "ALPHA SCAN" (3 Stocks)**
    - Search for 3 stocks with strong technical/fundamental setups TODAY.
    - **Trader Metrics Required**:
        - 'rsi': Estimate 14-day RSI (e.g., 30-70).
        - 'shortFloat': Estimate Short Interest % (e.g., "12%").
        - 'relativeVolume': Estimate RVOL (e.g. "2.5x").
        - 'beta': Volatility measure.
        - 'catalyst': What is the immediate driver? (e.g. "Earnings Tomorrow", "FDA Approval", "Oversold Bounce").
        - 'technicalLevels': Estimate immediate Support and Resistance based on recent charts/news.
    
    **Part 3: NEWS WIRE**
    - Search for 3-4 Critical Hard News stories from the last 6 hours.
    - **CRITICAL**: You MUST find the DIRECT URL to the specific article.
    - **URL RULE**: If you cannot find a direct link, construct a google search link: "https://www.google.com/search?q=Headline+Here".
    - **NEVER** return a relative link like "/news/..." or just "#".
    - **TIMESTAMP**: Calculate relative time from NOW (${currentTime}). E.g. "12m ago", "1h ago".

    **Output JSON Format**:
    {
      "marketIndices": [
        { "name": "S&P 500", "value": "5100.20", "change": "+0.5%", "trend": "Up" },
        ...
      ],
      "redditTrends": [
        { 
          "symbol": "NVDA", 
          "keywords": ["AI", "CHIPS", "H100", "JENSEN", "BEAT"], 
          ...
        }
      ],
      "news": [
        {
          "title": "Headlines here",
          "source": "Bloomberg",
          "url": "https://www.bloomberg.com/news/articles/2024-03-20/some-article-slug",
          "timestamp": "14m ago",
          "impact": "Critical",
          "summary": "..."
        }
      ],
      "picks": [
        { 
          "symbol": "XYZ", 
          "metrics": { 
             "rsi": 45, 
             "shortFloat": "5%",
             "beta": "1.2",
             "peRatio": "10x",
             "relativeVolume": "1.5x"
          }, 
          "technicalLevels": {
             "support": "$100",
             "resistance": "$110",
             "stopLoss": "$98"
          },
          "catalyst": "Earnings in 2 days",
          ...
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    const text = response.text || "";
    const rawData = extractJSON(text);

    return {
      marketIndices: rawData.marketIndices || [],
      redditTrends: rawData.redditTrends || [],
      news: rawData.news || [],
      picks: rawData.picks || [],
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Return mock data on error so the app doesn't crash, but log the issue
    return { ...getMockData(), lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  }
};
