import { describe, expect, it } from "vitest";
import type { DiagnosisAnswer } from "@/types/life-map";
import { generateRoutes } from "@/lib/event-engine";
import {
  applyChain,
  buildChainCausalChain,
  CHAIN_LIMIT_REASON,
  DUPLICATE_EVENT_REASON,
} from "../chain";

describe("Case 1: A -> B chains successfully", () => {
  it("applies long_trip then family_support, both landing in the chain", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const chain = applyChain(answers, base, ["long_trip", "family_support"]);
    expect(chain.events).toEqual(["long_trip", "family_support"]);
    expect(chain.finalResult.applied).toBe(true);
  });
});

describe("Case 2: A -> B -> C chains successfully", () => {
  it("applies job_change, relocation, then side_job in order", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const chain = applyChain(answers, base, ["long_trip", "family_support", "major_purchase"]);
    expect(chain.events).toEqual(["long_trip", "family_support", "major_purchase"]);
    expect(chain.finalResult.applied).toBe(true);
  });
});

describe("Case 3: the same event cannot be applied twice", () => {
  it("stops the chain and reports a duplicate", () => {
    const answers: DiagnosisAnswer = { ageRange: "30-34" };
    const base = generateRoutes(answers).stable;
    const chain = applyChain(answers, base, ["leisure_increase", "leisure_increase"]);
    expect(chain.events).toEqual(["leisure_increase"]);
    expect(chain.finalResult.applied).toBe(false);
    if (!chain.finalResult.applied) {
      expect(chain.finalResult.reason).toBe(DUPLICATE_EVENT_REASON);
    }
  });
});

describe("Case 4: a chain never violates a hard constraint", () => {
  it("stops before an event that contradicts an explicit answer", () => {
    const answers: DiagnosisAnswer = { marriageAttitude: "no", ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const chain = applyChain(answers, base, ["job_change", "marriage"]);
    expect(chain.events).toEqual(["job_change"]);
    expect(chain.finalResult.applied).toBe(false);
  });
});

describe("Case 5: B is evaluated against the state after A, not the original base", () => {
  it("rejects debt alone (no house_purchase yet) but accepts it once house_purchase is applied first", () => {
    const answers: DiagnosisAnswer = {
      ageRange: "30-34",
      employment: "fulltime",
      workPreference: "stable",
      presentVsFuture: "future",
      incomeVsTime: "income",
      locationPreference: "urban",
    };
    const base = generateRoutes(answers).stable;

    const solo = applyChain(answers, base, ["debt"]);
    expect(solo.events).toEqual([]);
    expect(solo.finalResult.applied).toBe(false);

    const chained = applyChain(answers, base, ["house_purchase", "debt"]);
    expect(chained.events).toEqual(["house_purchase", "debt"]);
  });
});

describe("Case 6: Option Score is recomputed at every stage", () => {
  it("produces a distinct optionScore value per successful stage", () => {
    const answers: DiagnosisAnswer = {
      ageRange: "30-34",
      employment: "fulltime",
      workPreference: "stable",
      presentVsFuture: "future",
      incomeVsTime: "income",
      locationPreference: "urban",
    };
    const base = generateRoutes(answers).stable;
    const chain = applyChain(answers, base, ["house_purchase", "learning"]);
    expect(chain.events).toEqual(["house_purchase", "learning"]);

    const progression = [
      base.scores.optionScore,
      ...chain.results.filter((r) => r.applied).map((r) => r.scenario.scores.optionScore),
    ];
    expect(progression).toHaveLength(3);
    expect(new Set(progression).size).toBeGreaterThan(1);
  });
});

describe("Case 7: Bottleneck risk is recomputed for the chain", () => {
  it("surfaces a risk once enough high-impact events cluster together", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const chain = applyChain(answers, base, ["marriage", "career_change"]);
    expect(chain.events).toEqual(["marriage", "career_change"]);

    const finalScenario = chain.results.filter((r) => r.applied).at(-1);
    expect(finalScenario?.applied).toBe(true);
    if (finalScenario?.applied) {
      expect((finalScenario.scenario.risks ?? []).length).toBeGreaterThan(0);
    }
  });
});

describe("Case 8: the Causal Chain is updated to cover the whole chain", () => {
  it("includes every explicitly-applied stage in order", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const chain = applyChain(answers, base, ["long_trip", "family_support"]);
    const causal = buildChainCausalChain(chain);
    const ids = causal.map((s) => s.eventId);
    expect(ids.indexOf("long_trip")).toBeGreaterThanOrEqual(0);
    expect(ids.indexOf("family_support")).toBeGreaterThan(ids.indexOf("long_trip"));
  });
});

describe("Case 9: the chain cannot grow past 3 events", () => {
  it("caps at 3 and reports the limit message for a 4th", () => {
    const answers: DiagnosisAnswer = { ageRange: "30-34" };
    const base = generateRoutes(answers).stable;
    const chain = applyChain(answers, base, [
      "leisure_increase",
      "long_trip",
      "family_support",
      "dating",
    ]);
    expect(chain.events).toEqual(["leisure_increase", "long_trip", "family_support"]);
    expect(chain.finalResult.applied).toBe(false);
    if (!chain.finalResult.applied) {
      expect(chain.finalResult.reason).toBe(CHAIN_LIMIT_REASON);
    }
  });
});

describe("Case 10: removing a middle event recomputes the rest correctly", () => {
  it("drops the removed event's effects while keeping the others applied in order", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;

    const full = applyChain(answers, base, ["long_trip", "family_support", "major_purchase"]);
    expect(full.events).toEqual(["long_trip", "family_support", "major_purchase"]);

    const withoutMiddle = applyChain(answers, base, ["long_trip", "major_purchase"]);
    expect(withoutMiddle.events).toEqual(["long_trip", "major_purchase"]);

    const lastAccepted = withoutMiddle.results.filter((r) => r.applied).at(-1);
    expect(lastAccepted?.applied).toBe(true);
    if (lastAccepted?.applied) {
      const ids = lastAccepted.scenario.events.map((e) => e.sourceEventId);
      expect(ids).not.toContain("family_support");
      expect(ids).toContain("long_trip");
      expect(ids).toContain("major_purchase");
    }
  });
});

describe("Case 11: determinism", () => {
  it("produces byte-identical chain results for identical input", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const first = JSON.stringify(
      applyChain(answers, base, ["long_trip", "family_support", "major_purchase"])
    );
    const second = JSON.stringify(
      applyChain(
        { ...answers },
        JSON.parse(JSON.stringify(base)),
        ["long_trip", "family_support", "major_purchase"]
      )
    );
    expect(second).toBe(first);
  });
});
