import { describe, expect, it } from "vitest";
import type { LifeEvent } from "@/types/life-map";
import { buildTimeline, isBranchPoint } from "../timeline";

function fakeEvent(overrides: Partial<LifeEvent> & Pick<LifeEvent, "id" | "code">): LifeEvent {
  return {
    category: "personal",
    name: overrides.id,
    description: "",
    minAge: 20,
    maxAge: 45,
    impactLevel: 1,
    conditions: {},
    hardConstraints: {},
    prerequisites: [],
    recommendedAfter: [],
    conflicts: [],
    effects: {
      money: 0,
      time: 0,
      career: 0,
      stability: 0,
      family: 0,
      freedom: 0,
      location: 0,
      experience: 0,
    },
    downstreamEvents: [],
    ...overrides,
  };
}

describe("isBranchPoint", () => {
  it("is true only for impactLevel >= 3 with at least 2 downstream events", () => {
    expect(
      isBranchPoint(fakeEvent({ id: "a", code: "A1", impactLevel: 3, downstreamEvents: ["x", "y"] }))
    ).toBe(true);
    expect(
      isBranchPoint(fakeEvent({ id: "b", code: "A2", impactLevel: 2, downstreamEvents: ["x", "y"] }))
    ).toBe(false);
    expect(
      isBranchPoint(fakeEvent({ id: "c", code: "A3", impactLevel: 4, downstreamEvents: ["x"] }))
    ).toBe(false);
  });
});

describe("buildTimeline bottleneck detection", () => {
  it("flags a period where 2+ high-impact events land together, without alarming language", () => {
    // 6 events, spread by minAge so the topo order is fixed; with the
    // 4-period bucketing formula (floor(index*4/6)) indices 3 and 4 land
    // in the same period bucket — make both high-impact there.
    const events = [
      fakeEvent({ id: "e0", code: "E0", minAge: 20, impactLevel: 1 }),
      fakeEvent({ id: "e1", code: "E1", minAge: 21, impactLevel: 1 }),
      fakeEvent({ id: "e2", code: "E2", minAge: 22, impactLevel: 1 }),
      fakeEvent({ id: "e3", code: "E3", minAge: 23, impactLevel: 3 }),
      fakeEvent({ id: "e4", code: "E4", minAge: 24, impactLevel: 3 }),
      fakeEvent({ id: "e5", code: "E5", minAge: 25, impactLevel: 1 }),
    ];

    const timeline = buildTimeline(events);
    expect(timeline.periodOf.get("e3")).toBe(timeline.periodOf.get("e4"));
    expect(timeline.risks).toHaveLength(1);
    expect(timeline.risks[0].message).not.toMatch(/危険|失敗|絶対|必ず/);
    expect(timeline.risks[0].message).toContain("可能性があります");
  });

  it("produces no risk when high-impact events are spread across periods", () => {
    const events = [
      fakeEvent({ id: "e0", code: "E0", minAge: 20, impactLevel: 4 }),
      fakeEvent({ id: "e1", code: "E1", minAge: 30, impactLevel: 4 }),
    ];
    const timeline = buildTimeline(events);
    expect(timeline.risks).toHaveLength(0);
  });
});

describe("buildTimeline dependency ordering", () => {
  it("always places a prerequisite before the event that needs it", () => {
    const child = fakeEvent({ id: "child_birth", code: "F1", minAge: 25, impactLevel: 5 });
    const childcare = fakeEvent({
      id: "childcare",
      code: "F2",
      minAge: 25,
      impactLevel: 3,
      prerequisites: ["child_birth"],
    });
    // Deliberately pass childcare first — the topo sort must still put the
    // prerequisite ahead of it.
    const timeline = buildTimeline([childcare, child]);
    const orderIds = timeline.orderedEvents.map((e) => e.id);
    expect(orderIds.indexOf("child_birth")).toBeLessThan(orderIds.indexOf("childcare"));
  });
});
