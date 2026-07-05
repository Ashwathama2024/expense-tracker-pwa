"use client";

import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
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
import { getOpenAIKey, setOpenAIKey } from "@/lib/settings";

export function ApiKeySettings() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    // localStorage only exists client-side, so this can't be read during the
    // (server-prerendered) initial render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setValue(getOpenAIKey());
  }, [open]);

  function save() {
    setOpenAIKey(value);
    toast.success(value.trim() ? "API key saved" : "API key cleared");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="Receipt-scanning API key settings"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <KeyRound className="h-[18px] w-[18px]" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>OpenAI API key</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Used only for the receipt-scanning camera button on the add-expense
            form. Stored on this device only (localStorage) — never sent
            anywhere except directly to OpenAI when you scan a receipt.
          </p>
          <div>
            <Label htmlFor="openai-key">API key</Label>
            <Input
              id="openai-key"
              type="password"
              autoComplete="off"
              placeholder="sk-..."
              className="mt-1.5"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <Button onClick={save} size="lg">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
