import Link from "next/link";
import { ArrowRight, GitBranch } from "lucide-react";

import { PageContainer } from "@/components/common/page-container";
import { BackButton } from "@/components/common/back-button";
import { FixedBottomBar } from "@/components/common/fixed-bottom-bar";
import { DisclaimerNote } from "@/components/common/disclaimer-note";
import { Button } from "@/components/ui/button";
import { CompareTable } from "@/components/what-if/compare-table";
import { mockCompareResults } from "@/data/mock-what-if";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ whatIf?: string }>;
}) {
  const { whatIf } = await searchParams;
  const result = (whatIf && mockCompareResults[whatIf]) || mockCompareResults["job-change"];

  return (
    <main className="flex flex-1 flex-col">
      <PageContainer className="flex flex-1 flex-col gap-6 py-6 pb-6">
        <div className="flex items-center">
          <BackButton />
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-2xl font-bold text-neutral-800">
            今のMAPと、もしものMAPを比べてみよう。
          </h1>
          <p className="text-sm font-medium text-orange-700">「{result.whatIfLabel}」の場合</p>
        </div>

        <CompareTable items={result.items} />

        <div className="rounded-3xl bg-orange-50/70 p-5 text-sm leading-relaxed text-neutral-600">
          {result.summary}
        </div>

        <DisclaimerNote />
      </PageContainer>

      <FixedBottomBar className="pb-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button asChild variant="secondary" size="lg">
            <Link href="/if">
              <GitBranch className="h-4 w-4" />
              別のもしもを試す
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/actions">
              この結果から行動を考える
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </FixedBottomBar>
    </main>
  );
}
