import { cn } from "@/lib/utils";
import type { BinaryQuestion } from "./questions";

export function BinaryQuestionView({
  question,
  value,
  onSelect,
}: {
  question: BinaryQuestion;
  value?: string;
  onSelect: (value: string) => void;
}) {
  const options = [question.optionA, question.optionB];

  return (
    <div className="flex flex-col gap-3" role="radiogroup" aria-label={question.question}>
      {options.map((option, i) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(option.value)}
            className={cn(
              "flex flex-col gap-1 rounded-2xl border px-4 py-4 text-left transition-colors",
              selected
                ? "border-orange-400 bg-orange-50"
                : "border-neutral-200 bg-white hover:border-orange-200 hover:bg-orange-50/50"
            )}
          >
            <span className="text-xs font-semibold text-neutral-600">
              {i === 0 ? "A" : "B"}
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                selected ? "text-orange-700" : "text-neutral-700"
              )}
            >
              {option.label}
            </span>
            <span className="text-xs text-neutral-600">{option.description}</span>
          </button>
        );
      })}
    </div>
  );
}
