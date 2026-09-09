function directionCopy(before: number, after: number): string {
  if (after > before) return "将来の選択肢が広がる方向に働く可能性があります。";
  if (after < before) return "将来の選択肢が少し限定される方向に働く可能性があります。";
  return "大きな変化にはつながらない可能性があります。";
}

export function OptionScoreDelta({ before, after }: { before: number; after: number }) {
  const delta = after - before;
  const sign = delta > 0 ? "+" : "";

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5">
      <p className="text-xs font-medium text-neutral-600">未来の余白</p>
      <div className="mt-2 flex items-end gap-4">
        <div>
          <p className="text-xs text-neutral-500">Before</p>
          <p className="font-heading text-2xl font-bold text-neutral-400">{before}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">After</p>
          <p className="font-heading text-2xl font-bold text-neutral-800">{after}</p>
        </div>
        {delta !== 0 && (
          <p
            className={
              delta > 0
                ? "pb-1 text-sm font-semibold text-emerald-700"
                : "pb-1 text-sm font-semibold text-amber-800"
            }
          >
            {sign}
            {delta}
          </p>
        )}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-neutral-600">
        {directionCopy(before, after)}
      </p>
    </div>
  );
}
