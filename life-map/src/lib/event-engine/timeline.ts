import type { BottleneckRisk, BranchPoint, LifeEvent, PeriodBucket } from "@/types/life-map";

export const PERIOD_LABELS: readonly string[] = [
  "今〜1年以内",
  "1〜3年以内",
  "3〜5年以内",
  "5年以上先",
];

const BRANCH_POINT_MIN_IMPACT = 3;
const BRANCH_POINT_MIN_DOWNSTREAM = 2;
const BOTTLENECK_MIN_IMPACT = 3;
const BOTTLENECK_MIN_EVENTS = 2;

/**
 * Orders a route's selected events so every prerequisite (hard) and
 * recommendedAfter (soft) relationship is respected, breaking every
 * remaining tie by minAge then event code — so the same selected set
 * always produces the same order.
 */
function orderForTimeline(events: LifeEvent[]): LifeEvent[] {
  const ids = new Set(events.map((e) => e.id));
  const byId = new Map(events.map((e) => [e.id, e]));
  const predecessors = new Map<string, Set<string>>();
  for (const e of events) predecessors.set(e.id, new Set());
  for (const e of events) {
    for (const p of [...e.prerequisites, ...e.recommendedAfter]) {
      if (ids.has(p)) predecessors.get(e.id)?.add(p);
    }
  }

  const placed = new Set<string>();
  const remaining = new Set(ids);
  const ordered: LifeEvent[] = [];

  const byAgeThenCode = (a: LifeEvent, b: LifeEvent) =>
    a.minAge - b.minAge || a.code.localeCompare(b.code);

  while (remaining.size > 0) {
    const ready = [...remaining]
      .map((id) => byId.get(id) as LifeEvent)
      .filter((e) => [...(predecessors.get(e.id) ?? [])].every((p) => placed.has(p)))
      .sort(byAgeThenCode);

    // Defensive fallback for a would-be cycle (the Event Master has none,
    // but this keeps the function total rather than looping forever).
    const next =
      ready[0] ?? [...remaining].map((id) => byId.get(id) as LifeEvent).sort(byAgeThenCode)[0];

    ordered.push(next);
    placed.add(next.id);
    remaining.delete(next.id);
  }

  return ordered;
}

function assignPeriod(index: number, total: number): PeriodBucket {
  const bucket = Math.floor((index * 4) / total);
  return Math.min(3, bucket) as PeriodBucket;
}

export function isBranchPoint(event: LifeEvent): boolean {
  return (
    event.impactLevel >= BRANCH_POINT_MIN_IMPACT &&
    event.downstreamEvents.length >= BRANCH_POINT_MIN_DOWNSTREAM
  );
}

export type RouteTimeline = {
  orderedEvents: LifeEvent[];
  periodOf: Map<string, PeriodBucket>;
  branchPoints: BranchPoint[];
  risks: BottleneckRisk[];
};

export function buildTimeline(selected: LifeEvent[]): RouteTimeline {
  if (selected.length === 0) {
    return { orderedEvents: [], periodOf: new Map(), branchPoints: [], risks: [] };
  }

  const orderedEvents = orderForTimeline(selected);
  const periodOf = new Map<string, PeriodBucket>();
  orderedEvents.forEach((event, index) => {
    periodOf.set(event.id, assignPeriod(index, orderedEvents.length));
  });

  const branchPoints: BranchPoint[] = orderedEvents
    .filter(isBranchPoint)
    .map((event) => ({
      eventId: event.id,
      name: event.name,
      downstreamCount: event.downstreamEvents.length,
    }));

  const impactCountByPeriod = new Map<PeriodBucket, number>();
  for (const event of orderedEvents) {
    if (event.impactLevel < BOTTLENECK_MIN_IMPACT) continue;
    const period = periodOf.get(event.id) as PeriodBucket;
    impactCountByPeriod.set(period, (impactCountByPeriod.get(period) ?? 0) + 1);
  }

  const risks: BottleneckRisk[] = [...impactCountByPeriod.entries()]
    .filter(([, count]) => count >= BOTTLENECK_MIN_EVENTS)
    .sort(([a], [b]) => a - b)
    .map(([period]) => ({
      period: PERIOD_LABELS[period],
      message: "この時期は変化が重なり、未来の余白が小さくなる可能性があります。",
    }));

  return { orderedEvents, periodOf, branchPoints, risks };
}
