import { mockScenarios } from "@/data/mock-scenarios";
import type { DiagnosisAnswer, Scenario, ScenarioType } from "@/types/life-map";

type Scores = Scenario["scores"];
type ScoreDelta = Partial<Record<ScenarioType, Partial<Scores>>>;

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function applyDelta(scores: Record<ScenarioType, Scores>, delta: ScoreDelta) {
  for (const type of Object.keys(delta) as ScenarioType[]) {
    const d = delta[type];
    const target = scores[type];
    if (!d || !target) continue;
    if (d.valueMatch) target.valueMatch += d.valueMatch;
    if (d.feasibility) target.feasibility += d.feasibility;
    if (d.optionScore) target.optionScore += d.optionScore;
  }
}

/**
 * Deterministic, rule-based scoring: every answer maps to a fixed point
 * delta on top of the baseline mock scores. No randomness, no ranking
 * between routes — each axis stays independently interpretable.
 */
export function generateScenarioScores(
  answers: DiagnosisAnswer
): Record<ScenarioType, Scores> {
  const scores: Record<ScenarioType, Scores> = {
    stable: { ...mockScenarios.stable.scores },
    ideal: { ...mockScenarios.ideal.scores },
    challenge: { ...mockScenarios.challenge.scores },
  };

  if (answers.workPreference === "stable") {
    applyDelta(scores, { stable: { valueMatch: 12 }, challenge: { valueMatch: -12 } });
  } else if (answers.workPreference === "challenge") {
    applyDelta(scores, { stable: { valueMatch: -8 }, challenge: { valueMatch: 12 } });
  }

  if (answers.incomeVsTime === "income") {
    applyDelta(scores, { challenge: { valueMatch: 6 }, ideal: { optionScore: 4 } });
  } else if (answers.incomeVsTime === "time") {
    applyDelta(scores, { stable: { valueMatch: 6, optionScore: 4 } });
  }

  if (answers.locationPreference === "regional") {
    applyDelta(scores, { stable: { valueMatch: 4 } });
  } else if (answers.locationPreference === "urban") {
    applyDelta(scores, { challenge: { optionScore: 4 } });
  }

  if (answers.presentVsFuture === "future") {
    applyDelta(scores, { stable: { feasibility: 6, valueMatch: 4 } });
  } else if (answers.presentVsFuture === "present") {
    applyDelta(scores, { challenge: { valueMatch: 6 }, ideal: { valueMatch: 4 } });
  }

  if (typeof answers.workSatisfaction === "number") {
    if (answers.workSatisfaction <= 2) {
      applyDelta(scores, {
        challenge: { valueMatch: 8 },
        ideal: { valueMatch: 6 },
        stable: { valueMatch: -6 },
      });
    } else if (answers.workSatisfaction >= 4) {
      applyDelta(scores, { stable: { valueMatch: 8 }, challenge: { valueMatch: -6 } });
    }
  }

  if (answers.desiredChanges && answers.desiredChanges.length > 0) {
    if (answers.desiredChanges.includes("none")) {
      applyDelta(scores, {
        stable: { feasibility: 10 },
        ideal: { optionScore: -4 },
        challenge: { optionScore: -4 },
      });
    } else {
      const bump = Math.min(answers.desiredChanges.length * 2, 16);
      applyDelta(scores, { ideal: { optionScore: bump }, challenge: { optionScore: bump } });
    }
  }

  if (answers.employment === "freelance" || answers.employment === "selfemployed") {
    applyDelta(scores, { challenge: { feasibility: 8 } });
  } else if (answers.employment === "fulltime") {
    applyDelta(scores, { stable: { feasibility: 6 } });
  }

  if (answers.ageRange === "20-24" || answers.ageRange === "25-29") {
    applyDelta(scores, { challenge: { feasibility: 4 } });
  } else if (answers.ageRange === "35-39") {
    applyDelta(scores, { stable: { feasibility: 4 } });
  }

  for (const type of Object.keys(scores) as ScenarioType[]) {
    scores[type] = {
      valueMatch: clamp(scores[type].valueMatch),
      feasibility: clamp(scores[type].feasibility),
      optionScore: clamp(scores[type].optionScore),
    };
  }

  return scores;
}

export function generateScenarios(
  answers: DiagnosisAnswer
): Record<ScenarioType, Scenario> {
  const scores = generateScenarioScores(answers);
  return {
    stable: { ...mockScenarios.stable, scores: scores.stable },
    ideal: { ...mockScenarios.ideal, scores: scores.ideal },
    challenge: { ...mockScenarios.challenge, scores: scores.challenge },
  };
}
