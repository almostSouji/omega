import util from "node:util";
import RE2 from "re2";
import { matchDate, matchSnowflake } from "./date.js";

export function matchString(
  key: string,
  value: string,
  evaluatedValue: string,
) {
  const [, op] = key.split("|");

  let pattern =
    op === "re" ? value : value.replaceAll("*", ".*").replaceAll("?", ".");
  switch (op) {
    case "contains":
      pattern = `.*${pattern}.*`;
      break;
    case "startswith":
      pattern = `${pattern}.*`;
      break;
    case "endswith":
      pattern = `.*${pattern}`;
      break;
    case "date":
      return matchDate(key, value, evaluatedValue);
    default:
  }

  if (op?.startsWith("snowflake")) {
    return matchSnowflake(key, value, evaluatedValue);
  }

  try {
    const re = new RE2(`^${pattern}$`, "i");
    return re.test(evaluatedValue);
  } catch {
    return false;
  }
}

export function phraseAnywhere(phrase: string, structure: any) {
  const stringified = util.inspect(structure, { depth: 100 });
  return stringified.includes(phrase);
}
