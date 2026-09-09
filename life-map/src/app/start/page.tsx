import Link from "next/link";
import { ArrowRight, Clock3, RefreshCcw, UserX } from "lucide-react";

import { Logo } from "@/components/common/logo";
import { PageContainer } from "@/components/common/page-container";
import { BackButton } from "@/components/common/back-button";
import { Button } from "@/components/ui/button";

const notes = [
  { icon: Clock3, text: "約5分" },
  { icon: UserX, text: "登録不要" },
  { icon: RefreshCcw, text: "回答はいつでもやり直せる" },
];

export default function StartPage() {
  return (
    <main className="flex flex-1 flex-col">
      <PageContainer className="flex flex-1 flex-col gap-10 py-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <Logo className="scale-90" />
          <span className="w-16" aria-hidden />
        </div>

        <section className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <h1 className="font-heading text-2xl font-bold leading-snug text-neutral-800 sm:text-3xl">
            あなたの未来MAPを
            <br />
            つくってみよう。
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-neutral-500 sm:text-base">
            いくつかの質問に答えると、あなたの現在地と未来の分岐を整理します。
          </p>

          <ul className="flex flex-col gap-3 pt-2">
            {notes.map((note) => (
              <li
                key={note.text}
                className="flex items-center gap-2 text-sm text-neutral-600"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                  <note.icon className="h-4 w-4" />
                </span>
                {note.text}
              </li>
            ))}
          </ul>
        </section>

        <Button asChild size="lg" className="w-full">
          <Link href="/diagnosis">
            診断を始める
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </PageContainer>
    </main>
  );
}
