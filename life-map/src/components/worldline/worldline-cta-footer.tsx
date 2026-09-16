import Link from "next/link";
import { ArrowRight, GitBranch, ListChecks, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The end of one worldline's story — never "the end" of exploring. Mirrors
 * MAP's own 見る→試す→分岐する→比べる→逆算する→動く flow: another
 * worldline (/if), a numeric compare of this one, reverse-planning from it,
 * or acting on it now.
 */
export function WorldlineCtaFooter({
  ifHref,
  compareHref,
  reversePlanHref = "/reverse-plan",
  actionsHref = "/actions",
}: {
  ifHref: string;
  compareHref: string;
  reversePlanHref?: string;
  actionsHref?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[28px] border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 text-center shadow-soft">
        <p className="font-heading text-sm font-bold text-violet-800">
          🌌 この世界線の先には、まだいくつもの分岐があります。
        </p>
        <p className="mt-1 text-xs leading-relaxed text-neutral-600">ここで終わりではありません。</p>
      </div>

      <Link
        href={compareHref}
        className="tap-bounce inline-flex items-center justify-center gap-1.5 self-center text-xs font-bold text-orange-700 underline-offset-4 hover:underline"
      >
        数字でくわしく比べる
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>

      <div className="flex flex-col gap-2">
        <Button asChild variant="secondary" size="lg" className="tap-bounce">
          <Link href={ifHref}>
            <GitBranch className="h-4 w-4" />
            もう一つの世界線を覗く
          </Link>
        </Button>
        <Button asChild variant="secondary" size="lg" className="tap-bounce">
          <Link href={reversePlanHref}>
            <TimerReset className="h-4 w-4" />
            この未来を逆算する
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          className="tap-bounce bg-gradient-to-r from-orange-400 to-pink-400 shadow-soft-lg hover:opacity-90"
        >
          <Link href={actionsHref}>
            <ListChecks className="h-4 w-4" />
            じゃあ、今なにする？
          </Link>
        </Button>
      </div>
    </div>
  );
}
