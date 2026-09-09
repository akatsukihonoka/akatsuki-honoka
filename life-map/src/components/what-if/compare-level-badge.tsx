import { ArrowDown, ArrowUp, ChevronsDown, ChevronsUp, Minus } from "lucide-react";
import type { CompareLevel } from "@/types/life-map";
import { cn } from "@/lib/utils";

const levelConfig: Record<
  CompareLevel,
  { label: string; icon: typeof Minus; className: string }
> = {
  noChange: { label: "変化なし", icon: Minus, className: "bg-neutral-100 text-neutral-500" },
  slightIncrease: {
    label: "少し増える",
    icon: ArrowUp,
    className: "bg-emerald-50 text-emerald-600",
  },
  bigIncrease: {
    label: "大きく増える",
    icon: ChevronsUp,
    className: "bg-emerald-100 text-emerald-700",
  },
  slightDecrease: {
    label: "少し減る",
    icon: ArrowDown,
    className: "bg-amber-50 text-amber-600",
  },
  bigDecrease: {
    label: "大きく減る",
    icon: ChevronsDown,
    className: "bg-rose-50 text-rose-600",
  },
};

export function CompareLevelBadge({ level }: { level: CompareLevel }) {
  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium",
        config.className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
