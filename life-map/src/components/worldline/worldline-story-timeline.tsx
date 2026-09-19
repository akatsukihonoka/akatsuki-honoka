import { MapPin, Sparkles } from "lucide-react";
import type { WorldlineStoryNode } from "@/lib/worldline";
import { bandForAge, worldlineBandLabel, type WorldlineBand } from "@/lib/worldline";
import { PathWave } from "@/components/illustrations/path-wave";
import { TimelineEventCard } from "@/components/scenario/timeline-event-card";
import { cn } from "@/lib/utils";

/**
 * The condensed current -> event -> gap-range nodes buildWorldlineView
 * produced: every run of "no real event here" ages is already merged into
 * one gap-range node (see condenseStoryNodes), so this only ever renders
 * one card per stretch of empty years instead of one per gap age. The
 * event buildWorldlineView flagged as the unexpected (cross-category)
 * downstream addition carries a "✨ 意外な変化" badge in place, instead of
 * a separate duplicate card elsewhere on the page.
 */
export function WorldlineStoryTimeline({
  nodes,
  currentAge,
  endAge = 80,
  accentClass = "text-orange-700",
}: {
  nodes: WorldlineStoryNode[];
  currentAge: number;
  endAge?: number;
  accentClass?: string;
}) {
  const rows = nodes.map((node) => ({
    node,
    band: bandForNode(node, currentAge, endAge),
  }));

  return (
    <div className="flex flex-col">
      {rows.map(({ node, band }, i) => {
        const isLast = i === rows.length - 1;
        // A gap-range card already states its own age range, so a band
        // header directly above it would just repeat the same information.
        const showBandHeader =
          node.kind !== "gap-range" && (i === 0 || band !== rows[i - 1].band);

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

function bandForNode(node: WorldlineStoryNode, currentAge: number, endAge: number): WorldlineBand {
  if (node.kind === "current") return "current";
  if (node.kind === "gap-range") return bandForAge(node.fromAge, currentAge, endAge);
  return bandForAge(node.age, currentAge, endAge);
}

function renderNode(node: WorldlineStoryNode, isLast: boolean, accentClass: string) {
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
      <TimelineEventCard
        event={node.event}
        isLast={isLast}
        accentClass={accentClass}
        ageLabel={node.ageLabel}
        branchPointLabel="分岐の可能性"
        extraBadge={
          node.isUnexpected ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
              ✨ 意外な変化
            </span>
          ) : undefined
        }
      />
    );
  }

  // gap-range
  const ageLabel = node.fromAge === node.toAge ? `${node.fromAge}歳ごろ` : `${node.fromAge}〜${node.toAge}歳ごろ`;

  if (node.reachesHorizon) {
    const horizonLabel = node.fromAge === node.toAge ? `${node.fromAge}歳` : `${node.fromAge}歳ごろ〜80歳`;
    return (
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-300 to-fuchsia-400 text-white shadow-sm ring-4 ring-white">
            <Sparkles className="h-5 w-5" />
          </span>
        </div>
        <div className="flex-1 animate-fade-in-up rounded-[24px] border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 shadow-soft">
          <p className="text-xs font-bold text-violet-700">{horizonLabel}</p>
          <h3 className="mt-1 font-heading text-base font-bold text-neutral-800">
            🌌 その先には、まだ決まっていない未来があります
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-neutral-600">
            ここから先は具体的な出来事を固定せず、今の選択によって変わる可能性のある「未来の余白」として残されています。今の選択の積み重ねが、この先の余白を広げていく可能性があります。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex gap-4 pb-4">
      <div className="flex flex-col items-center">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50">
          <Sparkles className="h-4 w-4 text-neutral-300" />
        </span>
        {!isLast && <PathWave className="h-10 w-6 text-neutral-200" />}
      </div>
      <div className="flex-1 pb-2 pt-3">
        <span className="text-xs font-bold text-neutral-600">{ageLabel}</span>
        <p className="mt-1 text-xs leading-relaxed text-neutral-600">
          この間はまだ具体的な出来事はありませんが、今の選択によって変わりうる未来の余白です。
        </p>
      </div>
    </div>
  );
}
