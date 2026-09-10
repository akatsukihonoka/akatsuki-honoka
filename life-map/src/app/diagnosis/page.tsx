"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { PageContainer } from "@/components/common/page-container";
import { BackButton } from "@/components/common/back-button";
import { DiagnosisProgressBar } from "@/components/diagnosis/progress-bar";
import { QuestionCard } from "@/components/diagnosis/question-card";
import { diagnosisQuestions } from "@/components/diagnosis/questions";
import { TOTAL_QUESTIONS, useDiagnosisStore } from "@/store/diagnosis-store";
import type { DesiredChange } from "@/types/life-map";

export default function DiagnosisPage() {
  const router = useRouter();
  const answers = useDiagnosisStore((s) => s.answers);
  const currentStep = useDiagnosisStore((s) => s.currentStep);
  const setAnswer = useDiagnosisStore((s) => s.setAnswer);
  const goToStep = useDiagnosisStore((s) => s.goToStep);
  const complete = useDiagnosisStore((s) => s.complete);

  const question = diagnosisQuestions[currentStep];

  useEffect(() => {
    if (currentStep >= TOTAL_QUESTIONS) {
      complete();
      router.replace("/analyzing");
    }
  }, [currentStep, complete, router]);

  const advance = () => {
    const next = currentStep + 1;
    if (next >= TOTAL_QUESTIONS) {
      complete();
      router.push("/analyzing");
    } else {
      goToStep(next);
    }
  };

  const handleSelect = (value: string | number) => {
    if (!question || question.type === "multi") return;
    setAnswer(question.key, value as never);
    advance();
  };

  const handleToggleMulti = (value: DesiredChange) => {
    const current = answers.desiredChanges ?? [];
    let next: DesiredChange[];

    if (value === "none") {
      next = current.includes("none") ? [] : ["none"];
    } else if (current.includes(value)) {
      next = current.filter((v) => v !== value);
    } else {
      next = [...current.filter((v) => v !== "none"), value];
    }

    setAnswer("desiredChanges", next);
  };

  const handleConfirmMulti = () => {
    advance();
  };

  const handleBack = () => {
    if (currentStep === 0) {
      // /start is already the previous history entry (pushed on
      // navigating in) — go back to it rather than pushing a duplicate,
      // which would otherwise leave a redundant entry for every visit.
      router.back();
    } else {
      goToStep(currentStep - 1);
    }
  };

  if (!question) {
    return null;
  }

  return (
    <main className="flex flex-1 flex-col">
      <PageContainer className="flex flex-1 flex-col gap-6 py-6">
        <div className="flex items-center">
          <BackButton onClick={handleBack} />
        </div>

        <p className="flex items-center gap-1.5 text-xs font-semibold text-orange-700">
          <span aria-hidden>🧩</span>
          未来MAPの材料を集めています
        </p>

        <DiagnosisProgressBar current={currentStep + 1} total={TOTAL_QUESTIONS} />

        <QuestionCard
          question={question}
          answers={answers}
          onSelect={handleSelect}
          onToggleMulti={handleToggleMulti}
          onConfirmMulti={handleConfirmMulti}
        />
      </PageContainer>
    </main>
  );
}
