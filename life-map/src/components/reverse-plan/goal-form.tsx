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

const CATEGORY_STYLE: Record<ReversePlanGoalCategory, { emoji: string; selected: string }> = {
  work: { emoji: "💼", selected: "border-sky-400 bg-sky-50" },
  money: { emoji: "💰", selected: "border-yellow-400 bg-yellow-50" },
  living: { emoji: "🏠", selected: "border-emerald-400 bg-emerald-50" },
  family: { emoji: "👨‍👩‍👧", selected: "border-pink-400 bg-pink-50" },
  freedom: { emoji: "🕊️", selected: "border-violet-400 bg-violet-50" },
};

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
          🎯 未来からの逆算プラン
        </h1>
        <p className="text-sm leading-relaxed text-neutral-600">
          「何歳ごろに、どんな状態でいたいか」を選ぶと、そこに近づく道すじを描きます。
        </p>
      </div>

      <Card className="rounded-[24px] border-orange-100 bg-gradient-to-br from-orange-50 to-pink-50 shadow-soft">
        <CardContent className="flex flex-col gap-2 p-5">
          <label htmlFor="reverse-plan-target-age" className="text-sm font-bold text-neutral-800">
            🗓️ 何歳ごろの未来を見てみますか？
          </label>
          <select
            id="reverse-plan-target-age"
            value={targetAge}
            onChange={(e) => setTargetAge(Number(e.target.value))}
            className="rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm font-semibold text-neutral-800 outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
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
          const style = CATEGORY_STYLE[category];

          return (
            <div key={category} className="flex flex-col gap-2">
              <p className="flex items-center gap-1.5 text-xs font-bold text-neutral-600">
                <span aria-hidden>{style.emoji}</span>
                {REVERSE_PLAN_GOAL_CATEGORY_LABELS[category]}
              </p>
              <div className="flex flex-col gap-2">
                {options.map(({ option, deprioritized }) => {
                  const checked = selectedOptionIds.includes(option.id);
                  const disabled = !checked && atMax;
                  return (
                    <label
                      key={option.id}
                      className={`tap-bounce flex items-center gap-3 rounded-[20px] border-2 p-3.5 text-sm font-semibold transition-colors ${
                        checked ? `${style.selected} shadow-soft` : "border-neutral-200 bg-white"
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

      <p className="text-xs font-semibold text-neutral-600">
        {selectedOptionIds.length} / {MAX_REVERSE_PLAN_GOAL_OPTIONS} 個選択中
      </p>

      <Button
        size="lg"
        disabled={!canSubmit}
        className="tap-bounce bg-gradient-to-r from-orange-400 to-pink-400 shadow-soft-lg hover:opacity-90"
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
