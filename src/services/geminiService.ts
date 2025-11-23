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

export const fetchMarketDashboard = async (): Promise<DashboardData> => {
  // Access key via process.env - ensured by next.config.mjs
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please configure process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash';
  
  const currentTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

  const prompt = `
    Act as a Senior Hedge Fund Analyst. The current time in New York is: ${currentTime}.
    Generate a JSON market report using **REAL-TIME** data from Google Search.
    
    **CRITICAL INSTRUCTION**: You must use the 'googleSearch' tool to find the absolute latest data from the last 24 hours.

    **Part 1: REDDIT MOMENTUM ("The Hype")**
    - Search r/wallstreetbets, r/investing, and Twitter/X for the **single most discussed stock ticker** right now.
    - Focus on **VOLUME** of discussion, not just price.
    - Return the Top 1 "King" ticker and 4 "Runner Ups".
    - 'sentiment': 'Bullish', 'Bearish', or 'Neutral'.
    - 'keywords': 5 slang words or themes driving the chat (e.g. "YOLO", "Gamma Squeeze", "Earnings Miss").

    **Part 2: CRITICAL NEWS WIRE ("The Truth")**
    - Search for **Breaking Financial News** from: Bloomberg, Reuters, Financial Times, CNBC.
    - **Timeframe**: Last 6 hours only.
    - **STRICT FILTER**: Do NOT include "Top 5 stocks to buy" or "Opinion" articles. I want HARD NEWS (Central Banks, M&A, Earnings, Geopolitics).
    - 'impact': Mark as 'Critical' only if it affects the broader market (S&P 500 movement).

    **Part 3: DEEP VALUE PICKS ("The Alpha")**
    - Search for companies with **strong fundamentals** (Low P/E, High FCF) that are currently trading at a discount.
    - **Avoid**: Meme stocks in this section.
    - **Metrics**: You must find the ACTUAL current P/E ratio and Dividend Yield.
    - 'analysis': A concise, professional reason why this is a buy.

    **Output JSON Structure (No Markdown)**:
    {
      "marketIndices": [ { "name": "S&P 500", "value": "...", "change": "...", "trend": "Up" } ],
      "marketSentiment": { "score": 75, "label": "Greed", "primaryDriver": "..." },
      "sectorRotation": [ { "name": "Energy", "performance": "Bullish", "change": "+1.5%" } ],
      "redditTrends": [ 
         { "symbol": "NVDA", "name": "NVIDIA", "mentions": 5000, "sentiment": "Bullish", "sentimentScore": 90, "discussionSummary": "...", "keywords": ["AI", "Blackwell", "Calls"] } 
      ],
      "news": [ { "title": "...", "source": "Bloomberg", "url": "...", "timestamp": "10m ago", "summary": "...", "impact": "Critical" } ],
      "picks": [ 
         { "symbol": "T", "name": "AT&T", "price": "$18.50", "sector": "Telecom", "metrics": { "peRatio": "6.2", "marketCap": "130B", "dividendYield": "6.1%", "pegRatio": "0.9", "earningsDate": "...", "range52w": "...", "rsi": 40, "shortFloat": "1%", "beta": "0.6", "relativeVolume": "0.9" }, "technicalLevels": { "support": "18.00", "resistance": "19.50", "stopLoss": "17.80" }, "catalyst": "Free Cash Flow Beat", "analysis": "...", "conviction": "Strong Buy" } 
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1, // Low temperature for factual accuracy
      },
    });

    const text = response.text || "";
    const rawData = extractJSON(text);

    return {
      marketIndices: rawData.marketIndices || [],
      marketSentiment: rawData.marketSentiment || { score: 50, label: "Neutral", primaryDriver: "Data Unavailable" },
      sectorRotation: rawData.sectorRotation || [],
      redditTrends: rawData.redditTrends || [],
      news: rawData.news || [],
      picks: rawData.picks || [],
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Performs a Deep Dive Financial X-Ray on a specific ticker.
 */
export const analyzeStock = async (symbol: string): Promise<StockAnalysis> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Cannot perform deep dive analysis.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash';

  const prompt = `
    Act as a CFA (Chartered Financial Analyst). I need a deep "Financial X-Ray" on: ${symbol}.
    You MUST use Google Search to find the LATEST available financial data and analyst estimates.
    
    **Instructions**:
    1. Search for "current share price ${symbol}".
    2. Search for "Analyst Price Target ${symbol}" or "Fair Value Estimate ${symbol}".
    3. Search for "${symbol} financial ratios": EV/EBITDA, Forward P/E, Price to Book, ROIC, Debt-to-Equity.
    4. Search for "${symbol} institutional ownership".

    **Output Format (Strict JSON)**:
    {
      "symbol": "${symbol}",
      "name": "Full Company Name",
      "currentPrice": "$...",
      "fairValue": "$...",
      "upside": "...",
      "valuation": {
        "evEbitda": "...",
        "peFwd": "...",
        "priceToBook": "...",
        "rating": "Undervalued" | "Fair" | "Overvalued"
      },
      "health": {
        "roic": "...",
        "debtToEquity": "...",
        "currentRatio": "...",
        "rating": "Strong" | "Stable" | "Weak"
      },
      "growth": {
        "revenueGrowth": "...",
        "earningsGrowth": "..."
      },
      "institutional": {
        "instOwnership": "...",
        "recentTrends": "..."
      },
      "verdict": "Two sentence professional summary."
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