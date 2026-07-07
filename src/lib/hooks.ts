import { useLiveQuery } from "dexie-react-hooks";
import { useSyncExternalStore } from "react";
import { db } from "./db";
import { getAllBudgets } from "./budgets";

export function useAllExpenses() {
  return useLiveQuery(() => db.expenses.orderBy("date").reverse().toArray(), []);
}

export function useBudgets() {
  return useLiveQuery(() => getAllBudgets(), []);
}

function subscribeReducedMotion(callback: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

/** True when the OS asks for reduced motion — count-ups, chart grow-ins, and
 * list slide-ins should render at their final state instantly instead. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}
