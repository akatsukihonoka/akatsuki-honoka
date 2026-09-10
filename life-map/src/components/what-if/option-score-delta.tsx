import { ArrowRight } from "lucide-react";

function directionCopy(before: number, after: number): string {
  if (after > before) return "将来の選択肢が広がる方向に働く可能性があります。";
  if (after < before) return "将来の選択肢が少し限定される方向に働く可能性があります。";
  return "大きな変化にはつながらない可能性があります。";
}

export function OptionScoreDelta({ before, after }: { before: number; after: number }) {
  const delta = after - before;
  const sign = delta > 0 ? "+" : "";

  return (
    <div className="rounded-[28px] border border-orange-100 bg-gradient-to-br from-orange-50 via-pink-50 to-white p-5 shadow-soft">
      <p className="text-xs font-bold text-orange-700">✨ 未来の余白</p>
      <div className="mt-2 flex items-center justify-center gap-4">
        <div className="text-center">
          <p className="text-xs text-neutral-500">今</p>
          <p className="font-heading text-3xl font-bold text-neutral-400">{before}</p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-neutral-300" aria-hidden />
        <div className="text-center">
          <p className="text-xs text-neutral-500">試した未来</p>
          <p className="font-heading text-4xl font-bold text-orange-600">{after}</p>
        </div>
        {delta !== 0 && (
          <span
            className={
              delta > 0
                ? "rounded-full bg-emerald-100 px-2.5 py-1 text-sm font-bold text-emerald-700"
                : "rounded-full bg-amber-100 px-2.5 py-1 text-sm font-bold text-amber-800"
            }
          >
            {sign}
            {delta}
          </span>
        )}
      </div>
      <p className="mt-2 text-center text-xs leading-relaxed text-neutral-600">
        {directionCopy(before, after)}
      </p>
    </div>
  );
}
