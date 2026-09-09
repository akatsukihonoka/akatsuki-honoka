import {
  Baby,
  Briefcase,
  Building2,
  Heart,
  Home,
  type LucideIcon,
  Rocket,
  Settings2,
  Trees,
  TrendingUp,
} from "lucide-react";

import { PageContainer } from "@/components/common/page-container";
import { BackButton } from "@/components/common/back-button";
import { WhatIfCard } from "@/components/what-if/what-if-card";
import { SyncSelectedEvent } from "@/components/what-if/sync-selected-event";
import { whatIfOptions } from "@/data/mock-what-if";
import { LIFE_EVENTS_BY_ID } from "@/data/life-events";

const iconMap: Record<string, LucideIcon> = {
  "job-change": Briefcase,
  "income-up": TrendingUp,
  "side-job": Rocket,
  marriage: Heart,
  children: Baby,
  relocate: Trees,
  "buy-house": Home,
  independence: Building2,
  custom: Settings2,
};

export default async function WhatIfPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event: eventId } = await searchParams;
  const sourceEvent = eventId ? LIFE_EVENTS_BY_ID[eventId] : undefined;

  return (
    <main className="flex flex-1 flex-col">
      <SyncSelectedEvent eventId={sourceEvent?.id} />
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
          {whatIfOptions.map((option) => (
            <WhatIfCard key={option.id} option={option} icon={iconMap[option.id]} />
          ))}
        </div>
      </PageContainer>
    </main>
  );
}
