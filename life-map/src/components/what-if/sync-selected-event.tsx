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
    if (!chainEventIds) return;
    // Callers typically pass a freshly-derived array (e.g. WhatIfChain.events
    // from applyChain) that gets a new reference on every recompute even
    // when its contents haven't changed. Writing unconditionally here would
    // feed that new reference back into whatever derivation produced it
    // (which reads chainEventIds from the store as its own fallback input),
    // causing an infinite render loop. Comparing by value before writing
    // makes this idempotent once the store already matches.
    const current = useDiagnosisStore.getState().chainEventIds;
    const unchanged =
      current.length === chainEventIds.length &&
      current.every((id, i) => id === chainEventIds[i]);
    if (!unchanged) setChainEventIds(chainEventIds);
  }, [chainEventIds, setChainEventIds]);

  return null;
}
