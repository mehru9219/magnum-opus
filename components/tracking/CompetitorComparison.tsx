"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CompetitorComparisonProps {
  data: Array<{
    platform: string;
    yourBrand: number;
    competitor1?: number;
    competitor2?: number;
  }>;
}

export function CompetitorComparison({ data }: CompetitorComparisonProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="platform"
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
        <Bar dataKey="yourBrand" fill="#10b981" name="Your Brand" />
        <Bar dataKey="competitor1" fill="#94a3b8" name="Competitor 1" />
        <Bar dataKey="competitor2" fill="#64748b" name="Competitor 2" />
      </BarChart>
    </ResponsiveContainer>
  );
}
