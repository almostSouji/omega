import assert from "node:assert";
import { describe, it } from "node:test";
import { matchDate } from "../handlers/date.js";

await describe("native date values", async () => {
  await it("should handle equality", () => {
    const key = "test|date";

    assert(
      matchDate(
        key,
        "2023-11-17T12:04:34.416000+00:00",
        new Date("2023-11-17T12:04:34.416000+00:00"),
      ),
    );

    assert(
      !matchDate(
        key,
        "2023-11-17T12:04:34.416000+00:00",
        new Date("2023-11-17T12:04:34.415000+00:00"),
      ),
    );
  });

  await it("should parse the sameday syntax", () => {
    const key = "test|date|sameday";
    assert(matchDate(key, "2023/11/17", "2023-11-17T12:04:34.416000+00:00"));
    assert(
      matchDate(
        key,
        "2023-11-17T00:00:01.000000+00:00",
        new Date("2023-11-17T12:04:34.416000+00:00"),
      ),
    );
    assert(
      !matchDate(
        key,
        "2023-11-17T23:00:01.000000+00:00",
        new Date("2023-11-17T23:00:01.00000-04:00"),
      ),
    );
  });

  await it("should hande date before checks", () => {
    const key = "test|date|before";
    assert(matchDate(key, "2023/11/18", "2023-11-17T12:04:34.416000+00:00"));
    assert(
      matchDate(
        key,
        "2023-11-17T12:04:34.417000+00:00",
        new Date("2023-11-17T12:04:34.416000+00:00"),
      ),
    );
    assert(
      !matchDate(
        key,
        "2023-11-17T12:04:34.417000+01:00",
        new Date("2023-11-17T12:04:34.416000+00:00"),
      ),
    );
  });

  await it("should handle date after checks", () => {
    const key = "test|date|after";
    assert(matchDate(key, "2023/11/16", "2023-11-17T12:04:34.416000+00:00"));
    assert(
      matchDate(
        key,
        "2023-11-17T12:04:34.415000+00:00",
        new Date("2023-11-17T12:04:34.416000+00:00"),
      ),
    );
    assert(
      !matchDate(
        key,
        "2023-11-17T12:04:34.415000+00:00",
        new Date("2023-11-17T12:04:34.415000+01:00"),
      ),
    );
  });
});
