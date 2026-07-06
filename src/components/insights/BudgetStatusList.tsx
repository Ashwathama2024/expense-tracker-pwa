import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { CategoryDot } from "@/components/CategorySelect";
import { formatCurrency, cn } from "@/lib/utils";
import type { Category } from "@/lib/categories";

export function BudgetStatusList({
  budgets,
  spentThisMonth,
}: {
  budgets: Record<Category, number>;
  spentThisMonth: Record<Category, number>;
}) {
  const rows = CATEGORIES.filter((cat) => budgets[cat] > 0);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No budgets set yet — tap &ldquo;Budgets&rdquo; to set a monthly limit per category.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((cat) => {
        const spent = spentThisMonth[cat] ?? 0;
        const limit = budgets[cat];
        const over = spent > limit;
        const pct = Math.min((spent / limit) * 100, 100);
        return (
          <div key={cat} className="rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <CategoryDot category={cat} size={7} />
                {CATEGORY_META[cat].label}
              </span>
              <span
                className={cn(
                  "flex items-center gap-1 text-xs font-medium tabular-nums",
                  over ? "text-warning" : "text-muted-foreground"
                )}
              >
                {over ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                {formatCurrency(spent)} / {formatCurrency(limit)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", over ? "bg-warning" : "bg-positive")}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
