"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/insights/StatTile";
import { MonthlyTrendChart } from "@/components/insights/MonthlyTrendChart";
import { CategoryTrendGrid } from "@/components/insights/CategoryTrendGrid";
import { DayOfWeekChart } from "@/components/insights/DayOfWeekChart";
import { BudgetsDialog } from "@/components/insights/BudgetsDialog";
import { BudgetStatusList } from "@/components/insights/BudgetStatusList";
import { RecurringList } from "@/components/insights/RecurringList";
import { GoalsCard } from "@/components/insights/GoalsCard";
import { CategoryBarChart } from "@/components/dashboard/CategoryBarChart";
import { CategoryLegend } from "@/components/dashboard/CategoryLegend";
import { useAllExpenses, useBudgets } from "@/lib/hooks";
import { CATEGORIES, CATEGORY_META, type Category } from "@/lib/categories";
import { categoryTotals, filterByRange, resolveRange } from "@/lib/dashboard";
import {
  cumulativeStats,
  dayOfWeekTotals,
  detectRecurring,
  monthlyCategoryTotals,
  monthlyTotals,
} from "@/lib/insights";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import type { Expense } from "@/lib/db";

const EMPTY_EXPENSES: Expense[] = [];
const EMPTY_BUDGETS = {} as Record<Category, number>;

export default function InsightsPage() {
  const expenses = useAllExpenses() ?? EMPTY_EXPENSES;
  const budgets = useBudgets() ?? EMPTY_BUDGETS;
  const [monthExpanded, setMonthExpanded] = useState(false);

  const stats = useMemo(() => cumulativeStats(expenses), [expenses]);
  const monthly = useMemo(() => monthlyTotals(expenses, 12), [expenses]);
  const monthlyByCategory = useMemo(() => monthlyCategoryTotals(expenses, 12), [expenses]);
  const weekdayPattern = useMemo(() => dayOfWeekTotals(expenses), [expenses]);
  const recurring = useMemo(() => detectRecurring(expenses), [expenses]);

  const thisMonthExpenses = useMemo(
    () => filterByRange(expenses, resolveRange("this-month", { start: "", end: "" })),
    [expenses]
  );
  const thisMonthTotal = useMemo(
    () => thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0),
    [thisMonthExpenses]
  );
  const thisMonthByCategory = useMemo(
    () => categoryTotals(thisMonthExpenses),
    [thisMonthExpenses]
  );

  const spentThisMonth = useMemo(() => {
    const map = {} as Record<Category, number>;
    for (const cat of CATEGORIES) map[cat] = 0;
    for (const e of thisMonthExpenses) map[e.category] += e.amount;
    return map;
  }, [thisMonthExpenses]);

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label="This month"
          value={thisMonthTotal}
          tone="teal"
          expanded={monthExpanded}
          onToggle={() => setMonthExpanded((v) => !v)}
        />
        <StatTile label="Avg per month" value={stats.avgPerMonth} tone="blue" />
        <StatTile label="Avg per day" value={stats.avgPerDay} tone="amber" />
        <StatTile
          label="Highest day"
          value={stats.highestDay?.total ?? 0}
          sub={stats.highestDay ? formatDateShort(stats.highestDay.date) : undefined}
          tone="violet"
        />
      </div>

      {monthExpanded && (
        <Card>
          <CardHeader>
            <CardTitle>This month by category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBarChart data={thisMonthByCategory} />
            <div className="mt-4">
              <CategoryLegend />
            </div>
          </CardContent>
        </Card>
      )}

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
          <CardTitle>Spending by day of week (last 90 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <DayOfWeekChart data={weekdayPattern} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recurring</CardTitle>
        </CardHeader>
        <CardContent>
          <RecurringList groups={recurring} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Savings goals</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalsCard />
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
