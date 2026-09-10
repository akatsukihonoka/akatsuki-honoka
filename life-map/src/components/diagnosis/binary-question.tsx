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
  const badges = [
    "bg-gradient-to-br from-sky-300 to-sky-400",
    "bg-gradient-to-br from-orange-300 to-amber-400",
  ];

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
              "tap-bounce flex items-start gap-3 rounded-[22px] border-2 px-5 py-4 text-left transition-colors",
              selected
                ? "border-orange-400 bg-gradient-to-r from-orange-50 to-pink-50 shadow-soft"
                : "border-neutral-200 bg-white hover:border-orange-200 hover:bg-orange-50/50"
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                badges[i]
              )}
            >
              {i === 0 ? "A" : "B"}
            </span>
            <span className="flex flex-col gap-0.5">
              <span
                className={cn(
                  "text-base font-bold",
                  selected ? "text-orange-700" : "text-neutral-800"
                )}
              >
                {option.label}
              </span>
              <span className="text-xs text-neutral-500">{option.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
