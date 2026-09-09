import type { EffectAxis } from "@/types/life-map";

export const AXIS_META: Record<
  EffectAxis,
  { emoji: string; label: string; up: string; down: string }
> = {
  money: { emoji: "💰", label: "お金", up: "増える方向", down: "減る方向" },
  time: { emoji: "⏰", label: "時間", up: "増える方向", down: "減る方向" },
  career: { emoji: "💼", label: "キャリア", up: "広がる方向", down: "狭まる方向" },
  stability: { emoji: "🛡️", label: "安定性", up: "高まる方向", down: "下がる方向" },
  family: { emoji: "👨‍👩‍👧", label: "家族との時間", up: "深まる方向", down: "変化する方向" },
  freedom: { emoji: "🕊️", label: "自由度", up: "増す方向", down: "減る方向" },
  location: { emoji: "📍", label: "住む場所", up: "広がる方向", down: "狭まる方向" },
  experience: { emoji: "✨", label: "経験", up: "増える方向", down: "変化する方向" },
};
