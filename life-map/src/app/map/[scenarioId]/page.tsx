"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, GitBranch } from "lucide-react";

import { PageContainer } from "@/components/common/page-container";
import { BackButton } from "@/components/common/back-button";
import { FixedBottomBar } from "@/components/common/fixed-bottom-bar";
import { Button } from "@/components/ui/button";
import { TimelineEventCard } from "@/components/scenario/timeline-event-card";
import { scenarioMeta } from "@/data/mock-scenarios";
import { generateRoutes } from "@/lib/event-engine";
import { useDiagnosisStore } from "@/store/diagnosis-store";
import type { ScenarioType } from "@/types/life-map";

const validIds: ScenarioType[] = ["stable", "ideal", "challenge"];

export default function ScenarioDetailPage() {
  const params = useParams<{ scenarioId: string }>();
  const answers = useDiagnosisStore((s) => s.answers);
  const routes = useMemo(() => generateRoutes(answers), [answers]);

  const scenarioId = params.scenarioId;
  const isValid = validIds.includes(scenarioId as ScenarioType);
  const scenario = isValid ? routes[scenarioId as ScenarioType] : undefined;

  if (!scenario) {
    return (
      <main className="flex flex-1 flex-col">
        <PageContainer className="flex flex-1 flex-col gap-4 py-6">
          <BackButton />
          <p className="text-sm text-neutral-600">
            指定されたルートが見つかりませんでした。
          </p>
          <Link href="/map" className="text-sm font-medium text-orange-700 underline">
            未来MAPに戻る
          </Link>
        </PageContainer>
      </main>
    );
  }

  const meta = scenarioMeta[scenario.id];
  const primaryBranchPoint = scenario.events.find((event) => event.isBranchPoint);
  const primaryEventId = (primaryBranchPoint ?? scenario.events[0])?.sourceEventId;
  const ifHref = primaryEventId ? `/if?event=${primaryEventId}` : "/if";

  return (
    <main className="flex flex-1 flex-col">
      <PageContainer className="flex flex-1 flex-col gap-6 py-6 pb-28">
        <div className="flex items-center">
          <BackButton />
        </div>

        <div className="flex flex-col gap-2">
          <span
            className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${meta.colorClass.chip}`}
          >
            {meta.label}
          </span>
          <h1 className="font-heading text-xl font-bold text-neutral-800">
            {scenario.title}
          </h1>
          <p className="text-sm leading-relaxed text-neutral-600">{scenario.summary}</p>
        </div>

        {scenario.risks?.map((risk) => (
          <div
            key={risk.period}
            className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <span className="font-semibold">{risk.period}：</span>
              {risk.message}
            </p>
          </div>
        ))}

        <div className="mt-2">
          {scenario.events.map((event, i) => (
            <TimelineEventCard
              key={event.id}
              event={event}
              isLast={i === scenario.events.length - 1}
              accentClass={meta.colorClass.text}
              dotClass={meta.colorClass.bar}
            />
          ))}
        </div>
      </PageContainer>

      <FixedBottomBar className="pb-4">
        <Button asChild size="lg" className="w-full">
          <Link href={ifHref}>
            <GitBranch className="h-4 w-4" />
            このルートで、もしもを試す
          </Link>
        </Button>
      </FixedBottomBar>
    </main>
  );
}
