import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { WhatIfOption } from "@/types/life-map";

export function WhatIfCard({
  option,
  icon: Icon,
}: {
  option: WhatIfOption;
  icon: LucideIcon;
}) {
  return (
    <Link href={`/compare?whatIf=${option.id}`} className="block">
      <Card className="border-neutral-200 transition-transform hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
            <Icon className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-neutral-800">{option.label}</p>
            <p className="text-xs text-neutral-600">{option.description}</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-neutral-300" />
        </CardContent>
      </Card>
    </Link>
  );
}
