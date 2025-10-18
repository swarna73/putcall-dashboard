import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import SentimentChart from './SentimentChart';

interface Stock {
  ticker: string;
  company: string;
  signal: string;
  sentiment: string;
  sentimentScore: number;
  valuation: string;
  price: number;
  priceChange: number;
  pe: number;
  marketCap: string;
  articles: number;
  history: Array<{ date: string; sentiment: number }>;
}

export default function StockCard({ stock }: { stock: Stock }) {
  const getSignalStyle = (signal: string) => {
    if (signal.includes('STRONG BUY')) {
      return {
        color: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderColor: 'rgba(16, 185, 129, 0.5)',
        boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)'
      };
    }
    if (signal.includes('BUY')) {
      return {
        color: '#34d399',
        backgroundColor: 'rgba(52, 211, 153, 0.12)',
        borderColor: 'rgba(52, 211, 153, 0.4)',
        boxShadow: '0 0 10px rgba(52, 211, 153, 0.15)'
      };
    }
    if (signal.includes('AVOID') || signal.includes('SELL')) {
      return {
        color: '#f87171',
        backgroundColor: 'rgba(248, 113, 113, 0.12)',
        borderColor: 'rgba(248, 113, 113, 0.4)',
        boxShadow: '0 0 10px rgba(248, 113, 113, 0.15)'
      };
    }
    if (signal.includes('CAUTION')) {
      return {
        color: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.12)',
        borderColor: 'rgba(251, 191, 36, 0.4)',
        boxShadow: '0 0 10px rgba(251, 191, 36, 0.15)'
      };
    }
    return {
      color: '#94a3b8',
      backgroundColor: 'rgba(148, 163, 184, 0.12)',
      borderColor: 'rgba(148, 163, 184, 0.3)',
      boxShadow: 'none'
    };
  };

  const getSignalIcon = (signal: string) => {
    if (signal.includes('BUY')) return '●';
    if (signal.includes('AVOID') || signal.includes('SELL')) return '●';
    return '●';
  };

  const getPriceIcon = () => {
    if (stock.priceChange > 0) return <TrendingUp className="text-emerald-400" size={20} />;
    if (stock.priceChange < 0) return <TrendingDown className="text-rose-400" size={20} />;
    return <Minus className="text-slate-400" size={20} />;
  };

  return (
    <div className="group bg-[#1a1d29] border border-[#2d3748] rounded-2xl p-6 hover:border-[#4a9eff]/40 hover:shadow-2xl hover:shadow-[#4a9eff]/5 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-3xl font-bold text-[#e1e8ed] group-hover:text-[#4a9eff] transition-colors">
              {stock.ticker}
            </h3>
            <span 
              className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-300 group-hover:scale-105"
              style={getSignalStyle(stock.signal)}
            >
              {getSignalIcon(stock.signal)} {stock.signal}
            </span>
          </div>
          <p className="text-[#8b95a5] text-sm">{stock.company}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#e1e8ed] mb-1">${stock.price}</div>
          <div className={`flex items-center gap-1 text-sm font-semibold ${stock.priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {getPriceIcon()}
            {stock.priceChange >= 0 ? '+' : ''}{stock.priceChange}%
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#0f1419]/60 rounded-xl p-4 border border-[#2d3748] hover:border-[#4a9eff]/30 transition-all">
          <div className="text-[#8b95a5] text-xs mb-1 font-medium">Sentiment</div>
          <div className="text-xl font-bold text-[#e1e8ed]">{stock.sentiment}</div>
          <div className="text-xs text-[#6b7280] mt-1">
            Score: {stock.sentimentScore >= 0 ? '+' : ''}{stock.sentimentScore.toFixed(2)}
          </div>
        </div>
        <div className="bg-[#0f1419]/60 rounded-xl p-4 border border-[#2d3748] hover:border-[#8b5cf6]/30 transition-all">
          <div className="text-[#8b95a5] text-xs mb-1 font-medium">Valuation</div>
          <div className="text-xl font-bold text-[#e1e8ed]">{stock.valuation}</div>
          <div className="text-xs text-[#6b7280] mt-1">P/E: {stock.pe}</div>
        </div>
        <div className="bg-[#0f1419]/60 rounded-xl p-4 border border-[#2d3748] hover:border-[#10b981]/30 transition-all">
          <div className="text-[#8b95a5] text-xs mb-1 font-medium">Market Cap</div>
          <div className="text-xl font-bold text-[#e1e8ed]">{stock.marketCap}</div>
        </div>
        <div className="bg-[#0f1419]/60 rounded-xl p-4 border border-[#2d3748] hover:border-[#f59e0b]/30 transition-all">
          <div className="text-[#8b95a5] text-xs mb-1 font-medium">News</div>
          <div className="text-xl font-bold text-[#e1e8ed]">{stock.articles}</div>
          <div className="text-xs text-[#6b7280] mt-1">Last 24h</div>
        </div>
      </div>

      {/* 7-Day Sentiment Chart */}
      <div className="mt-6 bg-[#0f1419]/40 rounded-xl p-4 border border-[#2d3748]">
        <div className="text-xs text-[#8b95a5] mb-3 font-medium">7-Day Sentiment Trend</div>
        <SentimentChart data={stock.history} />
      </div>
    </div>
  );
}
