import { describe, expect, it } from "vitest";
import { LIFE_EVENTS_BY_ID } from "@/data/life-events";
import type { DiagnosisAnswer } from "@/types/life-map";
import { generateRoutes } from "@/lib/event-engine";
import { recalculateScenario } from "@/lib/what-if-engine";
import {
  buildReversePlan,
  getAvailableGoalOptions,
  isValidTargetAge,
  MAX_REVERSE_PLAN_TARGET_AGE,
  resolveRequiredEventIds,
} from "../index";
import type { ReversePlanGoal } from "../types";

function stepIds(plan: { steps: { eventId: string }[] }): string[] {
  return plan.steps.map((s) => s.eventId);
}

describe("Case 1: goal -> required events is not a naive 1:1 mapping", () => {
  it("resolves family_children to both child_birth (prerequisite) and childcare (target)", () => {
    const ids = resolveRequiredEventIds(["family_children"]);
    expect(ids).toEqual(["child_birth", "childcare"]);
  });
});

describe("Case 2: prerequisites are respected when applying the plan", () => {
  it("applies child_birth before childcare, and marks them prerequisite/target", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const goal: ReversePlanGoal = { targetAge: 30, selectedOptionIds: ["family_children"] };
    const result = buildReversePlan(answers, base, goal);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(stepIds(result.plan)).toEqual(["child_birth", "childcare"]);
    expect(result.plan.steps[0].kind).toBe("prerequisite");
    expect(result.plan.steps[1].kind).toBe("target");
  });
});

describe("Case 3: a conflicting second goal is rejected, not force-applied", () => {
  it("applies urban_move from living_urban, then rejects relocation from living_regional", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const goal: ReversePlanGoal = {
      targetAge: 30,
      selectedOptionIds: ["living_urban", "living_regional"],
    };
    const result = buildReversePlan(answers, base, goal);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(stepIds(result.plan)).toContain("urban_move");
    expect(stepIds(result.plan)).not.toContain("relocation");
    expect(result.plan.rejectedOptions.map((r) => r.optionId)).toContain("living_regional");
  });
});

describe("Case 4: an explicit marriage refusal is respected in the reverse plan", () => {
  it("never includes marriage when marriageAttitude is 'no'", () => {
    const answers: DiagnosisAnswer = { marriageAttitude: "no", ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const goal: ReversePlanGoal = { targetAge: 30, selectedOptionIds: ["family_partner"] };
    const result = buildReversePlan(answers, base, goal);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(stepIds(result.plan)).not.toContain("marriage");
    expect(result.plan.rejectedOptions.map((r) => r.optionId)).toContain("family_partner");
  });

  it("hides the family_partner goal option entirely from the picker", () => {
    const options = getAvailableGoalOptions({ marriageAttitude: "no" });
    expect(options.map((o) => o.option.id)).not.toContain("family_partner");
  });
});

describe("Case 5: an explicit children refusal is respected in the reverse plan", () => {
  it("never includes child_birth or childcare when childrenAttitude is 'no'", () => {
    const answers: DiagnosisAnswer = { childrenAttitude: "no", ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const goal: ReversePlanGoal = { targetAge: 30, selectedOptionIds: ["family_children"] };
    const result = buildReversePlan(answers, base, goal);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(stepIds(result.plan)).not.toContain("child_birth");
    expect(stepIds(result.plan)).not.toContain("childcare");
    expect(result.plan.rejectedOptions.map((r) => r.optionId)).toContain("family_children");
  });
});

describe("Case 6: targetAge must be strictly in the future", () => {
  it("rejects a targetAge at or before the current age", () => {
    const answers: DiagnosisAnswer = { ageRange: "30-34" };
    const base = generateRoutes(answers).stable;

    const atCurrentAge = buildReversePlan(answers, base, {
      targetAge: 32,
      selectedOptionIds: ["money_multiple_income"],
    });
    expect(atCurrentAge.ok).toBe(false);

    const beforeCurrentAge = buildReversePlan(answers, base, {
      targetAge: 25,
      selectedOptionIds: ["money_multiple_income"],
    });
    expect(beforeCurrentAge.ok).toBe(false);
  });
});

describe("Case 7: the reverse timeline stays in chronological (present -> future) order", () => {
  it("never places a later period before an earlier one in plan.steps", () => {
    const answers: DiagnosisAnswer = {
      ageRange: "25-29",
      desiredChanges: ["career", "income"],
      presentVsFuture: "future",
      incomeVsTime: "income",
    };
    const base = generateRoutes(answers).stable;
    const goal: ReversePlanGoal = {
      targetAge: 35,
      selectedOptionIds: ["career_broaden", "money_multiple_income"],
    };
    const result = buildReversePlan(answers, base, goal);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const periods = result.plan.steps.map((s) => s.period);
    for (let i = 1; i < periods.length; i += 1) {
      expect(periods[i]).toBeGreaterThanOrEqual(periods[i - 1]);
    }
  });
});

describe("Case 8: exactly 3 actions are always generated", () => {
  it("returns 3 actions even when the goal is already fully reached (no new steps)", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const goal: ReversePlanGoal = { targetAge: 30, selectedOptionIds: ["freedom_learning"] };

    // Pre-apply the goal's own target event, then re-run the plan against a
    // base that already contains it — forces the "already achieved" /
    // empty-steps path.
    const preApplied = recalculateScenario({ answers, baseScenario: base, selectedEventId: "learning" });
    expect(preApplied.applied).toBe(true);
    if (!preApplied.applied) return;

    const result = buildReversePlan(answers, preApplied.scenario, goal);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.plan.steps).toHaveLength(0);
    expect(result.plan.actions).toHaveLength(3);
  });

  it("returns exactly 3 actions for a goal that resolves to many required events", () => {
    const answers: DiagnosisAnswer = {
      ageRange: "25-29",
      desiredChanges: ["career", "income", "livingPlace"],
      workPreference: "stable",
      presentVsFuture: "future",
      incomeVsTime: "income",
    };
    const base = generateRoutes(answers).stable;
    const goal: ReversePlanGoal = {
      targetAge: 40,
      selectedOptionIds: ["career_broaden", "money_multiple_income", "money_own_home"],
    };
    const result = buildReversePlan(answers, base, goal);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.plan.actions).toHaveLength(3);
  });
});

describe("Case 9: actions relate back to the goal's required events", () => {
  it("has at least one action whose relatedEventIds points at a plan step", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const goal: ReversePlanGoal = { targetAge: 32, selectedOptionIds: ["money_multiple_income"] };
    const result = buildReversePlan(answers, base, goal);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.plan.steps.length).toBeGreaterThan(0);

    const stepEventIds = new Set(stepIds(result.plan));
    const related = result.plan.actions.some((a) =>
      a.relatedEventIds.some((id) => stepEventIds.has(id))
    );
    expect(related).toBe(true);
  });
});

describe("Case 10: determinism", () => {
  it("produces byte-identical plans for identical input", () => {
    const answers: DiagnosisAnswer = {
      ageRange: "25-29",
      desiredChanges: ["career", "income"],
      presentVsFuture: "future",
    };
    const goal: ReversePlanGoal = {
      targetAge: 35,
      selectedOptionIds: ["career_broaden", "money_multiple_income"],
    };
    const base = generateRoutes(answers).stable;

    const first = JSON.stringify(buildReversePlan(answers, base, goal));
    const second = JSON.stringify(
      buildReversePlan(
        { ...answers },
        JSON.parse(JSON.stringify(base)),
        JSON.parse(JSON.stringify(goal))
      )
    );
    expect(second).toBe(first);
  });
});

describe("Case 11: independence-like special events are never force-applied", () => {
  it("rejects independence without explicit challenge/career/freelance signal, but still lists it (deprioritized)", () => {
    const answers: DiagnosisAnswer = { ageRange: "30-34" };
    const base = generateRoutes(answers).stable;
    const goal: ReversePlanGoal = { targetAge: 35, selectedOptionIds: ["career_independent"] };
    const result = buildReversePlan(answers, base, goal);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(stepIds(result.plan)).not.toContain("independence");
    expect(result.plan.rejectedOptions.map((r) => r.optionId)).toContain("career_independent");

    const options = getAvailableGoalOptions(answers);
    const independenceOption = options.find((o) => o.option.id === "career_independent");
    expect(independenceOption).toBeDefined();
    expect(independenceOption?.deprioritized).toBe(true);
  });
});

describe("Case 12: a normal multi-goal plan resolves successfully end to end", () => {
  it("produces a plan with steps, a recomputed Option Score, and exactly 3 actions", () => {
    const answers: DiagnosisAnswer = {
      ageRange: "25-29",
      desiredChanges: ["career", "income"],
      workPreference: "challenge",
      workSatisfaction: 2,
      presentVsFuture: "future",
      incomeVsTime: "income",
    };
    const base = generateRoutes(answers).stable;
    const goal: ReversePlanGoal = {
      targetAge: 38,
      selectedOptionIds: ["career_broaden", "money_multiple_income"],
    };
    const result = buildReversePlan(answers, base, goal);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.plan.steps.length).toBeGreaterThan(0);
    expect(typeof result.plan.optionScoreAfter).toBe("number");
    expect(result.plan.actions).toHaveLength(3);
  });
});

describe("Case 13: targetAge is capped at the 80歳 future-exploration horizon", () => {
  it("rejects a targetAge beyond 80", () => {
    expect(isValidTargetAge(81, 27)).toBe(false);
    expect(isValidTargetAge(120, 27)).toBe(false);
  });

  it("still rejects a targetAge at or before the current age, even under 80", () => {
    expect(isValidTargetAge(27, 27)).toBe(false);
    expect(isValidTargetAge(20, 27)).toBe(false);
  });

  it("accepts exactly 80 as a valid targetAge", () => {
    expect(isValidTargetAge(MAX_REVERSE_PLAN_TARGET_AGE, 27)).toBe(true);

    const answers: DiagnosisAnswer = { ageRange: "30-34" };
    const base = generateRoutes(answers).stable;
    const goal: ReversePlanGoal = {
      targetAge: MAX_REVERSE_PLAN_TARGET_AGE,
      selectedOptionIds: ["career_broaden"],
    };
    const result = buildReversePlan(answers, base, goal);
    expect(result.ok).toBe(true);
  });

  it("rejects 81 through buildReversePlan itself, not just the standalone validator", () => {
    const answers: DiagnosisAnswer = { ageRange: "30-34" };
    const base = generateRoutes(answers).stable;
    const result = buildReversePlan(answers, base, {
      targetAge: 81,
      selectedOptionIds: ["career_broaden"],
    });
    expect(result.ok).toBe(false);
  });
});

describe("Case 14: a targetAge of 80 never fabricates events past the Event Master's real maxAge windows", () => {
  it("only ever produces steps for events the Event Master actually allows, regardless of how distant targetAge is", () => {
    const answers: DiagnosisAnswer = {
      ageRange: "20-24",
      desiredChanges: ["career", "income", "livingPlace", "freeTime"],
      workPreference: "challenge",
      marriageAttitude: "want",
      childrenAttitude: "want",
    };
    const base = generateRoutes(answers).stable;
    const goal: ReversePlanGoal = {
      targetAge: MAX_REVERSE_PLAN_TARGET_AGE,
      selectedOptionIds: [
        "career_broaden",
        "money_multiple_income",
        "living_urban",
        "family_children",
      ],
    };
    const result = buildReversePlan(answers, base, goal);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    for (const step of result.plan.steps) {
      const event = LIFE_EVENTS_BY_ID[step.eventId];
      expect(event).toBeDefined();
      expect(event?.maxAge).toBeLessThanOrEqual(45);
    }
  });
});
