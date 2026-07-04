"use client";

import { AnimatePresence, motion } from "framer-motion";

import { CATEGORY_META } from "@/lib/categories";
import { CategoryDot } from "@/components/CategorySelect";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import type { Expense } from "@/lib/db";

export function RecentExpenses({
  expenses,
  onEdit,
}: {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
}) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <span className="text-2xl">👋</span>
        </div>
        <p className="text-base font-medium text-foreground">No expenses yet</p>
        <p className="max-w-[240px] text-sm text-muted-foreground">
          Add your first one below to start tracking.
        </p>
      </div>
    );
  }

  const recent = expenses.slice(0, 5);

  return (
    <div className="flex flex-col gap-1 px-4">
      <p className="px-2 pb-2 text-sm font-medium text-muted-foreground">
        Recent expenses
      </p>
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {recent.map((expense) => {
            const meta = CATEGORY_META[expense.category];
            const Icon = meta.icon;
            return (
              <motion.button
                key={expense.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={() => onEdit(expense)}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted/50 active:scale-[0.99]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-[18px] w-[18px]" style={{ color: `var(${meta.colorVar})` }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <CategoryDot category={expense.category} size={6} />
                    <p className="truncate text-sm font-medium text-foreground">
                      {expense.note || meta.label}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDateShort(expense.date)}
                  </p>
                </div>
                <p className="shrink-0 tabular-nums font-semibold text-foreground">
                  {formatCurrency(expense.amount)}
                </p>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
