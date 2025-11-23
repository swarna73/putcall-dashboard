import React from 'react';
import { NewsItem } from '../types';
import { IconNews, IconExternalLink, IconAlert } from './Icons';

interface NewsFeedProps {
  news: NewsItem[];
}

const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  const getSafeUrl = (item: NewsItem) => {
    // If URL is missing, relative, or internal hashtag, generate a search query
    if (!item.url || item.url.startsWith('/') || item.url.startsWith('#') || item.url.includes('localhost') || item.url.includes('putcall.nl')) {
      return `https://www.google.com/search?q=${encodeURIComponent(item.title + " " + item.source)}`;
    }
    return item.url;
  };

  return (
    <div className="flex flex-col h-full bg-[#0b1221] border border-slate-800 rounded-xl overflow-hidden shadow-lg shadow-black/20">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0f172a]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-500/10 text-blue-400">
             <IconNews className="h-4 w-4" />
          </div>
          <div>
             <h2 className="text-xs font-bold text-white uppercase tracking-wider">Major Wire Feed</h2>
             <p className="text-[9px] text-slate-500 font-mono">BLOOMBERG • REUTERS • WSJ</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Live</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 max-h-[600px] xl:max-h-none">
        {news.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center opacity-50">
             <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-transparent"></div>
             <p className="text-[10px] font-mono text-slate-500">CONNECTING TO WIRE...</p>
          </div>
        ) : (
          news.map((item, index) => {
            const safeUrl = getSafeUrl(item);
            const isCritical = item.impact === 'Critical';
            
            return (
              <a 
                key={index} 
                href={safeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`group block relative p-3 rounded border transition-all hover:translate-x-1 ${
                  isCritical 
                    ? 'bg-red-950/10 border-red-900/30 hover:bg-red-950/20 hover:border-red-500/30' 
                    : 'bg-[#131c2e] border-slate-800 hover:bg-[#1a253a] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                   <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                         item.source.toLowerCase().includes('bloomberg') ? 'bg-[#26004d] text-[#e8b3ff] border border-[#5200a6]' :
                         item.source.toLowerCase().includes('reuters') ? 'bg-[#331a00] text-[#ffcc80] border border-[#663300]' :
                         'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                         {item.source}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">{item.timestamp}</span>
                   </div>
                   {isCritical && (
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-500 animate-pulse">
                         <IconAlert className="h-3 w-3" /> CRITICAL
                      </span>
                   )}
                </div>

                <h3 className={`text-sm font-bold leading-snug mb-1 group-hover:underline decoration-slate-600 underline-offset-4 ${
                   isCritical ? 'text-white' : 'text-slate-200'
                }`}>
                   {item.title}
                </h3>
                
                <div className="flex items-center justify-between mt-2">
                   <p className="text-[10px] text-slate-400 line-clamp-1 flex-1 mr-2 opacity-80">
                      {item.summary}
                   </p>
                   <IconExternalLink className="h-3 w-3 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NewsFeed;