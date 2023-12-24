import { extractConditionTerms } from "../omega.js";
import { parseOmegaCondition } from "./parser.js";

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

export type RuleValidationresult = ValidRuleResult | InvalidRuleResult;

/**
 * Validate a value to be a valid Omega rule
 * @param rule - The structure to validate as Rule
 * @returns The validation result
 */
export function validateRule(rule: any): RuleValidationresult {
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

        // todo: warn on unused property
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

  // todo: warn on enum and optional rule descriptor misuse

  return {
    warnings,
    errors,
    valid: !Boolean(errors.length),
  };
}
