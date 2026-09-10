import { LIFE_EVENTS_BY_ID } from "@/data/life-events";
import { REVERSE_PLAN_GOAL_OPTIONS_BY_ID } from "@/data/reverse-plan-goals";
import { buildDiagnosisProfile, PERIOD_LABELS } from "@/lib/event-engine";
import { recalculateScenario, toLifeEvents } from "@/lib/what-if-engine/recalculate";
import type { DiagnosisAnswer, PeriodBucket, Scenario } from "@/types/life-map";
import { buildReversePlanActions } from "./actions";
import {
  canonicalizeOptionIds,
  resolveRequiredEventIds,
  targetEventIdsForOptions,
} from "./resolve-events";
import type {
  ReversePlan,
  ReversePlanGoal,
  ReversePlanRejectedOption,
  ReversePlanStep,
} from "./types";

export type BuildReversePlanResult = { ok: true; plan: ReversePlan } | { ok: false; reason: string };

const NO_GOAL_SELECTED_REASON = "未来の状態を1つ以上選んでください。";
const INVALID_TARGET_AGE_REASON = "目標の年齢は、今の年齢より先に設定してください。";
const REJECTED_OPTION_REASON =
  "この未来は、今の回答内容とは合わない可能性があるため、このルートには反映できませんでした。";

/** Reused by both the engine (defense in depth) and the goal-form UI, which already limits the age selector to this same range. */
export function isValidTargetAge(targetAge: number, currentAgeMidpoint: number): boolean {
  return Number.isInteger(targetAge) && targetAge > currentAgeMidpoint;
}

function buildSteps(
  appliedEventIds: string[],
  baseEventIds: Set<string>,
  targetIds: Set<string>,
  finalScenario: Scenario
): ReversePlanStep[] {
  const newIds = new Set(appliedEventIds.filter((id) => !baseEventIds.has(id)));

  return finalScenario.events
    .filter((e) => e.sourceEventId && newIds.has(e.sourceEventId))
    .map((e) => {
      const sourceId = e.sourceEventId as string;
      const event = LIFE_EVENTS_BY_ID[sourceId];
      const periodIndex = PERIOD_LABELS.indexOf(e.period);

      return {
        eventId: sourceId,
        eventName: e.title,
        description: e.description,
        category: event?.category ?? "personal",
        kind: targetIds.has(sourceId) ? "target" : "prerequisite",
        period: (periodIndex >= 0 ? periodIndex : 0) as PeriodBucket,
        periodLabel: e.period,
      } satisfies ReversePlanStep;
    });
}

/**
 * Deterministically reverse-engineers a plan from a declared future goal:
 * resolves the goal's target events (plus their prerequisites) from the
 * existing Event Master, then applies them one at a time on top of the
 * currently-selected route using recalculateScenario — the exact same
 * eligibility/conflict/hard-constraint gate a manually-picked what-if goes
 * through, just driven automatically instead of by one explicit user pick.
 * No new scoring or eligibility logic is introduced here.
 */
export function buildReversePlan(
  answers: DiagnosisAnswer,
  baseScenario: Scenario,
  goal: ReversePlanGoal
): BuildReversePlanResult {
  const currentAgeMidpoint = buildDiagnosisProfile(answers).constraints.ageMidpoint;
  if (!isValidTargetAge(goal.targetAge, currentAgeMidpoint)) {
    return { ok: false, reason: INVALID_TARGET_AGE_REASON };
  }

  const canonicalOptionIds = canonicalizeOptionIds(goal.selectedOptionIds);
  if (canonicalOptionIds.length === 0) {
    return { ok: false, reason: NO_GOAL_SELECTED_REASON };
  }

  const targetIds = targetEventIdsForOptions(canonicalOptionIds);
  const requiredEventIds = resolveRequiredEventIds(canonicalOptionIds);
  const baseEventIds = new Set(toLifeEvents(baseScenario).map((e) => e.id));

  let current = baseScenario;
  const appliedEventIds: string[] = [];

  for (const eventId of requiredEventIds) {
    if (baseEventIds.has(eventId)) {
      appliedEventIds.push(eventId);
      continue;
    }

    const result = recalculateScenario({
      answers,
      baseScenario: current,
      selectedEventId: eventId,
    });

    if (result.applied) {
      current = result.scenario;
      appliedEventIds.push(eventId);
    }
    // Rejected events (hard constraint / conflict / unmet dependency) are
    // simply not added — the same outcome a manual what-if pick would have,
    // surfaced below per-option rather than per-event.
  }

  const appliedSet = new Set(appliedEventIds);
  const rejectedOptions: ReversePlanRejectedOption[] = [];
  for (const optionId of canonicalOptionIds) {
    const option = REVERSE_PLAN_GOAL_OPTIONS_BY_ID[optionId];
    if (!option) continue;
    const reached = option.targetEventIds.some((id) => appliedSet.has(id));
    if (!reached) {
      rejectedOptions.push({ optionId, optionLabel: option.label, reason: REJECTED_OPTION_REASON });
    }
  }

  const steps = buildSteps(appliedEventIds, baseEventIds, targetIds, current);
  const actions = buildReversePlanActions(goal, steps);

  const plan: ReversePlan = {
    goal,
    routeId: baseScenario.id,
    steps,
    rejectedOptions,
    actions,
    optionScoreBefore: baseScenario.scores.optionScore,
    optionScoreAfter: current.scores.optionScore,
  };

  return { ok: true, plan };
}
