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
