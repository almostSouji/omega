import { evaluateCondition } from "../omega.js";
import type { OmegaMap } from "../types/omega.js";

export function matchKeyMap(map: OmegaMap, structure: any) {
  return Object.entries(map)
    .map(([key, value]) => {
      return evaluateCondition(key, value, structure);
    })
    .every(Boolean);
}
