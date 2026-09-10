"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, RefreshCcw } from "lucide-react";

import { PageContainer } from "@/components/common/page-container";
import { BackButton } from "@/components/common/back-button";
import { FixedBottomBar } from "@/components/common/fixed-bottom-bar";
import { DisclaimerNote } from "@/components/common/disclaimer-note";
import { Button } from "@/components/ui/button";
import { GoalForm } from "@/components/reverse-plan/goal-form";
import { ReversePlanTimeline } from "@/components/reverse-plan/reverse-plan-timeline";
import { ReversePlanActions } from "@/components/reverse-plan/reverse-plan-actions";
import { ReversePlanCompare } from "@/components/reverse-plan/reverse-plan-compare";
import { buildDiagnosisProfile, generateRoutes } from "@/lib/event-engine";
import { buildReversePlan } from "@/lib/reverse-plan-engine";
import { useDiagnosisStore } from "@/store/diagnosis-store";
import type { ScenarioType } from "@/types/life-map";

const VALID_ROUTES: ScenarioType[] = ["stable", "ideal", "challenge"];

export function ReversePlanContent() {
  const searchParams = useSearchParams();
  const routeParam = searchParams.get("route");

  const answers = useDiagnosisStore((s) => s.answers);
  const isComplete = useDiagnosisStore((s) => s.isComplete);
  const storedActiveScenario = useDiagnosisStore((s) => s.activeScenarioId);
  const storedGoal = useDiagnosisStore((s) => s.reversePlanGoal);
  const setReversePlanGoal = useDiagnosisStore((s) => s.setReversePlanGoal);

  const [editing, setEditing] = useState(false);

  const routeId: ScenarioType =
    (routeParam && VALID_ROUTES.includes(routeParam as ScenarioType)
      ? (routeParam as ScenarioType)
      : storedActiveScenario) ?? "stable";

  const currentAgeMidpoint = useMemo(
    () => buildDiagnosisProfile(answers).constraints.ageMidpoint,
    [answers]
  );
  const baseScenario = useMemo(() => generateRoutes(answers)[routeId], [answers, routeId]);

  const planResult = useMemo(() => {
    if (!storedGoal) return undefined;
    return buildReversePlan(answers, baseScenario, storedGoal);
  }, [answers, baseScenario, storedGoal]);

  if (!isComplete) {
    return (
      <main className="flex flex-1 flex-col">
        <PageContainer className="flex flex-1 flex-col gap-4 py-6">
          <BackButton />
          <p className="text-sm leading-relaxed text-neutral-600">
            まず現在地を整理してから、未来を逆算してみましょう。
          </p>
          <Button asChild size="lg" className="w-fit">
            <Link href="/start">
              診断を始める
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </PageContainer>
      </main>
    );
  }

  const showForm = editing || !storedGoal || !planResult || !planResult.ok;

  if (showForm) {
    return (
      <main className="flex flex-1 flex-col">
        <PageContainer className="flex flex-1 flex-col gap-6 py-6 pb-10">
          <BackButton />
          {planResult && !planResult.ok && (
            <p className="text-sm text-amber-700">{planResult.reason}</p>
          )}
          <GoalForm
            answers={answers}
            currentAgeMidpoint={currentAgeMidpoint}
            initialGoal={storedGoal}
            onSubmit={(goal) => {
              setReversePlanGoal(goal);
              setEditing(false);
            }}
          />
        </PageContainer>
      </main>
    );
  }

  const plan = planResult.plan;

  return (
    <main className="flex flex-1 flex-col">
      <PageContainer className="flex flex-1 flex-col gap-6 py-6 pb-6">
        <BackButton />

        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-2xl font-bold text-neutral-800">
            未来からの逆算プラン
          </h1>
          <p className="text-sm leading-relaxed text-neutral-600">
            {plan.goal.targetAge}歳ごろの未来から、今できることを逆算してみましょう。
          </p>
        </div>

        {plan.rejectedOptions.length > 0 && (
          <div className="flex flex-col gap-1 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {plan.rejectedOptions.map((r) => (
              <p key={r.optionId}>
                「{r.optionLabel}」{r.reason}
              </p>
            ))}
          </div>
        )}

        <ReversePlanTimeline goal={plan.goal} steps={plan.steps} />

        <ReversePlanActions actions={plan.actions} />

        <ReversePlanCompare baseScenario={baseScenario} plan={plan} />

        <div className="rounded-2xl border border-neutral-200 bg-white/70 p-4 text-xs leading-relaxed text-neutral-600">
          <p>これは未来を決めるための計画ではありません。</p>
          <p>途中で気持ちや環境が変わったら、MAPも更新できます。</p>
        </div>

        <DisclaimerNote />
      </PageContainer>

      <FixedBottomBar className="pb-4">
        <Button variant="secondary" size="lg" onClick={() => setEditing(true)}>
          <RefreshCcw className="h-4 w-4" />
          未来の状態を選び直す
        </Button>
      </FixedBottomBar>
    </main>
  );
}
