"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChangedAxisTable } from "@/components/what-if/changed-axis-table";
import { OptionScoreDelta } from "@/components/what-if/option-score-delta";
import { AddedEventsList } from "@/components/what-if/added-events-list";
import { RiskBanner } from "@/components/what-if/risk-banner";
import { buildReversePlanComparison } from "@/lib/reverse-plan-engine";
import type { ReversePlan } from "@/lib/reverse-plan-engine/types";
import type { Scenario } from "@/types/life-map";

/**
 * "今のMAPと比べる": built directly from buildComparison (via
 * buildReversePlanComparison), reusing the same presentational components
 * /compare uses — not the /compare route itself, which is bound to the
 * chained-what-if engine's 3-event cap and would silently truncate a
 * reverse plan that needs more than 3 events.
 */
export function ReversePlanCompare({
  baseScenario,
  plan,
}: {
  baseScenario: Scenario;
  plan: ReversePlan;
}) {
  const [open, setOpen] = useState(false);
  const comparison = useMemo(
    () => buildReversePlanComparison(baseScenario, plan),
    [baseScenario, plan]
  );

  if (!comparison) return null;

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="secondary"
        size="lg"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="tap-bounce"
      >
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        🔮 今のMAPと比べる
      </Button>

      {open && (
        <div className="animate-fade-in-up flex flex-col gap-4">
          <OptionScoreDelta
            before={comparison.optionScoreBefore}
            after={comparison.optionScoreAfter}
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-neutral-600">🔍 何が変わった？</p>
            <ChangedAxisTable changes={comparison.changedAxes} />
          </div>
          <AddedEventsList eventIds={comparison.addedEvents} />
          {comparison.newRisks.map((risk) => (
            <RiskBanner key={`new-${risk.period}`} risk={risk} />
          ))}
        </div>
      )}
    </div>
  );
}
