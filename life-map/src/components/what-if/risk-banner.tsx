import { AlertTriangle } from "lucide-react";
import type { BottleneckRisk } from "@/types/life-map";

export function RiskBanner({ risk }: { risk: BottleneckRisk }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <span className="font-semibold">{risk.period}：</span>
        {risk.message}
      </p>
    </div>
  );
}
