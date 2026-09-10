import { LIFE_EVENTS_BY_ID } from "@/data/life-events";
import { buildTimeline } from "@/lib/event-engine/timeline";
import { buildComparison } from "@/lib/what-if-engine/compare";
import { toLifeEvents } from "@/lib/what-if-engine/recalculate";
import type { WhatIfComparison } from "@/lib/what-if-engine/types";
import type { Scenario } from "@/types/life-map";
import type { ReversePlan } from "./types";

/**
 * Before/After for "今のMAPと比べる": reuses the exact same buildComparison
 * primitive the What-if Engine's single-event and chained-event compare
 * views use — deliberately NOT the chain engine's applyChain/`/compare`
 * route, which caps at MAX_CHAIN_LENGTH=3 events. A reverse plan can easily
 * require more than 3 events (up to 5 goal options, each with its own
 * prerequisites), and silently truncating them through the chain cap would
 * misrepresent the plan. Reconstructing "after" from the base scenario's
 * events plus the plan's own steps keeps ReversePlan itself lean (no
 * duplicated Scenario blob) while still going through the one shared
 * comparison formula.
 */
export function buildReversePlanComparison(
  baseScenario: Scenario,
  plan: ReversePlan
): WhatIfComparison | undefined {
  if (plan.steps.length === 0) return undefined;

  const beforeEvents = toLifeEvents(baseScenario);
  const beforeIds = new Set(beforeEvents.map((e) => e.id));
  const addedEvents = plan.steps
    .map((step) => LIFE_EVENTS_BY_ID[step.eventId])
    .filter((event): event is NonNullable<typeof event> => event !== undefined && !beforeIds.has(event.id));
  const afterEvents = [...beforeEvents, ...addedEvents];

  return buildComparison({
    beforeEvents,
    afterEvents,
    beforeTimeline: buildTimeline(beforeEvents),
    afterTimeline: buildTimeline(afterEvents),
    addedEventIds: addedEvents.map((e) => e.id),
    removedEventIds: [],
    optionScoreBefore: plan.optionScoreBefore,
    optionScoreAfter: plan.optionScoreAfter,
  });
}
