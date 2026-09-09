import type { LifeEvent, OptionScoreBreakdown } from "@/types/life-map";

const BASELINE = 50;
const SCALE = 4;

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function sumAxis(events: LifeEvent[], axis: keyof LifeEvent["effects"]): number {
  return events.reduce((total, event) => total + event.effects[axis], 0);
}

/**
 * Option Score: "from where you are now, how wide are the choices you
 * could still make" — not a happiness score. Five axes, each normalized to
 * 0-100 around a neutral 50 baseline, driven entirely by the selected
 * events' deterministic effects.
 */
export function computeOptionScore(selected: LifeEvent[]): OptionScoreBreakdown {
  const money = sumAxis(selected, "money");
  const time = sumAxis(selected, "time");
  const career = sumAxis(selected, "career");
  const freedom = sumAxis(selected, "freedom");
  const location = sumAxis(selected, "location");
  const experience = sumAxis(selected, "experience");

  return {
    financialBuffer: clamp(BASELINE + money * SCALE),
    timeBuffer: clamp(BASELINE + time * SCALE),
    careerFlexibility: clamp(BASELINE + (career + experience * 0.5) * SCALE),
    locationFlexibility: clamp(BASELINE + (location + freedom * 0.25) * SCALE),
    lifestyleFlexibility: clamp(BASELINE + (freedom + experience * 0.5) * SCALE),
  };
}

export function averageOptionScore(breakdown: OptionScoreBreakdown): number {
  const values = Object.values(breakdown);
  return clamp(values.reduce((sum, v) => sum + v, 0) / values.length);
}
