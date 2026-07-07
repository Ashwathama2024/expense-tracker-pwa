"use client";

import { useState } from "react";
import { Plus, Trash2, Target } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGoals } from "@/lib/hooks";
import { createGoal, addToGoal, deleteGoal } from "@/lib/goals";
import { formatCurrency, formatDateShort, cn } from "@/lib/utils";
import type { Goal } from "@/lib/db";

function NewGoalDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    const targetAmount = parseFloat(amount);
    if (!name.trim() || !targetAmount || targetAmount <= 0) {
      toast.error("Give the goal a name and a target amount.");
      return;
    }
    setSaving(true);
    try {
      await createGoal({ name: name.trim(), targetAmount, targetDate: date || undefined });
      toast.success("Goal created");
      setName("");
      setAmount("");
      setDate("");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New savings goal</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div>
            <Label htmlFor="goal-name">Name</Label>
            <Input
              id="goal-name"
              className="mt-1.5"
              placeholder="e.g. New laptop"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="goal-amount">Target amount</Label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="goal-amount"
                inputMode="decimal"
                className="pl-7 tabular-nums"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="goal-date">Target date (optional)</Label>
            <Input
              id="goal-date"
              type="date"
              className="mt-1.5"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <Button onClick={save} size="lg" disabled={saving}>
            Create goal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddMoneyDialog({ goal }: { goal: Goal }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");

  async function save() {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    await addToGoal(goal.id!, value);
    toast.success(`Added ${formatCurrency(value)} to ${goal.name}`);
    setAmount("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Add money
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to &ldquo;{goal.name}&rdquo;</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              ₹
            </span>
            <Input
              autoFocus
              inputMode="decimal"
              className="pl-7 tabular-nums"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            />
          </div>
          <Button onClick={save} size="lg">
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GoalsCard() {
  const goals = useGoals() ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Money set aside manually — separate from your expense log.
        </p>
        <NewGoalDialog />
      </div>

      {goals.length === 0 ? (
        <p className="text-sm text-muted-foreground">No goals yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {goals.map((goal) => {
            const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
            const reached = goal.savedAmount >= goal.targetAmount;
            return (
              <div key={goal.id} className="rounded-lg border border-border p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tile-violet-bg text-tile-violet-fg">
                      <Target className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{goal.name}</p>
                      {goal.targetDate && (
                        <p className="text-xs text-muted-foreground">
                          By {formatDateShort(goal.targetDate)}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => goal.id && deleteGoal(goal.id)}
                    className="text-muted-foreground transition-colors hover:text-warning"
                    aria-label={`Delete ${goal.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className={cn("font-medium", reached ? "text-positive" : "text-foreground")}>
                    {formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}
                  </span>
                  <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                </div>
                <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", reached ? "bg-positive" : "bg-accent")}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <AddMoneyDialog goal={goal} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
