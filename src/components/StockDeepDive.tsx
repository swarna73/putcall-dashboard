import React, { useState } from 'react';
import { IconSearch, IconX, IconBrain, IconZap, IconActivity } from './Icons';
import { analyzeStock } from '../services/geminiService';
import { StockAnalysis } from '../types';

const StockDeepDive: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<StockAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await analyzeStock(query.toUpperCase());
      setData(result);
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "Analysis failed. Please try again.";
      // User friendly error mapping
      if (msg.includes("API Key is missing")) {
        setError("System Config Error: API Key missing.");
      } else if (msg.includes("extract valid JSON")) {
        setError("Data Parsing Error: Search results were unstructured. Please retry.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setData(null);
    setError(null);
  };

  // Calculate percentage for Fair Value gauge
  const getFairValuePosition = () => {
    if (!data) return 50;
    const clean = (s: string) => parseFloat(s.replace(/[^0-9.]/g, ''));
    const curr = clean(data.currentPrice);
    const fair = clean(data.fairValue);
    
    if (!curr || !fair) return 50;
    
    // Simple ratio to position on a bar. 
    // If Price == Fair, pos = 50%.
    // If Price is 50% of Fair (Undervalued), pos should be left (low).
    // If Price is 150% of Fair (Overvalued), pos should be right (high).
    
    const ratio = curr / fair; // 0.8 means trading at 80% of value (Undervalued)
    // Scale: 0.5 (Undervalued) -> 0% pos, 1.0 (Fair) -> 50% pos, 1.5 (Overvalued) -> 100% pos
    
    let pos = (ratio - 0.5) * 100;
    return Math.max(0, Math.min(100, pos));
  };

  return (
    <div className="w-full rounded-xl border border-indigo-500/20 bg-[#0f172a] shadow-lg overflow-hidden transition-all duration-300">
      
      {/* Search Header */}
      <div className="flex items-center gap-3 p-4 bg-[#0b1221] border-b border-slate-800">
        <div className="p-2 rounded bg-indigo-500/10 text-indigo-400">
          <IconBrain className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Financial X-Ray</h2>
          <p className="text-[10px] text-slate-500">CFA-Level Deep Dive & Valuation Check</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative flex items-center">
          <input 
            type="text" 
            placeholder="ENTER TICKER (e.g. AAPL)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-48 sm:w-64 bg-slate-900 border border-slate-700 text-white text-xs font-mono px-4 py-2 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 uppercase placeholder:normal-case placeholder:text-slate-600"
          />
          {query && (
            <button 
                type="button"
                onClick={clearSearch} 
                className="absolute right-12 text-slate-500 hover:text-white"
            >
                <IconX className="h-3 w-3" />
            </button>
          )}
          <button 
            type="submit"
            disabled={isLoading || !query}
            className="absolute right-1 p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-700 transition-colors"
          >
             {isLoading ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></div> : <IconSearch className="h-3 w-3" />}
          </button>
        </form>
      </div>

      {/* Content Area */}
      {error && (
        <div className="p-6 text-center text-xs text-red-400 font-mono border-t border-red-500/20 bg-red-950/10">
           ERROR: {error}
        </div>
      )}

      {!data && !isLoading && !error && (
         <div className="p-8 text-center border-t border-slate-800/50">
            <p className="text-xs text-slate-600 font-medium">ENTER A TICKER TO SCAN FUNDAMENTALS</p>
         </div>
      )}

      {isLoading && (
        <div className="p-12 text-center border-t border-slate-800/50">
           <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-3"></div>
           <p className="text-[10px] text-indigo-400 animate-pulse font-mono">SEARCHING LIVE MARKET DATA...</p>
        </div>
      )}

      {/* RESULT DASHBOARD */}
      {data && (
        <div className="animate-in slide-in-from-top-4 duration-500">
           {/* Top Row: Price & Fair Value Gauge */}
           <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-800 divide-y md:divide-y-0 md:divide-x divide-slate-800">
              
              {/* 1. Identity */}
              <div className="p-5 bg-[#0b1221]">
                 <div className="flex items-baseline gap-3">
                    <h1 className="text-3xl font-black text-white tracking-tighter">{data.symbol}</h1>
                    <span className="text-lg font-mono text-indigo-300">{data.currentPrice}</span>
                 </div>
                 <p className="text-xs text-slate-400 font-medium truncate">{data.name}</p>
                 <div className="mt-3 flex gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                        data.valuation.rating === 'Undervalued' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        data.valuation.rating === 'Overvalued' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        'bg-slate-500/10 text-slate-300 border-slate-500/30'
                    }`}>
                        {data.valuation.rating}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                        data.health.rating === 'Strong' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                        data.health.rating === 'Weak' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                        'bg-slate-500/10 text-slate-300 border-slate-500/30'
                    }`}>
                        Health: {data.health.rating}
                    </span>
                 </div>
              </div>

              {/* 2. Fair Value Gauge */}
              <div className="p-5 col-span-1 md:col-span-2 relative overflow-hidden">
                 <div className="flex justify-between items-end mb-4">
                    <div>
                       <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Intrinsic Value Est.</div>
                       <div className="text-2xl font-mono font-bold text-white">{data.fairValue}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Upside</div>
                       <div className="text-xl font-mono font-bold text-emerald-400">{data.upside}</div>
                    </div>
                 </div>

                 {/* The Bar */}
                 <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden mb-2 ring-1 ring-slate-700">
                    <div className="absolute inset-y-0 left-0 right-1/2 bg-emerald-500/20"></div> {/* Undervalued Zone */}
                    <div className="absolute inset-y-0 left-1/2 right-0 bg-red-500/20"></div> {/* Overvalued Zone */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-slate-500 left-1/2 z-0"></div> {/* Center Line */}
                    
                    {/* Marker */}
                    <div 
                        className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_10px_white] z-10 transition-all duration-1000"
                        style={{ left: `${getFairValuePosition()}%` }}
                    ></div>
                 </div>
                 <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase">
                    <span>Undervalued</span>
                    <span>Fair Value</span>
                    <span>Overvalued</span>
                 </div>
              </div>
           </div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-800 border-b border-slate-800">
               {/* Valuation */}
               <div className="bg-[#0f172a] p-4">
                   <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Valuation</h4>
                   <div className="space-y-1">
                       <div className="flex justify-between text-xs"><span className="text-slate-400">EV/EBITDA</span> <span className="text-white font-mono">{data.valuation.evEbitda}</span></div>
                       <div className="flex justify-between text-xs"><span className="text-slate-400">Fwd P/E</span> <span className="text-white font-mono">{data.valuation.peFwd}</span></div>
                       <div className="flex justify-between text-xs"><span className="text-slate-400">P/B</span> <span className="text-white font-mono">{data.valuation.priceToBook}</span></div>
                   </div>
               </div>
               
               {/* Health */}
               <div className="bg-[#0f172a] p-4">
                   <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Health</h4>
                   <div className="space-y-1">
                       <div className="flex justify-between text-xs"><span className="text-slate-400">ROIC</span> <span className="text-emerald-400 font-mono font-bold">{data.health.roic}</span></div>
                       <div className="flex justify-between text-xs"><span className="text-slate-400">Debt/Eq</span> <span className="text-white font-mono">{data.health.debtToEquity}</span></div>
                       <div className="flex justify-between text-xs"><span className="text-slate-400">Liq. Ratio</span> <span className="text-white font-mono">{data.health.currentRatio}</span></div>
                   </div>
               </div>

               {/* Growth */}
               <div className="bg-[#0f172a] p-4">
                   <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Growth (YoY)</h4>
                   <div className="space-y-1">
                       <div className="flex justify-between text-xs"><span className="text-slate-400">Revenue</span> <span className="text-white font-mono">{data.growth.revenueGrowth}</span></div>
                       <div className="flex justify-between text-xs"><span className="text-slate-400">Earnings</span> <span className="text-white font-mono">{data.growth.earningsGrowth}</span></div>
                   </div>
               </div>

               {/* Smart Money */}
               <div className="bg-[#0f172a] p-4">
                   <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Smart Money</h4>
                   <div className="space-y-1">
                       <div className="flex justify-between text-xs"><span className="text-slate-400">Inst. Own</span> <span className="text-white font-mono">{data.institutional.instOwnership}</span></div>
                       <div className="text-xs text-indigo-300 font-medium text-right mt-1">{data.institutional.recentTrends}</div>
                   </div>
               </div>
           </div>

           {/* Verdict */}
           <div className="p-5 bg-indigo-950/20">
              <div className="flex gap-3">
                 <IconActivity className="h-5 w-5 text-indigo-400 mt-0.5" />
                 <div>
                    <h4 className="text-xs font-bold text-indigo-300 uppercase mb-1">CFA Verdict</h4>
                    <p className="text-sm text-slate-200 leading-relaxed italic">"{data.verdict}"</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StockDeepDive;