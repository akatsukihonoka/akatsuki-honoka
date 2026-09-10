import { cn } from "@/lib/utils";
import type { ScaleQuestion } from "./questions";

export function ScaleQuestionView({
  question,
  value,
  onSelect,
}: {
  question: ScaleQuestion;
  value?: number;
  onSelect: (value: number) => void;
}) {
  const steps = Array.from(
    { length: question.max - question.min + 1 },
    (_, i) => question.min + i
  );

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex items-center justify-between gap-2"
        role="radiogroup"
        aria-label={question.question}
      >
        {steps.map((step) => {
          const selected = value === step;
          return (
            <button
              key={step}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(step)}
              className={cn(
                "tap-bounce flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-lg font-bold transition-colors sm:h-16 sm:w-16",
                selected
                  ? "border-transparent bg-gradient-to-br from-orange-400 to-pink-400 text-white shadow-soft"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-orange-200 hover:bg-orange-50/50"
              )}
            >
              {step}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-neutral-500">
        <span>{question.minLabel}</span>
        <span>{question.maxLabel}</span>
      </div>
    </div>
  );
}
