'use client';

import { useState, useEffect } from 'react';

interface InsiderAlert {
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

interface FilterState {
  type: 'ALL' | 'BUY' | 'SELL';
  verifiedOnly: boolean;
}

export default function VerifiedInsiderAlerts() {
  const [alerts, setAlerts] = useState<InsiderAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    type: 'ALL',
    verifiedOnly: true,
  });
  
  const limit = 15;

  useEffect(() => {
    fetchAlerts();
  }, [offset, filters]);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        verified: filters.verifiedOnly.toString(),
      });

      if (filters.type !== 'ALL') {
        params.append('type', filters.type);
      }

      const response = await fetch(`/api/insider-alerts?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch');
      }

      setAlerts(data.alerts);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: string | null, shares: number | null, price: number | null) => {
    if (amount) return amount;
    if (shares && price) return `$${(shares * price).toLocaleString()}`;
    if (shares) return `${shares.toLocaleString()} shares`;
    return '-';
  };

  const getVerificationBadge = (status: string) => {
    if (status === 'verified') {
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          SEC Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Partial
      </span>
    );
  };

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Verified Insider Alerts
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Sourced from Reddit • Verified against SEC EDGAR filings
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <select
              value={filters.type}
              onChange={(e) => {
                setFilters({ ...filters, type: e.target.value as FilterState['type'] });
                setOffset(0);
              }}
              className="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Types</option>
              <option value="BUY">Buys Only</option>
              <option value="SELL">Sells Only</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={(e) => {
                  setFilters({ ...filters, verifiedOnly: e.target.checked });
                  setOffset(0);
                }}
                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500"
              />
              Verified only
            </label>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">
            <p>{error}</p>
            <button
              onClick={fetchAlerts}
              className="mt-4 text-blue-400 hover:text-blue-300"
            >
              Try again
            </button>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p>No insider alerts found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Ticker</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Trade Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-4">
                    <span className="text-white font-bold text-lg">${alert.ticker}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      alert.transaction_type === 'BUY'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {alert.transaction_type === 'BUY' ? '↑ BUY' : '↓ SELL'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-white font-medium">
                    {formatAmount(alert.amount, alert.shares, alert.price_per_share)}
                  </td>
                  <td className="px-4 py-4 text-slate-300 hidden sm:table-cell">
                    {formatDate(alert.trade_date)}
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-slate-300 text-sm truncate max-w-[200px] block">
                      {alert.company_name || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {getVerificationBadge(alert.verification_status)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {alert.sec_filing_url && (
                        <a
                          href={alert.sec_filing_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                          title="View SEC Filing"
                        >
                          SEC
                        </a>
                      )}
                      {alert.reddit_url && (
                        <a
                          href={alert.reddit_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-400 hover:text-orange-300 text-sm font-medium"
                          title="View Reddit Post"
                        >
                          Reddit
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && alerts.length > 0 && (
        <div className="p-4 border-t border-slate-700/50 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing {offset + 1}-{Math.min(offset + limit, total)} of {total} alerts
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition"
            >
              Previous
            </button>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
