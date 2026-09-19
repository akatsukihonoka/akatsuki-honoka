import type { UnexpectedBranch } from "@/lib/worldline";

/**
 * "✨ 意外な変化" — a short teaser shown near the top of the page (see
 * STEP 2's structure) to surface the exciting part before the long
 * timeline, not a full re-explanation. The event's own description,
 * advantages, and cautions live once, in the matching timeline card,
 * which carries the same "✨ 意外な変化" badge (see WorldlineStoryTimeline)
 * — this card intentionally does not repeat them.
 *
 * Shown only when buildWorldlineView actually found a cross-category
 * downstream addition in this specific chain's own causal chain. Never
 * rendered from an AI guess; the caller passes undefined when the engine
 * didn't produce one, and this component returns null in that case.
 */
export function UnexpectedBranchCard({ branch }: { branch: UnexpectedBranch | undefined }) {
  if (!branch) return null;

  return (
    <div className="rounded-[24px] border border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-5 shadow-soft">
      <p className="font-heading text-sm font-bold text-amber-800">✨ 意外な変化</p>
      <p className="mt-1 text-sm leading-relaxed text-neutral-700">
        「{branch.triggerEventName}」が、「{branch.eventName}」にもつながる可能性があります。
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-neutral-600">
        くわしくは、下のストーリーの中で見てみましょう。
      </p>
    </div>
  );
}
