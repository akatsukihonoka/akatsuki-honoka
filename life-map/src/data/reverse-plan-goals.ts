import type { ReversePlanGoalOption } from "@/lib/reverse-plan-engine/types";

/**
 * The Reverse Plan goal picker's catalog — categorized future-state options
 * the user selects from (max 5), each pointing at the LifeEvent(s) in the
 * Event Master that most directly represent that future. This is
 * deliberately not a 1:1 "goal = one event" mapping: resolveRequiredEvents
 * (reverse-plan-engine/resolve-events.ts) walks each target's prerequisites
 * through the existing Event Master graph, and every event still passes
 * through the shared eligibility/conflict/hard-constraint checks when
 * actually applied.
 */
export const REVERSE_PLAN_GOAL_OPTIONS: ReversePlanGoalOption[] = [
  // --- 仕事 ---------------------------------------------------------------
  {
    id: "career_broaden",
    category: "work",
    label: "キャリアの選択肢を広げていたい",
    targetEventIds: ["skill_up", "job_change"],
  },
  {
    id: "career_grow_current",
    category: "work",
    label: "今の仕事の中で役割を広げていたい",
    targetEventIds: ["promotion"],
  },
  {
    id: "career_change_field",
    category: "work",
    label: "違う分野に挑戦していたい",
    targetEventIds: ["career_change"],
  },
  {
    id: "career_independent",
    category: "work",
    label: "自分の裁量で働いていたい",
    targetEventIds: ["independence"],
  },

  // --- お金 ---------------------------------------------------------------
  {
    id: "money_multiple_income",
    category: "money",
    label: "収入の柱を増やしていたい",
    targetEventIds: ["income_increase", "side_job"],
  },
  {
    id: "money_savings",
    category: "money",
    label: "資産をしっかり育てていたい",
    targetEventIds: ["savings_growth"],
  },
  {
    id: "money_own_home",
    category: "money",
    label: "住まいを自分のものにしていたい",
    targetEventIds: ["house_purchase"],
  },

  // --- 暮らし ---------------------------------------------------------------
  {
    id: "living_urban",
    category: "living",
    label: "都市部で働き、暮らしていたい",
    targetEventIds: ["urban_move"],
  },
  {
    id: "living_regional",
    category: "living",
    label: "落ち着いた地方でゆったり暮らしていたい",
    targetEventIds: ["relocation"],
  },
  {
    id: "living_overseas",
    category: "living",
    label: "海外に拠点を広げていたい",
    targetEventIds: ["overseas_move"],
  },

  // --- 家族 ---------------------------------------------------------------
  {
    id: "family_partner",
    category: "family",
    label: "パートナーと家族を築いていたい",
    targetEventIds: ["marriage"],
  },
  {
    id: "family_children",
    category: "family",
    label: "子どもとの生活を築いていたい",
    // Not a naive 1:1 mapping: the event that most directly represents an
    // ongoing life with children is childcare, whose Event Master
    // prerequisite (child_birth) is pulled in automatically by
    // resolveRequiredEventIds, not listed here by hand.
    targetEventIds: ["childcare"],
  },
  {
    id: "family_support_parents",
    category: "family",
    label: "家族を支えられる関わりを持っていたい",
    targetEventIds: ["family_support"],
  },

  // --- 自由・時間 -------------------------------------------------------------
  {
    id: "freedom_leisure",
    category: "freedom",
    label: "自分の時間をもっと持てていたい",
    targetEventIds: ["leisure_increase"],
  },
  {
    id: "freedom_slow_down",
    category: "freedom",
    label: "働くペースを落として過ごしていたい",
    targetEventIds: ["semi_retirement"],
  },
  {
    id: "freedom_learning",
    category: "freedom",
    label: "学び直しを重ねていたい",
    targetEventIds: ["learning"],
  },
];

export const REVERSE_PLAN_GOAL_OPTIONS_BY_ID: Record<string, ReversePlanGoalOption> =
  Object.fromEntries(REVERSE_PLAN_GOAL_OPTIONS.map((option) => [option.id, option]));

export const REVERSE_PLAN_GOAL_CATEGORY_LABELS: Record<
  ReversePlanGoalOption["category"],
  string
> = {
  work: "仕事",
  money: "お金",
  living: "暮らし",
  family: "家族",
  freedom: "自由・時間",
};

export const MAX_REVERSE_PLAN_GOAL_OPTIONS = 5;
