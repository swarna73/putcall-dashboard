import React from 'react';
import { RedditTicker } from '../types';
import { IconMessage, IconTrendingUp, IconTrendingDown, IconZap } from './Icons';

interface RedditSentimentProps {
  trends: RedditTicker[];
}

const RedditSentiment: React.FC<RedditSentimentProps> = ({ trends }) => {
  const topTicker = trends.length > 0 ? trends[0] : null;
  const runnersUp = trends.slice(1);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <IconZap className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-bold text-white">The Retail Pulse</h2>
        <span className="text-xs font-mono text-slate-500 ml-auto uppercase">Source: r/WallStreetBets</span>
      </div>

      {/* Hero Card: The #1 Stock */}
      {topTicker && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1008] to-[#0f172a] border border-orange-500/30 p-6 shadow-2xl shadow-orange-900/10 group">
           {/* Glow Effect */}
           <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-600/10 blur-[80px] transition-opacity group-hover:opacity-70"></div>
           
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-[10px] font-bold text-orange-400 border border-orange-500/20 mb-3">
                       <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                       #1 MOST TALKED ABOUT
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-white mb-1">{topTicker.symbol}</h1>
                    <p className="text-sm font-medium text-slate-400">{topTicker.name}</p>
                 </div>
                 <div className="text-right">
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Sentiment Score</span>
                       <div className={`text-3xl font-black ${topTicker.sentiment === 'Bullish' ? 'text-green-500' : 'text-red-500'}`}>
                          {topTicker.sentimentScore}<span className="text-lg text-slate-600">/100</span>
                       </div>
                       <div className={`flex items-center gap-1 text-xs font-bold mt-1 ${topTicker.sentiment === 'Bullish' ? 'text-green-400' : 'text-red-400'}`}>
                          {topTicker.sentiment === 'Bullish' ? <IconTrendingUp className="h-3 w-3" /> : <IconTrendingDown className="h-3 w-3" />}
                          {topTicker.sentiment.toUpperCase()}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 backdrop-blur-sm">
                 <div className="flex items-start gap-3">
                    <IconMessage className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                       <p className="text-sm text-slate-200 leading-relaxed font-medium">
                          "{topTicker.discussionSummary}"
                       </p>
                       <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wide">
                          Based on {topTicker.mentions.toLocaleString()} mentions in the last 6 hours
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Runners Up List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
         {runnersUp.map((ticker, idx) => (
            <div key={ticker.symbol} className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#0a0f1e] p-3 hover:bg-slate-800/50 hover:border-slate-700 transition-all">
               <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-800 text-xs font-bold text-slate-500">
                     #{idx + 2}
                  </div>
                  <div>
                     <div className="font-bold text-white text-sm">{ticker.symbol}</div>
                  </div>
               </div>
               <div className={`flex items-center gap-2 text-xs font-bold ${
                  ticker.sentiment === 'Bullish' ? 'text-green-500' : 'text-red-500'
               }`}>
                  <span>{ticker.sentimentScore}%</span>
                  {ticker.sentiment === 'Bullish' ? <IconTrendingUp className="h-3 w-3" /> : <IconTrendingDown className="h-3 w-3" />}
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default RedditSentiment;
