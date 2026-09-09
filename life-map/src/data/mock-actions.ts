import type { ActionTask } from "@/types/life-map";

export const mockActionTasks: ActionTask[] = [
  {
    id: "action-1",
    deadline: "今月",
    title: "気になる求人を3件見てみる",
    description: "気になる求人を3件見て、今の仕事との違いを整理してみましょう。",
  },
  {
    id: "action-2",
    deadline: "3ヶ月以内",
    title: "学習方法を1つ決める",
    description: "必要なスキルや資格を整理し、学習方法を1つ決めてみましょう。",
  },
  {
    id: "action-3",
    deadline: "1年以内",
    title: "優先する方向性を判断する",
    description: "転職・副業・現職継続のどれを優先するか判断してみましょう。",
  },
];
