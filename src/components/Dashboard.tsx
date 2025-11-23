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
import { IconAlert, IconLock, IconShield, IconSearch } from './Icons';

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
  const [isAIStudioEnv, setIsAIStudioEnv] = useState<boolean>(false);

  // Initial Key Check
  useEffect(() => {
    const checkKey = async () => {
      setIsCheckingKey(true);
      if (typeof window !== 'undefined' && window.aistudio) {
        setIsAIStudioEnv(true);
        const keySelected = await window.aistudio.hasSelectedApiKey();
        if (keySelected) {
          setHasKey(true);
          // Don't auto-load here, wait for render to prevent race conditions with env var injection
          setTimeout(loadData, 100); 
        } else {
          setHasKey(false);
        }
      } else {
        // Fallback for dev environments without the wrapper
        setIsAIStudioEnv(false);
        // We optimistically set hasKey to true for local dev, relying on process.env.API_KEY
        setHasKey(true); 
        setTimeout(loadData, 100);
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
        // Force re-auth if the key is invalid or missing
        setHasKey(false);
        setErrorMsg("API Access Token Required");
      } else {
        setErrorMsg("System error. Connection to Bloomberg/Reuters simulation failed.");
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
          
          <h1 className="text-2xl font-black text-white tracking-tight mb-2">TERMINAL ACCESS</h1>
          
          {isAIStudioEnv ? (
            <>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                PutCall.nl uses the Gemini API to scan real-time market data. <br/>
                Please authenticate to initialize the data feed.
              </p>
              <button 
                onClick={requestKey}
                className="group relative w-full overflow-hidden rounded-lg bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-indigo-500 hover:shadow-indigo-500/25 active:scale-[0.98]"
              >
                <div className="absolute inset-0 flex items-center justify-center gap-2 transition-transform group-hover:-translate-y-full">
                   <IconShield className="h-4 w-4" /> INITIALIZE SECURE FEED
                </div>
                <div className="absolute inset-0 flex translate-y-full items-center justify-center gap-2 transition-transform group-hover:translate-y-0">
                   CONNECT GOOGLE API
                </div>
              </button>
              <div className="mt-6 border-t border-slate-800 pt-4">
                 <p className="text-[10px] text-slate-500">
                   Requires a valid Google Cloud Project. 
                   <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 ml-1 underline underline-offset-2">
                     Billing Info
                   </a>
                 </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-red-400 mb-8 leading-relaxed border border-red-900/30 bg-red-950/20 p-4 rounded">
                <strong>Development Mode Error</strong><br/>
                Gemini API Key is missing.<br/>
                Please add <code>API_KEY</code> to your environment variables or <code>.env</code> file.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-700"
              >
                RELOAD
              </button>
            </>
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
            <div className="flex gap-2">
              {errorMsg?.includes("API Access") && isAIStudioEnv && (
                 <button onClick={requestKey} className="text-[10px] bg-red-500/20 px-3 py-1.5 rounded border border-red-500/30 hover:bg-red-500/40 transition-colors uppercase font-bold tracking-wide">
                   Change Key
                 </button>
              )}
              <button onClick={loadData} className="text-[10px] bg-red-500/20 px-3 py-1.5 rounded border border-red-500/30 hover:bg-red-500/40 transition-colors uppercase font-bold tracking-wide">
                 Retry
              </button>
            </div>
          </div>
        )}

        {/* NEW SECTION: Deep Dive Search Tool */}
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
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 rounded bg-blue-500/10 text-blue-400">
                      <IconSearch className="h-5 w-5" />
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
                      <IconLock className="h-5 w-5" />
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