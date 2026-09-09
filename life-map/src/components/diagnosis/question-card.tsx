import type { DiagnosisAnswer, DesiredChange } from "@/types/life-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="animate-fade-in-up border-neutral-200" key={question.id}>
      <CardHeader>
        <span className="text-xs font-semibold text-orange-700">Q{question.id}</span>
        <CardTitle className="text-xl">{question.question}</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
