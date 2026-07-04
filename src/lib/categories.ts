import {
  UtensilsCrossed,
  Car,
  Home,
  Zap,
  ShoppingBag,
  HeartPulse,
  Clapperboard,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

export const CATEGORIES = [
  "FOOD",
  "TRANSPORT",
  "RENT",
  "UTILITIES",
  "SHOPPING",
  "HEALTH",
  "ENTERTAINMENT",
  "MISC",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_META: Record<
  Category,
  { label: string; icon: LucideIcon; colorVar: string }
> = {
  FOOD: { label: "Food", icon: UtensilsCrossed, colorVar: "--cat-food" },
  TRANSPORT: { label: "Transport", icon: Car, colorVar: "--cat-transport" },
  RENT: { label: "Rent", icon: Home, colorVar: "--cat-rent" },
  UTILITIES: { label: "Utilities", icon: Zap, colorVar: "--cat-utilities" },
  SHOPPING: { label: "Shopping", icon: ShoppingBag, colorVar: "--cat-shopping" },
  HEALTH: { label: "Health", icon: HeartPulse, colorVar: "--cat-health" },
  ENTERTAINMENT: {
    label: "Entertainment",
    icon: Clapperboard,
    colorVar: "--cat-entertainment",
  },
  MISC: { label: "Misc", icon: MoreHorizontal, colorVar: "--cat-misc" },
};

export function categoryColor(category: Category): string {
  return `var(${CATEGORY_META[category].colorVar})`;
}
