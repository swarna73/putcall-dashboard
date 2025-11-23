
import React from 'react';
import { FundamentalPick } from '../types';
import { IconActivity, IconTrendingUp, IconTrendingDown } from './Icons';

interface SmartStockBoxProps {
  picks: FundamentalPick[];
}

const SmartStockBox: React.FC<SmartStockBoxProps> = ({ picks }) => {
  return (
    <div className="space-y-4">
      {picks.length === 0 ? (
        <div className="rounded-lg border border-emerald-900/30 bg-emerald-950/10 p-6 text-center">
           <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
           <p className="text-xs font-medium text-emerald-500/50">Scanning Technicals & Fundamentals...</p>
        </div>
      ) : (
        picks.map((pick, index) => (
          <div 
            key={`${pick.symbol}-${index}`} 
            className="group relative overflow-hidden rounded-xl border border-slate-800 bg-[#0f172a] p-4 transition-all hover:border-emerald-500/50 hover:bg-[#0f192d] hover:shadow-lg hover:shadow-emerald-900/10"
          >
            {/* HEADER: Symbol, Price, Conviction */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-800 font-black text-white text-lg ring-1 ring-slate-700">
                    {pick.symbol[0]}
                 </div>
                 <div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-lg font-black text-white tracking-tight">{pick.symbol}</h3>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{pick.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-sm font-bold text-emerald-400">{pick.price}</span>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                            pick.conviction === 'Strong Buy' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                            {pick.conviction}
                        </span>
                    </div>
                 </div>
              </div>
              
              {/* RSI INDICATOR (Mini Gauge) */}
              <div className="text-right">
                 <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">RSI (14D)</div>
                 <div className={`inline-flex items-center justify-center rounded px-2 py-1 text-xs font-black ${
                    pick.metrics.rsi > 70 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    pick.metrics.rsi < 30 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    'bg-slate-700 text-slate-300 border border-slate-600'
                 }`}>
                    {pick.metrics.rsi}
                 </div>
              </div>
            </div>

            {/* TRADER'S CHEAT SHEET GRID */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Technicals Column */}
                <div className="space-y-1.5">
                    <h4 className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest border-b border-slate-800 pb-1 mb-2">Technicals</h4>
                    
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Short Float</span>
                        <span className="font-mono font-bold text-slate-200">{pick.metrics.shortFloat}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Beta</span>
                        <span className="font-mono font-bold text-slate-200">{pick.metrics.beta}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Range 52w</span>
                        <span className="font-mono font-bold text-slate-200 text-[10px]">{pick.metrics.range52w}</span>
                    </div>
                </div>

                {/* Levels Column */}
                <div className="space-y-1.5">
                    <h4 className="text-[9px] font-bold text-blue-500 uppercase tracking-widest border-b border-slate-800 pb-1 mb-2">Key Levels</h4>
                    
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Resistance</span>
                        <span className="font-mono font-bold text-red-400">{pick.technicalLevels?.resistance || '--'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Support</span>
                        <span className="font-mono font-bold text-emerald-400">{pick.technicalLevels?.support || '--'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Stop Loss</span>
                        <span className="font-mono font-bold text-orange-400">{pick.technicalLevels?.stopLoss || '--'}</span>
                    </div>
                </div>
            </div>

            {/* FUNDAMENTAL MINI-BAR */}
            <div className="grid grid-cols-3 gap-px bg-slate-800 rounded overflow-hidden mb-3 border border-slate-700/50">
                <div className="bg-[#0b1221] py-1.5 text-center">
                    <div className="text-[8px] text-slate-500">P/E</div>
                    <div className="text-[10px] font-mono font-bold text-slate-300">{pick.metrics.peRatio}</div>
                </div>
                <div className="bg-[#0b1221] py-1.5 text-center">
                    <div className="text-[8px] text-slate-500">EPS Date</div>
                    <div className="text-[10px] font-mono font-bold text-slate-300">{pick.metrics.earningsDate}</div>
                </div>
                <div className="bg-[#0b1221] py-1.5 text-center">
                    <div className="text-[8px] text-slate-500">Yield</div>
                    <div className="text-[10px] font-mono font-bold text-slate-300">{pick.metrics.dividendYield}</div>
                </div>
            </div>

            {/* Thesis Footer */}
            <div className="relative pl-3 border-l-2 border-emerald-500/30">
               <p className="text-[11px] leading-snug text-slate-400">
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
  