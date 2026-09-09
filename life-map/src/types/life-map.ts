export type AgeRange = "20-24" | "25-29" | "30-34" | "35-39";

export type Employment =
  | "fulltime"
  | "contract"
  | "parttime"
  | "freelance"
  | "selfemployed"
  | "student"
  | "other";

export type DesiredChange =
  | "income"
  | "workHours"
  | "workLocation"
  | "jobContent"
  | "stability"
  | "career"
  | "relationship"
  | "freeTime"
  | "livingPlace"
  | "none";

export type MarriageAttitude =
  | "want"
  | "someday"
  | "either"
  | "no"
  | "unknown"
  | "noAnswer";

export type ChildrenAttitude =
  | "want"
  | "ratherWant"
  | "either"
  | "no"
  | "unknown"
  | "already"
  | "noAnswer";

export type DiagnosisAnswer = {
  ageRange?: AgeRange;
  employment?: Employment;
  workSatisfaction?: number;
  desiredChanges?: DesiredChange[];
  marriageAttitude?: MarriageAttitude;
  childrenAttitude?: ChildrenAttitude;
  incomeVsTime?: "income" | "time";
  locationPreference?: "urban" | "regional";
  workPreference?: "stable" | "challenge";
  presentVsFuture?: "present" | "future";
};

export type ScenarioType = "stable" | "ideal" | "challenge";

export type ScenarioEvent = {
  id: string;
  period: string;
  title: string;
  description: string;
  changes: string[];
  advantages: string[];
  cautions: string[];
};

export type Scenario = {
  id: ScenarioType;
  title: string;
  summary: string;
  focus: string;
  scores: {
    valueMatch: number;
    feasibility: number;
    optionScore: number;
  };
  events: ScenarioEvent[];
};

export type WhatIfOption = {
  id: string;
  label: string;
  description: string;
};

export type CompareLevel =
  | "noChange"
  | "slightIncrease"
  | "bigIncrease"
  | "slightDecrease"
  | "bigDecrease";

export type CompareItem = {
  id: string;
  label: string;
  level: CompareLevel;
};

export type CompareResult = {
  whatIfId: string;
  whatIfLabel: string;
  items: CompareItem[];
  summary: string;
};

export type ActionTask = {
  id: string;
  deadline: string;
  title: string;
  description: string;
};
