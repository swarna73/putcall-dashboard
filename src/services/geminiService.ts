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

// --- MOCK DATA FOR SIMULATION / FALLBACK ---
const MOCK_DATA: DashboardData = {
  redditTrends: [
    { 
      symbol: "NVDA", 
      name: "NVIDIA Corp", 
      mentions: 15420, 
      sentiment: "Bullish", 
      sentimentScore: 94, 
      discussionSummary: "Hype exploding around Blackwell chip benchmarks crushing expectations." 
    },
    { symbol: "PLTR", name: "Palantir", mentions: 8200, sentiment: "Bullish", sentimentScore: 88, discussionSummary: "New government defense contracts driving massive retail volume." },
    { symbol: "TSLA", name: "Tesla Inc", mentions: 6100, sentiment: "Bearish", sentimentScore: 35, discussionSummary: "Concerns over margin compression and slowing delivery growth." },
    { symbol: "AMD", name: "Advanced Micro Devices", mentions: 4300, sentiment: "Bullish", sentimentScore: 72, discussionSummary: "Gaining market share in data center CPU space against competitors." },
    { symbol: "GME", name: "GameStop", mentions: 3800, sentiment: "Neutral", sentimentScore: 50, discussionSummary: "Low volume consolidation awaiting next major catalyst." }
  ],
  news: [
    { 
      title: "Fed Signals Potential Rate Cut in Q3 as Inflation Cools", 
      source: "Bloomberg", 
      url: "#", 
      timestamp: "15m ago", 
      summary: "Federal Reserve officials indicated that recent data supports a shift in policy stance, sparking a rally in small-cap stocks...", 
      impact: "Critical" 
    },
    { 
      title: "Oil Surge: Brent Crude Tops $90 on Geopolitical Tensions", 
      source: "Reuters", 
      url: "#", 
      timestamp: "45m ago", 
      summary: "Supply chain disruptions in the Middle East have triggered a sharp rally in energy markets, pressuring transport stocks...", 
      impact: "High" 
    },
    { 
      title: "Tech Sector Earnings: Big Tech Continues to Outperform", 
      source: "CNBC", 
      url: "#", 
      timestamp: "2h ago", 
      summary: "AI-driven CAPEX spending continues to lead the market higher despite broader economic concerns...", 
      impact: "Medium" 
    }
  ],
  picks: [
    { 
      symbol: "INTC", 
      name: "Intel Corp", 
      price: "$30.50", 
      sector: "Technology", 
      metrics: { peRatio: "12.5x", marketCap: "$130B", dividendYield: "3.1%" }, 
      analysis: "Foundry business separation unlocks hidden value; trading at book value.", 
      conviction: "Strong Buy" 
    },
    { 
      symbol: "PFE", 
      name: "Pfizer", 
      price: "$28.10", 
      sector: "Healthcare", 
      metrics: { peRatio: "9.2x", marketCap: "$158B", dividendYield: "5.8%" }, 
      analysis: "Oversold territory with robust pipeline resolving patent cliff concerns.", 
      conviction: "Buy" 
    },
    { 
      symbol: "F", 
      name: "Ford Motor Co", 
      price: "$12.15", 
      sector: "Consumer Cyclical", 
      metrics: { peRatio: "6.8x", marketCap: "$48B", dividendYield: "4.9%" }, 
      analysis: "EV division losses narrowing while legacy truck sales generate massive FCF.", 
      conviction: "Strong Buy" 
    }
  ],
  lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export const fetchMarketDashboard = async (): Promise<DashboardData> => {
  const apiKey = process.env.API_KEY;

  // 1. Check for API Key. If missing, return Mock Data (Simulation Mode).
  if (!apiKey) {
    console.warn("Gemini API Key missing - Returning Simulation Data for preview.");
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));
    return { ...MOCK_DATA, lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash';
  
  const prompt = `
    Act as a Wall Street Quantitative Analyst. Generate a JSON market intelligence report for "PutCall.nl".

    **1. REDDIT "KING OF THE HILL" (Hype Tracker)**
    - Search r/wallstreetbets, r/stocks, and r/investing.
    - **IDENTIFY THE #1 MOST DISCUSSED STOCK** right now. This is the "Top Ticker".
    - Identify 4 runners-up based purely on discussion volume.
    - **Constraint**: 'sentiment' must be 'Bullish', 'Bearish', or 'Neutral'.
    - 'discussionSummary': A concise, professional sentence explaining the *exact* catalyst.
    - 'sentimentScore': Integer 0-100.

    **2. CRITICAL NEWS WIRE (The Feed)**
    - Search for **BREAKING** financial news from the last 6-12 hours.
    - **SOURCES**: Reuters, Bloomberg, FT, WSJ, CNBC.
    - **STRICT FILTER**: Exclude "Opinion", "Motley Fool", "Zacks", "5 Stocks to Buy". ONLY Hard News (Earnings, Macro, Fed, M&A).
    - 'impact': 'Critical' (Market Moving) or 'High' (Sector Moving).

    **3. DEEP VALUE SCREEN (The Alpha Box)**
    - Search for 3 stocks with STRONG fundamentals that are undervalued.
    - **Criteria**: P/E < 20, Positive FCF, Healthy Dividend.
    - 'metrics': Real data (e.g., "P/E: 8.4", "Div: 4.2%", "FCF: $2B").
    - 'analysis': Professional one-liner thesis.
    - 'conviction': 'Strong Buy' or 'Buy'.

    **Output Format (JSON Only)**:
    {
      "redditTrends": [
        { 
          "symbol": "NVDA", 
          "name": "NVIDIA", 
          "mentions": 5200, 
          "sentiment": "Bullish", 
          "sentimentScore": 92, 
          "discussionSummary": "Blackwell demand rumors outpacing supply forecasts." 
        },
        ... (4 more)
      ],
      "news": [
        { 
          "title": "Fed Chair Powell Hints at Pause", 
          "source": "Bloomberg", 
          "url": "...", 
          "timestamp": "20m ago", 
          "summary": "...", 
          "impact": "Critical" 
        }
      ],
      "picks": [
        { 
          "symbol": "VZ", 
          "name": "Verizon", 
          "price": "$40.50", 
          "sector": "Telecom",
          "metrics": { "peRatio": "8.5x", "marketCap": "$170B", "dividendYield": "6.5%" }, 
          "analysis": "Yield spreads at historical highs relative to treasuries.", 
          "conviction": "Strong Buy" 
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
      redditTrends: rawData.redditTrends || [],
      news: rawData.news || [],
      picks: rawData.picks || [],
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // If API key is invalid or quota exceeded, fallback to mock data so app doesn't crash
    if (error.message?.includes("API_KEY") || error.message?.includes("403")) {
        console.warn("API Key invalid or missing. Swapping to Simulation Mode.");
        return { ...MOCK_DATA, lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    }
    throw error;
  }
};