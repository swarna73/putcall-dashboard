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
  metrics: {
    peRatio: string;
    marketCap: string;
    dividendYield: string;
    roe?: string;           // Return on Equity
    debtToEquity?: string;  // Balance Sheet Health
    freeCashFlow?: string;  // Cash Generation
  };
  technicalLevels?: {
    support: string;      
    resistance: string;   
    stopLoss: string;     
  };
  catalyst?: string;       
  analysis: string;
  conviction: 'Strong Buy' | 'Buy' | 'Hold';
}

export interface StockAnalysis {
  symbol: string;
  name: string;
  currentPrice: string;
  fairValue: string; 
  upside: string; 
  
  valuation: {
    evEbitda: string;
    peFwd: string;
    priceToBook: string;
    rating: 'Undervalued' | 'Fair' | 'Overvalued';
  };
  
  health: {
    roic: string; 
    debtToEquity: string;
    currentRatio: string; 
    rating: 'Strong' | 'Stable' | 'Weak';
  };
  
  growth: {
    revenueGrowth: string; 
    earningsGrowth: string; 
  };

  institutional: {
    instOwnership: string;
    recentTrends: string; 
  };

  verdict: string; 
}

export interface MarketIndex {
  name: string;
  value: string;
  change: string; 
  trend: 'Up' | 'Down' | 'Flat';
}

export interface MarketSentiment {
  score: number; 
  label: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  primaryDriver: string; 
}

export interface SectorPerformance {
  name: string; 
  performance: 'Bullish' | 'Bearish' | 'Neutral';
  change: string; 
}

export interface DashboardData {
  marketIndices: MarketIndex[]; 
  marketSentiment: MarketSentiment;
  sectorRotation: SectorPerformance[];
  redditTrends: RedditTicker[];
  news: NewsItem[];
  picks: FundamentalPick[];
  lastUpdated: string;
  groundingMetadata?: any; 
}

export enum LoadingState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
