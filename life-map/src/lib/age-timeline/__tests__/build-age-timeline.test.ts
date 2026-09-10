import { describe, expect, it } from "vitest";
import { LIFE_EVENTS_BY_ID } from "@/data/life-events";
import { generateRoutes } from "@/lib/event-engine";
import type { ScenarioEvent } from "@/types/life-map";
import { buildAgeTimeline, computeAnchorAges, condenseAgePreview, FUTURE_HORIZON_AGE } from "../build-age-timeline";

describe("buildAgeTimeline: current age -> 80", () => {
  it.each([25, 30, 35])("currentAge=%i always ends with an 80歳 horizon node", (currentAge) => {
    const timeline = buildAgeTimeline([], currentAge);
    const last = timeline[timeline.length - 1];
    expect(last).toEqual({ kind: "horizon", age: FUTURE_HORIZON_AGE });
  });

  it.each([25, 30, 35])("currentAge=%i starts with a current node at that age", (currentAge) => {
    const timeline = buildAgeTimeline([], currentAge);
    expect(timeline[0]).toEqual({ kind: "current", age: currentAge });
  });
});

describe("buildAgeTimeline: gap filling when there are no events", () => {
  it("fills the empty 30->80 stretch with gap nodes instead of leaving a bare jump", () => {
    const timeline = buildAgeTimeline([], 30);
    const gapNodes = timeline.filter((n) => n.kind === "gap");
    expect(gapNodes.length).toBeGreaterThan(0);

    const ages = timeline.map((n) => n.age);
    for (let i = 1; i < ages.length; i += 1) {
      expect(ages[i]).toBeGreaterThan(ages[i - 1]);
    }
    expect(ages[ages.length - 1]).toBe(80);
  });

  it("never places a gap or event node at or beyond 80 except the horizon itself", () => {
    const timeline = buildAgeTimeline([], 25);
    const nonHorizon = timeline.filter((n) => n.kind !== "horizon");
    for (const node of nonHorizon) {
      expect(node.age).toBeLessThan(80);
    }
  });
});

describe("buildAgeTimeline: never fabricates events", () => {
  it("produces exactly one event node per input event, in the same order, for a real generated route", () => {
    const scenario = generateRoutes({ ageRange: "30-34" }).stable;
    const timeline = buildAgeTimeline(scenario.events, 32);
    const eventNodes = timeline.filter((n) => n.kind === "event");

    expect(eventNodes).toHaveLength(scenario.events.length);
    expect(eventNodes.map((n) => (n as { event: ScenarioEvent }).event.id)).toEqual(
      scenario.events.map((e) => e.id)
    );
  });

  it("does not touch the Event Master's own maxAge windows (still capped well under 80)", () => {
    for (const event of Object.values(LIFE_EVENTS_BY_ID)) {
      expect(event.maxAge).toBeLessThanOrEqual(45);
    }
  });

  it("every generated route's real events stay far short of 80 on their own — the horizon is display-only", () => {
    const routes = generateRoutes({ ageRange: "25-29" });
    for (const scenario of Object.values(routes)) {
      const timeline = buildAgeTimeline(scenario.events, 27);
      const eventAges = timeline.filter((n) => n.kind === "event").map((n) => n.age);
      for (const age of eventAges) {
        expect(age).toBeLessThan(60);
      }
    }
  });
});

describe("computeAnchorAges", () => {
  it("anchors an event no earlier than its own LifeEvent minAge or the current age", () => {
    const anchors = computeAnchorAges([{ key: "e1", lifeEventId: "job_change" }], 20);
    // job_change.minAge is 20 in the Event Master.
    expect(anchors.get("e1")).toBeGreaterThanOrEqual(20);
  });

  it("is strictly increasing across a multi-item input, never regressing", () => {
    const anchors = computeAnchorAges(
      [
        { key: "a", lifeEventId: "skill_up" },
        { key: "b", lifeEventId: "job_change" },
        { key: "c", lifeEventId: "income_increase" },
      ],
      30
    );
    const ages = [anchors.get("a")!, anchors.get("b")!, anchors.get("c")!];
    expect(ages[1]).toBeGreaterThan(ages[0]);
    expect(ages[2]).toBeGreaterThan(ages[1]);
  });

  it("falls back to 'as soon as possible' (currentAge + 1) for an item with no resolvable LifeEvent", () => {
    const anchors = computeAnchorAges([{ key: "custom" }], 30);
    expect(anchors.get("custom")).toBe(31);
  });
});

describe("condenseAgePreview", () => {
  it("keeps only a handful of event nodes plus the final horizon", () => {
    const scenario = generateRoutes({ ageRange: "30-34" }).challenge;
    const timeline = buildAgeTimeline(scenario.events, 32);
    const preview = condenseAgePreview(timeline, 2);

    expect(preview.filter((n) => n.kind === "event").length).toBeLessThanOrEqual(2);
    expect(preview[preview.length - 1]).toEqual({ kind: "horizon", age: 80 });
  });
});
