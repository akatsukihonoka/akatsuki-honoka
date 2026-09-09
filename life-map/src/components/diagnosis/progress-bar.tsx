import { Progress } from "@/components/ui/progress";

export function DiagnosisProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs font-medium text-neutral-600">
        <span>
          質問 {current} / {total}
        </span>
        <span>{percent}%</span>
      </div>
      <Progress value={percent} aria-label={`診断の進捗 ${current} / ${total} 問`} />
    </div>
  );
}
