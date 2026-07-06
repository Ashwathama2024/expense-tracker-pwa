"use client";

import { ChevronDown } from "lucide-react";

import { formatCurrency, cn } from "@/lib/utils";

export type StatTileTone = "teal" | "blue" | "amber" | "violet";

const TONE_CLASSES: Record<StatTileTone, string> = {
  teal: "bg-tile-teal-bg text-tile-teal-fg",
  blue: "bg-tile-blue-bg text-tile-blue-fg",
  amber: "bg-tile-amber-bg text-tile-amber-fg",
  violet: "bg-tile-violet-bg text-tile-violet-fg",
};

export function StatTile({
  label,
  value,
  sub,
  tone = "teal",
  expanded,
  onToggle,
}: {
  label: string;
  value: number;
  sub?: string;
  tone?: StatTileTone;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const Comp = onToggle ? "button" : "div";

  return (
    <Comp
      onClick={onToggle}
      className={cn(
        "flex flex-col rounded-lg p-4 text-left transition-transform active:scale-[0.98]",
        TONE_CLASSES[tone]
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <p className="text-xs font-medium opacity-80">{label}</p>
        {onToggle && (
          <ChevronDown
            className={cn("h-3.5 w-3.5 opacity-60 transition-transform", expanded && "rotate-180")}
          />
        )}
      </div>
      <p className="mt-1 text-xl font-semibold tabular-nums">{formatCurrency(value)}</p>
      {sub && <p className="mt-0.5 text-xs opacity-70">{sub}</p>}
    </Comp>
  );
}
