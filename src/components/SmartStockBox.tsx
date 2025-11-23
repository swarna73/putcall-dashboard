
import React from 'react';
import { FundamentalPick } from '../types';
import { IconBrain, IconActivity, IconAlert, IconTrendingUp, IconTrendingDown } from './Icons';

interface SmartStockBoxProps {
  picks: FundamentalPick[];
}

const SmartStockBox: React.FC<SmartStockBoxProps> = ({ picks }) => {
  
  // Helper to calculate Risk/Reward Ratio and Bar Positions
  const calculateTradeSetup = (priceStr: string, stopStr: string, resStr: string) => {
    const clean = (s: string) => parseFloat(s.replace(/[^0-9.]/g, ''));
    const price = clean(priceStr);
    const stop = clean(stopStr);
    const target = clean(resStr);

    if (!price || !stop || !target) return null;

    // Calculate percentage positions for the bar
    const totalRange = target - stop;
    const currentPos = ((price - stop) / totalRange) * 100;
    
    // Clamp values between 0 and 100
    const markerPos = Math.max(0, Math.min(100, currentPos));
    
    // Risk Reward Calculation
    const risk = price - stop;
    const reward = target - price;
    const rrRatio = risk > 0 ? (reward / risk).toFixed(1) : "N/A";

    return { markerPos, rrRatio };
  };

  return (
    <div className="space-y-4">
      {picks.length === 0 ? (
        <div className="rounded-lg border border-emerald-900/30 bg-emerald-950/10 p-8 text-center">
           <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent opacity-50"></div>
           <p className="text-xs font-bold uppercase tracking-widest text-emerald-500/50">Computing Alpha Scans...</p>
        </div>
      ) : (
        picks.map((pick, index) => {
          const setup = calculateTradeSetup(pick.price, pick.technicalLevels.stopLoss, pick.technicalLevels.resistance);
          
          return (
            <div 
              key={`${pick.symbol}-${index}`} 
              className="group relative overflow-hidden rounded-xl border border-slate-800 bg-[#0b1221] transition-all duration-300 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-900/10"
            >
              {/* Earnings/Catalyst Top Badge */}
              <div className="absolute top-0 right-0 z-10 flex">
                 {pick.catalyst && (
                    <div className="bg-amber-950/40 backdrop-blur-sm border-b border-l border-amber-900/30 px-3 py-1.5 flex items-center gap-1.5">
                       <IconActivity className="h-3 w-3 text-amber-500 animate-pulse" />
                       <span className="text-[9px] font-bold uppercase tracking-wider text-amber-200">{pick.catalyst}</span>
                    </div>
                 )}
                 <div className="bg-slate-900/80 backdrop-blur-md border-b border-l border-slate-800 px-3 py-1.5 flex flex-col items-center min-w-[60px]">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Earnings</span>
                    <span className="text-[10px] font-bold text-white">{pick.metrics.earningsDate || 'N/A'}</span>
                 </div>
              </div>

              {/* Header */}
              <div className="relative p-5 pb-2">
                  <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 text-xl font-black text-white shadow-inner ring-1 ring-white/10">
                          {pick.symbol[0]}
                      </div>
                      <div className="flex-1 pt-1">
                          <h3 className="text-2xl font-black text-white tracking-tighter leading-none">{pick.symbol}</h3>
                          <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium text-slate-400">{pick.name}</span>
                              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">{pick.sector}</span>
                          </div>
                      </div>
                  </div>

                  <div className="mt-5 flex items-end justify-between border-b border-slate-800/50 pb-5">
                      <div>
                          <div className="text-4xl font-mono font-medium text-white tracking-tight">{pick.price}</div>
                          <div className="mt-1 flex items-center gap-2">
                             <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                pick.conviction === 'Strong Buy' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                             }`}>
                                {pick.conviction}
                             </div>
                             {setup && (
                               <div className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                 R:R <span className="text-emerald-300">{setup.rrRatio}</span>
                               </div>
                             )}
                          </div>
                      </div>
                  </div>
              </div>

              {/* Data Grid */}
              <div className="px-5 py-3">
                  {/* VISUAL TRADE SETUP BAR */}
                  <div className="mb-6 relative">
                     <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                        <span className="flex items-center gap-1 text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Stop: {pick.technicalLevels.stopLoss}</span>
                        <span className="flex items-center gap-1 text-emerald-400">Target: {pick.technicalLevels.resistance} <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span></span>
                     </div>
                     <div className="h-2.5 w-full rounded-full bg-slate-800/50 ring-1 ring-slate-700/50 relative overflow-hidden">
                        {/* Gradient Bar representing the range */}
                        <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-slate-800/0 to-emerald-900/20"></div>
                        
                        {/* Price Marker */}
                        {setup && (
                            <div 
                                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white] z-10 transition-all duration-1000"
                                style={{ left: `${setup.markerPos}%` }}
                            ></div>
                        )}
                     </div>
                     {setup && (
                         <div className="absolute top-3.5 -translate-x-1/2 text-[9px] font-mono text-slate-300 transition-all duration-1000" style={{ left: `${setup.markerPos}%` }}>
                             Current
                         </div>
                     )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {/* Column 1: Technicals */}
                      <div>
                          <h4 className="mb-3 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-1">
                             Technicals
                          </h4>
                          <div className="space-y-2.5">
                             <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">RSI (14D)</span>
                                <span className={`font-mono font-bold ${
                                   pick.metrics.rsi < 30 ? 'text-emerald-400' : pick.metrics.rsi > 70 ? 'text-red-400' : 'text-slate-300'
                                }`}>{pick.metrics.rsi}</span>
                             </div>
                             <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Vol / Avg</span>
                                <span className="font-mono font-bold text-amber-300">{pick.metrics.relativeVolume}</span>
                             </div>
                             <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Beta</span>
                                <span className="font-mono font-bold text-slate-300">{pick.metrics.beta}</span>
                             </div>
                          </div>
                      </div>

                      {/* Column 2: Fundamentals */}
                      <div>
                          <h4 className="mb-3 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-1">
                             Fundamentals
                          </h4>
                          <div className="space-y-2.5">
                             <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">P/E</span>
                                <span className="font-mono font-bold text-slate-300">{pick.metrics.peRatio}</span>
                             </div>
                             <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">PEG</span>
                                <span className="font-mono font-bold text-slate-300">{pick.metrics.pegRatio}</span>
                             </div>
                             <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Short Int</span>
                                <span className="font-mono font-bold text-slate-300">{pick.metrics.shortFloat}</span>
                             </div>
                          </div>
                      </div>
                  </div>
              </div>
              
              {/* Analyst Commentary */}
              <div className="mt-2 border-t border-slate-800 bg-slate-900/30 px-5 py-4">
                 <p className="text-xs leading-relaxed text-slate-400 italic">
                    <span className="font-bold text-indigo-400 not-italic mr-1">Analyst:</span> 
                    "{pick.analysis}"
                 </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default SmartStockBox;
