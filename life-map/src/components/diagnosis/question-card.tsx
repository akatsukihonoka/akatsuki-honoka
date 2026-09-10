import type { DiagnosisAnswer, DesiredChange } from "@/types/life-map";
import type { DiagnosisQuestion } from "./questions";
import { SingleChoiceQuestionView } from "./single-choice-question";
import { MultiChoiceQuestionView } from "./multi-choice-question";
import { ScaleQuestionView } from "./scale-question";
import { BinaryQuestionView } from "./binary-question";

export function QuestionCard({
  question,
  answers,
  onSelect,
  onToggleMulti,
  onConfirmMulti,
}: {
  question: DiagnosisQuestion;
  answers: DiagnosisAnswer;
  onSelect: (value: string | number) => void;
  onToggleMulti: (value: DesiredChange) => void;
  onConfirmMulti: () => void;
}) {
  return (
    <div
      key={question.id}
      className="animate-fade-in-up rounded-[28px] border border-orange-100 bg-white p-6 shadow-soft"
    >
      <div className="mb-5 flex flex-col gap-1.5">
        <span className="inline-flex w-fit items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
          Q{question.id}
        </span>
        <h2 className="font-heading text-xl font-bold leading-snug text-neutral-800">
          {question.question}
        </h2>
      </div>

      {question.type === "single" && (
        <SingleChoiceQuestionView
          question={question}
          value={answers[question.key] as string | undefined}
          onSelect={onSelect}
        />
      )}
      {question.type === "scale" && (
        <ScaleQuestionView
          question={question}
          value={answers[question.key]}
          onSelect={onSelect}
        />
      )}
      {question.type === "binary" && (
        <BinaryQuestionView
          question={question}
          value={answers[question.key]}
          onSelect={onSelect}
        />
      )}
      {question.type === "multi" && (
        <MultiChoiceQuestionView
          question={question}
          value={answers.desiredChanges ?? []}
          onToggle={(value) => onToggleMulti(value as DesiredChange)}
          onConfirm={onConfirmMulti}
        />
      )}
    </div>
  );
}
