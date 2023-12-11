import test from "node:test";
import { matchString } from "../handlers/sigma.js";
import assert from "node:assert";

test("match modifiers", async (ctx) => {
  await ctx.test("startswith", () => {
    const key = "test|startswith";
    const value = "foo";
    assert.strictEqual(matchString(key, value, "foobar"), true);
    assert.strictEqual(matchString(key, value, "barfoo"), false);
    assert.strictEqual(matchString(key, value, "barfoobar"), false);
    assert.strictEqual(matchString(key, value, "barbar"), false);
  });

  await ctx.test("endswith", () => {
    const key = "test|endswith";
    const value = "foo";
    assert.strictEqual(matchString(key, value, "foobar"), false);
    assert.strictEqual(matchString(key, value, "barfoo"), true);
    assert.strictEqual(matchString(key, value, "barfoobar"), false);
    assert.strictEqual(matchString(key, value, "barbar"), false);
  });

  await ctx.test("contains", () => {
    const key = "test|contains";
    const value = "foo";
    assert.strictEqual(matchString(key, value, "foobar"), true);
    assert.strictEqual(matchString(key, value, "barfoo"), true);
    assert.strictEqual(matchString(key, value, "barfoobar"), true);
    assert.strictEqual(matchString(key, value, "barbar"), false);
  });
});

test("wildcards", async (ctx) => {
  const key = "test";
  await ctx.test("single character wildcard", () => {
    assert.strictEqual(matchString(key, "fo?bar", "fobar"), false);
    assert.strictEqual(matchString(key, "fo?bar", "foobar"), true);
    assert.strictEqual(matchString(key, "fo?bar", "foubar"), true);
    assert.strictEqual(matchString(key, "fo?bar", "fooobar"), false);
  });

  await ctx.test("unbounded wildcard", () => {
    assert.strictEqual(matchString(key, "fo*bar", "fobar"), true);
    assert.strictEqual(matchString(key, "fo*bar", "foobar"), true);
    assert.strictEqual(matchString(key, "fo*bar", "foubar"), true);
    assert.strictEqual(matchString(key, "fo*bar", "fooobar"), true);
    assert.strictEqual(matchString(key, "fo*bar", "fbar"), false);
  });
});

test("regex", () => {
  const key = "test|re";
  assert.strictEqual(matchString(key, "f\\w\\d", "fo1"), true);
  assert.strictEqual(matchString(key, "f\\w\\d", "fo11"), false);
  assert.strictEqual(matchString(key, "\\d{3}", "111"), true);
  assert.strictEqual(matchString(key, "\\d{3}", "1111"), false);
  assert.strictEqual(matchString(key, "\\d?a", "a"), true);
  assert.strictEqual(matchString(key, "\\d?a", "3a"), true);
  assert.strictEqual(matchString(key, "\\d?a", "3aa"), false);
});

test("combinations", async (ctx) => {
  await ctx.test("endswith and wildcard", () => {
    const key = "test|endswith";
    assert.strictEqual(matchString(key, "b?r", "foobar"), true);
    assert.strictEqual(matchString(key, "b?r", "foober"), true);
    assert.strictEqual(matchString(key, "b?r", "foobaa"), false);
    assert.strictEqual(matchString(key, "b?r", "foobaar"), false);
    assert.strictEqual(matchString(key, "b*r", "foobaar"), true);
    assert.strictEqual(matchString(key, "b*r", "foobaer"), true);
    assert.strictEqual(matchString(key, "b*r", "foobaaa"), false);
  });

  await ctx.test("startswith and wildcard", () => {
    const key = "test|startswith";
    assert.strictEqual(matchString(key, "f?o", "foobar"), true);
    assert.strictEqual(matchString(key, "f?o", "fuobar"), true);
    assert.strictEqual(matchString(key, "f?o", "fobar"), false);
    assert.strictEqual(matchString(key, "f?o", "fuubar"), false);
    assert.strictEqual(matchString(key, "f*o", "fuuobar"), true);
    assert.strictEqual(matchString(key, "f*o", "fobar"), true);
    assert.strictEqual(matchString(key, "f*o", "fubar"), false);
  });

  await ctx.test("contains and wildcard", () => {
    const key = "test|contains";
    assert.strictEqual(matchString(key, "o?o", "foobar"), false);
    assert.strictEqual(matchString(key, "o?o", "fobaro"), false);
    assert.strictEqual(matchString(key, "o?o", "fooobar"), true);
    assert.strictEqual(matchString(key, "o?o", "fouobar"), true);
    assert.strictEqual(matchString(key, "o*o", "fozzzobar"), true);
    assert.strictEqual(matchString(key, "o*o", "foo"), true);
    assert.strictEqual(matchString(key, "o*o", "fuobo"), true);
    assert.strictEqual(matchString(key, "o*o", "fuobar"), false);
  });
});
