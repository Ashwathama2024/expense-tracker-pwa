"use client";

import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategorySelect } from "@/components/CategorySelect";
import { addExpense, updateExpense } from "@/lib/expenses";
import { parseReceiptTransactions, type ParsedTransaction } from "@/lib/openai";
import { todayISO, cn } from "@/lib/utils";
import type { Category } from "@/lib/categories";
import type { Expense } from "@/lib/db";

interface AddExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingExpense?: Expense | null;
  /** Called with parsed transactions when a receipt/screenshot scan succeeds
   * (only offered when adding, not editing). The parent shows a review list
   * and does the actual saving — a scan can contain more than one expense. */
  onScanned?: (transactions: ParsedTransaction[]) => void;
}

const EMPTY_FORM = {
  amount: "",
  category: "FOOD" as Category,
  note: "",
  date: todayISO(),
};

export function AddExpenseSheet({
  open,
  onOpenChange,
  editingExpense,
  onScanned,
}: AddExpenseSheetProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect --
       Resets the form whenever the sheet opens for add vs. edit; the dialog
       stays mounted (Radix controls enter/exit animation via `open`), so this
       can't be replaced with a `key`-driven remount. */
    if (open) {
      setForm(
        editingExpense
          ? {
              amount: String(editingExpense.amount),
              category: editingExpense.category,
              note: editingExpense.note ?? "",
              date: editingExpense.date,
            }
          : EMPTY_FORM
      );
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, editingExpense]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setParsing(true);
    try {
      const transactions = await parseReceiptTransactions(file);
      if (transactions.length === 0) {
        toast.error("Couldn't find a transaction in that file.");
        return;
      }
      onScanned?.(transactions);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't read that file.");
    } finally {
      setParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    setSaving(true);
    try {
      if (editingExpense?.id) {
        await updateExpense(editingExpense.id, {
          amount,
          category: form.category,
          note: form.note.trim() || undefined,
          date: form.date,
        });
        toast.success("Expense updated");
      } else {
        await addExpense({
          amount,
          category: form.category,
          note: form.note.trim() || undefined,
          date: form.date,
        });
        toast.success("Expense added");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save that expense.");
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
            "fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border bg-card p-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom data-[state=closed]:duration-200 data-[state=open]:duration-300",
            "sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md sm:rounded-2xl sm:border"
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
              {editingExpense ? "Edit expense" : "Add expense"}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="rounded-sm opacity-60 transition-opacity hover:opacity-100">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="amount"
                    inputMode="decimal"
                    autoFocus
                    placeholder="0.00"
                    className="pl-7 text-lg font-semibold tabular-nums"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, amount: e.target.value.replace(/[^0-9.]/g, "") }))
                    }
                  />
                </div>
              </div>
              {!editingExpense && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="mb-0.5 h-11 w-11 shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={parsing}
                    aria-label="Scan receipt, screenshot, or PDF"
                  >
                    {parsing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                  </Button>
                </>
              )}
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <div className="mt-1.5">
                <CategorySelect
                  value={form.category}
                  onChange={(category) => setForm((p) => ({ ...p, category }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                className="mt-1.5"
                placeholder="e.g. Coffee with Sam"
                value={form.note}
                onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                className="mt-1.5"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>

            <Button type="submit" size="lg" className="mt-2" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editingExpense ? "Save changes" : "Add expense"}
            </Button>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
