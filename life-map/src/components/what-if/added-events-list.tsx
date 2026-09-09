import { LIFE_EVENTS_BY_ID } from "@/data/life-events";

export function AddedEventsList({ eventIds }: { eventIds: string[] }) {
  if (eventIds.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-neutral-600">追加される可能性のあるイベント</p>
      <div className="flex flex-wrap gap-1.5">
        {eventIds.map((id) => (
          <span
            key={id}
            className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
          >
            {LIFE_EVENTS_BY_ID[id]?.name ?? id}
          </span>
        ))}
      </div>
    </div>
  );
}
