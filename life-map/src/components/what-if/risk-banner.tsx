import { AlertTriangle } from "lucide-react";
import type { BottleneckRisk } from "@/types/life-map";

export function RiskBanner({ risk }: { risk: BottleneckRisk }) {
  return (
    <div className="flex items-start gap-2 rounded-[22px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>
        <span className="font-bold">{risk.period}：</span>
        {risk.message}
      </p>
    </div>
  );
}
