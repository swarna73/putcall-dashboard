export interface RedditTicker {
  symbol: string;
  name: string;
  mentions: number;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  sentimentScore: number; // 0 to 100
  discussionSummary: string;
  volumeChange?: string; // e.g., "+15% vs yesterday"
  keywords: string[]; // New: specific buzzwords for the word cloud
  recentNews?: string[]; // NEW: Array of recent news headlines about this stock
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

export interface InsiderTrade {
  symbol: string;
  companyName: string;
  insiderName: string;
  title: string; // CEO, COO, CFO, Director, etc.
  transactionType: 'Buy' | 'Sale';
  shares: string; // e.g., "50,000"
  value: string; // e.g., "$7.5M"
  pricePerShare?: string; // e.g., "$150.00"
  filingDate: string; // e.g., "Nov 22, 2025"
  significance: string; // e.g., "Large Buy", "Clustered Buying"
}

export interface InsiderAnalysis {
  symbol: string;
  companyName: string;
  recentTrades: InsiderTrade[];
  analysis: string; // Summary of insider activity and sentiment
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
  insiderTrades: InsiderTrade[]; // NEW: Top 5 insider trades
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
    openSelectKey: () => Promise<void>;
    hasSelectedApiKey: () => Promise<boolean>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

// ============================================
// GAME TYPES - Stock Symbol Scramble
// ============================================

export interface GameStats {
  totalPoints: number;
  level: number;
  levelName: string;
  gamesPlayed: number;
  correctAnswers: number;
  averageTime: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string;
  dailyHistory: DailyGameRecord[];
}

export interface DailyGameRecord {
  date: string; // YYYY-MM-DD
  points: number;
  timeTaken: number; // seconds
  correct: boolean;
}

export interface ScrambleChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  scrambledTicker: string;
  correctTicker: string;
  companyName: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pointsValue: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  level: number;
  streak: number;
}

export const LEVELS = [
  { level: 1, name: 'Rookie Trader', minPoints: 0, maxPoints: 499 },
  { level: 2, name: 'Day Trader', minPoints: 500, maxPoints: 1999 },
  { level: 3, name: 'Portfolio Manager', minPoints: 2000, maxPoints: 4999 },
  { level: 4, name: 'Hedge Fund Manager', minPoints: 5000, maxPoints: 9999 },
  { level: 5, name: 'Warren Buffett', minPoints: 10000, maxPoints: Infinity },
];

export const STREAK_BONUSES = [
  { days: 3, bonus: 50, label: '3-Day Streak' },
  { days: 7, bonus: 100, label: '7-Day Streak' },
  { days: 30, bonus: 500, label: '30-Day Streak' },
];
