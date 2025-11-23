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
    - Search r/wallstreetbets, r/investing, r/stocks for the **#1 most discussed stock ticker** right now.
    - Identify the specific catalyst (Earnings, FDA approval, Short Squeeze, CEO scandal).
    - 'keywords': 5 slang words or specific themes driving the chat.

    **Part 2: CRITICAL NEWS WIRE ("The Truth")**
    - Search for **Breaking Financial News** from: Bloomberg, Reuters, Financial Times, CNBC.
    - **Timeframe**: Last 6 hours only.
    - **STRICT FILTER**: Do NOT include "Top 5 stocks to buy" or "Opinion" articles. I want HARD NEWS (Central Banks, M&A, Earnings Reports, Geopolitics).
    - 'impact': Mark as 'Critical' only if it affects the broader market.

    **Part 3: SUGGESTED STOCKS - FINANCIALS + FUNDAMENTALS ("The Value")**
    - Search for **3 DISTINCT** companies that are "Strong Buys" based purely on **Fundamentals**.
    - **Criteria**: Solid Balance Sheets (Low Debt), High Free Cash Flow, Low P/E relative to growth.
    - **EXCLUDE**: Hype stocks, Meme stocks, Unprofitable tech. Stick to quality companies.
    - **Metrics**: You must find the ACTUAL current:
       - 'peRatio'
       - 'roe' (Return on Equity)
       - 'debtToEquity'
       - 'freeCashFlow'
    - **Analysis**: Explain the fundamental thesis in one sentence (e.g. "Generates $5B FCF with 20% ROE, trading at 8x earnings").

    **Output JSON Structure (No Markdown)**:
    {
      "marketIndices": [ { "name": "S&P 500", "value": "...", "change": "...", "trend": "Up" } ],
      "marketSentiment": { "score": 75, "label": "Greed", "primaryDriver": "..." },
      "sectorRotation": [ { "name": "Energy", "performance": "Bullish", "change": "+1.5%" } ],
      "redditTrends": [ 
         { "symbol": "NVDA", "name": "NVIDIA", "mentions": 5000, "sentiment": "Bullish", "sentimentScore": 90, "discussionSummary": "...", "volumeChange": "+20% vs Avg", "keywords": ["AI", "Blackwell", "Calls"] } 
      ],
      "news": [ { "title": "...", "source": "Bloomberg", "url": "...", "timestamp": "10m ago", "summary": "...", "impact": "Critical" } ],
      "picks": [ 
         { "symbol": "T", "name": "AT&T Inc.", "price": "$18.50", "sector": "Telecom", "metrics": { "peRatio": "6.2", "roe": "12%", "debtToEquity": "0.9", "freeCashFlow": "$16B", "marketCap": "130B", "dividendYield": "6.1%" }, "technicalLevels": { "support": "18.00", "resistance": "19.50", "stopLoss": "17.80" }, "catalyst": "Free Cash Flow Beat", "analysis": "Trading below book value with massive FCF generation.", "conviction": "Strong Buy" }
      ]
    }
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
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };

    return NextResponse.json(dashboardData);

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}