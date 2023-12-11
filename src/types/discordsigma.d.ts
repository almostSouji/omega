export type DSMap = {
  [key: string]: boolean | string | number | string[] | number[];
};

export type DSList = string[] | DSMap[];

export type DSDetectionRecord = {
  condition: string;
} & { [key: string]: DSList | DSMap };

export type DSRelationType =
  | "derived"
  | "obsolete"
  | "merged"
  | "renamed"
  | "similar";

export type DSLevel = "informational" | "low" | "medium" | "high" | "critical";

export type DSRuleStatus =
  | "unsupported"
  | "deprecated"
  | "experimental"
  | "test"
  | "stable";

export type DSRelation = {
  id: string;
  type: DSRelationType;
};

export type DiscordSigmaRule = {
  title: string;
  id?: string;
  status?: DSRuleStatus;
  description?: string;
  references?: string[];
  author?: string;
  date?: string;
  modified?: string;
  tags?: string[];
  detection: DSDetectionRecord;
  falsepositives?: string[];
  level?: DSLevel;
  related?: DSRelation[];
  fields?: string[];
};

export type DiscordSigmaResult = {
  rule: DiscordSigmaRule;
  matches: boolean;
};
