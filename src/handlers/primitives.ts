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
      const userValue = structure[pureKey];
      if (Number.isFinite(userValue)) {
        return matchNumber(key, value as number, userValue as number);
      }
    }

    if (typeof value === "string") {
      const userValue = structure[pureKey];
      if (typeof userValue === "string") {
        return matchString(key, value, userValue);
      }
    }

    if (typeof value === "boolean") {
      const userValue = structure[pureKey];
      if (typeof userValue === "boolean") {
        return value === userValue;
      }
    }
  }
  return false;
}
