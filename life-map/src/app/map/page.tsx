"use client";

import { useMemo } from "react";
import Link from "next/link";
import { GitBranch, ListChecks, TimerReset } from "lucide-react";

import { PageContainer } from "@/components/common/page-container";
import { FixedBottomBar } from "@/components/common/fixed-bottom-bar";
import { DisclaimerNote } from "@/components/common/disclaimer-note";
import { ScenarioCard } from "@/components/map/scenario-card";
import { Button } from "@/components/ui/button";
import { MapInterpretationCard } from "@/components/ai/map-interpretation-card";
import { buildDiagnosisProfile, generateRoutes } from "@/lib/event-engine";
import { useDiagnosisStore } from "@/store/diagnosis-store";

export default function MapPage() {
  const answers = useDiagnosisStore((s) => s.answers);
  const scenarioMap = useMemo(() => generateRoutes(answers), [answers]);
  const scenarios = [scenarioMap.stable, scenarioMap.ideal, scenarioMap.challenge];
  const valueProfile = useMemo(() => buildDiagnosisProfile(answers).valueProfile, [answers]);

  return (
    <main className="flex flex-1 flex-col">
      <PageContainer className="flex flex-1 flex-col gap-6 py-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-2xl font-bold text-neutral-800">
            あなたの未来MAP
          </h1>
          <p className="text-sm leading-relaxed text-neutral-600">
            今のあなたから考えられる、3つの方向性を見てみましょう。評価の軸はルートごとに異なります。
          </p>
        </div>

        <MapInterpretationCard valueProfile={valueProfile} scenarios={scenarios} />

        <div className="flex flex-col gap-4">
          {scenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>

        <DisclaimerNote />
      </PageContainer>

      <FixedBottomBar className="pb-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button asChild variant="secondary" size="sm" className="h-11">
            <Link href="/if">
              <GitBranch className="h-4 w-4" />
              もしもを試す
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm" className="h-11">
            <Link href="/reverse-plan">
              <TimerReset className="h-4 w-4" />
              未来から逆算する
            </Link>
          </Button>
          <Button asChild size="sm" className="h-11">
            <Link href="/actions">
              <ListChecks className="h-4 w-4" />
              今やることを見る
            </Link>
          </Button>
        </div>
      </FixedBottomBar>
    </main>
  );
}
