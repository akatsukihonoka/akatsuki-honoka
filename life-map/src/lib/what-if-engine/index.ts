export { applyEvent, passesHardEligibility } from "./apply-event";
export { expandDownstream } from "./dependency";
export { computeAxisScores, diffAxisScores, ALL_AXES } from "./effects";
export { diffRisks } from "./risk";
export { buildCausalChain } from "./causal-chain";
export { buildComparison } from "./compare";
export { recalculateScenario } from "./recalculate";
export type {
  CausalChainStep,
  ChangedAxis,
  WhatIfAccepted,
  WhatIfComparison,
  WhatIfInput,
  WhatIfRejected,
  WhatIfResult,
} from "./types";
