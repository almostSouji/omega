import { describe, it } from "node:test";
import assert from "node:assert";
import { matchString } from "../handlers/string.js";

describe("date conversion", () => {
  it("should handle equality", () => {
    const key = "test|date";

    assert(
      matchString(
        key,
        "2023-11-17T12:04:34.416000+00:00",
        "2023-11-17T12:04:34.416000+00:00"
      )
    );

    assert(
      !matchString(
        key,
        "2023-11-17T12:04:34.416000+00:00",
        "2023-11-17T12:04:34.415000+00:00"
      )
    );
  });

  it("should parse the sameday syntax", () => {
    const key = "test|date|sameday";
    assert(matchString(key, "2023/11/17", "2023-11-17T12:04:34.416000+00:00"));
    assert(
      matchString(
        key,
        "2023-11-17T00:00:01.000000+00:00",
        "2023-11-17T12:04:34.416000+00:00"
      )
    );
    assert(
      !matchString(
        key,
        "2023-11-17T23:00:01.000000+00:00",
        "2023-11-17T23:00:01.00000+01:00"
      )
    );
  });

  it("should hande date before checks", () => {
    const key = "test|date|before";
    assert(matchString(key, "2023/11/18", "2023-11-17T12:04:34.416000+00:00"));
    assert(
      matchString(
        key,
        "2023-11-17T12:04:34.417000+00:00",
        "2023-11-17T12:04:34.416000+00:00"
      )
    );
    assert(
      !matchString(
        key,
        "2023-11-17T12:04:34.417000+01:00",
        "2023-11-17T12:04:34.416000+00:00"
      )
    );
  });

  it("should handle date after checks", () => {
    const key = "test|date|after";
    assert(matchString(key, "2023/11/16", "2023-11-17T12:04:34.416000+00:00"));
    assert(
      matchString(
        key,
        "2023-11-17T12:04:34.415000+00:00",
        "2023-11-17T12:04:34.416000+00:00"
      )
    );
    assert(
      !matchString(
        key,
        "2023-11-17T12:04:34.415000+00:00",
        "2023-11-17T12:04:34.416000+01:00"
      )
    );
  });
});
