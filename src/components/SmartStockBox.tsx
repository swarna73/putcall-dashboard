import React from 'react';
import { FundamentalPick } from '../types';
import { IconBrain, IconDollar } from './Icons';

interface SmartStockBoxProps {
  picks: FundamentalPick[];
}

const SmartStockBox: React.FC<SmartStockBoxProps> = ({ picks }) => {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-2 px-1">
        <IconBrain className="h-5 w-5 text-emerald-400" />
        <div>
           <h2 className="text-lg font-bold text-white leading-none">Value Hunter</h2>
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fundamentals & Cash Flow</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {picks.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-[#0a0f1e] p-8 text-center">
            <div className="h-8 w-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Scanning P/E ratios...</p>
          </div>
        ) : (
          picks.map((pick, index) => (
            <div 
              key={`${pick.symbol}-${index}`} 
              className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0a0f1e] p-4 transition-all hover:border-emerald-500/40 hover:bg-slate-900 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                   <span className="text-xs font-bold text-slate-500 uppercase mb-0.5 block">{pick.sector}</span>
                   <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors">{pick.symbol}</h3>
                   <div className="text-xs text-slate-300 font-medium truncate max-w-[120px]">{pick.name}</div>
                </div>
                <div className="text-right">
                   <div className="font-mono text-sm font-bold text-white">{pick.price}</div>
                   <div className="mt-1 inline-flex px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 uppercase tracking-wide border border-emerald-500/20">
                      {pick.conviction}
                   </div>
                </div>
              </div>

              {/* Key Metrics Row */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                 <div className="bg-slate-950 rounded p-1.5 text-center border border-slate-800">
                    <div className="text-[8px] text-slate-500 uppercase font-bold">P/E</div>
                    <div className="text-xs font-mono text-emerald-300 font-medium">{pick.metrics.peRatio}</div>
                 </div>
                 <div className="bg-slate-950 rounded p-1.5 text-center border border-slate-800">
                    <div className="text-[8px] text-slate-500 uppercase font-bold">Yield</div>
                    <div className="text-xs font-mono text-emerald-300 font-medium">{pick.metrics.dividendYield}</div>
                 </div>
                 <div className="bg-slate-950 rounded p-1.5 text-center border border-slate-800">
                    <div className="text-[8px] text-slate-500 uppercase font-bold">Mkt Cap</div>
                    <div className="text-xs font-mono text-slate-300 font-medium">{pick.metrics.marketCap}</div>
                 </div>
              </div>

              <p className="text-xs leading-relaxed text-slate-400 border-t border-slate-800/50 pt-2">
                <span className="text-emerald-500/80 mr-1">Analysis:</span>
                {pick.analysis}
              </p>
            </div>
          ))
        )}
      </div>
      
      <div className="rounded-lg bg-slate-900/50 p-3 text-center border border-slate-800/50">
         <p className="text-[10px] text-slate-500">
            AI screening for low P/E & high FCF.
         </p>
      </div>
    </div>
  );
};

export default SmartStockBox;
