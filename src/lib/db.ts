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

export { db };
