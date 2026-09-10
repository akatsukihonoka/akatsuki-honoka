import type { Scenario, ScenarioType } from "@/types/life-map";

export const scenarioMeta: Record<
  ScenarioType,
  {
    label: string;
    color: string;
    /** One-line world description, distinct from the longer `summary` — used on the /map overview cards. */
    tagline: string;
    emoji: string;
    colorClass: {
      bg: string;
      border: string;
      text: string;
      chip: string;
      bar: string;
      /** Soft tinted background for the /map "world card" treatment. */
      worldBg: string;
      /** Gradient badge classes for the route's icon circle. */
      badgeGradient: string;
    };
    /** Hex pair matching the CSS custom properties in globals.css — for SVG gradients (BranchMapDiagram). */
    gradient: { from: string; to: string };
    metricLabels: {
      valueMatch: string;
      feasibility: string;
      optionScore: string;
    };
  }
> = {
  stable: {
    label: "安定ルート",
    color: "green",
    tagline: "今を大きく変えず、じっくり育てる未来",
    emoji: "🌿",
    colorClass: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      chip: "bg-emerald-100 text-emerald-800",
      bar: "bg-emerald-400",
      worldBg: "bg-gradient-to-br from-emerald-50 to-teal-50",
      badgeGradient: "bg-gradient-to-br from-emerald-300 to-teal-400",
    },
    gradient: { from: "#6ee7b7", to: "#34d399" },
    metricLabels: {
      valueMatch: "価値観との相性",
      feasibility: "実現しやすさ",
      optionScore: "未来の余白",
    },
  },
  ideal: {
    label: "理想ルート",
    color: "pink",
    tagline: "大切にしたいことを中心に進む未来",
    emoji: "🌸",
    colorClass: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-700",
      chip: "bg-rose-100 text-rose-800",
      bar: "bg-rose-400",
      worldBg: "bg-gradient-to-br from-pink-50 to-rose-50",
      badgeGradient: "bg-gradient-to-br from-pink-300 to-rose-400",
    },
    gradient: { from: "#fda4af", to: "#fb7185" },
    metricLabels: {
      valueMatch: "価値観との相性",
      feasibility: "目標への近さ",
      optionScore: "未来の余白",
    },
  },
  challenge: {
    label: "挑戦ルート",
    color: "orange",
    tagline: "変化を取り入れて、選択肢を広げる未来",
    emoji: "🚀",
    colorClass: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      chip: "bg-orange-100 text-orange-800",
      bar: "bg-orange-400",
      worldBg: "bg-gradient-to-br from-orange-50 to-amber-50",
      badgeGradient: "bg-gradient-to-br from-orange-300 to-amber-400",
    },
    gradient: { from: "#fdba74", to: "#fb923c" },
    metricLabels: {
      valueMatch: "価値観との相性",
      feasibility: "選択肢の広がり",
      optionScore: "未来の余白",
    },
  },
};

export const mockScenarios: Record<ScenarioType, Scenario> = {
  stable: {
    id: "stable",
    title: "今の生活を守りながら、少しずつ整える",
    summary:
      "大きな変化を抑え、安定性や生活の余白を重視するルートです。今の環境を土台にしながら、無理のない範囲で調整していく選択肢を整理しています。",
    focus: "安定性・生活の余白を重視するルート",
    scores: { valueMatch: 68, feasibility: 88, optionScore: 55 },
    events: [
      {
        id: "stable-1",
        period: "今〜1年以内",
        title: "働き方を見直す",
        description:
          "今の仕事内容や働き方を棚卸しし、負担になっている部分を整理する時期になる可能性があります。",
        changes: ["業務内容の一部見直し", "働く時間の調整"],
        advantages: ["環境を大きく変えずに整理できる可能性があります", "生活リズムを保ちやすくなります"],
        cautions: ["変化が小さい分、実感が得にくい場合があります"],
      },
      {
        id: "stable-2",
        period: "30〜32歳頃",
        title: "スキルを身につける",
        description:
          "今の仕事の中でできる範囲のスキルアップを検討しやすい時期になる可能性があります。",
        changes: ["資格取得の検討", "社内での役割の広がり"],
        advantages: ["今の職場にいながら選択肢を広げられる可能性があります"],
        cautions: ["学習の時間確保が課題になる場合があります"],
      },
      {
        id: "stable-3",
        period: "33〜35歳頃",
        title: "収入の柱を増やす",
        description:
          "無理のない範囲で、収入源を一つ増やすことを検討しやすくなる可能性があります。",
        changes: ["小規模な副業の検討", "資産形成の見直し"],
        advantages: ["本業を維持したまま将来への備えを進めやすくなります"],
        cautions: ["時間や体力の配分に注意が必要になる場合があります"],
      },
      {
        id: "stable-4",
        period: "35歳以降",
        title: "家族との時間を増やす",
        description:
          "積み上げてきた安定を土台に、生活の余白を意識しやすくなる可能性があります。",
        changes: ["働く時間の再調整", "住む場所の見直し"],
        advantages: ["生活の余白を確保しやすくなる可能性があります"],
        cautions: ["環境の変化が少ない分、新しい選択肢は限られる場合があります"],
      },
    ],
  },
  ideal: {
    id: "ideal",
    title: "大切にしたいことを、今より優先する",
    summary:
      "あなたが選んだ希望や価値観を中心に組み立てるルートです。今大切にしたいと感じていることに、少しずつ比重を移していく選択肢を整理しています。",
    focus: "価値観・希望を優先するルート",
    scores: { valueMatch: 85, feasibility: 66, optionScore: 70 },
    events: [
      {
        id: "ideal-1",
        period: "今〜1年以内",
        title: "働き方を見直す",
        description:
          "大切にしたいことを言語化し、今の働き方とのズレを整理する時期になる可能性があります。",
        changes: ["優先したいことの整理", "働く時間・場所の希望の明確化"],
        advantages: ["自分の希望に沿った選択肢が見えやすくなります"],
        cautions: ["理想と現実のギャップに向き合う必要がある場合があります"],
      },
      {
        id: "ideal-2",
        period: "30〜32歳頃",
        title: "転職を検討する",
        description:
          "希望する条件に近い環境を探し始めることが選択肢になります。",
        changes: ["転職活動の開始", "働く場所の見直し"],
        advantages: ["価値観に近い環境を選びやすくなる可能性があります"],
        cautions: ["準備期間や情報収集に時間がかかる場合があります"],
      },
      {
        id: "ideal-3",
        period: "33〜35歳頃",
        title: "住む場所を見直す",
        description:
          "働き方の変化に合わせて、暮らす場所を見直すことも選択肢になります。",
        changes: ["引っ越しの検討", "生活拠点の見直し"],
        advantages: ["暮らしと価値観のバランスを取りやすくなる可能性があります"],
        cautions: ["生活コストや人間関係の変化を考慮する必要があります"],
      },
      {
        id: "ideal-4",
        period: "35歳以降",
        title: "家族との時間を増やす",
        description:
          "希望に近い形で、大切にしたいことに時間を配分しやすくなる可能性があります。",
        changes: ["働く時間の再設計", "優先順位の再確認"],
        advantages: ["納得感のある形で日々を過ごしやすくなる可能性があります"],
        cautions: ["希望を維持するための調整が続く場合があります"],
      },
    ],
  },
  challenge: {
    id: "challenge",
    title: "変化を受け入れて、選択肢を広げる",
    summary:
      "転職・引っ越し・副業など、大きめの変化も含めて考えるルートです。今の枠を広げることで、新しい選択肢に触れていく可能性を整理しています。",
    focus: "変化・選択肢の広がりを重視するルート",
    scores: { valueMatch: 72, feasibility: 52, optionScore: 90 },
    events: [
      {
        id: "challenge-1",
        period: "今〜1年以内",
        title: "スキルを身につける",
        description:
          "新しい環境に踏み出すための準備として、スキルの習得を検討しやすい時期になる可能性があります。",
        changes: ["学習の開始", "情報収集の強化"],
        advantages: ["選択肢を広げる土台を作りやすくなります"],
        cautions: ["準備にかかる時間や費用の負担が生じる場合があります"],
      },
      {
        id: "challenge-2",
        period: "30〜32歳頃",
        title: "転職を検討する",
        description:
          "業種や職種を変える転職も、検討しやすくなる時期になる可能性があります。",
        changes: ["転職・異業種への挑戦", "収入構造の変化"],
        advantages: ["新しい環境で選択肢が広がる可能性があります"],
        cautions: ["収入や安定性が一時的に変動する場合があります"],
      },
      {
        id: "challenge-3",
        period: "33〜35歳頃",
        title: "収入の柱を増やす",
        description:
          "副業や独立など、収入源を複数持つことも選択肢になります。",
        changes: ["副業・独立の検討", "働き方の多様化"],
        advantages: ["将来の選択肢が広がりやすくなる可能性があります"],
        cautions: ["生活の安定性に負担がかかる場合があります"],
      },
      {
        id: "challenge-4",
        period: "35歳以降",
        title: "住む場所を見直す",
        description:
          "働き方の変化に合わせて、拠点を柔軟に見直すことも検討しやすくなる可能性があります。",
        changes: ["拠点の見直し", "働き方の再構築"],
        advantages: ["環境の変化を活かした選択肢が持てる可能性があります"],
        cautions: ["変化の多さが負担に感じられる場合があります"],
      },
    ],
  },
};
