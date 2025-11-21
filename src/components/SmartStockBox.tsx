import React from 'react';
import { FundamentalPick } from '../types';
import { IconBrain } from './Icons';

interface SmartStockBoxProps {
  picks: FundamentalPick[];
}

const SmartStockBox: React.FC<SmartStockBoxProps> = ({ picks }) => {
  return (
    <div className="h-full flex flex-col rounded-xl border border-amber-500/30 bg-[#0a0f1e] shadow-xl shadow-amber-900/5 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl"></div>
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-amber-500/20 bg-gradient-to-r from-amber-950/30 to-transparent p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20">
            <IconBrain className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-amber-100">Alpha Picks</h2>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500">Fundamentals & Deep Value</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4">
        {picks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center opacity-60">
            <div className="h-10 w-10 animate-pulse rounded bg-amber-900/20"></div>
            <p className="text-xs text-amber-200/50">Scanning market fundamentals...</p>
          </div>
        ) : (
          picks.map((pick, index) => (
            <div 
              key={`${pick.symbol}-${index}`} 
              className="group relative overflow-hidden rounded-lg border border-amber-500/10 bg-slate-900/50 p-4 transition-all hover:border-amber-500/40 hover:bg-slate-900"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">{pick.symbol}</h3>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-medium uppercase text-slate-400">{pick.sector}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-300 truncate max-w-[140px]">{pick.name}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-amber-100">{pick.price}</div>
                  <span className={`mt-1 inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide shadow-sm ${
                    pick.conviction === 'Strong Buy' 
                      ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/30' 
                      : 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30'
                  }`}>
                    {pick.conviction}
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="mb-3 grid grid-cols-3 gap-2">
                <div className="rounded bg-slate-950 p-2 text-center ring-1 ring-inset ring-slate-800">
                  <div className="text-[9px] text-slate-500 uppercase">P/E Ratio</div>
                  <div className="font-mono text-xs font-medium text-amber-300">{pick.metrics.peRatio}</div>
                </div>
                <div className="rounded bg-slate-950 p-2 text-center ring-1 ring-inset ring-slate-800">
                  <div className="text-[9px] text-slate-500 uppercase">Mkt Cap</div>
                  <div className="font-mono text-xs font-medium text-slate-300">{pick.metrics.marketCap}</div>
                </div>
                <div className="rounded bg-slate-950 p-2 text-center ring-1 ring-inset ring-slate-800">
                  <div className="text-[9px] text-slate-500 uppercase">Yield</div>
                  <div className="font-mono text-xs font-medium text-green-400">{pick.metrics.dividendYield}</div>
                </div>
              </div>

              <div className="relative rounded bg-amber-950/10 p-3">
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l bg-amber-600/50"></div>
                <p className="text-xs leading-relaxed text-slate-300/90">
                  "{pick.analysis}"
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Footer */}
      <div className="border-t border-amber-500/10 bg-amber-950/20 p-2 text-center backdrop-blur-sm">
         <p className="text-[9px] text-amber-200/40 uppercase tracking-widest">AI Generated • Fundamental Analysis</p>
      </div>
    </div>
  );
};

export default SmartStockBox;