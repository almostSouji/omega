import "reflect-metadata";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadRulesInto } from "../rules.js";
import type { Rule } from "../types/omega.js";
import { RuleValidationErrorType, validateRule } from "../utils/validator.js";
import assert from "node:assert";

const validRules = new Map<string, Rule>();
await loadRulesInto(
  fileURLToPath(new URL("../../testassets/rules", import.meta.url)),
  validRules
);

const invalidRules = new Map<string, Rule>();
await loadRulesInto(
  fileURLToPath(new URL("../../testassets/invalidrules", import.meta.url)),
  invalidRules
);

const warningRules = new Map<string, Rule>();
await loadRulesInto(
  fileURLToPath(new URL("../../testassets/warningrules", import.meta.url)),
  warningRules
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

describe("rule validation warnings", () => {
  it("should validate warnings as valid rules", () => {
    assert(
      [...warningRules.values()]
        .map((rule) => validateRule(rule))
        .every((result) => result.valid && (result.warnings?.length ?? false))
    );
  });

  it("should warn about non-standard level field", () => {
    const rule = warningRules.get("warning_level");
    assert(rule);
    const result = validateRule(rule);
    assert(result.warnings?.length === 1);
    assert(
      result.warnings.some((warning) =>
        warning.startsWith("Non-standard rule level")
      )
    );
  });

  it("should warn about non-standard status field", () => {
    const rule = warningRules.get("warning_status");
    assert(rule);
    const result = validateRule(rule);
    assert(result.warnings?.length === 1);
    assert(
      result.warnings.some((warning) =>
        warning.startsWith("Non-standard rule status")
      )
    );
  });

  it("should identify non-standard relations", () => {
    const rule1 = warningRules.get("warning_relations_1");
    assert(rule1);
    const result1 = validateRule(rule1);
    assert(result1.warnings?.length === 1);
    assert(
      result1.warnings.some((warning) =>
        warning.startsWith("Non-standard related value")
      )
    );

    const rule2 = warningRules.get("warning_relations_2");
    assert(rule2);
    const result2 = validateRule(rule2);
    assert(result2.warnings?.length === 1);
    assert(
      result2.warnings.some((warning) =>
        warning.startsWith("Non-standard relation shape")
      )
    );

    const rule3 = warningRules.get("warning_relations_3");
    assert(rule3);
    const result3 = validateRule(rule3);
    assert(result3.warnings?.length === 1);
    assert(
      result3.warnings.some((warning) =>
        warning.startsWith("Non-unique relation id")
      )
    );

    const rule4 = warningRules.get("warning_relations_4");
    assert(rule4);
    const result4 = validateRule(rule4);
    assert(result4.warnings?.length === 1);
    assert(
      result4.warnings.some(
        (warning) =>
          warning.startsWith("Non-standard relation type") &&
          warning.endsWith("received non-existing")
      )
    );
  });

  it("should warn about unused detection attributes", () => {
    const rule = warningRules.get("warning_unused");
    assert(rule);
    const result = validateRule(rule);
    assert(result.warnings?.length === 1);
    assert(
      result.warnings.some((warning) =>
        warning.startsWith("Found unused property p2")
      )
    );
  });
});
