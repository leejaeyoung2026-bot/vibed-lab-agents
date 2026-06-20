import type { Category } from "./types";

export const CATEGORIES: Category[] = [
  {
    slug: "code-review",
    label: "Code Review",
    keywords: ["review", "reviewer", "lint", "audit"],
  },
  {
    slug: "testing",
    label: "Testing",
    keywords: ["test", "testing", "jest", "vitest", "pytest", "tdd"],
  },
  {
    slug: "debugging",
    label: "Debugging",
    keywords: ["debug", "debugger", "troubleshoot", "bug"],
  },
  {
    slug: "refactoring",
    label: "Refactoring",
    keywords: ["refactor", "refactoring", "cleanup", "simplify"],
  },
  {
    slug: "documentation",
    label: "Documentation",
    keywords: ["docs", "documentation", "readme", "jsdoc"],
  },
  {
    slug: "devops",
    label: "DevOps & Infra",
    keywords: ["devops", "docker", "kubernetes", "terraform", "infra", "ci", "cd"],
  },
  {
    slug: "security",
    label: "Security",
    keywords: ["security", "vuln", "pentest", "secrets", "owasp"],
  },
  {
    slug: "frontend",
    label: "Frontend",
    keywords: ["react", "vue", "svelte", "frontend", "ui", "css", "tailwind"],
  },
  {
    slug: "backend",
    label: "Backend",
    keywords: ["backend", "api", "server", "database", "sql"],
  },
  {
    slug: "data",
    label: "Data & ML",
    keywords: ["data", "ml", "machine learning", "pandas", "analytics"],
  },
];

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Match a keyword on word boundaries so e.g. "ci" does not match "specification"
// and "ml" does not match "html". Whitespace in multi-word keywords (e.g.
// "machine learning") tolerates any run of whitespace between tokens.
function matchesKeyword(haystack: string, keyword: string): boolean {
  const pattern = escapeRegExp(keyword).replace(/\s+/g, "\\s+");
  return new RegExp(`(?<![a-z0-9])${pattern}(?![a-z0-9])`).test(haystack);
}

export function extractCategories(
  description: string,
  topics: string[],
  readme: string
): string[] {
  const haystack = [description, topics.join(" "), readme]
    .join(" ")
    .toLowerCase();
  const matched = new Set<string>();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((kw) => matchesKeyword(haystack, kw))) {
      matched.add(cat.slug);
    }
  }
  return Array.from(matched);
}

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
