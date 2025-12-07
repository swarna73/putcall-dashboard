// NEW COMPONENT: Multi-Source Trending Stocks
// File: /src/components/MultiSourceTrending.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { RedditTicker } from '../types';
import { IconTrendingUp, IconTrendingDown } from './Icons';

interface TrendingStock {
  symbol: string;
  name: string;
  sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
  sentimentScore?: number;
  source: string;
  mentions?: number;
  change?: string;
}

interface MultiSourceTrendingProps {
  redditTrends: RedditTicker[];
}

const MultiSourceTrending: React.FC<MultiSourceTrendingProps> = ({ redditTrends }) => {
  const [stocktwits, setStocktwits] = useState<TrendingStock[]>([]);
  const [yahoo, setYahoo] = useState<TrendingStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingSources();
  }, []);

  const fetchTrendingSources = async () => {
    try {
      const response = await fetch('/api/trending-sources');
      const data = await response.json();
      setStocktwits(data.stocktwits || []);
      setYahoo(data.yahoo || []);
    } catch (error) {
      console.error('Failed to fetch trending sources:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get consensus stocks (mentioned on multiple platforms)
  const getConsensusStocks = () => {
    const allSymbols = new Set<string>();
    const symbolCount = new Map<string, number>();

    // Count occurrences
    [...redditTrends.slice(0, 5), ...stocktwits.slice(0, 5), ...yahoo.slice(0, 5)].forEach(stock => {
      const symbol = stock.symbol;
      symbolCount.set(symbol, (symbolCount.get(symbol) || 0) + 1);
      allSymbols.add(symbol);
    });

    // Return stocks mentioned on 2+ platforms
    return Array.from(symbolCount.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([symbol, count]) => ({ symbol, platforms: count }));
  };

  const consensus = getConsensusStocks();

  const getSentimentColor = (score?: number) => {
    if (!score) return 'text-slate-400';
    if (score >= 70) return 'text-emerald-400';
    if (score >= 55) return 'text-green-400';
    if (score >= 45) return 'text-slate-400';
    if (score >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSentimentIcon = (sentiment?: string) => {
    if (sentiment === 'Bullish') return <IconTrendingUp className="h-3 w-3" />;
    if (sentiment === 'Bearish') return <IconTrendingDown className="h-3 w-3" />;
    return null;
  };

  return (
    <div className="w-full space-y-4">
      {/* Header with Consensus */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Multi-Platform Trending Stocks</h2>
        {consensus.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
              🎯 {consensus.length} Consensus Picks
            </span>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Reddit Column */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-orange-900/20 to-red-900/20 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-sm font-bold text-white">Reddit</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">WallStreetBets</span>
            </div>
          </div>
          
          <div className="p-3 space-y-2">
            {redditTrends.slice(0, 5).map((stock, idx) => (
              <div key={stock.symbol} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-colors group">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 w-4">#{idx + 1}</span>
                  <div>
                    <div className="font-bold text-white text-sm">{stock.symbol}</div>
                    <div className="text-[10px] text-slate-500">{stock.mentions?.toLocaleString()}</div>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${getSentimentColor(stock.sentimentScore)}`}>
                  {getSentimentIcon(stock.sentiment)}
                  <span>{stock.sentimentScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* StockTwits Column */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                <span className="text-sm font-bold text-white">StockTwits</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Traders</span>
            </div>
          </div>
          
          <div className="p-3 space-y-2">
            {loading ? (
              <div className="text-center text-slate-500 text-xs py-4">Loading...</div>
            ) : stocktwits.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-4">No data</div>
            ) : (
              stocktwits.slice(0, 5).map((stock, idx) => (
                <div key={stock.symbol} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 w-4">#{idx + 1}</span>
                    <div>
                      <div className="font-bold text-white text-sm">{stock.symbol}</div>
                      <div className="text-[10px] text-slate-500">{stock.mentions?.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold ${getSentimentColor(stock.sentimentScore)}`}>
                    {getSentimentIcon(stock.sentiment)}
                    <span>{stock.sentimentScore}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Yahoo Finance Column */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-sm font-bold text-white">Yahoo Finance</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Mainstream</span>
            </div>
          </div>
          
          <div className="p-3 space-y-2">
            {loading ? (
              <div className="text-center text-slate-500 text-xs py-4">Loading...</div>
            ) : yahoo.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-4">No data</div>
            ) : (
              yahoo.slice(0, 5).map((stock, idx) => (
                <div key={stock.symbol} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 w-4">#{idx + 1}</span>
                    <div>
                      <div className="font-bold text-white text-sm">{stock.symbol}</div>
                      <div className="text-[10px] text-slate-500">{stock.change}</div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold ${getSentimentColor(stock.sentimentScore)}`}>
                    {getSentimentIcon(stock.sentiment)}
                    <span>{stock.sentimentScore}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Consensus Section */}
      {consensus.length > 0 && (
        <div className="rounded-xl border border-emerald-800/30 bg-gradient-to-r from-emerald-950/40 to-green-950/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              🎯 Cross-Platform Consensus
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {consensus.map(({ symbol, platforms }) => (
              <div 
                key={symbol}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 text-sm">{symbol}</span>
                  <span className="text-[10px] text-emerald-300">
                    {platforms === 3 ? '🔥 All 3' : platforms === 2 ? '✓ 2 platforms' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSourceTrending;
