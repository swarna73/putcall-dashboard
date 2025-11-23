import React from 'react';
import { RedditTicker } from '../types';
import { IconMessage, IconTrendingUp, IconTrendingDown, IconZap } from './Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RedditSentimentProps {
  trends: RedditTicker[];
}

const RedditSentiment: React.FC<RedditSentimentProps> = ({ trends }) => {
  const topTicker = trends.length > 0 ? trends[0] : null;
  const otherTickers = trends.slice(1);

  return (
    <div className="h-full flex flex-col gap-4">
      {/* 1. Spotlight Card: The "Most Talked About" Stock */}
      {topTicker && (
        <div className="relative overflow-hidden rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-950/40 to-[#0f172a] p-6 shadow-lg shadow-orange-900/10">
           <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    <IconZap className="h-3 w-3 fill-current" /> #1 MOST TALKED ABOUT
                  </span>
                  <span className="text-xs font-medium text-orange-200/60 uppercase tracking-wide">r/WallStreetBets</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-white">
                  {topTicker.symbol}
                  <span className="ml-3 text-lg font-medium text-slate-400">{topTicker.name}</span>
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
                  "{topTicker.discussionSummary}"
                </p>
              </div>

              <div className="flex items-center gap-4 rounded-lg bg-slate-900/60 p-3 backdrop-blur-md border border-white/5">
                <div className="text-center">
                   <div className="text-[10px] text-slate-500 uppercase">Mentions</div>
                   <div className="text-xl font-bold text-white">{topTicker.mentions}</div>
                </div>
                <div className="h-8 w-px bg-slate-700"></div>
                <div className="text-center">
                   <div className="text-[10px] text-slate-500 uppercase">Sentiment</div>
                   <div className={`text-xl font-bold ${
                      topTicker.sentiment === 'Bullish' ? 'text-green-400' : 
                      topTicker.sentiment === 'Bearish' ? 'text-red-400' : 'text-slate-400'
                   }`}>
                     {topTicker.sentimentScore}%
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* 2. The Rest of the Pack */}
      <div className="grid gap-4 lg:grid-cols-2 flex-1">
        {/* Chart */}
        <div className="min-h-[200px] rounded-xl border border-slate-800 bg-slate-900/50 p-4">
           <h3 className="mb-4 text-xs font-semibold uppercase text-slate-500 flex items-center gap-2">
             <IconMessage className="h-4 w-4" /> Mention Volume
           </h3>
           <ResponsiveContainer width="100%" height={160}>
            <BarChart data={trends}>
              <XAxis 
                dataKey="symbol" 
                tick={{ fill: '#64748b', fontSize: 10 }} 
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="mentions" radius={[4, 4, 0, 0]}>
                {trends.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? '#f97316' : '#334155'} // Highlight top stock in orange
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* List */}
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[250px] pr-1">
           {otherTickers.map((ticker) => (
             <div key={ticker.symbol} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/30 p-3 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                   <span className="w-8 text-sm font-bold text-slate-500">#{trends.indexOf(ticker) + 1}</span>
                   <div>
                      <div className="font-bold text-slate-200">{ticker.symbol}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 max-w-[120px]">{ticker.discussionSummary}</div>
                   </div>
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${
                  ticker.sentiment === 'Bullish' ? 'bg-green-500/10 text-green-500' : 
                  ticker.sentiment === 'Bearish' ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 text-slate-400'
                }`}>
                  {ticker.sentiment === 'Bullish' ? <IconTrendingUp className="h-3 w-3" /> : <IconTrendingDown className="h-3 w-3" />}
                  {ticker.sentimentScore}
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default RedditSentiment;