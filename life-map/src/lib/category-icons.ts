import {
  Briefcase,
  Heart,
  HeartHandshake,
  Home,
  PiggyBank,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { EventCategory } from "@/types/life-map";

/**
 * Display-only mapping from an Event Master category to how it's drawn on
 * the map — an icon, an emoji fallback, and a themed badge color. Purely
 * presentational; never read by any Engine.
 */
export const CATEGORY_ICONS: Record<
  EventCategory,
  { icon: LucideIcon; emoji: string; bg: string; text: string }
> = {
  career: { icon: Briefcase, emoji: "💼", bg: "bg-sky-100", text: "text-sky-700" },
  housing: { icon: Home, emoji: "🏠", bg: "bg-amber-100", text: "text-amber-700" },
  finance: { icon: PiggyBank, emoji: "💰", bg: "bg-yellow-100", text: "text-yellow-700" },
  relationship: { icon: Heart, emoji: "💕", bg: "bg-rose-100", text: "text-rose-700" },
  family: { icon: Users, emoji: "👨‍👩‍👧", bg: "bg-pink-100", text: "text-pink-700" },
  familySupport: { icon: HeartHandshake, emoji: "🤝", bg: "bg-violet-100", text: "text-violet-700" },
  personal: { icon: Sparkles, emoji: "✨", bg: "bg-emerald-100", text: "text-emerald-700" },
};
