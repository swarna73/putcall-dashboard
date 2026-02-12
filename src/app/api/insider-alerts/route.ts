// API Route: /api/insider-alerts
// Fetches stored insider alerts from Supabase for display

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface InsiderAlert {
  id: string;
  ticker: string;
  transaction_type: 'BUY' | 'SELL';
  amount: string | null;
  shares: number | null;
  price_per_share: number | null;
  trade_date: string | null;
  filing_date: string | null;
  insider_name: string | null;
  company_name: string | null;
  reddit_url: string | null;
  sec_filing_url: string | null;
  posted_at: string;
  verification_status: 'verified' | 'partial' | 'unverified';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const limit = searchParams.get('limit') || '20';
  const offset = searchParams.get('offset') || '0';
  const type = searchParams.get('type'); // 'BUY' or 'SELL'
  const verified = searchParams.get('verified') ?? 'true';
  const ticker = searchParams.get('ticker');

  try {
    let query = supabase
      .from('insider_alerts')
      .select('*', { count: 'exact' })
      .order('trade_date', { ascending: false, nullsFirst: false })
      .order('posted_at', { ascending: false });

    // Filter by verification status
    if (verified === 'true') {
      query = query.in('verification_status', ['verified', 'partial']);
    }

    // Filter by transaction type
    if (type === 'BUY' || type === 'SELL') {
      query = query.eq('transaction_type', type);
    }

    // Filter by ticker
    if (ticker) {
      query = query.eq('ticker', ticker.toUpperCase());
    }

    // Pagination
    query = query.range(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit) - 1
    );

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Set cache headers (cache for 5 minutes)
    return NextResponse.json(
      {
        alerts: data as InsiderAlert[],
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
      {
        headers: {
          'Cache-Control': 's-maxage=300, stale-while-revalidate',
        },
      }
    );

  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch alerts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
