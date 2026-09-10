"use client";

import { useMemo } from "react";
import { InterpretationCardShell } from "./interpretation-card-shell";
import { buildMapInput } from "@/lib/ai/build-input";
import { fallbackMapInterpretation } from "@/lib/ai/fallback";
import { useAIInterpretation } from "@/lib/ai/use-interpretation";
import type { Scenario, ValueProfile } from "@/types/life-map";

export function MapInterpretationCard({
  valueProfile,
  scenarios,
}: {
  valueProfile: ValueProfile;
  scenarios: Scenario[];
}) {
  const input = useMemo(() => buildMapInput(valueProfile, scenarios), [valueProfile, scenarios]);
  const { status, data, loadingMessage } = useAIInterpretation({
    kind: "map",
    input,
    fallback: fallbackMapInterpretation,
  });

  return (
    <InterpretationCardShell title="このMAPを読み解くと" status={status} loadingMessage={loadingMessage}>
      {data && (
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-neutral-800">{data.summary}</p>
          <ul className="flex flex-col gap-1 text-sm text-neutral-700">
            {data.keyPoints.map((point, i) => (
              <li key={i}>・{point}</li>
            ))}
          </ul>
          {data.caveat && <p className="text-xs text-neutral-600">{data.caveat}</p>}
        </div>
      )}
    </InterpretationCardShell>
  );
}
