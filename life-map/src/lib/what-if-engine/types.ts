import type {
  BottleneckRisk,
  DiagnosisAnswer,
  EffectAxis,
  Scenario,
  ScenarioType,
} from "@/types/life-map";

export type WhatIfInput = {
  answers: DiagnosisAnswer;
  /** The scenario currently being viewed (Stable/Ideal/Challenge) — what-if always builds on this one, never a fixed default. */
  baseScenario: Scenario;
  selectedEventId: string;
};

export type ChangedAxis = {
  axis: EffectAxis;
  before: number;
  after: number;
  delta: number;
  direction: "up" | "down" | "same";
};

/** One step in the "why does this change things" narrative shown on /compare. */
export type CausalChainStep = {
  eventId: string;
  eventName: string;
  description: string;
};

export type WhatIfComparison = {
  changedAxes: ChangedAxis[];
  addedEvents: string[];
  removedEvents: string[];
  optionScoreBefore: number;
  optionScoreAfter: number;
  newRisks: BottleneckRisk[];
  resolvedRisks: BottleneckRisk[];
  newBranchPoints: string[];
};

export type WhatIfAccepted = {
  applied: true;
  routeId: ScenarioType;
  scenario: Scenario;
  comparison: WhatIfComparison;
  causalChain: CausalChainStep[];
};

export type WhatIfRejected = {
  applied: false;
  reason: string;
};

export type WhatIfResult = WhatIfAccepted | WhatIfRejected;

/**
 * A sequence of what-ifs applied on top of one another: "if job_change,
 * then also relocation, then also side_job". Each stage is recalculated
 * from the *previous* stage's resulting scenario, not from the original
 * base every time.
 */
export type WhatIfChain = {
  baseScenarioId: ScenarioType;
  /** Event ids actually applied, in order — stops short of any event that was rejected or deduplicated. */
  events: string[];
  /** One result per attempted stage, in order (may be shorter than the requested event list if a stage was rejected). */
  results: WhatIfResult[];
  /** The last entry in results — the chain's overall outcome. */
  finalResult: WhatIfResult;
};
