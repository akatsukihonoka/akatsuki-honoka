import { X } from "lucide-react";
import { LIFE_EVENTS_BY_ID } from "@/data/life-events";

export function ChainTimeline({
  eventIds,
  onRemove,
}: {
  eventIds: string[];
  onRemove: (eventId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white p-5">
      <p className="text-sm font-semibold text-neutral-800">あなたが試している未来</p>
      <div className="flex flex-col items-start gap-1.5">
        <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
          現在
        </span>
        {eventIds.map((id) => {
          const label = LIFE_EVENTS_BY_ID[id]?.name ?? id;
          return (
            <div key={id} className="flex flex-col items-start gap-1.5">
              <span aria-hidden className="pl-3 text-neutral-300">
                ↓
              </span>
              <button
                type="button"
                onClick={() => onRemove(id)}
                aria-label={`${label}を取り除く`}
                className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-100"
              >
                {label}
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
