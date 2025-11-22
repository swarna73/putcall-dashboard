"use client";

import React, { useEffect, useState } from 'react';
import Header from './Header';
import RedditSentiment from './RedditSentiment';
import NewsFeed from './NewsFeed';
import SmartStockBox from './SmartStockBox';
import { fetchMarketDashboard } from '../services/geminiService';
import { DashboardData, LoadingState } from '../types';
import { IconAlert, IconActivity, IconZap, IconBrain } from './Icons';

// Preview data to show structure before load
const PREVIEW_DATA: DashboardData = {
  redditTrends: [], 
  news: [],
  picks: [],
  lastUpdated: ''
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>(PREVIEW_DATA);
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
      setStatus(LoadingState.ERROR);
      setErrorMsg("System error. Please retry connection.");
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
    // Try standard connect
    if (win.aistudio && win.aistudio.openSelectKey) {
      try {
         await win.aistudio.openSelectKey();
         setHasApiKey(true);
         setStatus(LoadingState.IDLE);
         return;
      } catch (e) {
         console.error("Key selection failed", e);
      }
    } 
    
    // If we get here, either bridge is missing OR user cancelled/failed.
    // We proceed to "Simulation Mode" (handled by service returning mock data)
    console.warn("Proceeding to Simulation/Dev Mode");
    setHasApiKey(true);
    setStatus(LoadingState.IDLE);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-500/30 pb-20 relative">
      
      <Header 
        onRefresh={loadData} 
        isLoading={status === LoadingState.LOADING}
        lastUpdated={data.lastUpdated}
      />

      {/* Main Content - Visible but dimmed when locked */}
      <main className={`container mx-auto px-4 lg:px-8 py-8 max-w-7xl space-y-8 transition-all duration-500 ${!hasApiKey ? 'opacity-40 pointer-events-none blur-[2px]' : 'opacity-100 blur-0'}`}>
        
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Background gradient - subtle so user can see app behind */}
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px]"></div>
            
            <div className="max-w-md w-full mx-4 relative pointer-events-auto animate-in zoom-in-95 duration-300">
                <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full"></div>
                <div className="relative bg-[#0b1221]/95 border border-indigo-500/40 p-8 rounded-2xl shadow-2xl shadow-black backdrop-blur-xl">
                    <div className="flex justify-center mb-6">
                        <div className="h-16 w-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                            <IconZap className="h-8 w-8 text-indigo-400" />
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">System Locked</h2>
                    <p className="text-center text-slate-400 text-sm mb-8 leading-relaxed">
                        Initialize the terminal to access real-time Reddit sentiment and Bloomberg wire data.
                    </p>

                    <button 
                        onClick={handleConnectApiKey}
                        className="group w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 ring-1 ring-indigo-400/20"
                    >
                        <span>Initialize Connection</span>
                        <IconZap className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </button>
                    <p className="mt-4 text-center text-[10px] text-slate-600 uppercase tracking-widest">
                        Powered by Gemini 2.5 Flash
                    </p>
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