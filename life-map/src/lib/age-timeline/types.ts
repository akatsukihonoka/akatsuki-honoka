import type { Constraints, ScenarioEvent } from "@/types/life-map";

/**
 * Timeline Display Layer — purely presentational. It arranges whatever the
 * (unmodified) Event Engine actually produced across an age axis running
 * from "now" to 80, and fills the stretches where no real event exists with
 * explicit "gap" nodes ("未来の余白") rather than inventing events. It never
 * decides which events exist — it only decides where to draw them.
 */
export type AgeTimelineNode =
  | { kind: "current"; age: number }
  | { kind: "event"; age: number; ageLabel: string; event: ScenarioEvent }
  | { kind: "gap"; age: number; ageLabel: string }
  | { kind: "horizon"; age: number };

/** Anything that can be anchored to an age via its underlying LifeEvent's minAge. */
export type AgeAnchorInput = {
  key: string;
  /** The Event Master id to read minAge from, e.g. ScenarioEvent.sourceEventId. */
  lifeEventId?: string;
};

export type DisplayAgeSource = Pick<Constraints, "ageMidpoint">;
