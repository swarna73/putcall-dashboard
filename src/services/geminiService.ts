import { GoogleGenAI } from "@google/genai";
import { DashboardData, RedditTicker, NewsItem, FundamentalPick } from "../types";

/**
 * Robustly extracts JSON from a string, handling markdown code blocks
 * and potential trailing text by counting braces.
 */
function extractJSON(text: string): any {
  try {
    // 1. Fast path: Try to parse the cleaned text directly
    // Remove markdown code blocks (```json ... ```)
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    // 2. Fallback: Find the first valid outer JSON object using brace counting
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
    
    console.error("JSON Extraction failed. Raw text:", text);
    throw new Error("Could not extract valid JSON object from response");
  }
}

/**
 * Fetches comprehensive market data: Reddit trends, News, and Smart Picks.
 * Uses search grounding to get real-time info.
 */
export const fetchMarketDashboard = async (): Promise<DashboardData> => {
  // 1. Defensive Check: Ensure API Key exists before attempting to use the SDK.
  // This prevents the "API Key must be set" crash and allows the UI to handle the missing key gracefully.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash';
  
  const prompt = `
    Act as a Wall Street quantitative analyst. I need a JSON market intelligence report for "PutCall.nl".
    
    SECTION 1: REDDIT MOMENTUM (The Hype)
    - Search r/wallstreetbets, r/stocks, r/options, and r/investing.
    - Identify the TOP 5 tickers being discussed *right now*.
    - Focus on discussion volume and "most talked about" status.
    - 'sentiment': 'Bullish', 'Bearish', or 'Neutral'.
    - 'sentimentScore': 0-100 (50 is neutral).
    - 'discussionSummary': A punchy, 1-sentence explanation of the driver (e.g. "Gamma squeeze speculation on 0DTE calls").

    SECTION 2: CRITICAL MARKET WIRE (The Truth)
    - Search specifically for BREAKING financial news from the last 6 hours.
    - **MANDATORY SOURCES**: Reuters, Bloomberg, Financial Times, CNBC, WSJ.
    - **FILTER**: EXCLUDE opinions, "Motley Fool", or "5 stocks to buy". ONLY HARD NEWS.
    - Focus on: Central Banks, Earnings Surprises, Geopolitics, Macro Data (CPI/Jobs).
    - 'impact': 'Critical' (Market Moving) or 'High' (Sector Moving).

    SECTION 3: DEEP VALUE ALPHA PICKS (The Fundamentals)
    - Search for 3 companies with STRONG fundamentals that are currently undervalued.
    - **Criteria**: P/E Ratio < 20, Positive Free Cash Flow, Solid Moat.
    - **Exclude**: Meme stocks or pure speculation.
    - 'metrics': Specific stats found (e.g. "P/E: 8.4, Div: 5.2%").
    - 'analysis': Why is this a buy *now*? Professional tone.
    - 'conviction': 'Strong Buy' or 'Buy'.

    **Output Format (Strict JSON)**:
    {
      "redditTrends": [
        { "symbol": "NVDA", "name": "NVIDIA", "mentions": 5200, "sentiment": "Bullish", "sentimentScore": 94, "discussionSummary": "..." }
      ],
      "news": [
        { "title": "...", "source": "Reuters", "url": "...", "timestamp": "15m ago", "summary": "...", "impact": "Critical" }
      ],
      "picks": [
        { 
          "symbol": "...", 
          "name": "...", 
          "price": "$...", 
          "sector": "...", 
          "metrics": { "peRatio": "...", "marketCap": "...", "dividendYield": "..." }, 
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

    const data: DashboardData = {
      redditTrends: rawData.redditTrends || [],
      news: rawData.news || [],
      picks: rawData.picks || [],
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
