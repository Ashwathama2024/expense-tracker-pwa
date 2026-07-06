"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, ListOrdered, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home", icon: Home, tone: "bg-tile-teal-bg text-tile-teal-fg" },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3, tone: "bg-tile-blue-bg text-tile-blue-fg" },
  { href: "/insights", label: "Insights", icon: TrendingUp, tone: "bg-tile-amber-bg text-tile-amber-fg" },
  { href: "/history", label: "History", icon: ListOrdered, tone: "bg-tile-violet-bg text-tile-violet-fg" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-md items-stretch justify-around gap-1 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5">
        {TABS.map(({ href, label, icon: Icon, tone }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                active ? tone : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
