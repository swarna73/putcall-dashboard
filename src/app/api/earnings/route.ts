// app/api/earnings/route.ts
// Fetches earnings calendar and returns this week's earnings
// Uses Supabase for caching to avoid API rate limits

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Major stocks we want to track earnings for
const TRACKED_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'AMD',
  'NFLX', 'DIS', 'PYPL', 'V', 'MA', 'JPM', 'BAC', 'GS', 'WFC',
  'WMT', 'TGT', 'COST', 'HD', 'LOW', 'SBUX', 'MCD', 'KO', 'PEP',
  'JNJ', 'PFE', 'UNH', 'ABBV', 'MRK', 'LLY', 'CVS',
  'XOM', 'CVX', 'COP', 'BA', 'CAT', 'GE', 'HON',
  'CRM', 'ORCL', 'ADBE', 'INTC', 'QCOM', 'AVGO', 'TXN',
  'T', 'VZ', 'CMCSA', 'TMUS'
];

// Company names mapping
const COMPANY_NAMES: Record<string, string> = {
  'AAPL': 'Apple',
  'MSFT': 'Microsoft',
  'GOOGL': 'Alphabet',
  'AMZN': 'Amazon',
  'META': 'Meta Platforms',
  'NVDA': 'NVIDIA',
  'TSLA': 'Tesla',
  'AMD': 'AMD',
  'NFLX': 'Netflix',
  'DIS': 'Disney',
  'PYPL': 'PayPal',
  'V': 'Visa',
  'MA': 'Mastercard',
  'JPM': 'JPMorgan Chase',
  'BAC': 'Bank of America',
  'GS': 'Goldman Sachs',
  'WFC': 'Wells Fargo',
  'WMT': 'Walmart',
  'TGT': 'Target',
  'COST': 'Costco',
  'HD': 'Home Depot',
  'LOW': "Lowe's",
  'SBUX': 'Starbucks',
  'MCD': "McDonald's",
  'KO': 'Coca-Cola',
  'PEP': 'PepsiCo',
  'JNJ': 'Johnson & Johnson',
  'PFE': 'Pfizer',
  'UNH': 'UnitedHealth',
  'ABBV': 'AbbVie',
  'MRK': 'Merck',
  'LLY': 'Eli Lilly',
  'CVS': 'CVS Health',
  'XOM': 'Exxon Mobil',
  'CVX': 'Chevron',
  'COP': 'ConocoPhillips',
  'BA': 'Boeing',
  'CAT': 'Caterpillar',
  'GE': 'GE Aerospace',
  'HON': 'Honeywell',
  'CRM': 'Salesforce',
  'ORCL': 'Oracle',
  'ADBE': 'Adobe',
  'INTC': 'Intel',
  'QCOM': 'Qualcomm',
  'AVGO': 'Broadcom',
  'TXN': 'Texas Instruments',
  'T': 'AT&T',
  'VZ': 'Verizon',
  'CMCSA': 'Comcast',
  'TMUS': 'T-Mobile',
};

interface FinnhubEarning {
  date: string;
  epsActual: number | null;
  epsEstimate: number | null;
  hour: string; // 'bmo', 'amc', 'dmh'
  quarter: number;
  revenueActual: number | null;
  revenueEstimate: number | null;
  symbol: string;
  year: number;
}

export async function GET() {
  try {
    // Get current week's date range
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    // Check cache first
    const { data: cachedData, error: cacheError } = await supabase
      .from('earnings_cache')
      .select('*')
      .gte('date', startOfWeek.toISOString().split('T')[0])
      .lte('date', endOfWeek.toISOString().split('T')[0])
      .order('date', { ascending: true });

    // If we have recent cached data (less than 6 hours old), use it
    const cacheAge = cachedData?.[0]?.updated_at 
      ? Date.now() - new Date(cachedData[0].updated_at).getTime()
      : Infinity;

    if (cachedData && cachedData.length > 0 && cacheAge < 6 * 60 * 60 * 1000) {
      console.log('📦 Using cached earnings data');
      
      // Add price changes for reported earnings
      const earningsWithPrices = await addPriceChanges(cachedData);
      
      return NextResponse.json({
        earnings: earningsWithPrices,
        source: 'cache',
        weekStart: startOfWeek.toISOString().split('T')[0],
        weekEnd: endOfWeek.toISOString().split('T')[0],
      });
    }

    // Fetch fresh data from Finnhub
    console.log('🔄 Fetching fresh earnings from Finnhub...');
    const finnhubKey = process.env.NEXT_PUBLIC_FINNHUB_KEY;
    
    if (!finnhubKey) {
      throw new Error('NEXT_PUBLIC_FINNHUB_KEY not configured');
    }

    const fromDate = startOfWeek.toISOString().split('T')[0];
    const toDate = endOfWeek.toISOString().split('T')[0];
    
    const response = await fetch(
      `https://finnhub.io/api/v1/calendar/earnings?from=${fromDate}&to=${toDate}&token=${finnhubKey}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();
    const allEarnings: FinnhubEarning[] = data.earningsCalendar || [];
    
    // Filter to only tracked symbols
    const trackedEarnings = allEarnings.filter(e => 
      TRACKED_SYMBOLS.includes(e.symbol.toUpperCase())
    );

    console.log(`📊 Found ${trackedEarnings.length} earnings for tracked stocks this week`);

    // Transform and save to cache
    const earningsToCache = trackedEarnings.map(e => ({
      symbol: e.symbol,
      company_name: COMPANY_NAMES[e.symbol] || e.symbol,
      date: e.date,
      time: e.hour || null,
      eps_estimate: e.epsEstimate,
      eps_actual: e.epsActual,
      revenue_estimate: e.revenueEstimate,
      revenue_actual: e.revenueActual,
      has_reported: e.epsActual !== null,
      updated_at: new Date().toISOString(),
    }));

    // Upsert to Supabase (update if exists, insert if not)
    if (earningsToCache.length > 0) {
      const { error: upsertError } = await supabase
        .from('earnings_cache')
        .upsert(earningsToCache, { 
          onConflict: 'symbol,date',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('Failed to cache earnings:', upsertError);
      }
    }

    // Format response
    const formattedEarnings = earningsToCache.map(e => ({
      symbol: e.symbol,
      companyName: e.company_name,
      date: e.date,
      time: e.time,
      epsEstimate: e.eps_estimate,
      epsActual: e.eps_actual,
      revenueEstimate: e.revenue_estimate,
      revenueActual: e.revenue_actual,
      hasReported: e.has_reported,
    }));

    // Add price changes for reported earnings
    const earningsWithPrices = await addPriceChanges(formattedEarnings);

    return NextResponse.json({
      earnings: earningsWithPrices,
      source: 'finnhub',
      weekStart: fromDate,
      weekEnd: toDate,
    });

  } catch (error) {
    console.error('Earnings API error:', error);
    
    // Try to return stale cache data as fallback
    const { data: fallbackData } = await supabase
      .from('earnings_cache')
      .select('*')
      .order('date', { ascending: true })
      .limit(10);

    if (fallbackData && fallbackData.length > 0) {
      return NextResponse.json({
        earnings: fallbackData.map(e => ({
          symbol: e.symbol,
          companyName: e.company_name,
          date: e.date,
          time: e.time,
          epsEstimate: e.eps_estimate,
          epsActual: e.eps_actual,
          hasReported: e.has_reported,
        })),
        source: 'fallback',
        error: 'Using cached data due to API error',
      });
    }

    return NextResponse.json({ 
      earnings: [],
      error: 'Failed to fetch earnings data' 
    }, { status: 500 });
  }
}

// Helper to fetch stock price changes post-earnings
async function addPriceChanges(earnings: any[]): Promise<any[]> {
  const reportedEarnings = earnings.filter(e => e.hasReported || e.has_reported);
  
  if (reportedEarnings.length === 0) return earnings;

  try {
    // Fetch price changes for reported earnings
    const pricePromises = reportedEarnings.map(async (earning) => {
      const symbol = earning.symbol;
      const earningsDate = new Date(earning.date);
      const nextDay = new Date(earningsDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      // Use Yahoo Finance for price data
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=5d&interval=1d`,
        { next: { revalidate: 300 } } // Cache for 5 min
      );

      if (!response.ok) return null;

      const data = await response.json();
      const quotes = data.chart?.result?.[0]?.indicators?.quote?.[0];
      const timestamps = data.chart?.result?.[0]?.timestamp;

      if (!quotes || !timestamps || timestamps.length < 2) return null;

      // Calculate price change from day before to day after earnings
      const closes = quotes.close;
      const priceChange = ((closes[closes.length - 1] - closes[closes.length - 2]) / closes[closes.length - 2]) * 100;

      return { symbol, priceChange };
    });

    const priceResults = await Promise.all(pricePromises);
    const priceMap = new Map(
      priceResults
        .filter(Boolean)
        .map(r => [r!.symbol, r!.priceChange])
    );

    // Merge price changes back into earnings
    return earnings.map(e => ({
      ...e,
      companyName: e.companyName || e.company_name,
      hasReported: e.hasReported || e.has_reported,
      priceChange: priceMap.get(e.symbol) ?? undefined,
    }));

  } catch (error) {
    console.error('Failed to fetch price changes:', error);
    return earnings;
  }
}
