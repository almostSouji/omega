import { container } from "tsyringe";
import { kRules } from "../utils/symbols.js";
import readdirp from "readdirp";
import { parse } from "yaml";
import { readFileSync } from "node:fs";
import type { Rule } from "../types/jsSigma.js";

export function createRuleCache() {
  const rules = new Map<string, Rule>();
  container.register(kRules, { useValue: rules });
  return rules;
}

export function getRuleChache() {
  return container.resolve<Map<string, Rule>>(kRules);
}

export async function loadRulesInto(
  path: string,
  cache: Map<string, Rule>,
  suppressLogs = false
) {
  const ruleDir = readdirp(path, {
    fileFilter: "*.yml",
  });

  for await (const dir of ruleDir) {
    const file = readFileSync(dir.fullPath, "utf-8");
    const rule = parse(file) as Rule;
    const [name] = dir.basename.split(".");

    const identifier = name ?? dir.basename;

    if (!suppressLogs) {
      console.log(
        `(·) Adding rule ${identifier} - ${rule.title} (${rule.id}) to rule cache.`
      );
    }

    cache.set(identifier, rule);
  }
}
