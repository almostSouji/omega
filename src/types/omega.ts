import type { relationTypes, ruleLevels, ruleStati } from "../index.js";

export type OmegaMap = {
	[key: string]: number[] | string[] | boolean | number | string;
};

export type OmegaList = OmegaMap[] | string[];

export type DetectionRecord = {
	condition: string;
} & { [key: string]: OmegaList | OmegaMap };

export type Relationtype = (typeof relationTypes)[number];
export type RuleLevel = (typeof ruleLevels)[number];
export type RuleStatus = (typeof ruleStati)[number];

export type Relation = {
	id: string;
	type: Relationtype;
};

export type Rule = {
	author?: string;
	date?: string;
	description?: string;
	detection: DetectionRecord;
	falsepositives?: string[];
	fields?: string[];
	id?: string;
	level?: RuleLevel;
	modified?: string;
	references?: string[];
	related?: Relation[];
	status?: RuleStatus;
	tags?: string[];
	title: string;
};

export type RuleCache = Map<string, Rule>;

export type OmegaResult = {
	matches: boolean;
	rule: Rule;
};
