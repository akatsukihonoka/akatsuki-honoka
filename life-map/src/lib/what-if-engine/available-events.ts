import { LIFE_EVENTS_BY_ID } from "@/data/life-events";
import { passesHardConstraints, passesHardRequiresAnyOf } from "@/lib/event-engine/conditions";
import type { DiagnosisAnswer, LifeEvent } from "@/types/life-map";

/** The curated set of events offered as one-tap what-ifs on /if. */
export const WHAT_IF_EVENT_IDS: string[] = [
  "job_change",
  "income_increase",
  "side_job",
  "marriage",
  "child_birth",
  "relocation",
  "house_purchase",
  "independence",
];

/** "If this happened" phrasing for the picker card title (the event's own name reads more like a neutral catalog entry). */
export const WHAT_IF_LABELS: Record<string, string> = {
  job_change: "転職したら",
  income_increase: "収入の柱を増やしたら",
  side_job: "副業を始めたら",
  marriage: "結婚したら",
  child_birth: "子どもができたら",
  relocation: "地方に引っ越したら",
  house_purchase: "家を買ったら",
  independence: "独立したら",
};

export type AvailableWhatIfOption = {
  event: LifeEvent;
  /** True when the user hasn't shown explicit signal for this (e.g. independence without a challenge/career answer) — still choosable, just not pushed as a default. */
  deprioritized: boolean;
};

/**
 * Curates the what-if picker for this specific user: an event the user
 * explicitly ruled out (e.g. marriageAttitude "no") never appears — showing
 * "what if you got married?" to someone who said they don't want to would
 * be an unnatural, unselectable option, so it's hidden rather than shown
 * disabled. An event that merely lacks explicit *positive* signal (e.g.
 * independence with no challenge/career signal) is still offered — a
 * what-if is the user's own hypothetical, not the system's suggestion —
 * but sorted after the events that do fit, per "don't prioritize it".
 */
export function getAvailableWhatIfOptions(answers: DiagnosisAnswer): AvailableWhatIfOption[] {
  const options = WHAT_IF_EVENT_IDS.map((id) => LIFE_EVENTS_BY_ID[id]).filter(
    (event): event is LifeEvent => {
      if (!event) return false;
      return passesHardConstraints(event.hardConstraints, answers);
    }
  );

  return options
    .map((event) => ({
      event,
      deprioritized: !passesHardRequiresAnyOf(event.hardRequiresAnyOf, answers),
    }))
    .sort((a, b) => Number(a.deprioritized) - Number(b.deprioritized));
}
