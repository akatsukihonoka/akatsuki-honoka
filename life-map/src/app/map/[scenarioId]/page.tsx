import Link from "next/link";
import { notFound } from "next/navigation";
import { GitBranch } from "lucide-react";

import { PageContainer } from "@/components/common/page-container";
import { BackButton } from "@/components/common/back-button";
import { FixedBottomBar } from "@/components/common/fixed-bottom-bar";
import { Button } from "@/components/ui/button";
import { TimelineEventCard } from "@/components/scenario/timeline-event-card";
import { mockScenarios, scenarioMeta } from "@/data/mock-scenarios";
import type { ScenarioType } from "@/types/life-map";

const validIds: ScenarioType[] = ["stable", "ideal", "challenge"];

export function generateStaticParams() {
  return validIds.map((scenarioId) => ({ scenarioId }));
}

export default async function ScenarioDetailPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;

  if (!validIds.includes(scenarioId as ScenarioType)) {
    notFound();
  }

  const scenario = mockScenarios[scenarioId as ScenarioType];
  const meta = scenarioMeta[scenario.id];

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
          <Link href="/if">
            <GitBranch className="h-4 w-4" />
            このルートで、もしもを試す
          </Link>
        </Button>
      </FixedBottomBar>
    </main>
  );
}
