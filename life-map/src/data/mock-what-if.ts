import type { CompareResult, WhatIfOption } from "@/types/life-map";

export const whatIfOptions: WhatIfOption[] = [
  { id: "job-change", label: "転職したら", description: "働く環境を変えた場合の変化を見てみます" },
  { id: "income-up", label: "年収が100万円増えたら", description: "収入が増えた場合の変化を見てみます" },
  { id: "side-job", label: "副業を始めたら", description: "収入源を増やした場合の変化を見てみます" },
  { id: "marriage", label: "結婚したら", description: "結婚した場合の変化を見てみます" },
  { id: "children", label: "子どもができたら", description: "子どもができた場合の変化を見てみます" },
  { id: "relocate", label: "地方に引っ越したら", description: "暮らす場所を変えた場合の変化を見てみます" },
  { id: "buy-house", label: "家を買ったら", description: "住まいを購入した場合の変化を見てみます" },
  { id: "independence", label: "独立したら", description: "独立して働いた場合の変化を見てみます" },
  { id: "custom", label: "自分で設定する", description: "条件を自由に設定して比較します" },
];

const defaultCompareItems = [
  { id: "money", label: "お金" },
  { id: "time", label: "時間" },
  { id: "career", label: "キャリア" },
  { id: "stability", label: "安定性" },
  { id: "freedom", label: "自由度" },
  { id: "location", label: "住む場所" },
  { id: "futureOptions", label: "将来の選択肢" },
];

export const mockCompareResults: Record<string, CompareResult> = {
  "job-change": {
    whatIfId: "job-change",
    whatIfLabel: "転職したら",
    items: [
      { ...defaultCompareItems[0], level: "slightIncrease" },
      { ...defaultCompareItems[1], level: "slightDecrease" },
      { ...defaultCompareItems[2], level: "bigIncrease" },
      { ...defaultCompareItems[3], level: "slightDecrease" },
      { ...defaultCompareItems[4], level: "slightIncrease" },
      { ...defaultCompareItems[5], level: "noChange" },
      { ...defaultCompareItems[6], level: "bigIncrease" },
    ],
    summary:
      "この選択では、キャリアや将来の選択肢の広がりが期待できる一方、最初は時間や安定性に負担がかかる可能性があります。",
  },
  "income-up": {
    whatIfId: "income-up",
    whatIfLabel: "年収が100万円増えたら",
    items: [
      { ...defaultCompareItems[0], level: "bigIncrease" },
      { ...defaultCompareItems[1], level: "slightDecrease" },
      { ...defaultCompareItems[2], level: "slightIncrease" },
      { ...defaultCompareItems[3], level: "slightIncrease" },
      { ...defaultCompareItems[4], level: "slightIncrease" },
      { ...defaultCompareItems[5], level: "noChange" },
      { ...defaultCompareItems[6], level: "slightIncrease" },
    ],
    summary:
      "この選択では、お金や安定性の余白が広がることが期待できる一方、業務量の増加によって時間の余白が少し減る可能性があります。",
  },
  "side-job": {
    whatIfId: "side-job",
    whatIfLabel: "副業を始めたら",
    items: [
      { ...defaultCompareItems[0], level: "slightIncrease" },
      { ...defaultCompareItems[1], level: "bigDecrease" },
      { ...defaultCompareItems[2], level: "slightIncrease" },
      { ...defaultCompareItems[3], level: "noChange" },
      { ...defaultCompareItems[4], level: "slightIncrease" },
      { ...defaultCompareItems[5], level: "noChange" },
      { ...defaultCompareItems[6], level: "bigIncrease" },
    ],
    summary:
      "この選択では、収入や将来の選択肢の広がりが期待できる一方、最初は時間に大きく負担がかかる可能性があります。",
  },
  marriage: {
    whatIfId: "marriage",
    whatIfLabel: "結婚したら",
    items: [
      { ...defaultCompareItems[0], level: "slightIncrease" },
      { ...defaultCompareItems[1], level: "slightDecrease" },
      { ...defaultCompareItems[2], level: "noChange" },
      { ...defaultCompareItems[3], level: "bigIncrease" },
      { ...defaultCompareItems[4], level: "slightDecrease" },
      { ...defaultCompareItems[5], level: "slightIncrease" },
      { ...defaultCompareItems[6], level: "slightIncrease" },
    ],
    summary:
      "この選択では、安定性や将来の選択肢の面で変化が期待できる一方、自由度や時間の使い方に調整が必要になる可能性があります。",
  },
  children: {
    whatIfId: "children",
    whatIfLabel: "子どもができたら",
    items: [
      { ...defaultCompareItems[0], level: "slightDecrease" },
      { ...defaultCompareItems[1], level: "bigDecrease" },
      { ...defaultCompareItems[2], level: "slightDecrease" },
      { ...defaultCompareItems[3], level: "slightIncrease" },
      { ...defaultCompareItems[4], level: "bigDecrease" },
      { ...defaultCompareItems[5], level: "slightIncrease" },
      { ...defaultCompareItems[6], level: "slightIncrease" },
    ],
    summary:
      "この選択では、家族としての安定性が増す一方、時間や自由度には大きく負担がかかる可能性があります。",
  },
  relocate: {
    whatIfId: "relocate",
    whatIfLabel: "地方に引っ越したら",
    items: [
      { ...defaultCompareItems[0], level: "slightIncrease" },
      { ...defaultCompareItems[1], level: "bigIncrease" },
      { ...defaultCompareItems[2], level: "slightDecrease" },
      { ...defaultCompareItems[3], level: "slightIncrease" },
      { ...defaultCompareItems[4], level: "slightIncrease" },
      { ...defaultCompareItems[5], level: "bigIncrease" },
      { ...defaultCompareItems[6], level: "slightDecrease" },
    ],
    summary:
      "この選択では、時間や生活の余白が増えることが期待できる一方、キャリアの選択肢が少し狭まる可能性があります。",
  },
  "buy-house": {
    whatIfId: "buy-house",
    whatIfLabel: "家を買ったら",
    items: [
      { ...defaultCompareItems[0], level: "bigDecrease" },
      { ...defaultCompareItems[1], level: "noChange" },
      { ...defaultCompareItems[2], level: "noChange" },
      { ...defaultCompareItems[3], level: "slightIncrease" },
      { ...defaultCompareItems[4], level: "slightDecrease" },
      { ...defaultCompareItems[5], level: "bigDecrease" },
      { ...defaultCompareItems[6], level: "slightDecrease" },
    ],
    summary:
      "この選択では、住まいの安定性が増すことが期待できる一方、お金の余白や住む場所の柔軟性は少し減る可能性があります。",
  },
  independence: {
    whatIfId: "independence",
    whatIfLabel: "独立したら",
    items: [
      { ...defaultCompareItems[0], level: "bigDecrease" },
      { ...defaultCompareItems[1], level: "slightIncrease" },
      { ...defaultCompareItems[2], level: "bigIncrease" },
      { ...defaultCompareItems[3], level: "bigDecrease" },
      { ...defaultCompareItems[4], level: "bigIncrease" },
      { ...defaultCompareItems[5], level: "slightIncrease" },
      { ...defaultCompareItems[6], level: "bigIncrease" },
    ],
    summary:
      "この選択では、自由度や将来の選択肢の広がりが期待できる一方、最初はお金や安定性に大きく負担がかかる可能性があります。",
  },
  custom: {
    whatIfId: "custom",
    whatIfLabel: "自分で設定した条件",
    items: [
      { ...defaultCompareItems[0], level: "slightIncrease" },
      { ...defaultCompareItems[1], level: "slightDecrease" },
      { ...defaultCompareItems[2], level: "slightIncrease" },
      { ...defaultCompareItems[3], level: "noChange" },
      { ...defaultCompareItems[4], level: "slightIncrease" },
      { ...defaultCompareItems[5], level: "noChange" },
      { ...defaultCompareItems[6], level: "slightIncrease" },
    ],
    summary:
      "この選択では、キャリアや自由度の変化が期待できる一方、慣れるまでは時間の使い方に調整が必要になる可能性があります。",
  },
};
