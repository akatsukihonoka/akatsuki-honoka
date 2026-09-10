import Link from "next/link";
import { ArrowRight, Clock3, RefreshCcw, UserX } from "lucide-react";

import { Logo } from "@/components/common/logo";
import { PageContainer } from "@/components/common/page-container";
import { BackButton } from "@/components/common/back-button";
import { Button } from "@/components/ui/button";
import { SceneryBlobs, StarShape } from "@/components/illustrations/scenery";

const notes = [
  { icon: Clock3, text: "約5分", badge: "bg-gradient-to-br from-sky-300 to-sky-400" },
  { icon: UserX, text: "登録不要", badge: "bg-gradient-to-br from-violet-300 to-violet-400" },
  {
    icon: RefreshCcw,
    text: "回答はいつでもやり直せる",
    badge: "bg-gradient-to-br from-emerald-300 to-teal-400",
  },
];

export default function StartPage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <SceneryBlobs className="pointer-events-none absolute inset-0 -z-10" />
      <StarShape className="pointer-events-none absolute right-10 top-24 h-5 w-5 text-yellow-300 animate-float-slow" />

      <PageContainer className="flex flex-1 flex-col gap-10 py-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <Logo className="scale-90" />
          <span className="w-16" aria-hidden />
        </div>

        <section className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <span className="text-5xl animate-pop-in" aria-hidden>
            🗺️
          </span>
          <h1 className="font-heading text-2xl font-bold leading-snug text-neutral-800 sm:text-3xl">
            あなたの未来MAPを
            <br />
            つくってみよう。
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-neutral-600 sm:text-base">
            いくつかの質問から、あなたの未来MAPの材料を集めます。
          </p>

          <ul className="flex flex-col gap-3 pt-2">
            {notes.map((note) => (
              <li
                key={note.text}
                className="flex items-center gap-2.5 text-sm font-medium text-neutral-700"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm ${note.badge}`}
                >
                  <note.icon className="h-4 w-4" />
                </span>
                {note.text}
              </li>
            ))}
          </ul>
        </section>

        <Button
          asChild
          size="lg"
          className="tap-bounce w-full bg-gradient-to-r from-orange-400 via-rose-400 to-pink-400 shadow-soft-lg hover:opacity-90"
        >
          <Link href="/diagnosis">
            診断を始める
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </PageContainer>
    </main>
  );
}
