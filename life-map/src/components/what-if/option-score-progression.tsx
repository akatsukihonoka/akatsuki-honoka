export function OptionScoreProgression({ values }: { values: number[] }) {
  if (values.length < 2) return null;

  return (
    <div className="rounded-[24px] border border-neutral-200 bg-white p-5 shadow-soft">
      <p className="text-xs font-bold text-neutral-600">未来の余白の変化</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {values.map((value, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden className="text-orange-300">
                →
              </span>
            )}
            <span
              className={
                i === values.length - 1
                  ? "font-heading text-xl font-bold text-orange-600"
                  : "font-heading text-lg font-bold text-neutral-500"
              }
            >
              {value}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-neutral-600">
        「もしも」を重ねるごとに、将来の選択肢の広さがどう変わっていくかを表しています。
      </p>
    </div>
  );
}
