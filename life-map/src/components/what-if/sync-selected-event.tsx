"use client";

import { useEffect } from "react";
import { useDiagnosisStore } from "@/store/diagnosis-store";

/**
 * Keeps the store's selectedEventId in sync with the /if?event= query param,
 * so the currently-explored event survives further navigation (e.g. into
 * /compare) even without carrying it in every URL — the "store経由" path
 * from the what-if connection requirement.
 */
export function SyncSelectedEvent({ eventId }: { eventId?: string }) {
  const setSelectedEventId = useDiagnosisStore((s) => s.setSelectedEventId);

  useEffect(() => {
    if (eventId) setSelectedEventId(eventId);
  }, [eventId, setSelectedEventId]);

  return null;
}
