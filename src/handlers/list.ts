import { evaluateCondition } from "../omega.js";

export function matchList(
  list: string[] | number[],
  key: string,
  structure: any
) {
  return list.some((innerValue) => {
    return evaluateCondition(key, innerValue, structure);
  });
}
