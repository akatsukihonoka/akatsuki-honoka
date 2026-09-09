import { Suspense } from "react";
import { CompareContent } from "@/components/what-if/compare-content";

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <CompareContent />
    </Suspense>
  );
}
