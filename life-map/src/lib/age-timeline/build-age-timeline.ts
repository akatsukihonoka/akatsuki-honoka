import { LIFE_EVENTS_BY_ID } from "@/data/life-events";
import type { ScenarioEvent } from "@/types/life-map";
import type { AgeAnchorInput, AgeTimelineNode, DisplayAgeSource } from "./types";

/**
 * LIFE MAP is "未来を予測するサービス" ではなく現在から80歳までの分岐を
 * 探索するサービス — 80 is a fixed display horizon, not a prediction target.
 */
export const FUTURE_HORIZON_AGE = 80;

/** How far apart two placed nodes can be before we insert a "余白" gap node between them. */
const DEFAULT_GAP_THRESHOLD_YEARS = 8;

/**
 * The user's approximate current age for display purposes only. Derived
 * from the same ageMidpoint the Event Engine already computes from the
 * diagnosis answers (src/lib/event-engine/value-profile.ts) — no new
 * question, no new stored field, nothing added to the Engine's own
 * eligibility logic.
 */
export function getDisplayCurrentAge(constraints: DisplayAgeSource): number {
  return constraints.ageMidpoint;
}

function formatAgeLabel(age: number, endAge: number): string {
  return age >= endAge ? `${age}歳` : `${age}歳ごろ`;
}

/**
 * Places each item on the age axis: never earlier than the previous item,
 * never earlier than the user's current age, and — when the item has a
 * real underlying LifeEvent — never earlier than that event's own minAge
 * (the Event Master's existing age data, read but never widened). Items
 * without a resolvable LifeEvent simply anchor to "as soon as possible"
 * given what came before. Always strictly increasing until it would exceed
 * endAge, at which point later items compress against endAge - 1 so the
 * fixed horizon node always stays the true final step.
 */
export function computeAnchorAges(
  items: AgeAnchorInput[],
  currentAge: number,
  endAge: number = FUTURE_HORIZON_AGE
): Map<string, number> {
  const anchors = new Map<string, number>();
  const ceiling = Math.max(currentAge, endAge - 1);
  let prev = currentAge;

  for (const item of items) {
    const lifeEvent = item.lifeEventId ? LIFE_EVENTS_BY_ID[item.lifeEventId] : undefined;
    const minAge = lifeEvent?.minAge ?? currentAge;
    const raw = Math.max(currentAge, minAge, prev + 1);
    const anchor = Math.min(raw, ceiling);
    anchors.set(item.key, anchor);
    prev = anchor;
  }

  return anchors;
}

/**
 * Current age -> 80, with every real Event Engine result placed at its
 * anchored age and every stretch longer than gapThresholdYears filled with
 * an explicit "未来の余白" gap node instead of a fabricated event. The
 * output always contains exactly one "event" node per input event (same
 * ids, same order) plus the current/gap/horizon scaffolding — it never
 * adds, removes, or reinterprets an event.
 */
export function buildAgeTimeline(
  events: ScenarioEvent[],
  currentAge: number,
  endAge: number = FUTURE_HORIZON_AGE,
  gapThresholdYears: number = DEFAULT_GAP_THRESHOLD_YEARS
): AgeTimelineNode[] {
  const anchors = computeAnchorAges(
    events.map((event) => ({ key: event.id, lifeEventId: event.sourceEventId })),
    currentAge,
    endAge
  );

  const nodes: AgeTimelineNode[] = [{ kind: "current", age: currentAge }];
  let cursor = currentAge;

  const pushGapsUntil = (target: number) => {
    while (target - cursor > gapThresholdYears) {
      const gapAge = Math.min(cursor + gapThresholdYears, target - 1);
      nodes.push({ kind: "gap", age: gapAge, ageLabel: formatAgeLabel(gapAge, endAge) });
      cursor = gapAge;
    }
  };

  for (const event of events) {
    const age = anchors.get(event.id) ?? currentAge;
    pushGapsUntil(age);
    nodes.push({ kind: "event", age, ageLabel: formatAgeLabel(age, endAge), event });
    cursor = age;
  }

  pushGapsUntil(endAge);
  nodes.push({ kind: "horizon", age: endAge });

  return nodes;
}

/** Only the event/horizon nodes, capped to a short preview — for compact route cards, not the full walk. */
export function condenseAgePreview(
  nodes: AgeTimelineNode[],
  maxEventNodes: number = 3
): Extract<AgeTimelineNode, { kind: "event" | "horizon" }>[] {
  const eventNodes = nodes.filter((n): n is Extract<AgeTimelineNode, { kind: "event" }> => n.kind === "event");
  const horizon = nodes.find(
    (n): n is Extract<AgeTimelineNode, { kind: "horizon" }> => n.kind === "horizon"
  );
  const preview = eventNodes.slice(0, maxEventNodes);
  return horizon ? [...preview, horizon] : preview;
}
