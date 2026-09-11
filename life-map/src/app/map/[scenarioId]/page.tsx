"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GitBranch } from "lucide-react";

import { PageContainer } from "@/components/common/page-container";
import { BackButton } from "@/components/common/back-button";
import { FixedBottomBar } from "@/components/common/fixed-bottom-bar";
import { Expandable } from "@/components/common/expandable";
import { Button } from "@/components/ui/button";
import { AgeRoadTimeline } from "@/components/scenario/age-road-timeline";
import { RiskBanner } from "@/components/what-if/risk-banner";
import { RouteInterpretationCard } from "@/components/ai/route-interpretation-card";
import { scenarioMeta } from "@/data/mock-scenarios";
import { buildDiagnosisProfile, generateRoutes } from "@/lib/event-engine";
import { buildAgeTimeline, getDisplayCurrentAge } from "@/lib/age-timeline";
import { useDiagnosisStore } from "@/store/diagnosis-store";
import type { ScenarioType } from "@/types/life-map";

const validIds: ScenarioType[] = ["stable", "ideal", "challenge"];

export default function ScenarioDetailPage() {
  const params = useParams<{ scenarioId: string }>();
  const answers = useDiagnosisStore((s) => s.answers);
  const routes = useMemo(() => generateRoutes(answers), [answers]);
  const diagnosisProfile = useMemo(() => buildDiagnosisProfile(answers), [answers]);
  const valueProfile = diagnosisProfile.valueProfile;
  const currentAge = getDisplayCurrentAge(diagnosisProfile.constraints);

  const scenarioId = params.scenarioId;
  const isValid = validIds.includes(scenarioId as ScenarioType);
  const scenario = isValid ? routes[scenarioId as ScenarioType] : undefined;
  const ageTimeline = useMemo(
    () => (scenario ? buildAgeTimeline(scenario.events, currentAge) : []),
    [scenario, currentAge]
  );

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
  const ifHref = primaryEventId
    ? `/if?event=${primaryEventId}&route=${scenario.id}`
    : `/if?route=${scenario.id}`;

  return (
    <main className="flex flex-1 flex-col">
      <div className={`${meta.colorClass.worldBg} pb-6 pt-6`}>
        <PageContainer className="flex flex-col gap-3">
          <BackButton />
          <div className="flex items-center gap-3">
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl text-white shadow-sm ${meta.colorClass.badgeGradient}`}
              aria-hidden
            >
              {meta.emoji}
            </span>
            <div className="flex flex-col gap-1">
              <span
                className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.colorClass.chip}`}
              >
                {meta.label}
              </span>
              <h1 className="font-heading text-xl font-bold text-neutral-800">{scenario.title}</h1>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-neutral-700">{meta.tagline}</p>
          <div className={`mt-1 flex items-start gap-1.5 rounded-2xl bg-white/60 px-3 py-2 text-[11px] leading-relaxed ${meta.colorClass.text}`}>
            <span aria-hidden>📍</span>
            <p>
              <span className="font-bold">今の選択を続けた未来</span>
              　現在の回答や選択をベースに描いた、{meta.label}での未来です。もちろん、途中で別の道を選ぶこともできます。
            </p>
          </div>
          <Expandable label="ルートの詳しい説明を見る" buttonClassName={meta.colorClass.text}>
            <p className="mt-1 text-sm leading-relaxed text-neutral-600">{scenario.summary}</p>
          </Expandable>
        </PageContainer>
      </div>

      <PageContainer className="flex flex-1 flex-col gap-6 py-6 pb-28">
        {scenario.risks?.map((risk) => <RiskBanner key={risk.period} risk={risk} />)}

        <RouteInterpretationCard valueProfile={valueProfile} scenario={scenario} />

        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-neutral-600">🚶 人生の道・{currentAge}歳ごろから80歳まで</p>
          <div className="mt-2">
            <AgeRoadTimeline nodes={ageTimeline} accentClass={meta.colorClass.text} />
          </div>
        </div>
      </PageContainer>

      <FixedBottomBar className="pb-4">
        <Button
          asChild
          size="lg"
          className="tap-bounce w-full bg-gradient-to-r from-orange-400 to-pink-400 shadow-soft-lg hover:opacity-90"
        >
          <Link href={ifHref}>
            <GitBranch className="h-4 w-4" />
            もし、別の選択をしたら？
          </Link>
        </Button>
      </FixedBottomBar>
    </main>
  );
}
