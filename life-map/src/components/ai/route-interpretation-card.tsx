"use client";

import { useMemo } from "react";
import { InterpretationCardShell } from "./interpretation-card-shell";
import { Expandable } from "@/components/common/expandable";
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
    <InterpretationCardShell title="💡 このルートの特徴" status={status} loadingMessage={loadingMessage}>
      {data && (
        <div className="flex flex-col gap-1">
          <p className="text-sm leading-relaxed text-neutral-800">{data.summary}</p>
          <Expandable label="もう少し見る">
            <div className="mt-1 flex flex-col gap-2 text-xs text-neutral-600">
              <p>{data.whyThisRoute}</p>
              <div>
                <p className="font-bold text-neutral-600">特徴</p>
                <ul className="flex flex-col gap-0.5">
                  {data.strengths.map((s, i) => (
                    <li key={i}>・{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-bold text-neutral-600">考えておきたいこと</p>
                <ul className="flex flex-col gap-0.5">
                  {data.tradeoffs.map((t, i) => (
                    <li key={i}>・{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Expandable>
        </div>
      )}
    </InterpretationCardShell>
  );
}
