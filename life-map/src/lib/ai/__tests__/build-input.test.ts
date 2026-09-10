import { describe, expect, it } from "vitest";
import type { DiagnosisAnswer } from "@/types/life-map";
import { buildDiagnosisProfile, generateRoutes } from "@/lib/event-engine";
import { buildReversePlan } from "@/lib/reverse-plan-engine";
import {
  buildMapInput,
  buildReversePlanInput,
  buildRouteInput,
  buildWhatIfInput,
} from "../build-input";
import { recalculateScenario } from "@/lib/what-if-engine";

const answers: DiagnosisAnswer = {
  ageRange: "25-29",
  employment: "fulltime",
  workSatisfaction: 2,
  desiredChanges: ["career", "income"],
  marriageAttitude: "someday",
};

describe("Case 1: build-input never forwards raw DiagnosisAnswer fields", () => {
  it("buildMapInput's output has no answers/ageRange/employment keys anywhere", () => {
    const profile = buildDiagnosisProfile(answers);
    const scenarios = Object.values(generateRoutes(answers));
    const input = buildMapInput(profile.valueProfile, scenarios);
    const json = JSON.stringify(input);

    expect(json).not.toContain("ageRange");
    expect(json).not.toContain("employment");
    expect(json).not.toContain("marriageAttitude");
    expect(json).not.toContain("desiredChanges");
    expect((input as Record<string, unknown>).answers).toBeUndefined();
  });

  it("buildRouteInput's output has no raw answers", () => {
    const profile = buildDiagnosisProfile(answers);
    const scenario = generateRoutes(answers).stable;
    const input = buildRouteInput(profile.valueProfile, scenario);
    const json = JSON.stringify(input);

    expect(json).not.toContain("ageRange");
    expect(json).not.toContain("workSatisfaction");
  });
});

describe("Case 2: build-input carries the deterministic-engine marker", () => {
  it("every builder's output declares calculatedBy: 'deterministic-engine'", () => {
    const profile = buildDiagnosisProfile(answers);
    const scenario = generateRoutes(answers).stable;
    const mapInput = buildMapInput(profile.valueProfile, [scenario]);
    const routeInput = buildRouteInput(profile.valueProfile, scenario);

    expect(mapInput.calculatedBy).toBe("deterministic-engine");
    expect(routeInput.calculatedBy).toBe("deterministic-engine");
  });
});

describe("Case 3: goalNote (free text) is never sent to the AI", () => {
  it("buildReversePlanInput omits goalNote even when the user typed one", () => {
    const profile = buildDiagnosisProfile(answers);
    const base = generateRoutes(answers).stable;
    const result = buildReversePlan(answers, base, {
      targetAge: 32,
      selectedOptionIds: ["money_multiple_income"],
      goalNote: "祖母の介護があるので働き方は柔軟にしたい（連絡先: 090-xxxx-xxxx）",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const input = buildReversePlanInput(profile.valueProfile, result.plan);
    const json = JSON.stringify(input);

    expect(json).not.toContain("介護");
    expect(json).not.toContain("090-xxxx-xxxx");
    expect((input as Record<string, unknown>).goalNote).toBeUndefined();
  });
});

describe("Case 4: build-input never recomputes deterministic values", () => {
  it("buildRouteInput's optionScore exactly matches the source Scenario's score, and the source is left untouched", () => {
    const profile = buildDiagnosisProfile(answers);
    const scenario = generateRoutes(answers).stable;
    const before = JSON.parse(JSON.stringify(scenario));

    const input = buildRouteInput(profile.valueProfile, scenario);

    expect(input.route.optionScore).toBe(scenario.scores.optionScore);
    expect(input.route.valueMatch).toBe(scenario.scores.valueMatch);
    expect(input.route.feasibility).toBe(scenario.scores.feasibility);
    expect(scenario).toEqual(before);
  });

  it("buildWhatIfInput's before/after scores exactly match the source comparison", () => {
    const base = generateRoutes(answers).stable;
    const result = recalculateScenario({ answers, baseScenario: base, selectedEventId: "job_change" });
    expect(result.applied).toBe(true);
    if (!result.applied) return;

    const profile = buildDiagnosisProfile(answers);
    const input = buildWhatIfInput({
      valueProfile: profile.valueProfile,
      routeId: base.id,
      comparison: result.comparison,
      causalChain: result.causalChain,
    });

    expect(input.optionScoreBefore).toBe(result.comparison.optionScoreBefore);
    expect(input.optionScoreAfter).toBe(result.comparison.optionScoreAfter);
  });
});
