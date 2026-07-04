"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RangeSelector } from "@/components/dashboard/RangeSelector";
import { CategoryBarChart } from "@/components/dashboard/CategoryBarChart";
import { DailyStackedChart } from "@/components/dashboard/DailyStackedChart";
import { CategoryLegend } from "@/components/dashboard/CategoryLegend";
import { useAllExpenses } from "@/lib/hooks";
import {
  categoryTotals,
  dailyStacked,
  filterByRange,
  resolveRange,
  type RangeMode,
} from "@/lib/dashboard";
import { todayISO } from "@/lib/utils";

export default function DashboardPage() {
  const expenses = useAllExpenses();
  const [mode, setMode] = useState<RangeMode>("this-month");
  const [custom, setCustom] = useState({ start: todayISO(), end: todayISO() });

  const range = useMemo(() => resolveRange(mode, custom), [mode, custom]);
  const scoped = useMemo(
    () => filterByRange(expenses ?? [], range),
    [expenses, range]
  );
  const totals = useMemo(() => categoryTotals(scoped), [scoped]);
  const daily = useMemo(() => dailyStacked(scoped, range), [scoped, range]);

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 pt-2">
      <RangeSelector
        mode={mode}
        onModeChange={setMode}
        custom={custom}
        onCustomChange={setCustom}
      />

      <Card>
        <CardHeader>
          <CardTitle>Spend by category</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryBarChart data={totals} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily spend</CardTitle>
        </CardHeader>
        <CardContent>
          <DailyStackedChart data={daily} />
          <div className="mt-4">
            <CategoryLegend />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
