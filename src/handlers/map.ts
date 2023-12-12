import { evaluateCondition } from "../sigma.js";
import type { SigmaMap } from "../types/discordsigma.js";

export function matchKeyMap(map: SigmaMap, structure: any) {
  return Object.entries(map)
    .map(([key, value]) => {
      return evaluateCondition(key, value, structure);
    })
    .every(Boolean);
}
