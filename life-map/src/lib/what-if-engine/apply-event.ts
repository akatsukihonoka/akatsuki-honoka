import { LIFE_EVENTS_BY_ID } from "@/data/life-events";
import { passesHardConstraints, passesHardRequiresAnyOf } from "@/lib/event-engine/conditions";
import type { DiagnosisProfile, LifeEvent } from "@/types/life-map";

export type ApplyEventResult =
  | { ok: true; events: LifeEvent[] }
  | { ok: false; reason: string };

function withinPlanningWindow(event: LifeEvent, profile: DiagnosisProfile): boolean {
  const { ageMidpoint, planningHorizonEndAge } = profile.constraints;
  return event.maxAge >= ageMidpoint && event.minAge <= planningHorizonEndAge;
}

/**
 * Hard eligibility gate shared by the explicitly-selected what-if event and
 * every downstream event considered afterward: age window, hard
 * constraints, hard-required signals, prerequisites and conflicts against
 * whatever is already in the scenario. This never blocks an event just
 * because it doesn't match a *soft* preference (workSatisfaction, etc.) —
 * a what-if is an explicit "what if I did this anyway", so only explicit
 * contradictions (hard constraints, unmet dependencies) can reject it.
 */
export function passesHardEligibility(
  event: LifeEvent,
  currentEvents: LifeEvent[],
  profile: DiagnosisProfile
): boolean {
  const currentIds = new Set(currentEvents.map((e) => e.id));
  return (
    withinPlanningWindow(event, profile) &&
    passesHardConstraints(event.hardConstraints, profile.answers) &&
    passesHardRequiresAnyOf(event.hardRequiresAnyOf, profile.answers) &&
    event.prerequisites.every((p) => currentIds.has(p)) &&
    !event.conflicts.some((c) => currentIds.has(c))
  );
}

/**
 * Adds selectedEventId to the base event set. Re-selecting an event already
 * present is a no-op (never duplicated); an event that fails eligibility is
 * rejected outright rather than silently applied.
 */
export function applyEvent(
  baseEvents: LifeEvent[],
  selectedEventId: string,
  profile: DiagnosisProfile
): ApplyEventResult {
  const event = LIFE_EVENTS_BY_ID[selectedEventId];
  if (!event) {
    return { ok: false, reason: "指定された選択肢が見つかりませんでした。" };
  }

  if (baseEvents.some((e) => e.id === selectedEventId)) {
    return { ok: true, events: baseEvents };
  }

  if (!passesHardEligibility(event, baseEvents, profile)) {
    return {
      ok: false,
      reason: "この選択は、今の回答内容とは合わない可能性があるため反映できません。",
    };
  }

  return { ok: true, events: [...baseEvents, event] };
}
