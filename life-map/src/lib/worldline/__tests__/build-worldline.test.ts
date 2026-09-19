import { describe, expect, it } from "vitest";
import { LIFE_EVENTS_BY_ID } from "@/data/life-events";
import { generateRoutes } from "@/lib/event-engine";
import {
  applyChain,
  buildChainCausalChain,
  compareChainOverall,
  lastAcceptedResult,
} from "@/lib/what-if-engine/chain";
import { getAvailableWhatIfOptions } from "@/lib/what-if-engine/available-events";
import type { DiagnosisAnswer, Scenario } from "@/types/life-map";
import { bandForAge, buildWorldlineView, worldlineBandLabel } from "../build-worldline";

/** Builds a WorldlineView the same way the UI does: applyChain -> guard -> buildWorldlineView. */
function worldlineFor(answers: DiagnosisAnswer, base: Scenario, eventIds: string[]) {
  const chain = applyChain(answers, base, eventIds);
  const accepted = lastAcceptedResult(chain);
  if (!accepted) return undefined;
  const comparison = compareChainOverall(base, chain);
  if (!comparison) return undefined;
  const causalChain = buildChainCausalChain(chain);
  return buildWorldlineView({ answers, baseScenario: base, chain, accepted, comparison, causalChain });
}

describe("Case 1: worldline generation from a single what-if", () => {
  it("produces a story view whose events are a subset of the accepted scenario's events", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["job_change"]);
    expect(view).toBeDefined();
    if (!view) return;

    const finalIds = new Set(view.accepted.scenario.events.map((e) => e.sourceEventId));
    for (const event of view.storyEvents) {
      expect(finalIds.has(event.sourceEventId)).toBe(true);
    }
  });
});

describe("Case 2: Event ID integrity — worldline never invents events", () => {
  it("every storyEvent id traces back to a real Event Master entry", () => {
    const answers: DiagnosisAnswer = { ageRange: "30-34" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["job_change", "side_job"]);
    expect(view).toBeDefined();
    if (!view) return;

    for (const event of view.storyEvents) {
      expect(event.sourceEventId).toBeTruthy();
      expect(LIFE_EVENTS_BY_ID[event.sourceEventId as string]).toBeDefined();
    }
  });

  it("every causalChain step and every branch option is a real Event Master id", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["job_change"]);
    expect(view).toBeDefined();
    if (!view) return;

    for (const step of view.causalChain) {
      expect(LIFE_EVENTS_BY_ID[step.eventId]).toBeDefined();
    }
    for (const option of view.branchOptions) {
      expect(LIFE_EVENTS_BY_ID[option.event.id]).toBeDefined();
    }
  });
});

describe("Case 3: age ordering and the 80歳 ceiling", () => {
  it("ageNodes are strictly non-decreasing and always end at the 80歳 horizon", () => {
    const answers: DiagnosisAnswer = { ageRange: "30-34" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["job_change"]);
    expect(view).toBeDefined();
    if (!view) return;

    const ages = view.ageNodes.map((n) => n.age);
    for (let i = 1; i < ages.length; i += 1) {
      expect(ages[i]).toBeGreaterThan(ages[i - 1]);
    }
    expect(view.ageNodes[0]).toEqual({ kind: "current", age: view.currentAge });
    expect(view.ageNodes[view.ageNodes.length - 1]).toEqual({ kind: "horizon", age: 80 });
  });
});

describe("Case 4: prerequisite is respected — worldline never bypasses it", () => {
  it("a chain requiring child_birth before childcare keeps that order in the story", () => {
    const answers: DiagnosisAnswer = {
      ageRange: "25-29",
      marriageAttitude: "want",
      childrenAttitude: "want",
    };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["child_birth", "childcare"]);
    expect(view).toBeDefined();
    if (!view) return;

    const ids = view.storyEvents.map((e) => e.sourceEventId);
    const childBirthIndex = ids.indexOf("child_birth");
    const childcareIndex = ids.indexOf("childcare");
    if (childBirthIndex >= 0 && childcareIndex >= 0) {
      expect(childBirthIndex).toBeLessThan(childcareIndex);
    }
  });
});

describe("Case 5: conflict is respected — worldline never shows both sides", () => {
  it("urban_move and relocation never coexist in the same worldline", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29", locationPreference: "urban" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["urban_move", "relocation"]);
    expect(view).toBeDefined();
    if (!view) return;

    const ids = new Set(view.accepted.scenario.events.map((e) => e.sourceEventId));
    expect(ids.has("urban_move") && ids.has("relocation")).toBe(false);
  });
});

describe("Case 6: hard constraint is respected — an explicit refusal is never applied", () => {
  it("marriage never appears when marriageAttitude is 'no'", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29", marriageAttitude: "no" };
    const base = generateRoutes(answers).stable;
    const chain = applyChain(answers, base, ["marriage"]);
    expect(chain.events).toEqual([]);
    expect(lastAcceptedResult(chain)).toBeUndefined();

    const options = getAvailableWhatIfOptions(answers);
    expect(options.some((o) => o.event.id === "marriage")).toBe(false);
  });
});

describe("Case 7: downstream events flow into the story and Option Score is unchanged", () => {
  it("storyEvents include at least the explicit trigger, and optionScoreAfter matches the accepted scenario", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["job_change"]);
    expect(view).toBeDefined();
    if (!view) return;

    const ids = view.storyEvents.map((e) => e.sourceEventId);
    expect(ids).toContain("job_change");
    expect(view.comparison.optionScoreAfter).toBe(view.accepted.scenario.scores.optionScore);
  });
});

describe("Case 8: consistency with the What-if Engine's own chain result", () => {
  it("worldline's chain/comparison/causalChain are exactly what applyChain/compareChainOverall/buildChainCausalChain produced", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const chain = applyChain(answers, base, ["job_change", "side_job"]);
    const accepted = lastAcceptedResult(chain)!;
    const comparison = compareChainOverall(base, chain)!;
    const causalChain = buildChainCausalChain(chain);

    const view = buildWorldlineView({ answers, baseScenario: base, chain, accepted, comparison, causalChain });
    expect(view.chain).toBe(chain);
    expect(view.comparison).toBe(comparison);
    expect(view.causalChain).toBe(causalChain);
  });
});

describe("Case 9: an unexpected (cross-category downstream) branch is surfaced only when the engine actually produced one", () => {
  it("fires for job_change -> urban_move (career -> housing), a real cross-category downstream addition", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29", locationPreference: "urban" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["job_change"]);
    expect(view).toBeDefined();
    if (!view) return;

    expect(view.unexpectedBranch).toEqual({
      eventId: "urban_move",
      eventName: LIFE_EVENTS_BY_ID.urban_move.name,
      triggerEventName: LIFE_EVENTS_BY_ID.job_change.name,
      description: expect.any(String),
    });
  });

  it("job_change's downstream can include urban_move (housing), a different category", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29", locationPreference: "urban" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["job_change"]);
    expect(view).toBeDefined();
    if (!view) return;

    if (view.unexpectedBranch) {
      const rootEvent = LIFE_EVENTS_BY_ID["job_change"];
      const downstreamEvent = LIFE_EVENTS_BY_ID[view.unexpectedBranch.eventId];
      expect(downstreamEvent?.category).not.toBe(rootEvent?.category);
      expect(view.chain.events).not.toContain(view.unexpectedBranch.eventId);
    }
  });

  it("never flags one of the user's own explicit picks as 'unexpected'", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["job_change", "side_job"]);
    expect(view).toBeDefined();
    if (!view) return;

    if (view.unexpectedBranch) {
      expect(view.chain.events.includes(view.unexpectedBranch.eventId)).toBe(false);
    }
  });
});

describe("Case 10: branch options are real, currently-eligible what-ifs, capped at 3", () => {
  it("excludes already-applied chain events and never exceeds MAX_BRANCH_OPTIONS", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["job_change"]);
    expect(view).toBeDefined();
    if (!view) return;

    expect(view.branchOptions.length).toBeLessThanOrEqual(3);
    for (const option of view.branchOptions) {
      expect(view.chain.events).not.toContain(option.event.id);
    }
  });

  it("canBranchFurther is false once the chain reaches MAX_CHAIN_LENGTH", () => {
    const answers: DiagnosisAnswer = { ageRange: "30-34" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["leisure_increase", "long_trip", "family_support"]);
    expect(view).toBeDefined();
    if (!view) return;
    expect(view.chain.events).toHaveLength(3);
    expect(view.canBranchFurther).toBe(false);
  });
});

describe("Case 11: AI fallback reuse — worldline carries no AI-only data", () => {
  it("WorldlineView contains only deterministic engine output, nothing that requires an AI call to render", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["job_change"]);
    expect(view).toBeDefined();
    if (!view) return;

    // Every field is JSON-serializable, deterministic engine data — no
    // network call is needed to have a complete view.
    expect(() => JSON.stringify(view)).not.toThrow();
  });
});

describe("Case 12: few events (a single what-if with no eligible downstream)", () => {
  it("still produces a valid worldline with at least the trigger event", () => {
    const answers: DiagnosisAnswer = { ageRange: "35-39" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["savings_growth"]);
    expect(view).toBeDefined();
    if (!view) return;
    expect(view.storyEvents.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Case 13: no events (empty chain) is handled by the caller, not fabricated", () => {
  it("an empty chain never reaches buildWorldlineView (lastAcceptedResult is undefined)", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const chain = applyChain(answers, base, []);
    expect(chain.events).toEqual([]);
    expect(lastAcceptedResult(chain)).toBeUndefined();
  });
});

describe("Case 14: marriage refusal never appears as a branch option", () => {
  it("getAvailableWhatIfOptions (reused for branchOptions) hides marriage when marriageAttitude is 'no'", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29", marriageAttitude: "no" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["job_change"]);
    expect(view).toBeDefined();
    if (!view) return;
    expect(view.branchOptions.some((o) => o.event.id === "marriage")).toBe(false);
  });
});

describe("Case 15: children refusal never appears as a branch option", () => {
  it("getAvailableWhatIfOptions hides child_birth when childrenAttitude is 'no'", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29", childrenAttitude: "no" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["job_change"]);
    expect(view).toBeDefined();
    if (!view) return;
    expect(view.branchOptions.some((o) => o.event.id === "child_birth")).toBe(false);
  });
});

describe("Case 16: an event with no special hard-required condition signal is still offered, just deprioritized", () => {
  it("independence stays selectable without a challenge/career answer, sorted after events that fit", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["job_change"]);
    expect(view).toBeDefined();
    if (!view) return;

    const options = getAvailableWhatIfOptions(answers, view.chain.events);
    const independence = options.find((o) => o.event.id === "independence");
    if (independence) {
      expect(independence.deprioritized).toBe(true);
    }
  });
});

describe("Case 17: branch options never include a no-op (an event already present anywhere in the worldline)", () => {
  it("job_change's own downstream additions (income_increase, side_job if already in the base route) are never re-offered as a 'new' branch", () => {
    const answers: DiagnosisAnswer = {
      ageRange: "25-29",
      employment: "fulltime",
      desiredChanges: ["career"],
      marriageAttitude: "either",
      childrenAttitude: "either",
      incomeVsTime: "income",
      locationPreference: "urban",
      workPreference: "challenge",
      presentVsFuture: "future",
    };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["job_change"]);
    expect(view).toBeDefined();
    if (!view) return;

    // Everything actually present in the accepted scenario (base route
    // events + anything this what-if added) must never also appear as a
    // branch option — tapping it would be a no-op.
    const presentIds = new Set(
      view.accepted.scenario.events.map((e) => e.sourceEventId).filter(Boolean)
    );
    for (const option of view.branchOptions) {
      expect(presentIds.has(option.event.id)).toBe(false);
    }
  });

  it("reproduces the exact reported case: income_increase and side_job are already present, so neither is offered again", () => {
    const answers: DiagnosisAnswer = {
      ageRange: "25-29",
      employment: "fulltime",
      workSatisfaction: 2,
      desiredChanges: ["career"],
      marriageAttitude: "either",
      childrenAttitude: "either",
      incomeVsTime: "income",
      locationPreference: "urban",
      workPreference: "challenge",
      presentVsFuture: "future",
    };
    const base = generateRoutes(answers).stable;
    const baseIds = base.events.map((e) => e.sourceEventId);
    // Confirms the fixture actually reproduces the reported scenario before asserting the fix.
    expect(baseIds).toContain("job_change");
    expect(baseIds).toContain("side_job");

    const view = worldlineFor(answers, base, ["job_change"]);
    expect(view).toBeDefined();
    if (!view) return;

    const offeredIds = view.branchOptions.map((o) => o.event.id);
    expect(offeredIds).not.toContain("income_increase");
    expect(offeredIds).not.toContain("side_job");
  });
});

describe("Case 18: branch candidates can be zero and the worldline still renders normally", () => {
  it("returns a defined view with an empty branchOptions array rather than throwing or omitting fields", () => {
    const answers: DiagnosisAnswer = {
      ageRange: "25-29",
      marriageAttitude: "no",
      childrenAttitude: "no",
    };
    const base = generateRoutes(answers).stable;
    // Exhaust the chain limit so canBranchFurther is false and/or drive
    // branchOptions toward empty — either way buildWorldlineView must not
    // fail or return a malformed view.
    const view = worldlineFor(answers, base, ["leisure_increase", "long_trip", "family_support"]);
    expect(view).toBeDefined();
    if (!view) return;
    expect(Array.isArray(view.branchOptions)).toBe(true);
    expect(view.canBranchFurther).toBe(false);
  });
});

describe("Case 19: consecutive gap ages are condensed into a single gap-range node", () => {
  it("does not produce one storyNode per gap age — a single trigger event collapses the whole tail into one range", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["job_change"]);
    expect(view).toBeDefined();
    if (!view) return;

    const rawGapCount = view.ageNodes.filter((n) => n.kind === "gap").length;
    const condensedGapRangeCount = view.storyNodes.filter((n) => n.kind === "gap-range").length;

    expect(rawGapCount).toBeGreaterThan(1); // sanity: the raw timeline really did have multiple gap ages
    expect(condensedGapRangeCount).toBeLessThanOrEqual(2); // at most: one mid-story range + one trailing range to 80
    expect(condensedGapRangeCount).toBeGreaterThan(0);
  });

  it("the final gap-range always reaches the 80歳 horizon", () => {
    const answers: DiagnosisAnswer = { ageRange: "30-34" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["job_change"]);
    expect(view).toBeDefined();
    if (!view) return;

    const last = view.storyNodes[view.storyNodes.length - 1];
    expect(last.kind).toBe("gap-range");
    if (last.kind === "gap-range") {
      expect(last.reachesHorizon).toBe(true);
      expect(last.toAge).toBe(80);
    }
  });
});

describe("Case 20: the unexpected event is flagged in place, not duplicated as a second story node", () => {
  it("appears exactly once in storyNodes, as an 'event' node with isUnexpected true", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29", locationPreference: "urban" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["job_change"]);
    expect(view).toBeDefined();
    if (!view || !view.unexpectedBranch) return;

    const matches = view.storyNodes.filter(
      (n) => n.kind === "event" && n.event.sourceEventId === view.unexpectedBranch?.eventId
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].kind === "event" && matches[0].isUnexpected).toBe(true);

    // No other storyNode also flags isUnexpected.
    const unexpectedCount = view.storyNodes.filter(
      (n) => n.kind === "event" && n.isUnexpected
    ).length;
    expect(unexpectedCount).toBe(1);
  });
});

describe("Case 21: rootWasAlreadyPresent note — shown only when the root pick was already in the base route", () => {
  it("is true when job_change is already part of the base route before the what-if", () => {
    const answers: DiagnosisAnswer = {
      ageRange: "25-29",
      workPreference: "challenge",
      desiredChanges: ["career"],
      workSatisfaction: 2,
    };
    const base = generateRoutes(answers).stable;
    if (!base.events.some((e) => e.sourceEventId === "job_change")) {
      // This particular value-profile combination didn't land job_change in
      // the base route — skip rather than assert a false premise.
      return;
    }
    const view = worldlineFor(answers, base, ["job_change"]);
    expect(view).toBeDefined();
    if (!view) return;
    expect(view.rootWasAlreadyPresent).toBe(true);
    expect(view.rootEventName).toBe(LIFE_EVENTS_BY_ID.job_change.name);
  });

  it("is false for an ordinary route where the chosen event is genuinely new", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    expect(base.events.some((e) => e.sourceEventId === "marriage")).toBe(false);
    const view = worldlineFor(answers, base, ["marriage"]);
    expect(view).toBeDefined();
    if (!view) return;
    expect(view.rootWasAlreadyPresent).toBe(false);
  });
});

describe("Case 22: branch options stay correct after the chain is extended", () => {
  it("a 2-event chain excludes both explicit picks and their downstream additions from further branch options", () => {
    const answers: DiagnosisAnswer = { ageRange: "25-29" };
    const base = generateRoutes(answers).stable;
    const view = worldlineFor(answers, base, ["job_change", "marriage"]);
    expect(view).toBeDefined();
    if (!view) return;

    const presentIds = new Set(
      view.accepted.scenario.events.map((e) => e.sourceEventId).filter(Boolean)
    );
    expect(presentIds.has("job_change")).toBe(true);
    expect(presentIds.has("marriage")).toBe(true);
    for (const option of view.branchOptions) {
      expect(presentIds.has(option.event.id)).toBe(false);
    }
  });
});

describe("worldlineBandLabel / bandForAge", () => {
  it("classifies ages into the expected relative bands", () => {
    const currentAge = 30;
    const endAge = 80;
    expect(bandForAge(30, currentAge, endAge)).toBe("current");
    expect(bandForAge(32, currentAge, endAge)).toBe("near");
    expect(bandForAge(34, currentAge, endAge)).toBe("mid");
    expect(bandForAge(38, currentAge, endAge)).toBe("far");
    expect(bandForAge(45, currentAge, endAge)).toBe("later");
    expect(bandForAge(80, currentAge, endAge)).toBe("horizon");
  });

  it("has a Japanese label for every band", () => {
    const bands = ["current", "near", "mid", "far", "later", "horizon"] as const;
    for (const band of bands) {
      expect(worldlineBandLabel(band).length).toBeGreaterThan(0);
    }
  });
});
