import { parseSigmaCondition, QueryKind, type Query } from "./utils/parser.js";
import util from "node:util";
import type {
  DSMap,
  DSDetectionRecord,
  DSList,
  DiscordSigmaRule,
  DiscordSigmaResult,
} from "./types/discordsigma.js";
import { matchString } from "./handlers/string.js";

function evaluateCondition(
  _key: string,
  value: string | number | string[] | number[],
  structure: any
): boolean {
  const [key] = _key.split("|");
  if (!key) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some((innerValue) =>
      evaluateCondition(_key, innerValue, structure)
    );
  }

  if (key in structure) {
    if (Number.isFinite(value)) {
      const userValue = structure[key];
      if (Number.isFinite(userValue)) {
        return userValue === value;
      }

      return false;
    }

    if (typeof value === "string") {
      const userValue = structure[key];
      if (typeof userValue === "string") {
        return matchString(_key, value, userValue);
      }

      return false;
    }
  }
  return false;
}

function evaluateStringEntry(phrase: string, structure: any) {
  const userString = util.inspect(structure, { depth: null });
  return userString.includes(phrase);
}

function evaluateKeyMap(map: DSMap, structure: any) {
  const results: boolean[] = [];

  for (const [key, value] of Object.entries(map)) {
    results.push(evaluateCondition(key, value, structure));
  }

  return results.every((result) => result);
}

function evaluateDetectionExpression(
  key: string,
  detection: DSDetectionRecord,
  structure: any
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
          return evaluateStringEntry(value, structure);
        } else {
          return evaluateKeyMap(value, structure);
        }
      });
    }

    value satisfies DSMap;
    return evaluateKeyMap(value, structure);
  }

  return false;
}

function curryConditionEvaluation(
  structure: any,
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
        return evaluateDetectionExpression(key, detection, structure);
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
  structure: any,
  rule: DiscordSigmaRule
): DiscordSigmaResult {
  const detection = rule.detection;
  const condition = detection.condition;

  const evaluations = new Map<string, boolean>();
  const root = parseSigmaCondition(condition);

  const evaluationFunction = curryConditionEvaluation(
    structure,
    detection,
    evaluations
  );

  return {
    matches: evaluationFunction(root),
    rule,
  };
}
