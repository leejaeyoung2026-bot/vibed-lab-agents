# vibed-lab-agents

Curated weekly directory of Claude Code agents. Live at [agents.vibed-lab.com](https://agents.vibed-lab.com).

## Stack

- Next.js 15 (App Router) + TypeScript
- Static export → Cloudflare Pages
- GitHub Actions weekly crawl

## Local dev

```bash
npm install
npm run crawl      # requires GITHUB_TOKEN
npm run dev
```

## How it works

1. GitHub Actions runs `scripts/crawl.ts` every Monday (UTC 00:00 / KST 09:00)
2. Crawler queries GitHub search API for Claude Code agent repos
3. Results written to `data/agents.json`, committed automatically
4. Cloudflare Pages rebuilds on push
5. Weekly featured picks are curated manually in `data/featured.json`
