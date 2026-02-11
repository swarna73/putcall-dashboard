"use client";

import React, { useState, useEffect } from 'react';

interface InsiderAlert {
  id: string;
  ticker: string;
  transaction_type: 'BUY' | 'SELL';
  amount: string;
  shares: number;
  price_per_share: number;
  trade_date: string;
  insider_name: string;
  company_name: string;
  sec_filing_url: string;
  verification_status: string;
}

interface SearchTrade {
  filingDate: string;
  transactionDate: string;
  ownerName: string;
  ownerTitle: string;
  transactionType: string;
  shares: number;
  pricePerShare: number;
  totalValue: number;
}

const InsiderTrading: React.FC = () => {
  // Verified alerts state
  const [alerts, setAlerts] = useState<InsiderAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  
  // Search state
  const [ticker, setTicker] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [trades, setTrades] = useState<SearchTrade[]>([]);
  const [searchedTicker, setSearchedTicker] = useState('');
  const [noData, setNoData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch verified alerts on mount
  useEffect(() => {
    fetchVerifiedAlerts();
  }, []);

  const fetchVerifiedAlerts = async () => {
    try {
      const response = await fetch('/api/insider-alerts?limit=8&verified=true');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setAlertsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!ticker.trim()) return;
    
    setSearchLoading(true);
    setError(null);
    setTrades([]);
    setNoData(false);
    setSearchedTicker(ticker.toUpperCase());

    try {
      // Try API Ninjas first
      const apiNinjasKey = process.env.NEXT_PUBLIC_API_NINJAS_KEY;
      
      if (apiNinjasKey) {
        const response = await fetch(
          `https://api.api-ninjas.com/v1/insidertransactions?ticker=${ticker.toUpperCase()}`,
          { headers: { 'X-Api-Key': apiNinjasKey } }
        );
        
        if (response.ok) {
          const transactions = await response.json();
          
          if (transactions && transactions.length > 0) {
            setTrades(transactions.slice(0, 10).map((t: any) => {
              const price = t.transaction_price || 0;
              const shares = Math.abs(t.shares || 0);
              const totalValue = t.transaction_value || Math.abs(shares * price);
              
              const txType = (t.transaction_type || '').toLowerCase();
              const txCode = t.transaction_code;
              
              let typeLabel;
              if (txType.includes('purchase') || txCode === 'P') {
                typeLabel = price > 0 ? 'Buy' : 'Award';
              } else if (txType.includes('sale') || txCode === 'S') {
                typeLabel = price > 0 ? 'Sell' : 'Gift';
              } else if (txType.includes('award') || txCode === 'A') {
                typeLabel = 'Award';
              } else if (txCode === 'M') {
                typeLabel = 'Exercise';
              } else if (txCode === 'F') {
                typeLabel = 'Tax';
              } else {
                typeLabel = txCode || 'Other';
              }

              return {
                filingDate: t.filing_date,
                transactionDate: t.transaction_date || t.filing_date,
                ownerName: t.insider_name,
                ownerTitle: t.insider_position || 'Insider',
                transactionType: typeLabel,
                shares: shares,
                pricePerShare: price,
                totalValue: totalValue,
              };
            }));
            setSearchLoading(false);
            return;
          }
        }
      }
      
      setNoData(true);
    } catch (err) {
      setError('Failed to fetch insider data');
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur rounded-xl border border-slate-700/50 p-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl">📊</span>
            Insider Trading
          </h2>
          <p className="text-slate-400 text-xs">SEC Form 4 • Smart Money</p>
        </div>
      </div>

      {/* Verified Alerts Section */}
      {alertsLoading ? (
        <div className="text-slate-400 text-sm text-center py-4">Loading verified alerts...</div>
      ) : alerts.length > 0 ? (
        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Recent Verified Trades (≥$100K)
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2 text-sm hover:bg-slate-800 transition"
              >
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${alert.transaction_type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                    {alert.transaction_type === 'BUY' ? '↑' : '↓'}
                  </span>
                  <div>
                    <span className="text-white font-semibold">${alert.ticker}</span>
                    <span className="text-slate-400 text-xs ml-2">{alert.insider_name?.split(' ')[0]}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${alert.transaction_type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                    {alert.amount}
                  </div>
                  <div className="text-slate-500 text-xs">{formatDate(alert.trade_date)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Search Section */}
      <div className="border-t border-slate-700/50 pt-4">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter ticker..."
            className="flex-1 bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={searchLoading || !ticker.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {searchLoading ? '...' : 'Search'}
          </button>
        </div>

        {/* Search Results */}
        {error && (
          <div className="text-red-400 text-sm text-center py-2">{error}</div>
        )}
        
        {noData && (
          <div className="text-slate-400 text-sm text-center py-2">
            No insider data found for {searchedTicker}
          </div>
        )}

        {trades.length > 0 && (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            <div className="text-xs text-slate-400 mb-1">Results for ${searchedTicker}</div>
            {trades.map((trade, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-slate-800/30 rounded-lg px-3 py-2 text-sm"
              >
                <div>
                  <div className="text-white">{trade.ownerName}</div>
                  <div className="text-slate-500 text-xs">{trade.ownerTitle}</div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    trade.transactionType === 'Buy' ? 'text-green-400' : 
                    trade.transactionType === 'Sell' ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {trade.transactionType} {formatValue(trade.totalValue)}
                  </div>
                  <div className="text-slate-500 text-xs">
                    {trade.shares.toLocaleString()} @ ${trade.pricePerShare.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SEC Link */}
        {searchedTicker && (
          <a
            href={`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${searchedTicker}&type=4&dateb=&owner=include&count=40`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-blue-400 hover:text-blue-300 text-xs mt-3"
          >
            View on SEC →
          </a>
        )}
      </div>
    </div>
  );
};

export default InsiderTrading;
