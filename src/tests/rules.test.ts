/* eslint-disable id-length */
import assert from "node:assert";
import { fileURLToPath, URL } from "node:url";
import { describe, it } from "node:test";
import { evaluateOmega } from "../omega.js";
import { loadRulesInto } from "../rules.js";
import type { Rule } from "../types/omega.js";

const testCache = new Map<string, Rule>();
await loadRulesInto(
  fileURLToPath(new URL("../../testassets/rules", import.meta.url)),
  testCache,
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

await describe("rule loading", async () => {
  await it("should have rules loaded", () => {
    assert(testCache.size === testrules.length);
  });

  await it("should load tests", () => {
    assert(testrules.map((key) => testCache.get(key)).every(Boolean));
  });

  await it("should have a title and detection logic", () => {
    assert(
      testrules
        .map((key) => {
          const rule = testCache.get(key);
          return rule?.title && rule?.detection;
        })
        .every(Boolean),
    );
  });
});

await describe("rule handling", async () => {
  await it("should handle anywhere string rules", () => {
    const rule = testCache.get("or_anywhere")!;

    assert(evaluateOmega({ a: "foo" }, rule).matches);
    assert(evaluateOmega({ a: "bar" }, rule).matches);
    assert(evaluateOmega({ a: "bar", b: "foo" }, rule).matches);
    assert(evaluateOmega({ bar: 1 }, rule).matches);
    assert(evaluateOmega({ a: [{ b: "bar" }] }, rule).matches);
    assert(!evaluateOmega({}, rule).matches);
  });

  await it("should handle anywhere number rules", () => {
    const rule = testCache.get("or_anywhere_number")!;

    assert(evaluateOmega({ a: "fo1o" }, rule).matches);
    assert(evaluateOmega({ a: "bar2" }, rule).matches);
    assert(evaluateOmega({ a: "b1ar", b: "2foo" }, rule).matches);
    assert(evaluateOmega({ bar: 1 }, rule).matches);
    assert(evaluateOmega({ a: [{ 2: "bar" }] }, rule).matches);
    assert(!evaluateOmega({}, rule).matches);
  });

  await it("should evaluate string lists as any of anywhere", () => {
    const rule = testCache.get("string_list")!;

    assert(evaluateOmega({ a: "foo" }, rule).matches);
    assert(evaluateOmega({ bar: "baz" }, rule).matches);
    assert(!evaluateOmega({}, rule).matches);
  });

  await it("should evaluate map lists as any of", () => {
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

  await it("should evaluate maps as all", () => {
    const rule = testCache.get("maps")!;
    assert(!evaluateOmega({}, rule).matches);
    assert(!evaluateOmega({ a: "foobar" }, rule).matches);
    assert(!evaluateOmega({ a: "foobar", c: "barfoo" }, rule).matches);
    assert(evaluateOmega({ a: "foobar", c: "barfoo", b: "baz" }, rule).matches);
    assert(evaluateOmega({ a: "foobar", c: "barfoo", b: "fob" }, rule).matches);
    assert(
      !evaluateOmega({ a: "foobar", c: "barfoo", b: "bof" }, rule).matches,
    );
    assert(evaluateOmega({ d: "dodo" }, rule).matches);
    assert(evaluateOmega({ d: "odto" }, rule).matches);
    assert(!evaluateOmega({ d: "foo" }, rule).matches);
    assert(!evaluateOmega({ d: "fdoo" }, rule).matches);
  });

  await it("should handle nested boolean conditions", () => {
    const rule = testCache.get("conditions")!;
    assert(!evaluateOmega({}, rule).matches);
    assert(evaluateOmega({ a: 1, c: 1 }, rule).matches);
    assert(evaluateOmega({ a: 1, d: 1 }, rule).matches);
    assert(!evaluateOmega({ a: 1, d: 1, e: 1 }, rule).matches);
    assert(evaluateOmega({ a: 1, d: 1, e: 2 }, rule).matches);
    assert(!evaluateOmega({ a: 1, b: 1, e: 2 }, rule).matches);
  });

  await it("should handle boolean attributes", () => {
    const rule = testCache.get("boolean")!;
    assert(!evaluateOmega({}, rule).matches);
    assert(!evaluateOmega({ a: false }, rule).matches);
    assert(evaluateOmega({ a: true }, rule).matches);
    assert(!evaluateOmega({ a: "1" }, rule).matches);
    assert(!evaluateOmega({ a: 1 }, rule).matches);
  });

  await it("should handle nested property keys", () => {
    const rule = testCache.get("nested_key")!;
    assert(!evaluateOmega({}, rule).matches);
    assert(
      evaluateOmega({ a: { b: { c: { d: { e: "foobar" } } } } }, rule).matches,
    );
  });
});
