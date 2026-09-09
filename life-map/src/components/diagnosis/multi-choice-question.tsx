"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { MultiChoiceQuestion } from "./questions";

export function MultiChoiceQuestionView({
  question,
  value,
  onToggle,
  onConfirm,
}: {
  question: MultiChoiceQuestion;
  value: string[];
  onToggle: (value: string) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-medium text-neutral-400">{question.helper}</p>
      <div
        className="flex flex-col gap-2.5"
        role="group"
        aria-label={question.question}
      >
        {question.options.map((option) => {
          const selected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => onToggle(option.value)}
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
      <Button size="lg" className="w-full" disabled={value.length === 0} onClick={onConfirm}>
        次へ
      </Button>
    </div>
  );
}
