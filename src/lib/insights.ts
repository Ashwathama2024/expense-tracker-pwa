import { CATEGORIES, type Category } from "./categories";
import type { Expense } from "./db";

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function monthKey(dateISO: string): string {
  return dateISO.slice(0, 7);
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short" });
}

export interface MonthlyPoint {
  month: string;
  label: string;
  total: number;
}

export function monthlyTotals(expenses: Expense[], monthsBack = 12): MonthlyPoint[] {
  const now = new Date();
  const months: MonthlyPoint[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({ month: key, label: monthLabel(key), total: 0 });
  }
  const byMonth = new Map(months.map((m) => [m.month, m]));
  for (const e of expenses) {
    const bucket = byMonth.get(monthKey(e.date));
    if (bucket) bucket.total += e.amount;
  }
  return months;
}

export type MonthlyCategoryRow = { month: string; label: string } & Partial<
  Record<Category, number>
>;

export function monthlyCategoryTotals(
  expenses: Expense[],
  monthsBack = 12
): MonthlyCategoryRow[] {
  const months = monthlyTotals(expenses, monthsBack);
  const rows: MonthlyCategoryRow[] = months.map((m) => ({
    month: m.month,
    label: m.label,
  }));
  const byMonth = new Map(rows.map((r) => [r.month, r]));
  for (const e of expenses) {
    const row = byMonth.get(monthKey(e.date));
    if (!row) continue;
    row[e.category] = (row[e.category] ?? 0) + e.amount;
  }
  return rows;
}

export interface CumulativeStats {
  ytdTotal: number;
  avgPerDay: number;
  avgPerMonth: number;
  topCategory: Category | null;
  topCategoryTotal: number;
  highestDay: { date: string; total: number } | null;
}

export function cumulativeStats(expenses: Expense[]): CumulativeStats {
  const now = new Date();
  const yearStart = `${now.getFullYear()}-01-01`;
  const today = toISO(now);

  const ytd = expenses.filter((e) => e.date >= yearStart && e.date <= today);
  const ytdTotal = ytd.reduce((sum, e) => sum + e.amount, 0);

  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86_400_000
  ) + 1;
  const monthsElapsed = now.getMonth() + 1;

  const categoryTotals = new Map<Category, number>();
  const dayTotals = new Map<string, number>();
  for (const e of ytd) {
    categoryTotals.set(e.category, (categoryTotals.get(e.category) ?? 0) + e.amount);
    dayTotals.set(e.date, (dayTotals.get(e.date) ?? 0) + e.amount);
  }

  let topCategory: Category | null = null;
  let topCategoryTotal = 0;
  for (const cat of CATEGORIES) {
    const total = categoryTotals.get(cat) ?? 0;
    if (total > topCategoryTotal) {
      topCategory = cat;
      topCategoryTotal = total;
    }
  }

  let highestDay: { date: string; total: number } | null = null;
  for (const [date, total] of dayTotals) {
    if (!highestDay || total > highestDay.total) highestDay = { date, total };
  }

  return {
    ytdTotal,
    avgPerDay: dayOfYear > 0 ? ytdTotal / dayOfYear : 0,
    avgPerMonth: monthsElapsed > 0 ? ytdTotal / monthsElapsed : 0,
    topCategory,
    topCategoryTotal,
    highestDay,
  };
}

export interface DayOfWeekPoint {
  day: number; // 0 = Sun … 6 = Sat
  label: string;
  total: number;
  occurrences: number;
  average: number;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // display Mon..Sun

/** Average spend per weekday over the trailing `daysBack` days (default ~13
 * weeks) — a fixed recent window so the pattern reflects current habits
 * rather than being diluted by however much history happens to exist. */
export function dayOfWeekTotals(expenses: Expense[], daysBack = 90): DayOfWeekPoint[] {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - (daysBack - 1));
  const startISO = toISO(start);
  const todayISOStr = toISO(now);

  const totals = new Array(7).fill(0);
  const occurrences = new Array(7).fill(0);

  const cursor = new Date(start);
  while (toISO(cursor) <= todayISOStr) {
    occurrences[cursor.getDay()] += 1;
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const e of expenses) {
    if (e.date < startISO || e.date > todayISOStr) continue;
    const [y, m, d] = e.date.split("-").map(Number);
    const dow = new Date(y, m - 1, d).getDay();
    totals[dow] += e.amount;
  }

  return WEEKDAY_ORDER.map((day) => ({
    day,
    label: WEEKDAY_LABELS[day],
    total: totals[day],
    occurrences: occurrences[day],
    average: occurrences[day] > 0 ? totals[day] / occurrences[day] : 0,
  }));
}
