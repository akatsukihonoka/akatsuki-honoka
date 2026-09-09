import { buildTimeline } from "@/lib/event-engine/timeline";
import type { DiagnosisAnswer, Scenario } from "@/types/life-map";
import { buildComparison } from "./compare";
import { recalculateScenario, toLifeEvents } from "./recalculate";
import type {
  CausalChainStep,
  WhatIfAccepted,
  WhatIfChain,
  WhatIfComparison,
  WhatIfResult,
} from "./types";

export const MAX_CHAIN_LENGTH = 3;
export const CHAIN_LIMIT_REASON = "まずは3つまでの変化を重ねて試せます。";
export const DUPLICATE_EVENT_REASON = "このイベントはすでにこの未来に含まれています。";

/** The "nothing applied yet" result: scenario unchanged, no deltas. */
function identityResult(baseScenario: Scenario): WhatIfAccepted {
  return {
    applied: true,
    routeId: baseScenario.id,
    scenario: baseScenario,
    comparison: {
      changedAxes: [],
      addedEvents: [],
      removedEvents: [],
      optionScoreBefore: baseScenario.scores.optionScore,
      optionScoreAfter: baseScenario.scores.optionScore,
      newRisks: [],
      resolvedRisks: [],
      newBranchPoints: [],
    },
    causalChain: [],
  };
}

/**
 * Applies a sequence of what-ifs one on top of the other: event[0] is
 * recalculated against baseScenario, event[1] against the *result* of
 * event[0], and so on — never against the original base again. Each stage
 * goes through the exact same recalculateScenario used for a single
 * what-if, so prerequisites/conflicts/hard constraints/age/downstream/
 * effects/Option Score/risks/branch points are all re-evaluated fresh at
 * every step. Stops (without throwing) at the first duplicate event, the
 * first rejected stage, or once MAX_CHAIN_LENGTH stages have been applied.
 */
export function applyChain(
  answers: DiagnosisAnswer,
  baseScenario: Scenario,
  eventIds: string[]
): WhatIfChain {
  const results: WhatIfResult[] = [];
  const applied: string[] = [];
  let current = baseScenario;

  for (const eventId of eventIds) {
    if (applied.length >= MAX_CHAIN_LENGTH) {
      results.push({ applied: false, reason: CHAIN_LIMIT_REASON });
      break;
    }

    if (applied.includes(eventId)) {
      results.push({ applied: false, reason: DUPLICATE_EVENT_REASON });
      break;
    }

    const result = recalculateScenario({ answers, baseScenario: current, selectedEventId: eventId });
    results.push(result);

    if (!result.applied) break;

    current = result.scenario;
    applied.push(eventId);
  }

  const finalResult: WhatIfResult = results[results.length - 1] ?? identityResult(baseScenario);

  return {
    baseScenarioId: baseScenario.id,
    events: applied,
    results,
    finalResult,
  };
}

/**
 * The whole chain's "why does this change things" narrative: each
 * successful stage's own causal chain, concatenated in the order the
 * what-ifs were applied.
 */
export function buildChainCausalChain(chain: WhatIfChain): CausalChainStep[] {
  return chain.results.flatMap((result) => (result.applied ? result.causalChain : []));
}

/**
 * The last stage that actually succeeded — distinct from finalResult,
 * which is the outcome of the last *attempted* stage and may be a
 * rejection (e.g. a 4th event over the chain limit, or a duplicate).
 * Everything the chain actually accomplished lives here.
 */
export function lastAcceptedResult(chain: WhatIfChain): WhatIfAccepted | undefined {
  for (let i = chain.results.length - 1; i >= 0; i -= 1) {
    const result = chain.results[i];
    if (result.applied) return result;
  }
  return undefined;
}

/**
 * The overall before/after: the original base scenario vs. the chain's
 * final *successful* scenario, spanning every applied stage at once —
 * distinct from each stage's own comparison (which is only that one
 * step's delta). Returns undefined when nothing in the chain ever
 * successfully applied.
 */
export function compareChainOverall(
  baseScenario: Scenario,
  chain: WhatIfChain
): WhatIfComparison | undefined {
  const accepted = lastAcceptedResult(chain);
  if (chain.events.length === 0 || !accepted) return undefined;

  const finalScenario = accepted.scenario;
  const beforeEvents = toLifeEvents(baseScenario);
  const afterEvents = toLifeEvents(finalScenario);
  const beforeIds = new Set(beforeEvents.map((e) => e.id));
  const afterIds = new Set(afterEvents.map((e) => e.id));

  return buildComparison({
    beforeEvents,
    afterEvents,
    beforeTimeline: buildTimeline(beforeEvents),
    afterTimeline: buildTimeline(afterEvents),
    addedEventIds: afterEvents.filter((e) => !beforeIds.has(e.id)).map((e) => e.id),
    removedEventIds: beforeEvents.filter((e) => !afterIds.has(e.id)).map((e) => e.id),
    optionScoreBefore: baseScenario.scores.optionScore,
    optionScoreAfter: finalScenario.scores.optionScore,
  });
}
