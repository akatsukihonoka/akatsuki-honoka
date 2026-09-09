"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Baby,
  Briefcase,
  Building2,
  Heart,
  Home,
  type LucideIcon,
  Rocket,
  Trees,
  TrendingUp,
} from "lucide-react";

import { PageContainer } from "@/components/common/page-container";
import { BackButton } from "@/components/common/back-button";
import { WhatIfCard } from "@/components/what-if/what-if-card";
import { CustomWhatIfForm } from "@/components/what-if/custom-what-if-form";
import { SyncSelectedEvent } from "@/components/what-if/sync-selected-event";
import { LIFE_EVENTS_BY_ID } from "@/data/life-events";
import { getAvailableWhatIfOptions } from "@/lib/what-if-engine/available-events";
import { useDiagnosisStore } from "@/store/diagnosis-store";
import type { ScenarioType } from "@/types/life-map";

const VALID_ROUTES: ScenarioType[] = ["stable", "ideal", "challenge"];

const iconMap: Record<string, LucideIcon> = {
  job_change: Briefcase,
  income_increase: TrendingUp,
  side_job: Rocket,
  marriage: Heart,
  child_birth: Baby,
  relocation: Trees,
  house_purchase: Home,
  independence: Building2,
};

export function IfPageContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event") ?? undefined;
  const routeParam = searchParams.get("route");
  const answers = useDiagnosisStore((s) => s.answers);
  const storedActiveScenario = useDiagnosisStore((s) => s.activeScenarioId);

  const routeId: ScenarioType =
    (routeParam && VALID_ROUTES.includes(routeParam as ScenarioType)
      ? (routeParam as ScenarioType)
      : storedActiveScenario) ?? "stable";

  const sourceEvent = eventId ? LIFE_EVENTS_BY_ID[eventId] : undefined;
  const options = useMemo(() => getAvailableWhatIfOptions(answers), [answers]);

  return (
    <main className="flex flex-1 flex-col">
      <SyncSelectedEvent eventId={sourceEvent?.id} scenarioId={routeId} />
      <PageContainer className="flex flex-1 flex-col gap-6 py-6">
        <div className="flex items-center">
          <BackButton />
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-2xl font-bold text-neutral-800">
            もしも、条件を変えたら？
          </h1>
          <p className="text-sm leading-relaxed text-neutral-600">
            気になる条件を選ぶと、今のMAPと比べてどう変わりそうかを見てみましょう。
          </p>
          {sourceEvent && (
            <p className="text-sm font-medium text-orange-700">
              「{sourceEvent.name}」からの続きとして選べます
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {options.map(({ event, deprioritized }) => (
            <WhatIfCard
              key={event.id}
              event={event}
              icon={iconMap[event.id] ?? Briefcase}
              href={`/compare?event=${event.id}&route=${routeId}`}
              deprioritized={deprioritized}
            />
          ))}
          <CustomWhatIfForm />
        </div>
      </PageContainer>
    </main>
  );
}
