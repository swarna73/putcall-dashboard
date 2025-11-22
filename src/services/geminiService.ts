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
    Act as a Senior Financial Data Architect. I need a JSON object representing the current "State of the Market" for a dashboard called PutCall.nl.

    **SECTION 1: REDDIT "KING OF THE HILL"**
    - Search r/wallstreetbets, r/stocks, r/investing, and Twitter/X Finance.
    - Identify the **#1 SINGLE MOST TALKED ABOUT STOCK** right now. This is the "King".
    - Identify 4 runners-up.
    - **Ranking Criteria**: PURELY discussion volume (Mentions).
    - 'discussionSummary': A sharp, professional 1-sentence explanation of the catalyst (e.g., "Stock surging 15% pre-market on rumors of Apple partnership").
    - 'sentimentScore': 0-100 based on tone.

    **SECTION 2: THE GLOBAL WIRE (Critical News)**
    - Fetch 5-7 **BREAKING** headlines from the last 12 hours.
    - **SOURCES**: Reuters, Bloomberg, Financial Times, CNBC, WSJ.
    - **STRICT FILTER**: 
      - NO "5 Stocks to Buy".
      - NO "Opinion" or "Editorial".
      - NO "Motley Fool".
      - **ONLY** Hard News: Earnings, Fed Decisions, Inflation Data, Mergers, Geopolitics.
    - 'impact': 'Critical' (Market Moving) or 'High' (Sector Moving).

    **SECTION 3: DEEP VALUE (The Alpha Box)**
    - Identify 3 stocks that are fundamentally strong but currently undervalued (The "Smart Money" plays).
    - **Criteria**: P/E < 20, Solid Dividend, or Massive Cash Flow.
    - 'metrics': Must provide REAL numbers found in search (e.g. "P/E: 8.4", "Div: 4.2%").
    - 'analysis': "Why buy now?" (e.g. "Trading at book value despite record Q3 earnings").
    - 'conviction': 'Strong Buy' or 'Buy'.

    **Output Format (Strict JSON)**:
    {
      "redditTrends": [
        { 
          "symbol": "NVDA", 
          "name": "NVIDIA", 
          "mentions": 4200, 
          "sentiment": "Bullish", 
          "sentimentScore": 88, 
          "discussionSummary": "Blackwell chip delays debunked by CEO, sending stock to ATH." 
        },
        ... (4 runners up)
      ],
      "news": [
        { 
          "title": "ECB Cuts Rates by 25bps as Inflation cools", 
          "source": "Bloomberg", 
          "url": "...", 
          "timestamp": "15m ago", 
          "summary": "...", 
          "impact": "Critical" 
        }
      ],
      "picks": [
        { 
          "symbol": "C", 
          "name": "Citigroup", 
          "price": "$62.50", 
          "sector": "Financials",
          "metrics": { "peRatio": "9.1x", "marketCap": "$118B", "dividendYield": "3.4%" }, 
          "analysis": "Restructuring ahead of schedule; trading well below tangible book value.", 
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
        temperature: 0.1, // Keep it factual
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