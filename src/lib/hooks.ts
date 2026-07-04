import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";

export function useAllExpenses() {
  return useLiveQuery(() => db.expenses.orderBy("date").reverse().toArray(), []);
}
