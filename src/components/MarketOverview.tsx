
import React from 'react';
import { MarketIndex } from '../types';
import { IconTrendingUp, IconTrendingDown, IconActivity } from './Icons';

interface MarketOverviewProps {
  indices: MarketIndex[];
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ indices }) => {
  if (indices.length === 0) return null;

  return (
    <div className="w-full border-y border-slate-800 bg-[#0b1221] backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-center gap-6 overflow-x-auto py-3 scrollbar-hide">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-r border-slate-800 pr-4 shrink-0">
                <IconActivity className="h-3 w-3" /> Market Pulse
            </div>
            {indices.map((idx) => (
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
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;
