import StockScramble from '@/components/StockScramble';

export const metadata = {
  title: 'Stock Symbol Scramble - Daily Challenge | PutCall.nl',
  description: 'Test your stock market knowledge! Unscramble ticker symbols in our daily challenge game. Earn points, build streaks, and climb the leaderboard.',
};

export default function GamePage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 py-12">
      <StockScramble />
    </div>
  );
}
