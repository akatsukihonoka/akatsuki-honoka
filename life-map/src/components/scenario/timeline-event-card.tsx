import { AlertTriangle, Sparkles } from "lucide-react";
import type { ScenarioEvent } from "@/types/life-map";
import { LIFE_EVENTS_BY_ID } from "@/data/life-events";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { Expandable } from "@/components/common/expandable";
import { PathWave } from "@/components/illustrations/path-wave";
import { cn } from "@/lib/utils";

export function TimelineEventCard({
  event,
  isLast,
  accentClass,
  ageLabel,
}: {
  event: ScenarioEvent;
  isLast: boolean;
  accentClass: string;
  /** Display-only age anchor from the Timeline Display Layer, e.g. "33歳ごろ" — shown alongside the existing period label, never replacing it. */
  ageLabel?: string;
}) {
  const category = event.sourceEventId ? LIFE_EVENTS_BY_ID[event.sourceEventId]?.category : undefined;
  const iconMeta = category ? CATEGORY_ICONS[category] : undefined;
  const Icon = iconMeta?.icon ?? Sparkles;

  return (
    <div className="relative flex gap-4 pb-4">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-4 ring-white",
            iconMeta?.bg ?? "bg-neutral-100"
          )}
        >
          <Icon className={cn("h-5 w-5", iconMeta?.text ?? "text-neutral-500")} />
        </span>
        {!isLast && <PathWave className={cn("h-10 w-6", accentClass)} />}
      </div>

      <div className="flex-1 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          {ageLabel && (
            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-600">
              {ageLabel}
            </span>
          )}
          <span className={cn("text-xs font-bold", accentClass)}>{event.period}</span>
          {event.isBranchPoint && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold text-violet-700">
              🔀 分岐点
            </span>
          )}
        </div>

        <div className="mt-2 animate-fade-in-up rounded-[24px] border border-neutral-100 bg-white p-5 shadow-soft">
          <h3 className="font-heading text-base font-bold text-neutral-800">{event.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-neutral-600">{event.description}</p>

          {event.changes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {event.changes.map((change) => (
                <span
                  key={change}
                  className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700"
                >
                  {change}
                </span>
              ))}
            </div>
          )}

          <Expandable label="くわしく見る" className="mt-1">
            <div className="flex flex-col gap-2 border-t border-neutral-100 pt-3 text-sm">
              <div className="flex gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                <ul className="flex flex-col gap-1 text-neutral-600">
                  {event.advantages.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                <ul className="flex flex-col gap-1 text-neutral-600">
                  {event.cautions.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Expandable>
        </div>
      </div>
    </div>
  );
}
