"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Baby,
  Briefcase,
  Building2,
  Heart,
  Home,
  Layers,
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
import { MAX_CHAIN_LENGTH } from "@/lib/what-if-engine/chain";
import { getAvailableWhatIfOptions, WHAT_IF_LABELS } from "@/lib/what-if-engine/available-events";
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

function parseIds(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

export function IfPageContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event") ?? undefined;
  const routeParam = searchParams.get("route");
  const appliedParam = useMemo(() => parseIds(searchParams.get("applied")), [searchParams]);

  const answers = useDiagnosisStore((s) => s.answers);
  const storedActiveScenario = useDiagnosisStore((s) => s.activeScenarioId);
  const storedChainEventIds = useDiagnosisStore((s) => s.chainEventIds);

  const routeId: ScenarioType =
    (routeParam && VALID_ROUTES.includes(routeParam as ScenarioType)
      ? (routeParam as ScenarioType)
      : storedActiveScenario) ?? "stable";

  // The chain already applied so far — from the URL if present, otherwise
  // whatever the store last remembered for this session.
  const appliedChain = appliedParam.length > 0 ? appliedParam : storedChainEventIds;
  const atChainLimit = appliedChain.length >= MAX_CHAIN_LENGTH;

  const sourceEvent = eventId ? LIFE_EVENTS_BY_ID[eventId] : undefined;
  const options = useMemo(
    () => getAvailableWhatIfOptions(answers, appliedChain),
    [answers, appliedChain]
  );

  const buildHref = (newEventId: string) => {
    const nextChain = [...appliedChain, newEventId];
    return `/compare?route=${routeId}&events=${nextChain.join(",")}`;
  };

  return (
    <main className="flex flex-1 flex-col">
      <SyncSelectedEvent eventId={sourceEvent?.id} scenarioId={routeId} />
      <PageContainer className="flex flex-1 flex-col gap-6 py-6">
        <div className="flex items-center">
          <BackButton />
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-2xl font-bold text-neutral-800">
            🚀 もし、別の選択をしたら？
          </h1>
          <p className="text-sm leading-relaxed text-neutral-600">
            気になる選択を試して、未来の変化を見てみよう。
          </p>
          <p className="text-xs leading-relaxed text-neutral-600">
            今の選択を続けた未来から、1つだけ条件を変えて試してみます。
          </p>
          {sourceEvent && (
            <p className="text-sm font-bold text-orange-700">
              「{sourceEvent.name}」からの続きとして選べます
            </p>
          )}
          {appliedChain.length > 0 && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
              <Layers className="h-3.5 w-3.5" />
              今、試している未来：
              {appliedChain.map((id) => WHAT_IF_LABELS[id] ?? id).join(" → ")}
            </p>
          )}
        </div>

        {atChainLimit ? (
          <div className="rounded-[24px] border border-orange-100 bg-orange-50/60 p-5 text-sm leading-relaxed text-neutral-700">
            🎒 まずは3つまでの変化を重ねて試せます。試している未来を確認するか、いずれかを外してから別の選択肢を選んでみましょう。
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {options.map(({ event, deprioritized }, i) => (
              <div key={event.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <WhatIfCard
                  event={event}
                  icon={iconMap[event.id] ?? Briefcase}
                  href={buildHref(event.id)}
                  deprioritized={deprioritized}
                />
              </div>
            ))}
            <CustomWhatIfForm />
          </div>
        )}
      </PageContainer>
    </main>
  );
}
