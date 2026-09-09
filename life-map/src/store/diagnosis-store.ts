import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DiagnosisAnswer, ScenarioType } from "@/types/life-map";
import type { WhatIfResult } from "@/lib/what-if-engine/types";

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
   * Last computed what-if result. Kept in memory for convenience (e.g. a
   * reload while still on /compare can reuse it briefly) but never
   * persisted to localStorage — it's a derived, potentially sizeable
   * computed blob, not user progress, and is cheap to recompute
   * deterministically from answers + selectedEventId + activeScenarioId.
   */
  whatIfResult?: WhatIfResult;
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
      setSelectedEventId: (eventId) => set({ selectedEventId: eventId }),
      setActiveScenarioId: (scenarioId) => set({ activeScenarioId: scenarioId }),
      setWhatIfResult: (result) => set({ whatIfResult: result }),
      reset: () =>
        set({
          answers: initialAnswers,
          currentStep: 0,
          isComplete: false,
          selectedEventId: undefined,
          activeScenarioId: undefined,
          whatIfResult: undefined,
        }),
    }),
    {
      name: "life-map-diagnosis",
      skipHydration: true,
      // whatIfResult is deliberately excluded — never write the computed
      // what-if blob to localStorage, only the small pieces needed to
      // reconstruct it (or to recompute it fresh on next load).
      partialize: (state) => ({
        answers: state.answers,
        currentStep: state.currentStep,
        isComplete: state.isComplete,
        selectedEventId: state.selectedEventId,
        activeScenarioId: state.activeScenarioId,
      }),
    }
  )
);
