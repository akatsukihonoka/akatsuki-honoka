import type { RouteTimeline } from "@/lib/event-engine/timeline";
import type { LifeEvent } from "@/types/life-map";
import { computeAxisScores, diffAxisScores } from "./effects";
import { diffRisks } from "./risk";
import type { WhatIfComparison } from "./types";

export function buildComparison(params: {
  beforeEvents: LifeEvent[];
  afterEvents: LifeEvent[];
  beforeTimeline: RouteTimeline;
  afterTimeline: RouteTimeline;
  addedEventIds: string[];
  removedEventIds: string[];
  optionScoreBefore: number;
  optionScoreAfter: number;
}): WhatIfComparison {
  const changedAxes = diffAxisScores(
    computeAxisScores(params.beforeEvents),
    computeAxisScores(params.afterEvents)
  );

  const { newRisks, resolvedRisks } = diffRisks(
    params.beforeTimeline.risks,
    params.afterTimeline.risks
  );

  const beforeBranchIds = new Set(params.beforeTimeline.branchPoints.map((b) => b.eventId));
  const newBranchPoints = params.afterTimeline.branchPoints
    .filter((b) => !beforeBranchIds.has(b.eventId))
    .map((b) => b.eventId);

  return {
    changedAxes,
    addedEvents: params.addedEventIds,
    removedEvents: params.removedEventIds,
    optionScoreBefore: params.optionScoreBefore,
    optionScoreAfter: params.optionScoreAfter,
    newRisks,
    resolvedRisks,
    newBranchPoints,
  };
}
