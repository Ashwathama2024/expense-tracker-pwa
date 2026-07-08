"use client";

import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategorySelect } from "@/components/CategorySelect";
import { addExpense } from "@/lib/expenses";
import { todayISO, cn } from "@/lib/utils";
import type { Category } from "@/lib/categories";
import type { ParsedTransaction } from "@/lib/openai";

interface ReviewRow {
  key: number;
  amount: string;
  category: Category;
  date: string;
  note: string;
}

let rowKeySeq = 0;

function toRows(transactions: ParsedTransaction[]): ReviewRow[] {
  const today = todayISO();
  return transactions.map((t) => ({
    key: rowKeySeq++,
    amount: t.amount != null ? String(t.amount) : "",
    category: t.category ?? "MISC",
    date: t.date ?? today,
    note: t.note ?? "",
  }));
}

export function ReceiptReviewSheet({
  open,
  onOpenChange,
  transactions,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: ParsedTransaction[];
  onSaved: () => void;
}) {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Seeds editable rows from the freshly parsed scan each time the sheet
    // opens with a new batch — can't be derived during render since it's
    // one-shot state the user then edits.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setRows(toRows(transactions));
  }, [open, transactions]);

  function updateRow(key: number, changes: Partial<ReviewRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...changes } : r)));
  }

  function removeRow(key: number) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  async function saveAll() {
    const valid = rows.filter((r) => parseFloat(r.amount) > 0);
    if (valid.length === 0) {
      toast.error("Enter at least one valid amount.");
      return;
    }
    setSaving(true);
    try {
      for (const row of valid) {
        await addExpense({
          amount: parseFloat(row.amount),
          category: row.category,
          date: row.date,
          note: row.note.trim() || undefined,
        });
      }
      toast.success(
        valid.length === 1 ? "Expense added" : `${valid.length} expenses added`
      );
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save these expenses.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-border bg-card p-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom data-[state=closed]:duration-200 data-[state=open]:duration-300",
            "sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md sm:rounded-2xl sm:border"
          )}
        >
          <div className="mb-4 flex shrink-0 items-center justify-between">
            <div>
              <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
                Review scanned expenses
              </DialogPrimitive.Title>
              <p className="text-sm text-muted-foreground">
                Check each one before saving — nothing is saved automatically.
              </p>
            </div>
            <DialogPrimitive.Close className="shrink-0 rounded-sm opacity-60 transition-opacity hover:opacity-100">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No transactions found in that image.
            </p>
          ) : (
            <div className="flex flex-col gap-4 overflow-y-auto">
              {rows.map((row, i) => (
                <div key={row.key} className="rounded-lg border border-border p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Transaction {i + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      className="text-muted-foreground transition-colors hover:text-warning"
                      aria-label="Remove this transaction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`amount-${row.key}`}>Amount</Label>
                        <div className="relative mt-1.5">
                          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                            ₹
                          </span>
                          <Input
                            id={`amount-${row.key}`}
                            inputMode="decimal"
                            className="pl-7 tabular-nums"
                            value={row.amount}
                            onChange={(e) =>
                              updateRow(row.key, {
                                amount: e.target.value.replace(/[^0-9.]/g, ""),
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`date-${row.key}`}>Date</Label>
                        <Input
                          id={`date-${row.key}`}
                          type="date"
                          className="mt-1.5"
                          value={row.date}
                          onChange={(e) => updateRow(row.key, { date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`category-${row.key}`}>Category</Label>
                      <div className="mt-1.5">
                        <CategorySelect
                          value={row.category}
                          onChange={(category) => updateRow(row.key, { category })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`note-${row.key}`}>Note</Label>
                      <Input
                        id={`note-${row.key}`}
                        className="mt-1.5"
                        placeholder="Merchant / description"
                        value={row.note}
                        onChange={(e) => updateRow(row.key, { note: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            size="lg"
            className="mt-4 shrink-0"
            disabled={saving || rows.length === 0}
            onClick={saveAll}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {rows.length > 1 ? `Save ${rows.length} expenses` : "Save expense"}
          </Button>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
