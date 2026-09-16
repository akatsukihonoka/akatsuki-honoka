import { LIFE_EVENTS_BY_ID } from "@/data/life-events";
import { buildDiagnosisProfile } from "@/lib/event-engine";
import { buildAgeTimeline, getDisplayCurrentAge, type AgeTimelineNode } from "@/lib/age-timeline";
import { MAX_CHAIN_LENGTH } from "@/lib/what-if-engine/chain";
import {
  getAvailableWhatIfOptions,
  type AvailableWhatIfOption,
} from "@/lib/what-if-engine/available-events";
import type {
  CausalChainStep,
  WhatIfAccepted,
  WhatIfChain,
  WhatIfComparison,
} from "@/lib/what-if-engine/types";
import type { DiagnosisAnswer, ScenarioEvent } from "@/types/life-map";
import type { UnexpectedBranch, WorldlineBand } from "./types";

export const MAX_BRANCH_OPTIONS = 3;

export type WorldlineView = {
  chain: WhatIfChain;
  accepted: WhatIfAccepted;
  currentAge: number;
  /** Only the events that are new to this chain (explicit picks + their downstream additions), in the engine's own timeline order. */
  storyEvents: ScenarioEvent[];
  ageNodes: AgeTimelineNode[];
  causalChain: CausalChainStep[];
  comparison: WhatIfComparison;
  unexpectedBranch: UnexpectedBranch | undefined;
  /** Up to MAX_BRANCH_OPTIONS real, currently-eligible what-if events to extend the chain with — never fabricated. */
  branchOptions: AvailableWhatIfOption[];
  canBranchFurther: boolean;
};

/**
 * Assembles the "世界線" story view entirely from what the (unmodified)
 * What-if Engine / Chain What-if / Age Timeline already computed. This
 * function performs no eligibility, scoring, prerequisite, conflict,
 * hard-constraint, or age-window logic of its own — it only selects,
 * orders, and labels the given chain/accepted/comparison, and calls the
 * existing getAvailableWhatIfOptions/buildAgeTimeline for the rest.
 *
 * Callers are expected to have already branched on the "no chain" /
 * "chain rejected outright" cases (the same way compare-content.tsx
 * already does) before calling this — it assumes `accepted` and
 * `comparison` are real, successful results for `chain`.
 */
export function buildWorldlineView(params: {
  answers: DiagnosisAnswer;
  chain: WhatIfChain;
  accepted: WhatIfAccepted;
  comparison: WhatIfComparison;
  causalChain: CausalChainStep[];
}): WorldlineView {
  const { answers, chain, accepted, comparison, causalChain } = params;

  const changedIds = new Set(causalChain.map((step) => step.eventId));
  const storyEvents = accepted.scenario.events.filter(
    (event) => event.sourceEventId && changedIds.has(event.sourceEventId)
  );

  const profile = buildDiagnosisProfile(answers);
  const currentAge = getDisplayCurrentAge(profile.constraints);
  const ageNodes = buildAgeTimeline(storyEvents, currentAge);

  const explicitIds = new Set(chain.events);
  const unexpectedBranch = findUnexpectedBranch(chain.events[0], causalChain, explicitIds);

  const branchOptions = getAvailableWhatIfOptions(answers, chain.events).slice(
    0,
    MAX_BRANCH_OPTIONS
  );
  const canBranchFurther = chain.events.length < MAX_CHAIN_LENGTH;

  return {
    chain,
    accepted,
    currentAge,
    storyEvents,
    ageNodes,
    causalChain,
    comparison,
    unexpectedBranch,
    branchOptions,
    canBranchFurther,
  };
}

/**
 * A downstream addition — never one of the user's own explicit picks —
 * whose category differs from the chain's root trigger event. This is a
 * ripple effect the Event Master's own downstreamEvents graph actually
 * produced for this specific chain, surfaced (not invented) as "意外な分岐".
 * Returns undefined whenever no such cross-category addition exists.
 */
function findUnexpectedBranch(
  rootEventId: string | undefined,
  causalChain: CausalChainStep[],
  explicitIds: Set<string>
): UnexpectedBranch | undefined {
  if (!rootEventId) return undefined;
  const rootEvent = LIFE_EVENTS_BY_ID[rootEventId];
  if (!rootEvent) return undefined;

  const downstreamOnly = causalChain.filter((step) => !explicitIds.has(step.eventId));
  for (const step of downstreamOnly) {
    const event = LIFE_EVENTS_BY_ID[step.eventId];
    if (event && event.category !== rootEvent.category) {
      return {
        eventId: step.eventId,
        eventName: step.eventName,
        triggerEventName: rootEvent.name,
        description: step.description,
      };
    }
  }
  return undefined;
}

const BAND_LABELS: Record<WorldlineBand, string> = {
  current: "現在",
  near: "1〜3年後",
  mid: "3〜5年後",
  far: "5〜10年後",
  later: "10年以上先",
  horizon: "80歳までの未来の余白",
};

export function worldlineBandLabel(band: WorldlineBand): string {
  return BAND_LABELS[band];
}

/** Which relative-time band an age falls into, given the user's current age and the fixed horizon (usually 80). */
export function bandForAge(age: number, currentAge: number, endAge: number): WorldlineBand {
  if (age >= endAge) return "horizon";
  const delta = age - currentAge;
  if (delta <= 0) return "current";
  if (delta <= 3) return "near";
  if (delta <= 5) return "mid";
  if (delta <= 10) return "far";
  return "later";
}
