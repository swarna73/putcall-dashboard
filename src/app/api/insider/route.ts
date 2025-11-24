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

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: "API Key is missing" },
      { status: 500 }
    );
  }

  const { symbol } = await request.json();

  if (!symbol) {
    return NextResponse.json(
      { error: "Symbol is required" },
      { status: 400 }
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash';

  const prompt = `
    Act as a Financial Analyst specializing in insider trading analysis.
    
    Search for recent insider trading activity for: ${symbol}
    
    **Data Sources to Search:**
    1. Search "SEC Form 4 ${symbol} insider trading" for official SEC filings
    2. Search "openinsider.com ${symbol}" for aggregated data
    3. Search "${symbol} insider buying selling recent"
    
    **Find the most recent 5 insider transactions (last 90 days) and include:**
    - Insider name
    - Title/Position (CEO, COO, CFO, Director, etc.)
    - Transaction type (Buy or Sale)
    - Number of shares
    - Total transaction value
    - Price per share (if available)
    - Filing date
    
    **Analysis Requirements:**
    - Identify patterns (clustered buying, multiple executives buying, large purchases)
    - Determine sentiment (Bullish if buying, Bearish if selling)
    - Note significance (e.g., "CEO bought $5M worth - largest purchase in 2 years")
    
    **Output Format (Strict JSON):**
    {
      "symbol": "${symbol}",
      "companyName": "Full Company Name",
      "recentTrades": [
        {
          "symbol": "${symbol}",
          "companyName": "Company Name",
          "insiderName": "John Smith",
          "title": "Chief Operating Officer",
          "transactionType": "Buy",
          "shares": "50,000",
          "value": "$7.5M",
          "pricePerShare": "$150.00",
          "filingDate": "Nov 22, 2025",
          "significance": "Large Buy"
        }
      ],
      "analysis": "Three executives including the COO purchased a combined $15M in shares over the past 30 days, suggesting strong confidence in upcoming earnings. This represents the highest insider buying activity in 18 months."
    }
    
    **IMPORTANT:** 
    - Use REAL data from your searches
    - If no insider activity found in last 90 days, say so in the analysis
    - Format dates as "MMM DD, YYYY"
    - Format values with M/K suffix (e.g., "$7.5M", "$250K")
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
    const analysis = extractJSON(text);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Insider Trading Analysis Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze insider trading" },
      { status: 500 }
    );
  }
}
