# Upwork Bidder

> Manual-assist tool for analyzing Upwork job posts and generating tailored proposals.

A local-first Chrome extension + dashboard that helps freelancers evaluate job fit and draft better proposals — grounded in your real resume, case studies, and positioning.

[![CI](https://github.com/rishat5081/upwork-bidding/actions/workflows/ci.yml/badge.svg)](https://github.com/rishat5081/upwork-bidding/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Table of Contents

- [What It Does](#what-it-does)
- [What It Does NOT Do](#what-it-does-not-do)
- [Screenshots](#screenshots)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [How to Use](#how-to-use)
- [Project Structure](#project-structure)
- [Scoring System](#scoring-system)
- [Proposal Generation](#proposal-generation)
- [Available Commands](#available-commands)
- [Configuration](#configuration)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)

---

## What It Does

- **Reads** job details from an already-open Upwork job page when you **manually click** a button
- **Scores** the job (0-100) as **Strong Fit**, **Possible Fit**, or **Skip** with transparent reasoning
- **Generates** tailored proposal drafts grounded in your real resume and case studies
- **Explains** why a job is a fit or not — red flags, green flags, dimension scores
- **Provides** copy buttons for all generated content (opening lines, proposals, CTAs)
- **Stores** analyzed jobs locally for reference and review

---

## What It Does NOT Do

> **COMPLIANCE & SAFETY — READ THIS**

| Prohibited Action                              | Status    |
| ---------------------------------------------- | --------- |
| Auto-refresh or poll Upwork pages              | **NEVER** |
| Scrape, crawl, or spider Upwork                | **NEVER** |
| Run in background or on idle tabs              | **NEVER** |
| Auto-apply or submit proposals                 | **NEVER** |
| Export cookies, sessions, or credentials       | **NEVER** |
| Simulate clicks, form fills, or human behavior | **NEVER** |
| Send data to external servers                  | **NEVER** |
| Use hidden browser automation                  | **NEVER** |

**All actions are user-initiated. You remain in full control at all times.**

---

## Screenshots

> _Load the extension and dashboard to see the UI. The dashboard runs at `http://localhost:3000`._

---

## Prerequisites

| Requirement                                     | Minimum                      |
| ----------------------------------------------- | ---------------------------- |
| [Node.js](https://nodejs.org)                   | >= 18                        |
| [pnpm](https://pnpm.io)                         | >= 9 (`npm install -g pnpm`) |
| [Google Chrome](https://www.google.com/chrome/) | Latest stable                |

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/rishat5081/upwork-bidding.git
cd upwork-bidding
pnpm setup:all
```

This single command installs all dependencies and builds every package.

### 2. Start the Dashboard

```bash
pnpm dev
```

Dashboard runs at **http://localhost:3000**

### 3. Load the Chrome Extension

1. Open Chrome → navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the folder: **`packages/extension/dist/`**
5. Pin the extension icon in your toolbar for easy access

### 4. Analyze a Job

1. Open any Upwork job page manually in Chrome
2. Click the extension icon → **"Analyze Current Job"**
   — or click the **"Analyze This Job"** button injected at the bottom-right of the page
3. The job is sent to your local dashboard, scored, and a proposal draft is generated
4. Open the dashboard to review the full analysis

---

## How to Use

### Extension Popup

| Button                  | What It Does                                                     |
| ----------------------- | ---------------------------------------------------------------- |
| **Analyze Current Job** | Extract job data, score it, generate proposal, save to dashboard |
| **Send to Dashboard**   | Extract + save, then open dashboard to the job detail page       |
| **Copy Job Summary**    | Extract job data and copy a text summary to clipboard            |
| **Open Dashboard**      | Open `http://localhost:3000` in a new tab                        |

### Dashboard Pages

| Page             | Purpose                                                      |
| ---------------- | ------------------------------------------------------------ |
| **Overview**     | Stats (total jobs, fits, skips), recent jobs, quick actions  |
| **Jobs Inbox**   | All analyzed jobs with status filtering and sorting          |
| **Job Detail**   | Full analysis: score, reasons, proposal, copy buttons, notes |
| **Profile**      | Your resume data, positioning, preferred stacks              |
| **Case Studies** | Portfolio entries used for proposal matching                 |
| **Templates**    | Saved proposal templates                                     |
| **Settings**     | LLM config, data export/import                               |

### Job Detail Page

The most important page. Shows:

- **Score badge** (0-100 with color coding)
- **Fit reasons** (green flags, red flags, neutral notes)
- **8 scoring dimensions** with individual scores
- **Matching case studies** from your portfolio
- **Matching technologies** from your profile
- **Proposal tabs**: Opening Line / Short / Detailed / Experience / First Step / Questions / CTA
- **Copy buttons** on every section
- **Notes field** and **status selector** (new → reviewed → applied → skipped)

---

## Project Structure

```
upwork-bidding/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # Lint, typecheck, test, build
│   │   └── release.yml         # Tag-based release with extension zip
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── packages/
│   ├── shared/                  # Shared logic (scoring, proposals, types)
│   │   ├── src/
│   │   │   ├── types.ts         # All TypeScript interfaces
│   │   │   ├── scoring.ts       # 8-dimension scoring engine
│   │   │   ├── proposal.ts      # Rules-based proposal generator
│   │   │   ├── resume-data.ts   # Pre-parsed resume data
│   │   │   └── index.ts         # Barrel exports
│   │   └── __tests__/
│   │       ├── scoring.test.ts  # 10 scoring tests
│   │       └── proposal.test.ts # 7 proposal tests
│   ├── extension/               # Chrome Extension (Manifest V3)
│   │   ├── src/
│   │   │   ├── manifest.json    # Minimal permissions
│   │   │   ├── extractor.ts     # DOM extraction with fallback selectors
│   │   │   ├── popup/           # Extension popup UI
│   │   │   ├── content/         # Injected "Analyze" button + toast
│   │   │   └── background/      # Minimal service worker (no polling)
│   │   ├── public/icons/
│   │   └── dist/                # ← Built extension (load in Chrome)
│   └── dashboard/               # Next.js 14 Dashboard
│       ├── src/
│       │   ├── app/             # Pages + API routes (App Router)
│       │   ├── lib/             # DB, scoring, proposal, seed data
│       │   └── components/      # Sidebar, ScoreBadge, CopyButton, JobCard
│       └── data/                # Local JSON database (auto-created)
├── eslint.config.mjs            # Flat ESLint config
├── .prettierrc                  # Prettier config
├── .editorconfig                # Editor consistency
├── tsconfig.base.json           # Shared TypeScript config
├── pnpm-workspace.yaml          # Monorepo workspace
├── package.json                 # Root scripts
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## Scoring System

Jobs are scored 0-100 across **8 weighted dimensions**:

| Dimension                | Weight | What It Measures                                                |
| ------------------------ | ------ | --------------------------------------------------------------- |
| **Niche Match**          | 2x     | Backend, API, integration, webhook, automation, SaaS keywords   |
| **Stack Match**          | 2x     | Overlap with your preferred technologies                        |
| **Clarity of Scope**     | 1.5x   | Description quality, technical detail, deliverables             |
| **Client Trust**         | 1.5x   | Payment verified, past hires, total spent, hire rate            |
| **Budget**               | 1x     | Budget exists, meets your minimum, realistic for scope          |
| **Complexity Fit**       | 1x     | Matches your experience level (not too simple, not unrealistic) |
| **Competitiveness**      | 1x     | Proposal count (fewer = better)                                 |
| **Case Study Relevance** | 1.5x   | You have directly relevant portfolio work                       |

### Score Labels

| Score  | Label            | Action                                  |
| ------ | ---------------- | --------------------------------------- |
| 70-100 | **Strong Fit**   | Generate confident, targeted proposal   |
| 41-69  | **Possible Fit** | Generate cautious but credible proposal |
| 0-40   | **Skip**         | Brief note: why skip, what's missing    |

### Red Flags (reduce score)

- Vague job post with no technical details
- Unrealistic budget for described scope
- Too many unrelated skills (backend + mobile + design + blockchain)
- Likely free consulting (architecture audit with no paid work)
- 50+ proposals on a generic job
- Spammy wording ("guru", "rockstar", excessive punctuation)
- Unverified client with no hiring history
- Skills on your avoid list

### Green Flags (increase score)

- Clear backend/API problem
- Webhooks, integrations, automation
- Node.js, NestJS, Express, PostgreSQL, MongoDB, AWS
- Debugging existing systems
- CRM integrations
- Clear deliverable with reasonable budget
- Payment verified client with past hires

---

## Proposal Generation

Proposals are generated using **rules-based logic** grounded in your resume and case studies. No LLM required.

### Generated Content

| Section                  | Description                                                    |
| ------------------------ | -------------------------------------------------------------- |
| **Opening Line**         | Job-specific hook from 10+ templates                           |
| **Short Proposal**       | 5-8 sentences: hook → first step → experience → approach → CTA |
| **Detailed Proposal**    | Full proposal with markdown sections                           |
| **Relevant Experience**  | Matched bullets from work history and case studies             |
| **First Step**           | Concrete technical action based on job domain                  |
| **Clarifying Questions** | 2-3 questions about what's missing from the job post           |
| **CTA**                  | Specific, actionable call to action                            |

### Writing Rules

- Direct, practical, no fluff
- Not generic, not overhyped
- No "I am the best fit" or "I'm confident I'm the perfect match"
- Mentions similar work only when actually grounded in data
- No fabricated experience or impossible timelines
- Strong backend/integration language

### Optional LLM Enhancement

Set in `.env`:

```bash
LLM_PROVIDER=openai   # or "anthropic"
OPENAI_API_KEY=sk-...  # or ANTHROPIC_API_KEY
```

The tool works fully without any LLM.

---

## Available Commands

| Command                | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| `pnpm setup:all`       | Install + build everything (one-command setup)          |
| `pnpm dev`             | Start dashboard in dev mode (`localhost:3000`)          |
| `pnpm build`           | Production build of all packages                        |
| `pnpm build:shared`    | Build shared package only                               |
| `pnpm build:dashboard` | Build dashboard only                                    |
| `pnpm build:extension` | Build extension only                                    |
| `pnpm dev:extension`   | Watch + rebuild extension on file changes               |
| `pnpm test`            | Run unit tests (17 tests)                               |
| `pnpm test:watch`      | Run tests in watch mode                                 |
| `pnpm lint`            | Run ESLint                                              |
| `pnpm lint:fix`        | Auto-fix lint issues                                    |
| `pnpm format`          | Format all files with Prettier                          |
| `pnpm format:check`    | Check formatting without changes                        |
| `pnpm typecheck`       | TypeScript type checking across all packages            |
| `pnpm clean`           | Remove all build artifacts                              |
| `pnpm precommit`       | Run lint + format check + tests (pre-commit validation) |

---

## Configuration

### Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable            | Default | Description                      |
| ------------------- | ------- | -------------------------------- |
| `DASHBOARD_PORT`    | `3000`  | Dashboard port                   |
| `LLM_PROVIDER`      | `none`  | `none`, `openai`, or `anthropic` |
| `OPENAI_API_KEY`    | —       | OpenAI API key (if using)        |
| `ANTHROPIC_API_KEY` | —       | Anthropic API key (if using)     |

### Profile Customization

Edit your profile in the dashboard at `/profile`:

- Headline and summary
- Niche focus
- Preferred technology stacks
- Preferred job types
- Minimum budget threshold
- Avoid list (skills/categories to skip)
- Proposal tone (direct / friendly / formal)

### Data Storage

All data is stored locally in `packages/dashboard/data/db.json`. No cloud dependency.

Export/import via the Settings page or API:

- `GET /api/jobs/export` — download all jobs as JSON
- Settings page has import/export buttons

---

## Tech Stack

| Component      | Technology                    |
| -------------- | ----------------------------- |
| **Monorepo**   | pnpm workspaces               |
| **Language**   | TypeScript (strict mode)      |
| **Extension**  | Chrome Manifest V3, Vite      |
| **Dashboard**  | Next.js 14 (App Router)       |
| **UI**         | React 18, Tailwind CSS        |
| **Database**   | JSON file (local persistence) |
| **Testing**    | Vitest                        |
| **Linting**    | ESLint 10 (flat config)       |
| **Formatting** | Prettier                      |
| **CI/CD**      | GitHub Actions                |

---

## API Reference

All API routes support CORS and are available at `http://localhost:3000/api/`.

| Method   | Endpoint                 | Description                                         |
| -------- | ------------------------ | --------------------------------------------------- |
| `GET`    | `/api/jobs`              | List all jobs (optional `?status=` filter)          |
| `POST`   | `/api/jobs`              | Submit new job (auto-scores and generates proposal) |
| `GET`    | `/api/jobs/:id`          | Get single job                                      |
| `PUT`    | `/api/jobs/:id`          | Update job status/notes                             |
| `DELETE` | `/api/jobs/:id`          | Delete a job                                        |
| `POST`   | `/api/jobs/:id/proposal` | Regenerate proposal for a job                       |
| `GET`    | `/api/jobs/export`       | Export all jobs as JSON                             |
| `GET`    | `/api/profile`           | Get user profile                                    |
| `PUT`    | `/api/profile`           | Update user profile                                 |
| `GET`    | `/api/case-studies`      | List case studies                                   |
| `POST`   | `/api/case-studies`      | Create case study                                   |
| `PUT`    | `/api/case-studies`      | Update case study                                   |
| `DELETE` | `/api/case-studies`      | Delete case study                                   |
| `GET`    | `/api/templates`         | List proposal templates                             |
| `POST`   | `/api/templates`         | Create template                                     |
| `DELETE` | `/api/templates`         | Delete template                                     |
| `GET`    | `/api/settings`          | Get settings                                        |
| `PUT`    | `/api/settings`          | Update settings                                     |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

---

## License

[MIT](LICENSE) — Saad Sohail
