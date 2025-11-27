// /src/utils/gameUtils.ts

import { GameStats, ScrambleChallenge, LEVELS, STREAK_BONUSES } from '../types';

// Stock database for challenges
const STOCK_DATABASE = [
  // Easy (4 letters)
  { ticker: 'AAPL', company: 'Apple Inc.', hint: 'Tech giant, iPhone maker', difficulty: 'easy' as const },
  { ticker: 'MSFT', company: 'Microsoft', hint: 'Windows & Office creator', difficulty: 'easy' as const },
  { ticker: 'GOOGL', company: 'Alphabet Inc.', hint: 'Search engine leader', difficulty: 'easy' as const },
  { ticker: 'AMZN', company: 'Amazon', hint: 'E-commerce & cloud giant', difficulty: 'easy' as const },
  { ticker: 'META', company: 'Meta Platforms', hint: 'Facebook parent company', difficulty: 'easy' as const },
  { ticker: 'TSLA', company: 'Tesla', hint: 'Electric vehicle pioneer', difficulty: 'easy' as const },
  { ticker: 'NVDA', company: 'NVIDIA', hint: 'AI chip leader', difficulty: 'easy' as const },
  { ticker: 'INTC', company: 'Intel', hint: 'Semiconductor giant', difficulty: 'easy' as const },
  { ticker: 'AMD', company: 'AMD', hint: 'CPU & GPU maker', difficulty: 'easy' as const },
  { ticker: 'NFLX', company: 'Netflix', hint: 'Streaming service king', difficulty: 'easy' as const },
  
  // Medium (5 letters)
  { ticker: 'PLTR', company: 'Palantir', hint: 'Data analytics for government', difficulty: 'medium' as const },
  { ticker: 'SNOW', company: 'Snowflake', hint: 'Cloud data platform', difficulty: 'medium' as const },
  { ticker: 'COIN', company: 'Coinbase', hint: 'Crypto exchange', difficulty: 'medium' as const },
  { ticker: 'UBER', company: 'Uber', hint: 'Ride-sharing giant', difficulty: 'medium' as const },
  { ticker: 'ABNB', company: 'Airbnb', hint: 'Vacation rental platform', difficulty: 'medium' as const },
  { ticker: 'RIVN', company: 'Rivian', hint: 'Electric truck maker', difficulty: 'medium' as const },
  { ticker: 'SOFI', company: 'SoFi', hint: 'Digital banking fintech', difficulty: 'medium' as const },
  { ticker: 'ROKU', company: 'Roku Inc.', hint: 'Streaming device maker', difficulty: 'medium' as const },
  { ticker: 'MSTR', company: 'MicroStrategy', hint: 'Bitcoin-buying company', difficulty: 'medium' as const },
  
  // Hard (6+ letters)
  { ticker: 'GOOG', company: 'Alphabet Inc.', hint: 'Search giant (Class C)', difficulty: 'hard' as const },
  { ticker: 'BABA', company: 'Alibaba', hint: 'Chinese e-commerce titan', difficulty: 'hard' as const },
  { ticker: 'ORCL', company: 'Oracle', hint: 'Database software leader', difficulty: 'hard' as const },
  { ticker: 'ADBE', company: 'Adobe', hint: 'Creative software maker', difficulty: 'hard' as const },
  { ticker: 'CSCO', company: 'Cisco', hint: 'Networking equipment giant', difficulty: 'hard' as const },
  { ticker: 'PYPL', company: 'PayPal', hint: 'Digital payments platform', difficulty: 'hard' as const },
];

// Scramble a ticker symbol
function scrambleTicker(ticker: string): string {
  const chars = ticker.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  // Make sure it's actually scrambled (not same as original)
  const scrambled = chars.join('');
  return scrambled === ticker ? scrambleTicker(ticker) : scrambled;
}

// Generate daily challenge based on date
export function generateDailyChallenge(date: string): ScrambleChallenge {
  // Use date as seed for consistent daily puzzle
  const dateNum = parseInt(date.replace(/-/g, ''));
  const index = dateNum % STOCK_DATABASE.length;
  const stock = STOCK_DATABASE[index];
  
  const pointsMap = { easy: 100, medium: 150, hard: 200 };
  
  return {
    id: `${date}-${stock.ticker}`,
    date,
    scrambledTicker: scrambleTicker(stock.ticker),
    correctTicker: stock.ticker,
    companyName: stock.company,
    hint: stock.hint,
    difficulty: stock.difficulty,
    pointsValue: pointsMap[stock.difficulty],
  };
}

// Get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Calculate level from points
export function calculateLevel(points: number): { level: number; levelName: string; progress: number; pointsToNext: number } {
  const currentLevel = LEVELS.find(l => points >= l.minPoints && points <= l.maxPoints) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
  
  const progress = nextLevel 
    ? ((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;
  
  const pointsToNext = nextLevel ? nextLevel.minPoints - points : 0;
  
  return {
    level: currentLevel.level,
    levelName: currentLevel.name,
    progress: Math.min(progress, 100),
    pointsToNext,
  };
}

// Calculate streak bonus
export function calculateStreakBonus(streak: number): number {
  let bonus = 0;
  
  if (streak >= 30) bonus += 500;
  else if (streak >= 7) bonus += 100;
  else if (streak >= 3) bonus += 50;
  
  return bonus;
}

// Calculate time bonus (faster = more points)
export function calculateTimeBonus(seconds: number, basePoints: number): number {
  if (seconds <= 10) return Math.floor(basePoints * 1.0); // 100% bonus
  if (seconds <= 30) return Math.floor(basePoints * 0.5); // 50% bonus
  if (seconds <= 60) return Math.floor(basePoints * 0.25); // 25% bonus
  return 0; // No bonus after 60 seconds
}

// Get initial game stats
export function getInitialGameStats(): GameStats {
  return {
    totalPoints: 0,
    level: 1,
    levelName: 'Rookie Trader',
    gamesPlayed: 0,
    correctAnswers: 0,
    averageTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPlayedDate: '',
    dailyHistory: [],
  };
}

// Load game stats from localStorage
export function loadGameStats(): GameStats {
  if (typeof window === 'undefined') return getInitialGameStats();
  
  const saved = localStorage.getItem('putcall-game-stats');
  if (!saved) return getInitialGameStats();
  
  try {
    return JSON.parse(saved);
  } catch {
    return getInitialGameStats();
  }
}

// Save game stats to localStorage
export function saveGameStats(stats: GameStats): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('putcall-game-stats', JSON.stringify(stats));
}

// Update stats after completing a game
export function updateStatsAfterGame(
  currentStats: GameStats,
  correct: boolean,
  timeTaken: number,
  pointsEarned: number
): GameStats {
  const today = getTodayDate();
  const wasConsecutiveDay = isConsecutiveDay(currentStats.lastPlayedDate, today);
  
  const newStreak = wasConsecutiveDay ? currentStats.currentStreak + 1 : 1;
  const newLongestStreak = Math.max(newStreak, currentStats.longestStreak);
  
  const newTotalPoints = currentStats.totalPoints + pointsEarned;
  const levelInfo = calculateLevel(newTotalPoints);
  
  const newHistory = [
    ...currentStats.dailyHistory,
    {
      date: today,
      points: pointsEarned,
      timeTaken,
      correct,
    },
  ];
  
  const totalTime = currentStats.averageTime * currentStats.gamesPlayed + timeTaken;
  const newGamesPlayed = currentStats.gamesPlayed + 1;
  
  return {
    totalPoints: newTotalPoints,
    level: levelInfo.level,
    levelName: levelInfo.levelName,
    gamesPlayed: newGamesPlayed,
    correctAnswers: currentStats.correctAnswers + (correct ? 1 : 0),
    averageTime: totalTime / newGamesPlayed,
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    lastPlayedDate: today,
    dailyHistory: newHistory,
  };
}

// Check if user already played today
export function hasPlayedToday(stats: GameStats): boolean {
  return stats.lastPlayedDate === getTodayDate();
}

// Check if two dates are consecutive days
function isConsecutiveDay(lastDate: string, currentDate: string): boolean {
  if (!lastDate) return false;
  
  const last = new Date(lastDate);
  const current = new Date(currentDate);
  const diffTime = current.getTime() - last.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1;
}

// Get mock leaderboard (replace with real API later)
export function getMockLeaderboard() {
  return [
    { rank: 1, username: 'TraderPro', points: 12500, level: 5, streak: 45 },
    { rank: 2, username: 'StockWizard', points: 8900, level: 4, streak: 30 },
    { rank: 3, username: 'BullRunner', points: 6700, level: 4, streak: 15 },
    { rank: 4, username: 'MarketMaven', points: 5200, level: 4, streak: 21 },
    { rank: 5, username: 'ChartMaster', points: 4100, level: 3, streak: 12 },
  ];
}
