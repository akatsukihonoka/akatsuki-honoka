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
    <div className="flex flex-col gap-3" role="radiogroup" aria-label={question.question}>
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
              "tap-bounce flex items-center justify-between rounded-[22px] border-2 px-5 py-4 text-left text-base font-semibold transition-colors",
              selected
                ? "border-orange-400 bg-gradient-to-r from-orange-50 to-pink-50 text-orange-700 shadow-soft"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-orange-200 hover:bg-orange-50/50"
            )}
          >
            {option.label}
            {selected && (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-400 text-white">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
