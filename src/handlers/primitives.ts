import { matchDate } from "./date.js";
import { matchNumber } from "./number.js";
import { matchString } from "./string.js";

export function matchPrimitives(
  key: string,
  value: boolean | string | number,
  structure: any
) {
  const [pureKey] = key.split("|");
  if (!pureKey) {
    return false;
  }

  if (pureKey in structure) {
    if (Number.isFinite(value)) {
      const evaluatedValue = structure[pureKey];
      if (Number.isFinite(evaluatedValue)) {
        return matchNumber(key, value as number, evaluatedValue as number);
      }
    }

    if (typeof value === "string") {
      const evaluatedValue = structure[pureKey];
      if (typeof evaluatedValue === "string") {
        return matchString(key, value, evaluatedValue);
      }

      if (evaluatedValue instanceof Date) {
        return matchDate(key, value, evaluatedValue);
      }
    }

    if (typeof value === "boolean") {
      const evaluatedValue = structure[pureKey];
      if (typeof evaluatedValue === "boolean") {
        return value === evaluatedValue;
      }
    }
  }
  return false;
}
