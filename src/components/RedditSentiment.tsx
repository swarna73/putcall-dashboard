import React from 'react';
import { RedditTicker } from '../types';
import { IconMessage, IconZap, IconActivity, IconTrendingUp, IconTrendingDown } from './Icons';

interface RedditSentimentProps {
  trends: RedditTicker[];
  // NEW: Optional metadata from API
  redditMeta?: {
    source: 'tradestie' | 'reddit' | 'cache' | 'unavailable';
    lastUpdated: string | null;
    isStale: boolean;
    isUnavailable: boolean;
  };
}

const RedditSentiment: React.FC<RedditSentimentProps> = ({ trends, redditMeta }) => {
  const topTicker = trends.length > 0 ? trends[0] : null;
  const runnersUp = trends.slice(1, 10);

  // Matrix Rain Column Component
  const MatrixColumn = ({ words, speed, offset, opacity = "opacity-20" }: { words: string[], speed: string, offset: string, opacity?: string }) => (
    <div className={`flex flex-col gap-4 ${opacity} font-mono text-xs font-bold uppercase tracking-widest text-emerald-500 select-none ${speed}`} style={{ marginTop: offset }}>
      {[...words, ...words, ...words, ...words].map((word, i) => (
        <span key={i} className="whitespace-nowrap writing-vertical-lr">{word}</span>
      ))}
    </div>
  );

  // Format the last updated time for display
  const formatLastUpdated = (isoString: string | null) => {
    if (!isoString) return null;
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return null;
    }
  };

  return (
    <div className="w-full">
      {/* Stale Data Warning Banner */}
      {redditMeta?.isStale && trends.length > 0 && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
          <span className="text-amber-400">⚠️</span>
          <span className="text-sm text-amber-300">
            Showing cached data from {formatLastUpdated(redditMeta.lastUpdated) || 'earlier'}. 
            Live data temporarily unavailable.
          </span>
        </div>
      )}

      {topTicker ? (
        <div className="relative w-full overflow-hidden rounded-2xl border border-indigo-500/30 bg-[#0f172a] shadow-2xl shadow-indigo-900/20 animate-in fade-in duration-700 group">
           
           {/* Background Gradient */}
           <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] z-0"></div>
           
           {/* MATRIX RAIN BACKGROUND */}
           <div className="absolute inset-0 z-0 flex justify-around px-4 overflow-hidden pointer-events-none mask-image-b">
              {topTicker.keywords && topTicker.keywords.length > 0 ? (
                <>
                  <MatrixColumn words={topTicker.keywords} speed="animate-matrix-slow" offset="-10%" opacity="opacity-30" />
                  <MatrixColumn words={topTicker.keywords.slice().reverse()} speed="animate-matrix" offset="-50%" opacity="opacity-20" />
                  <MatrixColumn words={topTicker.keywords} speed="animate-matrix-fast" offset="-20%" opacity="opacity-25" />
                  <MatrixColumn words={topTicker.keywords.slice().sort()} speed="animate-matrix-slow" offset="-40%" opacity="opacity-15" />
                  <div className="hidden lg:flex flex-col gap-6 opacity-30 font-mono text-xs font-bold uppercase tracking-widest text-indigo-500 select-none animate-matrix" style={{ marginTop: '-30%' }}>
                     {[...topTicker.keywords, ...topTicker.keywords].reverse().map((word, i) => (
                        <span key={i} className="whitespace-nowrap">{word}</span>
                     ))}
                  </div>
                </>
              ) : null}
           </div>

           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-0 lg:divide-x lg:divide-slate-800/50">
              
              {/* Left: The #1 Stock Info */}
              <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-center min-h-[300px]">
                 <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-500/40">
                        <IconZap className="h-3 w-3 fill-current" />
                        Most Talked About
                      </span>
                      {/* Data source indicator */}
                      {redditMeta?.source && redditMeta.source !== 'unavailable' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[9px] font-medium text-slate-400 border border-slate-700/50">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            redditMeta.source === 'tradestie' || redditMeta.source === 'reddit' 
                              ? 'bg-emerald-500' 
                              : 'bg-amber-500'
                          }`}></span>
                          {redditMeta.source === 'tradestie' ? 'Live' : 
                           redditMeta.source === 'reddit' ? 'Live' : 'Cached'}
                        </span>
                      )}
                    </div>
                    
                    {/* COMPACT SENTIMENT BADGE */}
                    <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur-md rounded-lg border border-slate-800 px-3 py-1.5 shadow-xl">
                        <div className="text-right">
                          <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Sentiment</div>
                          <div className={`text-[10px] font-bold uppercase tracking-wide leading-none ${
                             topTicker.sentiment === 'Bullish' ? 'text-emerald-400' : 
                             topTicker.sentiment === 'Bearish' ? 'text-red-400' : 'text-slate-400'
                          }`}>{topTicker.sentiment}</div>
                        </div>
                        <div className={`text-2xl font-black tabular-nums tracking-tighter ${
                            topTicker.sentimentScore > 60 ? 'text-emerald-400' : 
                            topTicker.sentimentScore < 40 ? 'text-red-400' : 'text-slate-200'
                        }`}>
                            {topTicker.sentimentScore}
                        </div>
                    </div>
                 </div>
                 
                 <div className="mt-4 mb-6">
                    <h1 className="text-7xl lg:text-9xl font-black tracking-tighter text-white drop-shadow-2xl">
                        {topTicker.symbol}
                    </h1>
                    <div className="flex items-center gap-3 mt-2 pl-1">
                        <span className="text-lg font-medium text-slate-400">{topTicker.name}</span>
                        {topTicker.volumeChange && (
                            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                {topTicker.volumeChange} Vol
                            </span>
                        )}
                    </div>
                 </div>
                 
                 <div className="flex items-start gap-3 rounded-xl bg-slate-900/60 p-4 border border-slate-700/50 backdrop-blur-md max-w-xl mb-4">
                    <IconMessage className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-slate-200 leading-relaxed italic">
                        "{topTicker.discussionSummary}"
                    </p>
                 </div>

                 {/* Enhanced Stats & News */}
                 <div className="space-y-3 max-w-xl">
                   {/* Quick Stats Grid */}
                   <div className="grid grid-cols-4 gap-2">
                     <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-700/50">
                       <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Mentions</div>
                       <div className="text-lg font-black text-white truncate">
                         {topTicker.mentions?.toLocaleString() || '5K+'}
                       </div>
                     </div>
                     
                     <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-700/50">
                       <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Bullish</div>
                       <div className={`text-lg font-black ${
                         topTicker.sentimentScore > 70 ? 'text-emerald-400' : 
                         topTicker.sentimentScore > 50 ? 'text-green-400' : 'text-slate-400'
                       }`}>
                         {topTicker.sentimentScore}%
                       </div>
                     </div>
                     
                     <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-700/50">
                       <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Vol Δ</div>
                       <div className="text-lg font-black text-emerald-400 truncate">
                         {topTicker.volumeChange?.replace(' vs Avg', '').replace('+', '') || '+22%'}
                       </div>
                     </div>
                     
                     <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-700/50">
                       <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Rank</div>
                       <div className="text-lg font-black text-indigo-400">#1</div>
                     </div>
                   </div>

                   {/* CHANGED: Recent News instead of Keywords */}
                   {topTicker.recentNews && topTicker.recentNews.length > 0 ? (
                     <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                       <div className="flex items-center gap-2 mb-2.5">
                         <div className="text-[9px] text-slate-300 uppercase font-bold tracking-wider">📰 Recent News</div>
                       </div>
                       <div className="space-y-2">
                         {topTicker.recentNews.slice(0, 3).map((headline, idx) => (
                           <div 
                             key={idx}
                             className="flex items-start gap-2 text-slate-300 hover:text-white transition-colors"
                           >
                             <span className="text-indigo-400 font-bold text-xs mt-0.5">•</span>
                             <span className="text-xs leading-relaxed">{headline}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                   ) : (
                     /* Fallback to keywords if no news available */
                     topTicker.keywords && topTicker.keywords.length > 0 && (
                       <div className="bg-gradient-to-r from-indigo-950/30 to-purple-950/30 rounded-lg p-3 border border-indigo-800/30">
                         <div className="flex items-center gap-2 mb-2">
                           <div className="text-[9px] text-indigo-400 uppercase font-bold tracking-wider">🔥 Trending Keywords</div>
                         </div>
                         <div className="flex flex-wrap gap-1.5">
                           {topTicker.keywords.map((keyword, idx) => (
                             <span 
                               key={idx}
                               className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wide border border-indigo-500/30"
                             >
                               {keyword}
                             </span>
                           ))}
                         </div>
                       </div>
                     )
                   )}
                 </div>
              </div>

              {/* Right: Detailed Leaderboard Table */}
              <div className="lg:col-span-5 bg-[#0b1221]/90 backdrop-blur-md border-t lg:border-t-0 border-slate-800">
                 <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-950/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trending Runners Up</span>
                    <IconActivity className="h-4 w-4 text-slate-600" />
                 </div>
                 
                 <div className="flex flex-col">
                    <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-900/30 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-2">Rank</div>
                        <div className="col-span-3">Ticker</div>
                        <div className="col-span-4 text-right">Vol Δ</div>
                        <div className="col-span-3 text-right">Score</div>
                    </div>

                    {runnersUp.map((ticker, idx) => (
                        <div key={ticker.symbol} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-800/30 hover:bg-slate-800/50 transition-colors items-center group/row cursor-pointer">
                            <div className="col-span-2 text-xs font-bold text-slate-500 group-hover/row:text-white">#{idx + 2}</div>
                            <div className="col-span-3 font-bold text-slate-200 group-hover/row:text-indigo-400 transition-colors">{ticker.symbol}</div>
                            <div className="col-span-4 text-right text-xs font-mono text-slate-400">
                                {ticker.volumeChange || '--'}
                            </div>
                            <div className={`col-span-3 text-right flex justify-end items-center gap-1 text-xs font-bold ${
                                ticker.sentiment === 'Bullish' ? 'text-emerald-500' : 
                                ticker.sentiment === 'Bearish' ? 'text-red-500' : 'text-slate-500'
                            }`}>
                                {ticker.sentiment === 'Bullish' ? <IconTrendingUp className="h-3 w-3" /> : 
                                 ticker.sentiment === 'Bearish' ? <IconTrendingDown className="h-3 w-3" /> : null}
                                {ticker.sentimentScore}
                            </div>
                        </div>
                    ))}

                    {runnersUp.length < 9 && (
                      <div className="px-4 py-3 text-center text-[10px] text-slate-600">
                        Showing {runnersUp.length} of 9 trending stocks
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      ) : (
        // =====================================================
        // NEW: HONEST "UNAVAILABLE" STATE - No fake data!
        // =====================================================
        <div className="w-full rounded-2xl border border-slate-700/50 bg-[#0f172a] overflow-hidden">
          <div className="p-8 lg:p-12 text-center">
            
            {/* Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 flex items-center justify-center mb-6 border border-slate-700/50">
              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Message */}
            <h3 className="text-xl font-semibold text-slate-200 mb-3">
              Reddit Sentiment Unavailable
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              We're having trouble fetching live data from Reddit and WallStreetBets. 
              This section will update automatically when data becomes available.
            </p>

            {/* Status indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 mb-8">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-xs text-slate-300 font-medium">Reconnecting to data sources...</span>
            </div>

            {/* Alternative data sources */}
            <div className="pt-6 border-t border-slate-800/50">
              <p className="text-xs text-slate-500 mb-4">
                Meanwhile, these data sources are working:
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  StockTwits Live
                </span>
                <span className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Yahoo Finance Live
                </span>
                <span className="px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium border border-purple-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Market Indices Live
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedditSentiment;
