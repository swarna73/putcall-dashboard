import React from 'react';
import { NewsItem } from '../types';
import { IconNews, IconExternalLink, IconAlert, IconActivity } from './Icons';

interface NewsFeedProps {
  news: NewsItem[];
}

const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex items-center justify-between border-b border-slate-800/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <IconNews className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Global Wire</h2>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Top Sources Only</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-slate-900 border border-slate-800">
           <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
           </span>
           <span className="text-[10px] font-bold text-slate-300">LIVE</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {news.length === 0 && (
             <div className="col-span-2 py-12 text-center text-slate-600 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
                <IconActivity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Waiting for terminal feed...</p>
             </div>
        )}

        {news.map((item, index) => (
          <a 
            key={index} 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative flex flex-col justify-between rounded-xl bg-[#0f172a] border border-slate-800 p-5 transition-all hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-1"
          >
            <div className="mb-3 flex items-start justify-between">
              <span className="inline-flex items-center rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-300 border border-slate-700">
                {item.source}
              </span>
              <span className="text-[10px] font-medium text-slate-500 font-mono">{item.timestamp}</span>
            </div>

            <div className="mb-4">
              <h3 className={`text-sm font-semibold leading-snug mb-2 group-hover:text-indigo-300 transition-colors ${
                item.impact === 'Critical' ? 'text-white' : 'text-slate-200'
              }`}>
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
            </div>

            <div className="mt-auto pt-3 border-t border-slate-800/50 flex items-center justify-between">
               {item.impact === 'Critical' ? (
                 <div className="flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase tracking-wide">
                   <IconAlert className="h-3 w-3" /> Critical Impact
                 </div>
               ) : (
                 <div className="text-[10px] font-medium text-slate-600 uppercase tracking-wide">Market Update</div>
               )}
               <IconExternalLink className="h-3 w-3 text-slate-600 group-hover:text-white transition-colors" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
