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
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please configure process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash';
  
  const currentTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

  const prompt = `
    Act as a Senior Hedge Fund Trader. The current time in New York is: ${currentTime}.
    Generate a comprehensive JSON market intelligence report using REAL-TIME data from Google Search.
    
    **Part 0: MARKET PULSE & SENTIMENT (LIVE DATA)**
    - Use Google Search to get current live values for: S&P 500, NASDAQ, VIX, Bitcoin, Gold.
    - **Fear & Greed**: Search for "CNN Fear and Greed Index current score" and use that exact value.
    - **Sector Rotation**: Identify 3 key sectors (e.g. "Tech", "Energy") and their performance TODAY.

    **Part 1: REDDIT "KING OF THE HILL" (LIVE TRENDS)**
    - Search r/wallstreetbets, r/stocks, and r/investing for the #1 most discussed stock *in the last 12 hours*.
    - Identify 4 runners-up.
    - 'keywords': Extract 6-8 distinct, one-word "Matrix Rain" keywords related to the *current* discussion.

    **Part 2: DAY TRADER "ALPHA SCAN" (3 Stocks)**
    - Search for 3 stocks with strong technical/fundamental setups TODAY.
    - **Trader Metrics Required** (Use search to estimate):
        - 'rsi': 14-day RSI.
        - 'shortFloat': Short Interest %.
        - 'relativeVolume': RVOL.
        - 'beta': Volatility.
        - 'pegRatio': PEG Ratio.
        - 'earningsDate': Next earnings date.
        - 'catalyst': What is the immediate driver? (e.g. "Earnings Tomorrow", "FDA Approval").
        - 'technicalLevels': Immediate Support and Resistance.

    **Part 3: NEWS WIRE**
    - Search for 3-4 Critical Hard News stories from the *last 6 hours*.
    - **URL RULE**: If you cannot find a direct link, construct a google search link: "https://www.google.com/search?q=Headline+Here".
    - **TIMESTAMP**: Relative time (e.g. "12m ago").

    **Output JSON Format**:
    {
      "marketIndices": [ { "name": "S&P 500", "value": "5,200.00", "change": "+0.5%", "trend": "Up" } ],
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
      marketSentiment: rawData.marketSentiment || { score: 50, label: "Neutral", primaryDriver: "Data Unavailable" },
      sectorRotation: rawData.sectorRotation || [],
      redditTrends: rawData.redditTrends || [],
      news: rawData.news || [],
      picks: rawData.picks || [],
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
    2. Search for "Analyst Price Target ${symbol}" or "Fair Value Estimate ${symbol}" (Morningstar/CFRA).
    3. Search for "${symbol} financial ratios": EV/EBITDA, Forward P/E, Price to Book, ROIC, Debt-to-Equity, Current Ratio.
    4. Search for "${symbol} institutional ownership".

    **Required Metrics**:
    - **Valuation**: Current EV/EBITDA, Forward P/E, Price to Book.
    - **Fair Value**: A specific dollar figure estimate based on consensus.
    - **Quality/Health**: ROIC, Debt-to-Equity, Current Ratio.
    - **Institutional**: What are big money managers doing? (Buying/Selling/Holding).

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