"use client";

import React, { useState } from 'react';

export default function EmailPreviewPage() {
  const [previewUrl] = useState('/api/email-preview');

  return (
    <div className="min-h-screen bg-[#020617] p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📧 Email Newsletter Preview</h1>
          <p className="text-slate-400">
            This is what subscribers will receive in their inbox every day.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex gap-4">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
          >
            Open in New Tab
          </a>
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Refresh Preview
          </button>

          <div className="flex-1"></div>

          <div className="text-sm text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Data
          </div>
        </div>

        {/* Email Preview */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="bg-slate-800 px-6 py-3 border-b border-slate-700">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">To:</span>
              <span className="text-white">subscriber@example.com</span>
              <span className="flex-1"></span>
              <span className="text-slate-500">From:</span>
              <span className="text-white">PutCall.nl</span>
            </div>
          </div>
          
          <iframe
            src={previewUrl}
            className="w-full h-[800px] bg-white"
            title="Email Preview"
          />
        </div>

        {/* Info */}
        <div className="mt-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-bold text-white mb-2">📝 What's included:</h3>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>✅ Reddit Sentiment - Featured stock with news and metrics</li>
            <li>✅ Trending Runners Up - Top 10 stocks by mentions</li>
            <li>✅ Cross-Platform Validation - StockTwits vs Yahoo comparison</li>
            <li>✅ Fundamentals Screener - Value stocks with P/E and FCF</li>
            <li>✅ Smart warnings for Reddit-only meme stocks</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
