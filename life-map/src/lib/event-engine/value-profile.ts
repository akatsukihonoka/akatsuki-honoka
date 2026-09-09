import type {
  Constraints,
  DiagnosisAnswer,
  DiagnosisProfile,
  EffectAxis,
  Goals,
  ValueProfile,
} from "@/types/life-map";

const AGE_MIDPOINT: Record<string, number> = {
  "20-24": 22,
  "25-29": 27,
  "30-34": 32,
  "35-39": 37,
};

const DEFAULT_AGE_MIDPOINT = 27;
const PLANNING_HORIZON_YEARS = 12;

function emptyValueProfile(): ValueProfile {
  return {
    money: 0,
    time: 0,
    career: 0,
    stability: 0,
    family: 0,
    freedom: 0,
    location: 0,
    experience: 0,
  };
}

function bump(profile: ValueProfile, axis: EffectAxis, delta: number) {
  profile[axis] += delta;
}

/**
 * Diagnosis answers -> ValueProfile: a deterministic 8-axis weight vector
 * describing how much the user values each axis moving up. Every answer
 * maps to a fixed delta; no randomness, no ordering dependence.
 */
export function buildValueProfile(answers: DiagnosisAnswer): ValueProfile {
  const profile = emptyValueProfile();

  if (answers.incomeVsTime === "income") {
    bump(profile, "money", 1);
    bump(profile, "time", -1);
  } else if (answers.incomeVsTime === "time") {
    bump(profile, "time", 1);
    bump(profile, "money", -1);
  }

  if (answers.workPreference === "stable") {
    bump(profile, "stability", 1);
    bump(profile, "freedom", -1);
  } else if (answers.workPreference === "challenge") {
    bump(profile, "freedom", 1);
    bump(profile, "career", 1);
    bump(profile, "stability", -1);
  }

  if (answers.locationPreference === "urban") {
    bump(profile, "career", 1);
    bump(profile, "location", 1);
  } else if (answers.locationPreference === "regional") {
    bump(profile, "stability", 1);
    bump(profile, "location", -1);
  }

  if (answers.presentVsFuture === "future") {
    bump(profile, "stability", 1);
    bump(profile, "money", 1);
  } else if (answers.presentVsFuture === "present") {
    bump(profile, "experience", 1);
    bump(profile, "freedom", 1);
  }

  if (typeof answers.workSatisfaction === "number") {
    if (answers.workSatisfaction <= 2) {
      bump(profile, "career", 1);
      bump(profile, "stability", -1);
    } else if (answers.workSatisfaction >= 4) {
      bump(profile, "stability", 1);
    }
  }

  if (answers.marriageAttitude === "want" || answers.marriageAttitude === "someday") {
    bump(profile, "family", 1);
  }
  if (answers.childrenAttitude === "want" || answers.childrenAttitude === "ratherWant") {
    bump(profile, "family", 1);
  }

  const desiredChangeToAxis: Partial<Record<string, EffectAxis[]>> = {
    income: ["money"],
    workHours: ["time"],
    workLocation: ["location"],
    jobContent: ["career"],
    stability: ["stability"],
    career: ["career"],
    relationship: ["family"],
    freeTime: ["time", "freedom"],
    livingPlace: ["location"],
  };

  for (const change of answers.desiredChanges ?? []) {
    for (const axis of desiredChangeToAxis[change] ?? []) {
      bump(profile, axis, 1);
    }
  }

  return profile;
}

/** Diagnosis answers -> explicit, named goals (the "what the user is actually after" layer). */
export function buildGoals(answers: DiagnosisAnswer): Goals {
  const desired = new Set(answers.desiredChanges ?? []);

  return {
    wantsMarriage:
      answers.marriageAttitude === "want" || answers.marriageAttitude === "someday",
    wantsChildren:
      answers.childrenAttitude === "want" || answers.childrenAttitude === "ratherWant",
    wantsIncomeUp: desired.has("income"),
    wantsCareerChange: desired.has("career") || desired.has("jobContent"),
    wantsMoreTime: desired.has("workHours") || desired.has("freeTime"),
    wantsLocationChange: desired.has("livingPlace") || desired.has("workLocation"),
    wantsStability: desired.has("stability"),
    wantsRelationship: desired.has("relationship"),
  };
}

/** Diagnosis answers -> hard constraints: age window and explicit opt-outs. */
export function buildConstraints(answers: DiagnosisAnswer): Constraints {
  const ageMidpoint = answers.ageRange
    ? (AGE_MIDPOINT[answers.ageRange] ?? DEFAULT_AGE_MIDPOINT)
    : DEFAULT_AGE_MIDPOINT;

  return {
    ageMidpoint,
    planningHorizonEndAge: ageMidpoint + PLANNING_HORIZON_YEARS,
    excludeMarriage: answers.marriageAttitude === "no",
    excludeChildren: answers.childrenAttitude === "no",
    employment: answers.employment,
  };
}

export function buildDiagnosisProfile(answers: DiagnosisAnswer): DiagnosisProfile {
  return {
    answers,
    valueProfile: buildValueProfile(answers),
    goals: buildGoals(answers),
    constraints: buildConstraints(answers),
  };
}
