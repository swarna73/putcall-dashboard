
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
  metrics: {
    peRatio: string;
    marketCap: string;
    dividendYield: string;
    pegRatio: string;    // New
    earningsDate: string; // New
    range52w: string;    // New (e.g. "Low" or "High" or "$100-$200")
  };
  analysis: string;
  conviction: 'Strong Buy' | 'Buy' | 'Hold';
}

export interface DashboardData {
  marketIndices: MarketIndex[]; // New
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
