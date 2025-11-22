import React from 'react';
import { FundamentalPick } from '../types';
import { IconBrain, IconTrendingUp } from './Icons';

interface SmartStockBoxProps {
  picks: FundamentalPick[];
}

const SmartStockBox: React.FC<SmartStockBoxProps> = ({ picks }) => {
  return (
    <div className="space-y-3">
      {picks.length === 0 ? (
        <div className="rounded-lg border border-emerald-900/30 bg-emerald-950/10 p-6 text-center">
           <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
           <p className="text-xs font-medium text-emerald-500/50">Scanning Fundamentals...</p>
        </div>
      ) : (
        picks.map((pick, index) => (
          <div 
            key={`${pick.symbol}-${index}`} 
            className="group relative overflow-hidden rounded-lg border border-slate-800 bg-[#0f172a] p-4 transition-all hover:border-emerald-500/50 hover:bg-[#0f192d] hover:shadow-lg hover:shadow-emerald-900/10"
          >
            {/* Top Row: Symbol & Price */}
            <div className="mb-3 flex items-start justify-between">
              <div>
                 <div className="flex items-baseline gap-2">
                    <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">{pick.symbol}</h3>
                    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{pick.sector}</span>
                 </div>
                 <div className="text-xs font-medium text-slate-400 truncate max-w-[120px]">{pick.name}</div>
              </div>
              <div className="text-right">
                 <div className="font-mono text-sm font-bold text-white">{pick.price}</div>
                 <div className="mt-1 inline-flex rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-500 uppercase border border-emerald-500/20">
                    {pick.conviction}
                 </div>
              </div>
            </div>

            {/* Middle Row: Metrics Grid */}
            <div className="mb-3 grid grid-cols-3 gap-px bg-slate-800 overflow-hidden rounded border border-slate-800">
               <div className="bg-slate-950 p-1.5 text-center group-hover:bg-slate-900 transition-colors">
                  <div className="text-[8px] font-bold text-slate-500 uppercase">P/E</div>
                  <div className="text-xs font-mono font-bold text-emerald-300">{pick.metrics.peRatio}</div>
               </div>
               <div className="bg-slate-950 p-1.5 text-center group-hover:bg-slate-900 transition-colors">
                  <div className="text-[8px] font-bold text-slate-500 uppercase">Yield</div>
                  <div className="text-xs font-mono font-bold text-emerald-300">{pick.metrics.dividendYield}</div>
               </div>
               <div className="bg-slate-950 p-1.5 text-center group-hover:bg-slate-900 transition-colors">
                  <div className="text-[8px] font-bold text-slate-500 uppercase">Cap</div>
                  <div className="text-xs font-mono font-bold text-slate-300">{pick.metrics.marketCap}</div>
               </div>
            </div>

            {/* Bottom Row: Thesis */}
            <div className="relative pt-2 before:absolute before:top-0 before:left-0 before:w-8 before:h-px before:bg-slate-700">
               <p className="text-[11px] leading-relaxed text-slate-400 italic">
                  "{pick.analysis}"
               </p>
            </div>
          </div>
        ))
      )}
      
      {picks.length > 0 && (
         <div className="rounded border border-emerald-900/20 bg-emerald-950/10 p-2 text-center">
            <p className="text-[9px] text-emerald-600/70 uppercase tracking-wider font-bold">
               Value Screen: P/E &lt; 20 • High FCF
            </p>
         </div>
      )}
    </div>
  );
};

export default SmartStockBox;