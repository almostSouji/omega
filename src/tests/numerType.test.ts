import { describe, it } from "node:test";
import assert from "node:assert";
import { matchNumber } from "../handlers/number.js";

describe("number operations", () => {
  it("should handle and default to equality checks", () => {
    const key = "key";
    assert(!matchNumber(key, 5, 4));
    assert(matchNumber(key, 5, 5));
    assert(!matchNumber(key, 5, 6));
  });

  it("should handle greater than modifiers", () => {
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

  it("should handle lesser than modifiers", () => {
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
