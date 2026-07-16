'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

export function BalanceChart({ data }: { data: { name: string; value: number; color?: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={90}
          stroke="transparent"
          paddingAngle={2}
        >
          {data.map((_, idx) => (
            <Cell key={idx} fill={data[idx].color || COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: any) => (Number(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
