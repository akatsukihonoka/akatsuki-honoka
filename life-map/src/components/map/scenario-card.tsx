import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Scenario } from "@/types/life-map";
import { scenarioMeta } from "@/data/mock-scenarios";
import { Expandable } from "@/components/common/expandable";
import { ScoreBar } from "./score-bar";

export function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const meta = scenarioMeta[scenario.id];

  return (
    <div
      className={`tap-bounce animate-pop-in overflow-hidden rounded-[28px] border ${meta.colorClass.border} ${meta.colorClass.worldBg} shadow-soft`}
    >
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl text-white shadow-sm ${meta.colorClass.badgeGradient}`}
              aria-hidden
            >
              {meta.emoji}
            </span>
            <div className="flex flex-col gap-0.5">
              <span
                className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.colorClass.chip}`}
              >
                {meta.label}
              </span>
              <h3 className="font-heading text-base font-bold leading-snug text-neutral-800">
                {scenario.title}
              </h3>
            </div>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-neutral-700">{meta.tagline}</p>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-bold ${meta.colorClass.text}`}
          >
            ✨ 未来の余白 {scenario.scores.optionScore}
          </span>
        </div>

        <Expandable label="もっと詳しく見る" collapsedLabel="閉じる" buttonClassName={meta.colorClass.text}>
          <div className="mt-2 flex flex-col gap-3 border-t border-white/60 pt-3">
            <p className="text-sm leading-relaxed text-neutral-600">{scenario.summary}</p>
            <p className="text-xs font-medium text-neutral-600">重視するもの：{scenario.focus}</p>
            <div className="flex flex-col gap-2.5">
              <ScoreBar
                label={meta.metricLabels.valueMatch}
                value={scenario.scores.valueMatch}
                barClassName={meta.colorClass.bar}
              />
              <ScoreBar
                label={meta.metricLabels.feasibility}
                value={scenario.scores.feasibility}
                barClassName={meta.colorClass.bar}
              />
              <ScoreBar
                label={meta.metricLabels.optionScore}
                value={scenario.scores.optionScore}
                barClassName={meta.colorClass.bar}
              />
            </div>
          </div>
        </Expandable>

        <Link
          href={`/map/${scenario.id}`}
          className={`tap-bounce mt-1 inline-flex items-center gap-1.5 self-start rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm ${meta.colorClass.text}`}
        >
          この未来をのぞく
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
