import type { UnexpectedBranch } from "@/lib/worldline";

/**
 * "✨ 意外な分岐" — shown only when buildWorldlineView actually found a
 * cross-category downstream addition in this specific chain's own causal
 * chain (see findUnexpectedBranch in src/lib/worldline/build-worldline.ts).
 * Never rendered from an AI guess; the caller passes undefined when the
 * engine didn't produce one, and this component returns null in that case.
 */
export function UnexpectedBranchCard({ branch }: { branch: UnexpectedBranch | undefined }) {
  if (!branch) return null;

  return (
    <div className="rounded-[24px] border border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-5 shadow-soft">
      <p className="font-heading text-sm font-bold text-amber-800">✨ 意外な分岐</p>
      <p className="mt-1 text-sm leading-relaxed text-neutral-700">
        「{branch.triggerEventName}」が、「{branch.eventName}」にもつながる可能性があります。
      </p>
      <p className="mt-1 text-xs leading-relaxed text-neutral-600">{branch.description}</p>
    </div>
  );
}
