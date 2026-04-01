# AGENTS.md — Upwork Bidder

> Universal context file for AI coding agents (Claude Code, Codex, Cursor, Copilot, etc.).

## Quick Start

```bash
pnpm install
pnpm setup:all        # Install + build everything
pnpm dev              # Dashboard dev server (localhost:3000)
pnpm dev:extension    # Extension dev build (watch mode)
pnpm test             # Vitest (shared package, 16 tests)
pnpm typecheck        # tsc --noEmit across all packages
pnpm lint             # ESLint
pnpm format:check     # Prettier check
pnpm precommit        # lint + format:check + test
```

## Project Identity

| Field | Value |
|-------|-------|
| Name | Upwork Bidder |
| Type | Chrome Extension + Web Dashboard (monorepo) |
| Stack | TypeScript 5.4, Next.js 14, Chrome MV3, Vite 5 |
| Package manager | pnpm 9 workspaces |
| Test runner | Vitest 1.6 |
| Linting | ESLint 10 + typescript-eslint + Prettier 3.8 |
| Storage | JSON flat-file (`data/db.json`) |
| Node | 18 (pinned in `.nvmrc`) |

## Architecture

```
packages/
  shared/      → @upwork-bidder/shared (types, scoring, proposal, resume-data)
  dashboard/   → Next.js 14 App Router (REST API + web UI, db.json storage)
  extension/   → Chrome MV3 (DOM scraper + popup + service worker)
```

### Data Flow

```
Upwork job page
    │
    ▼
Extension (DOM scraper)
    │  Extracts: title, description, budget, skills, client info
    │
    ├─ POST /api/jobs ──► Dashboard API
    │                        │
    │                        ├─ Score job (8 dimensions, weighted)
    │                        ├─ Generate proposal (template-based, deterministic)
    │                        └─ Store in db.json
    │
    ▼
Dashboard UI ◄── GET /api/jobs ── db.json
    │
    └─ View scores, proposals, job details
```

### Build Order (Critical)

```
shared (must build first — produces dist/)
    │
    ├──► dashboard (imports @upwork-bidder/shared)
    └──► extension (does NOT import shared — self-contained)
```

## Package Details

### `packages/shared`

- Types: `Job`, `ScoreResult`, `Proposal`, `ResumeData`
- Scoring: 8-dimension weighted scoring (see CLAUDE.md)
- Proposal: Template-based generation with `pickByHash()` for determinism
- Tests: 16 Vitest tests

### `packages/dashboard`

- Next.js 14 App Router
- REST API with `force-dynamic` exports (no caching)
- CORS: `Access-Control-Allow-Origin: *` on all `/api/*` routes
- Local copies of scoring logic adapted for snake_case `JobRow` schema
- Storage: `data/db.json` flat file

### `packages/extension`

- Chrome Manifest V3
- Content script: DOM scraper for Upwork job pages
- Popup: Quick view + send to dashboard
- Service worker: Background messaging
- **Self-contained** — does NOT import from `@upwork-bidder/shared`

## Scoring System (8 Dimensions)

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Niche Match | 2.0 | Job aligns with target niche |
| Stack Match | 2.0 | Required tech matches skills |
| Clarity of Scope | 1.5 | Well-defined requirements |
| Client Trust Signals | 1.5 | Verified payment, good history |
| Case Study Relevance | 1.5 | Portfolio match potential |
| Budget Reasonableness | 1.0 | Budget vs. effort ratio |
| Complexity Fit | 1.0 | Matches preferred complexity |
| Proposal Competitiveness | 1.0 | Fewer competing proposals |

**Labels**: `>= 70` Strong Fit, `41-69` Possible Fit, `<= 40` Skip.

## Key Invariants

1. Extension never imports from `@upwork-bidder/shared`
2. Shared package must build before dashboard or extension
3. Scoring weights must be in sync: `shared/scoring.ts` ↔ `dashboard/lib/scoring.ts`
4. All API routes use `force-dynamic` and CORS headers
5. No real API keys in committed files
6. Proposals are deterministic — `pickByHash()` same job = same template
7. Dashboard port should not be exposed without auth

## Conventions

- TypeScript strict mode, ES2022 target, ESNext modules
- Dashboard path alias: `@/*` → `./src/*`
- Prettier: singleQuote, semi, trailingComma: all, printWidth: 100
- API routes: `export const dynamic = 'force-dynamic'`

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

### Agent Usage

Each agent is defined as a Markdown file at `.claude/agents/<name>/<name>.md`. They are used by the Claude-Flow orchestration system defined in `claude-flow.config.json`.

**Task routing** automatically assigns work to agents based on patterns:
- Bug fixes → `coder` (primary) + `tester` (verification)
- New features → `architect` (design) → `coder` (implement) → `tester` (test) → `reviewer` (review)
- Security/extension safety → `security-auditor`
- Performance → `performance`
- Releases → `release-manager` + `production-validator`
- CI/CD/build → `devops`
- Cross-package changes → `planner` (decomposition) → `reviewer` (consistency)
