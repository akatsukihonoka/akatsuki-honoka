import type {
  DiagnosisProfile,
  EffectAxis,
  EventScoreBreakdown,
  LifeEvent,
} from "@/types/life-map";
import { evaluateSoftCondition } from "./conditions";

const AXES: EffectAxis[] = [
  "money",
  "time",
  "career",
  "stability",
  "family",
  "freedom",
  "location",
  "experience",
];

function computeGoalMatch(event: LifeEvent, profile: DiagnosisProfile): number {
  const { matched } = evaluateSoftCondition(event.conditions, profile.answers);
  return Math.min(matched * 3, 9);
}

function computeValueMatch(event: LifeEvent, profile: DiagnosisProfile): number {
  let dot = 0;
  for (const axis of AXES) {
    dot += event.effects[axis] * profile.valueProfile[axis];
  }
  // Scaled down so a handful of aligned axes lands in a similar range to
  // the other score components (roughly -6..+6 for a typical event).
  return Math.round(dot / 2);
}

function computeFeasibility(event: LifeEvent, profile: DiagnosisProfile): number {
  let feasibility = 6 - event.impactLevel; // lighter-touch events are easier to actually do

  const employment = profile.constraints.employment;
  if (employment === "freelance" || employment === "selfemployed") {
    if (event.category === "career" && event.effects.freedom >= 2) feasibility += 2;
  } else if (employment === "fulltime") {
    if (event.category === "career" && event.effects.stability >= 1) feasibility += 1;
  } else if (employment === "student") {
    if (["house_purchase", "debt", "independence", "career_change"].includes(event.id)) {
      feasibility -= 3;
    }
  }

  if (typeof profile.answers.workSatisfaction === "number") {
    if (profile.answers.workSatisfaction <= 2 && event.category === "career") {
      feasibility += 1; // dissatisfaction lowers the bar to actually act on a career change
    }
    if (profile.answers.workSatisfaction >= 4 && event.id === "job_change") {
      feasibility -= 2; // satisfied with the current job -> less feasible to actually leave
    }
  }

  return feasibility;
}

function computeLifeStageMatch(event: LifeEvent, profile: DiagnosisProfile): number {
  const age = profile.constraints.ageMidpoint;
  if (age < event.minAge || age > event.maxAge) return 1; // only reachable via horizon overlap
  const center = (event.minAge + event.maxAge) / 2;
  const halfWidth = Math.max((event.maxAge - event.minAge) / 2, 1);
  const distance = Math.abs(age - center);
  return distance <= halfWidth / 2 ? 3 : 2;
}

function computeConstraintConflict(event: LifeEvent, profile: DiagnosisProfile): number {
  const { mismatched } = evaluateSoftCondition(event.conditions, profile.answers);
  return mismatched * 2;
}

/**
 * Event Score = Goal Match + Value Match + Feasibility + Life Stage Match
 *             - Constraint Conflict
 *
 * Every term is a deterministic function of the event definition and the
 * diagnosis profile — same input always produces the same score.
 */
export function computeEventScore(
  event: LifeEvent,
  profile: DiagnosisProfile
): EventScoreBreakdown {
  const goalMatch = computeGoalMatch(event, profile);
  const valueMatch = computeValueMatch(event, profile);
  const feasibility = computeFeasibility(event, profile);
  const lifeStageMatch = computeLifeStageMatch(event, profile);
  const constraintConflict = computeConstraintConflict(event, profile);

  return {
    goalMatch,
    valueMatch,
    feasibility,
    lifeStageMatch,
    constraintConflict,
    total: goalMatch + valueMatch + feasibility + lifeStageMatch - constraintConflict,
  };
}
