import Link from "next/link";
import { ArrowRight, GitBranch, ListChecks, Map as MapIcon } from "lucide-react";

import { Logo } from "@/components/common/logo";
import { PageContainer } from "@/components/common/page-container";
import { DisclaimerNote } from "@/components/common/disclaimer-note";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: MapIcon,
    title: "複数の未来を見られる",
    description: "安定・理想・挑戦、それぞれ違う視点の未来を並べて見比べられます。",
  },
  {
    icon: GitBranch,
    title: "「もしも」で分岐を試せる",
    description: "転職や結婚など、条件を変えたときの変化をシミュレーションできます。",
  },
  {
    icon: ListChecks,
    title: "今やることまで逆算できる",
    description: "見えてきた未来から、今月できる小さな一歩まで整理します。",
  },
];

export default function LandingPage() {
  return (
    <main className="flex-1">
      <PageContainer className="flex flex-col gap-12 py-10 pb-16">
        <header className="animate-fade-in-up">
          <Logo />
        </header>

        <section className="flex flex-col gap-6 text-center">
          <div
            className="animate-fade-in-up flex flex-col gap-3"
            style={{ animationDelay: "80ms" }}
          >
            <h1 className="font-heading text-3xl font-bold leading-snug text-neutral-800 sm:text-4xl">
              このままで、
              <br />
              いいのかな？を未来の地図に。
            </h1>
            <p className="text-base text-neutral-500 sm:text-lg">
              今のあなたから、いくつもの未来を覗いてみよう。
            </p>
          </div>

          <div
            className="animate-fade-in-up flex flex-col items-center gap-4"
            style={{ animationDelay: "160ms" }}
          >
            <span className="inline-flex items-center rounded-full bg-orange-100 px-4 py-1.5 text-xs font-medium text-orange-700">
              約5分・登録不要
            </span>
            <Button asChild size="lg" className="w-full max-w-xs">
              <Link href="/start">
                未来を覗いてみる
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section
          className="animate-fade-in-up rounded-3xl border border-orange-100 bg-white/70 p-6 text-center"
          style={{ animationDelay: "220ms" }}
        >
          <h2 className="font-heading text-lg font-bold text-neutral-800">
            未来MAPとは
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            今の状況・価値観・希望をもとに、考えられる複数の未来のルートを地図のように整理して表示します。
            どのルートが正しいかを決めるものではなく、選択肢を眺めて考えるための道具です。
          </p>
        </section>

        <section className="flex flex-col gap-4">
          {features.map((feature, i) => (
            <Card
              key={feature.title}
              className="animate-fade-in-up border-neutral-200"
              style={{ animationDelay: `${260 + i * 80}ms` }}
            >
              <CardContent className="flex items-start gap-4 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <feature.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-neutral-800">{feature.title}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <DisclaimerNote className="animate-fade-in-up" />
      </PageContainer>
    </main>
  );
}
