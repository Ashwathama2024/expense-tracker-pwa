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

export function quarterOfDate(dateISO: string): { year: number; quarter: number } {
  const [y, m] = dateISO.split("-").map(Number);
  return { year: y, quarter: Math.ceil(m / 3) };
}

function quarterKey(dateISO: string): string {
  const { year, quarter } = quarterOfDate(dateISO);
  return `${year}-Q${quarter}`;
}

export function quarterRange(year: number, quarter: number): { start: string; end: string } {
  const startMonth = (quarter - 1) * 3;
  return {
    start: toISO(new Date(year, startMonth, 1)),
    end: toISO(new Date(year, startMonth + 3, 0)),
  };
}

export interface QuarterPoint {
  key: string;
  label: string;
  year: number;
  quarter: number;
  total: number;
  start: string;
  end: string;
}

export function quarterlyTotals(expenses: Expense[], quartersBack = 4): QuarterPoint[] {
  const now = new Date();
  let quarter = Math.floor(now.getMonth() / 3) + 1;
  let year = now.getFullYear();

  const list: { year: number; quarter: number }[] = [];
  for (let i = 0; i < quartersBack; i++) {
    list.unshift({ year, quarter });
    quarter -= 1;
    if (quarter < 1) {
      quarter = 4;
      year -= 1;
    }
  }

  const points: QuarterPoint[] = list.map(({ year, quarter }) => ({
    key: `${year}-Q${quarter}`,
    label: `Q${quarter} '${String(year).slice(2)}`,
    year,
    quarter,
    total: 0,
    ...quarterRange(year, quarter),
  }));

  const byKey = new Map(points.map((p) => [p.key, p]));
  for (const e of expenses) {
    const bucket = byKey.get(quarterKey(e.date));
    if (bucket) bucket.total += e.amount;
  }
  return points;
}
