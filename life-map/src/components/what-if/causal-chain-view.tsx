import { useMemo } from "react";
import { ArrowDown } from "lucide-react";
import type { CausalChainStep } from "@/lib/what-if-engine/types";
import { computeAnchorAges } from "@/lib/age-timeline";

/**
 * currentAge is optional so callers without a diagnosis profile in scope
 * (none currently, but this keeps the component usable standalone) still
 * render — age chips are additive, never load-bearing for the content.
 *
 * Always shown in full (no Expandable) — "何がきっかけで、何に影響するのか"
 * is the whole point of this view, not a detail to dig for.
 */
export function CausalChainView({
  steps,
  currentAge,
}: {
  steps: CausalChainStep[];
  currentAge?: number;
}) {
  const ageLabels = useMemo(() => {
    if (currentAge === undefined) return new Map<string, string>();
    const anchors = computeAnchorAges(
      steps.map((step) => ({ key: step.eventId, lifeEventId: step.eventId })),
      currentAge
    );
    return new Map([...anchors].map(([key, age]) => [key, `${age}歳ごろ`]));
  }, [steps, currentAge]);

  if (steps.length === 0) return null;

  return (
    <div className="rounded-[24px] border border-neutral-200 bg-white p-5 shadow-soft">
      <p className="font-heading text-sm font-bold text-neutral-800">
        🌱 この選択で、未来のどこが変わる？
      </p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-600">
        きっかけから、影響が広がっていく順番です。確定した未来ではありません。
      </p>
      <div className="mt-3 flex flex-col items-start">
        {steps.map((step, i) => (
          <div key={step.eventId} className="flex w-full flex-col items-start">
            <div className="flex flex-col gap-0.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600">
                  {i === 0 ? "きっかけ" : `影響 ${i}`}
                </span>
                {ageLabels.has(step.eventId) && (
                  <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                    {ageLabels.get(step.eventId)}
                  </span>
                )}
                <p className="text-sm font-bold text-neutral-800">{step.eventName}</p>
              </div>
              <p className="text-xs leading-relaxed text-neutral-600">{step.description}</p>
            </div>
            {i < steps.length - 1 && (
              <ArrowDown className="my-2 h-4 w-4 text-orange-300" aria-hidden />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
