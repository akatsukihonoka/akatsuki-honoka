import type { EffectAxis, LifeEvent, ScenarioEvent } from "@/types/life-map";
import { PERIOD_LABELS, isBranchPoint, type RouteTimeline } from "./timeline";

const AXES: EffectAxis[] = [
  "money",
  "time",
  "career",
  "stability",
  "family",
  "freedom",
  "location",
  "experience",
];

const POSITIVE_PHRASE: Record<EffectAxis, string> = {
  money: "収入や資産に余裕が生まれる可能性があります",
  time: "時間の余白が増える可能性があります",
  career: "キャリアの選択肢が広がる可能性があります",
  stability: "生活の安定感が増す可能性があります",
  family: "家族との時間や関係が深まる可能性があります",
  freedom: "自分の裁量で動ける自由度が増す可能性があります",
  location: "暮らす場所の選択肢が広がる可能性があります",
  experience: "新しい経験が増える可能性があります",
};

const NEGATIVE_PHRASE: Record<EffectAxis, string> = {
  money: "支出や資金面の負担が増える場合があります",
  time: "時間の余白が減る場合があります",
  career: "キャリアの方向性を見直す必要が出る場合があります",
  stability: "生活の変化への調整が必要になる場合があります",
  family: "家族との時間の確保が課題になる場合があります",
  freedom: "自由に使える裁量が一時的に減る場合があります",
  location: "住む場所の選択肢が狭まる場合があります",
  experience: "新しい環境への適応が必要になる場合があります",
};

const POSITIVE_CHIP: Record<EffectAxis, string> = {
  money: "収入・資産の変化",
  time: "時間の余白",
  career: "キャリアの広がり",
  stability: "安定性の向上",
  family: "家族時間の変化",
  freedom: "自由度の向上",
  location: "住む場所の選択肢",
  experience: "新しい経験",
};

const NEGATIVE_CHIP: Record<EffectAxis, string> = {
  money: "支出の増加",
  time: "時間の圧迫",
  career: "キャリアの見直し",
  stability: "安定性の変化",
  family: "家族時間の調整",
  freedom: "裁量の一時的な制限",
  location: "住む場所の制約",
  experience: "適応の必要性",
};

function topAxesByAbs(effects: LifeEvent["effects"], count: number): EffectAxis[] {
  return [...AXES]
    .filter((axis) => effects[axis] !== 0)
    .sort((a, b) => Math.abs(effects[b]) - Math.abs(effects[a]) || a.localeCompare(b))
    .slice(0, count);
}

function buildChanges(event: LifeEvent): string[] {
  return topAxesByAbs(event.effects, 2).map((axis) =>
    event.effects[axis] > 0 ? POSITIVE_CHIP[axis] : NEGATIVE_CHIP[axis]
  );
}

function buildAdvantages(event: LifeEvent): string[] {
  const strong = AXES.filter((axis) => event.effects[axis] >= 2);
  const chosen = strong.length > 0 ? strong : AXES.filter((axis) => event.effects[axis] > 0).slice(0, 1);
  if (chosen.length === 0) return ["今の状態を大きく変えずに進められる可能性があります"];
  return chosen.slice(0, 2).map((axis) => POSITIVE_PHRASE[axis]);
}

function buildCautions(event: LifeEvent): string[] {
  const strong = AXES.filter((axis) => event.effects[axis] <= -2);
  const chosen = strong.length > 0 ? strong : AXES.filter((axis) => event.effects[axis] < 0).slice(0, 1);
  if (chosen.length === 0) return ["変化の実感には時間がかかる場合があります"];
  return chosen.slice(0, 2).map((axis) => NEGATIVE_PHRASE[axis]);
}

/** Selected LifeEvents + their timeline placement -> the UI's existing ScenarioEvent shape. */
export function renderScenarioEvents(routeId: string, timeline: RouteTimeline): ScenarioEvent[] {
  return timeline.orderedEvents.map((event) => {
    const period = timeline.periodOf.get(event.id) ?? 0;
    return {
      id: `${routeId}-${event.id}`,
      period: PERIOD_LABELS[period],
      title: event.name,
      description: event.description,
      changes: buildChanges(event),
      advantages: buildAdvantages(event),
      cautions: buildCautions(event),
      isBranchPoint: isBranchPoint(event),
      sourceEventId: event.id,
    };
  });
}
