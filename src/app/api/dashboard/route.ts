import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

function extractJSON(text: string): any {
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: "API Key is missing. Please configure GEMINI_API_KEY in your environment." },
      { status: 500 }
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash';
  
  const currentTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

  const prompt = `
    Act as a Senior Wall Street Analyst. The current time in New York is: ${currentTime}.
    Generate a JSON market report using **REAL-TIME** data from Google Search.
    
    **CRITICAL INSTRUCTION**: You must use the 'googleSearch' tool to find the absolute latest data from the last 24 hours.

    **Part 1: REDDIT & SOCIAL MOMENTUM ("The Hype")**
    - Search r/wallstreetbets, r/investing, r/stocks for the **TOP 5 most discussed stock tickers** right now.
    - IMPORTANT: You MUST return exactly 5 stocks in the redditTrends array, ranked by mentions/discussion volume.
    - For EACH of the 5 stocks, identify:
      * The specific catalyst (Earnings, FDA approval, Short Squeeze, CEO scandal, etc.)
      * 'keywords': 5 slang words or specific themes driving the chat for that stock
      * 'mentions': Estimated number of mentions/posts
      * 'sentiment': Bullish, Bearish, or Neutral
      * 'sentimentScore': 0-100 score
      * 'volumeChange': Compare to average (e.g., "+20% vs Avg")
      * 'discussionSummary': One sentence capturing what people are saying
    
    **Part 2: CRITICAL NEWS WIRE ("The Truth")**
    - Search for **Breaking Financial News** from: Bloomberg, Reuters, Financial Times, CNBC.
    - **Timeframe**: Last 6 hours only.
    - **STRICT FILTER**: Do NOT include "Top 5 stocks to buy" or "Opinion" articles. I want HARD NEWS (Central Banks, M&A, Earnings Reports, Geopolitics).
    - 'impact': Mark as 'Critical' only if it affects the broader market.

    **Part 3: SUGGESTED STOCKS - FINANCIALS + FUNDAMENTALS ("The Value")**
    - Search for **3 DISTINCT value stocks** with strong fundamentals.
    - **Strategy**: Search for "best value stocks strong fundamentals low PE high FCF" to find candidates
    - Then for each stock, search "TICKER financial metrics" to get all data in one search
    - **Criteria**: Solid Balance Sheets (Low Debt), High Free Cash Flow, Low P/E relative to growth.
    - **EXCLUDE**: Hype stocks, Meme stocks, Unprofitable tech. Focus on established companies.
    
    Required metrics for each stock:
       - 'peRatio': Actual P/E ratio (e.g., "8.2", "15.4")
       - 'roe': Return on Equity percentage (e.g., "12%", "18%")
       - 'debtToEquity': Debt-to-Equity ratio (e.g., "0.9", "1.2")
       - 'freeCashFlow': Free Cash Flow (e.g., "$16B", "$5.2B")
       - 'marketCap': Market Capitalization (e.g., "130B", "45B")
       - 'dividendYield': Dividend Yield percentage (e.g., "6.1%", "3.2%")

    **Part 4: INSIDER TRADING - REMOVED FROM DASHBOARD**
    - Return EMPTY ARRAY for insiderTrades: []
    - Insider data will be loaded separately on-demand only
    - This is to prevent fake data generation

    **CRITICAL ANTI-FABRICATION RULES:**
    1. NEVER invent or fabricate data
    2. If you cannot find real data from your search, return empty arrays or say "Data Unavailable"
    3. DO NOT use well-known CEO names unless you found them in actual search results
    4. DO NOT create plausible-looking fake transactions
    5. Only return data you actually found through Google Search

    **Output JSON Structure (No Markdown)**:
    {
      "marketIndices": [ 
        { "name": "S&P 500", "value": "...", "change": "...", "trend": "Up" }
      ],
      "marketSentiment": { "score": 75, "label": "Greed", "primaryDriver": "..." },
      "sectorRotation": [ 
        { "name": "Technology", "performance": "Bullish", "change": "+1.5%" }
      ],
      "redditTrends": [ 
         { "symbol": "NVDA", "name": "NVIDIA", "mentions": 5000, "sentiment": "Bullish", "sentimentScore": 90, "discussionSummary": "AI hype continues", "volumeChange": "+20% vs Avg", "keywords": ["AI", "Blackwell", "Calls", "Moon", "Jensen"] }
      ],
      "news": [ 
        { "title": "...", "source": "Bloomberg", "url": "...", "timestamp": "2h ago", "summary": "...", "impact": "Critical" }
      ],
      "picks": [ 
         { "symbol": "VZ", "name": "Verizon", "price": "$42.15", "sector": "Telecom", "metrics": { "peRatio": "8.5", "roe": "15%", "debtToEquity": "1.8", "freeCashFlow": "$18B", "marketCap": "177B", "dividendYield": "6.5%" }, "technicalLevels": { "support": "41.00", "resistance": "44.00", "stopLoss": "40.50" }, "catalyst": "5G Expansion", "analysis": "Solid FCF with high yield", "conviction": "Strong Buy" }
      ],
      "insiderTrades": []
    }

    **REMINDERS**: 
    - 5 reddit stocks (REAL from search)
    - 3 fundamental picks (REAL from search)
    - insiderTrades: EMPTY ARRAY (will load separately)
    - NO FAKE DATA ALLOWED
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    const text = response.text || "";
    const rawData = extractJSON(text);

    const dashboardData = {
      marketIndices: rawData.marketIndices || [],
      marketSentiment: rawData.marketSentiment || { score: 50, label: "Neutral", primaryDriver: "Data Unavailable" },
      sectorRotation: rawData.sectorRotation || [],
      redditTrends: rawData.redditTrends || [],
      news: rawData.news || [],
      picks: rawData.picks || [],
      insiderTrades: [], // Always empty - will load separately
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };

    return NextResponse.json(dashboardData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}