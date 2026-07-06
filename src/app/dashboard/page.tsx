"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/insights/StatTile";
import { MonthlyTimelineBarChart } from "@/components/dashboard/MonthlyTimelineBarChart";
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
import { monthlyTotals } from "@/lib/insights";
import { todayISO } from "@/lib/utils";

export default function DashboardPage() {
  const expenses = useAllExpenses();
  const [mode, setMode] = useState<RangeMode>("this-month");
  const [custom, setCustom] = useState({ start: todayISO(), end: todayISO() });
  const [timelineOpen, setTimelineOpen] = useState(false);

  const range = useMemo(() => resolveRange(mode, custom), [mode, custom]);
  const scoped = useMemo(
    () => filterByRange(expenses ?? [], range),
    [expenses, range]
  );
  const totals = useMemo(() => categoryTotals(scoped), [scoped]);
  const daily = useMemo(() => dailyStacked(scoped, range), [scoped, range]);

  const thisMonthTotal = useMemo(() => {
    const thisMonthRange = resolveRange("this-month", { start: "", end: "" });
    return filterByRange(expenses ?? [], thisMonthRange).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);
  const monthlyTimeline = useMemo(() => monthlyTotals(expenses ?? [], 12), [expenses]);

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 pt-2">
      <StatTile
        label="This month"
        value={thisMonthTotal}
        sub={timelineOpen ? undefined : "Tap to see the monthly timeline"}
        tone="teal"
        expanded={timelineOpen}
        onToggle={() => setTimelineOpen((v) => !v)}
      />

      {timelineOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyTimelineBarChart data={monthlyTimeline} />
          </CardContent>
        </Card>
      )}

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
