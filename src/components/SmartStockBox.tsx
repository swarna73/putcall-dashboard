import React from 'react';
import { FundamentalPick } from '../types';
import { IconBrain } from './Icons';

interface SmartStockBoxProps {
  picks: FundamentalPick[];
}

// Sector definitions with icons and colors
const SECTORS: Record<string, { icon: string; color: string; bgColor: string; borderColor: string }> = {
  'Technology': { icon: '💻', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  'Healthcare': { icon: '💊', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' },
  'Energy': { icon: '⛽', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  'Financials': { icon: '🏦', color: 'text-violet-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/30' },
  'Consumer': { icon: '🛒', color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30' },
  'Telecommunications': { icon: '📡', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
  'Industrials': { icon: '🏭', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
  'Materials': { icon: '🔧', color: 'text-slate-400', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/30' },
  'Other': { icon: '📊', color: 'text-gray-400', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/30' },
};

const SmartStockBox: React.FC<SmartStockBoxProps> = ({ picks }) => {
  
  // Group picks by sector from API data only
  const groupedBySector = React.useMemo(() => {
    if (picks.length === 0) return null;
    
    const grouped: Record<string, FundamentalPick[]> = {};
    picks.forEach(pick => {
      const sector = pick.sector || 'Other';
      if (!grouped[sector]) grouped[sector] = [];
      grouped[sector].push(pick);
    });
    
    return grouped;
  }, [picks]);

  const sectorsToShow = groupedBySector ? Object.keys(groupedBySector) : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400">
            <IconBrain className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Fundamentals Screener</h2>
            <p className="text-[10px] text-slate-500 font-mono">FCF+ • LOW DEBT • VALUE PICKS BY SECTOR</p>
          </div>
        </div>
        {picks.length > 0 && (
          <div className="text-[9px] text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
            {picks.length} stocks • {sectorsToShow.length} sectors
          </div>
        )}
      </div>

      {picks.length === 0 ? (
        <div className="flex-1 rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent opacity-50"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Screening Financials...</p>
          <p className="text-[9px] text-slate-600 mt-2">Fetching live market data</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {sectorsToShow.map(sector => {
            const sectorConfig = SECTORS[sector] || SECTORS['Other'];
            const sectorStocks = groupedBySector![sector] || [];
            
            if (sectorStocks.length === 0) return null;

            // Find top pick (Strong Buy or first)
            const topPick = sectorStocks.find(s => s.conviction === 'Strong Buy') || sectorStocks[0];

            return (
              <div 
                key={sector}
                className={`rounded-xl border ${sectorConfig.borderColor} bg-[#0b1221] overflow-hidden`}
              >
                {/* Sector Header */}
                <div className={`${sectorConfig.bgColor} px-4 py-2.5 flex items-center justify-between border-b ${sectorConfig.borderColor}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{sectorConfig.icon}</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${sectorConfig.color}`}>
                      {sector}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-slate-400">
                    <span>⭐</span>
                    <span>Top: <span className="text-white font-bold">{topPick.symbol}</span></span>
                  </div>
                </div>

                {/* Stocks in this sector */}
                <div className="p-2 space-y-2">
                  {sectorStocks.map((stock, idx) => {
                    const isTopPick = stock.symbol === topPick.symbol;
                    
                    const convictionStyle = stock.conviction === 'Strong Buy'
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                      : stock.conviction === 'Buy'
                      ? 'bg-blue-950/60 text-blue-400 border-blue-500/30'
                      : 'bg-slate-800/60 text-slate-400 border-slate-600/30';

                    return (
                      <div 
                        key={stock.symbol}
                        className={`group rounded-lg p-3 transition-all ${
                          isTopPick 
                            ? `bg-gradient-to-r from-${sectorConfig.color.split('-')[1]}-950/30 to-transparent border ${sectorConfig.borderColor}` 
                            : 'bg-slate-900/50 hover:bg-slate-800/50 border border-transparent hover:border-slate-700'
                        }`}
                      >
                        {/* Stock Header Row */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`flex items-center justify-center h-8 w-12 rounded font-bold text-sm tracking-tight border ${
                              isTopPick 
                                ? `${sectorConfig.bgColor} ${sectorConfig.color} ${sectorConfig.borderColor}` 
                                : 'bg-slate-800 text-white border-slate-700'
                            }`}>
                              {stock.symbol}
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400 leading-none">{stock.name}</div>
                              <div className="text-sm font-mono font-bold text-white">
                                {stock.price}
                              </div>
                            </div>
                          </div>
                          <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${convictionStyle}`}>
                            {stock.conviction}
                          </div>
                        </div>

                        {/* Metrics Row */}
                        <div className="grid grid-cols-3 gap-1 text-center">
                          <div className="bg-slate-900/80 rounded px-2 py-1.5">
                            <div className="text-[7px] text-slate-500 uppercase font-bold">P/E</div>
                            <div className="text-[11px] font-mono font-bold text-white">
                              {stock.metrics?.peRatio || 'N/A'}
                            </div>
                          </div>
                          <div className="bg-slate-900/80 rounded px-2 py-1.5">
                            <div className="text-[7px] text-slate-500 uppercase font-bold">FCF</div>
                            <div className="text-[11px] font-mono font-bold text-blue-400">
                              {stock.metrics?.freeCashFlow || 'N/A'}
                            </div>
                          </div>
                          <div className="bg-slate-900/80 rounded px-2 py-1.5">
                            <div className="text-[7px] text-slate-500 uppercase font-bold">DIV</div>
                            <div className="text-[11px] font-mono font-bold text-emerald-400">
                              {stock.metrics?.dividendYield || 'N/A'}
                            </div>
                          </div>
                        </div>

                        {/* Analysis (only for top pick) */}
                        {isTopPick && stock.analysis && (
                          <div className="mt-2 flex gap-2">
                            <div className={`w-0.5 rounded ${sectorConfig.bgColor.replace('/10', '')}`}></div>
                            <p className="text-[9px] text-slate-400 leading-relaxed">
                              {stock.analysis}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Legend */}
      {picks.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[9px] text-slate-500">Strong Buy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-[9px] text-slate-500">Buy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-500"></div>
            <span className="text-[9px] text-slate-500">Hold</span>
          </div>
          <span className="text-[8px] text-slate-600">|</span>
          <span className="text-[8px] text-slate-500">FCF = Free Cash Flow • DIV = Dividend Yield</span>
        </div>
      )}
    </div>
  );
};

export default SmartStockBox;

