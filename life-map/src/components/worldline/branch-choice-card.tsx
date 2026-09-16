import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { WHAT_IF_LABELS, type AvailableWhatIfOption } from "@/lib/what-if-engine/available-events";

/**
 * "🔀 ここで未来が分岐します" — up to MAX_BRANCH_OPTIONS real, currently
 * eligible what-if events (the same getAvailableWhatIfOptions the /if
 * picker uses), never a fabricated choice. Tapping one extends the current
 * chain by one more event and re-renders /worldline with it applied.
 */
export function BranchChoiceCard({
  ageLabel,
  options,
  buildHref,
}: {
  ageLabel?: string;
  options: AvailableWhatIfOption[];
  buildHref: (eventId: string) => string;
}) {
  if (options.length === 0) return null;

  return (
    <div className="rounded-[28px] border-2 border-dashed border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 shadow-soft">
      <p className="font-heading text-sm font-bold text-violet-800">
        🔀 {ageLabel ? `${ageLabel}、` : ""}ここで未来が分岐します
      </p>
      <p className="mt-0.5 text-xs leading-relaxed text-violet-700">
        ここから、こんな選択肢があります。タップすると、その先を覗けます。
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {options.map(({ event, deprioritized }) => {
          const badge = CATEGORY_ICONS[event.category];
          return (
            <Link
              key={event.id}
              href={buildHref(event.id)}
              className={`tap-bounce flex items-center gap-3 rounded-[20px] border border-white bg-white/90 p-3.5 shadow-sm transition-transform hover:-translate-y-0.5 ${
                deprioritized ? "opacity-70" : ""
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${badge.bg}`}
                aria-hidden
              >
                {badge.emoji}
              </span>
              <span className="flex-1 text-sm font-bold text-neutral-800">
                {WHAT_IF_LABELS[event.id] ?? event.name}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
