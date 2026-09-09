import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SingleChoiceQuestion } from "./questions";

export function SingleChoiceQuestionView({
  question,
  value,
  onSelect,
}: {
  question: SingleChoiceQuestion;
  value?: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5" role="radiogroup" aria-label={question.question}>
      {question.options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(option.value)}
            className={cn(
              "flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-colors",
              selected
                ? "border-orange-400 bg-orange-50 text-orange-700"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-orange-200 hover:bg-orange-50/50"
            )}
          >
            {option.label}
            {selected && <Check className="h-4 w-4 text-orange-500" />}
          </button>
        );
      })}
    </div>
  );
}
