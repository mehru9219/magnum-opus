"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TrendChartProps {
  data: Array<{
    date: string;
    chatgpt: number;
    claude: number;
    perplexity: number;
    gemini: number;
  }>;
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="chatgpt"
          stroke="#10b981"
          strokeWidth={2}
          name="ChatGPT"
          dot={{ fill: '#10b981' }}
        />
        <Line
          type="monotone"
          dataKey="claude"
          stroke="#8b5cf6"
          strokeWidth={2}
          name="Claude"
          dot={{ fill: '#8b5cf6' }}
        />
        <Line
          type="monotone"
          dataKey="perplexity"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Perplexity"
          dot={{ fill: '#3b82f6' }}
        />
        <Line
          type="monotone"
          dataKey="gemini"
          stroke="#f59e0b"
          strokeWidth={2}
          name="Gemini"
          dot={{ fill: '#f59e0b' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
