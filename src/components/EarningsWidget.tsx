"use client";

import React, { useEffect, useState } from 'react';

interface EarningsEvent {
  symbol: string;
  companyName: string;
  date: string; // ISO date string
  time: 'bmo' | 'amc' | 'dmh' | null; // Before Market Open, After Market Close, During Market Hours
  epsEstimate?: number;
  epsActual?: number;
  revenueEstimate?: number;
  revenueActual?: number;
  priceChange?: number; // Percentage change post-earnings
  hasReported: boolean;
}

interface EarningsWidgetProps {
  refreshInterval?: number; // Rotation interval in ms (default 5000)
}

const EarningsWidget: React.FC<EarningsWidgetProps> = ({ 
  refreshInterval = 5000 
}) => {
  const [earnings, setEarnings] = useState<EarningsEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Fetch earnings data
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await fetch('/api/earnings');
        if (response.ok) {
          const data = await response.json();
          setEarnings(data.earnings || []);
        }
      } catch (error) {
        console.error('Failed to fetch earnings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
    
    // Refresh earnings data every 30 minutes
    const dataRefresh = setInterval(fetchEarnings, 30 * 60 * 1000);
    return () => clearInterval(dataRefresh);
  }, []);

  // Rotate through earnings
  useEffect(() => {
    if (earnings.length <= 1) return;
    
    const rotation = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % earnings.length);
    }, refreshInterval);

    return () => clearInterval(rotation);
  }, [earnings.length, refreshInterval]);

  // Don't render if no earnings this week
  if (!loading && earnings.length === 0) {
    return null;
  }

  const currentEarning = earnings[currentIndex];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string | null) => {
    switch (time) {
      case 'bmo': return 'Before Open';
      case 'amc': return 'After Close';
      case 'dmh': return 'During Hours';
      default: return 'TBA';
    }
  };

  const getCompanyEmoji = (symbol: string) => {
    const emojiMap: Record<string, string> = {
      'AAPL': '🍎',
      'MSFT': '🪟',
      'GOOGL': '🔍',
      'GOOG': '🔍',
      'AMZN': '📦',
      'META': '👤',
      'TSLA': '⚡',
      'NVDA': '🎮',
      'AMD': '💻',
      'NFLX': '🎬',
      'DIS': '🏰',
      'PYPL': '💳',
      'V': '💳',
      'MA': '💳',
      'JPM': '🏦',
      'BAC': '🏦',
      'WMT': '🛒',
      'TGT': '🎯',
      'COST': '🛒',
      'SBUX': '☕',
      'MCD': '🍔',
      'KO': '🥤',
      'PEP': '🥤',
      'JNJ': '💊',
      'PFE': '💊',
      'UNH': '🏥',
    };
    return emojiMap[symbol.toUpperCase()] || '📊';
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isMinimized ? 'w-12 h-12' : 'w-72'
      }`}
    >
      {isMinimized ? (
        // Minimized state - just a button
        <button
          onClick={() => setIsMinimized(false)}
          className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors shadow-lg"
          title="Show Earnings"
        >
          <span className="text-xl">📊</span>
        </button>
      ) : (
        // Full widget
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-slate-700 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-sm font-semibold tracking-wide">
                📊 EARNINGS THIS WEEK
              </span>
            </div>
            <div className="flex items-center gap-1">
              {/* Dot indicators */}
              {earnings.length > 1 && (
                <div className="flex gap-1 mr-2">
                  {earnings.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        idx === currentIndex ? 'bg-amber-400' : 'bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
              )}
              <button
                onClick={() => setIsMinimized(true)}
                className="text-slate-400 hover:text-white transition-colors p-1"
                title="Minimize"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-400 border-t-transparent"></div>
              </div>
            ) : currentEarning ? (
              <div className="space-y-3">
                {/* Company Info */}
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getCompanyEmoji(currentEarning.symbol)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate">
                        {currentEarning.companyName}
                      </span>
                      <span className="text-xs text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                        {currentEarning.symbol}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                      <span>{formatDate(currentEarning.date)}</span>
                      <span className="text-slate-600">•</span>
                      <span>{formatTime(currentEarning.time)}</span>
                    </div>
                  </div>
                </div>

                {/* Status - Either upcoming or reported */}
                {currentEarning.hasReported ? (
                  // Post-earnings: Show results
                  <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">EPS</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs">Est: ${currentEarning.epsEstimate?.toFixed(2)}</span>
                        <span className={`font-semibold ${
                          (currentEarning.epsActual || 0) >= (currentEarning.epsEstimate || 0) 
                            ? 'text-green-400' 
                            : 'text-red-400'
                        }`}>
                          ${currentEarning.epsActual?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {currentEarning.priceChange !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Stock Move</span>
                        <span className={`font-semibold flex items-center gap-1 ${
                          currentEarning.priceChange >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {currentEarning.priceChange >= 0 ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {Math.abs(currentEarning.priceChange).toFixed(1)}%
                        </span>
                      </div>
                    )}
                    <div className="text-xs text-slate-500 text-center mt-1">
                      ✓ Reported
                    </div>
                  </div>
                ) : (
                  // Pre-earnings: Show estimates
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Expected EPS</span>
                      <span className="text-white font-semibold">
                        {currentEarning.epsEstimate 
                          ? `$${currentEarning.epsEstimate.toFixed(2)}` 
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="text-xs text-amber-400/80 text-center mt-2 flex items-center justify-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                      Upcoming
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-4 pb-3">
            <a 
              href="https://finance.yahoo.com/calendar/earnings" 
              className="text-xs text-slate-500 hover:text-amber-400 transition-colors flex items-center justify-center gap-1"
            >
              View full earnings calendar
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsWidget;
