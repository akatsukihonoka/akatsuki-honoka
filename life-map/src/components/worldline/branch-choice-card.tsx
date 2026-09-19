import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { WHAT_IF_LABELS, type AvailableWhatIfOption } from "@/lib/what-if-engine/available-events";

/**
 * "🔀 次の選択肢" — up to MAX_BRANCH_OPTIONS real, currently eligible
 * what-if events (getAvailableWhatIfOptions, excluding every event already
 * present anywhere in this worldline — see buildWorldlineView), never a
 * fabricated choice and never a no-op tap. Always renders something (a
 * picker, an at-limit note, or a "no new branches" note) rather than
 * silently disappearing, so the page never has an unexplained gap.
 */
export function BranchChoiceCard({
  options,
  buildHref,
  atChainLimit,
}: {
  options: AvailableWhatIfOption[];
  buildHref: (eventId: string) => string;
  atChainLimit: boolean;
}) {
  return (
    <div className="rounded-[28px] border-2 border-dashed border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 shadow-soft">
      <p className="font-heading text-sm font-bold text-violet-800">🔀 次の選択肢</p>

      {atChainLimit ? (
        <p className="mt-0.5 text-xs leading-relaxed text-violet-700">
          ここまでで3つの選択を重ねました。まずはこの世界線をじっくり眺めてみましょう。
        </p>
      ) : options.length === 0 ? (
        <p className="mt-0.5 text-xs leading-relaxed text-violet-700">
          この先には、今のところ新しい分岐はありません。
        </p>
      ) : (
        <>
          <p className="mt-0.5 text-xs leading-relaxed text-violet-700">
            ここから、さらに別の未来へ進めます。タップすると、その先を覗けます。
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
        </>
      )}
    </div>
  );
}
