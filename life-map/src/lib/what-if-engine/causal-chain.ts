import { dominantEffectPhrase } from "@/lib/event-engine/render";
import type { LifeEvent } from "@/types/life-map";
import type { CausalChainStep } from "./types";

/**
 * Turns the ordered chain of events this what-if added — the explicitly
 * selected one, then whatever passed downstream eligibility — into a
 * "why does this change things" narrative. Reuses the same effect-phrase
 * bank the base timeline uses, so the wording stays consistent everywhere
 * and never states an outcome as certain.
 */
export function buildCausalChain(orderedAddedEvents: LifeEvent[]): CausalChainStep[] {
  return orderedAddedEvents.map((event) => ({
    eventId: event.id,
    eventName: event.name,
    description: dominantEffectPhrase(event),
  }));
}
