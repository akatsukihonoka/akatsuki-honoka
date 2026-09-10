import { MapPin, Sparkles } from "lucide-react";
import type { AgeTimelineNode } from "@/lib/age-timeline";
import { PathWave } from "@/components/illustrations/path-wave";
import { cn } from "@/lib/utils";
import { TimelineEventCard } from "./timeline-event-card";

/**
 * Walks the Timeline Display Layer's output (current -> 80) as a single
 * illustrated "life road": a start pin, each real event where the Event
 * Engine actually placed one, "未来の余白" gap nodes where it didn't, and a
 * final 80歳 horizon card. Never says what will happen — only what could,
 * and when it might.
 */
export function AgeRoadTimeline({
  nodes,
  accentClass,
}: {
  nodes: AgeTimelineNode[];
  accentClass: string;
}) {
  return (
    <div className="flex flex-col">
      {nodes.map((node, i) => {
        const isLast = i === nodes.length - 1;

        if (node.kind === "current") {
          return (
            <div key="current" className="relative flex gap-4 pb-4">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm ring-4 ring-white",
                    "bg-gradient-to-br from-orange-400 to-pink-400"
                  )}
                >
                  <MapPin className="h-5 w-5" />
                </span>
                {!isLast && <PathWave className={cn("h-10 w-6", accentClass)} />}
              </div>
              <div className="flex-1 pb-2 pt-3">
                <p className="text-sm font-bold text-neutral-800">📍 現在地・{node.age}歳ごろ</p>
                <p className="mt-0.5 text-xs leading-relaxed text-neutral-600">
                  ここから80歳までの、いくつもの道すじです。
                </p>
              </div>
            </div>
          );
        }

        if (node.kind === "event") {
          return (
            <TimelineEventCard
              key={node.event.id}
              event={node.event}
              isLast={isLast}
              accentClass={accentClass}
              ageLabel={node.ageLabel}
            />
          );
        }

        if (node.kind === "gap") {
          return (
            <div key={`gap-${node.age}`} className="relative flex gap-4 pb-4">
              <div className="flex flex-col items-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50">
                  <Sparkles className="h-4 w-4 text-neutral-300" />
                </span>
                {!isLast && <PathWave className="h-10 w-6 text-neutral-200" />}
              </div>
              <div className="flex-1 pb-2 pt-3">
                <span className="text-xs font-bold text-neutral-600">{node.ageLabel}</span>
                <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                  まだ具体的な出来事はありませんが、今の選択によって変わりうる未来の余白です。
                </p>
              </div>
            </div>
          );
        }

        return (
          <div key="horizon" className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-300 to-fuchsia-400 text-white shadow-sm ring-4 ring-white">
                <Sparkles className="h-5 w-5" />
              </span>
            </div>
            <div className="flex-1 animate-fade-in-up rounded-[24px] border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 shadow-soft">
              <p className="text-xs font-bold text-violet-700">{node.age}歳</p>
              <h3 className="mt-1 font-heading text-base font-bold text-neutral-800">
                ✨ 未来の選択肢
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                ここまでの道のりの先に、まだ見ぬ選択肢が残っています。今の選択の積み重ねが、この先の余白を広げていく可能性があります。
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
