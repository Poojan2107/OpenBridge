<div align="center">

# 🌉 OpenBridge

### From Confusion to Contribution

**AI-powered open-source onboarding mentor that turns overwhelmed newcomers into confident contributors.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React 19](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Gemini 2.5 Flash](https://img.shields.io/badge/Gemini_2.5_AI-886FBF?style=flat&logo=google&logoColor=white)](https://ai.google.dev)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://prisma.io)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat&logo=pwa&logoColor=white)](#pwa-support)

<br />

_"I want to contribute to open source but I don't know where to start."_ — **Every developer, ever.**

OpenBridge solves this. It profiles your skills, matches you to real GitHub repos, generates a personalized 4-week roadmap, simulates pull request workflows, reviews your code with AI, and tracks your progression from **Lurker** to **OSS Legend**.

</div>

---

## ✨ Features

### 🎯 Core Platform

| Feature                   | Description                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| **Smart Skill Profiling** | Multi-step onboarding wizard that captures your tech stack, experience level, and interest area |
| **AI Repo Matching**      | Gemini-powered recommendations of real GitHub repos with personalized match reasons             |
| **4-Week Roadmap**        | AI-generated step-by-step contribution plan with interactive task tracking                      |
| **GitHub OAuth**          | Real GitHub login with encrypted token storage (AES-256-CBC)                                    |
| **Live GitHub Search**    | Fallback repo discovery via GitHub Search API when Gemini is unavailable                        |

### 🤖 AI-Powered Tools (3 Gemini Integrations)

| Tool                            | What It Does                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **🔍 AI Code Review**           | Paste code → get structured feedback (score, praise, issues, suggestions) like a senior maintainer     |
| **🎓 Mock Interview Generator** | 5 tailored technical questions based on your stack, with hints & interviewer evaluation criteria       |
| **🗺️ AI Issue Mapper**          | Paste a GitHub issue URL → get a plain-English explanation, affected files, and step-by-step fix guide |

### 🏆 Gamification & Progression

| Feature                         | Description                                                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **XP & Level System**           | Earn XP from roadmap tasks (+5) and PRs (+10). Rank up: Lurker → Rookie → Contributor → Core Member → OSS Legend |
| **Animated Level-Up Toast**     | Particle-burst notification when you cross a rank threshold                                                      |
| **SVG Contributor Passport**    | Live-updating badge you can embed in your GitHub README                                                          |
| **Public Profile Page**         | Shareable `/p/:username` page showcasing your journey, repos, roadmap progress, and rank                         |
| **Contribution Streak Heatmap** | GitHub-style activity calendar tracking daily engagement                                                         |

### 🛡️ Security & Infrastructure

| Feature                    | Description                                                                     |
| -------------------------- | ------------------------------------------------------------------------------- |
| **AES-256-CBC Encryption** | OAuth tokens encrypted at rest with SHA-256 derived keys                        |
| **Rate Limiting**          | 15 req/min per IP on all AI endpoints to prevent abuse                          |
| **Prisma ORM**             | SQLite (dev) / PostgreSQL (prod) with full schema for users, profiles, roadmaps |
| **SPA Routing**            | Client-side routing with Express fallback for `/p/:login` public profiles       |
| **PWA Support**            | Installable on desktop/mobile, offline-capable with service worker caching      |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React 19 + Vite SPA                   │
│  ┌──────────┬──────────┬──────────┬──────────┬────────┐ │
│  │Dashboard │Challenge │Code Rev  │Interview │Profile │ │
│  │  Hub     │   Hub    │ Sandbox  │  Prep    │ /p/:id │ │
│  └────┬─────┴────┬─────┴────┬─────┴────┬─────┴───┬────┘ │
│       │          │          │          │         │       │
│  ┌────▼──────────▼──────────▼──────────▼─────────▼────┐ │
│  │              Express API Server                     │ │
│  │  /api/recommend  /api/roadmap  /api/codereview      │ │
│  │  /api/explain    /api/interview /api/user/:login    │ │
│  │  /api/badge/:user.svg  /api/auth/*                  │ │
│  └────┬─────────────────────────────┬─────────────────┘ │
│       │                             │                    │
│  ┌────▼────────┐           ┌────────▼─────────┐         │
│  │ Gemini 2.5  │           │  Prisma + SQLite  │         │
│  │  Flash AI   │           │  (or PostgreSQL)  │         │
│  └─────────────┘           └──────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Gemini API Key** ([get one free](https://ai.google.dev/gemini-api/docs/api-key))

### Setup

```bash
# Clone the repo
git clone https://github.com/Poojan2107/OpenBridge.git
cd OpenBridge

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Initialize the database
npx prisma generate

# Start the dev server
npm run dev
```

Open **http://localhost:3000** — you're in.

### Production Build

```bash
npm run build   # Vite frontend + esbuild server → dist/
npm start       # Serves from dist/server.cjs
```

---

## 🔧 Environment Variables

| Variable               | Required | Description                                                      |
| ---------------------- | -------- | ---------------------------------------------------------------- |
| `GEMINI_API_KEY`       | Yes      | Your Gemini API key for AI features                              |
| `GITHUB_CLIENT_ID`     | Optional | GitHub OAuth app client ID                                       |
| `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth app client secret                                   |
| `ENCRYPTION_KEY`       | Optional | Custom AES-256 encryption passphrase (auto-generated if missing) |
| `APP_URL`              | Optional | Public URL for OAuth redirects (defaults to localhost)           |

> **Note:** The app works without GitHub OAuth — it falls back to a demo mode with simulated GitHub interactions.

---

## 📁 Project Structure

```
openbridge/
├── server.ts                 # Express API server (all routes, Gemini calls, OAuth)
├── index.html                # SPA entry point with PWA meta tags
├── prisma/
│   └── schema.prisma         # Database schema (User, Profile, Roadmap, Tasks)
├── public/
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker (cache-first + offline)
│   └── icons/                # SVG app icons (192 + 512)
├── src/
│   ├── main.tsx              # App entry + client-side router
│   ├── App.tsx               # Main layout, sidebar, tab navigation
│   ├── types.ts              # TypeScript interfaces
│   ├── db.ts                 # Prisma client singleton
│   ├── index.css             # Design system (glassmorphism, animations)
│   ├── lib/
│   │   └── levelSystem.ts    # XP calculation, 5 rank definitions
│   └── components/
│       ├── GithubLandingPage.tsx    # Hero landing page
│       ├── ProfilingForm.tsx        # Skill onboarding wizard
│       ├── RepoRecommender.tsx      # AI repo matches
│       ├── ContributionRoadmap.tsx   # 4-week interactive roadmap
│       ├── ChallengeHub.tsx         # PR simulator, passport, Hacktoberfest
│       ├── CodeReview.tsx           # AI code review sandbox
│       ├── MockInterview.tsx        # AI interview prep
│       ├── IssueTranslator.tsx      # AI issue decoder
│       ├── LevelBadge.tsx           # XP badge (3 variants + toast)
│       ├── PreflightConsole.tsx     # Security & DCO checks
│       ├── GitTerminalSandbox.tsx   # Interactive git terminal
│       ├── GithubFileExplorer.tsx   # Simulated repo file tree
│       ├── PublicProfile.tsx        # Shareable /p/:login page
│       └── OpportunityLayer.tsx     # Fellowship directory
```

---

## 🎨 Tech Stack

| Layer        | Technology                                         |
| ------------ | -------------------------------------------------- |
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, Lucide Icons |
| **Backend**  | Express.js, Node.js                                |
| **AI**       | Google Gemini 2.5 Flash (structured JSON output)   |
| **Database** | Prisma ORM → SQLite (dev) / PostgreSQL (prod)      |
| **Auth**     | GitHub OAuth 2.0 with AES-256-CBC token encryption |
| **Build**    | Vite (frontend), esbuild (server), tsx (dev)       |
| **PWA**      | Service Worker, Web App Manifest, offline caching  |

---

## 🧩 API Endpoints

| Method | Route                      | Description                              |
| ------ | -------------------------- | ---------------------------------------- |
| `POST` | `/api/recommend`           | AI repo recommendations based on profile |
| `POST` | `/api/roadmap`             | Generate personalized 4-week roadmap     |
| `POST` | `/api/explain`             | Translate GitHub issues to plain English |
| `POST` | `/api/codereview`          | AI-powered code review with scoring      |
| `POST` | `/api/interview`           | Generate 5 mock interview questions      |
| `GET`  | `/api/user/:login`         | Fetch public user profile data           |
| `GET`  | `/api/badge/:login.svg`    | Dynamic SVG contributor badge            |
| `POST` | `/api/roadmap/task/toggle` | Toggle roadmap task completion           |
| `GET`  | `/api/auth/url`            | Get GitHub OAuth redirect URL            |
| `GET`  | `/auth/callback`           | Handle OAuth callback                    |

---

## 📱 PWA Support

OpenBridge is a **Progressive Web App**:

- **Install it** — Click the install icon in Chrome/Edge address bar
- **Works offline** — Roadmap checklist and UI load from cache
- **App-like experience** — Standalone window, no browser chrome
- **Custom icon** — Bridge motif with blue→green gradient

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit with conventional commits (`git commit -m "feat: add amazing feature"`)
4. Push to your branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [Poojan](https://github.com/Poojan2107)**

_OpenBridge — because everyone deserves a bridge into open source._

</div>
