import type { APIUser } from "@discordjs/core";
import { parseSigmaCondition, QueryKind, type Query } from "../utils/parser.js";
import RE2 from "re2";
import util from "node:util";

/**
 * Maps (or dictionaries) consist of key/value pairs, in which the key is a field in the log data and the value a string or integer value or list of strings or integer values (connected with or).
 * All elements of a map are joined with a logical AND.
 */
type DSMap = { [key: string]: string | number | string[] | number[] };

/**
 * Lists can contain:
 * strings that are applied to the full log message and are linked with a logical OR.
 * maps (see below). All map items of a list are logically linked with OR.
 */
type DSList = string[] | DSMap[];

type DSDetectionRecord = {
  condition: string;
} & { [key: string]: DSList | DSMap };

export type DiscordSigmaRule = {
  title: string;
  id: string;
  status: string;
  description: string;
  references?: string[];
  author?: string;
  date?: string;
  tags?: string[];
  detection: DSDetectionRecord;
  falsepositives?: string[];
  level: string;
};

export type DiscordSigmaResult = {
  rule: DiscordSigmaRule;
  matches: boolean;
};

export function matchString(key: string, value: string, userValue: string) {
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
  }

  try {
    const re = new RE2(`^${pattern}$`, "i");
    console.log(re.toString());
    return re.test(userValue);
  } catch {
    return false;
  }
}

function evaluateCondition(
  _key: string,
  value: string | number | string[] | number[],
  user: APIUser
): boolean {
  const [key] = _key.split("|");
  if (!key) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some((innerValue) =>
      evaluateCondition(_key, innerValue, user)
    );
  }

  if (key in user) {
    if (Number.isFinite(value)) {
      const userValue = user[key as keyof APIUser];
      if (Number.isFinite(userValue)) {
        return userValue === value;
      }

      return false;
    }

    if (typeof value === "string") {
      const userValue = user[key as keyof APIUser];
      if (typeof userValue === "string") {
        return matchString(_key, value, userValue);
      }

      return false;
    }
  }
  return false;
}

function evaluateStringEntry(phrase: string, user: APIUser) {
  const userString = util.inspect(user, { depth: null });
  return userString.includes(phrase);
}

function evaluateKeyMap(map: DSMap, user: APIUser) {
  const results: boolean[] = [];

  for (const [key, value] of Object.entries(map)) {
    results.push(evaluateCondition(key, value, user));
  }

  return results.every((result) => result);
}

function evaluateDetectionExpression(
  key: string,
  detection: DSDetectionRecord,
  user: APIUser
): boolean {
  if (key in detection) {
    const value = detection[key]!;
    if (Array.isArray(value)) {
      value satisfies DSList;

      if (!value.length) {
        return false;
      }

      return value.some((value) => {
        if (typeof value === "string") {
          return evaluateStringEntry(value, user);
        } else {
          return evaluateKeyMap(value, user);
        }
      });
    }

    value satisfies DSMap;
    return evaluateKeyMap(value, user);
  }

  return false;
}

function curryConditionEvaluation(
  user: APIUser,
  detection: DSDetectionRecord,
  evaluations: Map<string, boolean>
) {
  const evaluateCondition = (query: Query): boolean => {
    switch (query.t) {
      case QueryKind.Term: {
        const key = query.c;
        const hit = evaluations.get(key);
        if (hit) {
          return hit;
        }
        return evaluateDetectionExpression(key, detection, user);
      }
      case QueryKind.Not:
        return !evaluateCondition(query.c);
      case QueryKind.And:
        return evaluateCondition(query.c[0]) && evaluateCondition(query.c[1]);
      case QueryKind.Or:
        return evaluateCondition(query.c[0]) || evaluateCondition(query.c[1]);
    }
  };
  return evaluateCondition;
}

export function handleSigmaRule(
  user: APIUser,
  rule: DiscordSigmaRule
): DiscordSigmaResult {
  const detection = rule.detection;
  const condition = detection.condition;

  const evaluations = new Map<string, boolean>();
  const root = parseSigmaCondition(condition);

  const evaluationFunction = curryConditionEvaluation(
    user,
    detection,
    evaluations
  );

  return {
    matches: evaluationFunction(root),
    rule,
  };
}
