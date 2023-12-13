import { evaluateCondition } from "../sigma.js";
import type { SigmaMap } from "../types/jsSigma.js";

export function matchKeyMap(map: SigmaMap, structure: any) {
  return Object.entries(map)
    .map(([key, value]) => {
      return evaluateCondition(key, value, structure);
    })
    .every(Boolean);
}
