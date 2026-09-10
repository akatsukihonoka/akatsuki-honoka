import { Card, CardContent } from "@/components/ui/card";
import type { ReversePlanAction, ReversePlanActionTimeframe } from "@/lib/reverse-plan-engine/types";

const TIMEFRAME_ICON: Record<ReversePlanActionTimeframe, string> = {
  this_month: "📝",
  within_3_months: "🔎",
  within_1_year: "🌱",
};

const TIMEFRAME_BADGE: Record<ReversePlanActionTimeframe, string> = {
  this_month: "bg-sky-100 text-sky-700",
  within_3_months: "bg-amber-100 text-amber-700",
  within_1_year: "bg-emerald-100 text-emerald-700",
};

export function ReversePlanActions({ actions }: { actions: ReversePlanAction[] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-heading text-sm font-bold text-neutral-800">🚶 今日から動かせる3つのこと</p>
      {actions.map((action, i) => (
        <Card
          key={action.id}
          className="animate-fade-in-up rounded-[24px] border-neutral-100 shadow-soft"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <CardContent className="flex items-start gap-4 p-5">
            <span
              className={`inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${TIMEFRAME_BADGE[action.timeframe]}`}
            >
              <span aria-hidden>{TIMEFRAME_ICON[action.timeframe]}</span>
              {action.timeframeLabel}
            </span>
            <div className="flex-1">
              <h3 className="font-heading text-base font-bold text-neutral-800">
                {action.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                {action.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
