"use client";

import { usePathname } from "next/navigation";
import { Wordmark } from "./Logo";

// Shown only on Home — the app's front door. The other tabs (Dashboard,
// Insights, History) are task-focused views where a repeated logo would
// just be clutter, so their header only carries the utility icons.
export function HomeBranding() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <Wordmark />;
}
