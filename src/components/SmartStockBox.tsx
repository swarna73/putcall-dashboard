import React from 'react';
import { FundamentalPick } from '../types';
import { IconActivity, IconTrendingUp } from './Icons';

interface SmartStockBoxProps {
  picks: FundamentalPick[];
}

const SmartStockBox: React.FC<SmartStockBoxProps> = ({ picks }) => {
  
  return (
    <div className="flex flex-col gap-4 h-full">
      {picks.length === 0 ? (
        <div className="flex-1 rounded-xl border border-emerald-900/30 bg-emerald-950/10 p-8 text-center flex flex-col items-center justify-center">
           <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent opacity-50"></div>
           <p className="text-xs font-bold uppercase tracking-widest text-emerald-500/50">Computing Alpha Scans...</p>
        </div>
      ) : (
        picks.map((pick, index) => (
            <div 
              key={`${pick.symbol}-${index}`} 
              className="group relative overflow-hidden rounded-xl border border-slate-800 bg-[#0b1221] transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-900/10"
            >
              {/* Rank Badge */}
              <div className="absolute top-0 left-0 z-10 bg-slate-800/80 backdrop-blur-sm px-2.5 py-1 rounded-br-lg border-r border-b border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400">#{index + 1} Alpha Pick</span>
              </div>

              {/* Earnings/Catalyst Top Badge */}
              {pick.catalyst && (
                <div className="absolute top-0 right-0 z-10 bg-amber-950/40 backdrop-blur-sm border-b border-l border-amber-900/30 px-3 py-1 flex items-center gap-1.5 rounded-bl-lg">
                    <IconActivity className="h-3 w-3 text-amber-500 animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-200">{pick.catalyst}</span>
                </div>
              )}

              <div className="p-5 pt-8">
                  {/* Header - High Visibility */}
                  <div className="flex items-start justify-between mb-4">
                      <div>
                          <div className="flex items-baseline gap-2">
                             <h3 className="text-3xl font-black text-white tracking-tighter shadow-black drop-shadow-md">{pick.symbol}</h3>
                             <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
                                pick.conviction === 'Strong Buy' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                             }`}>
                                {pick.conviction}
                             </span>
                          </div>
                          {/* Name is now larger and brighter white for visibility */}
                          <div className="text-sm font-bold text-slate-100 mt-1">{pick.name}</div>
                          <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mt-0.5">{pick.sector}</div>
                      </div>
                      
                      <div className="text-right">
                          <div className="text-2xl font-mono font-bold text-emerald-300">{pick.price}</div>
                          <div className="text-[10px] text-slate-500">Target: <span className="text-slate-300">{pick.technicalLevels.resistance}</span></div>
                      </div>
                  </div>

                  {/* Metrics Grid - Compact */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                     <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                        <div className="text-[9px] text-slate-500 uppercase font-bold">P/E Ratio</div>
                        <div className="text-xs font-mono font-bold text-white">{pick.metrics.peRatio}</div>
                     </div>
                     <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                        <div className="text-[9px] text-slate-500 uppercase font-bold">Div Yield</div>
                        <div className="text-xs font-mono font-bold text-emerald-400">{pick.metrics.dividendYield}</div>
                     </div>
                     <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                        <div className="text-[9px] text-slate-500 uppercase font-bold">RSI (14)</div>
                        <div className={`text-xs font-mono font-bold ${
                            pick.metrics.rsi < 35 ? 'text-emerald-400' : 'text-slate-300'
                        }`}>{pick.metrics.rsi}</div>
                     </div>
                  </div>
                  
                  {/* Analyst Commentary */}
                  <div className="relative pl-3 border-l-2 border-indigo-500/30">
                     <p className="text-xs leading-relaxed text-slate-300 italic line-clamp-2">
                        "{pick.analysis}"
                     </p>
                  </div>
              </div>
            </div>
          )
        )
      )}
    </div>
  );
};

export default SmartStockBox;