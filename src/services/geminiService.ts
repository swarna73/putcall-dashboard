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

export const fetchMarketDashboard = async (): Promise<DashboardData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash';
  
  const prompt = `
    Act as a Senior Market Analyst. I need a JSON intelligence report for "PutCall.nl".

    **Task 1: REDDIT "KING OF THE HILL" (Hype)**
    - Scan r/wallstreetbets, r/stocks, r/investing for the **Single Most Talked About Stock** right now.
    - Identify 4 other trending tickers.
    - **Strict Criteria**: Rank purely by discussion volume (Mentions).
    - 'sentiment': 'Bullish' or 'Bearish'.
    - 'discussionSummary': "Why is it moving?" (e.g. "Earnings leak," "Short squeeze," "FDA approval").

    **Task 2: THE WIRE (Critical News)**
    - Fetch 6 BREAKING headlines from **Reuters, Bloomberg, CNBC, FT**.
    - **Strict Filter**: NO OPINION PIECES. NO "5 Stocks to Buy". ONLY Hard News (Macro, Earnings, Central Banks, Geopolitics).
    - 'impact': 'Critical' if it affects the whole market, 'High' if it affects a sector.

    **Task 3: DEEP VALUE BOX (Fundamentals)**
    - Identify 3 stocks that are fundamentally strong but currently undervalued.
    - **Criteria**: Low P/E (<15), High Free Cash Flow, or strong Dividend.
    - 'metrics': You MUST find real numbers (P/E, Yield, etc).
    - 'analysis': One short, punchy sentence on why it's a value play.

    **Output JSON Schema**:
    {
      "redditTrends": [
        { "symbol": "TSLA", "name": "Tesla", "mentions": 12500, "sentiment": "Bullish", "sentimentScore": 85, "discussionSummary": "Robotaxi event hype driving call volume." },
        ... (4 more)
      ],
      "news": [
        { "title": "Fed Chair Powell Hints at Rate Cut", "source": "Bloomberg", "url": "...", "timestamp": "10m ago", "summary": "...", "impact": "Critical" }
      ],
      "picks": [
        { 
          "symbol": "PFE", 
          "name": "Pfizer", 
          "price": "$28.50", 
          "sector": "Healthcare",
          "metrics": { "peRatio": "12.4x", "marketCap": "$160B", "dividendYield": "5.8%" }, 
          "analysis": "Trading at multi-year lows despite robust pipeline and massive yield.", 
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
        temperature: 0.1, // Low temp for factual data
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

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
