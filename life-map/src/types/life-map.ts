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
  /** True when this event is a branch point (see BranchPoint below). Additive/optional so older renderers keep working. */
  isBranchPoint?: boolean;
  /** The underlying LifeEvent id this was generated from (e.g. "job_change"), for /if linking. */
  sourceEventId?: string;
};

export type BottleneckRisk = {
  period: string;
  message: string;
};

export type OptionScoreBreakdown = {
  financialBuffer: number;
  timeBuffer: number;
  careerFlexibility: number;
  locationFlexibility: number;
  lifestyleFlexibility: number;
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
  /** Additive: periods where multiple high-impact events cluster together. */
  risks?: BottleneckRisk[];
  /** Additive: the 5-axis breakdown behind scores.optionScore. */
  optionBreakdown?: OptionScoreBreakdown;
};

// ---------------------------------------------------------------------------
// Event Engine: Event Master + deterministic candidate/route generation
// ---------------------------------------------------------------------------

export type EventCategory =
  | "career"
  | "housing"
  | "finance"
  | "relationship"
  | "family"
  | "familySupport"
  | "personal";

/** The 8 axes every LifeEvent's effects (and the user's ValueProfile) are expressed in. */
export type EffectAxis =
  | "money"
  | "time"
  | "career"
  | "stability"
  | "family"
  | "freedom"
  | "location"
  | "experience";

export type EventEffects = Record<EffectAxis, number>;

/**
 * Declarative, if-style condition block. Every specified key must hold for
 * the block to match (AND across keys); array-valued keys match when the
 * user's answer is included in the array (OR within the key).
 */
export type EventCondition = {
  employment?: Employment[];
  workSatisfactionMax?: number;
  workSatisfactionMin?: number;
  marriageAttitude?: MarriageAttitude[];
  childrenAttitude?: ChildrenAttitude[];
  desiredChangesIncludesAny?: DesiredChange[];
  incomeVsTime?: Array<"income" | "time">;
  locationPreference?: Array<"urban" | "regional">;
  workPreference?: Array<"stable" | "challenge">;
  presentVsFuture?: Array<"present" | "future">;
  ageRangeIn?: AgeRange[];
};

export type LifeEvent = {
  /** snake_case id, e.g. "job_change" — also used for /if?event= linking. */
  id: string;
  /** Reference code from the spec, e.g. "E01". */
  code: string;
  category: EventCategory;
  name: string;
  description: string;
  minAge: number;
  maxAge: number;
  impactLevel: 1 | 2 | 3 | 4 | 5;
  /** Soft match: each satisfied key contributes to Goal Match, mismatches contribute to Constraint Conflict. */
  conditions: EventCondition;
  /** Hard match: every specified key must hold or the event is excluded entirely. */
  hardConstraints: EventCondition;
  /** If set, the event is only a candidate when at least one of these condition sets fully matches (OR of AND-blocks). */
  hardRequiresAnyOf?: EventCondition[];
  /** Other event ids that must already be selected in the same route for this one to be eligible. */
  prerequisites: string[];
  /** Soft ordering only: if present in the same route, this event is placed after them on the timeline. */
  recommendedAfter: string[];
  /** Event ids that cannot coexist with this one in the same route. */
  conflicts: string[];
  effects: EventEffects;
  /** Event ids this one commonly leads to — feeds branch-point detection and downstream scoring boosts. */
  downstreamEvents: string[];
};

export type ValueProfile = Record<EffectAxis, number>;

export type Goals = {
  wantsMarriage: boolean;
  wantsChildren: boolean;
  wantsIncomeUp: boolean;
  wantsCareerChange: boolean;
  wantsMoreTime: boolean;
  wantsLocationChange: boolean;
  wantsStability: boolean;
  wantsRelationship: boolean;
};

export type Constraints = {
  ageMidpoint: number;
  planningHorizonEndAge: number;
  excludeMarriage: boolean;
  excludeChildren: boolean;
  employment?: Employment;
};

export type DiagnosisProfile = {
  answers: DiagnosisAnswer;
  valueProfile: ValueProfile;
  goals: Goals;
  constraints: Constraints;
};

export type EventScoreBreakdown = {
  goalMatch: number;
  valueMatch: number;
  feasibility: number;
  lifeStageMatch: number;
  constraintConflict: number;
  total: number;
};

export type CandidateEvent = {
  event: LifeEvent;
  score: EventScoreBreakdown;
};

export type PeriodBucket = 0 | 1 | 2 | 3;

export type BranchPoint = {
  eventId: string;
  name: string;
  downstreamCount: number;
};

export type ActionTask = {
  id: string;
  deadline: string;
  title: string;
  description: string;
};
