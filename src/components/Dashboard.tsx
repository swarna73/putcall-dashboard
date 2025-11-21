"use client";

import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import RedditSentiment from './RedditSentiment';
import NewsFeed from './NewsFeed';
import SmartStockBox from './SmartStockBox';
import { fetchMarketDashboard } from '../services/geminiService';
import { DashboardData, LoadingState } from '../types';
import { IconAlert } from './Icons';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    redditTrends: [],
    news: [],
    picks: [],
    lastUpdated: '',
  });
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setStatus(LoadingState.LOADING);
    setErrorMsg(null);
    try {
      const dashboardData = await fetchMarketDashboard();
      setData(dashboardData);
      setStatus(LoadingState.SUCCESS);
    } catch (err) {
      console.error(err);
      setStatus(LoadingState.ERROR);
      setErrorMsg("Failed to retrieve market data. Please check your API key or connection.");
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-500/30">
      <Header 
        onRefresh={loadData} 
        isLoading={status === LoadingState.LOADING}
        lastUpdated={data.lastUpdated}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Error Banner */}
        {status === LoadingState.ERROR && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-red-200">
            <IconAlert className="h-5 w-5 text-red-500" />
            <p>{errorMsg}</p>
            <button 
              onClick={loadData} 
              className="ml-auto text-sm font-semibold underline hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Left Column: Reddit Trends */}
          <div className="col-span-1 lg:col-span-2">
            <RedditSentiment trends={data.redditTrends} />
          </div>

          {/* Right Column: AI Smart Picks */}
          <div className="col-span-1 lg:row-span-2">
            <SmartStockBox picks={data.picks} />
          </div>

          {/* Bottom Row: News Feed */}
          <div className="col-span-1 lg:col-span-2">
            <NewsFeed news={data.news} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-900 py-6 text-center text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} PutCall.nl. Market data powered by Gemini AI & Google Search.</p>
          <p className="mt-2">Disclaimer: Not financial advice. For informational purposes only.</p>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;