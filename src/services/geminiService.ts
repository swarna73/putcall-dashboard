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
    // This handles cases where the model adds text *after* the JSON object
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
  // Initialize Gemini client INSIDE the function to ensure it uses the latest API Key
  // available in process.env.API_KEY at the time of execution.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash';
  
  const prompt = `
    Act as a Wall Street quantitative analyst. I need a JSON market intelligence report.
    
    1. **Reddit Momentum (The Hype)**: 
       - Search r/wallstreetbets, r/stocks, and r/investing for the top 5 tickers being discussed *right now*. 
       - Focus on volume of discussion.
       - 'sentiment' must be 'Bullish', 'Bearish', or 'Neutral'.
       - 'discussionSummary': One punchy sentence explaining the driver (e.g., "Short squeeze speculation after earnings miss").

    2. **Critical News Wire (The Truth)**: 
       - Search specifically for BREAKING financial news from the last 6 hours.
       - **MANDATORY SOURCES**: Reuters, Bloomberg, Financial Times, WSJ, CNBC.
       - **FILTER**: Strictly filter out "Opinion", "Editorial", or "5 Stocks to buy" articles. I only want HARD NEWS (Central Banks, Earnings, Geopolitics, Macro Data).
       - 'impact': 'Critical' for macro events (Fed, War, Inflation), 'High' for major company news.

    3. **Smart "Deep Value" Picks (The Alpha)**: 
       - Search for companies with STRONG fundamentals that are currently undervalued.
       - **Criteria**: P/E Ratio < 25, Positive Free Cash Flow, Solid Dividend or Growth.
       - **EXCLUDE**: Meme stocks, Unprofitable tech.
       - 'metrics': Must include specific numbers found in search (e.g., "P/E: 12.4", "Div: 3.1%", "FCF: $2B").
       - 'analysis': Professional analyst tone. Why is this a buy *now*?
       - 'conviction': 'Strong Buy' or 'Buy'.

    **Output Format (Strict JSON)**:
    Provide ONLY the JSON object. Do not add any intro or outro text.
    {
      "redditTrends": [
        { "symbol": "NVDA", "name": "NVIDIA", "mentions": 4500, "sentiment": "Bullish", "sentimentScore": 92, "discussionSummary": "Anticipation of Blackwell chip details driving volume." }
      ],
      "news": [
        { "title": "Fed Signals Pause...", "source": "Bloomberg", "url": "https://...", "timestamp": "20m ago", "summary": "...", "impact": "Critical" }
      ],
      "picks": [
        { 
          "symbol": "VALE", 
          "name": "Vale S.A.", 
          "price": "$12.50", 
          "sector": "Materials",
          "metrics": { "peRatio": "6.5x", "marketCap": "$58B", "dividendYield": "9.2%" }, 
          "analysis": "Trading at near-historic low multiples despite robust iron ore demand forecasts.", 
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
        temperature: 0.1, // Lower temperature for more factual adherence and strict format
      },
    });

    const text = response.text || "";
    const rawData = extractJSON(text);

    // Basic validation to ensure arrays exist
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