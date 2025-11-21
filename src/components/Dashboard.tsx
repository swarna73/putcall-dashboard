"use client";

import React, { useEffect, useState } from 'react';
import Header from './Header';
import RedditSentiment from './RedditSentiment';
import NewsFeed from './NewsFeed';
import SmartStockBox from './SmartStockBox';
import { fetchMarketDashboard } from '../services/geminiService';
import { DashboardData, LoadingState } from '../types';
import { IconAlert, IconActivity } from './Icons';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    redditTrends: [],
    news: [],
    picks: [],
    lastUpdated: '',
  });
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // API Key Management State
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isCheckingKey, setIsCheckingKey] = useState<boolean>(true);

  useEffect(() => {
    const checkApiKey = async () => {
      // Cast window to any to avoid TypeScript conflicts with existing global definitions
      const win = window as any;
      if (win.aistudio && win.aistudio.hasSelectedApiKey) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // Fallback for environments without the AI Studio wrapper (local dev)
        setHasApiKey(true);
      }
      setIsCheckingKey(false);
    };
    checkApiKey();
  }, []);

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

  // Load data once we have a key
  useEffect(() => {
    if (hasApiKey && !isCheckingKey && status === LoadingState.IDLE) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasApiKey, isCheckingKey]);

  const handleConnectApiKey = async () => {
    // Cast window to any to avoid TypeScript conflicts with existing global definitions
    const win = window as any;
    if (win.aistudio && win.aistudio.openSelectKey) {
      await win.aistudio.openSelectKey();
      // Assume success to avoid race conditions as per guidelines
      setHasApiKey(true);
    }
  };

  // 1. Loading State for Key Check
  if (isCheckingKey) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // 2. No API Key State (Landing Screen)
  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-4">
         <div className="max-w-md w-full text-center space-y-8">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 shadow-2xl shadow-indigo-500/20 ring-1 ring-indigo-500/40">
                <IconActivity className="h-10 w-10" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                PutCall<span className="text-indigo-500">.nl</span>
              </h1>
              <p className="text-slate-400 text-sm uppercase tracking-widest font-medium">Intelligent Market Dashboard</p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
              <p className="text-slate-300 leading-relaxed mb-6">
                Access real-time Reddit sentiment, breaking Reuters headlines, and deep-value stock picks powered by Gemini 2.5 Flash.
              </p>
              <button 
                onClick={handleConnectApiKey}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <IconActivity className="h-5 w-5" />
                Connect API Key
              </button>
              <p className="mt-4 text-xs text-slate-600">
                A paid Google Cloud Project API key is required for search grounding.
              </p>
            </div>
         </div>
      </div>
    );
  }

  // 3. Main Dashboard
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