import { AXIS_META } from "@/components/what-if/axis-meta";
import type {
  ChainAIInput,
  MapAIInput,
  ReversePlanAIInput,
  RouteAIInput,
  WhatIfAIInput,
} from "./build-input";
import type {
  MapInterpretation,
  ReversePlanInterpretation,
  RouteInterpretation,
  WhatIfInterpretation,
} from "./schemas";
import type { EffectAxis, ValueProfile } from "@/types/life-map";

/**
 * Deterministic, non-AI template text — used whenever the AI is
 * unconfigured or a call fails. These are plain functions over the same
 * lean inputs the AI receives, so LIFE MAP's explanation cards never go
 * blank even without an OpenAI key. No LLM call, no network, no
 * randomness: same input always yields the same text.
 */

function topAxes(profile: ValueProfile, count: number): EffectAxis[] {
  return (Object.keys(profile) as EffectAxis[])
    .filter((axis) => profile[axis] !== 0)
    .sort((a, b) => Math.abs(profile[b]) - Math.abs(profile[a]) || a.localeCompare(b))
    .slice(0, count);
}

export function fallbackMapInterpretation(input: MapAIInput): MapInterpretation {
  const axes = topAxes(input.currentProfile, 2);
  const axisPhrase =
    axes.length > 0
      ? axes.map((a) => AXIS_META[a].label).join("と")
      : "バランスの取れた価値観";

  return {
    summary: `今のあなたの回答からは、「${axisPhrase}」が重要なテーマとして見えています。`,
    keyPoints: input.scenarios.map(
      (s) => `${s.title}：未来の余白は${s.optionScore}前後で推移しています。`
    ),
    caveat: "この説明はAIを使わない簡易版です。各ルートの詳細は個別に確認してみてください。",
  };
}

export function fallbackRouteInterpretation(input: RouteAIInput): RouteInterpretation {
  return {
    summary: `${input.route.title}は、未来の余白が${input.route.optionScore}前後のルートです。`,
    whyThisRoute: `${input.route.summary}`,
    strengths: [`価値観との一致度は${input.route.valueMatch}前後です。`],
    tradeoffs: [`実現しやすさの目安は${input.route.feasibility}前後です。`],
  };
}

export function fallbackWhatIfInterpretation(input: WhatIfAIInput): WhatIfInterpretation {
  const delta = input.optionScoreAfter - input.optionScoreBefore;
  const direction = delta > 0 ? "広がる" : delta < 0 ? "少し狭まる" : "大きくは変わらない";

  return {
    summary: `この変化により、未来の余白は${input.optionScoreBefore}から${input.optionScoreAfter}に変化する可能性があります。`,
    keyPoints: [
      `全体としては選択肢が${direction}方向に働く可能性があります。`,
      ...input.addedEventNames.slice(0, 2).map((name) => `「${name}」が新たに加わります。`),
    ],
    explanation: "この説明はAIを使わない簡易版です。詳しい変化の流れは、下の一覧をご覧ください。",
    caveat: input.newRisks.length > 0 ? input.newRisks[0].message : null,
  };
}

export function fallbackChainInterpretation(input: ChainAIInput): WhatIfInterpretation {
  const delta = input.optionScoreAfter - input.optionScoreBefore;
  const direction = delta > 0 ? "広がる" : delta < 0 ? "少し狭まる" : "大きくは変わらない";

  return {
    summary: `${input.appliedEventNames.length}つの変化を重ねた結果、未来の余白は${direction}方向に動く可能性があります。`,
    keyPoints: input.appliedEventNames.map((name) => `「${name}」を含む変化です。`),
    explanation: "この説明はAIを使わない簡易版です。詳しい内訳は変わったところの一覧をご覧ください。",
    caveat: input.newRisks.length > 0 ? input.newRisks[0].message : null,
  };
}

export function fallbackReversePlanInterpretation(
  input: ReversePlanAIInput
): ReversePlanInterpretation {
  return {
    summary: `${input.targetAge}歳ごろの未来から逆算すると、${input.steps.length}つのステップが考えられます。`,
    whyThisOrder:
      "現在に近い時期のステップから並んでおり、順に取り組むことで目標に近づく構成になっています。",
    caveat: "この説明はAIを使わない簡易版です。各ステップの詳細はタイムラインをご覧ください。",
  };
}
