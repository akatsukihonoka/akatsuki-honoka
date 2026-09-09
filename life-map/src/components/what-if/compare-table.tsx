import type { CompareItem } from "@/types/life-map";
import { CompareLevelBadge } from "./compare-level-badge";

export function CompareTable({ items }: { items: CompareItem[] }) {
  return (
    <div className="flex flex-col divide-y divide-neutral-100 rounded-3xl border border-neutral-200 bg-white">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 p-4">
          <span className="text-sm font-medium text-neutral-700">{item.label}</span>
          <CompareLevelBadge level={item.level} />
        </div>
      ))}
    </div>
  );
}
