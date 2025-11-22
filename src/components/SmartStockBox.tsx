
import React from 'react';
import { FundamentalPick } from '../types';

interface SmartStockBoxProps {
  picks: FundamentalPick[];
}

const SmartStockBox: React.FC<SmartStockBoxProps> = ({ picks }) => {
  return (
    <div className="space-y-4">
      {picks.length === 0 ? (
        <div className="rounded-lg border border-emerald-900/30 bg-emerald-950/10 p-6 text-center">
           <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
           <p className="text-xs font-medium text-emerald-500/50">Scanning Fundamentals...</p>
        </div>
      ) : (
        picks.map((pick, index) => (
          <div 
            key={`${pick.symbol}-${index}`} 
            className="group relative overflow-hidden rounded-xl border border-slate-800 bg-[#0f172a] p-5 transition-all hover:border-emerald-500/50 hover:bg-[#0f192d] hover:shadow-lg hover:shadow-emerald-900/10"
          >
            {/* Top Row: Symbol & Price */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                 <div className="flex items-baseline gap-2">
                    <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors tracking-tight">{pick.symbol}</h3>
                    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500 border border-slate-800 px-1.5 rounded">{pick.sector}</span>
                 </div>
                 <div className="text-xs font-medium text-slate-400 truncate max-w-[160px] mt-0.5">{pick.name}</div>
              </div>
              <div className="text-right">
                 <div className="font-mono text-lg font-bold text-white tracking-tight">{pick.price}</div>
                 <div className="mt-1 inline-flex rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-500 uppercase border border-emerald-500/20">
                    {pick.conviction}
                 </div>
              </div>
            </div>

            {/* Expanded Metrics Grid - REFERENCE QUALITY */}
            <div className="mb-4 grid grid-cols-3 gap-px bg-slate-800/50 overflow-hidden rounded-lg border border-slate-800">
               {/* Row 1 */}
               <div className="bg-[#0b1221] p-2 text-center">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">P/E</div>
                  <div className="text-xs font-mono font-bold text-emerald-300">{pick.metrics.peRatio}</div>
               </div>
               <div className="bg-[#0b1221] p-2 text-center">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">PEG</div>
                  <div className="text-xs font-mono font-bold text-white">{pick.metrics.pegRatio || 'N/A'}</div>
               </div>
               <div className="bg-[#0b1221] p-2 text-center">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Yield</div>
                  <div className="text-xs font-mono font-bold text-emerald-300">{pick.metrics.dividendYield}</div>
               </div>
               {/* Row 2 */}
               <div className="bg-[#0b1221] p-2 text-center border-t border-slate-800/50">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Cap</div>
                  <div className="text-xs font-mono font-bold text-slate-400">{pick.metrics.marketCap}</div>
               </div>
               <div className="bg-[#0b1221] p-2 text-center border-t border-slate-800/50">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Earn.</div>
                  <div className="text-xs font-mono font-bold text-slate-400">{pick.metrics.earningsDate || 'N/A'}</div>
               </div>
               <div className="bg-[#0b1221] p-2 text-center border-t border-slate-800/50">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Range</div>
                  <div className="text-[10px] font-medium text-slate-400 truncate px-1">{pick.metrics.range52w || 'N/A'}</div>
               </div>
            </div>

            {/* Thesis */}
            <div className="relative pt-3 border-t border-slate-800/50">
               <p className="text-xs leading-relaxed text-slate-300/90">
                  <span className="text-emerald-500 font-bold mr-1">Thesis:</span>
                  {pick.analysis}
               </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SmartStockBox;
