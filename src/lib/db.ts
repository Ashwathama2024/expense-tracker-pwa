import Dexie, { type EntityTable } from "dexie";
import type { Category } from "./categories";

export interface Expense {
  id?: number;
  amount: number;
  category: Category;
  date: string; // ISO date string, e.g. "2026-07-04"
  note?: string;
  createdAt: number;
}

export interface Budget {
  category: Category; // primary key — one budget per category
  monthlyLimit: number;
}

export interface Goal {
  id?: number;
  name: string;
  targetAmount: number;
  targetDate?: string;
  savedAmount: number;
  createdAt: number;
}

const db = new Dexie("expense-tracker") as Dexie & {
  expenses: EntityTable<Expense, "id">;
  budgets: EntityTable<Budget, "category">;
  goals: EntityTable<Goal, "id">;
};

db.version(1).stores({
  expenses: "++id, amount, category, date, note, createdAt",
});

db.version(2).stores({
  expenses: "++id, amount, category, date, note, createdAt",
  budgets: "category",
});

db.version(3).stores({
  expenses: "++id, amount, category, date, note, createdAt",
  budgets: "category",
  goals: "++id, name, createdAt",
});

// If another tab/window still has this app open on an older schema version,
// IndexedDB blocks the upgrade transaction until that connection closes —
// by default that just hangs forever with no error. Surface it instead.
db.on("blocked", () => {
  console.warn(
    "expense-tracker: database open blocked by another open tab/window running an older version."
  );
});

/** Every db write on the hot paths (adding/importing expenses) goes through
 * this so a blocked/stuck connection fails loud with a fixable message
 * instead of leaving the UI stuck on a spinner indefinitely. */
export async function withDbTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "Couldn't reach the local database. Close this app in any other open tabs or windows, then reload and try again."
            )
          ),
        ms
      )
    ),
  ]);
}

export { db };
