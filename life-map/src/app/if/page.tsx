import {
  Baby,
  Briefcase,
  Building2,
  Heart,
  Home,
  type LucideIcon,
  Rocket,
  Settings2,
  Trees,
  TrendingUp,
} from "lucide-react";

import { PageContainer } from "@/components/common/page-container";
import { BackButton } from "@/components/common/back-button";
import { WhatIfCard } from "@/components/what-if/what-if-card";
import { whatIfOptions } from "@/data/mock-what-if";

const iconMap: Record<string, LucideIcon> = {
  "job-change": Briefcase,
  "income-up": TrendingUp,
  "side-job": Rocket,
  marriage: Heart,
  children: Baby,
  relocate: Trees,
  "buy-house": Home,
  independence: Building2,
  custom: Settings2,
};

export default function WhatIfPage() {
  return (
    <main className="flex flex-1 flex-col">
      <PageContainer className="flex flex-1 flex-col gap-6 py-6">
        <div className="flex items-center">
          <BackButton />
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-2xl font-bold text-neutral-800">
            もしも、条件を変えたら？
          </h1>
          <p className="text-sm leading-relaxed text-neutral-500">
            気になる条件を選ぶと、今のMAPと比べてどう変わりそうかを見てみましょう。
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {whatIfOptions.map((option) => (
            <WhatIfCard key={option.id} option={option} icon={iconMap[option.id]} />
          ))}
        </div>
      </PageContainer>
    </main>
  );
}
