
import React from 'react';
import { FundamentalPick } from '../types';
import { IconBrain, IconTrendingUp, IconTrendingDown, IconDollar, IconAlert, IconActivity } from './Icons';

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
            className="group relative overflow-hidden rounded-xl border border-slate-800 bg-[#0b1221] transition-all hover:border-indigo-500/50 hover:bg-[#0f192d] hover:shadow-lg hover:shadow-indigo-900/10"
          >
            {/* Catalyst Badge if present */}
            {pick.catalyst && (
               <div className="absolute top-0 right-0 rounded-bl-lg bg-indigo-600/20 px-2 py-1 border-b border-l border-indigo-500/30">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                     <IconActivity className="h-3 w-3" /> {pick.catalyst}
                  </span>
               </div>
            )}

            {/* Top Bar: Symbol & Price */}
            <div className="flex items-start justify-between border-b border-slate-800/50 p-4 bg-slate-900/20">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 flex items-center justify-center rounded-lg bg-slate-800 font-black text-white text-xl ring-1 ring-slate-700 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {pick.symbol[0]}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-white tracking-tight">{pick.symbol}</h3>
                        </div>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide truncate max-w-[120px]">{pick.name}</p>
                    </div>
                </div>
                <div className="text-right mt-1 mr-2">
                    <div className="font-mono text-lg font-bold text-white tracking-tight">{pick.price}</div>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border inline-block mt-1 ${
                        pick.conviction === 'Strong Buy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                        {pick.conviction}
                    </span>
                </div>
            </div>

            <div className="p-4 grid gap-4">
                
                {/* Visual Technical Bar */}
                <div className="space-y-1.5">
                   <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                      <span>Oversold</span>
                      <span className={pick.metrics.rsi > 70 ? 'text-red-400' : pick.metrics.rsi < 30 ? 'text-emerald-400' : 'text-slate-400'}>
                        RSI: {pick.metrics.rsi}
                      </span>
                      <span>Overbought</span>
                   </div>
                   <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden relative">
                      <div 
                        className={`absolute top-0 bottom-0 w-2 rounded-full shadow-[0_0_8px_currentColor] transition-all duration-1000 ${
                           pick.metrics.rsi > 70 ? 'bg-red-500 text-red-500 left-[80%]' : 
                           pick.metrics.rsi < 30 ? 'bg-emerald-500 text-emerald-500 left-[20%]' : 
                           'bg-slate-400 text-slate-400 left-[50%]'
                        }`}
                        style={{ left: `${Math.min(Math.max(pick.metrics.rsi, 0), 100)}%` }}
                      ></div>
                   </div>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Key Technicals */}
                    <div className="bg-slate-900/40 rounded p-2 border border-slate-800/50">
                       <h5 className="text-[9px] font-bold text-indigo-400 uppercase mb-2">Technical Structure</h5>
                       <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Support</span>
                          <span className="font-mono text-slate-300 font-bold">{pick.technicalLevels.support}</span>
                       </div>
                       <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Resistance</span>
                          <span className="font-mono text-slate-300 font-bold">{pick.technicalLevels.resistance}</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="text-slate-500">RVOL</span>
                          <span className="font-mono text-yellow-400 font-bold">{pick.metrics.relativeVolume || '1.0x'}</span>
                       </div>
                    </div>

                    {/* Key Fundamentals */}
                    <div className="bg-slate-900/40 rounded p-2 border border-slate-800/50">
                       <h5 className="text-[9px] font-bold text-emerald-400 uppercase mb-2">Fundamental Data</h5>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Short Int</span>
                          <span className={`font-mono font-bold ${parseInt(pick.metrics.shortFloat) > 10 ? 'text-red-400' : 'text-slate-300'}`}>
                             {pick.metrics.shortFloat}
                          </span>
                       </div>
                       <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">P/E Ratio</span>
                          <span className="font-mono text-slate-300 font-bold">{pick.metrics.peRatio}</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Beta</span>
                          <span className="font-mono text-slate-300 font-bold">{pick.metrics.beta}</span>
                       </div>
                    </div>
                </div>

                {/* Analyst Note */}
                <div className="relative rounded bg-indigo-950/10 p-3 border border-indigo-500/20">
                    <p className="text-[11px] leading-relaxed text-indigo-200/80 pl-1">
                        <span className="font-bold text-indigo-400">Analyst:</span> "{pick.analysis}"
                    </p>
                </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SmartStockBox;
