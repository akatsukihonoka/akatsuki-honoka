import { LIFE_EVENTS_BY_ID } from "@/data/life-events";
import {
  REVERSE_PLAN_GOAL_OPTIONS,
  REVERSE_PLAN_GOAL_OPTIONS_BY_ID,
} from "@/data/reverse-plan-goals";
import { passesHardConstraints, passesHardRequiresAnyOf } from "@/lib/event-engine/conditions";
import type { DiagnosisAnswer } from "@/types/life-map";
import type { ReversePlanGoalOption } from "./types";

export type AvailableGoalOption = {
  option: ReversePlanGoalOption;
  /** True when the user hasn't shown explicit signal for this yet (mirrors the what-if picker's "deprioritized" — still choosable, just not pushed as a default). */
  deprioritized: boolean;
};

const optionIndex = new Map(REVERSE_PLAN_GOAL_OPTIONS.map((option, i) => [option.id, i]));

/**
 * Curates the goal picker for this specific user: an option is hidden only
 * when *every* one of its target events is explicitly ruled out by a hard
 * constraint (e.g. every "family_partner" target is "marriage", hidden once
 * marriageAttitude is "no") — mirroring what-if-engine/available-events.ts's
 * "hidden rather than shown disabled" rule. An option that merely lacks
 * positive signal (e.g. independence without a challenge/career answer) is
 * still offered, just sorted after the ones that do fit.
 */
export function getAvailableGoalOptions(answers: DiagnosisAnswer): AvailableGoalOption[] {
  const options = REVERSE_PLAN_GOAL_OPTIONS.filter((option) =>
    option.targetEventIds.some((eventId) => {
      const event = LIFE_EVENTS_BY_ID[eventId];
      return event && passesHardConstraints(event.hardConstraints, answers);
    })
  );

  return options
    .map((option) => ({
      option,
      deprioritized: !option.targetEventIds.some((eventId) => {
        const event = LIFE_EVENTS_BY_ID[eventId];
        return event && passesHardRequiresAnyOf(event.hardRequiresAnyOf, answers);
      }),
    }))
    .sort((a, b) => Number(a.deprioritized) - Number(b.deprioritized));
}

/** Canonicalizes a selection by catalog order, so the same *set* of chosen options always resolves identically regardless of click order. */
export function canonicalizeOptionIds(selectedOptionIds: string[]): string[] {
  return [...new Set(selectedOptionIds)]
    .filter((id) => REVERSE_PLAN_GOAL_OPTIONS_BY_ID[id])
    .sort((a, b) => (optionIndex.get(a) ?? 0) - (optionIndex.get(b) ?? 0));
}

/** The union of every selected option's direct target event ids. */
export function targetEventIdsForOptions(selectedOptionIds: string[]): Set<string> {
  const ids = new Set<string>();
  for (const optionId of selectedOptionIds) {
    const option = REVERSE_PLAN_GOAL_OPTIONS_BY_ID[optionId];
    if (!option) continue;
    for (const eventId of option.targetEventIds) ids.add(eventId);
  }
  return ids;
}

function collectWithPrerequisites(eventId: string, acc: string[], seen: Set<string>): void {
  if (seen.has(eventId)) return;
  const event = LIFE_EVENTS_BY_ID[eventId];
  if (!event) return;
  seen.add(eventId);
  for (const prerequisiteId of event.prerequisites) {
    collectWithPrerequisites(prerequisiteId, acc, seen);
  }
  acc.push(eventId);
}

/**
 * Selected goal options -> a deduplicated, dependency-ordered list of
 * required LifeEvent ids: every target event's own prerequisites (walked
 * through the existing Event Master's `prerequisites` field) appear before
 * it. Conflicts, hard constraints, and age eligibility are deliberately
 * NOT checked here — that's the job of the shared what-if-engine gates,
 * applied once per event in build-plan.ts, exactly as they are for a
 * manually-picked what-if.
 */
export function resolveRequiredEventIds(canonicalOptionIds: string[]): string[] {
  const acc: string[] = [];
  const seen = new Set<string>();
  for (const optionId of canonicalOptionIds) {
    const option = REVERSE_PLAN_GOAL_OPTIONS_BY_ID[optionId];
    if (!option) continue;
    for (const targetId of option.targetEventIds) {
      collectWithPrerequisites(targetId, acc, seen);
    }
  }
  return acc;
}
