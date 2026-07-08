import { db, withDbTimeout, type Expense } from "./db";

export async function addExpense(expense: Omit<Expense, "id" | "createdAt">) {
  return withDbTimeout(db.expenses.add({ ...expense, createdAt: Date.now() }));
}

export async function updateExpense(id: number, changes: Partial<Expense>) {
  return withDbTimeout(db.expenses.update(id, changes));
}

export async function deleteExpense(id: number) {
  return withDbTimeout(db.expenses.delete(id));
}

export function monthRange(date: Date): { start: string; end: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start: toISO(start), end: toISO(end) };
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
