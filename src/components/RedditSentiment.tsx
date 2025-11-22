import React from 'react';
import { RedditTicker } from '../types';
import { IconMessage, IconTrendingUp, IconTrendingDown, IconZap, IconActivity } from './Icons';

interface RedditSentimentProps {
  trends: RedditTicker[];
}

const RedditSentiment: React.FC<RedditSentimentProps> = ({ trends }) => {
  const topTicker = trends.length > 0 ? trends[0] : null;
  const runnersUp = trends.slice(1, 5); // Take next 4

  return (
    <div className="w-full">
      {/* Hero Section: The "King of the Hill" */}
      {topTicker ? (
        <div className="relative w-full overflow-hidden rounded-2xl border border-orange-500/20 bg-[#0f172a] shadow-2xl shadow-orange-900/10">
           
           {/* Background Elements */}
           <div className="absolute inset-0 bg-gradient-to-r from-[#1a1008] via-[#0f172a] to-[#0f172a]"></div>
           <div className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-orange-600/5 blur-[100px]"></div>
           <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-orange-500/5 to-transparent opacity-50"></div>

           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 lg:p-8">
              
              {/* Left: The #1 Stock Info */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                 <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-400 ring-1 ring-orange-500/20">
                       <IconZap className="h-3 w-3 fill-current" />
                       Most Talked About
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">r/WallStreetBets • r/Stocks</span>
                 </div>
                 
                 <div className="flex items-baseline gap-4 mb-2">
                    <h1 className="text-7xl lg:text-8xl font-black tracking-tighter text-white">
                       {topTicker.symbol}
                    </h1>
                    <span className="text-lg font-medium text-slate-400 hidden sm:inline-block">{topTicker.name}</span>
                 </div>
                 
                 <div className="mt-4 flex flex-col gap-3">
                    <div className="flex items-start gap-3 rounded-xl bg-slate-900/50 p-4 border border-slate-800/50 backdrop-blur-sm max-w-2xl">
                       <IconMessage className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                       <div>
                          <p className="text-sm font-medium text-slate-200 leading-relaxed">
                             "{topTicker.discussionSummary}"
                          </p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Right: Stats & Sentiment */}
              <div className="lg:col-span-5 flex flex-col gap-4 justify-center border-t border-slate-800/50 pt-6 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-slate-900/40 p-4 border border-slate-800/50">
                       <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Mention Volume</div>
                       <div className="text-2xl font-black text-white tabular-nums">{topTicker.mentions.toLocaleString()}</div>
                       <div className="text-[10px] text-orange-400 mt-1 font-medium">Peak Velocity</div>
                    </div>
                    <div className="rounded-xl bg-slate-900/40 p-4 border border-slate-800/50">
                       <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Sentiment</div>
                       <div className={`text-2xl font-black tabular-nums ${
                          topTicker.sentiment === 'Bullish' ? 'text-emerald-400' : 
                          topTicker.sentiment === 'Bearish' ? 'text-red-400' : 'text-slate-300'
                       }`}>
                          {topTicker.sentimentScore}<span className="text-sm text-slate-600 font-bold">/100</span>
                       </div>
                       <div className={`flex items-center gap-1 text-[10px] font-bold mt-1 uppercase ${
                          topTicker.sentiment === 'Bullish' ? 'text-emerald-500' : 'text-red-500'
                       }`}>
                          {topTicker.sentiment === 'Bullish' ? <IconTrendingUp className="h-3 w-3" /> : <IconTrendingDown className="h-3 w-3" />}
                          {topTicker.sentiment}
                       </div>
                    </div>
                 </div>

                 {/* Mini Leaderboard (Runners Up) embedded in the Hero Card */}
                 <div className="mt-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Next In Line</div>
                    <div className="space-y-2">
                       {runnersUp.map((ticker, idx) => (
                          <div key={ticker.symbol} className="flex items-center justify-between rounded bg-slate-900/30 px-3 py-2 hover:bg-slate-800/50 transition-colors cursor-default">
                             <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-600 w-4">#{idx + 2}</span>
                                <span className="text-sm font-bold text-slate-200">{ticker.symbol}</span>
                             </div>
                             <div className={`text-xs font-bold ${
                                ticker.sentiment === 'Bullish' ? 'text-emerald-500' : 'text-red-500'
                             }`}>
                                {ticker.sentimentScore}%
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

              </div>
           </div>
        </div>
      ) : (
        <div className="h-64 w-full animate-pulse rounded-2xl bg-slate-900/50 border border-slate-800"></div>
      )}
    </div>
  );
};

export default RedditSentiment;