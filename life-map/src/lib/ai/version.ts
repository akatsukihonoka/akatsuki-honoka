/**
 * Bump whenever prompts.ts or schemas.ts changes meaning — every cached
 * interpretation's key includes this, so a version bump makes all
 * previously-cached explanations unreachable (never displayed as if they
 * matched the new prompt/schema) without needing an explicit migration.
 */
export const INTERPRETATION_VERSION = 1;
