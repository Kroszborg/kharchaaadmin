'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatINR } from '@/lib/api';

interface SpendBarProps {
  data: { name: string; total: number; count: number }[];
}

export function SpendBar({ data }: SpendBarProps) {
  if (!data.length) return null;

  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatINR(v, true)}
          />
          <Tooltip
            formatter={(value) => [formatINR(Number(value), true), 'Spent']}
            contentStyle={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              fontSize: 12,
            }}
            cursor={{ fill: 'var(--surface-highlight)' }}
          />
          <Bar dataKey="total" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
