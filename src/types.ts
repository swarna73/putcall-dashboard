export interface RedditTicker {
  symbol: string;
  name: string;
  mentions: number;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  sentimentScore: number; // 0 to 100
  discussionSummary: string;
}

export interface NewsItem {
  title: string;
  source: string;
  url: string;
  timestamp: string;
  summary: string;
  impact: 'Critical' | 'High' | 'Medium';
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
  };
  analysis: string;
  conviction: 'Strong Buy' | 'Buy' | 'Hold';
}

export interface DashboardData {
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