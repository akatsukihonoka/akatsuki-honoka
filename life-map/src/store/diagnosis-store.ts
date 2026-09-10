import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DiagnosisAnswer, ScenarioType } from "@/types/life-map";
import type { WhatIfResult } from "@/lib/what-if-engine/types";
import type { ReversePlanGoal } from "@/lib/reverse-plan-engine/types";

export const TOTAL_QUESTIONS = 10;

type DiagnosisState = {
  answers: DiagnosisAnswer;
  currentStep: number;
  isComplete: boolean;
  /** The LifeEvent id (e.g. "job_change") the user is currently exploring a what-if for. */
  selectedEventId?: string;
  /** Which route (Stable/Ideal/Challenge) the current what-if is based on. */
  activeScenarioId?: ScenarioType;
  /**
   * The chain of what-if event ids currently being explored, in applied
   * order (max 3). Small enough to persist directly; also acts as the
   * fallback source of truth if a /compare URL's own events= param is
   * ever unavailable or gets too long to carry reliably.
   */
  chainEventIds: string[];
  /**
   * Last computed what-if result. Kept in memory for convenience (e.g. a
   * reload while still on /compare can reuse it briefly) but never
   * persisted to localStorage — it's a derived, potentially sizeable
   * computed blob, not user progress, and is cheap to recompute
   * deterministically from answers + selectedEventId + activeScenarioId.
   */
  whatIfResult?: WhatIfResult;
  /**
   * The declared Reverse Plan goal (target age + selected future-state
   * options + free-text note) — small enough to persist directly, same as
   * chainEventIds. The derived ReversePlan itself (steps/actions/scores) is
   * NOT stored here; it's cheap to recompute deterministically from
   * answers + activeScenarioId + reversePlanGoal, the same convention
   * whatIfResult/chain already follow for anything derived.
   */
  reversePlanGoal?: ReversePlanGoal;
  setAnswer: <K extends keyof DiagnosisAnswer>(
    key: K,
    value: DiagnosisAnswer[K]
  ) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  complete: () => void;
  setSelectedEventId: (eventId: string | undefined) => void;
  setActiveScenarioId: (scenarioId: ScenarioType | undefined) => void;
  setWhatIfResult: (result: WhatIfResult | undefined) => void;
  setChainEventIds: (eventIds: string[]) => void;
  setReversePlanGoal: (goal: ReversePlanGoal | undefined) => void;
  reset: () => void;
};

const initialAnswers: DiagnosisAnswer = {};

export const useDiagnosisStore = create<DiagnosisState>()(
  persist(
    (set) => ({
      answers: initialAnswers,
      currentStep: 0,
      isComplete: false,
      setAnswer: (key, value) =>
        set((state) => ({
          answers: { ...state.answers, [key]: value },
        })),
      goToStep: (step) => set({ currentStep: step }),
      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, TOTAL_QUESTIONS),
        })),
      prevStep: () =>
        set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),
      complete: () => set({ isComplete: true }),
      chainEventIds: [],
      setSelectedEventId: (eventId) => set({ selectedEventId: eventId }),
      setActiveScenarioId: (scenarioId) => set({ activeScenarioId: scenarioId }),
      setWhatIfResult: (result) => set({ whatIfResult: result }),
      setChainEventIds: (eventIds) => set({ chainEventIds: eventIds }),
      setReversePlanGoal: (goal) => set({ reversePlanGoal: goal }),
      reset: () =>
        set({
          answers: initialAnswers,
          currentStep: 0,
          isComplete: false,
          selectedEventId: undefined,
          activeScenarioId: undefined,
          whatIfResult: undefined,
          chainEventIds: [],
          reversePlanGoal: undefined,
        }),
    }),
    {
      name: "life-map-diagnosis",
      skipHydration: true,
      // whatIfResult is deliberately excluded — never write the computed
      // what-if blob to localStorage, only the small pieces needed to
      // reconstruct it (or to recompute it fresh on next load). The
      // derived ReversePlan follows the same rule: only reversePlanGoal
      // (the small input) is persisted here.
      partialize: (state) => ({
        answers: state.answers,
        currentStep: state.currentStep,
        isComplete: state.isComplete,
        selectedEventId: state.selectedEventId,
        activeScenarioId: state.activeScenarioId,
        chainEventIds: state.chainEventIds,
        reversePlanGoal: state.reversePlanGoal,
      }),
    }
  )
);
