import { Repeat } from "lucide-react";

import { CategoryDot } from "@/components/CategorySelect";
import { CATEGORY_META } from "@/lib/categories";
import type { RecurringGroup } from "@/lib/insights";
import { formatCurrency } from "@/lib/utils";

export function RecurringList({ groups }: { groups: RecurringGroup[] }) {
  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing repeating yet — once a note shows up in the same category
        across two or more months, it lands here.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => (
        <div
          key={group.key}
          className="flex items-center gap-3 rounded-lg border border-border p-3"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <CategoryDot category={group.category} size={6} />
              <p className="truncate text-sm font-medium text-foreground">{group.note}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {CATEGORY_META[group.category].label} · {group.months.length} of the last months
            </p>
          </div>
          <p className="shrink-0 tabular-nums text-sm font-semibold text-foreground">
            {formatCurrency(group.lastAmount)}
          </p>
        </div>
      ))}
    </div>
  );
}
