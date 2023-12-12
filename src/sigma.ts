import { parseSigmaCondition, QueryKind, type Query } from "./utils/parser.js";
import type {
  SigmaMap,
  DetectionRecord,
  SigmaList,
  Rule,
  SigmaResult,
} from "./types/discordsigma.js";
import { phraseAnywhere } from "./handlers/string.js";
import { matchList } from "./handlers/list.js";
import { handleMultiPartKey } from "./handlers/multiPartKey.js";
import { matchPrimitives } from "./handlers/primitives.js";
import { matchKeyMap } from "./handlers/map.js";

export function evaluateCondition(
  key: string,
  value: boolean | string | number | string[] | number[],
  structure: any
): boolean {
  if (Array.isArray(value)) {
    return matchList(value, key, structure);
  }

  if (key.includes(".")) {
    const { key: remainingKey, structure: innerStructure } = handleMultiPartKey(
      key,
      structure
    );

    if (!innerStructure || !remainingKey) {
      return false;
    }

    return evaluateCondition(remainingKey, value, innerStructure);
  }

  return matchPrimitives(key, value, structure);
}

function evaluateDetectionExpression(
  key: string,
  detection: DetectionRecord,
  structure: any
): boolean {
  if (key in detection) {
    const value = detection[key]!;
    if (Array.isArray(value)) {
      value satisfies SigmaList;

      if (!value.length) {
        return false;
      }

      return value.some((value) => {
        if (typeof value === "string") {
          return phraseAnywhere(value, structure);
        } else if (Number.isFinite(value)) {
          return phraseAnywhere(String(value), structure);
        } else {
          return matchKeyMap(value, structure);
        }
      });
    }

    value satisfies SigmaMap;
    return matchKeyMap(value, structure);
  }

  return false;
}

function curryConditionEvaluation(
  structure: any,
  detection: DetectionRecord,
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

export function handleSigmaRule(structure: any, rule: Rule): SigmaResult {
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
