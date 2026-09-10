import { Sparkles } from "lucide-react";
import type { InterpretationStatus } from "@/lib/ai/use-interpretation";

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
    <div className="rounded-3xl border border-orange-200 bg-orange-50/50 p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-orange-500" aria-hidden />
        <h2 className="font-heading text-sm font-bold text-orange-800">{title}</h2>
      </div>
      <div className="mt-3">
        {isLoading ? (
          <p className="flex items-center gap-2 text-sm text-neutral-600" aria-live="polite">
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-orange-400" aria-hidden />
            {loadingMessage}
          </p>
        ) : (
          <>
            {children}
            {status === "fallback" && (
              <p className="mt-3 text-xs text-neutral-600">
                AIによる解説を取得できませんでした。MAPそのものはそのまま利用できます。
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
