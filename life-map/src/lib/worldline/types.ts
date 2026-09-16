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
 * trigger event — shown as "✨ 意外な分岐" only when the Event Master's own
 * downstreamEvents graph actually produced one for this specific chain.
 * Never fabricated: eventId/eventName/description all come straight from
 * the engine's own causal chain output.
 */
export type UnexpectedBranch = {
  eventId: string;
  eventName: string;
  triggerEventName: string;
  description: string;
};
