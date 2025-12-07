import React from 'react';
import { FundamentalPick } from '../types';
import { IconBrain } from './Icons';

interface SmartStockBoxProps {
  picks: FundamentalPick[];
}

const SmartStockBox: React.FC<SmartStockBoxProps> = ({ picks }) => {
  
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
        <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
           <IconBrain className="h-4 w-4" />
        </div>
        <div>
           <h2 className="text-xs font-bold text-white uppercase tracking-wider">Fundamentals Screener</h2>
           <p className="text-[9px] text-slate-500 font-mono">CRITERIA: FCF+ • LOW DEBT • VALUE</p>
        </div>
      </div>

      {picks.length === 0 ? (
        <div className="flex-1 rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
           <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent opacity-50"></div>
           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Screening Financials...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {picks.map((pick, index) => (
            <div 
              key={`${pick.symbol}-${index}`} 
              className="group relative flex flex-col gap-3 rounded-lg border border-slate-800 bg-[#0b1221] p-4 transition-all hover:border-emerald-500/30 hover:bg-[#0f192d] shadow-sm"
            >
              {/* Row 1: Header */}
	      const showROE = pick.metrics.roe && pick.metrics.roe !== 'N/A';
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded bg-slate-800 text-white font-bold text-sm tracking-tight border border-slate-700 group-hover:border-emerald-500/50 group-hover:text-emerald-400 transition-colors">
                       {pick.symbol}
                    </div>
                    <div>
                       <div className="text-[10px] font-medium text-slate-400 leading-none mb-1">{pick.name}</div>
                       <div className="text-xs font-mono font-bold text-white">{pick.price}</div>
                    </div>
                 </div>
                 
                 <div className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border ${
                    pick.conviction === 'Strong Buy' 
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' 
                      : 'bg-blue-950/40 text-blue-400 border-blue-500/20'
                 }`}>
                    {pick.conviction}
                 </div>
              </div>

              {/* Row 2: The Financials Grid (The Core Request) */}
              <div className="grid grid-cols-3 gap-px bg-slate-800 border border-slate-800 rounded overflow-hidden">
                 <div className="bg-[#0f172a] p-2 text-center group-hover:bg-[#111c33] transition-colors">
                    <div className="text-[8px] text-slate-500 uppercase font-bold mb-0.5">P/E Ratio</div>
                    <div className="text-[10px] font-mono font-bold text-white">{pick.metrics.peRatio}</div>
                 </div>
                 <div className="bg-[#0f172a] p-2 text-center group-hover:bg-[#111c33] transition-colors">
                    <div className="text-[8px] text-slate-500 uppercase font-bold mb-0.5">ROE</div>
                    <div className="text-[10px] font-mono font-bold text-emerald-400">{pick.metrics.roe || '-'}</div>
                 </div>
                 <div className="bg-[#0f172a] p-2 text-center group-hover:bg-[#111c33] transition-colors">
                    <div className="text-[8px] text-slate-500 uppercase font-bold mb-0.5">Free Cash Flow</div>
                    <div className="text-[10px] font-mono font-bold text-blue-300">{pick.metrics.freeCashFlow || '-'}</div>
                 </div>
              </div>

              {/* Row 3: Analysis */}
              <div className="flex gap-2">
                 <div className="w-0.5 rounded bg-slate-700 group-hover:bg-emerald-500 transition-colors"></div>
                 <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                    {pick.analysis}
                 </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartStockBox;
