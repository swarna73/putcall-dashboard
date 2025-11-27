"use client";

import React, { useState, useEffect } from 'react';
import { 
  generateDailyChallenge, 
  getTodayDate, 
  loadGameStats, 
  saveGameStats,
  updateStatsAfterGame,
  hasPlayedToday,
  calculateLevel,
  calculateTimeBonus,
  calculateStreakBonus,
  getMockLeaderboard
} from '../utils/gameUtils';
import { GameStats, ScrambleChallenge, LEVELS, STREAK_BONUSES } from '../types';

const StockScramble: React.FC = () => {
  const [challenge, setChallenge] = useState<ScrambleChallenge | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [gameState, setGameState] = useState<'playing' | 'correct' | 'wrong' | 'already-played'>('playing');
  const [startTime, setStartTime] = useState<number>(0);
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Load game stats and today's challenge
    const loadedStats = loadGameStats();
    setStats(loadedStats);
    
    const todayChallenge = generateDailyChallenge(getTodayDate());
    setChallenge(todayChallenge);
    
    // Check if already played today
    if (hasPlayedToday(loadedStats)) {
      setGameState('already-played');
    } else {
      setStartTime(Date.now());
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge || !stats || gameState !== 'playing') return;

    const endTime = Date.now();
    const timeInSeconds = Math.floor((endTime - startTime) / 1000);
    setTimeTaken(timeInSeconds);

    const isCorrect = userAnswer.toUpperCase() === challenge.correctTicker;
    
    if (isCorrect) {
      // Calculate points
      const basePoints = challenge.pointsValue;
      const timeBonus = calculateTimeBonus(timeInSeconds, basePoints);
      const streakBonus = calculateStreakBonus(stats.currentStreak + 1);
      const totalPoints = basePoints + timeBonus + streakBonus;
      
      setPointsEarned(totalPoints);
      setGameState('correct');
      
      // Update stats
      const newStats = updateStatsAfterGame(stats, true, timeInSeconds, totalPoints);
      setStats(newStats);
      saveGameStats(newStats);
    } else {
      setGameState('wrong');
      
      // Update stats with 0 points
      const newStats = updateStatsAfterGame(stats, false, timeInSeconds, 0);
      setStats(newStats);
      saveGameStats(newStats);
    }
  };

  const resetForTomorrow = () => {
    setUserAnswer('');
    setShowHint(false);
    setGameState('already-played');
  };

  if (!challenge || !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const levelInfo = calculateLevel(stats.totalPoints);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-indigo-950/50 to-purple-950/50 rounded-xl p-6 border border-indigo-900/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">🎮 Stock Symbol Scramble</h2>
            <p className="text-sm text-slate-400">Daily Challenge • {getTodayDate()}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-400">{stats.totalPoints}</div>
            <div className="text-xs text-slate-500">Total Points</div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300 font-medium">Level {levelInfo.level}: {levelInfo.levelName}</span>
            <span className="text-slate-500">{levelInfo.pointsToNext > 0 ? `${levelInfo.pointsToNext} to next level` : 'MAX LEVEL!'}</span>
          </div>
          <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        {stats.currentStreak > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-orange-400">🔥</span>
            <span className="text-slate-300 font-medium">{stats.currentStreak} Day Streak</span>
            {stats.currentStreak >= 3 && (
              <span className="text-xs text-green-400 ml-2">
                +{calculateStreakBonus(stats.currentStreak)} pts bonus!
              </span>
            )}
          </div>
        )}
      </div>

      {/* Game Area */}
      {gameState === 'already-played' ? (
        <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800 text-center space-y-4">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-white">Challenge Complete!</h3>
          <p className="text-slate-400">
            You've already completed today's challenge.<br />
            Come back tomorrow for a new puzzle!
          </p>
          
          {/* Today's Performance */}
          <div className="mt-6 bg-slate-800/50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Today's Points:</span>
              <span className="text-white font-bold">
                {stats.dailyHistory[stats.dailyHistory.length - 1]?.points || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Time Taken:</span>
              <span className="text-white font-bold">
                {stats.dailyHistory[stats.dailyHistory.length - 1]?.timeTaken || 0}s
              </span>
            </div>
          </div>
        </div>
      ) : gameState === 'playing' ? (
        <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800 space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-block px-3 py-1 bg-indigo-950/50 rounded-full border border-indigo-900/50 text-xs text-indigo-300 uppercase font-bold">
              {challenge.difficulty} • {challenge.pointsValue} pts
            </div>
            
            <h3 className="text-lg text-slate-400">Unscramble the ticker symbol:</h3>
            
            <div className="text-6xl font-bold text-white tracking-widest font-mono">
              {challenge.scrambledTicker}
            </div>

            {showHint ? (
              <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-lg p-3 text-yellow-200 text-sm">
                💡 Hint: {challenge.hint}
              </div>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                className="text-sm text-slate-500 hover:text-slate-300 underline"
              >
                Need a hint?
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
              placeholder="Enter ticker symbol..."
              className="w-full bg-slate-800 border border-slate-700 text-white text-2xl font-mono font-bold text-center px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 uppercase"
              maxLength={6}
              autoFocus
            />

            <button
              type="submit"
              disabled={!userAnswer.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Submit Answer
            </button>
          </form>

          {/* Time Bonus Info */}
          <div className="text-xs text-slate-500 text-center space-y-1">
            <div>⚡ Speed Bonus:</div>
            <div>&lt;10s = +100% • &lt;30s = +50% • &lt;60s = +25%</div>
          </div>
        </div>
      ) : gameState === 'correct' ? (
        <div className="bg-green-950/30 rounded-xl p-8 border border-green-900/50 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-3xl font-bold text-green-400">Correct!</h3>
          <p className="text-xl text-white">
            {challenge.correctTicker} - {challenge.companyName}
          </p>

          {/* Points Breakdown */}
          <div className="bg-slate-900/50 rounded-lg p-4 space-y-2 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Base Points:</span>
              <span className="text-white font-bold">+{challenge.pointsValue}</span>
            </div>
            {calculateTimeBonus(timeTaken, challenge.pointsValue) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Time Bonus ({timeTaken}s):</span>
                <span className="text-yellow-400 font-bold">
                  +{calculateTimeBonus(timeTaken, challenge.pointsValue)}
                </span>
              </div>
            )}
            {calculateStreakBonus(stats.currentStreak) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Streak Bonus ({stats.currentStreak} days):</span>
                <span className="text-orange-400 font-bold">
                  +{calculateStreakBonus(stats.currentStreak)}
                </span>
              </div>
            )}
            <div className="border-t border-slate-700 pt-2 flex justify-between">
              <span className="text-slate-300 font-bold">Total Points Earned:</span>
              <span className="text-green-400 font-bold text-lg">+{pointsEarned}</span>
            </div>
          </div>

          <button
            onClick={resetForTomorrow}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            See You Tomorrow! 👋
          </button>
        </div>
      ) : (
        <div className="bg-red-950/30 rounded-xl p-8 border border-red-900/50 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-3xl font-bold text-red-400">Not Quite!</h3>
          <p className="text-xl text-white">
            The answer was: <span className="font-bold">{challenge.correctTicker}</span>
          </p>
          <p className="text-slate-400">{challenge.companyName}</p>

          <button
            onClick={resetForTomorrow}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Try Again Tomorrow 💪
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-center">
          <div className="text-2xl font-bold text-white">{stats.gamesPlayed}</div>
          <div className="text-xs text-slate-500">Games Played</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-center">
          <div className="text-2xl font-bold text-green-400">
            {stats.gamesPlayed > 0 ? Math.round((stats.correctAnswers / stats.gamesPlayed) * 100) : 0}%
          </div>
          <div className="text-xs text-slate-500">Accuracy</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-center">
          <div className="text-2xl font-bold text-orange-400">{stats.longestStreak}</div>
          <div className="text-xs text-slate-500">Best Streak</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-center">
          <div className="text-2xl font-bold text-indigo-400">
            {stats.gamesPlayed > 0 ? Math.round(stats.averageTime) : 0}s
          </div>
          <div className="text-xs text-slate-500">Avg Time</div>
        </div>
      </div>

      {/* Leaderboard Preview */}
      <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4">🏆 Top Players</h3>
        <div className="space-y-2">
          {getMockLeaderboard().map((entry) => (
            <div 
              key={entry.rank}
              className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-mono w-6">#{entry.rank}</span>
                <span className="text-white font-medium">{entry.username}</span>
                <span className="text-xs text-slate-500">Lvl {entry.level}</span>
              </div>
              <div className="flex items-center gap-3">
                {entry.streak >= 7 && <span className="text-orange-400">🔥{entry.streak}</span>}
                <span className="text-indigo-400 font-bold">{entry.points.toLocaleString()} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockScramble;
