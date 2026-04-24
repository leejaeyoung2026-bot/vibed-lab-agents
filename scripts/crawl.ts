import { Octokit } from "@octokit/rest";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { extractCategories } from "../src/lib/categories";
import type { Agent } from "../src/lib/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA_PATH = resolve(ROOT, "data/agents.json");

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("GITHUB_TOKEN env var required");
  process.exit(1);
}

const octokit = new Octokit({ auth: token });

const SEARCH_QUERIES = [
  "topic:claude-code-agent",
  "topic:claude-code-subagent",
  "topic:claude-code-agents",
  "topic:claude-agent",
  "claude code subagent in:name,description",
  "claude code agents in:name,description",
];

const MIN_STARS = 5;
const MAX_AGE_DAYS = 365;
const PER_PAGE = 100;
const MAX_PAGES = 10;

type PreviousSnapshot = Record<string, number>;

function loadPreviousStars(): PreviousSnapshot {
  if (!existsSync(DATA_PATH)) return {};
  try {
    const prev = JSON.parse(readFileSync(DATA_PATH, "utf8")) as Agent[];
    const map: PreviousSnapshot = {};
    for (const a of prev) map[a.slug] = a.stars;
    return map;
  } catch {
    return {};
  }
}

/**
 * Search GitHub repos for a given query with full pagination.
 * Appends `archived:false` to exclude archived repos.
 * Throws on HTTP error so the caller can abort the write.
 */
async function searchRepos(query: string): Promise<any[]> {
  const fullQuery = `${query} archived:false`;
  const results: any[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await octokit.search.repos({
      q: fullQuery,
      sort: "stars",
      order: "desc",
      per_page: PER_PAGE,
      page,
    });
    results.push(...res.data.items);
    if (res.data.items.length < PER_PAGE) break;
  }

  return results;
}

async function fetchReadme(owner: string, repo: string): Promise<string> {
  try {
    const res = await octokit.repos.getReadme({
      owner,
      repo,
      mediaType: { format: "raw" },
    });
    return res.data as unknown as string;
  } catch {
    return "";
  }
}

function excerpt(readme: string, maxLines = 20): string {
  if (!readme) return "";
  const lines = readme.split("\n").slice(0, maxLines);
  return lines.join("\n").trim();
}

function makeInstallSnippet(owner: string, repo: string): string {
  return `git clone https://github.com/${owner}/${repo}.git ~/.claude/agents/${repo}`;
}

function daysBetween(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
}

async function main() {
  const previous = loadPreviousStars();
  // Dedup by numeric GitHub repo ID to handle renames/forks correctly.
  // The output slug remains ${owner}-${name} to avoid breaking existing URLs.
  const seenIds = new Map<string, true>();
  const agents: Agent[] = [];
  const now = new Date().toISOString();

  for (const query of SEARCH_QUERIES) {
    console.log(`Searching: ${query}`);

    // Let errors propagate — do NOT silently swallow them.
    // If any query fails, the run will abort and agents.json will not be overwritten.
    const repos = await searchRepos(query);

    for (const repo of repos) {
      const repoId = String(repo.id);
      if (seenIds.has(repoId)) continue;
      seenIds.set(repoId, true);

      if (repo.stargazers_count < MIN_STARS) continue;
      if (repo.fork) continue;
      const lastPush = repo.pushed_at ?? repo.updated_at;
      if (daysBetween(lastPush) > MAX_AGE_DAYS) continue;

      const readme = await fetchReadme(repo.owner.login, repo.name);
      const description = repo.description ?? "";
      const topics: string[] = repo.topics ?? [];
      const categories = extractCategories(description, topics, readme);

      // Use human-readable slug for output (preserves existing URLs)
      const slug = `${repo.owner.login}-${repo.name}`.toLowerCase();
      const prevStars = previous[slug] ?? repo.stargazers_count;
      const starsDelta7d = repo.stargazers_count - prevStars;

      agents.push({
        slug,
        name: repo.name,
        owner: repo.owner.login,
        repo: repo.name,
        url: repo.html_url,
        description,
        stars: repo.stargazers_count,
        starsDelta7d,
        lastCommit: lastPush,
        topics,
        categories,
        installSnippet: makeInstallSnippet(repo.owner.login, repo.name),
        readmeExcerpt: excerpt(readme),
        crawledAt: now,
      });
    }
  }

  agents.sort((a, b) => b.stars - a.stars);

  mkdirSync(dirname(DATA_PATH), { recursive: true });
  writeFileSync(DATA_PATH, JSON.stringify(agents, null, 2) + "\n");
  console.log(`Wrote ${agents.length} agents to ${DATA_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
