"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import type { RangeMode } from "@/lib/dashboard";

export function RangeSelector({
  mode,
  onModeChange,
  custom,
  onCustomChange,
}: {
  mode: RangeMode;
  onModeChange: (mode: RangeMode) => void;
  custom: { start: string; end: string };
  onCustomChange: (custom: { start: string; end: string }) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Tabs value={mode} onValueChange={(v) => onModeChange(v as RangeMode)}>
        <TabsList>
          <TabsTrigger value="this-month">This Month</TabsTrigger>
          <TabsTrigger value="last-month">Last Month</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
      </Tabs>
      {mode === "custom" && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={custom.start}
            onChange={(e) => onCustomChange({ ...custom, start: e.target.value })}
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="date"
            value={custom.end}
            onChange={(e) => onCustomChange({ ...custom, end: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
