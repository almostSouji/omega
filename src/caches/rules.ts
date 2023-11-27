import { container } from "tsyringe";
import { kRules } from "../utils/symbols.js";
import readdirp from "readdirp";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { readFileSync } from "node:fs";
import type { DiscordSigmaRule } from "../handlers/sigma.js";

export function createRuleCache() {
  const rules = new Map<string, DiscordSigmaRule>();
  container.register(kRules, { useValue: rules });
  return rules;
}

export function getRuleChache() {
  return container.resolve<Map<string, DiscordSigmaRule>>(kRules);
}

export async function loadRules() {
  const cache = getRuleChache();
  const ruleDir = readdirp(
    fileURLToPath(new URL("../../rules", import.meta.url)),
    {
      fileFilter: "*.yml",
    }
  );

  for await (const dir of ruleDir) {
    const file = readFileSync(dir.fullPath, "utf-8");
    const rule = parse(file);
    console.log(`(·) Adding rule ${rule.title} (${rule.id}) to rule cache.`);
    cache.set(rule.id, rule);
  }
}
