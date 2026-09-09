"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function BackButton({
  className,
  onClick,
  label = "戻る",
}: {
  className?: string;
  onClick?: () => void;
  label?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={onClick ?? (() => router.back())}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700",
        className
      )}
      aria-label={label}
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
