"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { DayOfWeekPoint } from "@/lib/insights";
import { formatCurrency } from "@/lib/utils";

export function DayOfWeekChart({ data }: { data: DayOfWeekPoint[] }) {
  const hasData = data.some((d) => d.average > 0);

  if (!hasData) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No spending yet.
      </div>
    );
  }

  const maxAvg = Math.max(...data.map((d) => d.average), 1);
  const highestDay = data.reduce((a, b) => (b.average > a.average ? b : a));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 20, right: 8, bottom: 0, left: 8 }}>
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <YAxis hide domain={[0, maxAvg * 1.25]} />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const row = payload[0].payload as DayOfWeekPoint;
            return (
              <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
                <p className="font-medium text-foreground">{row.label}</p>
                <p className="tabular-nums text-muted-foreground">
                  {formatCurrency(row.average)} avg
                </p>
              </div>
            );
          }}
        />
        <Bar dataKey="average" radius={[4, 4, 0, 0]} maxBarSize={32} isAnimationActive={false}>
          {data.map((entry) => (
            <Cell
              key={entry.day}
              fill={entry.day === highestDay.day ? "var(--accent)" : "var(--muted)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
