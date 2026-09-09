"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, GitBranch } from "lucide-react";

import { PageContainer } from "@/components/common/page-container";
import { BackButton } from "@/components/common/back-button";
import { FixedBottomBar } from "@/components/common/fixed-bottom-bar";
import { DisclaimerNote } from "@/components/common/disclaimer-note";
import { Button } from "@/components/ui/button";
import { ChangedAxisTable } from "@/components/what-if/changed-axis-table";
import { OptionScoreDelta } from "@/components/what-if/option-score-delta";
import { CausalChainView } from "@/components/what-if/causal-chain-view";
import { AddedEventsList } from "@/components/what-if/added-events-list";
import { RiskBanner } from "@/components/what-if/risk-banner";
import { WHAT_IF_LABELS } from "@/lib/what-if-engine/available-events";
import { generateRoutes } from "@/lib/event-engine";
import { recalculateScenario } from "@/lib/what-if-engine";
import { useDiagnosisStore } from "@/store/diagnosis-store";
import type { ScenarioType } from "@/types/life-map";

const VALID_ROUTES: ScenarioType[] = ["stable", "ideal", "challenge"];

export function CompareContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event");
  const routeParam = searchParams.get("route");

  const answers = useDiagnosisStore((s) => s.answers);
  const storedActiveScenario = useDiagnosisStore((s) => s.activeScenarioId);

  const routeId: ScenarioType =
    (routeParam && VALID_ROUTES.includes(routeParam as ScenarioType)
      ? (routeParam as ScenarioType)
      : storedActiveScenario) ?? "stable";

  const baseScenario = useMemo(() => generateRoutes(answers)[routeId], [answers, routeId]);

  const result = useMemo(() => {
    if (!eventId) return undefined;
    return recalculateScenario({ answers, baseScenario, selectedEventId: eventId });
  }, [answers, baseScenario, eventId]);

  const ifHref = `/if?route=${routeId}`;
  const whatIfLabel = eventId ? (WHAT_IF_LABELS[eventId] ?? eventId) : undefined;

  if (!eventId || !result) {
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

  if (!result.applied) {
    return (
      <main className="flex flex-1 flex-col">
        <PageContainer className="flex flex-1 flex-col gap-4 py-6">
          <BackButton />
          <div className="flex flex-col gap-1.5">
            <h1 className="font-heading text-xl font-bold text-neutral-800">
              この「もしも」は反映できませんでした
            </h1>
            <p className="text-sm leading-relaxed text-neutral-600">{result.reason}</p>
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

  const { comparison, causalChain } = result;

  return (
    <main className="flex flex-1 flex-col">
      <PageContainer className="flex flex-1 flex-col gap-6 py-6 pb-6">
        <div className="flex items-center">
          <BackButton />
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-2xl font-bold text-neutral-800">
            今のMAPと、もしものMAPを比べてみよう。
          </h1>
          <p className="text-sm font-medium text-orange-700">「{whatIfLabel}」の場合</p>
        </div>

        <OptionScoreDelta
          before={comparison.optionScoreBefore}
          after={comparison.optionScoreAfter}
        />

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-neutral-600">変わったところ</p>
          <ChangedAxisTable changes={comparison.changedAxes} />
        </div>

        <AddedEventsList eventIds={comparison.addedEvents} />

        <CausalChainView steps={causalChain} />

        {comparison.newRisks.map((risk) => (
          <RiskBanner key={`new-${risk.period}`} risk={risk} />
        ))}
        {comparison.resolvedRisks.length > 0 && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            この「もしも」により、これまでの変化が重なる時期の余白が広がる可能性があります。
          </div>
        )}

        <DisclaimerNote />
      </PageContainer>

      <FixedBottomBar className="pb-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button asChild variant="secondary" size="lg">
            <Link href={ifHref}>
              <GitBranch className="h-4 w-4" />
              別のもしもを試す
            </Link>
          </Button>
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
