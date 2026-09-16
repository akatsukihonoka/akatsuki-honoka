import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { WHAT_IF_LABELS } from "@/lib/what-if-engine/available-events";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import type { LifeEvent } from "@/types/life-map";

export function WhatIfCard({
  event,
  icon: Icon,
  worldlineHref,
  compareHref,
  deprioritized,
}: {
  event: LifeEvent;
  icon: LucideIcon;
  /** Primary CTA: "🌌 この世界線を覗いてみる" — the new story-driven view. */
  worldlineHref: string;
  /** Secondary, retained CTA: the existing numeric Before/After comparison. */
  compareHref: string;
  deprioritized?: boolean;
}) {
  const badge = CATEGORY_ICONS[event.category];

  return (
    <div
      className={cn(
        "animate-pop-in flex flex-col gap-3 rounded-[24px] border border-neutral-100 bg-white p-4 shadow-soft",
        deprioritized && "opacity-70"
      )}
    >
      <div className="flex items-center gap-4">
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
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={worldlineHref}
          className="tap-bounce flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          この世界線を覗いてみる
        </Link>
        <Link
          href={compareHref}
          className="tap-bounce flex shrink-0 items-center gap-1 text-xs font-bold text-neutral-600 hover:text-neutral-800"
        >
          数字で比べる
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
