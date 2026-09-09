import { describe, expect, it } from "vitest";
import type { DiagnosisAnswer } from "@/types/life-map";
import { LIFE_EVENTS_BY_ID } from "@/data/life-events";
import { buildDiagnosisProfile, generateRoutes } from "@/lib/event-engine";
import { expandDownstream } from "../dependency";
import { recalculateScenario } from "../recalculate";

function eventIds(events: { sourceEventId?: string }[]): string[] {
  return events.map((e) => e.sourceEventId).filter((id): id is string => !!id);
}

describe("Case 1: job_change is added", () => {
  it("adds job_change to a stable scenario that doesn't already have it", () => {
    const answers: DiagnosisAnswer = {
      ageRange: "30-34",
      employment: "fulltime",
      workSatisfaction: 5,
      workPreference: "stable",
      presentVsFuture: "future",
      incomeVsTime: "time",
    };
    const base = generateRoutes(answers).stable;
    expect(eventIds(base.events)).not.toContain("job_change");

    const result = recalculateScenario({ answers, baseScenario: base, selectedEventId: "job_change" });
    expect(result.applied).toBe(true);
    if (result.applied) {
      expect(eventIds(result.scenario.events)).toContain("job_change");
      expect(result.comparison.addedEvents).toContain("job_change");
    }
  });
});

describe("Case 2: job_change's downstream is re-evaluated, not blindly added", () => {
  it("pulls in a downstream event whose conditions fit and skips one that doesn't", () => {
    const profile = buildDiagnosisProfile({
      ageRange: "25-29",
      workSatisfaction: 5,
      presentVsFuture: "future",
      desiredChanges: ["career"],
      locationPreference: "regional", // contradicts urban_move's condition
    });
    const { added } = expandDownstream(["job_change"], [LIFE_EVENTS_BY_ID.job_change], profile);

    // skill_up wants presentVsFuture "future" + career desired -> fits
    expect(added).toContain("skill_up");
    // urban_move wants locationPreference "urban" -> directly contradicted, must not appear
    expect(added).not.toContain("urban_move");
  });
});

describe("Case 3: an existing event is never duplicated", () => {
  it("does not add a second job_change when the base scenario already has one", () => {
    const answers: DiagnosisAnswer = {
      ageRange: "25-29",
      employment: "freelance",
      workSatisfaction: 1,
      workPreference: "challenge",
      presentVsFuture: "present",
      incomeVsTime: "income",
      desiredChanges: ["career", "income"],
    };
    const base = generateRoutes(answers).challenge;
    expect(eventIds(base.events)).toContain("job_change");

    const result = recalculateScenario({ answers, baseScenario: base, selectedEventId: "job_change" });
    expect(result.applied).toBe(true);
    if (result.applied) {
      const count = eventIds(result.scenario.events).filter((id) => id === "job_change").length;
      expect(count).toBe(1);
      expect(result.comparison.addedEvents).not.toContain("job_change");
    }
  });
});

describe("Case 4: a hard-constraint violation cannot be applied", () => {
  it("rejects marriage as a what-if when the user explicitly doesn't want to marry", () => {
    const answers: DiagnosisAnswer = { marriageAttitude: "no" };
    const base = generateRoutes(answers).stable;
    const result = recalculateScenario({ answers, baseScenario: base, selectedEventId: "marriage" });
    expect(result.applied).toBe(false);
  });
});

describe("Case 5: house_purchase changes financial buffer and location flexibility", () => {
  it("lowers financialBuffer and locationFlexibility in the Option Score breakdown", () => {
    const answers: DiagnosisAnswer = {
      ageRange: "30-34",
      employment: "fulltime",
      workPreference: "stable",
      presentVsFuture: "future",
      incomeVsTime: "income",
      locationPreference: "urban",
    };
    const base = generateRoutes(answers).stable;
    const result = recalculateScenario({ answers, baseScenario: base, selectedEventId: "house_purchase" });

    expect(result.applied).toBe(true);
    if (result.applied) {
      const before = base.optionBreakdown!;
      const after = result.scenario.optionBreakdown!;
      expect(after.financialBuffer).toBeLessThan(before.financialBuffer);
      expect(after.locationFlexibility).toBeLessThan(before.locationFlexibility);
    }
  });
});

describe("Case 6: marriage's downstream is re-evaluated per answer", () => {
  it("pulls in child_birth downstream of marriage when children are wanted", () => {
    const profile = buildDiagnosisProfile({ marriageAttitude: "want", childrenAttitude: "want", ageRange: "25-29" });
    const { added } = expandDownstream(["marriage"], [LIFE_EVENTS_BY_ID.marriage], profile);
    expect(added).toContain("child_birth");
  });

  it("does not pull in child_birth downstream of marriage when children are unwanted", () => {
    const profile = buildDiagnosisProfile({ marriageAttitude: "want", childrenAttitude: "no", ageRange: "25-29" });
    const { added } = expandDownstream(["marriage"], [LIFE_EVENTS_BY_ID.marriage], profile);
    expect(added).not.toContain("child_birth");
  });
});

describe("Case 7: child_birth's downstream re-evaluates childcare / parental_leave", () => {
  it("adds both once their prerequisite (child_birth) is present", () => {
    const profile = buildDiagnosisProfile({ childrenAttitude: "want", ageRange: "25-29" });
    const { added } = expandDownstream(["child_birth"], [LIFE_EVENTS_BY_ID.child_birth], profile);
    expect(added).toContain("childcare");
    expect(added).toContain("parental_leave");
  });
});

describe("Case 8: Option Score is recomputed before/after", () => {
  it("reports optionScoreBefore/After matching the actual before/after scenarios", () => {
    const answers: DiagnosisAnswer = {
      ageRange: "30-34",
      workPreference: "stable",
      employment: "fulltime",
      presentVsFuture: "future",
      incomeVsTime: "income",
      locationPreference: "urban",
    };
    const base = generateRoutes(answers).stable;
    const result = recalculateScenario({ answers, baseScenario: base, selectedEventId: "house_purchase" });

    expect(result.applied).toBe(true);
    if (result.applied) {
      expect(result.comparison.optionScoreBefore).toBe(base.scores.optionScore);
      expect(result.comparison.optionScoreAfter).toBe(result.scenario.scores.optionScore);
      expect(result.comparison.optionScoreAfter).not.toBe(result.comparison.optionScoreBefore);
    }
  });
});

describe("Case 9: determinism", () => {
  it("produces byte-identical results for identical input", () => {
    const answers: DiagnosisAnswer = {
      ageRange: "25-29",
      workPreference: "challenge",
      workSatisfaction: 2,
      desiredChanges: ["career"],
    };
    const base = generateRoutes(answers).challenge;
    const first = JSON.stringify(
      recalculateScenario({ answers, baseScenario: base, selectedEventId: "job_change" })
    );
    const second = JSON.stringify(
      recalculateScenario({
        answers: { ...answers },
        baseScenario: JSON.parse(JSON.stringify(base)),
        selectedEventId: "job_change",
      })
    );
    expect(second).toBe(first);
  });
});

describe("Case 10 & 11: what-if is based on the currently-viewed route, never a fixed default", () => {
  it("uses Stable as the basis when baseScenario is Stable", () => {
    const answers: DiagnosisAnswer = { ageRange: "30-34" };
    const base = generateRoutes(answers).stable;
    const result = recalculateScenario({ answers, baseScenario: base, selectedEventId: "job_change" });
    expect(result.applied).toBe(true);
    if (result.applied) {
      expect(result.routeId).toBe("stable");
      expect(result.scenario.id).toBe("stable");
      expect(result.scenario.title).toBe(base.title);
    }
  });

  it("uses Challenge as the basis when baseScenario is Challenge", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).challenge;
    const result = recalculateScenario({ answers, baseScenario: base, selectedEventId: "job_change" });
    expect(result.applied).toBe(true);
    if (result.applied) {
      expect(result.routeId).toBe("challenge");
      expect(result.scenario.id).toBe("challenge");
      expect(result.scenario.title).toBe(base.title);
    }
  });
});

describe("Case 12: existing events survive a what-if", () => {
  it("keeps every base-scenario event present after applying an unrelated what-if", () => {
    const answers: DiagnosisAnswer = {
      ageRange: "30-34",
      workPreference: "stable",
      employment: "fulltime",
      presentVsFuture: "future",
    };
    const base = generateRoutes(answers).stable;
    const baseIds = eventIds(base.events);
    expect(baseIds.length).toBeGreaterThan(0);

    const result = recalculateScenario({ answers, baseScenario: base, selectedEventId: "learning" });
    expect(result.applied).toBe(true);
    if (result.applied) {
      const afterIds = new Set(eventIds(result.scenario.events));
      for (const id of baseIds) {
        expect(afterIds.has(id)).toBe(true);
      }
      expect(result.comparison.removedEvents).toHaveLength(0);
    }
  });
});
