
import React from 'react';
import { NewsItem } from '../types';
import { IconNews, IconExternalLink, IconAlert, IconActivity } from './Icons';

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
    <div className="flex flex-col gap-3">
      {news.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-xl bg-slate-900/20 border border-slate-800 border-dashed">
           <IconNews className="h-8 w-8 text-slate-600 mb-3 opacity-50" />
           <p className="text-sm text-slate-500 font-medium">Waiting for wire feed...</p>
        </div>
      ) : (
        news.map((item, index) => {
          const safeUrl = getSafeUrl(item);
          return (
            <a 
              key={index} 
              href={safeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative flex flex-col gap-2 rounded-lg border border-slate-800 bg-[#0b1221] p-5 transition-all hover:border-blue-500/30 hover:bg-[#0f192d] hover:shadow-lg hover:shadow-blue-900/5"
            >
              {/* Critical Indicator */}
              {item.impact === 'Critical' && (
                 <div className="absolute -left-[1px] top-4 bottom-4 w-1 rounded-r bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]"></div>
              )}

              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                       item.source.includes('Bloomberg') ? 'bg-blue-950 text-blue-400 border border-blue-900' :
                       item.source.includes('Reuters') ? 'bg-orange-950 text-orange-400 border border-orange-900' :
                       'bg-slate-800 text-slate-400'
                    }`}>
                       {item.source}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
                 </div>
                 {item.impact === 'Critical' && (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-500 animate-pulse">
                       <IconAlert className="h-3 w-3" /> CRITICAL
                    </span>
                 )}
              </div>

              <div className="pl-2">
                 <h3 className={`text-base font-bold leading-tight mb-2 group-hover:text-blue-200 transition-colors ${
                    item.impact === 'Critical' ? 'text-white' : 'text-slate-200'
                 }`}>
                    {item.title}
                 </h3>
                 <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {item.summary}
                 </p>
              </div>
              
              <div className="mt-2 flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
                 <span className="flex items-center gap-1 text-[10px] font-bold text-blue-400 uppercase tracking-wide">
                    Read Source <IconExternalLink className="h-3 w-3" />
                 </span>
              </div>
            </a>
          );
        })
      )}
    </div>
  );
};

export default NewsFeed;
