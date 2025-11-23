import React from 'react';
import { FundamentalPick } from '../types';
import { IconBrain, IconTrendingUp, IconTrendingDown, IconDollar } from './Icons';

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
            className="group relative overflow-hidden rounded-xl border border-slate-800 bg-[#0f172a] transition-all hover:border-emerald-500/50 hover:bg-[#0f192d] hover:shadow-lg hover:shadow-emerald-900/10"
          >
            {/* Top Bar: Symbol & Price */}
            <div className="flex items-center justify-between border-b border-slate-800/50 p-4 bg-slate-900/30">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded bg-slate-800 font-black text-white text-xl ring-1 ring-slate-700 shadow-inner">
                        {pick.symbol[0]}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-white tracking-tight">{pick.symbol}</h3>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                                pick.conviction === 'Strong Buy' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}>
                                {pick.conviction}
                            </span>
                        </div>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{pick.name}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-mono text-lg font-bold text-white">{pick.price}</div>
                    <div className="text-[10px] text-slate-500">Target: {pick.technicalLevels?.resistance || 'N/A'}</div>
                </div>
            </div>

            <div className="p-4">
                {/* 2-Column Grid for Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    
                    {/* LEFT: Technicals */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Technicals</h4>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs p-1.5 rounded bg-slate-900/50 border border-slate-800/50">
                            <span className="text-slate-500 font-medium">RSI (14)</span>
                            <span className={`font-mono font-bold ${
                                pick.metrics.rsi < 30 ? 'text-emerald-400' : pick.metrics.rsi > 70 ? 'text-red-400' : 'text-slate-300'
                            }`}>{pick.metrics.rsi}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs p-1.5 rounded bg-slate-900/50 border border-slate-800/50">
                            <span className="text-slate-500 font-medium">Short Float</span>
                            <span className="font-mono font-bold text-slate-300">{pick.metrics.shortFloat}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs p-1.5 rounded bg-slate-900/50 border border-slate-800/50">
                            <span className="text-slate-500 font-medium">Supp/Res</span>
                            <span className="font-mono font-bold text-slate-300 text-[10px]">
                                {pick.technicalLevels?.support ? pick.technicalLevels.support.replace('$','') : ''} / {pick.technicalLevels?.resistance ? pick.technicalLevels.resistance.replace('$','') : ''}
                            </span>
                        </div>
                    </div>

                    {/* RIGHT: Fundamentals */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fundamentals</h4>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs p-1.5 rounded bg-slate-900/50 border border-slate-800/50">
                            <span className="text-slate-500 font-medium">P/E Ratio</span>
                            <span className="font-mono font-bold text-slate-300">{pick.metrics.peRatio}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs p-1.5 rounded bg-slate-900/50 border border-slate-800/50">
                            <span className="text-slate-500 font-medium">Yield</span>
                            <span className="font-mono font-bold text-emerald-400">{pick.metrics.dividendYield}</span>
                        </div>
                         <div className="flex justify-between items-center text-xs p-1.5 rounded bg-slate-900/50 border border-slate-800/50">
                            <span className="text-slate-500 font-medium">Beta</span>
                            <span className="font-mono font-bold text-slate-300">{pick.metrics.beta}</span>
                        </div>
                    </div>
                </div>

                {/* Analysis Box */}
                <div className="relative rounded bg-slate-900/40 p-3 border border-slate-800/50">
                    <IconBrain className="absolute top-3 left-3 h-3 w-3 text-slate-600" />
                    <p className="text-[11px] leading-relaxed text-slate-400 pl-5">
                        {pick.analysis}
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