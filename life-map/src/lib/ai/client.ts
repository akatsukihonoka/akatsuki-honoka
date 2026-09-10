import OpenAI from "openai";

/**
 * AI is an optional layer on top of the deterministic engines — every core
 * LIFE MAP feature (Diagnosis, Scenario/Event Engine, What-if, Chain,
 * Reverse Plan) works fully without it. Both env vars are required before
 * any OpenAI call is attempted; the model is never hardcoded so an
 * operator's env config is the single source of truth for which model runs.
 */
export function isAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY) && Boolean(process.env.OPENAI_MODEL);
}

export function getConfiguredModel(): string | undefined {
  return process.env.OPENAI_MODEL;
}

let cachedClient: OpenAI | undefined;

/**
 * Lazily constructs the OpenAI client (server-side only — this module must
 * never be imported from a "use client" component). Returns undefined when
 * OPENAI_API_KEY isn't set, so callers can short-circuit without the SDK
 * throwing its own construction-time error.
 */
export function getOpenAIClient(): OpenAI | undefined {
  if (!process.env.OPENAI_API_KEY) return undefined;
  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 20_000,
      maxRetries: 1,
    });
  }
  return cachedClient;
}
