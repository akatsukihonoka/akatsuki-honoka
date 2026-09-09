"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";

import { PageContainer } from "@/components/common/page-container";

const messages = [
  "現在地を整理中…",
  "価値観を分析中…",
  "未来の分岐を探しています…",
  "MAPを描いています…",
  "あなたの未来MAPができました",
];

const STEP_MS = 750;

export default function AnalyzingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= messages.length - 1) {
      const finish = setTimeout(() => router.replace("/map"), 900);
      return () => clearTimeout(finish);
    }
    const timer = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [step, router]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center">
      <PageContainer className="flex flex-col items-center gap-8 py-10 text-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-orange-200 opacity-60" />
          <span className="absolute inset-2 animate-pulse rounded-full bg-orange-100" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-rose-400 text-white shadow-md">
            <Compass className="h-8 w-8 animate-[spin_6s_linear_infinite]" />
          </span>
        </div>

        <p
          key={step}
          className="animate-fade-in-up font-heading text-lg font-semibold text-neutral-700"
          aria-live="polite"
        >
          {messages[step]}
        </p>

        <div className="flex gap-2">
          {messages.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i <= step ? "bg-orange-400" : "bg-orange-100"
              }`}
            />
          ))}
        </div>
      </PageContainer>
    </main>
  );
}
