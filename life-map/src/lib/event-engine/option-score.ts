import type { EffectAxis, LifeEvent, OptionScoreBreakdown } from "@/types/life-map";

/**
 * Shared baseline/scale for turning summed event effects into a 0-100
 * score. Option Score and the what-if engine's per-axis before/after both
 * go through these same two functions — there is exactly one formula for
 * "effects -> normalized score" in the whole app.
 */
export const AXIS_SCORE_BASELINE = 50;
export const AXIS_SCORE_SCALE = 4;

export function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function sumAxisEffects(events: LifeEvent[], axis: EffectAxis): number {
  return events.reduce((total, event) => total + event.effects[axis], 0);
}

export function normalizeAxisScore(rawSum: number): number {
  return clamp(AXIS_SCORE_BASELINE + rawSum * AXIS_SCORE_SCALE);
}

/**
 * Option Score: "from where you are now, how wide are the choices you
 * could still make" — not a happiness score. Five axes, each normalized to
 * 0-100 around a neutral 50 baseline, driven entirely by the selected
 * events' deterministic effects.
 */
export function computeOptionScore(selected: LifeEvent[]): OptionScoreBreakdown {
  const money = sumAxisEffects(selected, "money");
  const time = sumAxisEffects(selected, "time");
  const career = sumAxisEffects(selected, "career");
  const freedom = sumAxisEffects(selected, "freedom");
  const location = sumAxisEffects(selected, "location");
  const experience = sumAxisEffects(selected, "experience");

  return {
    financialBuffer: normalizeAxisScore(money),
    timeBuffer: normalizeAxisScore(time),
    careerFlexibility: clamp(AXIS_SCORE_BASELINE + (career + experience * 0.5) * AXIS_SCORE_SCALE),
    locationFlexibility: clamp(
      AXIS_SCORE_BASELINE + (location + freedom * 0.25) * AXIS_SCORE_SCALE
    ),
    lifestyleFlexibility: clamp(
      AXIS_SCORE_BASELINE + (freedom + experience * 0.5) * AXIS_SCORE_SCALE
    ),
  };
}

export function averageOptionScore(breakdown: OptionScoreBreakdown): number {
  const values = Object.values(breakdown);
  return clamp(values.reduce((sum, v) => sum + v, 0) / values.length);
}
