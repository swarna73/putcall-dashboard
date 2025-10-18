'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ChartData {
  date: string;
  sentiment: number;
}

export default function SentimentChart({ data }: { data: ChartData[] }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  // Calculate dynamic domain based on actual data range
  const sentiments = data.map(d => d.sentiment);
  const minSentiment = Math.min(...sentiments);
  const maxSentiment = Math.max(...sentiments);
  const padding = (maxSentiment - minSentiment) * 0.3 || 0.2;
  const yMin = Math.max(-1, minSentiment - padding);
  const yMax = Math.min(1, maxSentiment + padding);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const sentiment = value > 0.3 ? 'Bullish' : value < -0.3 ? 'Bearish' : 'Neutral';
      const color = value > 0.3 ? '#10b981' : value < -0.3 ? '#ef4444' : '#f59e0b';
      
      return (
        <div className="bg-[#1a1d29] border border-[#2d3748] rounded-lg px-3 py-2 text-sm shadow-xl">
          <div className="text-[#8b95a5] text-xs mb-1">{formatDate(payload[0].payload.date)}</div>
          <div className="font-semibold" style={{ color }}>
            {sentiment}: {value >= 0 ? '+' : ''}{value.toFixed(2)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a9eff" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a9eff" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#4a9eff" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
          stroke="#2d3748"
          tick={{ fill: '#8b95a5', fontSize: 11 }}
          axisLine={{ stroke: '#2d3748' }}
        />
        <YAxis 
          domain={[yMin, yMax]}
          stroke="#2d3748"
          tick={{ fill: '#8b95a5', fontSize: 11 }}
          axisLine={{ stroke: '#2d3748' }}
          tickFormatter={(value) => value.toFixed(2)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4a9eff', strokeWidth: 1, strokeDasharray: '5 5' }} />
        <ReferenceLine y={0} stroke="#2d3748" strokeDasharray="3 3" strokeOpacity={0.5} />
        <Line 
          type="monotone" 
          dataKey="sentiment" 
          stroke="url(#lineGradient)"
          strokeWidth={3}
          dot={{ fill: '#4a9eff', r: 4, strokeWidth: 2, stroke: '#1a1d29' }}
          activeDot={{ r: 6, fill: '#4a9eff', stroke: '#e1e8ed', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
