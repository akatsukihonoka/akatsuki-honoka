"use client";

import { useEffect } from "react";
import { useDiagnosisStore } from "@/store/diagnosis-store";
import type { ScenarioType } from "@/types/life-map";

/**
 * Keeps the store's selectedEventId / activeScenarioId in sync with the
 * ?event=&route= query params, so the currently-explored what-if survives
 * further navigation (e.g. into /compare) even without carrying it in
 * every URL — the "store経由" path from the what-if connection
 * requirement.
 */
export function SyncSelectedEvent({
  eventId,
  scenarioId,
}: {
  eventId?: string;
  scenarioId?: ScenarioType;
}) {
  const setSelectedEventId = useDiagnosisStore((s) => s.setSelectedEventId);
  const setActiveScenarioId = useDiagnosisStore((s) => s.setActiveScenarioId);

  useEffect(() => {
    if (eventId) setSelectedEventId(eventId);
  }, [eventId, setSelectedEventId]);

  useEffect(() => {
    if (scenarioId) setActiveScenarioId(scenarioId);
  }, [scenarioId, setActiveScenarioId]);

  return null;
}
