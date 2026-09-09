import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DiagnosisAnswer } from "@/types/life-map";

export const TOTAL_QUESTIONS = 10;

type DiagnosisState = {
  answers: DiagnosisAnswer;
  currentStep: number;
  isComplete: boolean;
  setAnswer: <K extends keyof DiagnosisAnswer>(
    key: K,
    value: DiagnosisAnswer[K]
  ) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  complete: () => void;
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
      reset: () => set({ answers: initialAnswers, currentStep: 0, isComplete: false }),
    }),
    {
      name: "life-map-diagnosis",
      skipHydration: true,
    }
  )
);
