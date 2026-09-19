"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GitBranch } from "lucide-react";

import { PageContainer } from "@/components/common/page-container";
import { BackButton } from "@/components/common/back-button";
import { DisclaimerNote } from "@/components/common/disclaimer-note";
import { Expandable } from "@/components/common/expandable";
import { Button } from "@/components/ui/button";
import { OptionScoreDelta } from "@/components/what-if/option-score-delta";
import { SyncSelectedEvent } from "@/components/what-if/sync-selected-event";
import { WhatIfInterpretationCard } from "@/components/ai/what-if-interpretation-card";
import { WorldlineStoryTimeline } from "@/components/worldline/worldline-story-timeline";
import { BranchChoiceCard } from "@/components/worldline/branch-choice-card";
import { UnexpectedBranchCard } from "@/components/worldline/unexpected-branch-card";
import { WorldlineCtaFooter } from "@/components/worldline/worldline-cta-footer";
import { WHAT_IF_LABELS } from "@/lib/what-if-engine/available-events";
import { buildDiagnosisProfile, generateRoutes } from "@/lib/event-engine";
import { buildChainInput, buildWhatIfInput } from "@/lib/ai/build-input";
import {
  applyChain,
  buildChainCausalChain,
  compareChainOverall,
  lastAcceptedResult,
} from "@/lib/what-if-engine/chain";
import { buildWorldlineView } from "@/lib/worldline";
import { useDiagnosisStore } from "@/store/diagnosis-store";
import type { ScenarioType } from "@/types/life-map";

const VALID_ROUTES: ScenarioType[] = ["stable", "ideal", "challenge"];

function parseIds(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

export function WorldlineContent() {
  const searchParams = useSearchParams();
  const eventsParam = searchParams.get("events");
  const singleEventParam = searchParams.get("event");
  const routeParam = searchParams.get("route");

  const answers = useDiagnosisStore((s) => s.answers);
  const storedActiveScenario = useDiagnosisStore((s) => s.activeScenarioId);
  const storedChainEventIds = useDiagnosisStore((s) => s.chainEventIds);

  const routeId: ScenarioType =
    (routeParam && VALID_ROUTES.includes(routeParam as ScenarioType)
      ? (routeParam as ScenarioType)
      : storedActiveScenario) ?? "stable";

  const urlChainEventIds = useMemo(() => {
    if (eventsParam) return parseIds(eventsParam);
    if (singleEventParam) return [singleEventParam];
    return undefined;
  }, [eventsParam, singleEventParam]);

  const chainEventIds = urlChainEventIds ?? storedChainEventIds;

  const baseScenario = useMemo(() => generateRoutes(answers)[routeId], [answers, routeId]);

  const chain = useMemo(() => {
    if (chainEventIds.length === 0) return undefined;
    return applyChain(answers, baseScenario, chainEventIds);
  }, [answers, baseScenario, chainEventIds]);

  const ifHref = `/if?route=${routeId}`;

  if (!chain) {
    return (
      <main className="flex flex-1 flex-col">
        <PageContainer className="flex flex-1 flex-col gap-4 py-6">
          <BackButton />
          <p className="text-sm leading-relaxed text-neutral-600">
            まだ覗きたい世界線が選ばれていません。気になる選択を選ぶところから始めましょう。
          </p>
          <Button asChild size="lg" className="w-fit">
            <Link href={ifHref}>
              <GitBranch className="h-4 w-4" />
              別の選択を試す
            </Link>
          </Button>
        </PageContainer>
      </main>
    );
  }

  const accepted = lastAcceptedResult(chain);
  const rejectedTail = !chain.finalResult.applied ? chain.finalResult : undefined;

  if (!accepted) {
    return (
      <main className="flex flex-1 flex-col">
        <PageContainer className="flex flex-1 flex-col gap-4 py-6">
          <BackButton />
          <div className="flex flex-col gap-1.5">
            <h1 className="font-heading text-xl font-bold text-neutral-800">
              この世界線は覗けませんでした
            </h1>
            <p className="text-sm leading-relaxed text-neutral-600">{rejectedTail?.reason}</p>
          </div>
          <Button asChild size="lg" className="w-fit">
            <Link href={ifHref}>
              <GitBranch className="h-4 w-4" />
              別の選択を試す
            </Link>
          </Button>
        </PageContainer>
      </main>
    );
  }

  const comparison = compareChainOverall(baseScenario, chain)!;
  const causalChain = buildChainCausalChain(chain);
  const view = buildWorldlineView({ answers, baseScenario, chain, accepted, comparison, causalChain });

  const chainLabel = chain.events.map((id) => WHAT_IF_LABELS[id] ?? id).join(" → ");
  const isChain = chain.events.length >= 2;

  const diagnosisProfile = buildDiagnosisProfile(answers);
  const valueProfile = diagnosisProfile.valueProfile;
  const aiInput = isChain
    ? buildChainInput({
        valueProfile,
        routeId,
        appliedEventIds: chain.events,
        optionScoreProgression: [
          baseScenario.scores.optionScore,
          ...chain.results.filter((r) => r.applied).map((r) => r.scenario.scores.optionScore),
        ],
        comparison,
        causalChain,
      })
    : buildWhatIfInput({ valueProfile, routeId, comparison, causalChain });

  const branchHref = (nextEventId: string) =>
    `/worldline?route=${routeId}&events=${[...chain.events, nextEventId].join(",")}`;
  const compareHref = `/compare?route=${routeId}&events=${chain.events.join(",")}`;

  return (
    <main className="flex flex-1 flex-col">
      <SyncSelectedEvent scenarioId={routeId} chainEventIds={chain.events} />
      <PageContainer className="flex flex-1 flex-col gap-5 py-6 pb-6">
        <div className="flex items-center">
          <BackButton />
        </div>

        {/* ① 世界線タイトル + ② 短い説明 */}
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-2xl font-bold text-neutral-800">
            🌌 もし「{chainLabel}」を選んだ世界線
          </h1>
          <p className="text-sm leading-relaxed text-neutral-600">
            この選択から、どんな未来の分岐が生まれる？
          </p>
          {view.rootWasAlreadyPresent && view.rootEventName && (
            <p className="text-xs leading-relaxed text-neutral-600">
              「{view.rootEventName}」は、今のあなたの回答からもすでに近い未来として含まれています。ここでは、そこからさらに広がる可能性のある未来を見てみましょう。
            </p>
          )}
          {rejectedTail && (
            <p className="text-xs leading-relaxed text-neutral-600">{rejectedTail.reason}</p>
          )}
        </div>

        {/* ③ 意外な変化（短いティーザー。全文はストーリー内の該当カードに一度だけ） */}
        <UnexpectedBranchCard branch={view.unexpectedBranch} />

        {/* ④ 次の分岐 */}
        <BranchChoiceCard
          options={view.branchOptions}
          buildHref={branchHref}
          atChainLimit={!view.canBranchFurther}
        />

        {/* ⑤ 未来のストーリー */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-neutral-600">📍 未来のストーリー</p>
          <WorldlineStoryTimeline nodes={view.storyNodes} currentAge={view.currentAge} />
        </div>

        <WhatIfInterpretationCard
          kind={isChain ? "chain" : "whatIf"}
          title={isChain ? "この組み合わせの特徴" : "この選択を試してみると"}
          input={aiInput}
        />

        {/* ⑥ Option Score は補足情報として折りたたみ */}
        <Expandable
          label="🌌 この世界線の未来の余白を見る"
          collapsedLabel="閉じる"
          className="rounded-[24px] border border-orange-100 bg-white/60 p-4"
        >
          <OptionScoreDelta
            before={view.comparison.optionScoreBefore}
            after={view.comparison.optionScoreAfter}
          />
        </Expandable>

        {/* ⑦ Compare / Reverse Plan / Actions */}
        <WorldlineCtaFooter ifHref={ifHref} compareHref={compareHref} />

        <DisclaimerNote />
      </PageContainer>
    </main>
  );
}
