import { Suspense } from "react";
import { IfPageContent } from "@/components/what-if/if-page-content";

export default function WhatIfPage() {
  return (
    <Suspense fallback={null}>
      <IfPageContent />
    </Suspense>
  );
}
