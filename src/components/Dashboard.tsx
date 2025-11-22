"use client";

import React, { useEffect, useState } from 'react';
import Header from './Header';
import RedditSentiment from './RedditSentiment';
import NewsFeed from './NewsFeed';
import SmartStockBox from './SmartStockBox';
import { fetchMarketDashboard } from '../services/geminiService';
import { DashboardData, LoadingState } from '../types';
import { IconAlert, IconActivity, IconZap, IconBrain } from './Icons';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    redditTrends: [],
    news: [],
    picks: [],
    lastUpdated: '',
  });
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isCheckingKey, setIsCheckingKey] = useState<boolean>(true);

  useEffect(() => {
    const checkApiKey = async () => {
      const win = window as any;
      if (win.aistudio && win.aistudio.hasSelectedApiKey) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // If bridge is missing, we default to false, but user can bypass via button
        setHasApiKey(false); 
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
    } catch (err: any) {
      console.error("Dashboard Error:", err);
      // Handle API Key specific errors
      if (err.message?.includes("API key") || err.message?.includes("403") || err.message === "API_KEY_MISSING") {
        setHasApiKey(false);
        setStatus(LoadingState.IDLE);
      } else {
        setStatus(LoadingState.ERROR);
        setErrorMsg("Unable to fetch market intelligence. Please retry.");
      }
    }
  };

  useEffect(() => {
    if (hasApiKey && !isCheckingKey && status === LoadingState.IDLE) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasApiKey, isCheckingKey]);

  const handleConnectApiKey = async () => {
    const win = window as any;
    if (win.aistudio && win.aistudio.openSelectKey) {
      await win.aistudio.openSelectKey();
      setHasApiKey(true);
      setStatus(LoadingState.IDLE); // This will trigger the useEffect to loadData
    } else {
      // FALLBACK for local dev/testing where window.aistudio is missing
      console.warn("AI Studio bridge missing - bypassing lock for UI demo");
      setHasApiKey(true);
      setStatus(LoadingState.IDLE);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-500/30 pb-20 relative">
      
      <Header 
        onRefresh={loadData} 
        isLoading={status === LoadingState.LOADING}
        lastUpdated={data.lastUpdated}
      />

      {/* Main Content - Removed blur so it is visible behind overlay */}
      <main className={`container mx-auto px-4 lg:px-8 py-8 max-w-7xl space-y-8 transition-all duration-500 ${!hasApiKey ? 'pointer-events-none select-none grayscale-[0.5]' : ''}`}>
        
        {status === LoadingState.ERROR && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-red-200 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <IconAlert className="h-5 w-5 text-red-500" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleConnectApiKey} className="text-[10px] bg-red-900/40 px-3 py-1.5 rounded hover:bg-red-900/60 transition-colors uppercase font-bold tracking-wide">
                Check Key
              </button>
              <button onClick={loadData} className="text-[10px] bg-red-500/20 px-3 py-1.5 rounded border border-red-500/30 hover:bg-red-500/40 transition-colors uppercase font-bold tracking-wide">
                Retry
              </button>
            </div>
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
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-blue-500/10 text-blue-400">
                    <IconActivity className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">The Wire</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Critical Market Intelligence</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] font-bold text-green-500 tracking-wide">LIVE FEED</span>
                </div>
              </div>
              <NewsFeed news={data.news} />
           </div>

           {/* RIGHT: SMART STOCK BOX (1/3 Width) - Sticky Sidebar */}
           <div className="lg:col-span-1">
              <div className="sticky top-24">
                 <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
                    <div className="p-2 rounded bg-emerald-500/10 text-emerald-400">
                      <IconBrain className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Deep Value</h2>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Fundamental Scan</p>
                    </div>
                 </div>
                 <SmartStockBox picks={data.picks} />
              </div>
           </div>

        </section>

      </main>

      {/* OVERLAY FOR API KEY CONNECTION */}
      {(!hasApiKey && !isCheckingKey) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/40 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="max-w-md w-full mx-4 relative pointer-events-auto">
                <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full"></div>
                <div className="relative bg-[#0b1221]/90 border border-indigo-500/30 p-8 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-md">
                    <div className="flex justify-center mb-6">
                        <div className="h-16 w-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                            <IconZap className="h-8 w-8 text-indigo-400" />
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">Terminal Access</h2>
                    <p className="text-center text-slate-400 text-sm mb-8 leading-relaxed">
                        Connect your Gemini API key to unlock real-time sentiment analysis and live market data.
                    </p>

                    <button 
                        onClick={handleConnectApiKey}
                        className="group w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 ring-1 ring-indigo-400/20"
                    >
                        <span>Initialize Connection</span>
                        <IconZap className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
      )}
      
      <footer className="mt-24 border-t border-slate-900/50 py-8 text-center">
         <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest opacity-50">
          PutCall.nl • Intelligent Market Dashboard • v2.0
         </p>
      </footer>
    </div>
  );
};

export default Dashboard;