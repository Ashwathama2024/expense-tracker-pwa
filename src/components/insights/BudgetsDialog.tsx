"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoryDot } from "@/components/CategorySelect";
import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { setBudget } from "@/lib/budgets";
import type { Category } from "@/lib/categories";

export function BudgetsDialog({ budgets }: { budgets: Record<Category, number> }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect --
       Seeds the form from the current saved budgets each time the dialog
       opens — one-shot state the user then edits, can't be derived at render. */
    if (open) {
      const next: Record<string, string> = {};
      for (const cat of CATEGORIES) next[cat] = budgets[cat] ? String(budgets[cat]) : "";
      setValues(next);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, budgets]);

  async function save() {
    setSaving(true);
    try {
      for (const cat of CATEGORIES) {
        const raw = values[cat] ?? "";
        await setBudget(cat, raw.trim() ? parseFloat(raw) : 0);
      }
      toast.success("Budgets saved");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Budgets
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Monthly budgets</DialogTitle>
        </DialogHeader>
        <p className="mb-3 text-sm text-muted-foreground">
          Set a monthly ₹ limit per category. Leave blank for no limit.
        </p>
        <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto pr-1">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center gap-3">
              <Label htmlFor={`budget-${cat}`} className="flex w-32 shrink-0 items-center gap-1.5">
                <CategoryDot category={cat} size={7} />
                {CATEGORY_META[cat].label}
              </Label>
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₹
                </span>
                <Input
                  id={`budget-${cat}`}
                  inputMode="decimal"
                  placeholder="No limit"
                  className="pl-7 tabular-nums"
                  value={values[cat] ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [cat]: e.target.value.replace(/[^0-9.]/g, ""),
                    }))
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <Button onClick={save} size="lg" className="mt-4" disabled={saving}>
          Save budgets
        </Button>
      </DialogContent>
    </Dialog>
  );
}
