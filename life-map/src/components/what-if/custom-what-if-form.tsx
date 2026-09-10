"use client";

import { useState } from "react";
import { Settings2, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PERIOD_LABELS } from "@/lib/event-engine";

/**
 * MVP-only: captures a custom what-if idea in local UI state. It is
 * deliberately not wired into the deterministic engine — free text can't
 * be turned into an Event Master entry without interpretation, and that
 * interpretation is explicitly out of scope until an AI step exists.
 */
export function CustomWhatIfForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [period, setPeriod] = useState(PERIOD_LABELS[0]);
  const [condition, setCondition] = useState("");
  const [saved, setSaved] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="tap-bounce block w-full text-left">
        <Card className="rounded-[24px] border-2 border-dashed border-neutral-300 shadow-none transition-colors hover:border-orange-300">
          <CardContent className="flex items-center gap-4 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
              <Settings2 className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-heading font-bold text-neutral-800">✏️ 自分で設定する</p>
              <p className="text-xs text-neutral-500">条件を自由に入力してみます</p>
            </div>
          </CardContent>
        </Card>
      </button>
    );
  }

  return (
    <Card className="rounded-[24px] border-neutral-200 shadow-soft">
      <CardContent className="flex flex-col gap-3 p-4">
        <p className="font-heading font-bold text-neutral-800">✏️ 自分で設定する</p>

        <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
          イベント名
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            placeholder="例：転職して海外で働く"
            className="rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
          実行時期
          <select
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              setSaved(false);
            }}
            className="rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            {PERIOD_LABELS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
          簡単な条件(任意)
          <input
            value={condition}
            onChange={(e) => {
              setCondition(e.target.value);
              setSaved(false);
            }}
            placeholder="例：収入が今より下がらない範囲で"
            className="rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          />
        </label>

        <p className="text-xs leading-relaxed text-neutral-500">
          この内容はまだ未来MAPの計算には反映されません。今後、AIによる解釈に対応する予定です。
        </p>

        {saved ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <Check className="h-4 w-4" />
            内容を保存しました
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            disabled={name.trim().length === 0}
            onClick={() => setSaved(true)}
          >
            保存する
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
