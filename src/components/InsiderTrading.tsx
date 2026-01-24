import React, { useState } from 'react';

interface InsiderTradingProps {
  topTrades?: any[];
}

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
  const [noData, setNoData] = useState(false);

  const handleSearch = async () => {
    if (!ticker.trim()) return;
    
    setLoading(true);
    setError(null);
    setTrades([]);
    setNoData(false);
    setSearchedTicker(ticker.toUpperCase());

    try {
      const finnhubKey = process.env.NEXT_PUBLIC_FINNHUB_KEY;
      
      if (finnhubKey) {
        const response = await fetch(
          `https://finnhub.io/api/v1/stock/insider-transactions?symbol=${ticker.toUpperCase()}&token=${finnhubKey}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const transactions = data.data || [];
          
          if (transactions.length > 0) {
            setTrades(transactions.slice(0, 8).map((t: any) => {
              const price = t.price || 0;
              const shares = Math.abs(t.share || 0);
              const totalValue = Math.abs(shares * price);
              const code = t.transactionCode;

              // SEC Form 4 Transaction Codes - use actual code, not price
              let typeLabel;
              switch (code) {
                case 'P':
                  typeLabel = 'Buy';
                  break;
                case 'S':
                  typeLabel = 'Sell';
                  break;
                case 'A':
                  typeLabel = 'Award';
                  break;
                case 'G':
                  typeLabel = 'Gift';
                  break;
                case 'M':
                  typeLabel = 'Exercise';
                  break;
                case 'F':
                  typeLabel = 'Tax';
                  break;
                case 'D':
                  typeLabel = 'Disposition';
                  break;
                case 'J':
                  typeLabel = 'Gift';
                  break;
                default:
                  typeLabel = code || 'Other';
              }

              return {
                filingDate: t.filingDate,
                transactionDate: t.transactionDate,
                ownerName: t.name,
                ownerTitle: t.position || 'Insider',
                transactionType: typeLabel,
                shares: shares,
                pricePerShare: price,
                totalValue: totalValue,
                sharesOwned: t.shareOwned || 0,
              };
            }));
            return;
          }
        }
      }

      setNoData(true);
      
    } catch (err) {
      setError('Failed to fetch insider data. Check SEC directly.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num === 0) return '$0'; // Clean handling for 0
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

  const secUrl = searchedTicker 
    ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${searchedTicker}&type=4&dateb=&owner=include&count=40`
    : 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=4&owner=include&count=40';

  // Helper to determine styles based on transaction type
  const getTransactionStyles = (type: string) => {
    switch (type) {
      case 'Buy':
        return {
          container: 'bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40',
          badge: 'bg-emerald-500/20 text-emerald-400',
          valueText: 'text-emerald-400'
        };
      case 'Sell':
        return {
          container: 'bg-red-950/20 border-red-500/20 hover:border-red-500/40',
          badge: 'bg-red-500/20 text-red-400',
          valueText: 'text-red-400'
        };
      case 'Award':
      case 'Exercise':
        return {
          container: 'bg-blue-950/20 border-blue-500/20 hover:border-blue-500/40',
          badge: 'bg-blue-500/20 text-blue-400',
          valueText: 'text-blue-400'
        };
      case 'Gift':
        return {
          container: 'bg-amber-950/20 border-amber-500/20 hover:border-amber-500/40',
          badge: 'bg-amber-500/20 text-amber-400',
          valueText: 'text-amber-400'
        };
      case 'Tax':
      case 'Disposition':
      default:
        return {
          container: 'bg-slate-800/20 border-slate-500/20 hover:border-slate-500/40',
          badge: 'bg-slate-500/20 text-slate-400',
          valueText: 'text-slate-400'
        };
    }
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
        {/* Empty State - Initial */}
        {trades.length === 0 && !loading && !error && !noData && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-slate-600 mb-2">
              <svg className="h-10 w-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Enter a ticker to find SEC filings</p>
          </div>
        )}

        {/* No Data Found State */}
        {noData && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-slate-600 mb-3">
              <svg className="h-10 w-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xs text-slate-400 mb-1">No recent filings found for <span className="text-orange-400 font-bold">{searchedTicker}</span></p>
            <p className="text-[10px] text-slate-500 mb-3">Check SEC EDGAR for complete history</p>
            <a 
              href={secUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium transition-colors"
            >
              View on SEC →
            </a>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-red-500/50 mb-3">
              <svg className="h-10 w-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-xs text-red-400 mb-3">{error}</p>
            <a 
              href={secUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium transition-colors"
            >
              Check SEC Directly →
            </a>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="h-8 w-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Loading {ticker} filings...</p>
          </div>
        )}

        {/* Trades List - Only shows REAL data */}
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
                href={secUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] text-blue-400 hover:text-blue-300"
              >
                View on SEC →
              </a>
            </div>

            {/* Trades */}
            {trades.map((trade, i) => {
              const styles = getTransactionStyles(trade.transactionType);
              
              return (
                <div 
                  key={i}
                  className={`rounded-lg p-3 border transition-all ${styles.container}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${styles.badge}`}>
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
                      <div className={`text-[11px] font-mono font-bold ${styles.valueText}`}>
                        {formatNumber(trade.totalValue)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsiderTrading;
