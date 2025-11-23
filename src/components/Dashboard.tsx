
"use client";

import React, { useEffect, useState } from 'react';
import Header from './Header';
import RedditSentiment from './RedditSentiment';
import NewsFeed from './NewsFeed';
import SmartStockBox from './SmartStockBox';
import MarketOverview from './MarketOverview';
import { fetchMarketDashboard } from '../services/geminiService';
import { DashboardData, LoadingState } from '../types';
import { IconAlert, IconBrain, IconActivity } from './Icons';

const PREVIEW_DATA: DashboardData = {
  marketIndices: [],
  redditTrends: [], 
  news: [],
  picks: [],
  lastUpdated: ''
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>(PREVIEW_DATA);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setStatus(LoadingState.LOADING);
    setErrorMsg(null);
    try {
      const dashboardData = await fetchMarketDashboard();
      setData(dashboardData);
      setStatus(LoadingState.SUCCESS);
    } catch (err: any) {
      console.error("Dashboard Error:", err);
      setStatus(LoadingState.ERROR);
      setErrorMsg("System error. Please retry connection.");
    }
  };

  // Auto-load data on mount
  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-500/30 pb-20 relative flex flex-col">
      
      <Header 
        onRefresh={loadData} 
        isLoading={status === LoadingState.LOADING}
        lastUpdated={data.lastUpdated}
      />

      {/* Market Pulse Bar */}
      <MarketOverview indices={data.marketIndices} />

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8 max-w-7xl space-y-8 transition-all duration-500 flex-1 opacity-100 blur-0">
        
        {status === LoadingState.ERROR && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-red-200 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <IconAlert className="h-5 w-5 text-red-500" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
            <button onClick={loadData} className="text-[10px] bg-red-500/20 px-3 py-1.5 rounded border border-red-500/30 hover:bg-red-500/40 transition-colors uppercase font-bold tracking-wide">
               Retry
            </button>
          </div>
        )}

        {/* SECTION 1: THE HERO (REDDIT MOST TALKED ABOUT) */}
        <section>
           <RedditSentiment trends={data.redditTrends} />
        </section>

        {/* SECTION 2: THE GRID (NEWS & VALUE) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* LEFT: CRITICAL NEWS WIRE (2/3 Width) */}
           <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 rounded bg-blue-500/10 text-blue-400">
                      <IconActivity className="h-5 w-5" />
                   </div>
                   <h2 className="text-lg font-bold text-white">Global Wire</h2>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                   Real-time Intelligence
                </div>
              </div>
              <NewsFeed news={data.news} />
           </div>

           {/* RIGHT: DEEP VALUE PICKS (1/3 Width) */}
           <div className="col-span-1 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400">
                      <IconBrain className="h-5 w-5" />
                   </div>
                   <h2 className="text-lg font-bold text-white">Alpha Scan</h2>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                   Fundamentals + Technicals
                </div>
              </div>
              <SmartStockBox picks={data.picks} />
           </div>

        </section>
      </main>
    </div>
  );
};

export default Dashboard;
