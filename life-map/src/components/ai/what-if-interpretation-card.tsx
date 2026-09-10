"use client";

import { InterpretationCardShell } from "./interpretation-card-shell";
import { Expandable } from "@/components/common/expandable";
import type { ChainAIInput, WhatIfAIInput } from "@/lib/ai/build-input";
import { fallbackChainInterpretation, fallbackWhatIfInterpretation } from "@/lib/ai/fallback";
import type { WhatIfInterpretation } from "@/lib/ai/schemas";
import { useAIInterpretation } from "@/lib/ai/use-interpretation";

export function WhatIfInterpretationCard({
  kind,
  title,
  input,
}: {
  kind: "whatIf" | "chain";
  title: string;
  input: WhatIfAIInput | ChainAIInput;
}) {
  const fallback = (kind === "chain" ? fallbackChainInterpretation : fallbackWhatIfInterpretation) as (
    value: WhatIfAIInput | ChainAIInput
  ) => WhatIfInterpretation;

  const { status, data, loadingMessage } = useAIInterpretation({ kind, input, fallback });

  return (
    <InterpretationCardShell title={`💡 ${title}`} status={status} loadingMessage={loadingMessage}>
      {data && (
        <div className="flex flex-col gap-1">
          <p className="text-sm leading-relaxed text-neutral-800">{data.summary}</p>
          {(data.keyPoints.length > 0 || data.explanation || data.caveat) && (
            <Expandable label="もう少し見る">
              <ul className="mt-1 flex flex-col gap-1 text-xs text-neutral-600">
                {data.keyPoints.map((point, i) => (
                  <li key={i}>・{point}</li>
                ))}
              </ul>
              {data.explanation && (
                <p className="mt-1 text-xs leading-relaxed text-neutral-600">{data.explanation}</p>
              )}
              {data.caveat && <p className="mt-1 text-[11px] text-neutral-600">{data.caveat}</p>}
            </Expandable>
          )}
        </div>
      )}
    </InterpretationCardShell>
  );
}
