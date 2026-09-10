import { Compass } from "lucide-react";
import type { InterpretationStatus } from "@/lib/ai/use-interpretation";

/**
 * AI解説は「MAPの横にいる小さなガイド」であって主役ではない — 大きな枠や
 * 目立つ配色ではなく、控えめな吹き出しとして表示する。中身（summaryを除く
 * 詳しい説明）はもっと見る側で折りたたむのが各呼び出し元の役割。
 */
export function InterpretationCardShell({
  title,
  status,
  loadingMessage,
  children,
}: {
  title: string;
  status: InterpretationStatus;
  loadingMessage: string;
  children: React.ReactNode;
}) {
  const isLoading = status === "idle" || status === "loading";

  return (
    <div className="flex items-start gap-3 rounded-[22px] border border-dashed border-orange-200 bg-orange-50/40 p-4">
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 to-pink-300 text-white shadow-sm"
        aria-hidden
      >
        <Compass className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-xs font-bold text-orange-700">{title}</h2>
        <div className="mt-1.5">
          {isLoading ? (
            <p className="flex items-center gap-2 text-xs text-neutral-600" aria-live="polite">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-orange-400" aria-hidden />
              {loadingMessage}
            </p>
          ) : (
            <>
              {children}
              {status === "fallback" && (
                <p className="mt-2 text-[11px] leading-relaxed text-neutral-600">
                  AIによる解説を取得できませんでした。MAPそのものはそのまま利用できます。
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
