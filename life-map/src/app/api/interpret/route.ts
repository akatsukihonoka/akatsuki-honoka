import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import type {
  ChainAIInput,
  MapAIInput,
  ReversePlanAIInput,
  RouteAIInput,
  WhatIfAIInput,
} from "@/lib/ai/build-input";
import {
  interpretChain,
  interpretMap,
  interpretReversePlan,
  interpretRoute,
  interpretWhatIf,
} from "@/lib/ai/interpret";

// This route talks to the OpenAI API using OPENAI_API_KEY, a server-only
// env var — the browser never sees it and never calls OpenAI directly:
// Browser -> /api/interpret -> OpenAI API.
export const runtime = "nodejs";

const MAX_INPUT_JSON_LENGTH = 20_000;
const BAD_REQUEST_REASON = "リクエストの形式が正しくありません。";

const RequestSchema = z.object({
  kind: z.enum(["map", "route", "whatIf", "chain", "reversePlan"]),
  input: z.record(z.string(), z.unknown()),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: BAD_REQUEST_REASON }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, reason: BAD_REQUEST_REASON }, { status: 400 });
  }

  const { kind, input } = parsed.data;

  // Every AI input payload built by build-input.ts carries this marker —
  // a request missing it isn't the shape this route expects.
  if (input.calculatedBy !== "deterministic-engine") {
    return NextResponse.json({ ok: false, reason: BAD_REQUEST_REASON }, { status: 400 });
  }

  if (JSON.stringify(input).length > MAX_INPUT_JSON_LENGTH) {
    return NextResponse.json(
      { ok: false, reason: "リクエストが大きすぎます。" },
      { status: 400 }
    );
  }

  switch (kind) {
    case "map":
      return NextResponse.json(await interpretMap(input as unknown as MapAIInput));
    case "route":
      return NextResponse.json(await interpretRoute(input as unknown as RouteAIInput));
    case "whatIf":
      return NextResponse.json(await interpretWhatIf(input as unknown as WhatIfAIInput));
    case "chain":
      return NextResponse.json(await interpretChain(input as unknown as ChainAIInput));
    case "reversePlan":
      return NextResponse.json(
        await interpretReversePlan(input as unknown as ReversePlanAIInput)
      );
  }
}
