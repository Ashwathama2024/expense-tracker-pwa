"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RunningTotal } from "@/components/home/RunningTotal";
import { RecentExpenses } from "@/components/home/RecentExpenses";
import { AddExpenseSheet } from "@/components/home/AddExpenseSheet";
import { ReceiptReviewSheet } from "@/components/home/ReceiptReviewSheet";
import { useAllExpenses } from "@/lib/hooks";
import type { Expense } from "@/lib/db";
import type { ParsedTransaction } from "@/lib/openai";

export default function HomePage() {
  const expenses = useAllExpenses();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [scanned, setScanned] = useState<ParsedTransaction[]>([]);

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
