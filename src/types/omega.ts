import { relationTypes, ruleLevels, ruleStati } from "../index.js";

export type OmegaMap = {
  [key: string]: boolean | string | number | string[] | number[];
};

export type OmegaList = string[] | OmegaMap[];

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
  title: string;
  id?: string;
  status?: RuleStatus;
  description?: string;
  references?: string[];
  author?: string;
  date?: string;
  modified?: string;
  tags?: string[];
  detection: DetectionRecord;
  falsepositives?: string[];
  level?: RuleLevel;
  related?: Relation[];
  fields?: string[];
};

export type OmegaResult = {
  rule: Rule;
  matches: boolean;
};
