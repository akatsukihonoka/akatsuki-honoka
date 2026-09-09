import { AlertTriangle, GitBranch, Sparkles } from "lucide-react";
import type { ScenarioEvent } from "@/types/life-map";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function TimelineEventCard({
  event,
  isLast,
  accentClass,
  dotClass,
}: {
  event: ScenarioEvent;
  isLast: boolean;
  accentClass: string;
  dotClass: string;
}) {
  return (
    <div className="relative flex gap-4 pb-8">
      <div className="flex flex-col items-center">
        <span className={cn("h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-white", dotClass)} />
        {!isLast && <span className="mt-1 w-px flex-1 bg-neutral-200" />}
      </div>

      <div className="flex-1 pb-2">
        <span className={cn("text-xs font-semibold", accentClass)}>{event.period}</span>
        <Card className="mt-2 border-neutral-200">
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-base font-bold text-neutral-800">
                {event.title}
              </h3>
              {event.isBranchPoint && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                  <GitBranch className="h-3 w-3" />
                  分岐点
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-neutral-600">{event.description}</p>

            {event.changes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {event.changes.map((change) => (
                  <span
                    key={change}
                    className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700"
                  >
                    {change}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 border-t border-neutral-100 pt-3 text-sm">
              <div className="flex gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <ul className="flex flex-col gap-1 text-neutral-600">
                  {event.advantages.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <ul className="flex flex-col gap-1 text-neutral-600">
                  {event.cautions.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
