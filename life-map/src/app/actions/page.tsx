"use client";

import { useState } from "react";

import { PageContainer } from "@/components/common/page-container";
import { BackButton } from "@/components/common/back-button";
import { DisclaimerNote } from "@/components/common/disclaimer-note";
import { ActionTaskCard } from "@/components/actions/action-task-card";
import { mockActionTasks } from "@/data/mock-actions";

const STORAGE_KEY = "life-map-action-tasks";

function readStoredCheckedMap(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export default function ActionsPage() {
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(
    readStoredCheckedMap
  );

  const toggle = (id: string, checked: boolean) => {
    setCheckedMap((prev) => {
      const next = { ...prev, [id]: checked };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage unavailable, ignore
      }
      return next;
    });
  };

  return (
    <main className="flex flex-1 flex-col">
      <PageContainer className="flex flex-1 flex-col gap-6 py-6">
        <div className="flex items-center">
          <BackButton />
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-2xl font-bold text-neutral-800">
            🚶 じゃあ、今なにする？
          </h1>
          <p className="text-sm leading-relaxed text-neutral-600">
            この未来に近づくための、最初の3つを見てみよう。
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {mockActionTasks.map((task) => (
            <ActionTaskCard
              key={task.id}
              task={task}
              checked={checkedMap[task.id] ?? false}
              onCheckedChange={(checked) => toggle(task.id, checked)}
            />
          ))}
        </div>

        <DisclaimerNote />
      </PageContainer>
    </main>
  );
}
