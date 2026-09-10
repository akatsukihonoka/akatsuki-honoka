import { stableHash } from "./hash";
import { INTERPRETATION_VERSION } from "./version";
import type { InterpretationKind } from "./schemas";

const CACHE_PREFIX = "life-map-ai-cache";

function cacheKey(kind: InterpretationKind, hash: string): string {
  return `${CACHE_PREFIX}:v${INTERPRETATION_VERSION}:${kind}:${hash}`;
}

/** Only the two Storage methods actually used — makes a plain object mockable in tests without a real localStorage. */
export type CacheStorage = { getItem(key: string): string | null; setItem(key: string, value: string): void };

export function computeScenarioHash(input: unknown): string {
  return stableHash(input);
}

export type CachedInterpretationResult<T> =
  | { ok: true; data: T; fromCache: boolean }
  | { ok: false; reason: string };

/**
 * Wraps an interpret* call with a localStorage-backed cache keyed by
 * kind + INTERPRETATION_VERSION + a hash of the exact structured input
 * (scenarioHash). Same input -> same key -> the fetcher never runs twice.
 * A version bump or any change to the input (a new scenario) changes the
 * key, so a stale explanation can never be shown against a newer MAP.
 * Framework-agnostic (no React) so it's directly unit-testable; the React
 * hook is a thin wrapper around this.
 */
export async function getCachedInterpretation<T>(params: {
  kind: InterpretationKind;
  input: unknown;
  storage?: CacheStorage;
  fetcher: () => Promise<{ ok: true; data: T } | { ok: false; reason: string }>;
}): Promise<CachedInterpretationResult<T>> {
  const hash = computeScenarioHash(params.input);
  const key = cacheKey(params.kind, hash);
  const storage =
    params.storage ?? (typeof window !== "undefined" ? window.localStorage : undefined);

  if (storage) {
    const raw = storage.getItem(key);
    if (raw !== null) {
      try {
        return { ok: true, data: JSON.parse(raw) as T, fromCache: true };
      } catch {
        // corrupted entry — fall through and refetch
      }
    }
  }

  const result = await params.fetcher();
  if (result.ok && storage) {
    try {
      storage.setItem(key, JSON.stringify(result.data));
    } catch {
      // storage full or unavailable — caching is best-effort only
    }
  }
  return result.ok ? { ok: true, data: result.data, fromCache: false } : result;
}
