import "reflect-metadata";
import { describe, it } from "node:test";
import assert from "node:assert";
import type { Rule } from "../types/omega.js";
import { fileURLToPath } from "node:url";
import { loadRulesInto } from "../caches/rules.js";
import { evaluateOmega } from "../omega.js";

const testCache = new Map<string, Rule>();
await loadRulesInto(
  fileURLToPath(new URL("../../testassets/rules", import.meta.url)),
  testCache,
  true
);

const testrules = [
  "or_anywhere",
  "or_anywhere_number",
  "string_list",
  "map_list",
  "maps",
  "conditions",
  "boolean",
  "nested_key",
];

describe("rule loading", () => {
  it("should have rules loaded", () => {
    assert(testCache.size === testrules.length);
  });

  it("should load tests", () => {
    assert(testrules.map((key) => testCache.get(key)).every(Boolean));
  });

  it("should have a title and detection logic", () => {
    assert(
      testrules
        .map((key) => {
          const rule = testCache.get(key);
          return rule?.title && rule?.detection;
        })
        .every(Boolean)
    );
  });
});

describe("rule handling", () => {
  it("should handle anywhere string rules", () => {
    const rule = testCache.get("or_anywhere")!;

    assert(evaluateOmega({ a: "foo" }, rule).matches);
    assert(evaluateOmega({ a: "bar" }, rule).matches);
    assert(evaluateOmega({ a: "bar", b: "foo" }, rule).matches);
    assert(evaluateOmega({ bar: 1 }, rule).matches);
    assert(evaluateOmega({ a: [{ b: "bar" }] }, rule).matches);
    assert(!evaluateOmega({}, rule).matches);
  });

  it("should handle anywhere number rules", () => {
    const rule = testCache.get("or_anywhere_number")!;

    assert(evaluateOmega({ a: "fo1o" }, rule).matches);
    assert(evaluateOmega({ a: "bar2" }, rule).matches);
    assert(evaluateOmega({ a: "b1ar", b: "2foo" }, rule).matches);
    assert(evaluateOmega({ bar: 1 }, rule).matches);
    assert(evaluateOmega({ a: [{ 2: "bar" }] }, rule).matches);
    assert(!evaluateOmega({}, rule).matches);
  });

  it("should evaluate string lists as any of anywhere", () => {
    const rule = testCache.get("string_list")!;

    assert(evaluateOmega({ a: "foo" }, rule).matches);
    assert(evaluateOmega({ bar: "baz" }, rule).matches);
    assert(!evaluateOmega({}, rule).matches);
  });

  it("should evaluate map lists as any of", () => {
    const rule = testCache.get("map_list")!;

    assert(!evaluateOmega({ a: "foo" }, rule).matches);
    assert(!evaluateOmega({ bar: "baz" }, rule).matches);
    assert(!evaluateOmega({}, rule).matches);
    assert(evaluateOmega({ a: "bar", b: "foo" }, rule).matches);
    assert(evaluateOmega({ a: "foo", b: "baz" }, rule).matches);
    assert(evaluateOmega({ a: "foobar", b: "baz" }, rule).matches);
    assert(!evaluateOmega({ c: "bar" }, rule).matches);
    assert(!evaluateOmega({ a: "barfoobaz" }, rule).matches);
    assert(evaluateOmega({ c: "barfoobaz" }, rule).matches);
  });

  it("should evaluate maps as all", () => {
    const rule = testCache.get("maps")!;
    assert(!evaluateOmega({}, rule).matches);
    assert(!evaluateOmega({ a: "foobar" }, rule).matches);
    assert(!evaluateOmega({ a: "foobar", c: "barfoo" }, rule).matches);
    assert(evaluateOmega({ a: "foobar", c: "barfoo", b: "baz" }, rule).matches);
    assert(evaluateOmega({ a: "foobar", c: "barfoo", b: "fob" }, rule).matches);
    assert(
      !evaluateOmega({ a: "foobar", c: "barfoo", b: "bof" }, rule).matches
    );
    assert(evaluateOmega({ d: "dodo" }, rule).matches);
    assert(evaluateOmega({ d: "odto" }, rule).matches);
    assert(!evaluateOmega({ d: "foo" }, rule).matches);
    assert(!evaluateOmega({ d: "fdoo" }, rule).matches);
  });

  it("should handle nested boolean conditions", () => {
    const rule = testCache.get("conditions")!;
    assert(!evaluateOmega({}, rule).matches);
    assert(evaluateOmega({ a: 1, c: 1 }, rule).matches);
    assert(evaluateOmega({ a: 1, d: 1 }, rule).matches);
    assert(!evaluateOmega({ a: 1, d: 1, e: 1 }, rule).matches);
    assert(evaluateOmega({ a: 1, d: 1, e: 2 }, rule).matches);
    assert(!evaluateOmega({ a: 1, b: 1, e: 2 }, rule).matches);
  });

  it("should handle boolean attributes", () => {
    const rule = testCache.get("boolean")!;
    assert(!evaluateOmega({}, rule).matches);
    assert(!evaluateOmega({ a: false }, rule).matches);
    assert(evaluateOmega({ a: true }, rule).matches);
    assert(!evaluateOmega({ a: "1" }, rule).matches);
    assert(!evaluateOmega({ a: 1 }, rule).matches);
  });

  it("should handle nested property keys", () => {
    const rule = testCache.get("nested_key")!;
    assert(!evaluateOmega({}, rule).matches);
    assert(
      evaluateOmega({ a: { b: { c: { d: { e: "foobar" } } } } }, rule).matches
    );
  });
});
