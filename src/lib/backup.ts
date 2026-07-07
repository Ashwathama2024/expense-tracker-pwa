import { db } from "./db";
import { CATEGORIES, type Category } from "./categories";

interface BackupFile {
  app: "expense-tracker-pwa";
  version: 1;
  exportedAt: string;
  expenses: Array<{
    amount: number;
    category: Category;
    date: string;
    note?: string;
    createdAt: number;
  }>;
  budgets: Array<{ category: Category; monthlyLimit: number }>;
}

export async function exportBackup() {
  const [expenses, budgets] = await Promise.all([
    db.expenses.toArray(),
    db.budgets.toArray(),
  ]);

  const backup: BackupFile = {
    app: "expense-tracker-pwa",
    version: 1,
    exportedAt: new Date().toISOString(),
    expenses: expenses.map(({ amount, category, date, note, createdAt }) => ({
      amount,
      category,
      date,
      note,
      createdAt,
    })),
    budgets: budgets.map(({ category, monthlyLimit }) => ({ category, monthlyLimit })),
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `expense-tracker-backup-${backup.exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  return { expenseCount: expenses.length, budgetCount: budgets.length };
}

function isValidBackup(data: unknown): data is BackupFile {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    d.app === "expense-tracker-pwa" &&
    Array.isArray(d.expenses) &&
    Array.isArray(d.budgets)
  );
}

export async function importBackup(file: File): Promise<{ expenseCount: number; budgetCount: number }> {
  const text = await file.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }

  if (!isValidBackup(data)) {
    throw new Error("That doesn't look like an Expense Tracker backup file.");
  }

  // Imported expenses are always added as new rows (ids stripped, Dexie
  // assigns fresh ones) rather than upserted by id — a backup taken on one
  // device could otherwise collide with unrelated rows on another.
  const validExpenses = data.expenses.filter(
    (e) =>
      typeof e.amount === "number" &&
      CATEGORIES.includes(e.category) &&
      typeof e.date === "string"
  );
  if (validExpenses.length > 0) {
    await db.expenses.bulkAdd(
      validExpenses.map((e) => ({
        amount: e.amount,
        category: e.category,
        date: e.date,
        note: e.note,
        createdAt: e.createdAt ?? Date.now(),
      }))
    );
  }

  const validBudgets = data.budgets.filter(
    (b) => CATEGORIES.includes(b.category) && typeof b.monthlyLimit === "number"
  );
  if (validBudgets.length > 0) {
    await db.budgets.bulkPut(validBudgets);
  }

  return { expenseCount: validExpenses.length, budgetCount: validBudgets.length };
}
