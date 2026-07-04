"use client";

import { useMemo } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { AnimatedNumber } from "@/components/AnimatedNumber";
import { useAllExpenses } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function RunningTotal() {
  const expenses = useAllExpenses();

  const { thisMonthTotal, deltaPct } = useMemo(() => {
    if (!expenses) return { thisMonthTotal: 0, deltaPct: null as number | null };

    const now = new Date();
    const thisKey = `${now.getFullYear()}-${now.getMonth()}`;
    const lastDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastKey = `${lastDate.getFullYear()}-${lastDate.getMonth()}`;

    let thisTotal = 0;
    let lastTotal = 0;
    for (const e of expenses) {
      const [y, m] = e.date.split("-").map(Number);
      const key = `${y}-${m - 1}`;
      if (key === thisKey) thisTotal += e.amount;
      else if (key === lastKey) lastTotal += e.amount;
    }

    const delta = lastTotal > 0 ? ((thisTotal - lastTotal) / lastTotal) * 100 : null;
    return { thisMonthTotal: thisTotal, deltaPct: delta };
  }, [expenses]);

  const isDown = (deltaPct ?? 0) <= 0;

  return (
    <div className="flex flex-col items-center gap-2 px-6 pb-2 pt-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">This Month</p>
      <AnimatedNumber
        value={thisMonthTotal}
        className="text-5xl font-bold tabular-nums tracking-tight text-foreground"
      />
      {deltaPct !== null && (
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
            isDown ? "bg-positive/10 text-positive" : "bg-warning/10 text-warning"
          )}
        >
          {isDown ? (
            <TrendingDown className="h-3.5 w-3.5" />
          ) : (
            <TrendingUp className="h-3.5 w-3.5" />
          )}
          {Math.abs(deltaPct).toFixed(0)}% vs last month
        </div>
      )}
    </div>
  );
}
