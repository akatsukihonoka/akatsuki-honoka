"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The one "もっと見る / 閉じる" pattern used everywhere long text needs to
 * stay out of the first screen (AI cards, timeline event detail, etc.).
 * Nothing is deleted — content is always in the DOM, just collapsed.
 */
export function Expandable({
  label = "もっと見る",
  collapsedLabel = "閉じる",
  children,
  className,
  buttonClassName,
  defaultOpen = false,
}: {
  label?: string;
  collapsedLabel?: string;
  children: React.ReactNode;
  className?: string;
  buttonClassName?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      {open && <div className="animate-fade-in-up">{children}</div>}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "tap-bounce mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-orange-700",
          buttonClassName
        )}
      >
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")}
          aria-hidden
        />
        {open ? collapsedLabel : label}
      </button>
    </div>
  );
}
