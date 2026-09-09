import type { BottleneckRisk } from "@/types/life-map";

function riskKey(risk: BottleneckRisk): string {
  return `${risk.period}|${risk.message}`;
}

/**
 * Diffs two risk lists (typically the base scenario's timeline vs. the
 * what-if scenario's) into what's newly appeared and what no longer
 * applies. Identity is by period + message, since the message itself
 * already names the specific events clustering in that period.
 */
export function diffRisks(
  before: BottleneckRisk[],
  after: BottleneckRisk[]
): { newRisks: BottleneckRisk[]; resolvedRisks: BottleneckRisk[] } {
  const beforeKeys = new Set(before.map(riskKey));
  const afterKeys = new Set(after.map(riskKey));

  return {
    newRisks: after.filter((r) => !beforeKeys.has(riskKey(r))),
    resolvedRisks: before.filter((r) => !afterKeys.has(riskKey(r))),
  };
}
