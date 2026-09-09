import type { ChangedAxis } from "@/lib/what-if-engine/types";
import { AXIS_META } from "./axis-meta";

export function ChangedAxisTable({ changes }: { changes: ChangedAxis[] }) {
  return (
    <div className="flex flex-col divide-y divide-neutral-100 rounded-3xl border border-neutral-200 bg-white">
      {changes.map((change) => {
        const meta = AXIS_META[change.axis];
        const arrow = change.direction === "up" ? "↗" : change.direction === "down" ? "↘" : "→";
        const phrase =
          change.direction === "up"
            ? meta.up
            : change.direction === "down"
              ? meta.down
              : "大きな変化なし";

        return (
          <div key={change.axis} className="flex items-center justify-between gap-3 p-4">
            <span className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              <span aria-hidden>{meta.emoji}</span>
              {meta.label}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-neutral-700">
              <span aria-hidden>{arrow}</span>
              {phrase}
            </span>
          </div>
        );
      })}
    </div>
  );
}
