import { Suspense } from "react";
import { WorldlineContent } from "@/components/worldline/worldline-content";

export default function WorldlinePage() {
  return (
    <Suspense fallback={null}>
      <WorldlineContent />
    </Suspense>
  );
}
