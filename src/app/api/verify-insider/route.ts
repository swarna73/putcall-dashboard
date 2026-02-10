// API Route: /api/verify-insider
// Verifies Reddit insider alerts against SEC EDGAR filings

import { NextRequest, NextResponse } from 'next/server';

interface VerifyRequest {
  ticker: string;
  tradeDate?: string;
  amount?: string;
  insider?: string;
}

interface Filing {
  accessionNumber: string;
  date: string;
  reportDate?: string;
  url: string;
}

interface VerifyResponse {
  verified: boolean | 'partial';
  message: string;
  companyName?: string;
  cik?: string;
  recentFilings?: Filing[];
  matchedFiling?: Filing;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<VerifyResponse>> {
  const body = await request.json() as VerifyRequest;
  const { ticker, tradeDate, amount, insider } = body;

  if (!ticker) {
    return NextResponse.json(
      { verified: false, message: 'Ticker symbol is required' },
      { status: 400 }
    );
  }

  const userAgent = 'PutCall.nl insider-verification tool contact@putcall.nl';

  try {
    const tickerUpper = ticker.toUpperCase().replace('$', '');
    
    // Step 1: Get CIK from SEC ticker mapping
    const tickerMapResponse = await fetch(
      'https://www.sec.gov/files/company_tickers.json',
      { headers: { 'User-Agent': userAgent } }
    );

    if (!tickerMapResponse.ok) {
      throw new Error('Failed to fetch SEC ticker mapping');
    }

    const tickerMap = await tickerMapResponse.json();
    
    // Find CIK for ticker
    let cik: string | null = null;
    let companyName: string | null = null;
    
    for (const key in tickerMap) {
      if (tickerMap[key].ticker === tickerUpper) {
        cik = String(tickerMap[key].cik_str).padStart(10, '0');
        companyName = tickerMap[key].title;
        break;
      }
    }

    if (!cik) {
      return NextResponse.json(
        {
          verified: false,
          message: `No SEC filings found for ticker ${tickerUpper}. Verify the ticker symbol is correct.`
        },
        { status: 404 }
      );
    }

    // Step 2: Get company filings
    const filingsResponse = await fetch(
      `https://data.sec.gov/submissions/CIK${cik}.json`,
      { headers: { 'User-Agent': userAgent } }
    );

    if (!filingsResponse.ok) {
      throw new Error('Failed to fetch filings data');
    }

    const filingsData = await filingsResponse.json();
    
    // Step 3: Filter for Form 4 filings (insider transactions)
    const recentFilings = filingsData.filings?.recent;
    
    if (!recentFilings || !recentFilings.form) {
      return NextResponse.json(
        {
          verified: false,
          message: 'No recent filings found for this company',
          companyName: companyName || undefined,
          cik
        },
        { status: 404 }
      );
    }

    const form4Filings: Filing[] = [];
    
    for (let i = 0; i < recentFilings.form.length && form4Filings.length < 10; i++) {
      if (recentFilings.form[i] === '4') {
        const accession = recentFilings.accessionNumber[i].replace(/-/g, '');
        form4Filings.push({
          accessionNumber: recentFilings.accessionNumber[i],
          date: recentFilings.filingDate[i],
          reportDate: recentFilings.reportDate?.[i],
          url: `https://www.sec.gov/Archives/edgar/data/${cik.replace(/^0+/, '')}/${accession}/${recentFilings.primaryDocument[i]}`
        });
      }
    }

    if (form4Filings.length === 0) {
      return NextResponse.json({
        verified: false,
        message: 'No Form 4 (insider transaction) filings found',
        companyName: companyName || undefined,
        cik
      });
    }

    // Step 4: Try to match trade date if provided
    let matchedFiling: Filing | undefined;
    
    if (tradeDate) {
      const normalizedTradeDate = tradeDate.split('T')[0];
      
      matchedFiling = form4Filings.find(filing => {
        const filingReportDate = filing.reportDate?.split('T')[0];
        const filingDate = filing.date.split('T')[0];
        return filingReportDate === normalizedTradeDate || filingDate === normalizedTradeDate;
      });
    }

    // Step 5: Return verification result
    if (matchedFiling) {
      return NextResponse.json({
        verified: true,
        message: `Verified! Found matching Form 4 filing dated ${matchedFiling.date}`,
        companyName: companyName || undefined,
        cik,
        matchedFiling,
        recentFilings: form4Filings.slice(0, 5)
      });
    } else if (form4Filings.length > 0) {
      return NextResponse.json({
        verified: 'partial',
        message: tradeDate 
          ? `Found ${form4Filings.length} recent Form 4 filings, but no exact match for trade date ${tradeDate}`
          : `Found ${form4Filings.length} recent Form 4 filings. Provide trade date for exact matching.`,
        companyName: companyName || undefined,
        cik,
        recentFilings: form4Filings.slice(0, 5)
      });
    }

    return NextResponse.json({
      verified: false,
      message: 'No matching insider filings found',
      companyName: companyName || undefined,
      cik
    });

  } catch (error) {
    console.error('SEC verification error:', error);
    return NextResponse.json(
      {
        verified: false,
        message: 'Error verifying with SEC EDGAR',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
