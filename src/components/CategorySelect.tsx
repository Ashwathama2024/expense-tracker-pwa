"use client";

import { CATEGORIES, CATEGORY_META, categoryColor, type Category } from "@/lib/categories";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CategoryDot({ category, size = 10 }: { category: Category; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, backgroundColor: categoryColor(category) }}
    />
  );
}

export function CategorySelect({
  value,
  onChange,
}: {
  value: Category;
  onChange: (value: Category) => void;
}) {
  const Icon = CATEGORY_META[value].icon;

  return (
    <Select value={value} onValueChange={(v) => onChange(v as Category)}>
      <SelectTrigger>
        <SelectValue>
          <span className="flex items-center gap-2">
            <CategoryDot category={value} />
            <Icon className="h-4 w-4 text-muted-foreground" />
            {CATEGORY_META[value].label}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {CATEGORIES.map((cat) => {
          const CatIcon = CATEGORY_META[cat].icon;
          return (
            <SelectItem key={cat} value={cat}>
              <span className="flex items-center gap-2">
                <CategoryDot category={cat} />
                <CatIcon className="h-4 w-4 text-muted-foreground" />
                {CATEGORY_META[cat].label}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
