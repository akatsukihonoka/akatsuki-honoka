"use client";

import { useMemo } from "react";
import { InterpretationCardShell } from "./interpretation-card-shell";
import { Expandable } from "@/components/common/expandable";
import { buildReversePlanInput } from "@/lib/ai/build-input";
import { fallbackReversePlanInterpretation } from "@/lib/ai/fallback";
import { useAIInterpretation } from "@/lib/ai/use-interpretation";
import type { ReversePlan } from "@/lib/reverse-plan-engine/types";
import type { ValueProfile } from "@/types/life-map";

export function ReversePlanInterpretationCard({
  valueProfile,
  plan,
}: {
  valueProfile: ValueProfile;
  plan: ReversePlan;
}) {
  const input = useMemo(() => buildReversePlanInput(valueProfile, plan), [valueProfile, plan]);
  const { status, data, loadingMessage } = useAIInterpretation({
    kind: "reversePlan",
    input,
    fallback: fallbackReversePlanInterpretation,
  });

  return (
    <InterpretationCardShell title="💡 なぜこの順番？" status={status} loadingMessage={loadingMessage}>
      {data && (
        <div className="flex flex-col gap-1">
          <p className="text-sm leading-relaxed text-neutral-800">{data.summary}</p>
          <Expandable label="もう少し見る">
            <p className="mt-1 text-xs leading-relaxed text-neutral-600">{data.whyThisOrder}</p>
            {data.caveat && <p className="mt-1 text-[11px] text-neutral-600">{data.caveat}</p>}
          </Expandable>
        </div>
      )}
    </InterpretationCardShell>
  );
}
