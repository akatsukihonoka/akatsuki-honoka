import type OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";

import { getConfiguredModel, getOpenAIClient } from "./client";
import {
  chainTaskInstruction,
  mapTaskInstruction,
  reversePlanTaskInstruction,
  routeTaskInstruction,
  SYSTEM_PROMPT,
  whatIfTaskInstruction,
} from "./prompts";
import {
  MapInterpretationSchema,
  ReversePlanInterpretationSchema,
  RouteInterpretationSchema,
  WhatIfInterpretationSchema,
  type MapInterpretation,
  type ReversePlanInterpretation,
  type RouteInterpretation,
  type WhatIfInterpretation,
} from "./schemas";
import type {
  ChainAIInput,
  MapAIInput,
  ReversePlanAIInput,
  RouteAIInput,
  WhatIfAIInput,
} from "./build-input";

export type InterpretResult<T> = { ok: true; data: T } | { ok: false; reason: string };

export const NOT_CONFIGURED_REASON = "AIによる解説は現在利用できません。";
export const GENERIC_FAILURE_REASON = "AIによる解説を取得できませんでした。";

/** Lets tests inject a fake client/model without touching real env vars. */
export type InterpretOverrides = { client?: OpenAI; model?: string };

async function callInterpreter<T>(params: {
  client: OpenAI | undefined;
  model: string | undefined;
  instruction: string;
  input: unknown;
  schema: z.ZodType<T>;
  schemaName: string;
}): Promise<InterpretResult<T>> {
  if (!params.client || !params.model) {
    return { ok: false, reason: NOT_CONFIGURED_REASON };
  }

  try {
    const response = await params.client.responses.parse({
      model: params.model,
      instructions: SYSTEM_PROMPT,
      input: `${params.instruction}\n\n\`\`\`json\n${JSON.stringify(params.input)}\n\`\`\``,
      text: { format: zodTextFormat(params.schema, params.schemaName) },
    });

    const parsed = response.output_parsed;
    if (parsed === null || parsed === undefined) {
      return { ok: false, reason: GENERIC_FAILURE_REASON };
    }

    // Defense in depth: re-validate independently of the SDK's own parsing,
    // and use *this* result — never anything else the response carried —
    // as the returned data. Unknown keys (a hallucinated event id, a
    // recomputed score, anything outside the schema) are stripped by
    // zod's default object parsing here, not merely by the API's strict
    // mode upstream.
    const revalidated = params.schema.safeParse(parsed);
    if (!revalidated.success) {
      return { ok: false, reason: GENERIC_FAILURE_REASON };
    }
    return { ok: true, data: revalidated.data };
  } catch {
    // Covers APIError, RateLimitError, APIConnectionTimeoutError, JSON
    // parse failures, and anything else the SDK or network can throw —
    // all fold into the same graceful fallback signal.
    return { ok: false, reason: GENERIC_FAILURE_REASON };
  }
}

export async function interpretMap(
  input: MapAIInput,
  overrides?: InterpretOverrides
): Promise<InterpretResult<MapInterpretation>> {
  return callInterpreter({
    client: overrides?.client ?? getOpenAIClient(),
    model: overrides?.model ?? getConfiguredModel(),
    instruction: mapTaskInstruction(),
    input,
    schema: MapInterpretationSchema,
    schemaName: "map_interpretation",
  });
}

export async function interpretRoute(
  input: RouteAIInput,
  overrides?: InterpretOverrides
): Promise<InterpretResult<RouteInterpretation>> {
  return callInterpreter({
    client: overrides?.client ?? getOpenAIClient(),
    model: overrides?.model ?? getConfiguredModel(),
    instruction: routeTaskInstruction(),
    input,
    schema: RouteInterpretationSchema,
    schemaName: "route_interpretation",
  });
}

export async function interpretWhatIf(
  input: WhatIfAIInput,
  overrides?: InterpretOverrides
): Promise<InterpretResult<WhatIfInterpretation>> {
  return callInterpreter({
    client: overrides?.client ?? getOpenAIClient(),
    model: overrides?.model ?? getConfiguredModel(),
    instruction: whatIfTaskInstruction(),
    input,
    schema: WhatIfInterpretationSchema,
    schemaName: "what_if_interpretation",
  });
}

export async function interpretChain(
  input: ChainAIInput,
  overrides?: InterpretOverrides
): Promise<InterpretResult<WhatIfInterpretation>> {
  return callInterpreter({
    client: overrides?.client ?? getOpenAIClient(),
    model: overrides?.model ?? getConfiguredModel(),
    instruction: chainTaskInstruction(),
    input,
    schema: WhatIfInterpretationSchema,
    schemaName: "chain_interpretation",
  });
}

export async function interpretReversePlan(
  input: ReversePlanAIInput,
  overrides?: InterpretOverrides
): Promise<InterpretResult<ReversePlanInterpretation>> {
  return callInterpreter({
    client: overrides?.client ?? getOpenAIClient(),
    model: overrides?.model ?? getConfiguredModel(),
    instruction: reversePlanTaskInstruction(),
    input,
    schema: ReversePlanInterpretationSchema,
    schemaName: "reverse_plan_interpretation",
  });
}
