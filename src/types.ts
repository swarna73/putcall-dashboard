
export interface MarketIndex {
  name: string;
  value: string;
  change: string; // e.g., "+1.2%"
  trend: 'Up' | 'Down' | 'Flat';
}

export interface MarketSentiment {
  score: number; // 0-100
  label: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  primaryDriver: string; // e.g., "Inflation Data"
}

export interface SectorPerformance {
  name: string; // e.g. "Tech"
  performance: 'Bullish' | 'Bearish' | 'Neutral';
  change: string; // e.g. "+2.1%"
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

// NEW: Deep Dive Analysis Data
export interface StockAnalysis {
  symbol: string;
  name: string;
  currentPrice: string;
  fairValue: string; // Estimated Intrinsic Value
  upside: string; // e.g. "+15%"
  
  valuation: {
    evEbitda: string;
    peFwd: string;
    priceToBook: string;
    rating: 'Undervalued' | 'Fair' | 'Overvalued';
  };
  
  health: {
    roic: string; // Return on Invested Capital (Quality metric)
    debtToEquity: string;
    currentRatio: string; // Liquidity
    rating: 'Strong' | 'Stable' | 'Weak';
  };
  
  growth: {
    revenueGrowth: string; // YoY
    earningsGrowth: string; // YoY
  };

  institutional: {
    instOwnership: string;
    recentTrends: string; // e.g. "Hedge Funds Buying"
  };

  verdict: string; // 1-2 sentence CFA summary
}

export interface DashboardData {
  marketIndices: MarketIndex[]; 
  marketSentiment: MarketSentiment;
  sectorRotation: SectorPerformance[];
  redditTrends: RedditTicker[];
  news: NewsItem[];
  picks: FundamentalPick[];
  lastUpdated: string;
  groundingMetadata?: any; // Contains source URLs from Google Search
}

export enum LoadingState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR
}

// Global Window Interface for AI Studio
declare global {
  // We augment the AIStudio interface which is used by window.aistudio
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}
