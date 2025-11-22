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
        // Fallback for dev environments or if aistudio isn't injected yet
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
      // Re-instantiate service to ensure latest env var is picked up
      const dashboardData = await fetchMarketDashboard();
      setData(dashboardData);
      setStatus(LoadingState.SUCCESS);
    } catch (err: any) {
      console.error("Dashboard Error:", err);
      if (err.message === "API_KEY_MISSING" || err.toString().includes("API Key")) {
        setHasApiKey(false);
        setStatus(LoadingState.IDLE);
      } else {
        setStatus(LoadingState.ERROR);
        setErrorMsg("Failed to retrieve market data. Please retry.");
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
      // Small delay to allow environment variable propagation
      setTimeout(() => {
        setHasApiKey(true);
        setStatus(LoadingState.IDLE);
      }, 500);
    }
  };

  if (isCheckingKey) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
         {/* Ambient Glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
         
         <div className="max-w-md w-full text-center space-y-8 relative z-10">
            <div className="flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 shadow-2xl shadow-indigo-500/20 ring-1 ring-white/10 backdrop-blur-xl">
                <IconActivity className="h-12 w-12" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                PutCall<span className="text-indigo-500">.nl</span>
              </h1>
              <p className="text-indigo-200/60 text-xs uppercase tracking-[0.3em] font-bold">Intelligent Market Dashboard</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
              <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                Access real-time <strong>Reddit Sentiment Analysis</strong>, breaking <strong>Bloomberg Wire</strong> headlines, and AI-curated <strong>Deep Value Picks</strong>.
              </p>
              <button 
                onClick={handleConnectApiKey}
                className="group w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <span>Initialize Terminal</span>
                <IconZap className="h-4 w-4 transition-transform group-hover:scale-125" />
              </button>
              <p className="mt-4 text-[10px] text-slate-600">Requires Gemini API Access</p>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-500/30 pb-20">
      <Header 
        onRefresh={loadData} 
        isLoading={status === LoadingState.LOADING}
        lastUpdated={data.lastUpdated}
      />

      <main className="container mx-auto px-4 lg:px-8 py-8 max-w-7xl space-y-8">
        
        {status === LoadingState.ERROR && (
          <div className="flex items-center gap-3 rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-red-200 animate-in fade-in slide-in-from-top-4">
            <IconAlert className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium">{errorMsg}</p>
            <button onClick={loadData} className="ml-auto text-xs bg-red-900/30 px-4 py-1.5 rounded-md border border-red-800 hover:bg-red-900/50 hover:text-white transition-colors font-bold">RETRY CONNECTION</button>
          </div>
        )}

        {/* SECTION 1: THE HERO (REDDIT MOST TALKED ABOUT) */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
           <RedditSentiment trends={data.redditTrends} />
        </section>

        {/* SECTION 2: THE GRID (NEWS & VALUE) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
           
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
      
      <footer className="mt-24 border-t border-slate-900/50 py-8 text-center">
         <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest opacity-50">
          PutCall.nl • Intelligent Market Dashboard • v2.0
         </p>
      </footer>
    </div>
  );
};

export default Dashboard;