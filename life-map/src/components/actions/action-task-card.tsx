"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ActionTask } from "@/types/life-map";

export function ActionTaskCard({
  task,
  checked,
  onCheckedChange,
}: {
  task: ActionTask;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Card className={cn("border-neutral-200", checked && "bg-orange-50/40")}>
      <CardContent className="flex items-start gap-4 p-5">
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          aria-label={`${task.title}を完了にする`}
          className="mt-1"
        />
        <div className="flex-1">
          <span className="inline-flex w-fit items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
            {task.deadline}
          </span>
          <h3
            className={cn(
              "mt-2 font-heading text-base font-bold text-neutral-800",
              checked && "text-neutral-400 line-through"
            )}
          >
            {task.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-neutral-500">
            {task.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
