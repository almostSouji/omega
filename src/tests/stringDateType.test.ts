import test from "node:test";
import assert from "node:assert";
import { matchString } from "../handlers/string.js";

test("date conversion", async (ctx) => {
  await ctx.test("equality", () => {
    const key = "test|date";
    assert.strictEqual(
      matchString(
        key,
        "2023-11-17T12:04:34.416000+00:00",
        "2023-11-17T12:04:34.416000+00:00"
      ),
      true
    );
    assert.strictEqual(
      matchString(
        key,
        "2023-11-17T12:04:34.416000+00:00",
        "2023-11-17T12:04:34.415000+00:00"
      ),
      false
    );
  });

  await ctx.test("on the same day", () => {
    const key = "test|date|sameday";
    assert.strictEqual(
      matchString(key, "2023/11/17", "2023-11-17T12:04:34.416000+00:00"),
      true
    );
    assert.strictEqual(
      matchString(
        key,
        "2023-11-17T00:00:01.000000+00:00",
        "2023-11-17T12:04:34.416000+00:00"
      ),
      true
    );
    assert.strictEqual(
      matchString(
        key,
        "2023-11-17T23:00:01.000000+00:00",
        "2023-11-17T23:00:01.00000+01:00"
      ),
      false
    );
  });

  await ctx.test("before date", () => {
    const key = "test|date|before";
    assert.strictEqual(
      matchString(key, "2023/11/18", "2023-11-17T12:04:34.416000+00:00"),
      true
    );
    assert.strictEqual(
      matchString(
        key,
        "2023-11-17T12:04:34.417000+00:00",
        "2023-11-17T12:04:34.416000+00:00"
      ),
      true
    );
    assert.strictEqual(
      matchString(
        key,
        "2023-11-17T12:04:34.417000+01:00",
        "2023-11-17T12:04:34.416000+00:00"
      ),
      false
    );
  });

  await ctx.test("after date", () => {
    const key = "test|date|after";
    assert.strictEqual(
      matchString(key, "2023/11/16", "2023-11-17T12:04:34.416000+00:00"),
      true
    );
    assert.strictEqual(
      matchString(
        key,
        "2023-11-17T12:04:34.415000+00:00",
        "2023-11-17T12:04:34.416000+00:00"
      ),
      true
    );
    assert.strictEqual(
      matchString(
        key,
        "2023-11-17T12:04:34.415000+00:00",
        "2023-11-17T12:04:34.416000+01:00"
      ),
      false
    );
  });
});
