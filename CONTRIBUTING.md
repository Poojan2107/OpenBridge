# Contributing to OpenBridge

Thank you for your interest in contributing to OpenBridge! OpenBridge is built for open-source contributors, by the open-source community.

## Prerequisites

- **Node.js** ≥ 20 (see `.nvmrc`)
- **npm** ≥ 9
- **Git**

## Quick Start

```bash
git clone https://github.com/Poojan2107/OpenBridge.git
cd OpenBridge
npm install
cp .env.example .env    # edit GEMINI_API_KEY
npx prisma migrate dev
npx prisma generate
npm run dev              # → http://localhost:3000

# Seed demo data (optional)
npm run seed
```

### Docker

```bash
docker compose up -d
```

## Development Workflow

### Commands

| Command                | Description                   |
| ---------------------- | ----------------------------- |
| `npm run dev`          | Start dev server (hot reload) |
| `npm run build`        | Production build              |
| `npm run lint`         | TypeScript type-check         |
| `npm run eslint`       | ESLint code quality           |
| `npm run format`       | Auto-format with Prettier     |
| `npm run format:check` | Check formatting              |
| `npm test`             | Run all tests                 |
| `npm run seed`         | Seed demo data                |
| `npm run clean`        | Remove build artifacts        |

### Commit Workflow

1. Make your changes
2. `git add .`
3. `git commit -s` — the `-s` flag automatically signs off (DCO). `lint-staged` runs ESLint + Prettier on staged files before the commit finishes.
4. `git push`

### Project Structure

```
openbridge/
├── src/              # React frontend
├── server/           # Express API server
├── prisma/           # Database schema + migrations + seed
├── public/           # Static assets (PWA, icons)
├── .github/          # CI, issue templates
├── server.ts         # Server entry point
├── index.html        # SPA entry
└── tsconfig.json     # TypeScript config
```

## Code Style

- **TypeScript** — strict mode. Avoid `any` where possible.
- **React** — functional components with hooks.
- **CSS** — Tailwind CSS 4 utility classes.
- **Icons** — lucide-react.
- **Formatting** — Prettier (semicolons, double quotes, trailing commas).
- **ESLint** — `npm run eslint` before pushing.

## Testing

All tests live next to their modules: `*.test.ts` / `*.test.tsx`.

```bash
npm test         # all tests
npx vitest run   # same, but without npm wrapper
```

## Contribution Rules

### DCO (Developer Certificate of Origin)

Every commit must include a `Signed-off-by` line:

```bash
git commit -s -m "feat: add amazing feature"
```

This appends:

```text
Signed-off-by: Your Name <your.email@example.com>
```

### PR Checklist

Before opening a PR:

- [ ] `npm run lint` — zero type errors
- [ ] `npm run eslint` — zero lint errors
- [ ] `npm run format:check` — matches Prettier
- [ ] `npm test` — all green
- [ ] Commits are DCO-signed (`git commit -s`)
- [ ] Branch name follows `feat/`, `fix/`, `chore/` convention

## Reporting Issues

- **Bug**: open a [Bug Report](https://github.com/Poojan2107/OpenBridge/issues/new?labels=bug,help+wanted&template=bug_report.md)
- **Feature**: open a [Feature Request](https://github.com/Poojan2107/OpenBridge/issues/new?labels=enhancement,good+first+issue&template=feature_request.md)
- **Security**: see [SECURITY.md](SECURITY.md)
