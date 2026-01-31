import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  const testSymbols = ['VZ', 'T', 'PFE', 'CVX', 'XOM'];
  const results: any[] = [];

  console.log('🔍 Testing Yahoo Finance API...');

  for (const symbol of testSymbols) {
    try {
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
      console.log(`Testing ${symbol}...`);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000),
        cache: 'no-store'
      });

      const status = response.status;
      const ok = response.ok;

      let data = null;
      let error = null;

      if (ok) {
        try {
          data = await response.json();
          const quote = data.quoteResponse?.result?.[0];
          results.push({
            symbol,
            status: 'SUCCESS',
            httpStatus: status,
            price: quote?.regularMarketPrice,
            pe: quote?.trailingPE,
            dividend: quote?.dividendYield
          });
        } catch (e: any) {
          error = `JSON parse error: ${e.message}`;
          results.push({ symbol, status: 'PARSE_ERROR', httpStatus: status, error });
        }
      } else {
        const text = await response.text();
        error = `HTTP ${status}: ${text.substring(0, 200)}`;
        results.push({ symbol, status: 'HTTP_ERROR', httpStatus: status, error });
      }

      console.log(`${symbol}: ${ok ? '✅ SUCCESS' : '❌ FAILED'} (${status})`);

    } catch (e: any) {
      console.error(`${symbol}: ❌ EXCEPTION - ${e.message}`);
      results.push({
        symbol,
        status: 'EXCEPTION',
        error: e.message,
        name: e.name
      });
    }

    await new Promise(r => setTimeout(r, 200));
  }

  const successCount = results.filter(r => r.status === 'SUCCESS').length;
  const summary = {
    tested: testSymbols.length,
    successful: successCount,
    failed: testSymbols.length - successCount,
    timestamp: new Date().toISOString()
  };

  console.log(`📊 Summary: ${successCount}/${testSymbols.length} succeeded`);

  return NextResponse.json({
    summary,
    results,
    verdict: successCount === 0
      ? 'Yahoo Finance is completely blocked/down'
      : successCount < testSymbols.length
        ? 'Yahoo Finance is partially working (rate limiting?)'
        : 'Yahoo Finance is working normally'
  });
}
