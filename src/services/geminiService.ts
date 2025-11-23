
import { GoogleGenAI } from "@google/genai";
import { DashboardData, StockAnalysis } from "../types";

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
    marketSentiment: {
      score: 75,
      label: "Greed",
      primaryDriver: "AI Rally & Rate Cut Hopes"
    },
    sectorRotation: [
      { name: "Tech", performance: "Bullish", change: "+1.8%" },
      { name: "Energy", performance: "Bearish", change: "-0.5%" },
      { name: "Financials", performance: "Neutral", change: "+0.2%" }
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
    Generate a comprehensive JSON market intelligence report.
    
    **Part 0: MARKET PULSE & SENTIMENT**
    - Get real-time values for: S&P 500, NASDAQ, VIX, Bitcoin, Gold.
    - **Fear & Greed**: Estimate the current market sentiment score (0-100) and label (e.g. Extreme Greed) based on recent price action.
    - **Sector Rotation**: Identify 3 key sectors (e.g. "Tech", "Energy") and their current trend.

    **Part 1: REDDIT "KING OF THE HILL"**
    - Search r/wallstreetbets, r/stocks, and r/investing for the #1 most discussed stock RIGHT NOW.
    - Identify 4 runners-up.
    - 'keywords': Extract 6-8 distinct, one-word "Matrix Rain" keywords.

    **Part 2: DAY TRADER "ALPHA SCAN" (3 Stocks)**
    - Search for 3 stocks with strong technical/fundamental setups TODAY.
    - **Trader Metrics Required**:
        - 'rsi': Estimate 14-day RSI.
        - 'shortFloat': Estimate Short Interest %.
        - 'relativeVolume': Estimate RVOL (e.g. "2.5x").
        - 'beta': Volatility.
        - 'pegRatio': PEG Ratio.
        - 'earningsDate': Next earnings date.
        - 'catalyst': What is the immediate driver? (e.g. "Earnings Tomorrow", "FDA Approval").
        - 'technicalLevels': Estimate immediate Support and Resistance.

    **Part 3: NEWS WIRE**
    - Search for 3-4 Critical Hard News stories from the last 6 hours.
    - **URL RULE**: If you cannot find a direct link, construct a google search link: "https://www.google.com/search?q=Headline+Here".
    - **TIMESTAMP**: Relative time (e.g. "12m ago").

    **Output JSON Format**:
    {
      "marketIndices": [ ... ],
      "marketSentiment": {
        "score": 75,
        "label": "Greed",
        "primaryDriver": "AI Optimism"
      },
      "sectorRotation": [
        { "name": "Tech", "performance": "Bullish", "change": "+1.2%" }
      ],
      "redditTrends": [ ... ],
      "news": [ ... ],
      "picks": [ ... ]
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
      marketSentiment: rawData.marketSentiment || { score: 50, label: "Neutral", primaryDriver: "Consolidation" },
      sectorRotation: rawData.sectorRotation || [],
      redditTrends: rawData.redditTrends || [],
      news: rawData.news || [],
      picks: rawData.picks || [],
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return { ...getMockData(), lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  }
};

/**
 * Performs a Deep Dive Financial X-Ray on a specific ticker.
 */
export const analyzeStock = async (symbol: string): Promise<StockAnalysis> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key Missing");

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash';

  const prompt = `
    Act as a CFA (Chartered Financial Analyst). I need a deep "Financial X-Ray" on: ${symbol}.
    Search for the latest live data.

    **Required Metrics**:
    1. **Valuation**: Current EV/EBITDA, Forward P/E, Price to Book.
    2. **Fair Value**: Estimate the "Intrinsic Value" (Fair Value) based on Analyst Consensus or Discounted Cash Flow models found in search.
    3. **Quality/Health**: ROIC (Return on Invested Capital), Debt-to-Equity, Current Ratio.
    4. **Institutional**: What are big money managers doing? (Buying/Selling/Holding).

    **Output Format (Strict JSON)**:
    {
      "symbol": "${symbol}",
      "name": "Full Company Name",
      "currentPrice": "$150.00",
      "fairValue": "$175.00",
      "upside": "+16%",
      "valuation": {
        "evEbitda": "14.2x",
        "peFwd": "22.5x",
        "priceToBook": "5.1x",
        "rating": "Undervalued" | "Fair" | "Overvalued"
      },
      "health": {
        "roic": "24.5%",
        "debtToEquity": "1.2",
        "currentRatio": "1.5",
        "rating": "Strong" | "Stable" | "Weak"
      },
      "growth": {
        "revenueGrowth": "12%",
        "earningsGrowth": "15%"
      },
      "institutional": {
        "instOwnership": "72%",
        "recentTrends": "Net Buying"
      },
      "verdict": "A concise 2 sentence professional summary of why this is a buy/sell/hold based on the numbers."
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
    return extractJSON(text);
  } catch (error) {
    console.error("Deep Dive Error:", error);
    throw error;
  }
};
