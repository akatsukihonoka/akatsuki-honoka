import type { DiagnosisAnswer } from "@/types/life-map";

type OptionalKey<T> = Extract<keyof DiagnosisAnswer, T>;

export type ChoiceOption = { value: string; label: string };

export type BinaryOption = { value: string; label: string; description: string };

export type SingleChoiceQuestion = {
  id: number;
  type: "single";
  key: OptionalKey<
    "ageRange" | "employment" | "marriageAttitude" | "childrenAttitude"
  >;
  question: string;
  options: ChoiceOption[];
};

export type MultiChoiceQuestion = {
  id: number;
  type: "multi";
  key: "desiredChanges";
  question: string;
  helper: string;
  options: ChoiceOption[];
};

export type ScaleQuestion = {
  id: number;
  type: "scale";
  key: "workSatisfaction";
  question: string;
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
};

export type BinaryQuestion = {
  id: number;
  type: "binary";
  key: OptionalKey<
    "incomeVsTime" | "locationPreference" | "workPreference" | "presentVsFuture"
  >;
  question: string;
  optionA: BinaryOption;
  optionB: BinaryOption;
};

export type DiagnosisQuestion =
  | SingleChoiceQuestion
  | MultiChoiceQuestion
  | ScaleQuestion
  | BinaryQuestion;

export const diagnosisQuestions: DiagnosisQuestion[] = [
  {
    id: 1,
    type: "single",
    key: "ageRange",
    question: "あなたの年齢を教えてください。",
    options: [
      { value: "20-24", label: "20〜24歳" },
      { value: "25-29", label: "25〜29歳" },
      { value: "30-34", label: "30〜34歳" },
      { value: "35-39", label: "35〜39歳" },
    ],
  },
  {
    id: 2,
    type: "single",
    key: "employment",
    question: "現在の働き方は？",
    options: [
      { value: "fulltime", label: "正社員" },
      { value: "contract", label: "契約・派遣" },
      { value: "parttime", label: "パート・アルバイト" },
      { value: "freelance", label: "フリーランス" },
      { value: "selfemployed", label: "自営業" },
      { value: "student", label: "学生" },
      { value: "other", label: "その他" },
    ],
  },
  {
    id: 3,
    type: "scale",
    key: "workSatisfaction",
    question: "今の仕事への満足度は？",
    min: 1,
    max: 5,
    minLabel: "満足していない",
    maxLabel: "満足している",
  },
  {
    id: 4,
    type: "multi",
    key: "desiredChanges",
    question: "今、変えたいと思っていることは？",
    helper: "複数選択できます",
    options: [
      { value: "income", label: "収入" },
      { value: "workHours", label: "働く時間" },
      { value: "workLocation", label: "働く場所" },
      { value: "jobContent", label: "仕事内容" },
      { value: "stability", label: "安定性" },
      { value: "career", label: "キャリア" },
      { value: "relationship", label: "恋愛・結婚" },
      { value: "freeTime", label: "自由時間" },
      { value: "livingPlace", label: "住む場所" },
      { value: "none", label: "特にない" },
    ],
  },
  {
    id: 5,
    type: "single",
    key: "marriageAttitude",
    question: "将来、結婚についてどう考えていますか？",
    options: [
      { value: "want", label: "できればしたい" },
      { value: "someday", label: "いつかしたい" },
      { value: "either", label: "どちらでもいい" },
      { value: "no", label: "したくない" },
      { value: "unknown", label: "まだわからない" },
      { value: "noAnswer", label: "回答しない" },
    ],
  },
  {
    id: 6,
    type: "single",
    key: "childrenAttitude",
    question: "子どもについてどう考えていますか？",
    options: [
      { value: "want", label: "欲しい" },
      { value: "ratherWant", label: "できれば欲しい" },
      { value: "either", label: "どちらでもいい" },
      { value: "no", label: "欲しくない" },
      { value: "unknown", label: "まだわからない" },
      { value: "already", label: "すでにいる" },
      { value: "noAnswer", label: "回答しない" },
    ],
  },
  {
    id: 7,
    type: "binary",
    key: "incomeVsTime",
    question: "次のうち、今の自分に近いものは？",
    optionA: {
      value: "income",
      label: "収入が高くても忙しい仕事",
      description: "収入を優先したいタイプ",
    },
    optionB: {
      value: "time",
      label: "収入が少し低くても自由時間が多い仕事",
      description: "時間の余白を優先したいタイプ",
    },
  },
  {
    id: 8,
    type: "binary",
    key: "locationPreference",
    question: "次のうち、今の自分に近いものは？",
    optionA: {
      value: "urban",
      label: "便利な都会で暮らす",
      description: "利便性を優先したいタイプ",
    },
    optionB: {
      value: "regional",
      label: "少し不便でも落ち着いた場所で暮らす",
      description: "落ち着きを優先したいタイプ",
    },
  },
  {
    id: 9,
    type: "binary",
    key: "workPreference",
    question: "次のうち、今の自分に近いものは？",
    optionA: {
      value: "stable",
      label: "安定した会社で働く",
      description: "安定を優先したいタイプ",
    },
    optionB: {
      value: "challenge",
      label: "変化があっても挑戦できる環境で働く",
      description: "挑戦を優先したいタイプ",
    },
  },
  {
    id: 10,
    type: "binary",
    key: "presentVsFuture",
    question: "次のうち、今の自分に近いものは？",
    optionA: {
      value: "future",
      label: "将来のために今から備える",
      description: "将来への備えを優先したいタイプ",
    },
    optionB: {
      value: "present",
      label: "今の楽しさや経験も大切にする",
      description: "今の充実を優先したいタイプ",
    },
  },
];
