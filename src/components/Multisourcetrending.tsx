// UPDATED COMPONENT: Shows 10 stocks per platform
// File: /src/components/MultiSourceTrending.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { RedditTicker } from '../types';
import { IconTrendingUp, IconTrendingDown, IconAlertTriangle, IconCheckCircle } from './Icons';

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

  // Check if Reddit #1 appears on other platforms
  const validateRedditTop = () => {
    if (redditTrends.length === 0) return null;
    
    const redditTop = redditTrends[0].symbol;
    const onStockTwits = stocktwits.some(s => s.symbol === redditTop);
    const onYahoo = yahoo.some(s => s.symbol === redditTop);
    
    return {
      symbol: redditTop,
      onStockTwits,
      onYahoo,
      platformCount: (onStockTwits ? 1 : 0) + (onYahoo ? 1 : 0),
    };
  };

  // Get consensus stocks (on BOTH StockTwits AND Yahoo)
  const getConsensusStocks = () => {
    const stocktwitsSymbols = new Set(stocktwits.map(s => s.symbol));
    const yahooSymbols = new Set(yahoo.map(s => s.symbol));
    
    // Stocks on BOTH platforms
    const consensus = stocktwits
      .filter(s => yahooSymbols.has(s.symbol))
      .map(s => s.symbol);
    
    return consensus;
  };

  const redditValidation = validateRedditTop();
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Cross-Platform Validation</h2>
        {consensus.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
              🎯 {consensus.length} Consensus Stock{consensus.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Reddit #1 Validation Banner */}
      {redditValidation && (
        <div className={`rounded-xl border p-4 ${
          redditValidation.platformCount === 0 
            ? 'border-orange-800/30 bg-gradient-to-r from-orange-950/40 to-red-950/40'
            : redditValidation.platformCount === 1
            ? 'border-yellow-800/30 bg-gradient-to-r from-yellow-950/40 to-orange-950/40'
            : 'border-emerald-800/30 bg-gradient-to-r from-emerald-950/40 to-green-950/40'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              redditValidation.platformCount === 0 ? 'bg-orange-500/20' :
              redditValidation.platformCount === 1 ? 'bg-yellow-500/20' :
              'bg-emerald-500/20'
            }`}>
              {redditValidation.platformCount === 0 ? (
                <IconAlertTriangle className={`h-5 w-5 text-orange-400`} />
              ) : (
                <IconCheckCircle className={`h-5 w-5 ${
                  redditValidation.platformCount === 1 ? 'text-yellow-400' : 'text-emerald-400'
                }`} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-bold ${
                  redditValidation.platformCount === 0 ? 'text-orange-400' :
                  redditValidation.platformCount === 1 ? 'text-yellow-400' :
                  'text-emerald-400'
                }`}>
                  Reddit's Top Pick: {redditValidation.symbol}
                </span>
                <span className="text-xs text-slate-400">
                  {redditValidation.onStockTwits && '✔ StockTwits'}
                  {redditValidation.onStockTwits && redditValidation.onYahoo && ' • '}
                  {redditValidation.onYahoo && '✔ Yahoo'}
                </span>
              </div>
              <p className={`text-xs ${
                redditValidation.platformCount === 0 ? 'text-orange-300/80' :
                redditValidation.platformCount === 1 ? 'text-yellow-300/80' :
                'text-emerald-300/80'
              }`}>
                {redditValidation.platformCount === 0 && 
                  '⚠️ Reddit-only stock. Not trending on institutional platforms. Higher risk meme play.'}
                {redditValidation.platformCount === 1 && 
                  '⚡ Trending on 2 platforms. Gaining broader attention.'}
                {redditValidation.platformCount === 2 && 
                  '🔥 Strong consensus! Trending across retail AND institutional platforms.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2-Column Comparison: StockTwits + Yahoo - NOW SHOWING 10 EACH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* StockTwits Column */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                <span className="text-sm font-bold text-white">StockTwits</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Active Traders</span>
            </div>
          </div>
          
          <div className="p-3 space-y-1.5 max-h-[480px] overflow-y-auto">
            {loading ? (
              <div className="text-center text-slate-500 text-xs py-4">Loading...</div>
            ) : stocktwits.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-4">No data available</div>
            ) : (
              stocktwits.slice(0, 10).map((stock, idx) => (
                <div key={stock.symbol} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-colors group">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 w-5">#{idx + 1}</span>
                    <div>
                      <div className="font-bold text-white text-sm">{stock.symbol}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{stock.name}</div>
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
          
          <div className="p-3 space-y-1.5 max-h-[480px] overflow-y-auto">
            {loading ? (
              <div className="text-center text-slate-500 text-xs py-4">Loading...</div>
            ) : yahoo.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-4">No data available</div>
            ) : (
              yahoo.slice(0, 10).map((stock, idx) => (
                <div key={stock.symbol} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 w-5">#{idx + 1}</span>
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
              🎯 Institutional + Retail Consensus
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {consensus.map((symbol) => (
              <div 
                key={symbol}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 text-sm">{symbol}</span>
                  <span className="text-[10px] text-emerald-300">✔ Both platforms</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-emerald-300/60 mt-3">
            These stocks are trending on both StockTwits (traders) and Yahoo Finance (mainstream), indicating broader market interest.
          </p>
        </div>
      )}
    </div>
  );
};

export default MultiSourceTrending;
