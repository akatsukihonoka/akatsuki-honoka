"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MAX_REVERSE_PLAN_GOAL_OPTIONS,
  REVERSE_PLAN_GOAL_CATEGORY_LABELS,
} from "@/data/reverse-plan-goals";
import { getAvailableGoalOptions } from "@/lib/reverse-plan-engine";
import type { ReversePlanGoal, ReversePlanGoalCategory } from "@/lib/reverse-plan-engine/types";
import type { DiagnosisAnswer } from "@/types/life-map";

const CATEGORIES: ReversePlanGoalCategory[] = ["work", "money", "living", "family", "freedom"];

function buildAgeOptions(currentAgeMidpoint: number, maxAge: number): number[] {
  const options: number[] = [];
  for (let age = currentAgeMidpoint + 1; age <= maxAge; age += 1) {
    options.push(age);
  }
  return options;
}

export function GoalForm({
  answers,
  currentAgeMidpoint,
  initialGoal,
  onSubmit,
}: {
  answers: DiagnosisAnswer;
  currentAgeMidpoint: number;
  initialGoal?: ReversePlanGoal;
  onSubmit: (goal: ReversePlanGoal) => void;
}) {
  const ageOptions = buildAgeOptions(currentAgeMidpoint, 45);
  const defaultAge = ageOptions[Math.min(4, ageOptions.length - 1)] ?? currentAgeMidpoint + 1;

  const [targetAge, setTargetAge] = useState(initialGoal?.targetAge ?? defaultAge);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>(
    initialGoal?.selectedOptionIds ?? []
  );
  const [goalNote, setGoalNote] = useState(initialGoal?.goalNote ?? "");

  const availableOptions = getAvailableGoalOptions(answers);
  const atMax = selectedOptionIds.length >= MAX_REVERSE_PLAN_GOAL_OPTIONS;

  const toggleOption = (optionId: string, checked: boolean) => {
    setSelectedOptionIds((prev) => {
      if (checked) {
        if (prev.includes(optionId) || prev.length >= MAX_REVERSE_PLAN_GOAL_OPTIONS) return prev;
        return [...prev, optionId];
      }
      return prev.filter((id) => id !== optionId);
    });
  };

  const canSubmit = selectedOptionIds.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-2xl font-bold text-neutral-800">
          未来からの逆算プラン
        </h1>
        <p className="text-sm leading-relaxed text-neutral-600">
          「何歳ごろに、どんな状態でいたいか」を選ぶと、そこに近づくために考えられる道すじを整理します。
        </p>
      </div>

      <Card className="border-neutral-200">
        <CardContent className="flex flex-col gap-2 p-5">
          <label htmlFor="reverse-plan-target-age" className="text-sm font-semibold text-neutral-800">
            何歳ごろの未来を見てみますか？
          </label>
          <select
            id="reverse-plan-target-age"
            value={targetAge}
            onChange={(e) => setTargetAge(Number(e.target.value))}
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            {ageOptions.map((age) => (
              <option key={age} value={age}>
                {age}歳ごろ
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-5">
        {CATEGORIES.map((category) => {
          const options = availableOptions.filter((o) => o.option.category === category);
          if (options.length === 0) return null;

          return (
            <div key={category} className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-neutral-600">
                {REVERSE_PLAN_GOAL_CATEGORY_LABELS[category]}
              </p>
              <div className="flex flex-col gap-2">
                {options.map(({ option, deprioritized }) => {
                  const checked = selectedOptionIds.includes(option.id);
                  const disabled = !checked && atMax;
                  return (
                    <label
                      key={option.id}
                      className={`flex items-center gap-3 rounded-2xl border p-3.5 text-sm transition-colors ${
                        checked
                          ? "border-orange-300 bg-orange-50/60"
                          : "border-neutral-200 bg-white"
                      } ${disabled ? "opacity-50" : ""} ${deprioritized ? "text-neutral-500" : "text-neutral-800"}`}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(value) => toggleOption(option.id, value === true)}
                        aria-label={option.label}
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <label className="flex flex-col gap-1.5 text-xs font-medium text-neutral-600">
        その他（自由記入・任意）
        <textarea
          value={goalNote}
          onChange={(e) => setGoalNote(e.target.value)}
          placeholder="選択肢にない未来の状態があれば書いてみてください"
          rows={2}
          className="rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        />
        <span className="text-neutral-600">この内容は逆算の計算には使われません。</span>
      </label>

      <p className="text-xs text-neutral-600">
        {selectedOptionIds.length} / {MAX_REVERSE_PLAN_GOAL_OPTIONS} 個選択中
      </p>

      <Button
        size="lg"
        disabled={!canSubmit}
        onClick={() =>
          onSubmit({
            targetAge,
            selectedOptionIds,
            goalNote: goalNote.trim().length > 0 ? goalNote.trim() : undefined,
          })
        }
      >
        <Sparkles className="h-4 w-4" />
        この未来から逆算する
      </Button>
    </div>
  );
}
