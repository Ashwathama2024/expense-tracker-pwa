"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { QuarterPoint } from "@/lib/insights";
import { formatCurrency } from "@/lib/utils";

export function QuarterlyChart({
  data,
  selectedKey,
  onSelect,
}: {
  data: QuarterPoint[];
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  const hasData = data.some((d) => d.total > 0);

  if (!hasData) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No spending yet.
      </div>
    );
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 24, right: 8, bottom: 0, left: 8 }}>
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <YAxis hide domain={[0, maxTotal * 1.25]} />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const row = payload[0].payload as QuarterPoint;
            return (
              <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
                <p className="font-medium text-foreground">{row.label}</p>
                <p className="tabular-nums text-muted-foreground">
                  {formatCurrency(row.total)}
                </p>
              </div>
            );
          }}
        />
        <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false}>
          {data.map((entry) => (
            <Cell
              key={entry.key}
              fill={entry.key === selectedKey ? "var(--accent)" : "var(--muted)"}
              className="cursor-pointer"
              onClick={() => onSelect(entry.key)}
            />
          ))}
          <LabelList
            dataKey="total"
            position="top"
            formatter={(v: unknown) => (typeof v === "number" ? formatCurrency(v) : "")}
            className="fill-muted-foreground text-xs"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
