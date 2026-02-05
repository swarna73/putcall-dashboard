// API Route for App Router: /app/api/verify-insider/route.js
// Verifies Reddit insider alerts against SEC EDGAR filings

import { NextResponse } from 'next/server';
export async function POST(request: Request) {
  try {
    const { ticker, amount, tradeDate, insider } = await request.json();

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker symbol is required' },
        { status: 400 }
      );
    }

    // Step 1: Get CIK (Central Index Key) for the ticker
    const tickerUpper = ticker.toUpperCase();
    const cikResponse = await fetch(
      `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${tickerUpper}&type=4&dateb=&owner=include&count=1&output=atom`,
      {
        headers: {
          'User-Agent': 'PutCall.nl insider-verification tool contact@putcall.nl',
        },
      }
    );

    if (!cikResponse.ok) {
      throw new Error('Failed to fetch from SEC EDGAR');
    }

    // Step 2: Parse for recent Form 4 filings
    const data = await cikResponse.text();
    
    // Extract CIK from response
    const cikMatch = data.match(/CIK=(\d+)/);
    const cik = cikMatch ? cikMatch[1].padStart(10, '0') : null;

    if (!cik) {
      return NextResponse.json({
        verified: false,
        message: `No SEC filings found for ticker ${tickerUpper}`,
      }, { status: 404 });
    }

    // Step 3: Get recent Form 4 filings
    const filingsResponse = await fetch(
      `https://data.sec.gov/submissions/CIK${cik}.json`,
      {
        headers: {
          'User-Agent': 'PutCall.nl insider-verification tool contact@putcall.nl',
        },
      }
    );

    if (!filingsResponse.ok) {
      throw new Error('Failed to fetch filings data');
    }

    const filingsData = await filingsResponse.json();
    
    // Filter for Form 4 filings (insider transactions)
    const form4Filings = filingsData.filings?.recent?.accessionNumber
	?.map((accession: string, index: number) => ({
        accessionNumber: accession,
        filingDate: filingsData.filings.recent.filingDate[index],
        reportDate: filingsData.filings.recent.reportDate?.[index],
        form: filingsData.filings.recent.form[index],
        primaryDocument: filingsData.filings.recent.primaryDocument[index],
      }))
      .filter(filing => filing.form === '4') || [];

    // Step 4: Check if there's a matching filing based on trade date
    let matchedFiling = null;
    if (tradeDate) {
      // Look for filings within 3 days of the trade date
      const tradeDateObj = new Date(tradeDate);
      const threeDaysBefore = new Date(tradeDateObj);
      threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
      const threeDaysAfter = new Date(tradeDateObj);
      threeDaysAfter.setDate(threeDaysAfter.getDate() + 3);

      matchedFiling = form4Filings.find(filing => {
        const filingDate = new Date(filing.filingDate);
        return filingDate >= threeDaysBefore && filingDate <= threeDaysAfter;
      });
    }

    // Step 5: Prepare response
    const recentFilings = form4Filings.slice(0, 5).map(filing => ({
      date: filing.filingDate,
      reportDate: filing.reportDate,
      url: `https://www.sec.gov/cgi-bin/viewer?action=view&cik=${cik}&accession_number=${filing.accessionNumber.replace(/-/g, '')}&xbrl_type=v`,
    }));

    return NextResponse.json({
      verified: matchedFiling ? true : 'partial',
      ticker: tickerUpper,
      cik,
      companyName: filingsData.name,
      matchedFiling: matchedFiling ? {
        date: matchedFiling.filingDate,
        reportDate: matchedFiling.reportDate,
        url: `https://www.sec.gov/cgi-bin/viewer?action=view&cik=${cik}&accession_number=${matchedFiling.accessionNumber.replace(/-/g, '')}&xbrl_type=v`,
      } : null,
      recentFilings,
      message: matchedFiling 
        ? `✓ Verified: Form 4 filing found matching trade date ${tradeDate}`
        : `⚠ Partial: Recent Form 4 filings found, but no exact match for trade date ${tradeDate}. Check recent filings manually.`,
    });

  } catch (error) {
    console.error('SEC verification error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to verify with SEC EDGAR',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
