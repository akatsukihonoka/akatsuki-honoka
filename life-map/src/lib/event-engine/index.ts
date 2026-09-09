import { mockScenarios } from "@/data/mock-scenarios";
import type {
  CandidateEvent,
  DiagnosisAnswer,
  DiagnosisProfile,
  LifeEvent,
  Scenario,
  ScenarioType,
} from "@/types/life-map";
import { buildDiagnosisProfile } from "./value-profile";
import { generateCandidateEvents } from "./candidates";
import { selectRouteEvents } from "./route-selection";
import { buildTimeline } from "./timeline";
import { averageOptionScore, clamp, computeOptionScore } from "./option-score";
import { renderScenarioEvents } from "./render";
import { computeEventScore } from "./scoring";

const ROUTES: ScenarioType[] = ["stable", "ideal", "challenge"];

/**
 * valueMatch / feasibility for an arbitrary event set, scored directly
 * against the diagnosis profile — the same formula generateRoutes uses for
 * each route, and what the what-if engine reuses for its before/after
 * scenarios. One calculation method, no matter which event set it's given.
 */
export function computeRouteMatchScores(
  events: LifeEvent[],
  profile: DiagnosisProfile
): { valueMatch: number; feasibility: number } {
  if (events.length === 0) return { valueMatch: 50, feasibility: 50 };

  const scores = events.map((e) => computeEventScore(e, profile));
  const avg = (key: "goalMatch" | "valueMatch" | "feasibility" | "constraintConflict") =>
    scores.reduce((sum, s) => sum + s[key], 0) / scores.length;

  return {
    valueMatch: clamp(50 + (avg("goalMatch") + avg("valueMatch")) * 3),
    feasibility: clamp(50 + (avg("feasibility") - avg("constraintConflict")) * 4),
  };
}

function buildRoute(
  route: ScenarioType,
  candidates: CandidateEvent[],
  profile: DiagnosisProfile
): Scenario {
  const selected = selectRouteEvents(candidates, route, profile);
  const timeline = buildTimeline(selected);
  const events = renderScenarioEvents(route, timeline);

  const optionBreakdown = computeOptionScore(selected);
  const optionScore = averageOptionScore(optionBreakdown);
  const { valueMatch, feasibility } = computeRouteMatchScores(selected, profile);

  const template = mockScenarios[route];

  return {
    id: route,
    title: template.title,
    summary: template.summary,
    focus: template.focus,
    scores: { valueMatch, feasibility, optionScore },
    events,
    risks: timeline.risks.length > 0 ? timeline.risks : undefined,
    optionBreakdown,
  };
}

/**
 * Full deterministic pipeline: diagnosis answers -> Value Profile ->
 * Goals/Constraints -> candidate events -> Event Score -> per-route
 * selection -> dependency/conflict resolution -> timeline -> the three
 * routes. No AI, no randomness — the same answers always produce the same
 * three Scenario objects.
 */
export function generateRoutes(answers: DiagnosisAnswer): Record<ScenarioType, Scenario> {
  const profile: DiagnosisProfile = buildDiagnosisProfile(answers);
  const candidates = generateCandidateEvents(profile);

  return Object.fromEntries(
    ROUTES.map((route) => [route, buildRoute(route, candidates, profile)])
  ) as Record<ScenarioType, Scenario>;
}

export { buildDiagnosisProfile } from "./value-profile";
export { generateCandidateEvents } from "./candidates";
export { selectRouteEvents } from "./route-selection";
export { buildTimeline, isBranchPoint, PERIOD_LABELS } from "./timeline";
export { computeOptionScore, averageOptionScore } from "./option-score";
export { renderScenarioEvents } from "./render";
export { computeEventScore } from "./scoring";
