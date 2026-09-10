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
    <div className="flex flex-col gap-3 rounded-[28px] border border-orange-100 bg-white p-5 shadow-soft">
      <p className="font-heading text-sm font-bold text-neutral-800">🧪 あなたが試している未来</p>
      <div className="flex flex-col items-start gap-1.5">
        <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-600">
          📍 現在
        </span>
        {eventIds.map((id) => {
          const label = LIFE_EVENTS_BY_ID[id]?.name ?? id;
          return (
            <div key={id} className="flex flex-col items-start gap-1.5">
              <span aria-hidden className="pl-3 text-orange-300">
                ↓
              </span>
              <button
                type="button"
                onClick={() => onRemove(id)}
                aria-label={`${label}を取り除く`}
                className="tap-bounce flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-100 to-pink-100 px-3 py-1.5 text-xs font-bold text-orange-700 transition-colors hover:from-orange-200 hover:to-pink-200"
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
