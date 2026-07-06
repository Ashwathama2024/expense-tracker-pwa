"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { RunningTotal } from "@/components/home/RunningTotal";
import { RecentExpenses } from "@/components/home/RecentExpenses";
import { AddExpenseSheet } from "@/components/home/AddExpenseSheet";
import { ReceiptReviewSheet } from "@/components/home/ReceiptReviewSheet";
import { useAllExpenses } from "@/lib/hooks";
import { consumeSharedFile } from "@/lib/shareTarget";
import { parseReceiptTransactions } from "@/lib/openai";
import type { Expense } from "@/lib/db";
import type { ParsedTransaction } from "@/lib/openai";

export default function HomePage() {
  const expenses = useAllExpenses();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [scanned, setScanned] = useState<ParsedTransaction[]>([]);
  const [handlingShare, setHandlingShare] = useState(false);

  useEffect(() => {
    if (!window.location.search.includes("shared=1")) return;
    window.history.replaceState(null, "", window.location.pathname);

    (async () => {
      const file = await consumeSharedFile();
      if (!file) return;
      setHandlingShare(true);
      try {
        const transactions = await parseReceiptTransactions(file);
        if (transactions.length === 0) {
          toast.error("Couldn't find a transaction in that image.");
          return;
        }
        setScanned(transactions);
        setReviewOpen(true);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't read the shared file.");
      } finally {
        setHandlingShare(false);
      }
    })();
  }, []);

  function openAdd() {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setSheetOpen(true);
  }

  function handleScanned(transactions: ParsedTransaction[]) {
    setScanned(transactions);
    setReviewOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col">
      <RunningTotal />

      {handlingShare && (
        <p className="px-6 pb-2 text-center text-sm text-muted-foreground">
          Reading shared image…
        </p>
      )}

      <div className="mt-8 flex-1">
        <RecentExpenses expenses={expenses ?? []} onEdit={openEdit} />
      </div>

      <Button
        size="icon"
        className="fixed bottom-24 right-5 z-30 h-14 w-14 rounded-full shadow-lg"
        onClick={openAdd}
        aria-label="Add expense"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddExpenseSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editingExpense={editing}
        onScanned={handleScanned}
      />

      <ReceiptReviewSheet
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        transactions={scanned}
        onSaved={() => setScanned([])}
      />
    </div>
  );
}
