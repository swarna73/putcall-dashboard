"use client";

import React from 'react';
import { IconRefresh } from './Icons';
import Link from 'next/link';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated: string;
}

const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading, lastUpdated }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50 group-hover:shadow-indigo-500/50 transition-shadow">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">PutCall.nl</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Intelligent Market Dashboard</p>
            </div>
          </a>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-3">
            {/* Game Link - NEW */}
            <a
              href="/game"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-lg text-white font-bold text-sm transition-all shadow-lg shadow-orange-900/30 hover:shadow-orange-500/30"
            >
              <span className="text-lg">🎮</span>
              <span>Daily Challenge</span>
            </a>

            {/* Last Updated */}
            {lastUpdated && (
              <div className="hidden md:flex flex-col items-end text-xs">
                <span className="text-slate-500 font-mono uppercase tracking-wider">Last Scan</span>
                <span className="text-white font-bold font-mono">{lastUpdated}</span>
              </div>
            )}

            {/* Share Button */}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'PutCall.nl - Market Intelligence',
                    text: 'Check out this AI-powered stock market dashboard!',
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
{/* Suggestions Button */}
<Link
  href="/suggestions"
  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
  title="Suggest a feature"
>
  <span className="text-base leading-none">💡</span>
  <span className="hidden sm:inline">Suggest</span>
</Link>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed rounded-lg text-white font-bold text-sm transition-colors shadow-lg shadow-indigo-900/30"
            >
              <IconRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">REFRESH</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
