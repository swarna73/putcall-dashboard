import React, { useState } from 'react';
import { IconBrain } from './Icons';

interface StockData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  peRatio: string;
  eps: string;
  marketCap: string;
  volume: string;
  avgVolume: string;
  high52: string;
  low52: string;
  dividend: string;
  beta: string;
  description?: string;
}

const StockDeepDive: React.FC = () => {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!ticker.trim()) return;
    
    setLoading(true);
    setError(null);
    setStockData(null);

    try {
      // Fetch from Yahoo Finance API
      const response = await fetch(
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker.toUpperCase()}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      const quote = data.quoteResponse?.result?.[0];
      
      if (!quote) {
        setError(`No data found for ${ticker.toUpperCase()}`);
        return;
      }

      setStockData({
        symbol: quote.symbol,
        name: quote.shortName || quote.longName || quote.symbol,
        price: `$${quote.regularMarketPrice?.toFixed(2) || 'N/A'}`,
        change: quote.regularMarketChange >= 0 
          ? `+$${quote.regularMarketChange?.toFixed(2)}` 
          : `-$${Math.abs(quote.regularMarketChange)?.toFixed(2)}`,
        changePercent: quote.regularMarketChangePercent >= 0
          ? `+${quote.regularMarketChangePercent?.toFixed(2)}%`
          : `${quote.regularMarketChangePercent?.toFixed(2)}%`,
        peRatio: quote.trailingPE?.toFixed(1) || 'N/A',
        eps: quote.epsTrailingTwelveMonths?.toFixed(2) || 'N/A',
        marketCap: formatLargeNumber(quote.marketCap),
        volume: formatLargeNumber(quote.regularMarketVolume),
        avgVolume: formatLargeNumber(quote.averageDailyVolume3Month),
        high52: `$${quote.fiftyTwoWeekHigh?.toFixed(2) || 'N/A'}`,
        low52: `$${quote.fiftyTwoWeekLow?.toFixed(2) || 'N/A'}`,
        dividend: quote.dividendYield ? `${(quote.dividendYield * 100).toFixed(2)}%` : 'N/A',
        beta: quote.beta?.toFixed(2) || 'N/A',
      });
    } catch (err) {
      setError('Failed to fetch stock data. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatLargeNumber = (num: number | undefined): string => {
    if (!num) return 'N/A';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return num.toLocaleString();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const isPositive = stockData?.change?.startsWith('+');

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-[#0b1221] overflow-hidden">
      {/* Header with Search */}
      <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-800 bg-slate-900/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-500/10 text-blue-400">
            <IconBrain className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Financial X-Ray</h2>
            <p className="text-[9px] text-slate-500">CFA-Level Deep Dive & Valuation</p>
          </div>
        </div>
        
        {/* Search Input */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="AAPL"
              className="w-28 px-3 py-1.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !ticker.trim()}
            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 min-h-[280px]">
        {/* Empty State */}
        {!stockData && !loading && !error && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-slate-600 mb-2">
              <svg className="h-10 w-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Enter a ticker to scan fundamentals</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-red-500/50 mb-2">
              <svg className="h-10 w-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="h-8 w-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Analyzing {ticker}...</p>
          </div>
        )}

        {/* Stock Data */}
        {stockData && !loading && (
          <div className="space-y-4">
            {/* Stock Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-14 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-sm">
                  {stockData.symbol}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{stockData.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-bold text-white">{stockData.price}</span>
                    <span className={`text-xs font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stockData.change} ({stockData.changePercent})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'P/E Ratio', value: stockData.peRatio },
                { label: 'EPS', value: stockData.eps },
                { label: 'Market Cap', value: stockData.marketCap },
                { label: 'Beta', value: stockData.beta },
                { label: '52W High', value: stockData.high52 },
                { label: '52W Low', value: stockData.low52 },
                { label: 'Dividend', value: stockData.dividend },
                { label: 'Volume', value: stockData.volume },
              ].map((metric, i) => (
                <div key={i} className="bg-slate-900/80 rounded-lg p-2 text-center">
                  <div className="text-[8px] text-slate-500 uppercase font-bold mb-1">{metric.label}</div>
                  <div className="text-[11px] font-mono font-bold text-white">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockDeepDive;
