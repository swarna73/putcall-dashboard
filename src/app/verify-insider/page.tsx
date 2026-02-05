// Component: Insider Alert Verification Tool
// Path: app/verify-insider/page.js

'use client';

import { useState } from 'react';

export default function VerifyInsiderPage() {
  const [alertText, setAlertText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Parse Reddit alert text
  const parseAlert = (text) => {
    setError('');
    
    // Extract ticker symbol - look for ($TICKER) or just TICKER in parentheses
    const tickerMatch = text.match(/\((?:\$)?([A-Z]{1,5})\)/) || 
                       text.match(/\b([A-Z]{2,5})\b/);
    
    // Extract dollar amount - look for $X.XM or $XXX,XXX
    const amountMatch = text.match(/\$([0-9,.]+)M?/i);
    
    // Extract trade date - look for various date formats
    const tradeDateMatch = text.match(/(?:Trade Date:|Date:)\s*(?:\*\*)?(\d{4}-\d{2}-\d{2})/i) ||
                          text.match(/(\d{4}-\d{2}-\d{2})/);
    
    // Extract filing date
    const filingDateMatch = text.match(/(?:Filing Date:|Filed:)\s*(?:\*\*)?(\d{4}-\d{2}-\d{2})/i);
    
    // Extract shares
    const sharesMatch = text.match(/purchased\s+([0-9,]+)\s+shares/i) ||
                       text.match(/([0-9,]+)\s+shares/i);
    
    // Extract price per share
    const priceMatch = text.match(/\$([0-9,.]+)\s+per\s+share/i) ||
                      text.match(/at\s+\$([0-9,.]+)/i);
    
    // Extract insider name
    const insiderMatch = text.match(/(?:by|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);

    if (!tickerMatch) {
      setError('Could not extract ticker symbol. Please check the alert format.');
      return null;
    }

    const parsed = {
      ticker: tickerMatch[1],
      amount: amountMatch ? amountMatch[1] : null,
      tradeDate: tradeDateMatch ? tradeDateMatch[1] : null,
      filingDate: filingDateMatch ? filingDateMatch[1] : null,
      shares: sharesMatch ? sharesMatch[1].replace(/,/g, '') : null,
      price: priceMatch ? priceMatch[1] : null,
      insider: insiderMatch ? insiderMatch[1] : null,
    };

    setParsedData(parsed);
    return parsed;
  };

  // Handle paste and parse
  const handleParse = () => {
    if (!alertText.trim()) {
      setError('Please paste a Reddit alert first');
      return;
    }
    parseAlert(alertText);
    setVerificationResult(null);
  };

  // Verify with SEC
  const handleVerify = async () => {
    if (!parsedData) {
      setError('Please parse an alert first');
      return;
    }

    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      const response = await fetch('/api/verify-insider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setVerificationResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Insider Alert Verification Tool
          </h1>
          <p className="text-blue-200">
            Paste Reddit insider alerts to verify with SEC EDGAR filings
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6 border border-white/20">
          <label className="block text-white font-semibold mb-2">
            Paste Reddit Alert Text
          </label>
          <textarea
            value={alertText}
            onChange={(e) => setAlertText(e.target.value)}
            placeholder="Paste the full Reddit post text here...

Example:
MAJOR INSIDER BUY ALERT - $1.9M
Big move spotted on ProBoss 👀 Cooke Shane, of Alkermes plc. ($ALKS), just purchased 61,200 shares at $31.64 per share — a total of $1.9M. 📊 **Trade Date:** 2026-02-02 📅 **Filing Date:** 2026-02-05"
            className="w-full h-48 bg-slate-800 text-white p-4 rounded border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
          />
          <button
            onClick={handleParse}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition"
          >
            Parse Alert
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Parsed Data Display */}
        {parsedData && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Extracted Data</h2>
            <div className="grid grid-cols-2 gap-4 text-white">
              <div>
                <span className="text-blue-300 font-semibold">Ticker:</span>
                <span className="ml-2 text-xl font-bold">{parsedData.ticker}</span>
              </div>
              {parsedData.amount && (
                <div>
                  <span className="text-blue-300 font-semibold">Amount:</span>
                  <span className="ml-2">${parsedData.amount}</span>
                </div>
              )}
              {parsedData.tradeDate && (
                <div>
                  <span className="text-blue-300 font-semibold">Trade Date:</span>
                  <span className="ml-2">{parsedData.tradeDate}</span>
                </div>
              )}
              {parsedData.filingDate && (
                <div>
                  <span className="text-blue-300 font-semibold">Filing Date:</span>
                  <span className="ml-2">{parsedData.filingDate}</span>
                </div>
              )}
              {parsedData.shares && (
                <div>
                  <span className="text-blue-300 font-semibold">Shares:</span>
                  <span className="ml-2">{Number(parsedData.shares).toLocaleString()}</span>
                </div>
              )}
              {parsedData.price && (
                <div>
                  <span className="text-blue-300 font-semibold">Price/Share:</span>
                  <span className="ml-2">${parsedData.price}</span>
                </div>
              )}
              {parsedData.insider && (
                <div className="col-span-2">
                  <span className="text-blue-300 font-semibold">Insider:</span>
                  <span className="ml-2">{parsedData.insider}</span>
                </div>
              )}
            </div>
            <button
              onClick={handleVerify}
              disabled={loading}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying with SEC...' : 'Verify with SEC EDGAR'}
            </button>
          </div>
        )}

        {/* Verification Results */}
        {verificationResult && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Verification Results</h2>
            
            {/* Status Badge */}
            <div className="mb-6">
              {verificationResult.verified === true && (
                <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✓</span>
                    <span className="font-semibold">{verificationResult.message}</span>
                  </div>
                </div>
              )}
              {verificationResult.verified === 'partial' && (
                <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚠</span>
                    <span className="font-semibold">{verificationResult.message}</span>
                  </div>
                </div>
              )}
              {verificationResult.verified === false && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✗</span>
                    <span className="font-semibold">{verificationResult.message}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Company Info */}
            <div className="mb-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Company Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-blue-300">Ticker:</span>
                  <span className="ml-2 font-bold">{verificationResult.ticker}</span>
                </div>
                <div>
                  <span className="text-blue-300">Company:</span>
                  <span className="ml-2">{verificationResult.companyName}</span>
                </div>
                <div>
                  <span className="text-blue-300">CIK:</span>
                  <span className="ml-2 font-mono">{verificationResult.cik}</span>
                </div>
              </div>
            </div>

            {/* Matched Filing */}
            {verificationResult.matchedFiling && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">Matched Filing</h3>
                <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
                  <div className="text-white space-y-2">
                    <div>
                      <span className="text-green-300">Filing Date:</span>
                      <span className="ml-2">{verificationResult.matchedFiling.date}</span>
                    </div>
                    <div>
                      <span className="text-green-300">Report Date:</span>
                      <span className="ml-2">{verificationResult.matchedFiling.reportDate}</span>
                    </div>
                    <a
                      href={verificationResult.matchedFiling.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition"
                    >
                      View SEC Filing →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Filings */}
            {verificationResult.recentFilings && verificationResult.recentFilings.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Recent Form 4 Filings (Last 5)
                </h3>
                <div className="space-y-3">
                  {verificationResult.recentFilings.map((filing, index) => (
                    <div
                      key={index}
                      className="bg-slate-800/50 border border-slate-600 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center text-white">
                        <div>
                          <div className="font-semibold">Filing Date: {filing.date}</div>
                          {filing.reportDate && (
                            <div className="text-sm text-slate-300">
                              Report Date: {filing.reportDate}
                            </div>
                          )}
                        </div>
                        <a
                          href={filing.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm transition"
                        >
                          View Filing
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
