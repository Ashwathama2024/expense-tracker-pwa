"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { MonthlyPoint } from "@/lib/insights";
import { formatCurrency } from "@/lib/utils";

export function MonthlyTrendChart({ data }: { data: MonthlyPoint[] }) {
  const hasData = data.some((d) => d.total > 0);

  if (!hasData) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        No spending yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <YAxis hide domain={[0, (max: number) => max * 1.15]} />
        <Tooltip
          cursor={{ stroke: "var(--border)" }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
                <p className="font-medium text-foreground">{label}</p>
                <p className="tabular-nums text-muted-foreground">
                  {formatCurrency(payload[0].value as number)}
                </p>
              </div>
            );
          }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="var(--accent)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--accent)", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
