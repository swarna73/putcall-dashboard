'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, BarChart3, Zap } from 'lucide-react';
import StockCard from '@/components/StockCard';

export default function Dashboard() {
  const [stockData, setStockData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      // Fetch from S3 bucket in EU North (Stockholm)
      const response = await fetch('https://putcall-dashboard-data.s3.eu-north-1.amazonaws.com/dashboard-data.json');
      const data = await response.json();
      
      // Transform the data to match StockCard format
      const transformedStocks = data.stocks.map((stock: any) => {
        // Extract numeric PE ratio (remove quotes)
        const peRatio = stock.financial_metrics?.pe_ratio 
          ? parseFloat(stock.financial_metrics.pe_ratio.replace(/[^\d.-]/g, '')) 
          : 0;
        
        // Parse signal text (remove emoji)
        const signalText = stock.combined_signal?.signal?.replace(/[^\w\s]/g, '').trim() || 'NEUTRAL';
        
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
          history: [] // We don't have historical data yet
        };
      });
      
      setStockData(transformedStocks);
      setLastUpdated(data.timestamp);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      // Fallback to mock data
      setStockData(mockData);
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

        {/* Stock Grid */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 gap-6">
            {stockData.map((stock, index) => (
              <div 
                key={stock.ticker}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <StockCard stock={stock} />
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

const mockData = [
  {
    ticker: 'AAPL',
    company: 'Apple',
    signal: 'CAUTION',
    sentiment: 'Bullish',
    sentimentScore: 0.45,
    valuation: 'Mixed',
    price: 178.50,
    priceChange: 2.3,
    pe: 28.5,
    marketCap: '$2.85T',
    articles: 15,
    history: [
      { date: '2025-10-08', sentiment: 0.32 },
      { date: '2025-10-09', sentiment: 0.41 },
      { date: '2025-10-10', sentiment: 0.38 },
      { date: '2025-10-11', sentiment: 0.42 },
      { date: '2025-10-14', sentiment: 0.45 },
    ]
  },
  {
    ticker: 'NVDA',
    company: 'NVIDIA',
    signal: 'STRONG BUY',
    sentiment: 'Bullish',
    sentimentScore: 0.78,
    valuation: 'Attractive',
    price: 485.20,
    priceChange: 3.8,
    pe: 42.5,
    marketCap: '$1.19T',
    articles: 22,
    history: [
      { date: '2025-10-08', sentiment: 0.65 },
      { date: '2025-10-09', sentiment: 0.72 },
      { date: '2025-10-10', sentiment: 0.69 },
      { date: '2025-10-11', sentiment: 0.75 },
      { date: '2025-10-14', sentiment: 0.78 },
    ]
  },
  {
    ticker: 'MSFT',
    company: 'Microsoft',
    signal: 'BUY',
    sentiment: 'Bullish',
    sentimentScore: 0.52,
    valuation: 'Attractive',
    price: 412.30,
    priceChange: 1.2,
    pe: 35.2,
    marketCap: '$3.06T',
    articles: 19,
    history: [
      { date: '2025-10-08', sentiment: 0.48 },
      { date: '2025-10-09', sentiment: 0.51 },
      { date: '2025-10-10', sentiment: 0.49 },
      { date: '2025-10-11', sentiment: 0.53 },
      { date: '2025-10-14', sentiment: 0.52 },
    ]
  },
  {
    ticker: 'TSLA',
    company: 'Tesla',
    signal: 'NEUTRAL',
    sentiment: 'Neutral',
    sentimentScore: 0.12,
    valuation: 'Concerns',
    price: 242.80,
    priceChange: -1.5,
    pe: 257.03,
    marketCap: '$1.45T',
    articles: 17,
    history: [
      { date: '2025-10-08', sentiment: 0.15 },
      { date: '2025-10-09', sentiment: 0.08 },
      { date: '2025-10-10', sentiment: 0.22 },
      { date: '2025-10-11', sentiment: 0.18 },
      { date: '2025-10-14', sentiment: 0.12 },
    ]
  },
];
