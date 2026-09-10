import { describe, expect, it, vi } from "vitest";
import { getCachedInterpretation, type CacheStorage } from "../cached-interpret";

function memoryStorage(): CacheStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

describe("Case 9: a scenarioHash change never reuses an old explanation", () => {
  it("fetches independently for two different inputs, and each keeps its own cached value", async () => {
    const storage = memoryStorage();
    const fetcher = vi.fn(async () => ({ ok: true as const, data: { summary: "A" } }));

    const first = await getCachedInterpretation({
      kind: "map",
      input: { scenario: "A" },
      storage,
      fetcher,
    });
    expect(first).toMatchObject({ ok: true, data: { summary: "A" }, fromCache: false });

    const fetcherB = vi.fn(async () => ({ ok: true as const, data: { summary: "B" } }));
    const second = await getCachedInterpretation({
      kind: "map",
      input: { scenario: "B" },
      storage,
      fetcher: fetcherB,
    });
    expect(second).toMatchObject({ ok: true, data: { summary: "B" }, fromCache: false });

    // Re-requesting the first input still returns A's cached value, not B's.
    const thirdFetcher = vi.fn(async () => ({ ok: true as const, data: { summary: "SHOULD_NOT_BE_CALLED" } }));
    const third = await getCachedInterpretation({
      kind: "map",
      input: { scenario: "A" },
      storage,
      fetcher: thirdFetcher,
    });
    expect(third).toMatchObject({ ok: true, data: { summary: "A" }, fromCache: true });
    expect(thirdFetcher).not.toHaveBeenCalled();
  });
});

describe("Case 10: the same scenario never triggers an unnecessary regeneration", () => {
  it("calls the fetcher exactly once across repeated requests for identical input", async () => {
    const storage = memoryStorage();
    const fetcher = vi.fn(async () => ({ ok: true as const, data: { summary: "same" } }));

    await getCachedInterpretation({ kind: "route", input: { routeId: "stable" }, storage, fetcher });
    await getCachedInterpretation({ kind: "route", input: { routeId: "stable" }, storage, fetcher });
    const finalResult = await getCachedInterpretation({
      kind: "route",
      input: { routeId: "stable" },
      storage,
      fetcher,
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(finalResult).toMatchObject({ ok: true, data: { summary: "same" }, fromCache: true });
  });

  it("does not cache a failed fetch, so a later retry can still succeed", async () => {
    const storage = memoryStorage();
    let attempt = 0;
    const fetcher = vi.fn(async () => {
      attempt += 1;
      if (attempt === 1) return { ok: false as const, reason: "temporary failure" };
      return { ok: true as const, data: { summary: "recovered" } };
    });

    const first = await getCachedInterpretation({ kind: "chain", input: { x: 1 }, storage, fetcher });
    expect(first.ok).toBe(false);

    const second = await getCachedInterpretation({ kind: "chain", input: { x: 1 }, storage, fetcher });
    expect(second).toMatchObject({ ok: true, data: { summary: "recovered" } });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
