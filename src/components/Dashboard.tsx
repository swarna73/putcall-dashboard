"use client";

import React, { useEffect, useState } from 'react';
import Header from './Header';
import RedditSentiment from './RedditSentiment';
import NewsFeed from './NewsFeed';
import SmartStockBox from './SmartStockBox';
import MarketOverview from './MarketOverview';
import StockDeepDive from './StockDeepDive';
import { fetchMarketDashboard } from '../services/geminiService';
import { DashboardData, LoadingState } from '../types';
import { IconAlert, IconLock, IconShield } from './Icons';

const PREVIEW_DATA: DashboardData = {
  marketIndices: [],
  marketSentiment: { score: 50, label: 'Neutral', primaryDriver: 'Loading...' },
  sectorRotation: [],
  redditTrends: [], 
  news: [],
  picks: [],
  lastUpdated: ''
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>(PREVIEW_DATA);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [isCheckingKey, setIsCheckingKey] = useState<boolean>(true);

  // Initial Key Check
  useEffect(() => {
    const checkKey = async () => {
      setIsCheckingKey(true);
      
      // 1. Check for Local Environment Key (Prioritize .env)
      if (process.env.API_KEY) {
        setHasKey(true);
        setIsCheckingKey(false);
        // Instant load if key exists
        loadData(); 
        return;
      }

      // 2. Fallback: Check for AI Studio Embedded Key
      if (typeof window !== 'undefined' && window.aistudio) {
        const keySelected = await window.aistudio.hasSelectedApiKey();
        if (keySelected) {
          setHasKey(true);
          loadData();
        } else {
          setHasKey(false);
        }
      } else {
        // No key found in env or AI Studio
        setHasKey(false);
      }
      setIsCheckingKey(false);
    };
    checkKey();
  }, []);

  const requestKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasKey(true);
        setStatus(LoadingState.IDLE);
        loadData();
      } catch (e) {
        console.error("Key selection failed", e);
      }
    }
  };

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
      
      const msg = err?.message || "";
      if (msg.includes("API Key is missing") || msg.includes("Requested entity was not found")) {
        setHasKey(false);
        setErrorMsg("API Access Token Required");
      } else {
        setErrorMsg("Connection failed. Retrying...");
      }
    }
  };

  // --- RENDERING ---

  if (isCheckingKey) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // API KEY LOCK SCREEN
  if (!hasKey) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-[#020617] to-[#020617]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        
        <div className="relative z-10 w-full max-w-md bg-[#0b1221]/80 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-8 shadow-2xl shadow-indigo-900/30 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <IconLock className="h-8 w-8 text-indigo-400" />
          </div>
          
          <h1 className="text-2xl font-black text-white tracking-tight mb-2">TERMINAL LOCKED</h1>
          
          <p className="text-sm text-slate-400 mb-8 leading-relaxed">
             API Key not detected in environment.<br/>
             If you added <code>.env</code>, please <strong>restart the server</strong>.
          </p>

          {/* If inside AI Studio, offer the button. If local, offer reload. */}
          {typeof window !== 'undefined' && window.aistudio ? (
             <button 
               onClick={requestKey}
               className="group relative w-full overflow-hidden rounded-lg bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-indigo-500"
             >
               <span className="flex items-center justify-center gap-2">
                  <IconShield className="h-4 w-4" /> AUTHORIZE
               </span>
             </button>
          ) : (
            <button 
              onClick={() => window.location.reload()}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
            >
              RELOAD SYSTEM
            </button>
          )}
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-500/30 pb-20 relative flex flex-col">
      
      <Header 
        onRefresh={loadData} 
        isLoading={status === LoadingState.LOADING}
        lastUpdated={data.lastUpdated}
      />

      {/* Market Pulse Bar */}
      <MarketOverview 
        indices={data.marketIndices} 
        sentiment={data.marketSentiment} 
        sectors={data.sectorRotation}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8 max-w-7xl space-y-8 transition-all duration-500 flex-1 opacity-100 blur-0">
        
        {/* Error State */}
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

        {/* SECTION: Deep Dive Search Tool */}
        <section className="max-w-4xl mx-auto">
           <StockDeepDive />
        </section>

        {/* SECTION 1: THE HERO (REDDIT MOST TALKED ABOUT) */}
        <section>
           <RedditSentiment trends={data.redditTrends} />
        </section>

        {/* SECTION 2: THE GRID (NEWS & VALUE) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* LEFT: CRITICAL NEWS WIRE (2/3 Width) */}
           <div className="lg:col-span-2 flex flex-col gap-6">
              <NewsFeed news={data.news} />
           </div>

           {/* RIGHT: DEEP VALUE PICKS (1/3 Width) */}
           <div className="col-span-1 flex flex-col gap-6">
              <SmartStockBox picks={data.picks} />
           </div>
        </section>

        {/* FOOTER: GROUNDING SOURCES */}
        {data.groundingMetadata?.groundingChunks && (
           <section className="border-t border-slate-800 pt-6 mt-8">
             <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Verified Sources</h4>
             <div className="flex flex-wrap gap-2">
               {data.groundingMetadata.groundingChunks.map((chunk: any, i: number) => (
                 chunk.web?.uri ? (
                   <a 
                     key={i} 
                     href={chunk.web.uri} 
                     target="_blank" 
                     rel="noreferrer"
                     className="text-[9px] text-indigo-400 bg-indigo-950/30 border border-indigo-900/50 px-2 py-1 rounded hover:bg-indigo-900/50 truncate max-w-[200px]"
                   >
                     {chunk.web.title || new URL(chunk.web.uri).hostname}
                   </a>
                 ) : null
               ))}
             </div>
           </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;