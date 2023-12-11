import type { APIUser } from "@discordjs/core";
import { parseSigmaCondition, QueryKind, type Query } from "../utils/parser.js";
import RE2 from "re2";
import util from "node:util";
import type {
  DSMap,
  DSDetectionRecord,
  DSList,
  DiscordSigmaRule,
  DiscordSigmaResult,
} from "../types/discordsigma.js";

function parseDate(date: string) {
  return /\d{4}\/\d{2}\/\d{2}/.exec(date)
    ? new Date(`${date} GMT`)
    : new Date(date);
}

function compareDate(a: Date, b: Date) {
  return a.getTime() - b.getTime();
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function matchDate(key: string, value: string, userValue: string) {
  const valueDate = parseDate(value);
  const userValueDate = parseDate(userValue);

  const [, , op] = key.split("|");
  switch (op) {
    case "before":
      return compareDate(userValueDate, valueDate) < 0;
    case "after":
      return compareDate(userValueDate, valueDate) > 0;
    case "sameday":
      return isSameDay(userValueDate, valueDate);
    default:
      return compareDate(userValueDate, valueDate) === 0;
  }
}

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
    case "date":
      return matchDate(key, value, userValue);
  }

  try {
    const re = new RE2(`^${pattern}$`, "i");
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
