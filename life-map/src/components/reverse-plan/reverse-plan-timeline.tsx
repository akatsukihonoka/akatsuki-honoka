import { ArrowDown } from "lucide-react";
import { REVERSE_PLAN_GOAL_OPTIONS_BY_ID } from "@/data/reverse-plan-goals";
import type { ReversePlanGoal, ReversePlanStep } from "@/lib/reverse-plan-engine/types";

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
}: {
  goal: ReversePlanGoal;
  steps: ReversePlanStep[];
}) {
  const goalLabels = goal.selectedOptionIds
    .map((id) => REVERSE_PLAN_GOAL_OPTIONS_BY_ID[id]?.label)
    .filter((label): label is string => Boolean(label));

  const futureFirst = [...steps].reverse();
  const nearestStepId = steps[0]?.eventId;

  return (
    <div className="flex flex-col items-stretch">
      <div data-testid="reverse-plan-goal-card" className="rounded-3xl border border-orange-200 bg-orange-50/70 p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-orange-800">
          <span aria-hidden>🌸</span>
          {goal.targetAge}歳ごろの未来
        </p>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-orange-900">
          {goalLabels.map((label) => (
            <li key={label}>・{label}</li>
          ))}
        </ul>
      </div>

      {futureFirst.length === 0 ? (
        <div className="mt-3 rounded-3xl border border-neutral-200 bg-white p-5 text-sm leading-relaxed text-neutral-600">
          今の未来MAPには、すでにこの未来につながる要素が含まれているようです。
        </div>
      ) : (
        futureFirst.map((step) => {
          const icon = step.eventId === nearestStepId ? "🚶" : KIND_ICON[step.kind];
          return (
            <div key={step.eventId} className="flex flex-col items-center">
              <ArrowDown className="my-2 h-4 w-4 text-neutral-300" aria-hidden />
              <div className="w-full rounded-3xl border border-neutral-200 bg-white p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600">
                    <span aria-hidden>{icon}</span>
                    {step.periodLabel}
                  </span>
                </div>
                <p className="mt-2 font-heading text-base font-bold text-neutral-800">
                  {step.eventName}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                  {step.description}
                </p>
                {step.eventId === nearestStepId && (
                  <p className="mt-2 text-xs font-medium text-orange-700">
                    今のあなたに最も近い一歩です
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
