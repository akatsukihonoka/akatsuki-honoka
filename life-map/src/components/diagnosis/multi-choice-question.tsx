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
      <p className="text-xs font-medium text-neutral-500">{question.helper}</p>
      <div className="flex flex-col gap-2.5" role="group" aria-label={question.question}>
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
                "tap-bounce flex items-center justify-between rounded-[22px] border-2 px-5 py-3.5 text-left text-sm font-semibold transition-colors",
                selected
                  ? "border-pink-400 bg-gradient-to-r from-pink-50 to-orange-50 text-pink-700 shadow-soft"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-pink-200 hover:bg-pink-50/50"
              )}
            >
              {option.label}
              {selected && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-400 text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <Button
        size="lg"
        className="tap-bounce w-full bg-gradient-to-r from-orange-400 to-pink-400 shadow-soft hover:opacity-90"
        disabled={value.length === 0}
        onClick={onConfirm}
      >
        次へ
      </Button>
    </div>
  );
}
