import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function DisclaimerNote({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-2xl border border-neutral-200 bg-white/70 p-4 text-xs leading-relaxed text-neutral-600",
        className
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
      <p>
        このサービスは未来を予測・保証するものではありません。現在の条件から考えられる選択肢を整理するための参考ツールです。
      </p>
    </div>
  );
}
