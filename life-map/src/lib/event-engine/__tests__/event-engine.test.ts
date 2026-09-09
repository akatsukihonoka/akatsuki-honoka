import { describe, expect, it } from "vitest";
import type { DiagnosisAnswer } from "@/types/life-map";
import { LIFE_EVENTS_BY_ID } from "@/data/life-events";
import { buildDiagnosisProfile } from "../value-profile";
import { generateCandidateEvents } from "../candidates";
import { selectRouteEvents } from "../route-selection";
import { generateRoutes } from "../index";

/**
 * Works for both LifeEvent[] (id is already the raw "job_change" style id)
 * and ScenarioEvent[] (id is the composite "route-job_change" key, so the
 * raw id lives in sourceEventId).
 */
function ids(events: Array<{ id: string; sourceEventId?: string }>): string[] {
  return events.map((e) => e.sourceEventId ?? e.id);
}

describe("Case 1: stability-leaning answers", () => {
  const answers: DiagnosisAnswer = {
    ageRange: "30-34",
    employment: "fulltime",
    workSatisfaction: 5,
    desiredChanges: ["stability"],
    workPreference: "stable",
    presentVsFuture: "future",
    incomeVsTime: "time",
  };

  it("surfaces stability-appropriate events for the stable route", () => {
    const routes = generateRoutes(answers);
    const stableIds = ids(routes.stable.events);
    // A satisfied, stability-seeking full-time employee should see
    // low-drama, stability-building events rather than a job change.
    expect(stableIds).not.toContain("job_change");
    expect(
      stableIds.some((id) => ["promotion", "savings_growth", "living_with_family"].includes(id))
    ).toBe(true);
  });
});

describe("Case 2: challenge-leaning answers", () => {
  const answers: DiagnosisAnswer = {
    ageRange: "25-29",
    employment: "fulltime",
    workSatisfaction: 1,
    desiredChanges: ["career", "income"],
    workPreference: "challenge",
    presentVsFuture: "present",
    incomeVsTime: "income",
  };

  it("makes skill_up / job_change likely to appear in the challenge route", () => {
    const routes = generateRoutes(answers);
    const challengeIds = ids(routes.challenge.events);
    expect(challengeIds.some((id) => ["skill_up", "job_change", "career_change"].includes(id))).toBe(
      true
    );
  });
});

describe("Case 3: marriage is desired", () => {
  it("produces marriage-related candidates", () => {
    const profile = buildDiagnosisProfile({ marriageAttitude: "want" });
    const candidates = generateCandidateEvents(profile);
    expect(candidates.some((c) => c.event.id === "marriage")).toBe(true);
  });
});

describe("Case 4: children are desired", () => {
  it("produces child_birth and its downstream chain as candidates", () => {
    const profile = buildDiagnosisProfile({
      marriageAttitude: "want",
      childrenAttitude: "want",
      ageRange: "25-29",
    });
    const candidates = generateCandidateEvents(profile);
    const candidateIds = new Set(candidates.map((c) => c.event.id));
    expect(candidateIds.has("child_birth")).toBe(true);
    // The chain exists in the master even though these need child_birth
    // selected first to actually become eligible in a route.
    expect(LIFE_EVENTS_BY_ID.childcare.prerequisites).toContain("child_birth");
    expect(LIFE_EVENTS_BY_ID.parental_leave.prerequisites).toContain("child_birth");
  });
});

describe("Case 5: house_purchase implies debt / reduced location flexibility", () => {
  it("chains debt after house_purchase once it is selected", () => {
    const profile = buildDiagnosisProfile({
      ageRange: "30-34",
      employment: "fulltime",
      workPreference: "stable",
      desiredChanges: ["livingPlace"],
      presentVsFuture: "future",
      incomeVsTime: "income",
    });
    const candidates = generateCandidateEvents(profile);
    const houseCandidate = candidates.find((c) => c.event.id === "house_purchase")!;
    const debtCandidate = candidates.find((c) => c.event.id === "debt")!;
    expect(houseCandidate).toBeDefined();
    expect(debtCandidate).toBeDefined();

    const selected = selectRouteEvents([houseCandidate, debtCandidate], "stable", profile);
    expect(ids(selected)).toEqual(["house_purchase", "debt"]);

    expect(LIFE_EVENTS_BY_ID.house_purchase.effects.location).toBeLessThan(0);
    expect(LIFE_EVENTS_BY_ID.debt.effects.location).toBeLessThan(0);
  });
});

describe("Case 6: hard constraints exclude events from candidates", () => {
  it("excludes marriage when the user explicitly does not want to marry", () => {
    const profile = buildDiagnosisProfile({ marriageAttitude: "no" });
    const candidates = generateCandidateEvents(profile);
    expect(candidates.some((c) => c.event.id === "marriage")).toBe(false);
  });

  it("excludes child_birth when the user explicitly does not want children", () => {
    const profile = buildDiagnosisProfile({ childrenAttitude: "no" });
    const candidates = generateCandidateEvents(profile);
    expect(candidates.some((c) => c.event.id === "child_birth")).toBe(false);
  });

  it("never surfaces independence without explicit signal, even for the challenge route", () => {
    const neutralAnswers: DiagnosisAnswer = {
      ageRange: "30-34",
      employment: "fulltime",
      workPreference: "stable",
      desiredChanges: ["stability"],
    };
    const profile = buildDiagnosisProfile(neutralAnswers);
    const candidates = generateCandidateEvents(profile);
    expect(candidates.some((c) => c.event.id === "independence")).toBe(false);

    const routes = generateRoutes(neutralAnswers);
    expect(ids(routes.challenge.events)).not.toContain("independence");
  });
});

describe("Case 7: determinism", () => {
  const answers: DiagnosisAnswer = {
    ageRange: "25-29",
    employment: "contract",
    workSatisfaction: 2,
    desiredChanges: ["income", "career", "livingPlace"],
    marriageAttitude: "someday",
    childrenAttitude: "either",
    incomeVsTime: "income",
    locationPreference: "urban",
    workPreference: "challenge",
    presentVsFuture: "present",
  };

  it("produces byte-identical output for the same input, every time", () => {
    const first = JSON.stringify(generateRoutes(answers));
    const second = JSON.stringify(generateRoutes({ ...answers }));
    const third = JSON.stringify(generateRoutes(JSON.parse(JSON.stringify(answers))));
    expect(second).toBe(first);
    expect(third).toBe(first);
  });
});

describe("Case 8: the three routes are never ranked against each other", () => {
  it("lets a different route lead on optionScore depending on the answers", () => {
    const stableLeaning: DiagnosisAnswer = {
      ageRange: "30-34",
      employment: "fulltime",
      workSatisfaction: 5,
      workPreference: "stable",
      presentVsFuture: "future",
      incomeVsTime: "time",
      desiredChanges: ["stability"],
    };
    const challengeLeaning: DiagnosisAnswer = {
      ageRange: "25-29",
      employment: "freelance",
      workSatisfaction: 1,
      workPreference: "challenge",
      presentVsFuture: "present",
      incomeVsTime: "income",
      desiredChanges: ["career", "income", "workLocation"],
      locationPreference: "urban",
    };

    const topRoute = (answers: DiagnosisAnswer) => {
      const routes = generateRoutes(answers);
      const entries = Object.entries(routes) as [string, { scores: { optionScore: number } }][];
      return entries.sort((a, b) => b[1].scores.optionScore - a[1].scores.optionScore)[0][0];
    };

    // No route is statically "first" — which one comes out ahead is purely
    // a function of the answers, not a baked-in priority order.
    expect(topRoute(stableLeaning)).not.toBe(topRoute(challengeLeaning));
  });

  it("never attaches a rank/label field to a Scenario", () => {
    const routes = generateRoutes({});
    for (const scenario of Object.values(routes)) {
      expect(scenario).not.toHaveProperty("rank");
      expect(scenario).not.toHaveProperty("recommended");
    }
  });
});
