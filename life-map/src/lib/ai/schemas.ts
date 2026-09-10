import { z } from "zod";

/**
 * Structured Output schemas for every AI interpretation kind. Every field is
 * a bounded string or an array of bounded strings — deliberately no numeric,
 * event-id, or score fields exist anywhere here. That is the structural
 * guarantee behind "the AI cannot change a deterministic value": there is
 * simply no slot in these types for it to put one, and OpenAI's Structured
 * Outputs (strict JSON Schema) rejects additional properties outright, so a
 * hallucinated extra field never reaches the parsed result either.
 *
 * `.nullable()` (not `.optional()`) is used for "may be omitted" fields —
 * OpenAI's strict Structured Outputs mode requires every key to be present
 * in the schema's `required` list; optionality is expressed by allowing
 * `null`, not by allowing the key to be missing.
 */

const summaryField = z.string().min(1).max(220);
const bulletField = z.string().min(1).max(140);
const caveatField = z.string().min(1).max(160).nullable();

/** MAP全体の解説: "このMAPを読み解くと" */
export const MapInterpretationSchema = z.object({
  summary: summaryField,
  keyPoints: z.array(bulletField).min(2).max(4),
  caveat: caveatField,
});
export type MapInterpretation = z.infer<typeof MapInterpretationSchema>;

/** ルート詳細の解説: "このルートの特徴" */
export const RouteInterpretationSchema = z.object({
  summary: summaryField,
  whyThisRoute: z.string().min(1).max(220),
  strengths: z.array(bulletField).min(1).max(3),
  tradeoffs: z.array(bulletField).min(1).max(3),
});
export type RouteInterpretation = z.infer<typeof RouteInterpretationSchema>;

/** What-if / Chain What-if の解説: "この変化を試してみると" / "この組み合わせの特徴" */
export const WhatIfInterpretationSchema = z.object({
  summary: summaryField,
  keyPoints: z.array(bulletField).min(1).max(4),
  explanation: z.string().min(1).max(260).nullable(),
  caveat: caveatField,
});
export type WhatIfInterpretation = z.infer<typeof WhatIfInterpretationSchema>;

/** Reverse Plan の解説: "なぜこの順番？" */
export const ReversePlanInterpretationSchema = z.object({
  summary: summaryField,
  whyThisOrder: z.string().min(1).max(260),
  caveat: caveatField,
});
export type ReversePlanInterpretation = z.infer<typeof ReversePlanInterpretationSchema>;

export type InterpretationKind = "map" | "route" | "whatIf" | "chain" | "reversePlan";

export type InterpretationResultFor<K extends InterpretationKind> = K extends "map"
  ? MapInterpretation
  : K extends "route"
    ? RouteInterpretation
    : K extends "whatIf" | "chain"
      ? WhatIfInterpretation
      : ReversePlanInterpretation;
