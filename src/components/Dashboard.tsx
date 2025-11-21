"use client";

import React, { useEffect, useState } from 'react';
import Header from './Header';
import RedditSentiment from './RedditSentiment';
import NewsFeed from './NewsFeed';
import SmartStockBox from './SmartStockBox';
import { fetchMarketDashboard } from '../services/geminiService';
import { DashboardData, LoadingState } from '../types';
import { IconAlert, IconActivity, IconZap } from './Icons';

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
    } catch (err: any) {
      console.error(err);
      // Explicitly handle missing API key error from service
      if (err.message === "API_KEY_MISSING" || err.toString().includes("API Key")) {
        setHasApiKey(false); // Reset state to trigger landing page
        setStatus(LoadingState.IDLE);
      } else {
        setStatus(LoadingState.ERROR);
        setErrorMsg("Failed to retrieve market data. The API might be overloaded or the search failed.");
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
      // Reset status to trigger loadData in useEffect
      setStatus(LoadingState.IDLE);
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
         {/* Background FX */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
         <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>

         <div className="max-w-md w-full text-center space-y-8 relative z-10">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 shadow-2xl shadow-indigo-500/20 ring-1 ring-indigo-500/40 backdrop-blur-md">
                <IconActivity className="h-10 w-10" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter text-white">
                PutCall<span className="text-indigo-500">.nl</span>
              </h1>
              <p className="text-indigo-200/60 text-sm uppercase tracking-[0.2em] font-semibold">Market Intelligence</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
              <div className="space-y-4 mb-8">
                 <div className="flex items-center gap-3 text-left">
                    <div className="h-8 w-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500"><IconZap className="h-4 w-4"/></div>
                    <div><div className="font-bold text-slate-200">Reddit Sentiment</div><div className="text-xs text-slate-500">Real-time hype tracking</div></div>
                 </div>
                 <div className="flex items-center gap-3 text-left">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500"><IconActivity className="h-4 w-4"/></div>
                    <div><div className="font-bold text-slate-200">Bloomberg Wire</div><div className="text-xs text-slate-500">Breaking macro news</div></div>
                 </div>
              </div>

              <button 
                onClick={handleConnectApiKey}
                className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-[1.02] hover:shadow-indigo-600/40 flex items-center justify-center gap-2 group"
              >
                <span>Connect Terminal</span>
                <IconActivity className="h-4 w-4 group-hover:animate-pulse" />
              </button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-500/30 pb-12">
      <Header 
        onRefresh={loadData} 
        isLoading={status === LoadingState.LOADING}
        lastUpdated={data.lastUpdated}
      />

      <main className="container mx-auto px-4 py-6 lg:py-8">
        {status === LoadingState.ERROR && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-red-200 animate-in fade-in slide-in-from-top-2">
            <IconAlert className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium">{errorMsg}</p>
            <button 
              onClick={loadData} 
              className="ml-auto text-xs bg-red-900/30 hover:bg-red-900/50 px-3 py-1 rounded border border-red-800 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Reddit Trends (Takes up 8 columns) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
             <RedditSentiment trends={data.redditTrends} />
             <NewsFeed news={data.news} />
          </div>

          {/* Right: Smart Picks (Takes up 4 columns, Sticky) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
               <SmartStockBox picks={data.picks} />
            </div>
          </div>

        </div>

        <footer className="mt-16 border-t border-slate-900 pt-8 text-center">
           <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
              <div className="h-1 w-1 rounded-full bg-slate-600"></div>
              <div className="h-1 w-1 rounded-full bg-slate-600"></div>
              <div className="h-1 w-1 rounded-full bg-slate-600"></div>
           </div>
           <p className="text-xs text-slate-600 font-medium">
            &copy; {new Date().getFullYear()} PutCall.nl • Market Intelligence Dashboard
           </p>
           <p className="mt-1 text-[10px] text-slate-700 uppercase tracking-wider">
             Powered by Gemini 2.5 Flash & Google Search
           </p>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
