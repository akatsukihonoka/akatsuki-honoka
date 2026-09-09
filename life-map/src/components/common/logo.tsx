import { Map } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-400 text-white shadow-sm">
        <Map className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <span className="font-heading text-lg font-bold tracking-wide text-neutral-800">
        LIFE MAP
      </span>
    </div>
  );
}
