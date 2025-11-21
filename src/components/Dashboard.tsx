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
      if (err.message === "API_KEY_MISSING" || err.toString().includes("API Key")) {
        setHasApiKey(false);
        setStatus(LoadingState.IDLE);
      } else {
        setStatus(LoadingState.ERROR);
        setErrorMsg("Failed to retrieve market data. Check connection.");
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
         {/* Landing Screen */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
         <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
         
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
              <p className="text-slate-400 mb-6 text-sm">Connect your terminal to access real-time Reddit sentiment, Bloomberg headlines, and Deep Value scans.</p>
              <button 
                onClick={handleConnectApiKey}
                className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-[1.02] hover:shadow-indigo-600/40 flex items-center justify-center gap-2"
              >
                <span>Connect Terminal</span>
                <IconActivity className="h-4 w-4" />
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

      <main className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {status === LoadingState.ERROR && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-red-200">
            <IconAlert className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium">{errorMsg}</p>
            <button onClick={loadData} className="ml-auto text-xs bg-red-900/30 px-3 py-1 rounded border border-red-800 hover:text-white">Retry</button>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Market Pulse (Reddit & News) - Spans 8 cols */}
          <div className="lg:col-span-8 flex flex-col gap-8">
             <section>
               <RedditSentiment trends={data.redditTrends} />
             </section>
             <section>
               <NewsFeed news={data.news} />
             </section>
          </div>

          {/* Right Column: Deep Value Sidebar - Spans 4 cols */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
               <SmartStockBox picks={data.picks} />
            </div>
          </div>

        </div>

        <footer className="mt-24 border-t border-slate-900 pt-8 text-center opacity-50 hover:opacity-100 transition-opacity">
           <p className="text-xs text-slate-600 font-medium">
            PutCall.nl • Intelligent Market Dashboard
           </p>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
