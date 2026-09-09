import { LIFE_EVENTS } from "@/data/life-events";
import type { CandidateEvent, DiagnosisProfile, LifeEvent } from "@/types/life-map";
import { passesHardConstraints, passesHardRequiresAnyOf } from "./conditions";
import { computeEventScore } from "./scoring";

function withinPlanningWindow(event: LifeEvent, profile: DiagnosisProfile): boolean {
  const { ageMidpoint, planningHorizonEndAge } = profile.constraints;
  return event.maxAge >= ageMidpoint && event.minAge <= planningHorizonEndAge;
}

function isHardEligible(event: LifeEvent, profile: DiagnosisProfile): boolean {
  return (
    withinPlanningWindow(event, profile) &&
    passesHardConstraints(event.hardConstraints, profile.answers) &&
    passesHardRequiresAnyOf(event.hardRequiresAnyOf, profile.answers)
  );
}

/**
 * Diagnosis profile -> scored candidate events. Hard-excludes anything
 * outside the planning horizon, that contradicts an explicit answer, or
 * (for a few high-commitment events) lacks explicit user signal — then
 * scores everything that survives. Deterministic sort with an id-based
 * tie-break, so identical inputs always produce the identical ordering.
 */
export function generateCandidateEvents(profile: DiagnosisProfile): CandidateEvent[] {
  return LIFE_EVENTS.filter((event) => isHardEligible(event, profile))
    .map((event) => ({ event, score: computeEventScore(event, profile) }))
    .sort((a, b) => {
      if (b.score.total !== a.score.total) return b.score.total - a.score.total;
      return a.event.code.localeCompare(b.event.code);
    });
}
