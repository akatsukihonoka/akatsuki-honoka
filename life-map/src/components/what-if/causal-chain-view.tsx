import { ArrowDown } from "lucide-react";
import type { CausalChainStep } from "@/lib/what-if-engine/types";

export function CausalChainView({ steps }: { steps: CausalChainStep[] }) {
  if (steps.length === 0) return null;

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5">
      <p className="text-sm font-semibold text-neutral-800">なぜ変化するのか</p>
      <div className="mt-3 flex flex-col items-start">
        {steps.map((step, i) => (
          <div key={step.eventId} className="flex w-full flex-col items-start">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-neutral-800">{step.eventName}</p>
              <p className="text-xs leading-relaxed text-neutral-600">{step.description}</p>
            </div>
            {i < steps.length - 1 && (
              <ArrowDown className="my-2 h-4 w-4 text-neutral-300" aria-hidden />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
