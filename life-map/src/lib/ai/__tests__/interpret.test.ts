import { describe, expect, it, vi } from "vitest";
import type OpenAI from "openai";
import { interpretMap, interpretRoute } from "../interpret";
import type { MapAIInput, RouteAIInput } from "../build-input";

function fakeClient(parseImpl: (...args: unknown[]) => unknown): OpenAI {
  return { responses: { parse: vi.fn(parseImpl) } } as unknown as OpenAI;
}

const mapInput: MapAIInput = {
  calculatedBy: "deterministic-engine",
  currentProfile: { money: 0, time: 0, career: 0, stability: 0, family: 0, freedom: 0, location: 0, experience: 0 },
  scenarios: [
    { routeId: "stable", title: "安定ルート", summary: "概要", optionScore: 55, valueMatch: 50, feasibility: 50, topEventNames: [] },
  ],
};

const routeInput: RouteAIInput = {
  calculatedBy: "deterministic-engine",
  currentProfile: { money: 0, time: 0, career: 0, stability: 0, family: 0, freedom: 0, location: 0, experience: 0 },
  route: {
    routeId: "stable",
    title: "安定ルート",
    summary: "概要",
    optionScore: 55,
    valueMatch: 50,
    feasibility: 50,
    events: [],
    risks: [],
  },
};

describe("Case 6: an invalid AI response is rejected, not adopted", () => {
  it("returns ok:false when output_parsed is missing a required field", async () => {
    const client = fakeClient(async () => ({
      output_parsed: { summary: "説明文だけ" }, // missing keyPoints
    }));
    const result = await interpretMap(mapInput, { client, model: "test-model" });
    expect(result.ok).toBe(false);
  });

  it("returns ok:false when output_parsed is null", async () => {
    const client = fakeClient(async () => ({ output_parsed: null }));
    const result = await interpretMap(mapInput, { client, model: "test-model" });
    expect(result.ok).toBe(false);
  });
});

describe("Case 7: an API error falls back gracefully", () => {
  it("returns ok:false instead of throwing when the client rejects", async () => {
    const client = fakeClient(async () => {
      throw new Error("simulated APIError: 500 Internal Server Error");
    });
    const result = await interpretRoute(routeInput, { client, model: "test-model" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(typeof result.reason).toBe("string");
    }
  });
});

describe("Case 8: a timeout falls back gracefully", () => {
  it("returns ok:false instead of throwing when the client rejects with a timeout-like error", async () => {
    const client = fakeClient(async () => {
      const err = new Error("Request timed out");
      err.name = "APIConnectionTimeoutError";
      throw err;
    });
    const result = await interpretMap(mapInput, { client, model: "test-model" });
    expect(result.ok).toBe(false);
  });
});

describe("returns ok:false when unconfigured (no client/model)", () => {
  it("never attempts a call without a client and model", async () => {
    const result = await interpretMap(mapInput, {});
    expect(result.ok).toBe(false);
  });
});

describe("Case 11: an AI-added event is never adopted", () => {
  it("strips an unexpected event-like field from the parsed result", async () => {
    const client = fakeClient(async () => ({
      output_parsed: {
        summary: "説明文",
        keyPoints: ["ポイント1", "ポイント2"],
        caveat: null,
        // Hallucinated / out-of-schema fields an AI might try to add:
        addedEventId: "marriage",
        newEvent: { id: "overseas_move", name: "海外に拠点を移す" },
      },
    }));
    const result = await interpretMap(mapInput, { client, model: "test-model" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Object.keys(result.data).sort()).toEqual(["caveat", "keyPoints", "summary"]);
    expect("addedEventId" in result.data).toBe(false);
    expect("newEvent" in result.data).toBe(false);
  });
});

describe("Case 12: an AI-altered number is never adopted", () => {
  it("strips an unexpected numeric field (e.g. a recomputed optionScore) from the parsed result", async () => {
    const client = fakeClient(async () => ({
      output_parsed: {
        summary: "安定ルートの説明",
        whyThisRoute: "変化を抑える方向です。",
        strengths: ["安定しています。"],
        tradeoffs: ["変化への対応力は下がるかもしれません。"],
        optionScore: 999, // an AI-invented recalculated number
      },
    }));
    const result = await interpretRoute(routeInput, { client, model: "test-model" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect("optionScore" in result.data).toBe(false);
    // The original, deterministic value is untouched at its source.
    expect(routeInput.route.optionScore).toBe(55);
  });
});
