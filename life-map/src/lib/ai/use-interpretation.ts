"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { computeScenarioHash, getCachedInterpretation } from "./cached-interpret";
import type { InterpretationKind } from "./schemas";

export type InterpretationStatus = "idle" | "loading" | "success" | "fallback";

const DEFAULT_LOADING_MESSAGES: Record<InterpretationKind, [string, string]> = {
  map: ["MAPを読み解いています…", "あなたの選択と未来の分岐を整理しています…"],
  route: ["ルートの特徴を整理しています…", "価値観との一致度を確認しています…"],
  whatIf: ["この変化を読み解いています…", "連鎖する変化を整理しています…"],
  chain: ["複数の変化を読み解いています…", "組み合わせの特徴を整理しています…"],
  reversePlan: ["逆算の理由を整理しています…", "目標までの道すじを確認しています…"],
};

const LOADING_STEP_MS = 900;

/**
 * Fetches (and caches) one AI interpretation for the current screen.
 * Never called more than once for the same logical input (guarded by a
 * hash, both here and again inside getCachedInterpretation's localStorage
 * layer), and never blocks the rest of the page — callers render their
 * normal content regardless of `status`, this hook only drives one card.
 * On any failure it resolves to the caller-supplied deterministic
 * `fallback`, so LIFE MAP's explanation cards never depend on the AI
 * being configured or reachable.
 *
 * The effect is keyed on a content hash of `input`, not on `input` itself:
 * callers commonly rebuild `input` as a fresh object every render (even
 * when its content hasn't changed), and keying on the object reference
 * would run the effect's cleanup on every such render — cancelling an
 * in-flight request before its `.then()` ever runs, leaving the card
 * stuck on the loading message forever.
 */
export function useAIInterpretation<TInput extends object, TData>(params: {
  kind: InterpretationKind;
  input: TInput | undefined;
  fallback: (input: TInput) => TData;
}): { status: InterpretationStatus; data: TData | undefined; loadingMessage: string } {
  const { kind, input, fallback } = params;
  const [status, setStatus] = useState<InterpretationStatus>("idle");
  const [data, setData] = useState<TData | undefined>(undefined);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Always hold the latest input/fallback so the effect (which only
  // re-runs when the hash actually changes) still reads fresh values. Refs
  // are synced from an effect (not during render) so every render commits
  // before the ref updates, per React's rules for ref mutation.
  const inputRef = useRef(input);
  const fallbackRef = useRef(fallback);
  useEffect(() => {
    inputRef.current = input;
    fallbackRef.current = fallback;
  });

  const inputHash = useMemo(() => (input ? computeScenarioHash(input) : undefined), [input]);

  useEffect(() => {
    const currentInput = inputRef.current;
    if (!currentInput || !inputHash) return;

    let cancelled = false;
    setStatus("loading");
    setLoadingMessageIndex(0);

    getCachedInterpretation<TData>({
      kind,
      input: currentInput,
      fetcher: async () => {
        try {
          const res = await fetch("/api/interpret", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kind, input: currentInput }),
          });
          const json: unknown = await res.json().catch(() => undefined);
          if (
            json &&
            typeof json === "object" &&
            "ok" in json &&
            (json as { ok: boolean }).ok &&
            "data" in json
          ) {
            return { ok: true, data: (json as { data: TData }).data };
          }
          const reason =
            json && typeof json === "object" && "reason" in json
              ? String((json as { reason: unknown }).reason)
              : "AIによる解説を取得できませんでした。";
          return { ok: false, reason };
        } catch {
          return { ok: false, reason: "AIによる解説を取得できませんでした。" };
        }
      },
    }).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setData(result.data);
        setStatus("success");
      } else {
        setData(fallbackRef.current(currentInput));
        setStatus("fallback");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [kind, inputHash]);

  useEffect(() => {
    if (status !== "loading") return;
    const timer = setInterval(() => {
      setLoadingMessageIndex((i) => Math.min(i + 1, 1));
    }, LOADING_STEP_MS);
    return () => clearInterval(timer);
  }, [status]);

  const [first, second] = DEFAULT_LOADING_MESSAGES[kind];

  return {
    status,
    data,
    loadingMessage: loadingMessageIndex === 0 ? first : second,
  };
}
