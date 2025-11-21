import React from 'react';
import { NewsItem } from '../types';
import { IconNews, IconExternalLink, IconAlert, IconActivity } from './Icons';

interface NewsFeedProps {
  news: NewsItem[];
}

const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  return (
    <div className="col-span-1 flex flex-col rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg backdrop-blur-sm lg:col-span-2">
      <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
            <IconActivity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Global Market Wire</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Breaking Headlines & Macro Data</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-green-400/90 bg-green-900/20 px-2 py-1 rounded-full ring-1 ring-green-900/40">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          LIVE
        </div>
      </div>

      <div className="grid gap-px bg-slate-800 sm:grid-cols-2">
        {news.map((item, index) => (
          <a 
            key={index} 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative flex flex-col justify-between bg-slate-950/60 p-5 transition-all hover:bg-slate-900 hover:z-10"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                {item.source}
              </span>
              <span className="font-mono text-[10px] text-slate-500">{item.timestamp}</span>
            </div>

            <div className="mb-4">
              <h3 className={`mb-2 font-semibold leading-snug group-hover:underline decoration-slate-600 underline-offset-4 ${
                item.impact === 'Critical' ? 'text-white' : 'text-slate-200'
              }`}>
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
            </div>

            <div className="mt-auto flex items-center justify-between pt-2">
               {item.impact === 'Critical' ? (
                 <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400 ring-1 ring-red-500/20">
                   <IconAlert className="h-3 w-3" /> 
                   CRITICAL IMPACT
                 </div>
               ) : (
                 <div className="text-[10px] font-medium text-slate-600 uppercase tracking-wider">
                   Market Pulse
                 </div>
               )}
               <IconExternalLink className="h-3 w-3 text-slate-700 transition-colors group-hover:text-indigo-400" />
            </div>
          </a>
        ))}
        {news.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center py-16 text-slate-500">
                <IconNews className="mb-2 h-10 w-10 opacity-20" />
                <p className="text-sm font-medium">Connecting to Bloomberg/Reuters terminals...</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;