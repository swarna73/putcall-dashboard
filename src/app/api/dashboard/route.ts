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
    
    **FOR PART 3 - IMPORTANT**: Fill in the metrics with real numbers. If you cannot find exact data for a metric, use reasonable estimates based on the company's sector and size, but prioritize real data.
    
    Required metrics for each stock:
       - 'peRatio': Actual P/E ratio (e.g., "8.2", "15.4")
       - 'roe': Return on Equity percentage (e.g., "12%", "18%")
       - 'debtToEquity': Debt-to-Equity ratio (e.g., "0.9", "1.2")
       - 'freeCashFlow': Free Cash Flow (e.g., "$16B", "$5.2B")
       - 'marketCap': Market Capitalization (e.g., "130B", "45B")
       - 'dividendYield': Dividend Yield percentage (e.g., "6.1%", "3.2%")
    - **Analysis**: One sentence explaining why it's a good value play using the metrics

    **Output JSON Structure (No Markdown)**:
    {
      "marketIndices": [ 
        { "name": "S&P 500", "value": "...", "change": "...", "trend": "Up" },
        { "name": "Dow Jones Industrial Average", "value": "...", "change": "...", "trend": "Up" },
        { "name": "Nasdaq Composite", "value": "...", "change": "...", "trend": "Up" }
      ],
      "marketSentiment": { "score": 75, "label": "Greed", "primaryDriver": "..." },
      "sectorRotation": [ 
        { "name": "Technology", "performance": "Bullish", "change": "+1.5%" },
        { "name": "Energy", "performance": "Bearish", "change": "-0.8%" }
      ],
      "redditTrends": [ 
         { "symbol": "NVDA", "name": "NVIDIA", "mentions": 5000, "sentiment": "Bullish", "sentimentScore": 90, "discussionSummary": "AI hype continues with strong earnings expectations", "volumeChange": "+20% vs Avg", "keywords": ["AI", "Blackwell", "Calls", "Moon", "Jensen"] },
         { "symbol": "TSLA", "name": "Tesla", "mentions": 3500, "sentiment": "Bearish", "sentimentScore": 35, "discussionSummary": "Concerns over delivery numbers and Musk distractions", "volumeChange": "+15% vs Avg", "keywords": ["Musk", "Cybertruck", "Puts", "Tank", "Loss"] },
         { "symbol": "AMD", "name": "AMD", "mentions": 2800, "sentiment": "Bullish", "sentimentScore": 75, "discussionSummary": "Chip demand strong, gaining market share from Intel", "volumeChange": "+10% vs Avg", "keywords": ["Chips", "Intel", "Breakout", "Gains", "Buy"] },
         { "symbol": "PLTR", "name": "Palantir", "mentions": 2200, "sentiment": "Bullish", "sentimentScore": 80, "discussionSummary": "AI platform contracts accelerating with government", "volumeChange": "+25% vs Avg", "keywords": ["AI", "Gov", "Rally", "Hold", "Karp"] },
         { "symbol": "SPY", "name": "SPDR S&P 500", "mentions": 1800, "sentiment": "Neutral", "sentimentScore": 50, "discussionSummary": "Mixed sentiment as traders hedge for volatility", "volumeChange": "+5% vs Avg", "keywords": ["Market", "Hedge", "ETF", "Safe", "Index"] }
      ],
      "news": [ 
        { "title": "Fed signals potential rate cut in December", "source": "Bloomberg", "url": "...", "timestamp": "2h ago", "summary": "Federal Reserve officials indicated openness to cutting rates...", "impact": "Critical" },
        { "title": "Major tech merger announced", "source": "Reuters", "url": "...", "timestamp": "4h ago", "summary": "Two leading cloud companies announce $50B merger...", "impact": "High" }
      ],
      "picks": [ 
         { 
           "symbol": "VZ", 
           "name": "Verizon Communications", 
           "price": "$42.15", 
           "sector": "Telecom", 
           "metrics": { 
             "peRatio": "8.5", 
             "roe": "15%", 
             "debtToEquity": "1.8", 
             "freeCashFlow": "$18B", 
             "marketCap": "177B", 
             "dividendYield": "6.5%" 
           }, 
           "technicalLevels": { 
             "support": "41.00", 
             "resistance": "44.00", 
             "stopLoss": "40.50" 
           }, 
           "catalyst": "5G Expansion", 
           "analysis": "Generates $18B FCF with 6.5% dividend yield, trading at only 8.5x earnings with stable telecom revenue.", 
           "conviction": "Strong Buy" 
         },
         { 
           "symbol": "PFE", 
           "name": "Pfizer Inc.", 
           "price": "$28.50", 
           "sector": "Healthcare", 
           "metrics": { 
             "peRatio": "9.2", 
             "roe": "11%", 
             "debtToEquity": "0.6", 
             "freeCashFlow": "$12B", 
             "marketCap": "160B", 
             "dividendYield": "5.8%" 
           }, 
           "technicalLevels": { 
             "support": "27.00", 
             "resistance": "30.00", 
             "stopLoss": "26.50" 
           }, 
           "catalyst": "New Drug Pipeline", 
           "analysis": "Pharmaceutical giant with strong pipeline trading at deep discount with low debt and solid FCF.", 
           "conviction": "Buy" 
         },
         { 
           "symbol": "CVX", 
           "name": "Chevron Corporation", 
           "price": "$158.25", 
           "sector": "Energy", 
           "metrics": { 
             "peRatio": "10.8", 
             "roe": "14%", 
             "debtToEquity": "0.3", 
             "freeCashFlow": "$21B", 
             "marketCap": "295B", 
             "dividendYield": "3.8%" 
           }, 
           "technicalLevels": { 
             "support": "155.00", 
             "resistance": "165.00", 
             "stopLoss": "153.00" 
           }, 
           "catalyst": "Energy Transition Strategy", 
           "analysis": "Energy major with exceptional balance sheet, massive FCF, and steady dividend in transition phase.", 
           "conviction": "Strong Buy" 
         }
      ]
    }

    **IMPORTANT REMINDERS**:
    - redditTrends MUST have exactly 5 stocks
    - picks MUST have exactly 3 stocks with all metrics filled
    - Use efficient search queries to get data quickly
    - Provide actual numbers, not placeholders
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