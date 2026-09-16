import { MapPin, Sparkles } from "lucide-react";
import type { AgeTimelineNode } from "@/lib/age-timeline";
import { bandForAge, worldlineBandLabel, type WorldlineBand } from "@/lib/worldline";
import { PathWave } from "@/components/illustrations/path-wave";
import { TimelineEventCard } from "@/components/scenario/timeline-event-card";
import { cn } from "@/lib/utils";

/**
 * The same current -> event -> gap -> horizon nodes AgeRoadTimeline draws
 * for a route's full timeline (src/components/scenario/age-road-timeline.tsx),
 * but scoped to only this worldline's changed events, with a relative-time
 * band header ("1〜3年後" etc.) inserted whenever the story crosses into a
 * new band — turning "イベント→影響→次の分岐" into readable chapters
 * instead of one long list.
 */
export function WorldlineStoryTimeline({
  nodes,
  currentAge,
  endAge = 80,
  accentClass = "text-orange-700",
}: {
  nodes: AgeTimelineNode[];
  currentAge: number;
  endAge?: number;
  accentClass?: string;
}) {
  const rows = nodes.map((node) => ({
    node,
    band: (node.kind === "current" ? "current" : bandForAge(node.age, currentAge, endAge)) as WorldlineBand,
  }));

  return (
    <div className="flex flex-col">
      {rows.map(({ node, band }, i) => {
        const isLast = i === rows.length - 1;
        const showBandHeader = i === 0 || band !== rows[i - 1].band;

        return (
          <div key={i}>
            {showBandHeader && (
              <p className="mb-2 mt-1 flex items-center gap-2 text-xs font-bold text-neutral-600">
                <span className="h-px flex-1 bg-neutral-200" aria-hidden />
                {worldlineBandLabel(band)}
                <span className="h-px flex-1 bg-neutral-200" aria-hidden />
              </p>
            )}
            {renderNode(node, isLast, accentClass)}
          </div>
        );
      })}
    </div>
  );
}

function renderNode(node: AgeTimelineNode, isLast: boolean, accentClass: string) {
  if (node.kind === "current") {
    return (
      <div className="relative flex gap-4 pb-4">
        <div className="flex flex-col items-center">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 text-white shadow-sm ring-4 ring-white">
            <MapPin className="h-5 w-5" />
          </span>
          {!isLast && <PathWave className={cn("h-10 w-6", accentClass)} />}
        </div>
        <div className="flex-1 pb-2 pt-3">
          <p className="text-sm font-bold text-neutral-800">📍 今のあなた・{node.age}歳ごろ</p>
          <p className="mt-0.5 text-xs leading-relaxed text-neutral-600">
            ここから、この世界線がどう進むかを覗いてみましょう。
          </p>
        </div>
      </div>
    );
  }

  if (node.kind === "event") {
    return (
      <TimelineEventCard event={node.event} isLast={isLast} accentClass={accentClass} ageLabel={node.ageLabel} />
    );
  }

  if (node.kind === "gap") {
    return (
      <div className="relative flex gap-4 pb-4">
        <div className="flex flex-col items-center">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50">
            <Sparkles className="h-4 w-4 text-neutral-300" />
          </span>
          {!isLast && <PathWave className="h-10 w-6 text-neutral-200" />}
        </div>
        <div className="flex-1 pb-2 pt-3">
          <span className="text-xs font-bold text-neutral-600">{node.ageLabel}</span>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600">
            ここではまだ具体的な出来事はありませんが、今の選択によって変わりうる未来の余白です。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-300 to-fuchsia-400 text-white shadow-sm ring-4 ring-white">
          <Sparkles className="h-5 w-5" />
        </span>
      </div>
      <div className="flex-1 animate-fade-in-up rounded-[24px] border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 shadow-soft">
        <p className="text-xs font-bold text-violet-700">{node.age}歳</p>
        <h3 className="mt-1 font-heading text-base font-bold text-neutral-800">
          ✨ この世界線の先には、まだ見ぬ分岐が残っています
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-neutral-600">
          ここで終わりではありません。今の選択の積み重ねが、この先の余白を広げていく可能性があります。
        </p>
      </div>
    </div>
  );
}
