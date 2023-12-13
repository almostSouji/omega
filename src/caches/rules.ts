import { container } from "tsyringe";
import { kRules } from "../utils/symbols.js";
import readdirp from "readdirp";
import { parse } from "yaml";
import { readFileSync } from "node:fs";
import type { Rule } from "../types/omega.js";
import { fileURLToPath } from "node:url";

/**
 * Create a rule cache
 * @returns A reference to the rule cache
 */
export function createRuleCache() {
  const rules = new Map<string, Rule>();
  container.register(kRules, { useValue: rules });
  return rules;
}

/**
 * Get the registered rule cache
 * @returns A reference to the rule cache
 */
export function getRuleChache() {
  return container.resolve<Map<string, Rule>>(kRules);
}

/**
 * Fill the rule cache with the rules defined by the library
 * @returns A reference to the rule cache
 */
export async function loadDefaultRules() {
  return loadRulesInto(
    fileURLToPath(new URL("../../rules", import.meta.url)),
    getRuleChache()
  );
}

/**
 * Load rules from a defined directory and all sub directories into the provided cache
 * @param path - The directory path to load from
 * @param cache - The rule cache to load rules into
 * @param suppressLogs - Whether logs should be suppressed
 * @returns A reference to the rule cache
 */
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
  return cache;
}
