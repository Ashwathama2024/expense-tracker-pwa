"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";

import { CATEGORIES, CATEGORY_META, categoryColor } from "@/lib/categories";
import { CategoryDot } from "@/components/CategorySelect";
import type { MonthlyCategoryRow } from "@/lib/insights";
import { formatCurrency } from "@/lib/utils";

export function CategoryTrendGrid({ data }: { data: MonthlyCategoryRow[] }) {
  const activeCategories = CATEGORIES.filter((cat) =>
    data.some((row) => (row[cat] ?? 0) > 0)
  );

  if (activeCategories.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        No spending yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {activeCategories.map((cat) => {
        const total = data.reduce((sum, row) => sum + (row[cat] ?? 0), 0);
        const color = categoryColor(cat);
        return (
          <div key={cat} className="rounded-lg border border-border p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <CategoryDot category={cat} size={7} />
              <p className="text-xs font-medium text-foreground">
                {CATEGORY_META[cat].label}
              </p>
            </div>
            <p className="mb-1 text-sm font-semibold tabular-nums text-foreground">
              {formatCurrency(total)}
            </p>
            <ResponsiveContainer width="100%" height={56}>
              <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <YAxis hide domain={[0, (max: number) => Math.max(max * 1.2, 1)]} />
                <Tooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload as MonthlyCategoryRow;
                    return (
                      <div className="rounded-md border border-border bg-card px-2 py-1 text-[11px] shadow-md">
                        <span className="text-muted-foreground">{row.label}: </span>
                        <span className="font-medium tabular-nums text-foreground">
                          {formatCurrency(row[cat] ?? 0)}
                        </span>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={cat}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}
