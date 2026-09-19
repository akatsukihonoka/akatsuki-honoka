import type { ScenarioEvent } from "@/types/life-map";

/**
 * Worldline — a purely presentational layer on top of the existing What-if
 * Engine / Chain What-if / Age Timeline. It never decides which events
 * exist, which are eligible, or what they're worth; it only selects,
 * orders, and labels what those (unmodified) engines already produced, as
 * a "世界線" story instead of a Before/After table.
 */
export type WorldlineBand = "current" | "near" | "mid" | "far" | "later" | "horizon";

/**
 * A downstream addition whose category differs from the chain's root
 * trigger event — surfaced as "✨ 意外な変化" only when the Event Master's
 * own downstreamEvents graph actually produced one for this specific
 * chain. Never fabricated: eventId/eventName/description all come
 * straight from the engine's own causal chain output.
 */
export type UnexpectedBranch = {
  eventId: string;
  eventName: string;
  triggerEventName: string;
  description: string;
};

/**
 * buildAgeTimeline's raw current/event/gap/horizon nodes, condensed for
 * the worldline story: every run of consecutive "gap" nodes (and the
 * trailing run that reaches the 80歳 horizon) collapses into a single
 * "gap-range" node instead of one card per gap age. Nothing about which
 * ages have real events changes — this only changes how the *absence* of
 * events between them is grouped for display.
 */
export type WorldlineStoryNode =
  | { kind: "current"; age: number }
  | {
      kind: "event";
      age: number;
      ageLabel: string;
      event: ScenarioEvent;
      /** True when this is the specific event buildWorldlineView flagged as UnexpectedBranch. */
      isUnexpected: boolean;
    }
  | {
      kind: "gap-range";
      fromAge: number;
      toAge: number;
      /** True when this range is the final stretch ending at the 80歳 horizon. */
      reachesHorizon: boolean;
    };
