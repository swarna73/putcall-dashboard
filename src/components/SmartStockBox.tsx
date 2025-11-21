import React from 'react';
import { FundamentalPick } from '../types';
import { IconBrain, IconActivity } from './Icons';

interface SmartStockBoxProps {
  picks: FundamentalPick[];
}

const SmartStockBox: React.FC<SmartStockBoxProps> = ({ picks }) => {
  return (
    <div className="w-full rounded-2xl border border-indigo-500/20 bg-[#0a0f1e] overflow-hidden shadow-2xl shadow-indigo-900/10">
      
      {/* Header */}
      <div className="relative p-5 border-b border-indigo-500/10 bg-gradient-to-r from-indigo-950/30 to-transparent">
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <IconBrain className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Alpha Picks</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Deep Value & Fundamentals</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {picks.length === 0 ? (
          <div className="py-12 text-center opacity-50">
            <div className="h-1 w-16 mx-auto bg-indigo-500/50 rounded mb-4 animate-pulse"></div>
            <p className="text-xs text-indigo-200/60">Scanning fundamentals...</p>
          </div>
        ) : (
          picks.map((pick, index) => (
            <div 
              key={`${pick.symbol}-${index}`} 
              className="group relative rounded-xl bg-slate-900/40 border border-slate-800 p-4 transition-all hover:bg-slate-900 hover:border-indigo-500/40"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white tracking-tight">{pick.symbol}</h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 uppercase tracking-wide">
                      {pick.sector}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium truncate w-32">{pick.name}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-indigo-300">{pick.price}</div>
                  <div className={`text-[9px] font-bold uppercase tracking-wide mt-1 ${
                      pick.conviction === 'Strong Buy' ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    {pick.conviction}
                  </div>
                </div>
              </div>

              {/* Metrics Strip */}
              <div className="flex divide-x divide-slate-800 border-y border-slate-800 mb-3 bg-slate-950/30 rounded-lg overflow-hidden">
                <div className="flex-1 p-2 text-center">
                  <div className="text-[8px] text-slate-500 uppercase font-bold">P/E</div>
                  <div className="text-xs font-mono text-slate-200">{pick.metrics.peRatio}</div>
                </div>
                <div className="flex-1 p-2 text-center">
                   <div className="text-[8px] text-slate-500 uppercase font-bold">Mkt Cap</div>
                   <div className="text-xs font-mono text-slate-200">{pick.metrics.marketCap}</div>
                </div>
                <div className="flex-1 p-2 text-center">
                   <div className="text-[8px] text-slate-500 uppercase font-bold">Yield</div>
                   <div className="text-xs font-mono text-green-400">{pick.metrics.dividendYield}</div>
                </div>
              </div>

              <div className="relative">
                <p className="text-xs leading-relaxed text-slate-400 line-clamp-3 group-hover:text-slate-300 transition-colors">
                  {pick.analysis}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="bg-indigo-950/20 p-3 text-center border-t border-indigo-500/10">
         <p className="text-[9px] text-indigo-300/40 uppercase tracking-widest flex items-center justify-center gap-2">
           <IconActivity className="h-3 w-3" /> AI Analysis • Not Advice
         </p>
      </div>
    </div>
  );
};

export default SmartStockBox;
