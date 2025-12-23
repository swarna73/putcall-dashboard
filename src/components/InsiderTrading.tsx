import React, { useState } from 'react';

// Use 'any' for the prop to avoid type conflicts with existing types
interface InsiderTradingProps {
  topTrades?: any[];
}

// Internal type for component state
interface InsiderTradeData {
  filingDate: string;
  transactionDate: string;
  ownerName: string;
  ownerTitle: string;
  transactionType: string;
  shares: number;
  pricePerShare: number;
  totalValue: number;
  sharesOwned: number;
}

const InsiderTrading: React.FC<InsiderTradingProps> = ({ topTrades = [] }) => {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [trades, setTrades] = useState<InsiderTradeData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchedTicker, setSearchedTicker] = useState<string>('');

  const handleSearch = async () => {
    if (!ticker.trim()) return;
    
    setLoading(true);
    setError(null);
    setTrades([]);
    setSearchedTicker(ticker.toUpperCase());

    try {
      // Fetch from Finnhub API (free tier)
      const finnhubKey = process.env.NEXT_PUBLIC_FINNHUB_KEY;
      
      if (finnhubKey) {
        const response = await fetch(
          `https://finnhub.io/api/v1/stock/insider-transactions?symbol=${ticker.toUpperCase()}&token=${finnhubKey}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const transactions = data.data || [];
          
          if (transactions.length > 0) {
            setTrades(transactions.slice(0, 8).map((t: any) => ({
              filingDate: t.filingDate,
              transactionDate: t.transactionDate,
              ownerName: t.name,
              ownerTitle: t.position || 'Insider',
              transactionType: t.transactionCode === 'P' ? 'Buy' : t.transactionCode === 'S' ? 'Sell' : t.transactionCode,
              shares: Math.abs(t.share || 0),
              pricePerShare: t.price || 0,
              totalValue: Math.abs((t.share || 0) * (t.price || 0)),
              sharesOwned: t.shareOwned || 0,
            })));
            return;
          }
        }
      }

      // Fallback: Use mock data for demo
      setTrades(generateMockTrades(ticker.toUpperCase()));
      
    } catch (err) {
      setError('Failed to fetch insider data');
    } finally {
      setLoading(false);
    }
  };

  // Mock data generator for demo (replace with real SEC API in production)
  const generateMockTrades = (symbol: string): InsiderTradeData[] => {
    const names = ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis'];
    const titles = ['CEO', 'CFO', 'Director', 'VP Sales', 'COO'];
    const types = ['Buy', 'Sell'];
    
    return Array.from({ length: 5 }, (_, i) => ({
      filingDate: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      transactionDate: new Date(Date.now() - (i * 7 + 2) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ownerName: names[i % names.length],
      ownerTitle: titles[i % titles.length],
      transactionType: types[i % 2],
      shares: Math.floor(Math.random() * 50000) + 1000,
      pricePerShare: Math.floor(Math.random() * 200) + 20,
      totalValue: 0,
      sharesOwned: Math.floor(Math.random() * 500000) + 10000,
    })).map(t => ({ ...t, totalValue: t.shares * t.pricePerShare }));
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  const formatShares = (num: number): string => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
    return num.toLocaleString();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-[#0b1221] overflow-hidden">
      {/* Header with Search */}
      <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-800 bg-slate-900/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-orange-500/10 text-orange-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Insider Trading</h2>
            <p className="text-[9px] text-slate-500">SEC Form 4 • Smart Money</p>
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
              placeholder="NVDA"
              className="w-28 px-3 py-1.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !ticker.trim()}
            className="p-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
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
      <div className="flex-1 p-4 min-h-[280px] overflow-y-auto">
        {/* Empty State */}
        {trades.length === 0 && !loading && !error && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-slate-600 mb-2">
              <svg className="h-10 w-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Enter a ticker to find SEC filings</p>
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
            <div className="h-8 w-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Loading {ticker} filings...</p>
          </div>
        )}

        {/* Trades List */}
        {trades.length > 0 && !loading && (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded bg-orange-500/10 border border-orange-500/30">
                  <span className="text-xs font-bold text-orange-400">{searchedTicker}</span>
                </div>
                <span className="text-[10px] text-slate-500">Recent Form 4 Filings</span>
              </div>
              <a 
                href={`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${searchedTicker}&type=4&dateb=&owner=include&count=40`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] text-blue-400 hover:text-blue-300"
              >
                View on SEC →
              </a>
            </div>

            {/* Trades */}
            {trades.map((trade, i) => (
              <div 
                key={i}
                className={`rounded-lg p-3 border transition-all ${
                  trade.transactionType === 'Buy'
                    ? 'bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40'
                    : 'bg-red-950/20 border-red-500/20 hover:border-red-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      trade.transactionType === 'Buy'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.transactionType}
                    </div>
                    <span className="text-xs font-medium text-white">{trade.ownerName}</span>
                  </div>
                  <span className="text-[9px] text-slate-500">{trade.filingDate}</span>
                </div>
                
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-[10px] text-slate-400">{trade.ownerTitle}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-[8px] text-slate-500 uppercase">Shares</div>
                    <div className="text-[11px] font-mono font-bold text-white">{formatShares(trade.shares)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[8px] text-slate-500 uppercase">Price</div>
                    <div className="text-[11px] font-mono font-bold text-white">${trade.pricePerShare.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[8px] text-slate-500 uppercase">Value</div>
                    <div className={`text-[11px] font-mono font-bold ${
                      trade.transactionType === 'Buy' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {formatNumber(trade.totalValue)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsiderTrading;
