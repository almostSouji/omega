import assert from "node:assert";
import { describe, it } from "vitest";
import { matchString } from "../src/handlers/string.js";

describe("date conversion", async () => {
	it("should handle equality", () => {
		const key = "test|date";

		assert(
			matchString(
				key,
				"2023-11-17T12:04:34.416000+00:00",
				"2023-11-17T12:04:34.416000+00:00",
			),
		);

		assert(
			!matchString(
				key,
				"2023-11-17T12:04:34.416000+00:00",
				"2023-11-17T12:04:34.415000+00:00",
			),
		);
	});

	it("should parse the sameday syntax", () => {
		const key = "test|date|sameday";
		assert(matchString(key, "2023/11/17", "2023-11-17T12:04:34.416000+00:00"));
		assert(
			matchString(
				key,
				"2023-11-17T00:00:01.000000+00:00",
				"2023-11-17T12:04:34.416000+00:00",
			),
		);
		assert(
			!matchString(
				key,
				"2023-11-17T23:00:01.000000+00:00",
				"2023-11-17T23:00:01.00000-04:00",
			),
		);
	});

	it("should hande date before checks", () => {
		const key = "test|date|before";
		assert(matchString(key, "2023/11/18", "2023-11-17T12:04:34.416000+00:00"));
		assert(
			matchString(
				key,
				"2023-11-17T12:04:34.417000+00:00",
				"2023-11-17T12:04:34.416000+00:00",
			),
		);
		assert(
			!matchString(
				key,
				"2023-11-17T12:04:34.417000+01:00",
				"2023-11-17T12:04:34.416000+00:00",
			),
		);
	});

	it("should handle date after checks", () => {
		const key = "test|date|after";
		assert(matchString(key, "2023/11/16", "2023-11-17T12:04:34.416000+00:00"));
		assert(
			matchString(
				key,
				"2023-11-17T12:04:34.415000+00:00",
				"2023-11-17T12:04:34.416000+00:00",
			),
		);
		assert(
			!matchString(
				key,
				"2023-11-17T12:04:34.415000+00:00",
				"2023-11-17T12:04:34.415000+01:00",
			),
		);
	});
});

describe("snowflake conversion", async () => {
	it("should handle discord as snowflake provider", () => {
		assert(
			matchString(
				"test|snowflake(discord)|after",
				"2017/08/10",
				"345341901051920395",
			),
		);
		assert(
			!matchString(
				"test|snowflake(discord)|after",
				"2017/08/11",
				"345341901051920395",
			),
		);
		assert(
			!matchString(
				"test|snowflake(discord)|before",
				"2017/08/10",
				"345341901051920395",
			),
		);
		assert(
			matchString(
				"test|snowflake(discord)|before",
				"2017/08/11",
				"345341901051920395",
			),
		);
		assert(
			matchString(
				"test|snowflake(discord)|sameday",
				"2017/08/10",
				"345341901051920395",
			),
		);
	});

	it("should default to unix epoch", () => {
		assert(matchString("test|snowflake|after", "1970/01/01", "12587008"));
		assert(!matchString("test|snowflake|after", "1970/01/02", "12587008"));
		assert(!matchString("test|snowflake|before", "1970/01/01", "12587008"));
		assert(matchString("test|snowflake|before", "1970/01/02", "12587008"));
	});
});
