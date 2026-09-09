import { cn } from "@/lib/utils";

export function ScoreBar({
  label,
  value,
  barClassName,
}: {
  label: string;
  value: number;
  barClassName: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs text-neutral-600">
        <span>{label}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className={cn("h-full rounded-full", barClassName)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
