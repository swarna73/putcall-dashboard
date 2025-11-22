
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
      volumeChange: "+45%"
    },
    { 
      symbol: "PLTR", 
      name: "Palantir", 
      mentions: 8200, 
      sentiment: "Bullish", 
      sentimentScore: 88, 
      discussionSummary: "New government defense contracts driving massive retail volume.",
      volumeChange: "+12%"
    },
    { 
      symbol: "TSLA", 
      name: "Tesla Inc", 
      mentions: 6100, 
      sentiment: "Bearish", 
      sentimentScore: 35, 
      discussionSummary: "Concerns over margin compression and slowing delivery growth.",
      volumeChange: "-5%"
    },
    { 
      symbol: "AMD", 
      name: "Advanced Micro Devices", 
      mentions: 4300, 
      sentiment: "Bullish", 
      sentimentScore: 72, 
      discussionSummary: "Gaining market share in data center CPU space against competitors.",
      volumeChange: "+8%" 
    },
    { 
      symbol: "GME", 
      name: "GameStop", 
      mentions: 3800, 
      sentiment: "Neutral", 
      sentimentScore: 50, 
      discussionSummary: "Low volume consolidation awaiting next major catalyst.",
      volumeChange: "0%"
    }
  ],
  news: [
    { 
      title: "Fed Signals Potential Rate Cut in Q3 as Inflation Cools", 
      source: "Bloomberg", 
      url: "#", 
      timestamp: "15m ago", 
      summary: "Federal Reserve officials indicated that recent data supports a shift in policy stance, sparking a rally in small-cap stocks...", 
      impact: "Critical",
      tags: ["Macro", "Fed"]
    },
    { 
      title: "Oil Surge: Brent Crude Tops $90 on Geopolitical Tensions", 
      source: "Reuters", 
      url: "#", 
      timestamp: "45m ago", 
      summary: "Supply chain disruptions in the Middle East have triggered a sharp rally in energy markets, pressuring transport stocks...", 
      impact: "High",
      tags: ["Energy", "Geopolitics"]
    },
    { 
      title: "Tech Sector Earnings: Big Tech Continues to Outperform", 
      source: "CNBC", 
      url: "#", 
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
        range52w: "Near Low" 
      }, 
      analysis: "Foundry business separation unlocks hidden value; trading at book value.", 
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
        range52w: "52w Low" 
      }, 
      analysis: "Oversold territory with robust pipeline resolving patent cliff concerns.", 
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
        range52w: "Mid Range" 
      }, 
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
    await new Promise(resolve => setTimeout(resolve, 800));
    return { ...MOCK_DATA, lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash';
  
  const prompt = `
    Act as a Senior Wall Street Quantitative Analyst. Generate a comprehensive JSON market intelligence report for "PutCall.nl".
    
    **Part 0: MARKET PULSE (Indices)**
    - Get current real-time values for: S&P 500, NASDAQ, VIX, Bitcoin, and Gold.
    - 'trend': 'Up' | 'Down' | 'Flat'.

    **Part 1: REDDIT "KING OF THE HILL" (Hype)**
    - Search r/wallstreetbets, r/stocks. Identify the #1 most discussed stock.
    - Identify 4 runners-up.
    - 'volumeChange': Estimate change in chatter vs yesterday (e.g., "+40%").
    - 'sentiment': 'Bullish', 'Bearish', 'Neutral'.

    **Part 2: DEEP VALUE SCREEN (Alpha)**
    - Search for 3 stocks with STRONG fundamentals that are undervalued.
    - **Data Depth Requirement**: 
        - 'pegRatio': Price/Earnings to Growth. (< 1.0 is ideal).
        - 'earningsDate': Next expected earnings date.
        - 'range52w': Where is price relative to 52w range (e.g., "Near Low", "Breakout", "Mid").
    - 'analysis': Professional thesis.

    **Part 3: NEWS WIRE**
    - 3-4 Critical stories. Hard news only.
    - Add 'tags' (e.g., "Macro", "Geopolitics").

    **Output JSON Format**:
    {
      "marketIndices": [
         { "name": "S&P 500", "value": "5,200", "change": "+0.5%", "trend": "Up" },
         ...
      ],
      "redditTrends": [
        { 
          "symbol": "NVDA", 
          "name": "NVIDIA", 
          "mentions": 5200, 
          "sentiment": "Bullish", 
          "sentimentScore": 92, 
          "discussionSummary": "...",
          "volumeChange": "+20%"
        },
        ...
      ],
      "news": [ ... ],
      "picks": [
        { 
          "symbol": "VZ", 
          "name": "Verizon", 
          "price": "$40.50", 
          "sector": "Telecom",
          "metrics": { 
             "peRatio": "8.5x", 
             "marketCap": "$170B", 
             "dividendYield": "6.5%",
             "pegRatio": "1.2",
             "earningsDate": "Oct 22",
             "range52w": "Near 52w Low"
          }, 
          "analysis": "...", 
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
      marketIndices: rawData.marketIndices || [],
      redditTrends: rawData.redditTrends || [],
      news: rawData.news || [],
      picks: rawData.picks || [],
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API_KEY") || error.message?.includes("403")) {
        return { ...MOCK_DATA, lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    }
    throw error;
  }
};
