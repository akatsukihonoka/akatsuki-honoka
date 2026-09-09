import { normalizeAxisScore, sumAxisEffects } from "@/lib/event-engine/option-score";
import type { EffectAxis, LifeEvent } from "@/types/life-map";
import type { ChangedAxis } from "./types";

export const ALL_AXES: EffectAxis[] = [
  "money",
  "time",
  "career",
  "stability",
  "family",
  "freedom",
  "location",
  "experience",
];

/**
 * Every axis (not just the 5 Option Score ones), normalized with the exact
 * same baseline/scale formula Option Score uses — one calculation method,
 * reused everywhere effects need to become a comparable 0-100 number.
 */
export function computeAxisScores(events: LifeEvent[]): Record<EffectAxis, number> {
  return Object.fromEntries(
    ALL_AXES.map((axis) => [axis, normalizeAxisScore(sumAxisEffects(events, axis))])
  ) as Record<EffectAxis, number>;
}

export function diffAxisScores(
  before: Record<EffectAxis, number>,
  after: Record<EffectAxis, number>
): ChangedAxis[] {
  return ALL_AXES.map((axis) => {
    const beforeValue = before[axis];
    const afterValue = after[axis];
    const delta = afterValue - beforeValue;
    return {
      axis,
      before: beforeValue,
      after: afterValue,
      delta,
      direction: delta > 0 ? "up" : delta < 0 ? "down" : "same",
    };
  });
}
