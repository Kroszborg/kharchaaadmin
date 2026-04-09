'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatINR } from '@/lib/api';

interface CategoryPieProps {
  data: { name: string; total: number; percentage: number; color: string }[];
}

export function CategoryPie({ data }: CategoryPieProps) {
  if (!data.length) return null;

  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="total"
            nameKey="name"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [formatINR(Number(value), true), 'Amount']}
            contentStyle={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
