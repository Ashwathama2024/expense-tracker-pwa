import { CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { CategoryDot } from "@/components/CategorySelect";

export function CategoryLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 px-1">
      {CATEGORIES.map((cat) => (
        <div key={cat} className="flex items-center gap-1.5">
          <CategoryDot category={cat} size={8} />
          <span className="text-xs text-muted-foreground">{CATEGORY_META[cat].label}</span>
        </div>
      ))}
    </div>
  );
}
