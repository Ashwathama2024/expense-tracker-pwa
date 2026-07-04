import { CATEGORIES, type Category } from "./categories";
import type { Expense } from "./db";

export type RangeMode = "this-month" | "last-month" | "custom";

export function resolveRange(
  mode: RangeMode,
  custom: { start: string; end: string }
): { start: string; end: string } {
  const now = new Date();
  if (mode === "this-month") {
    return {
      start: toISO(new Date(now.getFullYear(), now.getMonth(), 1)),
      end: toISO(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }
  if (mode === "last-month") {
    return {
      start: toISO(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      end: toISO(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
  }
  return custom;
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function filterByRange(
  expenses: Expense[],
  range: { start: string; end: string }
): Expense[] {
  return expenses.filter((e) => e.date >= range.start && e.date <= range.end);
}

export interface CategoryTotal {
  category: Category;
  total: number;
  pct: number;
}

export function categoryTotals(expenses: Expense[]): CategoryTotal[] {
  const sum = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totals = new Map<Category, number>();
  for (const cat of CATEGORIES) totals.set(cat, 0);
  for (const e of expenses) totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);

  return Array.from(totals.entries())
    .map(([category, total]) => ({
      category,
      total,
      pct: sum > 0 ? (total / sum) * 100 : 0,
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);
}

export type DailyStackedRow = { date: string } & Partial<Record<Category, number>>;

export function dailyStacked(
  expenses: Expense[],
  range: { start: string; end: string }
): DailyStackedRow[] {
  const days: DailyStackedRow[] = [];
  const [sy, sm, sd] = range.start.split("-").map(Number);
  const [ey, em, ed] = range.end.split("-").map(Number);
  const cursor = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  while (cursor <= end) {
    days.push({ date: toISO(cursor) });
    cursor.setDate(cursor.getDate() + 1);
  }

  const byDate = new Map<string, DailyStackedRow>(days.map((d) => [d.date, d]));
  for (const e of expenses) {
    const row = byDate.get(e.date);
    if (!row) continue;
    row[e.category] = (row[e.category] ?? 0) + e.amount;
  }
  return days;
}
