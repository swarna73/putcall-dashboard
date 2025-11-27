"use client";

import React, { useState } from 'react';
import { IconSearch, IconX, IconActivity, IconTrendingUp } from './Icons';
import { analyzeInsiderTrading } from '../services/geminiService';
import { InsiderTrade, InsiderAnalysis } from '../types';

interface InsiderTradingProps {
  topTrades: InsiderTrade[];
}

const InsiderTrading: React.FC<InsiderTradingProps> = ({ topTrades }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<InsiderAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      // Add 20-second timeout
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Search timeout - this may mean no recent insider trades were found')), 40000)
      );

      const result = await Promise.race([
        analyzeInsiderTrading(query.toUpperCase()),
        timeoutPromise
      ]);
      
      // Check if result has trades
      if (!result || !result.recentTrades || result.recentTrades.length === 0) {
        setError(`No recent insider trades found for ${query.toUpperCase()}. This could mean no Form 4 filings in the last 90 days.`);
      } else {
        setSearchResult(result);
      }
    } catch (err: any) {
      console.error('Insider trading search error:', err);
      if (err.message.includes('timeout')) {
        setError(`Search timed out for ${query.toUpperCase()}. Try a different ticker or check back later.`);
      } else {
        setError(err?.message || "Search failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResult(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header with Search */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <div className="p-1 rounded bg-orange-500/10 text-orange-400">
             <IconActivity className="h-4 w-4" />
          </div>
          <div className="flex-1">
             <h2 className="text-xs font-bold text-white uppercase tracking-wider">Insider Trading Alert</h2>
             <p className="text-[9px] text-slate-500 font-mono">SMART MONEY MOVES • SEC FORM 4</p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            placeholder="Search ticker (e.g., NVDA, TSLA, META)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-mono px-3 py-2 pr-20 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 uppercase placeholder:normal-case placeholder:text-slate-600"
          />
          {query && (
            <button 
                type="button"
                onClick={clearSearch} 
                className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
                <IconX className="h-3 w-3" />
            </button>
          )}
          <button 
            type="submit"
            disabled={isLoading || !query}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-orange-600 text-white rounded hover:bg-orange-500 disabled:opacity-50 disabled:bg-slate-700 transition-colors"
          >
             {isLoading ? (
               <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
             ) : (
               <IconSearch className="h-3 w-3" />
             )}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-lg border border-orange-500/30 bg-orange-950/20 p-6 text-center">
          <div className="mb-3 h-6 w-6 mx-auto animate-spin rounded-full border-2 border-orange-600 border-t-transparent"></div>
          <p className="text-xs text-slate-400">Scanning SEC filings for {query.toUpperCase()}...</p>
          <p className="text-[10px] text-slate-500 mt-1">This may take up to 20 seconds</p>
        </div>
      )}

      {/* Search Result */}
      {searchResult && !isLoading && (
        <div className="rounded-lg border border-orange-500/30 bg-orange-950/20 p-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">{searchResult.symbol}</h3>
              <p className="text-[10px] text-slate-400">{searchResult.companyName}</p>
            </div>
            <button onClick={clearSearch} className="text-slate-500 hover:text-white">
              <IconX className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-2 mb-3">
            {searchResult.recentTrades.slice(0, 3).map((trade, idx) => (
              <div key={idx} className="flex items-start justify-between text-xs border-b border-slate-800/50 pb-2 last:border-0">
                <div className="flex-1">
                  <div className="font-medium text-slate-300">{trade.insiderName}</div>
                  <div className="text-[10px] text-slate-500">{trade.title}</div>
                  <div className="text-[9px] text-slate-600 mt-0.5">Filed: {trade.filingDate}</div>
                </div>
                <div className="text-right ml-2">
                  <div className={`font-bold ${trade.transactionType === 'Buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trade.transactionType}
                  </div>
                  <div className="text-[10px] text-slate-400">{trade.value}</div>
                  <a 
                    href={`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=&type=4&dateb=&owner=only&count=100&search_text=${searchResult.symbol}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    SEC →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-slate-400 leading-relaxed italic border-t border-slate-800 pt-2">
            {searchResult.analysis}
          </div>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-4">
          <div className="flex items-start gap-2">
            <svg className="h-4 w-4 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-xs text-red-400 font-medium">{error}</p>
              <p className="text-[10px] text-red-400/70 mt-1">
                Try searching for tickers with recent activity: NVDA, TSLA, META, AAPL
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top 5 Insider Trades (Default View) */}
      {!searchResult && !isLoading && (
        <>
          {topTrades.length === 0 ? (
            <div className="flex-1 rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
               <IconActivity className="h-8 w-8 text-slate-700 mb-3" />
               <p className="text-xs text-slate-500 mb-1">No insider trades loaded</p>
               <p className="text-[10px] text-slate-600">Use search above to find recent SEC Form 4 filings</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {topTrades.map((trade, index) => (
                <div 
                  key={`${trade.symbol}-${index}`}
                  className="group relative flex flex-col gap-2 rounded-lg border border-slate-800 bg-[#0b1221] p-3 transition-all hover:border-orange-500/30 hover:bg-[#0f192d] shadow-sm"
                >
                  {/* Row 1: Header */}
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-7 w-14 rounded bg-slate-800 text-white font-bold text-xs tracking-tight border border-slate-700 group-hover:border-orange-500/50 group-hover:text-orange-400 transition-colors">
                           {trade.symbol}
                        </div>
                        <div>
                           <div className="text-[9px] font-medium text-slate-400 leading-none">{trade.companyName}</div>
                        </div>
                     </div>
                     
                     <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        trade.transactionType === 'Buy' 
                          ? 'bg-emerald-950/40 text-emerald-400' 
                          : 'bg-red-950/40 text-red-400'
                     }`}>
                        {trade.transactionType === 'Buy' && <IconTrendingUp className="h-3 w-3" />}
                        {trade.transactionType}
                     </div>
                  </div>

                  {/* Row 2: Insider Details */}
                  <div className="flex items-center justify-between text-xs">
                     <div className="flex-1">
                        <div className="text-slate-300 font-medium">{trade.insiderName}</div>
                        <div className="text-[9px] text-slate-500">{trade.title}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-slate-300 font-mono font-bold">{trade.value}</div>
                        <div className="text-[9px] text-slate-500">{trade.shares} shares</div>
                     </div>
                  </div>

                  {/* Row 3: Date & Source */}
                  <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-800/50 pt-2">
                     <div className="flex items-center gap-2">
                       <span>Filed: {trade.filingDate}</span>
                       <a 
                         href={`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=&type=4&dateb=&owner=only&count=100&search_text=${trade.symbol}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-indigo-400 hover:text-indigo-300 underline text-[8px]"
                       >
                         SEC →
                       </a>
                     </div>
                     <span className="text-orange-400/70">{trade.significance}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InsiderTrading;
