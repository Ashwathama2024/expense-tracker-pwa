import { db } from "./db";
import type { Category } from "./categories";

export async function setBudget(category: Category, monthlyLimit: number) {
  if (monthlyLimit > 0) {
    await db.budgets.put({ category, monthlyLimit });
  } else {
    await db.budgets.delete(category);
  }
}

export async function getAllBudgets(): Promise<Record<Category, number>> {
  const rows = await db.budgets.toArray();
  const map = {} as Record<Category, number>;
  for (const row of rows) map[row.category] = row.monthlyLimit;
  return map;
}
