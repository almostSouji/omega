import "reflect-metadata";
import { describe, it } from "node:test";
import assert from "node:assert";
import type { DiscordSigmaRule } from "../types/discordsigma.js";
import { fileURLToPath } from "node:url";
import { loadRulesInto } from "../caches/rules.js";
import { handleSigmaRule } from "../sigma.js";

const testCache = new Map<string, DiscordSigmaRule>();
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

    assert(handleSigmaRule({ a: "foo" }, rule)?.matches);
    assert(handleSigmaRule({ a: "bar" }, rule)?.matches);
    assert(handleSigmaRule({ a: "bar", b: "foo" }, rule)?.matches);
    assert(handleSigmaRule({ bar: 1 }, rule)?.matches);
    assert(handleSigmaRule({ a: [{ b: "bar" }] }, rule)?.matches);
    assert(!handleSigmaRule({}, rule)?.matches);
  });

  it("should handle anywhere number rules", () => {
    const rule = testCache.get("or_anywhere_number")!;

    assert(handleSigmaRule({ a: "fo1o" }, rule)?.matches);
    assert(handleSigmaRule({ a: "bar2" }, rule)?.matches);
    assert(handleSigmaRule({ a: "b1ar", b: "2foo" }, rule)?.matches);
    assert(handleSigmaRule({ bar: 1 }, rule)?.matches);
    assert(handleSigmaRule({ a: [{ 2: "bar" }] }, rule)?.matches);
    assert(!handleSigmaRule({}, rule)?.matches);
  });

  it("should evaluate string lists as any of anywhere", () => {
    const rule = testCache.get("string_list")!;

    assert(handleSigmaRule({ a: "foo" }, rule)?.matches);
    assert(handleSigmaRule({ bar: "baz" }, rule)?.matches);
    assert(!handleSigmaRule({}, rule)?.matches);
  });

  it("should evaluate map lists as any of", () => {
    const rule = testCache.get("map_list")!;

    assert(!handleSigmaRule({ a: "foo" }, rule)?.matches);
    assert(!handleSigmaRule({ bar: "baz" }, rule)?.matches);
    assert(!handleSigmaRule({}, rule)?.matches);
    assert(handleSigmaRule({ a: "bar", b: "foo" }, rule)?.matches);
    assert(handleSigmaRule({ a: "foo", b: "baz" }, rule)?.matches);
    assert(handleSigmaRule({ a: "foobar", b: "baz" }, rule)?.matches);
    assert(!handleSigmaRule({ c: "bar" }, rule)?.matches);
    assert(!handleSigmaRule({ a: "barfoobaz" }, rule)?.matches);
    assert(handleSigmaRule({ c: "barfoobaz" }, rule)?.matches);
  });

  it("should evaluate maps as all", () => {
    const rule = testCache.get("maps")!;
    assert(!handleSigmaRule({}, rule)?.matches);
    assert(!handleSigmaRule({ a: "foobar" }, rule)?.matches);
    assert(!handleSigmaRule({ a: "foobar", c: "barfoo" }, rule)?.matches);
    assert(
      handleSigmaRule({ a: "foobar", c: "barfoo", b: "baz" }, rule)?.matches
    );
    assert(
      handleSigmaRule({ a: "foobar", c: "barfoo", b: "fob" }, rule)?.matches
    );
    assert(
      !handleSigmaRule({ a: "foobar", c: "barfoo", b: "bof" }, rule)?.matches
    );
    assert(handleSigmaRule({ d: "dodo" }, rule)?.matches);
    assert(handleSigmaRule({ d: "odto" }, rule)?.matches);
    assert(!handleSigmaRule({ d: "foo" }, rule)?.matches);
    assert(!handleSigmaRule({ d: "fdoo" }, rule)?.matches);
  });

  it("should handle nested boolean conditions", () => {
    const rule = testCache.get("conditions")!;
    assert(!handleSigmaRule({}, rule)?.matches);
    assert(handleSigmaRule({ a: 1, c: 1 }, rule)?.matches);
    assert(handleSigmaRule({ a: 1, d: 1 }, rule)?.matches);
    assert(!handleSigmaRule({ a: 1, d: 1, e: 1 }, rule)?.matches);
    assert(handleSigmaRule({ a: 1, d: 1, e: 2 }, rule)?.matches);
    assert(!handleSigmaRule({ a: 1, b: 1, e: 2 }, rule)?.matches);
  });
});
