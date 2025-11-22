
"use client";

import React, { useState } from 'react';
import { IconActivity, IconRefresh, IconExternalLink } from './Icons';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated: string | null;
}

export default function Header({ onRefresh, isLoading, lastUpdated }: HeaderProps) {
  const [copied, setCopied] = useState(false);
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PutCall.nl',
          text: 'Real-time market sentiment and AI stock picks.',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#020617]/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400/30">
            <IconActivity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              PutCall<span className="text-indigo-400">.nl</span>
            </h1>
            <p className="hidden text-[10px] font-medium tracking-wide text-slate-400 sm:block uppercase">Intelligent Market Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="hidden flex-col items-end text-right sm:flex">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Last Scan</span>
              <span className="font-mono text-xs text-slate-300">{lastUpdated}</span>
            </div>
          )}
          
          <div className="h-8 w-px bg-slate-800 mx-1 hidden sm:block"></div>

          <button
            onClick={handleShare}
            className={`hidden sm:flex items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-xs font-medium transition-all ${
              copied 
                ? 'bg-green-900/20 text-green-400 border-green-900/50' 
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Share Dashboard"
          >
            <IconExternalLink className="h-3.5 w-3.5" />
            {copied ? 'Copied!' : 'Share'}
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={`flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-900/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-900/40 disabled:opacity-50 disabled:cursor-not-allowed ${isLoading ? 'animate-pulse' : ''}`}
          >
            <IconRefresh className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'SCANNING...' : 'REFRESH'}
          </button>
        </div>
      </div>
    </header>
  );
}
