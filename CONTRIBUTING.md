# Contributing

## Getting Started

```bash
# Clone the repo
git clone https://github.com/rishat5081/upwork-bidding.git
cd upwork-bidding

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run in development mode
pnpm dev
```

## Project Structure

```
packages/
├── shared/      # Types, scoring engine, proposal generator
├── extension/   # Chrome Extension (Manifest V3)
└── dashboard/   # Next.js local dashboard
```

## Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Run checks: `pnpm precommit`
4. Submit a pull request

## Available Scripts

| Command             | Description                |
| ------------------- | -------------------------- |
| `pnpm dev`          | Start dashboard dev server |
| `pnpm build`        | Build all packages         |
| `pnpm test`         | Run unit tests             |
| `pnpm lint`         | Run ESLint                 |
| `pnpm lint:fix`     | Auto-fix lint issues       |
| `pnpm format`       | Format with Prettier       |
| `pnpm format:check` | Check formatting           |
| `pnpm typecheck`    | TypeScript type checking   |
| `pnpm clean`        | Remove all build artifacts |

## Compliance Rules

When contributing, you **MUST NOT** introduce:

- Auto-refresh or background polling of Upwork pages
- Scraping bots, crawlers, or unattended monitoring
- Auto-apply or proposal auto-submission
- Cookie/session/credential capture
- Click simulation or form automation
- Background tab data collection

All actions must be **user-initiated only**.

## Code Style

- TypeScript everywhere
- ESLint + Prettier enforced
- Flat ESLint config (`eslint.config.mjs`)
- 2-space indentation, single quotes, trailing commas
