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
};

// Extended stock data with sectors (fallback if API doesn't provide enough)
const SECTOR_STOCKS: Record<string, Array<{ symbol: string; name: string; price: string; peRatio: string; fcf: string; dividend: string; analysis: string; conviction: string }>> = {
  'Technology': [
    { symbol: 'INTC', name: 'Intel', price: '$21.50', peRatio: '8.2', fcf: '$8B', dividend: '1.4%', analysis: 'Undervalued chipmaker with turnaround potential', conviction: 'Strong Buy' },
    { symbol: 'CSCO', name: 'Cisco', price: '$47.20', peRatio: '13.1', fcf: '$15B', dividend: '3.2%', analysis: 'Network infrastructure leader with solid cash flow', conviction: 'Buy' },
    { symbol: 'IBM', name: 'IBM', price: '$168.00', peRatio: '18.7', fcf: '$11B', dividend: '3.9%', analysis: 'AI and hybrid cloud transformation', conviction: 'Hold' },
  ],
  'Healthcare': [
    { symbol: 'PFE', name: 'Pfizer', price: '$26.50', peRatio: '12.3', fcf: '$12B', dividend: '5.8%', analysis: 'Undervalued pharma with strong pipeline', conviction: 'Strong Buy' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', price: '$155.00', peRatio: '15.2', fcf: '$18B', dividend: '3.1%', analysis: 'Healthcare giant with diversified revenue', conviction: 'Buy' },
    { symbol: 'BMY', name: 'Bristol-Myers', price: '$42.30', peRatio: '7.8', fcf: '$13B', dividend: '5.2%', analysis: 'Low P/E pharma with oncology focus', conviction: 'Buy' },
  ],
  'Energy': [
    { symbol: 'CVX', name: 'Chevron', price: '$148.00', peRatio: '11.2', fcf: '$20B', dividend: '4.2%', analysis: 'Cash flow machine with strong dividend', conviction: 'Strong Buy' },
    { symbol: 'XOM', name: 'ExxonMobil', price: '$105.20', peRatio: '13.5', fcf: '$36B', dividend: '3.5%', analysis: 'Integrated energy major with scale', conviction: 'Buy' },
    { symbol: 'OXY', name: 'Occidental', price: '$52.40', peRatio: '9.1', fcf: '$7B', dividend: '1.8%', analysis: 'Buffett-backed energy play', conviction: 'Hold' },
  ],
  'Financials': [
    { symbol: 'JPM', name: 'JPMorgan Chase', price: '$195.00', peRatio: '10.8', fcf: '$45B', dividend: '2.4%', analysis: 'Best-in-class banking franchise', conviction: 'Strong Buy' },
    { symbol: 'BAC', name: 'Bank of America', price: '$35.50', peRatio: '9.2', fcf: '$25B', dividend: '2.8%', analysis: 'Interest rate beneficiary', conviction: 'Buy' },
    { symbol: 'WFC', name: 'Wells Fargo', price: '$55.20', peRatio: '11.5', fcf: '$18B', dividend: '2.5%', analysis: 'Turnaround story with cap relief', conviction: 'Hold' },
  ],
  'Consumer': [
    { symbol: 'KO', name: 'Coca-Cola', price: '$62.00', peRatio: '23.5', fcf: '$9B', dividend: '3.1%', analysis: 'Dividend aristocrat with global moat', conviction: 'Buy' },
    { symbol: 'PG', name: 'Procter & Gamble', price: '$158.00', peRatio: '25.1', fcf: '$14B', dividend: '2.5%', analysis: 'Consumer staples leader', conviction: 'Hold' },
    { symbol: 'WMT', name: 'Walmart', price: '$165.00', peRatio: '28.2', fcf: '$12B', dividend: '1.3%', analysis: 'Retail giant with e-commerce growth', conviction: 'Hold' },
  ],
  'Telecommunications': [
    { symbol: 'VZ', name: 'Verizon', price: '$42.15', peRatio: '8.5', fcf: '$18B', dividend: '6.5%', analysis: 'Strong dividend with 5G growth potential', conviction: 'Strong Buy' },
    { symbol: 'T', name: 'AT&T', price: '$22.80', peRatio: '9.8', fcf: '$16B', dividend: '5.9%', analysis: 'High yield telecom with fiber expansion', conviction: 'Buy' },
    { symbol: 'TMUS', name: 'T-Mobile', price: '$185.00', peRatio: '22.1', fcf: '$14B', dividend: '1.6%', analysis: '5G leader with subscriber growth', conviction: 'Hold' },
  ],
};

const SmartStockBox: React.FC<SmartStockBoxProps> = ({ picks }) => {
  
  // Group picks by sector, or use fallback data
  const groupedBySector = React.useMemo(() => {
    // If we have picks from API, try to group them
    if (picks.length > 0) {
      const grouped: Record<string, FundamentalPick[]> = {};
      picks.forEach(pick => {
        const sector = pick.sector || 'Other';
        if (!grouped[sector]) grouped[sector] = [];
        grouped[sector].push(pick);
      });
      
      // If we have at least 2 sectors with data, use the API data
      if (Object.keys(grouped).length >= 2) {
        return grouped;
      }
    }
    
    // Use our curated sector data as fallback/enhancement
    return null;
  }, [picks]);

  // Determine which data to show
  const useFallbackData = !groupedBySector;
  const sectorsToShow = useFallbackData 
    ? ['Technology', 'Healthcare', 'Energy', 'Financials', 'Consumer', 'Telecommunications']
    : Object.keys(groupedBySector);

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
        <div className="text-[9px] text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
          {useFallbackData ? '18' : picks.length} stocks • {sectorsToShow.length} sectors
        </div>
      </div>

      {picks.length === 0 && !useFallbackData ? (
        <div className="flex-1 rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent opacity-50"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Screening Financials...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {sectorsToShow.map(sector => {
            const sectorConfig = SECTORS[sector] || SECTORS['Technology'];
            const sectorStocks = useFallbackData 
              ? SECTOR_STOCKS[sector] || []
              : groupedBySector![sector] || [];
            
            if (sectorStocks.length === 0) return null;

            // Find top pick (Strong Buy or first)
            const topPick = useFallbackData
              ? sectorStocks.find(s => s.conviction === 'Strong Buy') || sectorStocks[0]
              : sectorStocks.find(s => s.conviction === 'Strong Buy') || sectorStocks[0];

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
                    <span>Top: <span className="text-white font-bold">{useFallbackData ? (topPick as any).symbol : topPick.symbol}</span></span>
                  </div>
                </div>

                {/* Stocks in this sector */}
                <div className="p-2 space-y-2">
                  {(useFallbackData ? sectorStocks as any[] : sectorStocks).map((stock: any, idx: number) => {
                    const isTopPick = useFallbackData 
                      ? stock.symbol === (topPick as any).symbol
                      : stock.symbol === topPick.symbol;
                    
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
                                {useFallbackData ? stock.price : stock.price}
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
                              {useFallbackData ? stock.peRatio : stock.metrics?.peRatio || 'N/A'}
                            </div>
                          </div>
                          <div className="bg-slate-900/80 rounded px-2 py-1.5">
                            <div className="text-[7px] text-slate-500 uppercase font-bold">FCF</div>
                            <div className="text-[11px] font-mono font-bold text-blue-400">
                              {useFallbackData ? stock.fcf : stock.metrics?.freeCashFlow || 'N/A'}
                            </div>
                          </div>
                          <div className="bg-slate-900/80 rounded px-2 py-1.5">
                            <div className="text-[7px] text-slate-500 uppercase font-bold">DIV</div>
                            <div className="text-[11px] font-mono font-bold text-emerald-400">
                              {useFallbackData ? stock.dividend : stock.metrics?.dividendYield || 'N/A'}
                            </div>
                          </div>
                        </div>

                        {/* Analysis (only for top pick) */}
                        {isTopPick && (
                          <div className="mt-2 flex gap-2">
                            <div className={`w-0.5 rounded ${sectorConfig.bgColor.replace('/10', '')}`}></div>
                            <p className="text-[9px] text-slate-400 leading-relaxed">
                              {useFallbackData ? stock.analysis : stock.analysis}
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
    </div>
  );
};

export default SmartStockBox;
