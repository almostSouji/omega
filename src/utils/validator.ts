import { parse } from "yaml";
import { extractConditionTerms } from "../omega.js";
import { parseOmegaCondition } from "./parser.js";

export const relationTypes = [
  "derived",
  "obsoletes",
  "merged",
  "renamed",
  "similar",
] as const;

export const ruleLevels = [
  "informational",
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const ruleStati = [
  "unsupported",
  "deprecated",
  "experimental",
  "test",
  "stable",
] as const;

export enum RuleValidationErrorType {
  MissingRequired,
  InvalidInput,
  ConditionParseFailure,
  PropertyMissing,
}

export type RuleValidationError =
  | {
      type: RuleValidationErrorType.MissingRequired;
      fieldName: string;
    }
  | {
      type: RuleValidationErrorType.InvalidInput;
    }
  | {
      type: RuleValidationErrorType.ConditionParseFailure;
    }
  | {
      type: RuleValidationErrorType.PropertyMissing;
      property: string;
    };

export type ValidRuleResult = {
  valid: true;
  warnings?: string[];
};

export type InvalidRuleResult = {
  valid: false;
  warnings?: string[];
  errors: RuleValidationError[];
};

export type RuleValidationResult = ValidRuleResult | InvalidRuleResult;

/**
 * Validate a value to be a valid Omega rule
 * @param rule - The structure to validate as Rule
 * @returns The validation result
 */
export function validateRule(rule: any): RuleValidationResult {
  const errors: RuleValidationError[] = [];
  const warnings: string[] = [];
  if (!rule || typeof rule !== "object") {
    return {
      valid: false,
      errors: [
        {
          type: RuleValidationErrorType.InvalidInput,
        },
      ],
    };
  }

  if (!rule.title) {
    errors.push({
      type: RuleValidationErrorType.MissingRequired,
      fieldName: "title",
    });
  }

  if (rule.detection) {
    const condition = rule.detection.condition;
    if (condition) {
      const root = parseOmegaCondition(condition);
      if (root) {
        const terms = extractConditionTerms(condition) ?? [];
        for (const property of terms) {
          if (!(property in rule.detection)) {
            errors.push({
              type: RuleValidationErrorType.PropertyMissing,
              property,
            });
          }
        }

        for (const property of Object.keys(rule.detection)) {
          if (!terms.includes(property) && property !== "condition") {
            warnings.push(
              `Found unused property ${property} not present in the detection condition.`
            );
          }
        }
      } else {
        errors.push({
          type: RuleValidationErrorType.ConditionParseFailure,
        });
      }
    } else {
      errors.push({
        type: RuleValidationErrorType.MissingRequired,
        fieldName: "detection.condition",
      });
    }
  } else {
    errors.push({
      type: RuleValidationErrorType.MissingRequired,
      fieldName: "detection",
    });
  }

  if (rule.status) {
    const status = rule.status;
    if (!ruleStati.includes(status)) {
      warnings.push(
        `Non-standard rule status, expected one of ${ruleStati.join(
          ", "
        )} received ${status}`
      );
    }
  }

  if (rule.level) {
    const level = rule.level;
    if (!ruleLevels.includes(level)) {
      warnings.push(
        `Non-standard rule level, expected one of ${ruleLevels.join(
          ", "
        )}, received ${level}`
      );
    }
  }

  if (rule.related) {
    const relations = rule.related;
    if (Array.isArray(relations)) {
      const uniqueIds = new Set();
      for (const relation of relations) {
        if (
          (relation.id && relation.type) ||
          typeof relation.id === "string" ||
          typeof relation.type === "string"
        ) {
          const before = uniqueIds.size;
          uniqueIds.add(relation.id);

          const type = relation.type;
          if (!relationTypes.includes(type)) {
            warnings.push(
              `Non-standard relation type at relation id ${
                relation.id
              }, expected one of ${relationTypes.join(", ")}, received ${type}`
            );
          }

          if (uniqueIds.size !== before + 1) {
            warnings.push(`Non-unique relation id ${relation.id}`);
          }
        } else {
          warnings.push(
            `Non-standard relation shape, expected id: string, type: string, received ${relation}`
          );
        }
      }
    } else {
      warnings.push(
        `Non-standard related value, expected list, found ${rule.related}`
      );
    }
  }

  return {
    warnings,
    errors,
    valid: !Boolean(errors.length),
  };
}

/**
 * Validate a yaml rule to be a valid Omega rule
 * @param rule - The yaml rule to validate as Rule
 * @returns The validation result
 */
export function validateYamlRule(rule: string): RuleValidationResult {
  const parsedRule = parse(rule);
  return validateRule(parsedRule);
}
