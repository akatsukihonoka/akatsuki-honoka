import { ArrowDown } from "lucide-react";
import type { CausalChainStep } from "@/lib/what-if-engine/types";
import { Expandable } from "@/components/common/expandable";

export function CausalChainView({ steps }: { steps: CausalChainStep[] }) {
  if (steps.length === 0) return null;

  return (
    <div className="rounded-[24px] border border-neutral-200 bg-white p-5 shadow-soft">
      <p className="font-heading text-sm font-bold text-neutral-800">🌱 なぜ変化するのか</p>
      <Expandable label="理由を見る" className="mt-1">
        <div className="mt-2 flex flex-col items-start">
          {steps.map((step, i) => (
            <div key={step.eventId} className="flex w-full flex-col items-start">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-bold text-neutral-800">{step.eventName}</p>
                <p className="text-xs leading-relaxed text-neutral-600">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowDown className="my-2 h-4 w-4 text-orange-300" aria-hidden />
              )}
            </div>
          ))}
        </div>
      </Expandable>
    </div>
  );
}
