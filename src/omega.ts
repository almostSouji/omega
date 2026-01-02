import { matchList } from "./handlers/list.js";
import { matchKeyMap } from "./handlers/map.js";
import { handleMultiPartKey } from "./handlers/multiPartKey.js";
import { matchPrimitives } from "./handlers/primitives.js";
import { phraseAnywhere } from "./handlers/string.js";
import type {
	DetectionRecord,
	OmegaList,
	OmegaMap,
	OmegaResult,
	Rule,
} from "./types/omega.js";
import { parseOmegaCondition, type Query, QueryKind } from "./utils/parser.js";

export function evaluateCondition(
	key: string,
	value: number[] | string[] | boolean | number | string,
	structure: any,
): boolean {
	if (Array.isArray(value)) {
		return matchList(value, key, structure);
	}

	if (key.includes(".")) {
		const { key: remainingKey, structure: innerStructure } = handleMultiPartKey(
			key,
			structure,
		);

		if (!innerStructure || !remainingKey) {
			return false;
		}

		return evaluateCondition(remainingKey, value, innerStructure);
	}

	return matchPrimitives(key, value, structure);
}

function evaluateDetectionExpression(
	key: string,
	detection: DetectionRecord,
	structure: any,
): boolean {
	if (key in detection) {
		const value = detection[key];

		if (!value) {
			throw new Error(`Expected detection key ${key} to be present.`);
		}

		if (Array.isArray(value)) {
			value satisfies OmegaList;

			if (!value.length) {
				return false;
			}

			return value.some((value) => {
				if (typeof value === "string") {
					return phraseAnywhere(value, structure);
				} else if (Number.isFinite(value)) {
					return phraseAnywhere(String(value), structure);
				} else {
					return matchKeyMap(value, structure);
				}
			});
		}

		value satisfies OmegaMap;
		return matchKeyMap(value, structure);
	}

	return false;
}

function curryConditionEvaluation(
	structure: any,
	detection: DetectionRecord,
	evaluations: Map<string, boolean>,
) {
	const evaluateCondition = (query: Query): boolean => {
		switch (query.t) {
			case QueryKind.Term: {
				const key = query.c;
				const hit = evaluations.get(key);
				if (hit) {
					return hit;
				}

				return evaluateDetectionExpression(key, detection, structure);
			}

			case QueryKind.Not:
				return !evaluateCondition(query.c);
			case QueryKind.And:
				return evaluateCondition(query.c[0]) && evaluateCondition(query.c[1]);
			case QueryKind.Or:
				return evaluateCondition(query.c[0]) || evaluateCondition(query.c[1]);
		}
	};

	return evaluateCondition;
}

export function extractConditionTerms(conditionString: string) {
	const condition = parseOmegaCondition(conditionString);
	if (!condition) {
		return null;
	}

	const terms: string[] = [];
	const evaluateCondition = (query: Query): any => {
		switch (query.t) {
			case QueryKind.Term: {
				terms.push(query.c);
				return;
			}

			case QueryKind.Not:
				return evaluateCondition(query.c);
			case QueryKind.And:
			case QueryKind.Or:
				return evaluateCondition(query.c[0]) || evaluateCondition(query.c[1]);
		}
	};

	evaluateCondition(condition);
	return terms;
}

/**
 * Evaluate an arbitraty object against the provided omega rule
 *
 * @param structure - The object structure to evaluate
 * @param rule - The omega rule to evaluate against
 * @returns The result of the evaluation and the rule
 */
export function evaluateOmega(structure: any, rule: Rule): OmegaResult {
	const detection = rule.detection;
	const condition = detection.condition;

	const evaluations = new Map<string, boolean>();
	const root = parseOmegaCondition(condition);

	const evaluationFunction = curryConditionEvaluation(
		structure,
		detection,
		evaluations,
	);

	return {
		matches: evaluationFunction(root),
		rule,
	};
}
