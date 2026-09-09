import type { DiagnosisAnswer, EventCondition } from "@/types/life-map";

type FieldResult = "match" | "mismatch" | "unanswered" | "not-specified";

function checkEnum<T>(allowed: T[] | undefined, actual: T | undefined): FieldResult {
  if (!allowed) return "not-specified";
  if (actual === undefined) return "unanswered";
  return allowed.includes(actual) ? "match" : "mismatch";
}

function checkMax(max: number | undefined, actual: number | undefined): FieldResult {
  if (max === undefined) return "not-specified";
  if (actual === undefined) return "unanswered";
  return actual <= max ? "match" : "mismatch";
}

function checkMin(min: number | undefined, actual: number | undefined): FieldResult {
  if (min === undefined) return "not-specified";
  if (actual === undefined) return "unanswered";
  return actual >= min ? "match" : "mismatch";
}

/**
 * Multi-select fields (desiredChanges) never "contradict" an event just by
 * omission — only an actual overlap counts as a signal.
 */
function checkIncludesAny<T>(allowed: T[] | undefined, actual: T[] | undefined): FieldResult {
  if (!allowed || allowed.length === 0) return "not-specified";
  if (!actual || actual.length === 0) return "unanswered";
  return actual.some((v) => allowed.includes(v)) ? "match" : "unanswered";
}

function fieldResults(condition: EventCondition, answers: DiagnosisAnswer): FieldResult[] {
  return [
    checkEnum(condition.employment, answers.employment),
    checkMax(condition.workSatisfactionMax, answers.workSatisfaction),
    checkMin(condition.workSatisfactionMin, answers.workSatisfaction),
    checkEnum(condition.marriageAttitude, answers.marriageAttitude),
    checkEnum(condition.childrenAttitude, answers.childrenAttitude),
    checkIncludesAny(condition.desiredChangesIncludesAny, answers.desiredChanges),
    checkEnum(condition.incomeVsTime, answers.incomeVsTime),
    checkEnum(condition.locationPreference, answers.locationPreference),
    checkEnum(condition.workPreference, answers.workPreference),
    checkEnum(condition.presentVsFuture, answers.presentVsFuture),
    checkEnum(condition.ageRangeIn, answers.ageRange),
  ].filter((result) => result !== "not-specified");
}

/** Soft evaluation: how many specified keys actually matched vs. contradicted. */
export function evaluateSoftCondition(
  condition: EventCondition,
  answers: DiagnosisAnswer
): { matched: number; mismatched: number } {
  const results = fieldResults(condition, answers);
  return {
    matched: results.filter((r) => r === "match").length,
    mismatched: results.filter((r) => r === "mismatch").length,
  };
}

/** True only if every specified key is a confirmed match (used for hardRequiresAnyOf). */
export function fullyMatchesCondition(
  condition: EventCondition,
  answers: DiagnosisAnswer
): boolean {
  const results = fieldResults(condition, answers);
  return results.length > 0 && results.every((r) => r === "match");
}

/**
 * Hard gate: an event is excluded only when a specified key has a
 * *confirmed* contradiction. Unanswered questions never exclude an event —
 * only an explicit, contradicting answer does (e.g. marriageAttitude "no").
 */
export function passesHardConstraints(
  hardConstraints: EventCondition,
  answers: DiagnosisAnswer
): boolean {
  const results = fieldResults(hardConstraints, answers);
  return !results.some((r) => r === "mismatch");
}

export function passesHardRequiresAnyOf(
  requiresAnyOf: EventCondition[] | undefined,
  answers: DiagnosisAnswer
): boolean {
  if (!requiresAnyOf || requiresAnyOf.length === 0) return true;
  return requiresAnyOf.some((set) => fullyMatchesCondition(set, answers));
}
