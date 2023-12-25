import { evaluateCondition } from "../omega.js";

export function matchList(
  list: number[] | string[],
  key: string,
  structure: any,
) {
  return list.some((innerValue) => {
    return evaluateCondition(key, innerValue, structure);
  });
}
