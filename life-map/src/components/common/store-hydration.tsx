"use client";

import { useEffect } from "react";
import { useDiagnosisStore } from "@/store/diagnosis-store";

export function StoreHydration() {
  useEffect(() => {
    useDiagnosisStore.persist.rehydrate();
  }, []);

  return null;
}
