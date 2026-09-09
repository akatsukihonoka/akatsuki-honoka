import { LIFE_EVENTS_BY_ID } from "@/data/life-events";
import { mockScenarios } from "@/data/mock-scenarios";
import { buildDiagnosisProfile, computeRouteMatchScores } from "@/lib/event-engine";
import { averageOptionScore, computeOptionScore } from "@/lib/event-engine/option-score";
import { renderScenarioEvents } from "@/lib/event-engine/render";
import { buildTimeline } from "@/lib/event-engine/timeline";
import type { LifeEvent, Scenario } from "@/types/life-map";
import { applyEvent } from "./apply-event";
import { buildComparison } from "./compare";
import { buildCausalChain } from "./causal-chain";
import { expandDownstream } from "./dependency";
import type { WhatIfInput, WhatIfResult } from "./types";

/** Scenario.events (UI-rendered) -> the underlying LifeEvent[] it came from. */
export function toLifeEvents(scenario: Scenario): LifeEvent[] {
  return scenario.events
    .map((e) => (e.sourceEventId ? LIFE_EVENTS_BY_ID[e.sourceEventId] : undefined))
    .filter((e): e is LifeEvent => e !== undefined);
}

function rebuildScenario(routeId: Scenario["id"], events: LifeEvent[], profile: ReturnType<typeof buildDiagnosisProfile>): Scenario {
  const timeline = buildTimeline(events);
  const optionBreakdown = computeOptionScore(events);
  const optionScore = averageOptionScore(optionBreakdown);
  const { valueMatch, feasibility } = computeRouteMatchScores(events, profile);
  const template = mockScenarios[routeId];

  return {
    id: routeId,
    title: template.title,
    summary: template.summary,
    focus: template.focus,
    scores: { valueMatch, feasibility, optionScore },
    events: renderScenarioEvents(routeId, timeline),
    risks: timeline.risks.length > 0 ? timeline.risks : undefined,
    optionBreakdown,
  };
}

/**
 * Full deterministic what-if pipeline: take the scenario currently being
 * viewed, apply one explicitly-chosen event on top of it (rejecting it
 * outright if it violates a hard constraint or an unmet dependency),
 * re-evaluate its downstream chain, and recompute everything —
 * event composition, Option Score, value/feasibility match, branch
 * points, and bottleneck risk — through the exact same functions
 * generateRoutes uses. No AI, no randomness: the same input always
 * produces the same WhatIfResult.
 */
export function recalculateScenario(input: WhatIfInput): WhatIfResult {
  const { answers, baseScenario, selectedEventId } = input;
  const profile = buildDiagnosisProfile(answers);
  const beforeEvents = toLifeEvents(baseScenario);

  const applied = applyEvent(beforeEvents, selectedEventId, profile);
  if (!applied.ok) {
    return { applied: false, reason: applied.reason };
  }

  const wasAlreadyPresent = beforeEvents.some((e) => e.id === selectedEventId);
  const { events: afterEvents, added: downstreamAdded } = expandDownstream(
    [selectedEventId],
    applied.events,
    profile
  );

  const addedEventIds = wasAlreadyPresent
    ? downstreamAdded
    : [selectedEventId, ...downstreamAdded];

  const beforeIds = new Set(beforeEvents.map((e) => e.id));
  const afterIds = new Set(afterEvents.map((e) => e.id));
  const removedEventIds = beforeEvents.filter((e) => !afterIds.has(e.id)).map((e) => e.id);

  const afterScenario = rebuildScenario(baseScenario.id, afterEvents, profile);

  const beforeTimeline = buildTimeline(beforeEvents);
  const afterTimeline = buildTimeline(afterEvents);

  const comparison = buildComparison({
    beforeEvents,
    afterEvents,
    beforeTimeline,
    afterTimeline,
    addedEventIds,
    removedEventIds,
    optionScoreBefore: baseScenario.scores.optionScore,
    optionScoreAfter: afterScenario.scores.optionScore,
  });

  const orderedAdded = afterTimeline.orderedEvents.filter(
    (e) => addedEventIds.includes(e.id) && !beforeIds.has(e.id)
  );
  const causalChain = buildCausalChain(orderedAdded);

  return {
    applied: true,
    routeId: baseScenario.id,
    scenario: afterScenario,
    comparison,
    causalChain,
  };
}
