import React from 'react';
import { RedditTicker } from '../types';
import { IconMessage, IconZap, IconActivity } from './Icons';

interface RedditSentimentProps {
  trends: RedditTicker[];
}

const RedditSentiment: React.FC<RedditSentimentProps> = ({ trends }) => {
  const topTicker = trends.length > 0 ? trends[0] : null;
  const runnersUp = trends.slice(1, 5); 

  // Matrix Rain Column Component
  const MatrixColumn = ({ words, speed, offset }: { words: string[], speed: string, offset: string }) => (
    <div className={`flex flex-col gap-8 opacity-10 font-mono text-sm font-bold uppercase tracking-widest text-orange-400 select-none ${speed}`} style={{ marginTop: offset }}>
      {/* Repeat words to create infinite scroll illusion */}
      {[...words, ...words, ...words].map((word, i) => (
        <span key={i} className="whitespace-nowrap">{word}</span>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      {/* Hero Section: The "King of the Hill" */}
      {topTicker ? (
        <div className="relative w-full overflow-hidden rounded-2xl border border-orange-500/20 bg-[#0f172a] shadow-2xl shadow-orange-900/10 animate-in fade-in duration-700">
           
           {/* Background Gradient */}
           <div className="absolute inset-0 bg-gradient-to-r from-[#1a1008] via-[#0f172a] to-[#0f172a] z-0"></div>
           <div className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-orange-600/5 blur-[100px] z-0"></div>

           {/* MATRIX RAIN BACKGROUND */}
           <div className="absolute inset-0 z-0 flex justify-between px-10 overflow-hidden pointer-events-none">
              {topTicker.keywords && topTicker.keywords.length > 0 ? (
                <>
                  <MatrixColumn words={topTicker.keywords} speed="animate-matrix-slow" offset="-20%" />
                  <MatrixColumn words={topTicker.keywords.slice().reverse()} speed="animate-matrix" offset="-50%" />
                  <MatrixColumn words={topTicker.keywords} speed="animate-matrix-fast" offset="-10%" />
                  <div className="hidden lg:flex flex-col gap-8 opacity-10 font-mono text-sm font-bold uppercase tracking-widest text-orange-400 select-none animate-matrix-slow" style={{ marginTop: '-30%' }}>
                     {[...topTicker.keywords, ...topTicker.keywords, ...topTicker.keywords].reverse().map((word, i) => (
                        <span key={i} className="whitespace-nowrap">{word}</span>
                     ))}
                  </div>
                </>
              ) : null}
           </div>

           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-0 lg:divide-x lg:divide-slate-800/50">
              
              {/* Left: The #1 Stock Info */}
              <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-center">
                 <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-400 ring-1 ring-orange-500/20">
                       <IconZap className="h-3 w-3 fill-current" />
                       King of the Hill
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Global Retail Sentiment</span>
                 </div>
                 
                 <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-7xl lg:text-8xl font-black tracking-tighter text-white">
                            {topTicker.symbol}
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="block text-lg font-medium text-slate-400">{topTicker.name}</span>
                            {topTicker.volumeChange && (
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    {topTicker.volumeChange} Vol
                                </span>
                            )}
                        </div>
                    </div>

                    {/* SENTIMENT SCORE BOX (Redesigned) */}
                    <div className="flex flex-col items-center justify-center rounded-lg bg-slate-900/90 border border-slate-800 px-4 py-2 backdrop-blur-md shadow-lg">
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Sentiment</span>
                        <div className={`text-3xl font-black tabular-nums tracking-tight ${
                            topTicker.sentimentScore > 60 ? 'text-emerald-400' : 
                            topTicker.sentimentScore < 40 ? 'text-red-400' : 'text-slate-200'
                        }`}>
                            {topTicker.sentimentScore}
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-wide mt-1 px-1.5 rounded-full ${
                             topTicker.sentiment === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400' : 
                             topTicker.sentiment === 'Bearish' ? 'bg-red-500/10 text-red-400' : 'text-slate-400'
                        }`}>{topTicker.sentiment}</span>
                    </div>
                 </div>
                 
                 <div className="flex items-start gap-3 rounded-xl bg-slate-900/50 p-4 border border-slate-800/50 backdrop-blur-sm">
                    <IconMessage className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-slate-200 leading-relaxed italic">
                        "{topTicker.discussionSummary}"
                    </p>
                 </div>
              </div>

              {/* Right: Detailed Leaderboard Table */}
              <div className="lg:col-span-5 bg-[#0b1221]/80 backdrop-blur-sm">
                 <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trending Runners Up</span>
                    <IconActivity className="h-4 w-4 text-slate-600" />
                 </div>
                 
                 <div className="flex flex-col">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-900/30 text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                        <div className="col-span-2">Rank</div>
                        <div className="col-span-3">Ticker</div>
                        <div className="col-span-4 text-right">Vol Δ</div>
                        <div className="col-span-3 text-right">Score</div>
                    </div>

                    {/* Table Rows */}
                    {runnersUp.map((ticker, idx) => (
                        <div key={ticker.symbol} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors items-center group">
                            <div className="col-span-2 text-xs font-bold text-slate-500">#{idx + 2}</div>
                            <div className="col-span-3 font-bold text-slate-200 group-hover:text-orange-400 transition-colors">{ticker.symbol}</div>
                            <div className="col-span-4 text-right text-xs font-mono text-slate-400">
                                {ticker.volumeChange || '--'}
                            </div>
                            <div className={`col-span-3 text-right text-xs font-bold ${
                                ticker.sentiment === 'Bullish' ? 'text-emerald-500' : 
                                ticker.sentiment === 'Bearish' ? 'text-red-500' : 'text-slate-500'
                            }`}>
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