import Link from "next/link";
import { ArrowRight, GitBranch, ListChecks, Map as MapIcon } from "lucide-react";

import { Logo } from "@/components/common/logo";
import { PageContainer } from "@/components/common/page-container";
import { DisclaimerNote } from "@/components/common/disclaimer-note";
import { Button } from "@/components/ui/button";
import { CloudShape, HillsScene, SceneryBlobs, StarShape } from "@/components/illustrations/scenery";

const features = [
  {
    icon: MapIcon,
    emoji: "🗺️",
    title: "複数の未来を見られる",
    description: "安定・理想・挑戦、それぞれ違う未来の世界を覗けます。",
    badge: "bg-gradient-to-br from-emerald-300 to-teal-400",
  },
  {
    icon: GitBranch,
    emoji: "🔀",
    title: "「もしも」で分岐を試せる",
    description: "転職や結婚など、条件を変えるとどう変わるか試せます。",
    badge: "bg-gradient-to-br from-pink-300 to-rose-400",
  },
  {
    icon: ListChecks,
    emoji: "🚶",
    title: "今やることまで逆算できる",
    description: "見えてきた未来から、今できる小さな一歩まで整理します。",
    badge: "bg-gradient-to-br from-orange-300 to-amber-400",
  },
];

export default function LandingPage() {
  return (
    <main className="flex-1">
      <div className="relative overflow-hidden">
        <SceneryBlobs className="pointer-events-none absolute inset-0 -z-10" />
        <StarShape className="pointer-events-none absolute right-8 top-16 h-6 w-6 text-yellow-300 animate-float-slow" />
        <CloudShape
          className="pointer-events-none absolute left-4 top-32 h-8 w-14 text-white animate-float-slow"
          style={{ animationDelay: "1.2s" }}
        />

        <PageContainer className="flex flex-col gap-10 pb-8 pt-10">
          <header className="animate-fade-in-up">
            <Logo />
          </header>

          <section className="flex flex-col gap-6 text-center">
            <div
              className="animate-fade-in-up flex flex-col gap-3"
              style={{ animationDelay: "80ms" }}
            >
              <h1 className="font-heading text-4xl font-bold leading-snug text-neutral-800 sm:text-5xl">
                このままで、
                <br />
                いいのかな？を
                <br />
                未来の地図に。
              </h1>
              <p className="text-base text-neutral-600 sm:text-lg">
                今のあなたから、いくつもの未来を覗いてみよう。
              </p>
            </div>

            <div
              className="animate-fade-in-up flex flex-col items-center gap-4"
              style={{ animationDelay: "160ms" }}
            >
              <Button
                asChild
                size="lg"
                className="tap-bounce w-full max-w-xs bg-gradient-to-r from-orange-400 via-rose-400 to-pink-400 text-base shadow-soft-lg hover:opacity-90"
              >
                <Link href="/start">
                  未来を覗いてみる
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <span className="inline-flex items-center rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium text-orange-700 shadow-sm">
                約5分・登録不要
              </span>
            </div>
          </section>
        </PageContainer>

        <HillsScene className="h-16 w-full text-emerald-200" />
      </div>

      <PageContainer className="flex flex-col gap-8 pb-16 pt-2">
        <section
          className="animate-fade-in-up rounded-[28px] border border-orange-100 bg-white/70 p-6 text-center shadow-soft"
          style={{ animationDelay: "220ms" }}
        >
          <h2 className="font-heading text-lg font-bold text-neutral-800">🧭 未来MAPとは</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            今の状況・価値観・希望から、考えられる複数の未来を地図のように描き出すツールです。
            どれが正解かを決めるのではなく、いろんな未来を眺めて考えるための道具です。
          </p>
        </section>

        <section className="flex flex-col gap-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="animate-fade-in-up flex items-center gap-4 rounded-[28px] border border-neutral-100 bg-white p-4 shadow-soft"
              style={{ animationDelay: `${260 + i * 80}ms` }}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl text-white shadow-sm ${feature.badge}`}
                aria-hidden
              >
                {feature.emoji}
              </span>
              <div>
                <h3 className="font-heading font-bold text-neutral-800">{feature.title}</h3>
                <p className="mt-0.5 text-sm text-neutral-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </section>

        <DisclaimerNote className="animate-fade-in-up" />
      </PageContainer>
    </main>
  );
}
