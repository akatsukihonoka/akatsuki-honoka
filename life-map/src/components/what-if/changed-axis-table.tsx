import type { ChangedAxis } from "@/lib/what-if-engine/types";
import { AXIS_META } from "./axis-meta";

function AxisBar({ value, className }: { value: number; className: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
      <div
        className={`h-full rounded-full transition-all duration-500 ${className}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

/** "今の未来 / 試した未来" を左右バーで一目比較 — 既存のChangedAxis（before/after/direction）をそのまま可視化するだけで、値の計算はしない。 */
export function ChangedAxisTable({ changes }: { changes: ChangedAxis[] }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-neutral-200 bg-white shadow-soft">
      <div className="grid grid-cols-[56px_1fr_18px_1fr] items-center gap-2 border-b border-neutral-100 px-4 py-2 text-[10px] font-bold text-neutral-600">
        <span />
        <span className="text-center">今の未来</span>
        <span />
        <span className="text-center">もしもの未来</span>
      </div>
      <div className="flex flex-col divide-y divide-neutral-100">
        {changes.map((change) => {
          const meta = AXIS_META[change.axis];
          const arrow = change.direction === "up" ? "↗" : change.direction === "down" ? "↘" : "→";
          const arrowClass =
            change.direction === "up"
              ? "text-emerald-600"
              : change.direction === "down"
                ? "text-rose-500"
                : "text-neutral-500";

          return (
            <div
              key={change.axis}
              className="grid grid-cols-[56px_1fr_18px_1fr] items-center gap-2 px-4 py-3"
            >
              <span className="flex flex-col items-center gap-0.5 text-center">
                <span aria-hidden className="text-base leading-none">
                  {meta.emoji}
                </span>
                <span className="text-[10px] font-bold text-neutral-600">{meta.label}</span>
              </span>
              <AxisBar value={change.before} className="bg-neutral-300" />
              <span className={`text-center text-base font-bold ${arrowClass}`} aria-hidden>
                {arrow}
              </span>
              <AxisBar value={change.after} className="bg-gradient-to-r from-orange-400 to-pink-400" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
