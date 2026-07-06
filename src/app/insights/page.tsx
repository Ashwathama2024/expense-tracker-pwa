"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/insights/StatTile";
import { MonthlyTrendChart } from "@/components/insights/MonthlyTrendChart";
import { CategoryTrendGrid } from "@/components/insights/CategoryTrendGrid";
import { QuarterlyChart } from "@/components/insights/QuarterlyChart";
import { BudgetsDialog } from "@/components/insights/BudgetsDialog";
import { BudgetStatusList } from "@/components/insights/BudgetStatusList";
import { CategoryBarChart } from "@/components/dashboard/CategoryBarChart";
import { CategoryLegend } from "@/components/dashboard/CategoryLegend";
import { useAllExpenses, useBudgets } from "@/lib/hooks";
import { CATEGORIES, CATEGORY_META, type Category } from "@/lib/categories";
import {
  categoryTotals,
  filterByRange,
  resolveRange,
} from "@/lib/dashboard";
import {
  cumulativeStats,
  monthlyCategoryTotals,
  monthlyTotals,
  quarterlyTotals,
  quarterRange,
} from "@/lib/insights";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import type { Expense } from "@/lib/db";

const EMPTY_EXPENSES: Expense[] = [];
const EMPTY_BUDGETS = {} as Record<Category, number>;

export default function InsightsPage() {
  const expenses = useAllExpenses() ?? EMPTY_EXPENSES;
  const budgets = useBudgets() ?? EMPTY_BUDGETS;
  const [selectedQuarterKey, setSelectedQuarterKey] = useState<string | null>(null);

  const stats = useMemo(() => cumulativeStats(expenses), [expenses]);
  const monthly = useMemo(() => monthlyTotals(expenses, 12), [expenses]);
  const monthlyByCategory = useMemo(() => monthlyCategoryTotals(expenses, 12), [expenses]);
  const quarters = useMemo(() => quarterlyTotals(expenses, 4), [expenses]);

  const activeQuarterKey = selectedQuarterKey ?? quarters[quarters.length - 1]?.key ?? "";
  const activeQuarter = quarters.find((q) => q.key === activeQuarterKey) ?? quarters[quarters.length - 1];

  const quarterCategoryTotals = useMemo(() => {
    if (!activeQuarter) return [];
    const range = quarterRange(activeQuarter.year, activeQuarter.quarter);
    return categoryTotals(filterByRange(expenses, range));
  }, [expenses, activeQuarter]);

  const spentThisMonth = useMemo(() => {
    const range = resolveRange("this-month", { start: "", end: "" });
    const scoped = filterByRange(expenses, range);
    const map = {} as Record<Category, number>;
    for (const cat of CATEGORIES) map[cat] = 0;
    for (const e of scoped) map[e.category] += e.amount;
    return map;
  }, [expenses]);

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Year to date" value={stats.ytdTotal} />
        <StatTile label="Avg per month" value={stats.avgPerMonth} />
        <StatTile label="Avg per day" value={stats.avgPerDay} />
        <StatTile
          label="Highest day"
          value={stats.highestDay?.total ?? 0}
          sub={stats.highestDay ? formatDateShort(stats.highestDay.date) : undefined}
        />
      </div>

      {stats.topCategory && (
        <p className="text-sm text-muted-foreground">
          Top category this year:{" "}
          <span className="font-medium text-foreground">
            {CATEGORY_META[stats.topCategory].label} · {formatCurrency(stats.topCategoryTotal)}
          </span>
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Monthly spend (last 12 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyTrendChart data={monthly} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By category, over time</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryTrendGrid data={monthlyByCategory} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quarterly</CardTitle>
        </CardHeader>
        <CardContent>
          <QuarterlyChart
            data={quarters}
            selectedKey={activeQuarterKey}
            onSelect={setSelectedQuarterKey}
          />
          {activeQuarter && (
            <>
              <p className="mb-2 mt-4 text-sm font-medium text-foreground">
                {activeQuarter.label} by category
              </p>
              <CategoryBarChart data={quarterCategoryTotals} />
              <div className="mt-4">
                <CategoryLegend />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Budgets — this month</CardTitle>
          <BudgetsDialog budgets={budgets} />
        </CardHeader>
        <CardContent>
          <BudgetStatusList budgets={budgets} spentThisMonth={spentThisMonth} />
        </CardContent>
      </Card>
    </div>
  );
}
