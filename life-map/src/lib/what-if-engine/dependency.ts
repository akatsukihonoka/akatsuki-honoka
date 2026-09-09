import { LIFE_EVENTS_BY_ID } from "@/data/life-events";
import { evaluateSoftCondition } from "@/lib/event-engine/conditions";
import type { DiagnosisProfile, LifeEvent } from "@/types/life-map";
import { passesHardEligibility } from "./apply-event";

const MAX_EXPANSION_PASSES = 50; // defensive bound; the Event Master has no cycles

/**
 * Downstream candidates are auto-added by the *system*, not chosen
 * explicitly by the user — so unlike the root what-if event, they must
 * also not directly contradict a soft condition the user actually
 * answered (e.g. don't auto-add a job change for someone who said they're
 * satisfied with their current job, even as a side effect of something
 * else they picked).
 */
function isDownstreamEligible(
  event: LifeEvent,
  currentEvents: LifeEvent[],
  profile: DiagnosisProfile
): boolean {
  const { mismatched } = evaluateSoftCondition(event.conditions, profile.answers);
  return mismatched === 0 && passesHardEligibility(event, currentEvents, profile);
}

/**
 * Walks downstreamEvents from the newly-added trigger event(s), breadth
 * first, re-evaluating every candidate's full eligibility against the
 * cumulative event set before adding it. Nothing here is added
 * unconditionally just because it's listed as a downstream effect —
 * conditions, prerequisites, conflicts, age window, and hard constraints
 * are all re-checked at the moment each candidate is considered, so an
 * event that would have been fine in isolation can still be skipped once
 * something upstream in this same what-if made it ineligible.
 */
export function expandDownstream(
  triggerEventIds: string[],
  events: LifeEvent[],
  profile: DiagnosisProfile
): { events: LifeEvent[]; added: string[] } {
  let current = events;
  const added: string[] = [];
  const visited = new Set(triggerEventIds);
  let frontier = [...triggerEventIds];
  let guard = 0;

  while (frontier.length > 0 && guard < MAX_EXPANSION_PASSES) {
    guard += 1;
    const nextFrontier: string[] = [];

    for (const triggerId of frontier) {
      const trigger = LIFE_EVENTS_BY_ID[triggerId];
      if (!trigger) continue;

      for (const downstreamId of trigger.downstreamEvents) {
        if (visited.has(downstreamId)) continue;
        visited.add(downstreamId);

        const candidate = LIFE_EVENTS_BY_ID[downstreamId];
        if (!candidate) continue;
        if (current.some((e) => e.id === downstreamId)) continue; // already in the base scenario
        if (!isDownstreamEligible(candidate, current, profile)) continue;

        current = [...current, candidate];
        added.push(downstreamId);
        nextFrontier.push(downstreamId);
      }
    }

    frontier = nextFrontier;
  }

  return { events: current, added };
}
