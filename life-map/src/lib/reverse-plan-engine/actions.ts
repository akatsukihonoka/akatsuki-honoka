import type { EventCategory } from "@/types/life-map";
import type {
  ReversePlanAction,
  ReversePlanActionTimeframe,
  ReversePlanGoal,
  ReversePlanStep,
} from "./types";

const TIMEFRAMES: { timeframe: ReversePlanActionTimeframe; label: string }[] = [
  { timeframe: "this_month", label: "今月" },
  { timeframe: "within_3_months", label: "3ヶ月以内" },
  { timeframe: "within_1_year", label: "1年以内" },
];

/**
 * Reversible, investigative phrasing per event category — never an
 * imperative "転職する"/"結婚する"/"子どもをもつ" instruction, always
 * "調べる"/"比較する"/"整理する"/"話し合う" style actions the user can back
 * out of.
 */
const CATEGORY_TEMPLATES: Record<
  EventCategory,
  (eventName: string) => { title: string; description: string }
> = {
  career: (name) => ({
    title: `「${name}」につながる情報を調べる`,
    description:
      "関連する求人や募集要項、実際に経験した人の話を調べて、今の自分との違いを整理してみましょう。",
  }),
  housing: (name) => ({
    title: `「${name}」の選択肢を比較する`,
    description: "候補になりそうな条件をいくつか調べて、今の暮らしと比べてみましょう。",
  }),
  finance: (name) => ({
    title: `「${name}」に必要な情報を整理する`,
    description: "今の収入・支出の状況を書き出し、必要になりそうな金額感を調べてみましょう。",
  }),
  relationship: (name) => ({
    title: `「${name}」につながる時間をつくる`,
    description: "今の関わり方を振り返り、少しずつ時間や機会を増やせないか考えてみましょう。",
  }),
  family: (name) => ({
    title: `「${name}」に向けて話し合う`,
    description: "関係する相手と、今のうちに話しておきたいことを整理してみましょう。",
  }),
  familySupport: (name) => ({
    title: `「${name}」に向けて状況を確認する`,
    description: "家族の状況や必要になりそうなサポートについて、今のうちに確認しておきましょう。",
  }),
  personal: (name) => ({
    title: `「${name}」の準備を始める`,
    description: "必要な情報を調べたり、小さく試したりできることがないか考えてみましょう。",
  }),
};

function genericFillers(targetAge: number): { title: string; description: string }[] {
  return [
    {
      title: "今の延長線上でできることを整理する",
      description: `${targetAge}歳の時点を意識しながら、今のペースを続けた場合に何が起きていそうかを書き出してみましょう。`,
    },
    {
      title: "気になる変化について調べる",
      description: "選んだ未来の状態について、情報や体験談を探してみましょう。",
    },
    {
      title: "小さく試せることを考える",
      description: "大きく動く前に、無理なく試せる小さな一歩がないか考えてみましょう。",
    },
  ];
}

/**
 * Always returns exactly 3 actions, timed 今月 / 3ヶ月以内 / 1年以内, built
 * from the nearest-term required steps (present -> future order, so the
 * first entries are the soonest). When there are fewer than 3 real steps
 * (e.g. the goal is already reached, or every target was rejected), the
 * remaining slots are filled with generic, non-committal reflection
 * actions rather than repeating or fabricating events.
 */
export function buildReversePlanActions(
  goal: ReversePlanGoal,
  steps: ReversePlanStep[]
): ReversePlanAction[] {
  const chosen = steps.slice(0, 3);
  const actions: ReversePlanAction[] = chosen.map((step, i) => {
    const template = CATEGORY_TEMPLATES[step.category](step.eventName);
    return {
      id: `reverse-plan-action-${step.eventId}`,
      timeframe: TIMEFRAMES[i].timeframe,
      timeframeLabel: TIMEFRAMES[i].label,
      title: template.title,
      description: template.description,
      relatedEventIds: [step.eventId],
    };
  });

  const fillers = genericFillers(goal.targetAge);
  let fillerIndex = 0;
  while (actions.length < 3) {
    const filler = fillers[fillerIndex % fillers.length];
    const slot = TIMEFRAMES[actions.length];
    actions.push({
      id: `reverse-plan-action-filler-${actions.length}`,
      timeframe: slot.timeframe,
      timeframeLabel: slot.label,
      title: filler.title,
      description: filler.description,
      relatedEventIds: [],
    });
    fillerIndex += 1;
  }

  return actions;
}
