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
    Act as a Senior Wall Street Quantitative Analyst. The current time in New York is: ${currentTime}.
    Generate a comprehensive JSON market intelligence report using REAL-TIME data from Google Search.
    
    **Instructions**:
    1. **NO MARKDOWN**: Return raw JSON only. Do not wrap in \`\`\`json.
    2. **REAL-TIME ONLY**: Use the "googleSearch" tool to find data from the last 24 hours.

    **Part 0: MARKET PULSE (LIVE)**
    - Get current values for: S&P 500, NASDAQ, VIX.
    - Search for "CNN Fear and Greed Index current score".
    - Identify 3 key sectors and their % change today.

    **Part 1: REDDIT MOMENTUM (MOST TALKED ABOUT)**
    - Search r/wallstreetbets, r/stocks, and r/options for the **#1 most discussed ticker** right now.
    - Identify 4 runner-up tickers.
    - 'sentiment': Must be 'Bullish', 'Bearish', or 'Neutral'.
    - 'keywords': 5-6 one-word buzzwords associated with the current discussion (e.g. "YOLO", "Squeeze", "Earnings").

    **Part 2: CRITICAL NEWS WIRE**
    - Search for BREAKING financial news from **Reuters, Bloomberg, CNBC, Financial Times** (Last 6 hours).
    - **Filter**: Only Hard News (Macro, Earnings, M&A). No Opinion pieces.
    - **URL**: Provide the direct link found in search.

    **Part 3: DEEP VALUE PICKS (Suggested Stocks)**
    - Search for "undervalued stocks with strong fundamentals today".
    - Select 3 distinct companies.
    - **Metrics**: Find actual P/E, PEG, and Analyst Ratings.
    - **Conviction**: 'Strong Buy' or 'Buy'.

    **Output JSON Structure**:
    {
      "marketIndices": [ { "name": "S&P 500", "value": "5,200.00", "change": "+0.5%", "trend": "Up" } ],
      "marketSentiment": { "score": 75, "label": "Greed", "primaryDriver": "Fed Rate Cuts" },
      "sectorRotation": [ { "name": "Tech", "performance": "Bullish", "change": "+1.2%" } ],
      "redditTrends": [ 
         { "symbol": "NVDA", "name": "NVIDIA", "mentions": 5000, "sentiment": "Bullish", "sentimentScore": 90, "discussionSummary": "Blackwell chip delay rumors debunked", "keywords": ["Blackwell", "Jensen", "AI", "Calls"] } 
      ],
      "news": [ { "title": "...", "source": "Reuters", "url": "...", "timestamp": "10m ago", "summary": "...", "impact": "Critical" } ],
      "picks": [ 
         { "symbol": "VALE", "name": "Vale S.A.", "price": "$10.50", "sector": "Mining", "metrics": { "peRatio": "5.2", "marketCap": "45B", "dividendYield": "9%", "pegRatio": "0.8", "earningsDate": "Oct 25", "range52w": "10-15", "rsi": 35, "shortFloat": "2%", "beta": "0.8", "relativeVolume": "1.2x" }, "technicalLevels": { "support": "10.00", "resistance": "11.50", "stopLoss": "9.80" }, "catalyst": "Iron Ore Rebound", "analysis": "...", "conviction": "Strong Buy" } 
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