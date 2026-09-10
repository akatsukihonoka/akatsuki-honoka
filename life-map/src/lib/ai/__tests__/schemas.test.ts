import { describe, expect, it } from "vitest";
import {
  MapInterpretationSchema,
  ReversePlanInterpretationSchema,
  RouteInterpretationSchema,
  WhatIfInterpretationSchema,
} from "../schemas";

describe("Case 5: Structured Output schema validation", () => {
  it("accepts a well-formed MapInterpretation", () => {
    const result = MapInterpretationSchema.safeParse({
      summary: "安定と自由のバランスが重要なテーマです。",
      keyPoints: ["選択肢を増やす方向が考えられます。", "時間の余白も論点になりそうです。"],
      caveat: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a MapInterpretation missing keyPoints", () => {
    const result = MapInterpretationSchema.safeParse({
      summary: "テーマの説明",
      caveat: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a RouteInterpretation with the wrong type for strengths", () => {
    const result = RouteInterpretationSchema.safeParse({
      summary: "安定ルートの説明",
      whyThisRoute: "変化を抑える方向です。",
      strengths: "安定している", // should be an array, not a string
      tradeoffs: ["変化への対応力は下がるかもしれません。"],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a WhatIfInterpretation with nullable fields omitted as null", () => {
    const result = WhatIfInterpretationSchema.safeParse({
      summary: "転職を加えた場合の変化です。",
      keyPoints: ["キャリアの選択肢が広がる可能性があります。"],
      explanation: null,
      caveat: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a ReversePlanInterpretation whose whyThisOrder is missing", () => {
    const result = ReversePlanInterpretationSchema.safeParse({
      summary: "35歳ごろの目標から逆算した結果です。",
      caveat: null,
    });
    expect(result.success).toBe(false);
  });
});
