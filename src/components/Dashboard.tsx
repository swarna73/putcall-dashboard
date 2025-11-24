"use client";

import React, { useEffect, useState } from 'react';
import Header from './Header';
import RedditSentiment from './RedditSentiment';
import NewsFeed from './NewsFeed';
import SmartStockBox from './SmartStockBox';
import InsiderTrading from './InsiderTrading';
import MarketOverview from './MarketOverview';
import StockDeepDive from './StockDeepDive';
import { fetchMarketDashboard } from '../services/geminiService';
import { DashboardData, LoadingState } from '../types';
import { IconShield, IconRefresh } from './Icons';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    marketIndices: [],
    marketSentiment: { score: 50, label: 'Neutral', primaryDriver: '' },
    sectorRotation: [],
    redditTrends: [], 
    news: [],
    picks: [],
    insiderTrades: [],
    lastUpdated: ''
  });
  const [status, setStatus] = useState<LoadingState>(LoadingState.LOADING);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

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
        setErrorMsg("Server Configuration Error");
        setIsApiKeyMissing(true);
      } else if (msg.includes("403")) {
        setErrorMsg("API Access Denied (Quota/Billing)");
      } else {
        setErrorMsg("Analysis Interrupted. Please Retry.");
      }
    }
  };

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
      <main className="container mx-auto px-4 lg:px-8 py-8 max-w-7xl space-y-8 flex-1">
        
        {/* Error State Banner */}
        {status === LoadingState.ERROR && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-950/40 p-6 text-red-100 animate-in fade-in slide-in-from-top-4 shadow-2xl shadow-red-900/20 backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-red-500/20 rounded-full ring-1 ring-red-500/50">
                 <IconShield className="h-6 w-6 text-red-500" />
              </div>
              <div>
                 <h3 className="text-lg font-bold text-white tracking-tight">{errorMsg}</h3>
                 <p className="text-sm text-red-200/70">
                   {isApiKeyMissing 
                     ? "The API key needs to be configured on the server. Please contact the administrator." 
                     : "The AI analysis encountered an interruption. Usually a temporary glitch."}
                 </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              {!isApiKeyMissing && (
                <button 
                  onClick={loadData} 
                  className="flex items-center gap-2 whitespace-nowrap text-xs bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg border border-slate-600 font-bold tracking-wide transition-colors"
                >
                   <IconRefresh className="h-3.5 w-3.5" />
                   RETRY
                </button>
              )}
            </div>
          </div>
        )}

        {/* SECTION 1: REDDIT SENTIMENT (HERO) */}
        <section>
           <RedditSentiment trends={data.redditTrends} />
        </section>

        {/* SECTION 2: FINANCIAL X-RAY */}
        <section>
           <StockDeepDive />
        </section>

        {/* SECTION 3: SIDE-BY-SIDE (FUNDAMENTALS | INSIDER TRADING) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* LEFT: FUNDAMENTALS SCREENER */}
           <div className="col-span-1">
              <SmartStockBox picks={data.picks} />
           </div>

           {/* RIGHT: INSIDER TRADING ALERT */}
           <div className="col-span-1">
              <InsiderTrading topTrades={data.insiderTrades} />
           </div>
        </section>

        {/* SECTION 4: NEWS FEED (FULL WIDTH) */}
        <section>
           <NewsFeed news={data.news} />
        </section>

        {/* FOOTER: GROUNDING SOURCES */}
        {data.groundingMetadata?.groundingChunks && (
           <section className="pt-6 mt-8 opacity-60 hover:opacity-100 transition-opacity">
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