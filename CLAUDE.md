# CLAUDE.md — Upwork Bidder

> Read by Claude Code at the start of every conversation. These are binding instructions.

## Project Overview

Monorepo for Upwork job analysis and proposal generation. A Chrome extension scrapes Upwork job pages, sends data to a local Next.js dashboard that scores jobs and generates tailored proposals.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | pnpm 9 workspaces (`packages/*`) |
| Shared lib | TypeScript 5.4, `tsc` → `dist/` |
| Dashboard | Next.js 14 (App Router), React 18, Tailwind 3 |
| Extension | Chrome MV3, Vite 5, vanilla TypeScript |
| Storage | JSON flat-file (`data/db.json`) |
| Testing | Vitest 1.6 (shared package only) |
| Linting | ESLint 10 + typescript-eslint + Prettier 3.8 |
| Node | 18 (pinned in `.nvmrc`) |

## Build & Test Commands

```bash
pnpm setup:all        # Install + build everything
pnpm build            # Sequential: shared → dashboard → extension
pnpm dev              # Dashboard dev server
pnpm dev:extension    # Extension dev build
pnpm test             # Vitest (shared package, 16 tests)
pnpm typecheck        # tsc --noEmit across all packages
pnpm lint             # ESLint
pnpm format:check     # Prettier check
pnpm precommit        # lint + format:check + test
```

## Architecture

```
packages/
  shared/      → @upwork-bidder/shared (types, scoring, proposal, resume-data)
  dashboard/   → Next.js 14 App Router (REST API + web UI, db.json storage)
  extension/   → Chrome MV3 (DOM scraper + popup + service worker)
```

**Data flow**: Upwork page → Extension scrapes DOM → POST `localhost:3000/api/jobs` → Dashboard scores + generates proposal → `db.json` → Dashboard UI

**Build order**: shared must build first (produces `dist/`), then dashboard and extension.

## Key Decisions

1. **Extension is self-contained** — does NOT import from `@upwork-bidder/shared`
2. **Dashboard has local scoring copies** — adapted for snake_case DB schema (`JobRow`)
3. **No database** — flat JSON file at `data/db.json`, zero config
4. **No LLM** — proposals are template/rule-based (LLM support scaffolded in settings)
5. **Manual-assist only** — no auto-bidding, proposals are drafts
6. **Deterministic proposals** — `pickByHash()` same job = same template

## Scoring (8 Dimensions)

| Dimension | Weight |
|-----------|--------|
| Niche Match | 2.0 |
| Stack Match | 2.0 |
| Clarity of Scope | 1.5 |
| Client Trust Signals | 1.5 |
| Case Study Relevance | 1.5 |
| Budget Reasonableness | 1.0 |
| Complexity Fit | 1.0 |
| Proposal Competitiveness | 1.0 |

Labels: `>= 70` Strong Fit, `41-69` Possible Fit, `<= 40` Skip.

## Conventions

- TypeScript strict mode, ES2022 target, ESNext modules
- Dashboard path alias: `@/*` → `./src/*`
- Prettier: singleQuote, semi, trailingComma: all, printWidth: 100
- API routes: `export const dynamic = 'force-dynamic'` (no caching)
- CORS: `Access-Control-Allow-Origin: *` on all `/api/*` (for extension)

## Do NOT

- Import `@upwork-bidder/shared` from the extension package
- Build dashboard/extension before shared is built
- Add real API keys to committed files
- Expose dashboard port to the network without auth
- Change scoring weights without updating BOTH `shared/scoring.ts` AND `dashboard/lib/scoring.ts`

## Specialized Agents

This project includes 14 specialized AI agent definitions in `.claude/agents/`. Each agent has deep project-specific context for the monorepo.

| Agent | Path | Purpose |
|-------|------|---------|
| project-owner | `.claude/agents/project-owner/` | Audits and updates all agents when the project changes |
| coder | `.claude/agents/coder/` | Feature development across 3 packages |
| security-auditor | `.claude/agents/security-auditor/` | Extension safety, CORS, data leaks |
| performance | `.claude/agents/performance/` | Scraping speed, API times, build speed |
| standards-enforcer | `.claude/agents/standards-enforcer/` | TypeScript strict, monorepo conventions |
| reviewer | `.claude/agents/reviewer/` | Cross-package consistency, API contracts |
| tester | `.claude/agents/tester/` | Vitest, 16 tests, coverage gaps |
| architect | `.claude/agents/architect/` | Package boundaries, data flow, scaling |
| devops | `.claude/agents/devops/` | CI/CD, build order, extension artifacts |
| code-analyzer | `.claude/agents/code-analyzer/` | Scoring drift, duplication, tech debt |
| planner | `.claude/agents/planner/` | Cross-package task decomposition |
| production-validator | `.claude/agents/production-validator/` | No TODOs, extension build check |
| release-manager | `.claude/agents/release-manager/` | Semver across packages, CWS releases |
| issue-tracker | `.claude/agents/issue-tracker/` | Package labels, scraping triage |
