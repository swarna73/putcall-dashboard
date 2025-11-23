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
    const analysis = extractJSON(text);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Deep Dive Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze stock" },
      { status: 500 }
    );
  }
}