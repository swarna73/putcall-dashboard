'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface ChartData {
  date: string;
  sentiment: number;
}

export default function SentimentChart({ data }: { data: ChartData[] }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'MMM dd');
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const sentiment = value > 0.3 ? 'Bullish' : value < -0.3 ? 'Bearish' : 'Neutral';
      const color = value > 0.3 ? '#10b981' : value < -0.3 ? '#ef4444' : '#6b7280';
      
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm">
          <div className="text-gray-400">{formatDate(payload[0].payload.date)}</div>
          <div className="font-semibold" style={{ color }}>
            {sentiment}: {value.toFixed(2)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
          stroke="#4b5563"
          tick={{ fill: '#9ca3af', fontSize: 11 }}
        />
        <YAxis 
          domain={[-1, 1]}
          stroke="#4b5563"
          tick={{ fill: '#9ca3af', fontSize: 11 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="3 3" />
        <ReferenceLine y={0.3} stroke="#10b981" strokeDasharray="2 2" strokeOpacity={0.3} />
        <ReferenceLine y={-0.3} stroke="#ef4444" strokeDasharray="2 2" strokeOpacity={0.3} />
        <Line 
          type="monotone" 
          dataKey="sentiment" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
