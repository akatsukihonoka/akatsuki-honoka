import { Card, CardContent } from "@/components/ui/card";
import type { ReversePlanAction } from "@/lib/reverse-plan-engine/types";

export function ReversePlanActions({ actions }: { actions: ReversePlanAction[] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-neutral-800">今日から動かせる3つのこと</p>
      {actions.map((action) => (
        <Card key={action.id} className="border-neutral-200">
          <CardContent className="flex items-start gap-4 p-5">
            <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
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
