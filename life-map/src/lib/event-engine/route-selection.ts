import type {
  CandidateEvent,
  DiagnosisProfile,
  Goals,
  LifeEvent,
  ScenarioType,
} from "@/types/life-map";

type RouteWeights = {
  goalMatch: number;
  valueMatch: number;
  feasibility: number;
  lifeStageMatch: number;
  constraintConflict: number;
  /** Multiplies impactLevel: negative favors small/gentle changes, positive favors bigger ones. */
  impactBias: number;
  /** Weight on explicitGoalBonus — how much the user's *stated* goals matter for this route. */
  explicitGoal: number;
};

/**
 * How each route re-weights the same underlying Event Score components.
 * Stable leans on feasibility and avoids high-impact swings, and ignores
 * explicitly-stated goals in favor of what's easy to sustain. Ideal leans
 * hardest on matching the user's stated goals/values. Challenge leans on
 * the same goals/values but tolerates (and mildly favors) bigger,
 * option-expanding changes. None of this ranks the *routes* against each
 * other — it only orders candidates within a single route's own selection
 * pass.
 */
const ROUTE_WEIGHTS: Record<ScenarioType, RouteWeights> = {
  stable: {
    goalMatch: 0.5,
    valueMatch: 0.5,
    feasibility: 1.5,
    lifeStageMatch: 1,
    constraintConflict: 1.5,
    impactBias: -1.5,
    explicitGoal: 0,
  },
  ideal: {
    goalMatch: 1.5,
    valueMatch: 1.5,
    feasibility: 1,
    lifeStageMatch: 1,
    constraintConflict: 1,
    impactBias: 0,
    explicitGoal: 1.5,
  },
  challenge: {
    goalMatch: 1,
    valueMatch: 1,
    feasibility: 0.6,
    lifeStageMatch: 0.6,
    constraintConflict: 0.5,
    impactBias: 1.5,
    explicitGoal: 1,
  },
};

const GOAL_EVENT_IDS: Partial<Record<keyof Goals, string[]>> = {
  wantsMarriage: ["dating", "cohabitation", "marriage"],
  wantsChildren: ["child_birth", "childcare", "parental_leave", "return_to_work"],
  wantsIncomeUp: ["income_increase", "side_job", "promotion", "savings_growth"],
  wantsCareerChange: ["job_change", "career_change", "skill_up", "independence"],
  wantsMoreTime: ["leisure_increase", "sabbatical", "semi_retirement"],
  wantsLocationChange: ["relocation", "urban_move", "overseas_move", "move"],
  wantsStability: ["promotion", "house_purchase", "savings_growth"],
  wantsRelationship: ["dating", "cohabitation"],
};

/** How directly an event serves one of the user's *explicitly stated* goals. */
function explicitGoalBonus(event: LifeEvent, goals: Goals): number {
  let bonus = 0;
  for (const [goal, eventIds] of Object.entries(GOAL_EVENT_IDS) as [keyof Goals, string[]][]) {
    if (goals[goal] && eventIds.includes(event.id)) bonus += 2;
  }
  return bonus;
}

const MAX_EVENTS_PER_ROUTE = 5;

function routeWeightedScore(
  candidate: CandidateEvent,
  route: ScenarioType,
  goals: Goals
): number {
  const w = ROUTE_WEIGHTS[route];
  const s = candidate.score;
  return (
    w.goalMatch * s.goalMatch +
    w.valueMatch * s.valueMatch +
    w.feasibility * s.feasibility +
    w.lifeStageMatch * s.lifeStageMatch -
    w.constraintConflict * s.constraintConflict +
    w.impactBias * candidate.event.impactLevel +
    w.explicitGoal * explicitGoalBonus(candidate.event, goals)
  );
}

/**
 * Select this route's events out of the shared candidate pool. Greedy pass:
 * repeatedly take the highest route-weighted-scoring candidate whose
 * prerequisites are already selected and whose conflicts aren't — so
 * dependency chains (child_birth -> childcare -> ...) resolve naturally,
 * and mutually exclusive events (e.g. urban_move vs relocation) never
 * co-occur. Fully deterministic: the pool is pre-sorted with an id
 * tie-break, and this pass never branches on anything but that order.
 */
export function selectRouteEvents(
  candidates: CandidateEvent[],
  route: ScenarioType,
  profile: DiagnosisProfile
): LifeEvent[] {
  const ranked = candidates
    .map((c) => ({ candidate: c, routeScore: routeWeightedScore(c, route, profile.goals) }))
    .sort((a, b) => {
      if (b.routeScore !== a.routeScore) return b.routeScore - a.routeScore;
      return a.candidate.event.code.localeCompare(b.candidate.event.code);
    });

  const selected: LifeEvent[] = [];
  const selectedIds = new Set<string>();

  while (selected.length < MAX_EVENTS_PER_ROUTE) {
    const next = ranked.find(
      ({ candidate }) =>
        !selectedIds.has(candidate.event.id) &&
        candidate.event.prerequisites.every((p) => selectedIds.has(p)) &&
        !candidate.event.conflicts.some((c) => selectedIds.has(c))
    );
    if (!next) break;
    selected.push(next.candidate.event);
    selectedIds.add(next.candidate.event.id);
  }

  return selected;
}
