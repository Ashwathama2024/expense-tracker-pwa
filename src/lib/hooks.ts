import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import { getAllBudgets } from "./budgets";

export function useAllExpenses() {
  return useLiveQuery(() => db.expenses.orderBy("date").reverse().toArray(), []);
}

export function useBudgets() {
  return useLiveQuery(() => getAllBudgets(), []);
}
