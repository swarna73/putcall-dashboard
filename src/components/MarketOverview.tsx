
import React from 'react';
import { MarketIndex, MarketSentiment, SectorPerformance } from '../types';
import { IconTrendingUp, IconTrendingDown, IconActivity, IconZap } from './Icons';

interface MarketOverviewProps {
  indices: MarketIndex[];
  sentiment?: MarketSentiment;
  sectors?: SectorPerformance[];
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ indices, sentiment, sectors }) => {
  // Safe defaults if data is loading/missing
  const safeIndices = indices || [];
  const safeSentiment = sentiment || { score: 50, label: 'Neutral', primaryDriver: '' };
  const safeSectors = sectors || [];

  const getSentimentColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 55) return 'text-emerald-200';
    if (score <= 25) return 'text-red-500';
    if (score <= 45) return 'text-orange-400';
    return 'text-slate-200';
  };

  return (
    <div className="w-full border-y border-slate-800 bg-[#0b1221] backdrop-blur-sm shadow-md z-30">
      <div className="container mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center">
          
          {/* 1. Fear & Greed Gauge (Desktop Left) */}
          <div className="hidden md:flex items-center gap-3 border-r border-slate-800 pr-6 py-3 w-[280px] shrink-0">
             <div className="relative h-10 w-10 shrink-0">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  {/* Value Circle */}
                  <path className={getSentimentColor(safeSentiment.score)} strokeDasharray={`${safeSentiment.score}, 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                   {safeSentiment.score}
                </div>
             </div>
             <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Market Sentiment</span>
                <span className={`text-sm font-bold ${getSentimentColor(safeSentiment.score)}`}>
                   {safeSentiment.label}
                </span>
             </div>
          </div>

          {/* 2. Scrolling Ticker (Mobile & Desktop Center) */}
          <div className="flex-1 overflow-x-auto py-3 scrollbar-hide">
            <div className="flex items-center gap-6">
                
                {/* Indices */}
                {safeIndices.map((idx) => (
                    <div key={idx.name} className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-slate-300">{idx.name}</span>
                        <span className="font-mono text-xs text-white">{idx.value}</span>
                        <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            idx.trend === 'Up' ? 'bg-emerald-500/10 text-emerald-400' : 
                            idx.trend === 'Down' ? 'bg-red-500/10 text-red-400' : 'bg-slate-500/10 text-slate-400'
                        }`}>
                            {idx.trend === 'Up' ? <IconTrendingUp className="h-3 w-3" /> : idx.trend === 'Down' ? <IconTrendingDown className="h-3 w-3" /> : null}
                            {idx.change}
                        </span>
                    </div>
                ))}

                {/* Vertical Divider */}
                <div className="h-4 w-px bg-slate-800 shrink-0"></div>

                {/* Sector Rotation */}
                {safeSectors.map((sector) => (
                    <div key={sector.name} className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-500">{sector.name}</span>
                        <span className={`text-xs font-bold ${
                           sector.performance === 'Bullish' ? 'text-emerald-400' : 
                           sector.performance === 'Bearish' ? 'text-red-400' : 'text-slate-400'
                        }`}>
                           {sector.change}
                        </span>
                    </div>
                ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MarketOverview;
