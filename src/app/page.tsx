'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, BarChart3, Zap } from 'lucide-react';

export default function Dashboard() {
  const [stockData, setStockData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      console.log('🔍 Fetching S3 data...');
      const response = await fetch('https://putcall-dashboard-data.s3.eu-north-1.amazonaws.com/dashboard-data.json');
      const data = await response.json();
      
      console.log('✅ Raw S3 data:', data);
      
      const transformedStocks = data.stocks.map((stock: any) => {
        const peRatio = stock.financial_metrics?.pe_ratio 
          ? parseFloat(stock.financial_metrics.pe_ratio.replace(/[^\d.-]/g, '')) 
          : 0;
        
        const signalText = stock.combined_signal?.signal?.replace(/[^\w\s]/g, '').trim() || 'NEUTRAL';
        
        console.log(`📊 Processing ${stock.ticker}:`, {
          signalText,
          peRatio,
          originalSignal: stock.combined_signal?.signal
        });
        
        return {
          ticker: stock.ticker,
          company: stock.company,
          signal: signalText,
          sentiment: stock.combined_signal?.sentiment || 'Neutral',
          sentimentScore: stock.sentiment_score || 0,
          valuation: stock.valuation_analysis?.overall || 'Mixed',
          price: stock.financial_metrics?.current_price || 0,
          priceChange: stock.financial_metrics?.price_change_pct || 0,
          pe: peRatio,
          marketCap: stock.financial_metrics?.market_cap || 'N/A',
          articles: stock.article_count || 0,
          history: []
        };
      });
      
      console.log('🎯 Transformed stocks:', transformedStocks);
      console.log('📈 Setting stock data with', transformedStocks.length, 'stocks');
      
      setStockData(transformedStocks);
      setLastUpdated(data.timestamp);
      setLoading(false);
      
      console.log('✅ State updated!');
    } catch (error) {
      console.error('❌ Error fetching stock data:', error);
      setStockData([]);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4a9eff] mb-4"></div>
          <div className="text-[#e1e8ed] text-xl">Loading market intelligence...</div>
        </div>
      </div>
    );
  }

  const getSignalStats = () => {
    const bullish = stockData.filter(s => s.signal === 'STRONG BUY' || s.signal === 'BUY').length;
    const bearish = stockData.filter(s => s.signal === 'AVOID' || s.signal === 'SELL').length;
    const neutral = stockData.filter(s => s.signal === 'NEUTRAL' || s.signal === 'CAUTION').length;
    return { bullish, bearish, neutral };
  };

  const getSignalStyle = (signal: string) => {
    if (signal.includes('STRONG BUY')) {
      return {
        color: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderColor: 'rgba(16, 185, 129, 0.5)'
      };
    }
    if (signal.includes('BUY')) {
      return {
        color: '#34d399',
        backgroundColor: 'rgba(52, 211, 153, 0.12)',
        borderColor: 'rgba(52, 211, 153, 0.4)'
      };
    }
    if (signal.includes('AVOID')) {
      return {
        color: '#f87171',
        backgroundColor: 'rgba(248, 113, 113, 0.12)',
        borderColor: 'rgba(248, 113, 113, 0.4)'
      };
    }
    if (signal.includes('CAUTION')) {
      return {
        color: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.12)',
        borderColor: 'rgba(251, 191, 36, 0.4)'
      };
    }
    return {
      color: '#94a3b8',
      backgroundColor: 'rgba(148, 163, 184, 0.12)',
      borderColor: 'rgba(148, 163, 184, 0.3)'
    };
  };

  const stats = getSignalStats();

  return (
    <div className="min-h-screen bg-[#0f1419] text-[#e1e8ed]">
      {/* Header */}
      <header className="border-b border-[#2d3748] bg-[#0f1419]/95 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#4a9eff] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent mb-2 animate-gradient">
              PUTCALL.NL
            </h1>
            <p className="text-[#8b95a5] text-lg">
              AI-Powered Market Sentiment Intelligence
            </p>
            <p className="text-[#6b7280] text-sm mt-1">
              Combining news analysis with financial fundamentals
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Alert Banner */}
        <div className="mb-10 bg-[#4a9eff]/5 border border-[#4a9eff]/20 rounded-2xl p-6 flex items-start gap-4 hover:border-[#4a9eff]/40 transition-all duration-300">
          <div className="bg-[#4a9eff]/10 p-3 rounded-xl">
            <AlertCircle className="text-[#4a9eff]" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-[#4a9eff] font-bold text-lg mb-1">Live Market Analysis</h3>
            <p className="text-[#8b95a5] text-sm">
              Last updated: {new Date().toLocaleString()} • Next update: Tomorrow 7:00 AM CET
            </p>
            <p className="text-[#6b7280] text-xs mt-2">
              Automated analysis powered by AWS Lambda • Zero-cost operation
            </p>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#4a9eff]/10 border border-[#4a9eff]/30 rounded-full text-sm text-[#4a9eff]">
            <Zap size={16} />
            <span>Real-time News Analysis</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-full text-sm text-[#8b5cf6]">
            <TrendingUp size={16} />
            <span>Financial Fundamentals</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#ec4899]/10 border border-[#ec4899]/30 rounded-full text-sm text-[#ec4899]">
            <BarChart3 size={16} />
            <span>AI-Powered Signals</span>
          </div>
        </div>

        {/* Stock Table */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#1a1d29] border border-[#2d3748] rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#0f1419] border-b border-[#2d3748] text-sm font-semibold text-[#8b95a5]">
              <div className="col-span-2">STOCK</div>
              <div className="col-span-2">PRICE</div>
              <div className="col-span-2">SIGNAL</div>
              <div className="col-span-2">SENTIMENT</div>
              <div className="col-span-2">P/E</div>
              <div className="col-span-2">NEWS</div>
            </div>
            
            {/* Table Rows */}
            {stockData.map((stock, index) => (
              <div 
                key={stock.ticker}
                className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-[#2d3748] last:border-b-0 hover:bg-[#242938] transition-colors animate-fadeIn cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Stock */}
                <div className="col-span-2">
                  <div className="font-bold text-[#e1e8ed] text-lg">{stock.ticker}</div>
                  <div className="text-xs text-[#6b7280]">{stock.company}</div>
                </div>
                
                {/* Price */}
                <div className="col-span-2">
                  <div className="font-bold text-[#e1e8ed]">${stock.price > 0 ? stock.price.toFixed(2) : '0.00'}</div>
                  <div className={`text-sm font-semibold ${stock.priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stock.priceChange >= 0 ? '+' : ''}{stock.priceChange.toFixed(2)}%
                  </div>
                </div>
                
                {/* Signal */}
                <div className="col-span-2">
                  <span 
                    className="inline-flex px-3 py-1 rounded-full text-xs font-bold border"
                    style={getSignalStyle(stock.signal)}
                  >
                    {stock.signal}
                  </span>
                </div>
                
                {/* Sentiment */}
                <div className="col-span-2">
                  <div className="text-sm text-[#e1e8ed]">{stock.sentiment}</div>
                  <div className="text-xs text-[#6b7280]">
                    {stock.sentimentScore >= 0 ? '+' : ''}{stock.sentimentScore.toFixed(2)}
                  </div>
                </div>
                
                {/* P/E */}
                <div className="col-span-2">
                  <div className="text-sm text-[#e1e8ed]">{stock.pe > 0 ? stock.pe.toFixed(2) : 'N/A'}</div>
                  <div className="text-xs text-[#6b7280]">{stock.valuation}</div>
                </div>
                
                {/* News */}
                <div className="col-span-2">
                  <div className="text-sm text-[#e1e8ed] font-semibold">{stock.articles}</div>
                  <div className="text-xs text-[#6b7280]">Last 24h</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="mt-16 bg-[#1a1d29] border border-[#2d3748] rounded-2xl p-8 hover:border-[#374151] transition-all duration-300">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#4a9eff] to-[#8b5cf6] bg-clip-text text-transparent">
            About This Dashboard
          </h2>
          <p className="text-[#8b95a5] leading-relaxed mb-6">
            This dashboard combines news sentiment analysis with financial fundamentals to provide 
            intelligent market signals. Data is automatically updated every weekday at 7:00 AM CET 
            using AWS Lambda for 24/7 autonomous operation.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 bg-[#4a9eff]/10 border border-[#4a9eff]/30 rounded-lg text-[#4a9eff] text-sm font-medium hover:scale-105 transition-transform">
              Python
            </span>
            <span className="px-4 py-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg text-[#8b5cf6] text-sm font-medium hover:scale-105 transition-transform">
              AWS Lambda
            </span>
            <span className="px-4 py-2 bg-[#ec4899]/10 border border-[#ec4899]/30 rounded-lg text-[#ec4899] text-sm font-medium hover:scale-105 transition-transform">
              Next.js
            </span>
            <span className="px-4 py-2 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg text-[#10b981] text-sm font-medium hover:scale-105 transition-transform">
              Alpha Vantage
            </span>
            <span className="px-4 py-2 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg text-[#f59e0b] text-sm font-medium hover:scale-105 transition-transform">
              Vercel
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2d3748] mt-20 bg-[#0f1419]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-[#8b95a5] text-sm mb-2">
              Built by <span className="text-[#4a9eff] font-semibold">Swarnalatha Swaminathan</span>
            </p>
            <p className="text-[#6b7280] text-xs mb-4">
              Data for informational purposes only • Not financial advice • Always DYOR
            </p>
            <div className="flex justify-center gap-4 text-xs text-[#6b7280]">
              <a href="https://github.com/swarna73" target="_blank" className="hover:text-[#4a9eff] transition-colors">
                GitHub
              </a>
              <span>•</span>
              <a href="https://swarna.nl" target="_blank" className="hover:text-[#4a9eff] transition-colors">
                Portfolio
              </a>
              <span>•</span>
              <span>© 2025 PUTCALL.NL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
