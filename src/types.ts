
export interface MarketIndex {
  name: string;
  value: string;
  change: string; // e.g., "+1.2%"
  trend: 'Up' | 'Down' | 'Flat';
}

export interface RedditTicker {
  symbol: string;
  name: string;
  mentions: number;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  sentimentScore: number; // 0 to 100
  discussionSummary: string;
  volumeChange?: string; // e.g., "+15% vs yesterday"
  keywords: string[]; // New: specific buzzwords for the word cloud
}

export interface NewsItem {
  title: string;
  source: string;
  url: string;
  timestamp: string;
  summary: string;
  impact: 'Critical' | 'High' | 'Medium';
  tags?: string[]; // e.g., ["Macro", "Earnings"]
}

export interface FundamentalPick {
  symbol: string;
  name: string;
  price: string;
  sector: string;
  // Trader's Cheat Sheet Data
  metrics: {
    peRatio: string;
    marketCap: string;
    dividendYield: string;
    pegRatio: string;
    earningsDate: string;
    range52w: string;
    // New Technicals
    rsi: number;          // Relative Strength Index (0-100)
    shortFloat: string;   // e.g., "12%"
    beta: string;         // Volatility relative to market
    relativeVolume: string; // e.g., "2.5x" (RVOL)
  };
  technicalLevels: {
    support: string;      // e.g., "$120.50"
    resistance: string;   // e.g., "$135.00"
    stopLoss: string;     // Suggested stop
  };
  catalyst: string;       // e.g. "Earnings in 3 days"
  analysis: string;
  conviction: 'Strong Buy' | 'Buy' | 'Hold';
}

export interface DashboardData {
  marketIndices: MarketIndex[]; 
  redditTrends: RedditTicker[];
  news: NewsItem[];
  picks: FundamentalPick[];
  lastUpdated: string;
}

export enum LoadingState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR
}
