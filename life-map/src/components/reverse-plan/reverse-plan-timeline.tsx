import { useMemo } from "react";
import { REVERSE_PLAN_GOAL_OPTIONS_BY_ID } from "@/data/reverse-plan-goals";
import { PathWave } from "@/components/illustrations/path-wave";
import { LONG_HORIZON_TARGET_AGE } from "@/lib/reverse-plan-engine";
import type { ReversePlanGoal, ReversePlanStep } from "@/lib/reverse-plan-engine/types";
import { computeAnchorAges } from "@/lib/age-timeline";

const KIND_ICON: Record<ReversePlanStep["kind"], string> = {
  target: "🔀",
  prerequisite: "🧱",
};

/**
 * Future -> present visual flow: 🌸 the declared goal at the top, then each
 * required step in reverse-chronological order (🔀 for a goal's own target
 * event, 🧱 for something it depends on), ending with 🚶 on the
 * chronologically-nearest step — the one closest to today. The underlying
 * data (plan.steps) stays present -> future (the same chronological
 * convention the rest of the app's Timeline uses); this component is the
 * only place the order gets visually reversed for display.
 */
export function ReversePlanTimeline({
  goal,
  steps,
  currentAge,
}: {
  goal: ReversePlanGoal;
  steps: ReversePlanStep[];
  /** Display-only anchor for age labels — see src/lib/age-timeline. Optional so the component still renders without it. */
  currentAge?: number;
}) {
  const goalLabels = goal.selectedOptionIds
    .map((id) => REVERSE_PLAN_GOAL_OPTIONS_BY_ID[id]?.label)
    .filter((label): label is string => Boolean(label));

  const futureFirst = [...steps].reverse();
  const nearestStepId = steps[0]?.eventId;
  const isLongHorizon = goal.targetAge >= LONG_HORIZON_TARGET_AGE;

  const ageLabels = useMemo(() => {
    if (currentAge === undefined) return new Map<string, string>();
    const anchors = computeAnchorAges(
      steps.map((step) => ({ key: step.eventId, lifeEventId: step.eventId })),
      currentAge,
      goal.targetAge
    );
    return new Map([...anchors].map(([key, age]) => [key, `${age}歳ごろ`]));
  }, [steps, currentAge, goal.targetAge]);

  return (
    <div className="flex flex-col items-stretch">
      <div
        data-testid="reverse-plan-goal-card"
        className="animate-pop-in rounded-[28px] border border-pink-200 bg-gradient-to-br from-pink-50 to-orange-50 p-5 shadow-soft"
      >
        <p className="flex items-center gap-2 font-heading text-sm font-bold text-pink-800">
          <span aria-hidden className="text-xl">
            🌸
          </span>
          {goal.targetAge}歳ごろの未来
        </p>
        <ul className="mt-2 flex flex-col gap-1 text-sm font-semibold text-pink-900">
          {goalLabels.map((label) => (
            <li key={label}>・{label}</li>
          ))}
        </ul>
        {isLongHorizon && (
          <p className="mt-2 text-xs leading-relaxed text-pink-800">
            🕊️ この年齢まで、どんな選択肢を残しておけそうかという「未来の余白」として見てみましょう。
          </p>
        )}
      </div>

      {futureFirst.length === 0 ? (
        <div className="mt-3 rounded-[24px] border border-neutral-200 bg-white p-5 text-sm leading-relaxed text-neutral-600 shadow-soft">
          今の未来MAPには、すでにこの未来につながる要素が含まれているようです。
        </div>
      ) : (
        futureFirst.map((step, i) => {
          const icon = step.eventId === nearestStepId ? "🚶" : KIND_ICON[step.kind];
          return (
            <div key={step.eventId} className="flex flex-col items-center">
              <PathWave className="h-8 w-6 text-orange-300" />
              <div
                className="w-full animate-fade-in-up rounded-[24px] border border-neutral-100 bg-white p-5 shadow-soft"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-700">
                    <span aria-hidden>{icon}</span>
                    {step.periodLabel}
                  </span>
                  {ageLabels.has(step.eventId) && (
                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-600">
                      {ageLabels.get(step.eventId)}
                    </span>
                  )}
                </div>
                <p className="mt-2 font-heading text-base font-bold text-neutral-800">
                  {step.eventName}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                  {step.description}
                </p>
                {step.eventId === nearestStepId && (
                  <p className="mt-2 text-xs font-bold text-orange-700">
                    🚶 今のあなたに最も近い一歩です
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
