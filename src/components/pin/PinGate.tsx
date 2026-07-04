"use client";

import { useEffect, useState } from "react";
import { Delete } from "lucide-react";

import { cn } from "@/lib/utils";

const PIN_KEY = "expense-tracker-pin";
const UNLOCKED_KEY = "expense-tracker-unlocked";
const PIN_LENGTH = 4;

type Mode = "loading" | "unlocked" | "create" | "confirm" | "unlock";

export function PinGate({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("loading");
  const [entry, setEntry] = useState("");
  const [firstEntry, setFirstEntry] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect --
       localStorage/sessionStorage only exist client-side, so the initial
       mode can't be computed during the (server-prerendered) first render. */
    const storedPin = localStorage.getItem(PIN_KEY);
    const unlocked = sessionStorage.getItem(UNLOCKED_KEY) === "1";
    if (unlocked) {
      setMode("unlocked");
    } else if (storedPin) {
      setMode("unlock");
    } else {
      setMode("create");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function pressDigit(d: string) {
    setError(false);
    setEntry((prev) => {
      const next = prev.length < PIN_LENGTH ? prev + d : prev;
      if (next.length === PIN_LENGTH) {
        setTimeout(() => handleComplete(next), 120);
      }
      return next;
    });
  }

  function backspace() {
    setError(false);
    setEntry((prev) => prev.slice(0, -1));
  }

  function handleComplete(value: string) {
    if (mode === "create") {
      setFirstEntry(value);
      setEntry("");
      setMode("confirm");
      return;
    }
    if (mode === "confirm") {
      if (value === firstEntry) {
        localStorage.setItem(PIN_KEY, value);
        sessionStorage.setItem(UNLOCKED_KEY, "1");
        setMode("unlocked");
      } else {
        setError(true);
        setEntry("");
        setFirstEntry("");
        setMode("create");
      }
      return;
    }
    if (mode === "unlock") {
      const storedPin = localStorage.getItem(PIN_KEY);
      if (value === storedPin) {
        sessionStorage.setItem(UNLOCKED_KEY, "1");
        setMode("unlocked");
      } else {
        setError(true);
        setEntry("");
      }
    }
  }

  if (mode === "loading") {
    return null;
  }

  if (mode === "unlocked") {
    return <>{children}</>;
  }

  const heading =
    mode === "create"
      ? "Set a PIN"
      : mode === "confirm"
        ? "Confirm your PIN"
        : "Enter your PIN";

  const subheading =
    mode === "create"
      ? "Choose a 4-digit PIN to lock this app."
      : mode === "confirm"
        ? "Enter it again to confirm."
        : "This device is locked.";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background px-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-xl font-semibold text-foreground">{heading}</h1>
        <p className="text-sm text-muted-foreground">
          {error ? "PINs didn't match — try again." : subheading}
        </p>
      </div>

      <div className="flex gap-4">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-3.5 w-3.5 rounded-full border-2 border-accent transition-colors",
              i < entry.length ? "bg-accent" : "bg-transparent",
              error && "border-warning"
            )}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            onClick={() => pressDigit(d)}
            className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-medium text-foreground transition-[colors,transform] duration-150 active:scale-[0.97] hover:bg-muted"
          >
            {d}
          </button>
        ))}
        <div />
        <button
          onClick={() => pressDigit("0")}
          className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-medium text-foreground transition-[colors,transform] duration-150 active:scale-[0.97] hover:bg-muted"
        >
          0
        </button>
        <button
          onClick={backspace}
          className="flex h-16 w-16 items-center justify-center rounded-full text-foreground transition-[colors,transform] duration-150 active:scale-[0.97] hover:bg-muted"
          aria-label="Backspace"
        >
          <Delete className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
