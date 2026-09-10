import { Suspense } from "react";
import { ReversePlanContent } from "@/components/reverse-plan/reverse-plan-content";

export default function ReversePlanPage() {
  return (
    <Suspense fallback={null}>
      <ReversePlanContent />
    </Suspense>
  );
}
