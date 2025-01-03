import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { Octokit } from "octokit";
import readdirp from "readdirp";
import { parse } from "yaml";
import type { Rule, RuleCache } from "./types/omega.js";
import { validateRule } from "./utils/validator.js";

/**
 * Load a file from the provided path into the provided cache.
 * Note: invalid rules are skipped
 *
 * @param path - The file path to load from
 * @param cache - The rule cache to load rules into
 * @returns A reference to the rule cache
 */
export async function loadRuleInto(
  path: string,
  cache: RuleCache,
  options?: {
    ignoreInvalid?: boolean;
    throwOnInvalid?: boolean;
  },
) {
  const file = await readFile(path, "utf8");
  const rule = parse(file) as Rule;
  const validationresult = validateRule(rule);

  if (options?.throwOnInvalid && !validationresult.valid) {
    throw new Error("validationresult", {
      cause: {
        rule,
        validationresult,
      },
    });
  }

  if (options?.ignoreInvalid && !validationresult.valid) {
    return cache;
  }

  const baseName = basename(path);
  const [name] = baseName.split(".");
  const identifier = name ?? baseName;

  cache.set(identifier, rule);

  return cache;
}

/**
 * Load rules from a defined directory and all sub directories into the provided cache
 *
 * @param path - The directory path to load from
 * @param cache - The rule cache to load rules into
 * @returns A reference to the rule cache
 */
export async function loadRulesInto(
  path: string,
  cache: RuleCache,
  options?: { ignoreInvalid?: boolean; throwOnInvalid?: boolean },
) {
  const ruleDir = readdirp(path, {
    fileFilter: (file) =>
      ["yml", "yaml"].some((suffix) => file.basename.endsWith(suffix)),
  });

  for await (const dir of ruleDir) {
    await loadRuleInto(dir.fullPath, cache, options);
  }

  return cache;
}

const kit = new Octokit();
type GithubRuleEntry = {
  name: string;
  url: string;
};

async function fetchRepositoryContents(
  owner: string,
  repo: string,
  path: string,
  rules: GithubRuleEntry[],
) {
  const res = await kit.request(
    `GET /repos/${owner}/${repo}/contents/${path ?? ""}`,
    {
      headers: {
        "X-GitHub-Version": "2022/11/28",
      },
    },
  );

  if (res.status !== 200) {
    throw new Error(res as any);
  }

  for (const entry of res.data) {
    if (entry.type === "dir") {
      await fetchRepositoryContents(owner, repo, entry?.path, rules);
    } else if (entry.type === "file" && entry.name.endsWith(".yml")) {
      rules.push({ name: entry.name, url: entry.download_url });
    }
  }

  return rules;
}

/**
 * Load rules from a remote GitHub repository and all subdirectories starting from the specified path
 *
 * @param owner - The owner of the rule repository
 * @param repository - The repository name of the rule repository
 * @param path - The path in the repository to start loading from
 * @param cache - The rule cache to load rules into
 * @returns A reference to the rule cache
 */
export async function loadRuleRepositoryInto(
  owner: string,
  repository: string,
  path: string,
  cache: RuleCache,
) {
  const result = await fetchRepositoryContents(owner, repository, path, []);

  for (const entry of result) {
    const file = await kit.request(entry.url);
    const rule = parse(file.data) as Rule;
    cache.set(entry.name, rule);
  }

  return cache;
}
