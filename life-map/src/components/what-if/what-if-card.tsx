import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { WHAT_IF_LABELS } from "@/lib/what-if-engine/available-events";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import type { LifeEvent } from "@/types/life-map";

export function WhatIfCard({
  event,
  icon: Icon,
  href,
  deprioritized,
}: {
  event: LifeEvent;
  icon: LucideIcon;
  href: string;
  deprioritized?: boolean;
}) {
  const badge = CATEGORY_ICONS[event.category];

  return (
    <Link href={href} className="block">
      <div
        className={cn(
          "tap-bounce animate-pop-in flex items-center gap-4 rounded-[24px] border border-neutral-100 bg-white p-4 shadow-soft transition-transform hover:-translate-y-0.5",
          deprioritized && "opacity-70"
        )}
      >
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            badge.bg,
            badge.text
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="font-heading text-base font-bold text-neutral-800">
            もし、{WHAT_IF_LABELS[event.id] ?? event.name}？
          </p>
          <p className="mt-0.5 text-xs text-neutral-500">{event.description}</p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-neutral-300" aria-hidden />
      </div>
    </Link>
  );
}
