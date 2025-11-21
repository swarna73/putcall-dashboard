import React from 'react';
import { RedditTicker } from '../types';
import { IconMessage, IconTrendingUp, IconTrendingDown, IconZap, IconActivity } from './Icons';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RedditSentimentProps {
  trends: RedditTicker[];
}

const RedditSentiment: React.FC<RedditSentimentProps> = ({ trends }) => {
  const topTicker = trends.length > 0 ? trends[0] : null;
  const otherTickers = trends.slice(1);

  return (
    <div className="flex flex-col gap-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
             <IconZap className="h-4 w-4" />
           </div>
           <div>
             <h2 className="text-lg font-bold text-white">Reddit Momentum</h2>
             <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Most Talked About on r/WSB</p>
           </div>
        </div>
      </div>

      {/* Hero Card for #1 Stock */}
      {topTicker ? (
        <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-[#0f172a] p-6 md:p-8 shadow-2xl">
           {/* Dynamic Background */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
           
           <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                 <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-[10px] font-bold text-orange-400 border border-orange-500/20 mb-4">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    TRENDING #1
                 </div>
                 
                 <div className="flex items-baseline gap-4 mb-2">
                    <h1 className="text-5xl font-black tracking-tighter text-white">{topTicker.symbol}</h1>
                    <span className="text-lg font-medium text-slate-400">{topTicker.name}</span>
                 </div>

                 <div className="flex items-center gap-4 text-sm font-medium text-slate-300 mb-6">
                    <div className="flex items-center gap-2">
                       <IconMessage className="h-4 w-4 text-slate-500" />
                       <span>{topTicker.mentions.toLocaleString()} mentions</span>
                    </div>
                    <div className="h-4 w-px bg-slate-800"></div>
                    <div className={`flex items-center gap-2 ${topTicker.sentiment === 'Bullish' ? 'text-green-400' : topTicker.sentiment === 'Bearish' ? 'text-red-400' : 'text-slate-400'}`}>
                       {topTicker.sentiment === 'Bullish' ? <IconTrendingUp className="h-4 w-4"/> : <IconTrendingDown className="h-4 w-4"/>}
                       <span>{topTicker.sentimentScore}/100 Sentiment</span>
                    </div>
                 </div>

                 <p className="text-sm leading-relaxed text-slate-300/90 border-l-2 border-orange-500/50 pl-4 italic">
                    "{topTicker.discussionSummary}"
                 </p>
              </div>

              {/* Mini Chart for Top Stock */}
              <div className="h-[180px] w-full bg-slate-900/50 rounded-xl border border-slate-800 p-4 relative">
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <IconActivity className="h-12 w-12 text-slate-600" />
                 </div>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trends.slice(0, 5)}>
                       <Bar dataKey="mentions" radius={[4, 4, 0, 0]}>
                          {trends.slice(0, 5).map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={index === 0 ? '#f97316' : '#334155'} />
                          ))}
                       </Bar>
                       <Tooltip 
                          cursor={{fill: 'transparent'}}
                          contentStyle={{background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px'}}
                       />
                       <XAxis dataKey="symbol" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      ) : (
        <div className="h-48 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
      )}

      {/* Secondary List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {otherTickers.map((ticker, idx) => (
            <div key={ticker.symbol} className="flex items-center justify-between p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-all group">
               <div className="flex items-center gap-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-800 text-xs font-bold text-slate-500">#{idx + 2}</span>
                  <div>
                     <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">{ticker.symbol}</div>
                     <div className="text-[10px] text-slate-500 max-w-[180px] truncate">{ticker.name}</div>
                  </div>
               </div>
               
               <div className="text-right">
                  <div className="text-xs font-bold text-slate-300">{ticker.mentions} vol</div>
                  <div className={`text-[10px] font-medium flex items-center justify-end gap-1 ${
                     ticker.sentiment === 'Bullish' ? 'text-green-500' : ticker.sentiment === 'Bearish' ? 'text-red-500' : 'text-slate-500'
                  }`}>
                     {ticker.sentiment} {ticker.sentimentScore}%
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default RedditSentiment;
