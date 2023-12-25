import assert from "node:assert";
import { describe, it } from "node:test";
import { matchNumber } from "../handlers/number.js";

await describe("number operations", async () => {
  await it("should handle and default to equality checks", () => {
    const key = "key";
    assert(!matchNumber(key, 5, 4));
    assert(matchNumber(key, 5, 5));
    assert(!matchNumber(key, 5, 6));
  });

  await it("should handle greater than modifiers", () => {
    assert(!matchNumber("key|gt", 5, 4));
    assert(!matchNumber("key|gt", 5, 5));
    assert(matchNumber("key|gt", 5, 6));

    assert(!matchNumber("key|>", 5, 4));
    assert(!matchNumber("key|>", 5, 5));
    assert(matchNumber("key|>", 5, 6));

    assert(!matchNumber("key|gte", 5, 4));
    assert(matchNumber("key|gte", 5, 5));
    assert(matchNumber("key|gte", 5, 6));

    assert(!matchNumber("key|>=", 5, 4));
    assert(matchNumber("key|>=", 5, 5));
    assert(matchNumber("key|>=", 5, 6));
  });

  await it("should handle lesser than modifiers", () => {
    assert(matchNumber("key|lt", 5, 4));
    assert(!matchNumber("key|lt", 5, 5));
    assert(!matchNumber("key|lt", 5, 6));

    assert(matchNumber("key|<", 5, 4));
    assert(!matchNumber("key|<", 5, 5));
    assert(!matchNumber("key|<", 5, 6));

    assert(matchNumber("key|lte", 5, 4));
    assert(matchNumber("key|lte", 5, 5));
    assert(!matchNumber("key|lte", 5, 6));

    assert(matchNumber("key|<=", 5, 4));
    assert(matchNumber("key|<=", 5, 5));
    assert(!matchNumber("key|<=", 5, 6));
  });
});
