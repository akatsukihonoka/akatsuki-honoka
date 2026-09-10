import { LIFE_EVENTS_BY_ID } from "@/data/life-events";
import { REVERSE_PLAN_GOAL_OPTIONS_BY_ID } from "@/data/reverse-plan-goals";
import type { ReversePlan } from "@/lib/reverse-plan-engine/types";
import type { CausalChainStep, WhatIfComparison } from "@/lib/what-if-engine/types";
import type { BottleneckRisk, EffectAxis, Scenario, ScenarioType, ValueProfile } from "@/types/life-map";

/**
 * Every AI input payload carries this marker so the prompt (and any human
 * reading a request log) can see at a glance that every number/event in it
 * came from the deterministic engine, not from the AI itself.
 */
export type AIInputMeta = { calculatedBy: "deterministic-engine" };

function eventName(eventId: string): string {
  return LIFE_EVENTS_BY_ID[eventId]?.name ?? eventId;
}

export type MapAIInput = AIInputMeta & {
  currentProfile: ValueProfile;
  scenarios: Array<{
    routeId: ScenarioType;
    title: string;
    summary: string;
    optionScore: number;
    valueMatch: number;
    feasibility: number;
    topEventNames: string[];
  }>;
};

/** MAP全体（3ルート）の解説に必要な最小限のデータ。 */
export function buildMapInput(valueProfile: ValueProfile, scenarios: Scenario[]): MapAIInput {
  return {
    calculatedBy: "deterministic-engine",
    currentProfile: valueProfile,
    scenarios: scenarios.map((s) => ({
      routeId: s.id,
      title: s.title,
      summary: s.summary,
      optionScore: s.scores.optionScore,
      valueMatch: s.scores.valueMatch,
      feasibility: s.scores.feasibility,
      topEventNames: s.events.slice(0, 4).map((e) => e.title),
    })),
  };
}

export type RouteAIInput = AIInputMeta & {
  currentProfile: ValueProfile;
  route: {
    routeId: ScenarioType;
    title: string;
    summary: string;
    optionScore: number;
    valueMatch: number;
    feasibility: number;
    events: Array<{ period: string; name: string; changes: string[] }>;
    risks: Array<{ period: string; message: string }>;
  };
};

/** 1つのルート詳細画面の解説に必要な最小限のデータ。 */
export function buildRouteInput(valueProfile: ValueProfile, scenario: Scenario): RouteAIInput {
  return {
    calculatedBy: "deterministic-engine",
    currentProfile: valueProfile,
    route: {
      routeId: scenario.id,
      title: scenario.title,
      summary: scenario.summary,
      optionScore: scenario.scores.optionScore,
      valueMatch: scenario.scores.valueMatch,
      feasibility: scenario.scores.feasibility,
      events: scenario.events.map((e) => ({
        period: e.period,
        name: e.title,
        changes: e.changes,
      })),
      risks: (scenario.risks ?? []).map(riskToPlain),
    },
  };
}

function riskToPlain(risk: BottleneckRisk): { period: string; message: string } {
  return { period: risk.period, message: risk.message };
}

function comparisonToPlain(comparison: WhatIfComparison) {
  return {
    optionScoreBefore: comparison.optionScoreBefore,
    optionScoreAfter: comparison.optionScoreAfter,
    changedAxes: comparison.changedAxes.map((c) => ({
      axis: c.axis as EffectAxis,
      direction: c.direction,
    })),
    addedEventNames: comparison.addedEvents.map(eventName),
    newRisks: comparison.newRisks.map(riskToPlain),
  };
}

function causalChainToPlain(steps: CausalChainStep[]) {
  return steps.map((s) => ({ eventName: s.eventName, description: s.description }));
}

export type WhatIfAIInput = AIInputMeta & {
  currentProfile: ValueProfile;
  routeId: ScenarioType;
  optionScoreBefore: number;
  optionScoreAfter: number;
  changedAxes: Array<{ axis: EffectAxis; direction: "up" | "down" | "same" }>;
  addedEventNames: string[];
  causalChain: Array<{ eventName: string; description: string }>;
  newRisks: Array<{ period: string; message: string }>;
};

/** 単一What-ifの解説に必要な最小限のデータ。 */
export function buildWhatIfInput(params: {
  valueProfile: ValueProfile;
  routeId: ScenarioType;
  comparison: WhatIfComparison;
  causalChain: CausalChainStep[];
}): WhatIfAIInput {
  const plainComparison = comparisonToPlain(params.comparison);
  return {
    calculatedBy: "deterministic-engine",
    currentProfile: params.valueProfile,
    routeId: params.routeId,
    ...plainComparison,
    causalChain: causalChainToPlain(params.causalChain),
  };
}

export type ChainAIInput = AIInputMeta & {
  currentProfile: ValueProfile;
  routeId: ScenarioType;
  appliedEventNames: string[];
  optionScoreProgression: number[];
  optionScoreBefore: number;
  optionScoreAfter: number;
  changedAxes: Array<{ axis: EffectAxis; direction: "up" | "down" | "same" }>;
  causalChain: Array<{ eventName: string; description: string }>;
  newRisks: Array<{ period: string; message: string }>;
};

/** Chain What-if（複数のもしもを重ねた結果）の解説に必要な最小限のデータ。 */
export function buildChainInput(params: {
  valueProfile: ValueProfile;
  routeId: ScenarioType;
  appliedEventIds: string[];
  optionScoreProgression: number[];
  comparison: WhatIfComparison;
  causalChain: CausalChainStep[];
}): ChainAIInput {
  const plainComparison = comparisonToPlain(params.comparison);
  return {
    calculatedBy: "deterministic-engine",
    currentProfile: params.valueProfile,
    routeId: params.routeId,
    appliedEventNames: params.appliedEventIds.map(eventName),
    optionScoreProgression: params.optionScoreProgression,
    optionScoreBefore: plainComparison.optionScoreBefore,
    optionScoreAfter: plainComparison.optionScoreAfter,
    changedAxes: plainComparison.changedAxes,
    causalChain: causalChainToPlain(params.causalChain),
    newRisks: plainComparison.newRisks,
  };
}

export type ReversePlanAIInput = AIInputMeta & {
  currentProfile: ValueProfile;
  targetAge: number;
  goalLabels: string[];
  steps: Array<{ period: string; kind: "target" | "prerequisite"; eventName: string }>;
  actions: Array<{ timeframeLabel: string; title: string }>;
  optionScoreBefore: number;
  optionScoreAfter: number;
};

/**
 * Reverse Planの解説に必要な最小限のデータ。goal.goalNote（自由記述）は
 * 意図的に一切参照しない — REVERSE_PLAN_GOAL_OPTIONS_BY_ID を経由した
 * ラベルのみを渡す。
 */
export function buildReversePlanInput(valueProfile: ValueProfile, plan: ReversePlan): ReversePlanAIInput {
  const goalLabels = plan.goal.selectedOptionIds
    .map((id) => REVERSE_PLAN_GOAL_OPTIONS_BY_ID[id]?.label)
    .filter((label): label is string => Boolean(label));

  return {
    calculatedBy: "deterministic-engine",
    currentProfile: valueProfile,
    targetAge: plan.goal.targetAge,
    goalLabels,
    steps: plan.steps.map((s) => ({
      period: s.periodLabel,
      kind: s.kind,
      eventName: s.eventName,
    })),
    actions: plan.actions.map((a) => ({ timeframeLabel: a.timeframeLabel, title: a.title })),
    optionScoreBefore: plan.optionScoreBefore,
    optionScoreAfter: plan.optionScoreAfter,
  };
}
