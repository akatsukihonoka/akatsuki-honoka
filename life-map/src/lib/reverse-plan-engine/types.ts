import type { EventCategory, PeriodBucket, ScenarioType } from "@/types/life-map";

export type ReversePlanGoalCategory = "work" | "money" | "living" | "family" | "freedom";

/** One selectable future-state option in the goal picker. */
export type ReversePlanGoalOption = {
  id: string;
  category: ReversePlanGoalCategory;
  /** Non-committal future-state phrasing shown to the user (e.g. "裁量を持って働いていたい"). */
  label: string;
  /**
   * The LifeEvent id(s) in the Event Master that most directly represent
   * this future state. Not a 1:1 mapping in general — resolveRequiredEvents
   * also walks each target's prerequisites through the existing Event
   * Master graph.
   */
  targetEventIds: string[];
};

/** What the user declared on the goal-input step. */
export type ReversePlanGoal = {
  targetAge: number;
  /** Up to 5 ReversePlanGoalOption ids, order-independent (resolution is canonicalized by catalog order). */
  selectedOptionIds: string[];
  /** Free text from "その他" — stored for display only, never used in the deterministic calculation. */
  goalNote?: string;
};

export type ReversePlanStepKind = "target" | "prerequisite";

/** One required event on the path to the goal, in chronological (present -> future) order. */
export type ReversePlanStep = {
  eventId: string;
  eventName: string;
  description: string;
  category: EventCategory;
  kind: ReversePlanStepKind;
  period: PeriodBucket;
  periodLabel: string;
};

export type ReversePlanActionTimeframe = "this_month" | "within_3_months" | "within_1_year";

export type ReversePlanAction = {
  id: string;
  timeframe: ReversePlanActionTimeframe;
  timeframeLabel: string;
  title: string;
  description: string;
  relatedEventIds: string[];
};

/** A selected goal option whose target event(s) couldn't be reached from the current answers. */
export type ReversePlanRejectedOption = {
  optionId: string;
  optionLabel: string;
  reason: string;
};

export type ReversePlan = {
  goal: ReversePlanGoal;
  routeId: ScenarioType;
  /** Present -> future chronological order; the UI reverses this for future -> present display. */
  steps: ReversePlanStep[];
  rejectedOptions: ReversePlanRejectedOption[];
  /** Always exactly 3. */
  actions: ReversePlanAction[];
  optionScoreBefore: number;
  optionScoreAfter: number;
};
