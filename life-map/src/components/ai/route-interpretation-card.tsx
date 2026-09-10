"use client";

import { useMemo } from "react";
import { InterpretationCardShell } from "./interpretation-card-shell";
import { buildRouteInput } from "@/lib/ai/build-input";
import { fallbackRouteInterpretation } from "@/lib/ai/fallback";
import { useAIInterpretation } from "@/lib/ai/use-interpretation";
import type { Scenario, ValueProfile } from "@/types/life-map";

export function RouteInterpretationCard({
  valueProfile,
  scenario,
}: {
  valueProfile: ValueProfile;
  scenario: Scenario;
}) {
  const input = useMemo(() => buildRouteInput(valueProfile, scenario), [valueProfile, scenario]);
  const { status, data, loadingMessage } = useAIInterpretation({
    kind: "route",
    input,
    fallback: fallbackRouteInterpretation,
  });

  return (
    <InterpretationCardShell title="このルートの特徴" status={status} loadingMessage={loadingMessage}>
      {data && (
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-neutral-800">{data.summary}</p>
          <p className="text-sm leading-relaxed text-neutral-700">{data.whyThisRoute}</p>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-neutral-600">特徴</p>
            <ul className="flex flex-col gap-1 text-sm text-neutral-700">
              {data.strengths.map((s, i) => (
                <li key={i}>・{s}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-neutral-600">考えておきたいこと</p>
            <ul className="flex flex-col gap-1 text-sm text-neutral-700">
              {data.tradeoffs.map((t, i) => (
                <li key={i}>・{t}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </InterpretationCardShell>
  );
}
