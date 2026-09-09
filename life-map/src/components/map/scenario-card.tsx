import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { Scenario } from "@/types/life-map";
import { scenarioMeta } from "@/data/mock-scenarios";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreBar } from "./score-bar";

export function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const meta = scenarioMeta[scenario.id];

  return (
    <Link href={`/map/${scenario.id}`} className="block">
      <Card
        className={`border ${meta.colorClass.border} transition-transform hover:-translate-y-0.5 hover:shadow-md`}
      >
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <span
                className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${meta.colorClass.chip}`}
              >
                {meta.label}
              </span>
              <h3 className="font-heading text-base font-bold text-neutral-800">
                {scenario.title}
              </h3>
            </div>
            <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-neutral-300" />
          </div>

          <p className="text-sm leading-relaxed text-neutral-600">{scenario.summary}</p>

          <p className="text-xs font-medium text-neutral-600">
            重視するもの：{scenario.focus}
          </p>

          <div className="flex flex-col gap-2.5 border-t border-neutral-100 pt-4">
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
        </CardContent>
      </Card>
    </Link>
  );
}
