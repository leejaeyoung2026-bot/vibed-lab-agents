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

async function searchRepos(query: string) {
  const results: any[] = [];
  try {
    const res = await octokit.search.repos({
      q: query,
      sort: "stars",
      order: "desc",
      per_page: PER_PAGE,
    });
    results.push(...res.data.items);
  } catch (err) {
    console.warn(`Search failed for "${query}":`, (err as Error).message);
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
  const seen = new Set<string>();
  const agents: Agent[] = [];
  const now = new Date().toISOString();

  for (const query of SEARCH_QUERIES) {
    console.log(`Searching: ${query}`);
    const repos = await searchRepos(query);

    for (const repo of repos) {
      const slug = `${repo.owner.login}-${repo.name}`.toLowerCase();
      if (seen.has(slug)) continue;
      seen.add(slug);

      if (repo.stargazers_count < MIN_STARS) continue;
      if (repo.fork) continue;
      const lastPush = repo.pushed_at ?? repo.updated_at;
      if (daysBetween(lastPush) > MAX_AGE_DAYS) continue;

      const readme = await fetchReadme(repo.owner.login, repo.name);
      const description = repo.description ?? "";
      const topics: string[] = repo.topics ?? [];
      const categories = extractCategories(description, topics, readme);

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
