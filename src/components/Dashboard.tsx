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
import { IconShield, IconRefresh, IconLock, IconZap, IconActivity } from './Icons';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    marketIndices: [],
    marketSentiment: { score: 50, label: 'Neutral', primaryDriver: 'Loading...' },
    sectorRotation: [],
    redditTrends: [], 
    news: [],
    picks: [],
    lastUpdated: ''
  });
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE); // Start IDLE to check key first
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  useEffect(() => {
    checkKeyAndLoad();
  }, []);

  const checkKeyAndLoad = async () => {
    // 1. Check if we are in the specific environment that requires key selection
    if (typeof window !== 'undefined' && window.aistudio) {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setIsApiKeyMissing(true);
          setStatus(LoadingState.IDLE); // Waiting for user
          return;
        }
      } catch (e) {
        console.warn("Error checking API key status:", e);
      }
    }
    
    // 2. Proceed to load
    loadData();
  };

  const handleConnectApiKey = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Force a reload to pick up the new key environment variable
        window.location.reload();
      } else {
        alert("API Key selection is not supported in this environment.");
      }
    } catch (e) {
      console.error("Failed to select key:", e);
    }
  };

  const loadData = async () => {
    setStatus(LoadingState.LOADING);
    setErrorMsg(null);
    setIsApiKeyMissing(false);

    try {
      const dashboardData = await fetchMarketDashboard();
      setData(dashboardData);
      setStatus(LoadingState.SUCCESS);
    } catch (err: any) {
      console.error("Dashboard Error:", err);
      setStatus(LoadingState.ERROR);
      
      const msg = err?.message || "Unknown Error";
      
      if (msg.includes("API Key is missing")) {
        setErrorMsg("API Key Connection Required");
        setIsApiKeyMissing(true);
      } else if (msg.includes("403")) {
        setErrorMsg("API Access Denied (Quota/Billing)");
      } else {
        setErrorMsg("Market Analysis Interrupted");
      }
    }
  };

  // 1. WELCOME / CONNECT SCREEN
  if (isApiKeyMissing || (status === LoadingState.IDLE && isApiKeyMissing)) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px]"></div>

        <div className="relative z-10 max-w-lg w-full bg-[#0b1221]/90 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
          
          <div className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/40">
              <IconActivity className="h-8 w-8 text-indigo-400" />
            </div>
            
            <h1 className="mb-2 text-2xl font-black text-white tracking-tight">PutCall.nl</h1>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-8">Intelligent Market Dashboard</p>
            
            <div className="space-y-4 mb-8 text-left bg-slate-900/50 p-6 rounded-xl border border-slate-800">
              <div className="flex items-start gap-3">
                 <IconZap className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                 <div>
                   <h3 className="text-sm font-bold text-white">Real-time Sentiment</h3>
                   <p className="text-xs text-slate-400">Live analysis of Reddit trends & Hype.</p>
                 </div>
              </div>
              <div className="flex items-start gap-3">
                 <IconShield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                 <div>
                   <h3 className="text-sm font-bold text-white">Deep Value Picks</h3>
                   <p className="text-xs text-slate-400">Fundamental screening for quality assets.</p>
                 </div>
              </div>
            </div>

            <button 
              onClick={handleConnectApiKey}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <IconLock className="h-4 w-4" />
              CONNECT SECURE API KEY
            </button>
            <p className="mt-4 text-[10px] text-slate-500">
              Your API key is stored locally in your browser session for direct Gemini access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. ERROR STATE (Retry)
  if (status === LoadingState.ERROR && !isApiKeyMissing) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-950/20 border border-red-500/30 rounded-xl p-8 text-center backdrop-blur-md">
           <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
             <IconShield className="h-6 w-6" />
           </div>
           <h3 className="text-lg font-bold text-white mb-2">{errorMsg}</h3>
           <p className="text-sm text-red-200/60 mb-6">The market analysis engine encountered an unexpected break.</p>
           <button 
              onClick={loadData}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 mx-auto"
           >
              <IconRefresh className="h-3.5 w-3.5" /> RETRY ANALYSIS
           </button>
        </div>
      </div>
    );
  }

  // 3. MAIN DASHBOARD
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
      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-[1400px] space-y-6 flex-1">
        
        {/* TOP ROW: REDDIT HYPE & CRITICAL NEWS */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
           
           {/* LEFT: Reddit Sentiment (Large Impact) */}
           <div className="xl:col-span-8 flex flex-col gap-6">
              <RedditSentiment trends={data.redditTrends} />
              
              {/* Deep Dive Tool tucked under Sentiment */}
              <div className="hidden xl:block">
                 <StockDeepDive />
              </div>
           </div>

           {/* RIGHT: Critical News Feed & Smart Picks */}
           <div className="xl:col-span-4 flex flex-col gap-6 h-full">
              <div className="flex-1 min-h-[400px]">
                 <NewsFeed news={data.news} />
              </div>
              <div className="flex-shrink-0">
                 <SmartStockBox picks={data.picks} />
              </div>
           </div>
        </div>
        
        {/* Mobile/Tablet Deep Dive (Visible only on smaller screens) */}
        <div className="xl:hidden">
            <StockDeepDive />
        </div>

        {/* FOOTER: GROUNDING SOURCES */}
        {data.groundingMetadata?.groundingChunks && (
           <section className="pt-6 mt-8 border-t border-slate-800/50 opacity-60 hover:opacity-100 transition-opacity">
             <div className="flex items-center gap-2 mb-3">
               <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Data Sources</h4>
             </div>
             <div className="flex flex-wrap gap-2">
               {data.groundingMetadata.groundingChunks.map((chunk: any, i: number) => (
                 chunk.web?.uri ? (
                   <a 
                     key={i} 
                     href={chunk.web.uri} 
                     target="_blank" 
                     rel="noreferrer"
                     className="text-[9px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded hover:bg-slate-800 hover:text-white transition-colors truncate max-w-[200px]"
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