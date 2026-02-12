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
  raw_text: string;
}

interface GroupedAlert {
  ticker: string;
  companyName: string;
  insiderName: string;
  insiderTitle: string;
  transactionType: 'BUY' | 'SELL';
  totalShares: number;
  totalValue: number;
  avgPrice: number;
  tradeDate: string;
  secFilingUrl: string;
  tradeCount: number;
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
  const [alerts, setAlerts] = useState<GroupedAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  
  const [ticker, setTicker] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [trades, setTrades] = useState<SearchTrade[]>([]);
  const [searchedTicker, setSearchedTicker] = useState('');
  const [noData, setNoData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVerifiedAlerts();
  }, []);

  const parseInsiderTitle = (rawText: string, insiderName: string): string => {
    // Try to extract title from raw_text like "John Smith (CEO) bought..."
    const titleMatch = rawText?.match(/\(([^)]+)\)/);
    if (titleMatch) {
      const title = titleMatch[1];
      // Filter out non-title matches
      if (['CEO', 'CFO', 'COO', 'CTO', 'President', 'Director', 'VP', 'Chairman', 'Insider', 'Officer', '10% Owner'].some(t => title.includes(t))) {
        return title;
      }
    }
    return 'Insider';
  };

  const groupAlerts = (rawAlerts: InsiderAlert[]): GroupedAlert[] => {
    const grouped: { [key: string]: GroupedAlert } = {};
    
    for (const alert of rawAlerts) {
      // Create unique key for grouping: ticker + insider + date + type
      const key = `${alert.ticker}-${alert.insider_name}-${alert.trade_date}-${alert.transaction_type}`;
      
      if (grouped[key]) {
        // Add to existing group
        grouped[key].totalShares += alert.shares || 0;
        grouped[key].totalValue += parseFloat(alert.amount?.replace(/[$,KMB]/g, '') || '0') * 
          (alert.amount?.includes('M') ? 1000000 : alert.amount?.includes('K') ? 1000 : 1);
        grouped[key].tradeCount++;
      } else {
        // Create new group
        const valueNum = parseFloat(alert.amount?.replace(/[$,KMB]/g, '') || '0') * 
          (alert.amount?.includes('M') ? 1000000 : alert.amount?.includes('K') ? 1000 : 1);
        
        grouped[key] = {
          ticker: alert.ticker,
          companyName: alert.company_name || alert.ticker,
          insiderName: alert.insider_name || 'Unknown',
          insiderTitle: parseInsiderTitle(alert.raw_text, alert.insider_name),
          transactionType: alert.transaction_type,
          totalShares: alert.shares || 0,
          totalValue: valueNum,
          avgPrice: alert.price_per_share || 0,
          tradeDate: alert.trade_date,
          secFilingUrl: alert.sec_filing_url,
          tradeCount: 1,
        };
      }
    }
    
    // Sort by total value descending
    return Object.values(grouped).sort((a, b) => b.totalValue - a.totalValue);
  };

  const fetchVerifiedAlerts = async () => {
    try {
      const response = await fetch('/api/insider-alerts?limit=20&verified=true');
      if (response.ok) {
        const data = await response.json();
        const grouped = groupAlerts(data.alerts || []);
        setAlerts(grouped.slice(0, 8)); // Show top 8 grouped
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

  const formatShares = (shares: number) => {
    if (shares >= 1000000) return `${(shares / 1000000).toFixed(1)}M`;
    if (shares >= 1000) return `${(shares / 1000).toFixed(0)}K`;
    return shares.toString();
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
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Recent Verified Trades (≥$100K)
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {alerts.map((alert, idx) => (
              <a
                key={idx}
                href={alert.secFilingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-slate-800/50 rounded-lg p-3 hover:bg-slate-800 transition border border-transparent hover:border-slate-600"
              >
                {/* Top row: Ticker, Company, Badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">${alert.ticker}</span>
                    <span className="text-slate-500 text-xs truncate max-w-[120px]">{alert.companyName}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    alert.transactionType === 'BUY' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {alert.transactionType}
                  </span>
                </div>
                
                {/* Middle row: Insider name + title */}
                <div className="text-sm text-slate-300 mb-1.5">
                  {alert.insiderName}
                  <span className="text-slate-500 ml-1">• {alert.insiderTitle}</span>
                </div>
                
                {/* Bottom row: Value, Shares, Date */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${
                      alert.transactionType === 'BUY' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatValue(alert.totalValue)}
                    </span>
                    <span className="text-slate-400">
                      {formatShares(alert.totalShares)} shares
                    </span>
                    {alert.avgPrice > 0 && (
                      <span className="text-slate-500">
                        @ ${alert.avgPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500">{formatDate(alert.tradeDate)}</span>
                </div>
                
                {/* Trade count indicator */}
                {alert.tradeCount > 1 && (
                  <div className="text-xs text-slate-500 mt-1">
                    {alert.tradeCount} transactions combined
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-slate-400 text-sm text-center py-4 mb-4">
          No recent insider trades found
        </div>
      )}

      {/* Search Section */}
      <div className="border-t border-slate-700/50 pt-4">
        <div className="text-xs text-slate-400 mb-2">Search by ticker</div>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="AAPL, NVDA, TSLA..."
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
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <div className="text-xs text-slate-400 mb-1">Results for ${searchedTicker}</div>
            {trades.map((trade, idx) => (
              <div
                key={idx}
                className="bg-slate-800/30 rounded-lg p-2.5 text-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white">{trade.ownerName}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    trade.transactionType === 'Buy' 
                      ? 'bg-green-500/20 text-green-400' 
                      : trade.transactionType === 'Sell'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {trade.transactionType}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{trade.ownerTitle}</span>
                  <span className="text-slate-300">
                    {formatValue(trade.totalValue)} • {trade.shares.toLocaleString()} shares
                  </span>
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
            View all filings on SEC →
          </a>
        )}
      </div>
    </div>
  );
};

export default InsiderTrading;

