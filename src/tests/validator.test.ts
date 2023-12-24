import "reflect-metadata";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadRulesInto } from "../rules.js";
import type { Rule } from "../types/omega.js";
import { RuleValidationErrorType, validateRule } from "../utils/validator.js";
import assert from "node:assert";

const validRules = new Map<string, Rule>();
const invalidRules = new Map<string, Rule>();
await loadRulesInto(
  fileURLToPath(new URL("../../testassets/rules", import.meta.url)),
  validRules
);
await loadRulesInto(
  fileURLToPath(new URL("../../testassets/invalidrules", import.meta.url)),
  invalidRules
);

describe("rule validation", () => {
  it("should correctly reject invalid input", () => {
    const nullResult = validateRule(null);
    assert(!nullResult.valid);
    assert(nullResult.errors.length === 1);
    assert(
      nullResult.errors.some(
        (err) => err.type === RuleValidationErrorType.InvalidInput
      )
    );

    const numberResult = validateRule(1);
    assert(!numberResult.valid);
    assert(numberResult.errors.length === 1);
    assert(
      numberResult.errors.some(
        (err) => err.type === RuleValidationErrorType.InvalidInput
      )
    );
  });

  it("should correctly identify missing title", () => {
    const rule = invalidRules.get("missing_title");
    assert(rule);
    const result = validateRule(rule);
    assert(!result.valid);
    assert(result.errors.length === 1);
    assert(
      result.errors.some(
        (error) =>
          error.type === RuleValidationErrorType.MissingRequired &&
          error.fieldName === "title"
      )
    );
  });

  it("should correctly identify missing detection", () => {
    const rule = invalidRules.get("missing_detection");
    assert(rule);
    const result = validateRule(rule);
    assert(!result.valid);
    assert(result.errors.length === 1);
    assert(
      result.errors.some(
        (error) =>
          error.type === RuleValidationErrorType.MissingRequired &&
          error.fieldName === "detection"
      )
    );
  });

  it("should correctly identify missing detection condition", () => {
    const rule = invalidRules.get("missing_detection_condition");
    assert(rule);
    const result = validateRule(rule);
    assert(!result.valid);
    assert(result.errors.length === 1);
    assert(
      result.errors.some(
        (error) =>
          error.type === RuleValidationErrorType.MissingRequired &&
          error.fieldName === "detection.condition"
      )
    );
  });

  it("should identify invalid conditions", () => {
    const rules = [
      invalidRules.get("invalid_condition_1"),
      invalidRules.get("invalid_condition_2"),
    ];
    assert(rules.every(Boolean));
    const results = rules.map((rule) => validateRule(rule));
    assert(
      results.every(
        (result) =>
          !result.valid &&
          result.errors.some(
            (error) =>
              error.type === RuleValidationErrorType.ConditionParseFailure
          )
      )
    );
  });

  it("should correctly identify missing condition properties", () => {
    const rule = invalidRules.get("missing_detection_property");
    assert(rule);
    const result = validateRule(rule);
    assert(!result.valid);
    assert(result.errors.length === 1);
    assert(
      result.errors.some(
        (error) =>
          error.type === RuleValidationErrorType.PropertyMissing &&
          error.property === "p2"
      )
    );
  });

  it("should correctly identify valid rules", () => {
    const results = [];
    for (const rule of validRules.values()) {
      results.push(validateRule(rule));
    }
    assert(results.every((result) => result.valid));
  });
});
