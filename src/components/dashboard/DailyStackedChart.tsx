"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CATEGORIES, CATEGORY_META, categoryColor, type Category } from "@/lib/categories";
import type { DailyStackedRow } from "@/lib/dashboard";
import { formatCurrency, formatDateShort } from "@/lib/utils";

export function DailyStackedChart({ data }: { data: DailyStackedRow[] }) {
  const hasData = data.some((row) =>
    CATEGORIES.some((cat) => (row[cat] ?? 0) > 0)
  );

  if (!hasData) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No spending in this period yet.
      </div>
    );
  }

  const tickInterval = Math.max(0, Math.ceil(data.length / 7) - 1);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }} barCategoryGap={2}>
        <XAxis
          dataKey="date"
          tickFormatter={formatDateShort}
          axisLine={false}
          tickLine={false}
          interval={tickInterval}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <YAxis hide />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const rows = payload.filter((p) => (p.value as number) > 0);
            if (rows.length === 0) return null;
            const total = rows.reduce((s, p) => s + (p.value as number), 0);
            return (
              <div className="min-w-[160px] rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
                <p className="mb-1 font-medium text-foreground">{formatDateShort(label as string)}</p>
                {rows.map((p) => (
                  <div key={p.dataKey as string} className="flex items-center justify-between gap-3 py-0.5">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: categoryColor(p.dataKey as Category) }}
                      />
                      {CATEGORY_META[p.dataKey as keyof typeof CATEGORY_META].label}
                    </span>
                    <span className="tabular-nums font-medium text-foreground">
                      {formatCurrency(p.value as number)}
                    </span>
                  </div>
                ))}
                <div className="mt-1 flex items-center justify-between gap-3 border-t border-border pt-1">
                  <span className="text-muted-foreground">Total</span>
                  <span className="tabular-nums font-semibold text-foreground">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            );
          }}
        />
        {CATEGORIES.map((cat, i) => (
          <Bar
            key={cat}
            dataKey={cat}
            stackId="day"
            fill={categoryColor(cat)}
            stroke="var(--background)"
            strokeWidth={1}
            isAnimationActive
            animationDuration={300}
            animationBegin={i * 30}
            animationEasing="ease-out"
            maxBarSize={16}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
