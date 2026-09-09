export { applyEvent, passesHardEligibility } from "./apply-event";
export { expandDownstream } from "./dependency";
export { computeAxisScores, diffAxisScores, ALL_AXES } from "./effects";
export { diffRisks } from "./risk";
export { buildCausalChain } from "./causal-chain";
export { buildComparison } from "./compare";
export { recalculateScenario } from "./recalculate";
export {
  applyChain,
  buildChainCausalChain,
  compareChainOverall,
  lastAcceptedResult,
  MAX_CHAIN_LENGTH,
  CHAIN_LIMIT_REASON,
  DUPLICATE_EVENT_REASON,
} from "./chain";
export type {
  CausalChainStep,
  ChangedAxis,
  WhatIfAccepted,
  WhatIfChain,
  WhatIfComparison,
  WhatIfInput,
  WhatIfRejected,
  WhatIfResult,
} from "./types";
