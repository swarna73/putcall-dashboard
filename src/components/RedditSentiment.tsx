import React from 'react';
import { RedditTicker } from '../types';
import { IconMessage, IconZap, IconActivity, IconTrendingUp, IconTrendingDown } from './Icons';

interface RedditSentimentProps {
  trends: RedditTicker[];
}

const RedditSentiment: React.FC<RedditSentimentProps> = ({ trends }) => {
  const topTicker = trends.length > 0 ? trends[0] : null;
  const runnersUp = trends.slice(1, 5); 

  // Matrix Rain Column Component
  const MatrixColumn = ({ words, speed, offset, opacity = "opacity-20" }: { words: string[], speed: string, offset: string, opacity?: string }) => (
    <div className={`flex flex-col gap-4 ${opacity} font-mono text-xs font-bold uppercase tracking-widest text-emerald-500 select-none ${speed}`} style={{ marginTop: offset }}>
      {/* Repeat words to create infinite scroll illusion */}
      {[...words, ...words, ...words, ...words].map((word, i) => (
        <span key={i} className="whitespace-nowrap writing-vertical-lr">{word}</span>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      {/* Hero Section: The "King of the Hill" */}
      {topTicker ? (
        <div className="relative w-full overflow-hidden rounded-2xl border border-indigo-500/30 bg-[#0f172a] shadow-2xl shadow-indigo-900/20 animate-in fade-in duration-700 group">
           
           {/* Background Gradient */}
           <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] z-0"></div>
           
           {/* MATRIX RAIN BACKGROUND - Made more visible */}
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
                 
                 <div className="flex items-start gap-3 rounded-xl bg-slate-900/60 p-4 border border-slate-700/50 backdrop-blur-md max-w-xl">
                    <IconMessage className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-slate-200 leading-relaxed italic">
                        "{topTicker.discussionSummary}"
                    </p>
                 </div>
              </div>

              {/* Right: Detailed Leaderboard Table */}
              <div className="lg:col-span-5 bg-[#0b1221]/90 backdrop-blur-md border-t lg:border-t-0 border-slate-800">
                 <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-950/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trending Runners Up</span>
                    <IconActivity className="h-4 w-4 text-slate-600" />
                 </div>
                 
                 <div className="flex flex-col">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-900/30 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-2">Rank</div>
                        <div className="col-span-3">Ticker</div>
                        <div className="col-span-4 text-right">Vol Δ</div>
                        <div className="col-span-3 text-right">Score</div>
                    </div>

                    {/* Table Rows */}
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
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="w-full space-y-4 animate-pulse">
           <div className="h-[350px] w-full rounded-2xl bg-slate-900/30 border border-slate-800"></div>
        </div>
      )}
    </div>
  );
};

export default RedditSentiment;