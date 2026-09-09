"use client";

import { useEffect } from "react";
import { useDiagnosisStore } from "@/store/diagnosis-store";
import type { ScenarioType } from "@/types/life-map";

/**
 * Keeps the store's selectedEventId / activeScenarioId / chainEventIds in
 * sync with the URL (?event=, ?route=, ?events=), so the currently-explored
 * what-if chain survives further navigation and reload even without
 * carrying it in every URL — the "store経由" fallback path.
 */
export function SyncSelectedEvent({
  eventId,
  scenarioId,
  chainEventIds,
}: {
  eventId?: string;
  scenarioId?: ScenarioType;
  chainEventIds?: string[];
}) {
  const setSelectedEventId = useDiagnosisStore((s) => s.setSelectedEventId);
  const setActiveScenarioId = useDiagnosisStore((s) => s.setActiveScenarioId);
  const setChainEventIds = useDiagnosisStore((s) => s.setChainEventIds);

  useEffect(() => {
    if (eventId) setSelectedEventId(eventId);
  }, [eventId, setSelectedEventId]);

  useEffect(() => {
    if (scenarioId) setActiveScenarioId(scenarioId);
  }, [scenarioId, setActiveScenarioId]);

  useEffect(() => {
    if (chainEventIds) setChainEventIds(chainEventIds);
  }, [chainEventIds, setChainEventIds]);

  return null;
}
