"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CategoryDot } from "@/components/CategorySelect";
import { AddExpenseSheet } from "@/components/home/AddExpenseSheet";
import { useAllExpenses } from "@/lib/hooks";
import { db, type Expense } from "@/lib/db";
import { CATEGORIES, CATEGORY_META, type Category } from "@/lib/categories";
import { cn, formatCurrency, formatDateShort } from "@/lib/utils";

type SortField = "date" | "amount" | "category";
type SortDir = "asc" | "desc";

export default function HistoryPage() {
  const expenses = useAllExpenses();
  const [categoryFilter, setCategoryFilter] = useState<Category | "ALL">("ALL");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const rows = useMemo(() => {
    let list = expenses ?? [];
    if (categoryFilter !== "ALL") {
      list = list.filter((e) => e.category === categoryFilter);
    }
    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = a.date.localeCompare(b.date);
      else if (sortField === "amount") cmp = a.amount - b.amount;
      else cmp = a.category.localeCompare(b.category);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [expenses, categoryFilter, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function sortIcon(field: SortField) {
    if (field !== sortField) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  }

  async function handleDelete(expense: Expense) {
    if (!expense.id) return;
    await db.expenses.delete(expense.id);
    toast("Expense deleted", {
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          db.expenses.add({
            amount: expense.amount,
            category: expense.category,
            date: expense.date,
            note: expense.note,
            createdAt: expense.createdAt,
          });
        },
      },
    });
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-2">
      <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as Category | "ALL")}>
        <SelectTrigger className="w-full">
          <SelectValue>
            {categoryFilter === "ALL" ? "All categories" : CATEGORY_META[categoryFilter].label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All categories</SelectItem>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              <span className="flex items-center gap-2">
                <CategoryDot category={cat} />
                {CATEGORY_META[cat].label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-sm font-medium text-foreground">No expenses found</p>
          <p className="text-sm text-muted-foreground">Try a different category filter.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  className="flex items-center gap-1"
                  onClick={() => toggleSort("date")}
                >
                  Date {sortIcon("date")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1"
                  onClick={() => toggleSort("category")}
                >
                  Category {sortIcon("category")}
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  className="ml-auto flex items-center gap-1"
                  onClick={() => toggleSort("amount")}
                >
                  Amount {sortIcon("amount")}
                </button>
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="text-muted-foreground">
                  {formatDateShort(expense.date)}
                </TableCell>
                <TableCell>
                  <button
                    className="flex items-center gap-1.5 text-left"
                    onClick={() => {
                      setEditing(expense);
                      setSheetOpen(true);
                    }}
                  >
                    <CategoryDot category={expense.category} size={7} />
                    <span className="flex flex-col">
                      <span className="text-foreground">{CATEGORY_META[expense.category].label}</span>
                      {expense.note && (
                        <span className="max-w-[120px] truncate text-xs text-muted-foreground">
                          {expense.note}
                        </span>
                      )}
                    </span>
                  </button>
                </TableCell>
                <TableCell className={cn("text-right tabular-nums font-medium text-foreground")}>
                  {formatCurrency(expense.amount)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditing(expense);
                        setSheetOpen(true);
                      }}
                      aria-label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-warning"
                      onClick={() => handleDelete(expense)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AddExpenseSheet open={sheetOpen} onOpenChange={setSheetOpen} editingExpense={editing} />
    </div>
  );
}
