"use client";

import { useRef, useState } from "react";
import { DatabaseBackup, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { exportBackup, importBackup } from "@/lib/backup";

export function BackupSettings() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    setBusy(true);
    try {
      const { expenseCount, budgetCount } = await exportBackup();
      toast.success(`Exported ${expenseCount} expenses, ${budgetCount} budgets`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't export a backup.");
    } finally {
      setBusy(false);
    }
  }

  async function handleImportFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const { expenseCount, budgetCount } = await importBackup(file);
      toast.success(`Imported ${expenseCount} expenses, ${budgetCount} budgets`);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't import that backup.");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="Backup and restore"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <DatabaseBackup className="h-[18px] w-[18px]" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Backup &amp; restore</DialogTitle>
        </DialogHeader>
        <p className="mb-4 text-sm text-muted-foreground">
          Everything lives only on this device. Export a backup now and then,
          and keep the file somewhere safe (email it to yourself, save it to
          Drive) — losing the phone without one means losing the history.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={handleExport} size="lg" disabled={busy} className="gap-2">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Export backup (.json)
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="lg"
            disabled={busy}
          >
            Import backup
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => handleImportFile(e.target.files?.[0])}
          />
          <p className="text-xs text-muted-foreground">
            Importing adds expenses to what&apos;s already here — it never
            deletes or overwrites existing entries.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
