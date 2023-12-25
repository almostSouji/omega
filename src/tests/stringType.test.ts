import assert from "node:assert";
import { describe, it } from "node:test";
import { matchString } from "../handlers/string.js";

await describe("string modifiers", async () => {
  await it("should evaluate string startswith modifiers", () => {
    const key = "test|startswith";
    const value = "foo";
    assert(matchString(key, value, "foobar"));
    assert(!matchString(key, value, "barfoo"));
    assert(!matchString(key, value, "barfoobar"));
    assert(!matchString(key, value, "barbar"));
  });

  await it("should evaluate stirng endswith modifiers", () => {
    const key = "test|endswith";
    const value = "foo";
    assert(!matchString(key, value, "foobar"));
    assert(matchString(key, value, "barfoo"));
    assert(!matchString(key, value, "barfoobar"));
    assert(!matchString(key, value, "barbar"));
  });

  await it("should evaluate string contains modifiers", () => {
    const key = "test|contains";
    const value = "foo";
    assert(matchString(key, value, "foobar"));
    assert(matchString(key, value, "barfoo"));
    assert(matchString(key, value, "barfoobar"));
    assert(!matchString(key, value, "barbar"));
  });
});

await describe("wildcards", async () => {
  await it("should handle single character wildcards", () => {
    const key = "test";
    assert(!matchString(key, "fo?bar", "fobar"));
    assert(matchString(key, "fo?bar", "foobar"));
    assert(matchString(key, "fo?bar", "foubar"));
    assert(!matchString(key, "fo?bar", "fooobar"));
  });

  await it("should handle unbounded wildcards", () => {
    const key = "test";
    assert(matchString(key, "fo*bar", "fobar"));
    assert(matchString(key, "fo*bar", "foobar"));
    assert(matchString(key, "fo*bar", "foubar"));
    assert(matchString(key, "fo*bar", "fooobar"));
    assert(!matchString(key, "fo*bar", "fbar"));
  });
});

await it("should handle regular expressions", () => {
  const key = "test|re";
  assert(matchString(key, "f\\w\\d", "fo1"));
  assert(!matchString(key, "f\\w\\d", "fo11"));
  assert(matchString(key, "\\d{3}", "111"));
  assert(!matchString(key, "\\d{3}", "1111"));
  assert(matchString(key, "\\d?a", "a"));
  assert(matchString(key, "\\d?a", "3a"));
  assert(!matchString(key, "\\d?a", "3aa"));
});

await describe("combinations of modifiers and wildcards", async () => {
  await it("should handle combinations of endeswith and wildcards", () => {
    const key = "test|endswith";
    assert(matchString(key, "b?r", "foobar"));
    assert(matchString(key, "b?r", "foober"));
    assert(!matchString(key, "b?r", "foobaa"));
    assert(!matchString(key, "b?r", "foobaar"));
    assert(matchString(key, "b*r", "foobaar"));
    assert(matchString(key, "b*r", "foobaer"));
    assert(!matchString(key, "b*r", "foobaaa"));
  });

  await it("should handle combinations of startswith and wildcards", () => {
    const key = "test|startswith";
    assert(matchString(key, "f?o", "foobar"));
    assert(matchString(key, "f?o", "fuobar"));
    assert(!matchString(key, "f?o", "fobar"));
    assert(!matchString(key, "f?o", "fuubar"));
    assert(matchString(key, "f*o", "fuuobar"));
    assert(matchString(key, "f*o", "fobar"));
    assert(!matchString(key, "f*o", "fubar"));
  });

  await it("should handle combinations of contains and wildcards", () => {
    const key = "test|contains";
    assert(!matchString(key, "o?o", "foobar"));
    assert(!matchString(key, "o?o", "fobaro"));
    assert(matchString(key, "o?o", "fooobar"));
    assert(matchString(key, "o?o", "fouobar"));
    assert(matchString(key, "o*o", "fozzzobar"));
    assert(matchString(key, "o*o", "foo"));
    assert(matchString(key, "o*o", "fuobo"));
    assert(!matchString(key, "o*o", "fuobar"));
  });
});
