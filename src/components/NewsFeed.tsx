import React from 'react';
import { NewsItem } from '../types';
import { IconNews, IconExternalLink, IconAlert, IconActivity } from './Icons';

interface NewsFeedProps {
  news: NewsItem[];
}

const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <IconActivity className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Global Wire</h2>
        </div>
        <span className="flex h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
      </div>

      <div className="flex flex-col gap-px bg-slate-800 rounded-xl overflow-hidden border border-slate-800">
        {news.length === 0 && (
           <div className="p-8 text-center bg-[#0a0f1e]">
              <p className="text-slate-500 text-sm">Connecting to terminals...</p>
           </div>
        )}
        
        {news.map((item, index) => (
          <a 
            key={index} 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group bg-[#0a0f1e] p-4 hover:bg-slate-900 transition-colors relative pl-4"
          >
            {/* Importance Indicator Line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
               item.impact === 'Critical' ? 'bg-red-500' : 'bg-slate-700'
            }`}></div>

            <div className="flex items-baseline justify-between mb-1.5">
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    {item.source}
                 </span>
                 {item.impact === 'Critical' && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1 animate-pulse">
                       <IconAlert className="h-3 w-3" /> BREAKING
                    </span>
                 )}
              </div>
              <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
            </div>

            <h3 className="text-sm font-semibold text-slate-200 leading-snug mb-1 group-hover:text-blue-300 transition-colors">
              {item.title}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
               {item.summary}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
