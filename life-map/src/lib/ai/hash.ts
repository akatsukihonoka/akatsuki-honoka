/**
 * Deterministic, dependency-free hash of a JSON-serializable value — used
 * only for cache-key invalidation (scenarioHash), not for anything
 * security-sensitive. Object keys are sorted first so the same logical
 * value always hashes identically regardless of property insertion order.
 */
function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => [key, sortKeysDeep((value as Record<string, unknown>)[key])])
    );
  }
  return value;
}

/** FNV-1a, 32-bit, returned as an 8-character hex string. */
export function stableHash(value: unknown): string {
  const json = JSON.stringify(sortKeysDeep(value));
  let hash = 0x811c9dc5;
  for (let i = 0; i < json.length; i += 1) {
    hash ^= json.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
