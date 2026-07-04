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

const db = new Dexie("expense-tracker") as Dexie & {
  expenses: EntityTable<Expense, "id">;
};

db.version(1).stores({
  expenses: "++id, amount, category, date, note, createdAt",
});

export { db };
