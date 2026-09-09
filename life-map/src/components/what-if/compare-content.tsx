"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, GitBranch, Plus } from "lucide-react";

import { PageContainer } from "@/components/common/page-container";
import { BackButton } from "@/components/common/back-button";
import { FixedBottomBar } from "@/components/common/fixed-bottom-bar";
import { DisclaimerNote } from "@/components/common/disclaimer-note";
import { Button } from "@/components/ui/button";
import { ChangedAxisTable } from "@/components/what-if/changed-axis-table";
import { OptionScoreDelta } from "@/components/what-if/option-score-delta";
import { OptionScoreProgression } from "@/components/what-if/option-score-progression";
import { CausalChainView } from "@/components/what-if/causal-chain-view";
import { AddedEventsList } from "@/components/what-if/added-events-list";
import { RiskBanner } from "@/components/what-if/risk-banner";
import { ChainTimeline } from "@/components/what-if/chain-timeline";
import { SyncSelectedEvent } from "@/components/what-if/sync-selected-event";
import { WHAT_IF_LABELS } from "@/lib/what-if-engine/available-events";
import { generateRoutes } from "@/lib/event-engine";
import {
  applyChain,
  buildChainCausalChain,
  compareChainOverall,
  lastAcceptedResult,
  MAX_CHAIN_LENGTH,
} from "@/lib/what-if-engine/chain";
import { useDiagnosisStore } from "@/store/diagnosis-store";
import type { ScenarioType } from "@/types/life-map";

const VALID_ROUTES: ScenarioType[] = ["stable", "ideal", "challenge"];

function parseIds(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

export function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
  const addAnotherHref = chain
    ? `/if?route=${routeId}&applied=${chain.events.join(",")}`
    : ifHref;

  const handleRemove = (eventId: string) => {
    const next = (chain?.events ?? []).filter((id) => id !== eventId);
    router.push(
      next.length > 0
        ? `/compare?route=${routeId}&events=${next.join(",")}`
        : `/compare?route=${routeId}`
    );
  };

  if (!chain) {
    return (
      <main className="flex flex-1 flex-col">
        <PageContainer className="flex flex-1 flex-col gap-4 py-6">
          <BackButton />
          <p className="text-sm leading-relaxed text-neutral-600">
            まだ「もしも」が選ばれていません。試したい条件を選ぶところから始めましょう。
          </p>
          <Button asChild size="lg" className="w-fit">
            <Link href={ifHref}>
              <GitBranch className="h-4 w-4" />
              もしもを選ぶ
            </Link>
          </Button>
        </PageContainer>
      </main>
    );
  }

  const accepted = lastAcceptedResult(chain);
  const rejectedTail = !chain.finalResult.applied ? chain.finalResult : undefined;

  // Nothing in the chain ever succeeded (e.g. the very first pick violated
  // a hard constraint) — there's nothing to compare, just explain why.
  if (!accepted) {
    return (
      <main className="flex flex-1 flex-col">
        <PageContainer className="flex flex-1 flex-col gap-4 py-6">
          <BackButton />
          <div className="flex flex-col gap-1.5">
            <h1 className="font-heading text-xl font-bold text-neutral-800">
              この「もしも」は反映できませんでした
            </h1>
            <p className="text-sm leading-relaxed text-neutral-600">
              {rejectedTail?.reason}
            </p>
          </div>
          <Button asChild size="lg" className="w-fit">
            <Link href={ifHref}>
              <GitBranch className="h-4 w-4" />
              別のもしもを選ぶ
            </Link>
          </Button>
        </PageContainer>
      </main>
    );
  }

  const overallComparison = compareChainOverall(baseScenario, chain)!;
  const causalChain = buildChainCausalChain(chain);
  const optionScoreProgression = [
    baseScenario.scores.optionScore,
    ...chain.results.filter((r) => r.applied).map((r) => r.scenario.scores.optionScore),
  ];
  const chainLabel = chain.events.map((id) => WHAT_IF_LABELS[id] ?? id).join(" → ");
  const canAddMore = chain.events.length < MAX_CHAIN_LENGTH;

  return (
    <main className="flex flex-1 flex-col">
      <SyncSelectedEvent scenarioId={routeId} chainEventIds={chain.events} />
      <PageContainer className="flex flex-1 flex-col gap-6 py-6 pb-6">
        <div className="flex items-center">
          <BackButton />
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-2xl font-bold text-neutral-800">
            今のMAPと、もしものMAPを比べてみよう。
          </h1>
          <p className="text-sm font-medium text-orange-700">「{chainLabel}」の場合</p>
          {rejectedTail && (
            <p className="text-xs leading-relaxed text-neutral-500">{rejectedTail.reason}</p>
          )}
        </div>

        <ChainTimeline eventIds={chain.events} onRemove={handleRemove} />

        <OptionScoreDelta
          before={overallComparison.optionScoreBefore}
          after={overallComparison.optionScoreAfter}
        />
        <OptionScoreProgression values={optionScoreProgression} />

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-neutral-600">変わったところ</p>
          <ChangedAxisTable changes={overallComparison.changedAxes} />
        </div>

        <AddedEventsList eventIds={overallComparison.addedEvents} />

        <CausalChainView steps={causalChain} />

        {overallComparison.newRisks.map((risk) => (
          <RiskBanner key={`new-${risk.period}`} risk={risk} />
        ))}
        {overallComparison.resolvedRisks.length > 0 && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            この「もしも」により、これまでの変化が重なる時期の余白が広がる可能性があります。
          </div>
        )}

        <DisclaimerNote />
      </PageContainer>

      <FixedBottomBar className="pb-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {canAddMore ? (
            <Button asChild variant="secondary" size="lg">
              <Link href={addAnotherHref}>
                <Plus className="h-4 w-4" />
                もう一つ、もしもを重ねる
              </Link>
            </Button>
          ) : (
            <Button asChild variant="secondary" size="lg">
              <Link href={ifHref}>
                <GitBranch className="h-4 w-4" />
                別のもしもを試す
              </Link>
            </Button>
          )}
          <Button asChild size="lg">
            <Link href="/actions">
              この結果から行動を考える
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </FixedBottomBar>
    </main>
  );
}
