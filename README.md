# GatherInn

> Society event management platform for university clubs and organisations.

[![CI](https://github.com/wendyzo/GatherInn/actions/workflows/ci.yml/badge.svg)](https://github.com/wendyzo/GatherInn/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-green)

GatherInn helps society leaders plan events, build runsheets, track history, and pass institutional knowledge to future committees — so nothing gets lost between handovers.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Features

- **Dashboard** — contribution calendar, society overview, and event history across all your organisations
- **Society management** — create societies, assign roles (Executive, Project Owner, Member), and manage membership
- **Event runsheet editor** — drag-and-drop timeline builder with inline editing for title, date, location, and status
- **Blueprint cloning** — clone a past event's runsheet, tasks, vendors, and risks into a new event as a starting point
- **AI-powered matching** — when creating a new event, the app surfaces similar past events using keyword and AI matching (Gemini 2.5 Flash)
- **AI runsheet generation** — generate a full runsheet draft from just an event name
- **Authentication** — email/password login via Supabase Auth with route-level protection

---

## Tech Stack

| Layer           | Technology                                                                   |
| --------------- | ---------------------------------------------------------------------------- |
| Framework       | [TanStack Start](https://tanstack.com/start) (React 19, SSR)                 |
| Routing         | [TanStack Router](https://tanstack.com/router)                               |
| Database & Auth | [Supabase](https://supabase.com) (Postgres + Auth)                           |
| Styling         | [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Testing         | [Vitest](https://vitest.dev)                                                 |
| Deployment      | Lovable Cloud → Cloudflare Workers                                           |
| AI              | Lovable AI Gateway (Gemini 2.5 Flash)                                        |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+
- A Supabase project (or use the existing Lovable Cloud instance)

### Installation

```bash
# Clone the repository
git clone https://github.com/wendyzo/GatherInn.git
cd GatherInn

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Open `.env` and fill in your Supabase credentials (see [Environment Variables](#environment-variables)).

### Running locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Available scripts

| Command              | Description                    |
| -------------------- | ------------------------------ |
| `npm run dev`        | Start local development server |
| `npm run build`      | Production build               |
| `npm test`           | Run unit tests                 |
| `npm run test:watch` | Run tests in watch mode        |
| `npm run lint`       | Run ESLint                     |
| `npm run format`     | Format code with Prettier      |

---

## Project Structure

```
GatherInn/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
├── src/
│   ├── components/             # Shared UI components (shadcn/ui)
│   ├── integrations/
│   │   └── supabase/           # Auto-generated Supabase client & types
│   ├── lib/
│   │   ├── auth.tsx            # Auth context and provider
│   │   ├── event.utils.ts      # Pure utility functions (tested)
│   │   ├── blueprint.functions.ts  # AI runsheet generation (server fn)
│   │   ├── match.functions.ts  # AI past-event matching (server fn)
│   │   └── __tests__/          # Unit tests
│   └── routes/
│       ├── login.tsx           # Login page
│       ├── demo.tsx            # Public demo page
│       └── _authenticated/
│           ├── dashboard.tsx           # Portfolio & societies overview
│           ├── societies.$societyId.tsx  # Society detail & event list
│           └── events.$eventId.tsx      # Event runsheet editor
├── supabase/
│   └── migrations/             # Database migration files
├── .env.example                # Environment variable template
├── vite.config.ts
├── vitest.config.ts
└── wrangler.jsonc              # Cloudflare Workers config
```

---

## Environment Variables

Copy `.env.example` to `.env` and populate the values. **Never commit `.env` to version control.**

| Variable                        | Required | Description                       |
| ------------------------------- | -------- | --------------------------------- |
| `VITE_SUPABASE_URL`             | Yes      | Supabase project URL (browser)    |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes      | Supabase anon key (browser)       |
| `SUPABASE_URL`                  | Yes      | Supabase project URL (server/SSR) |
| `SUPABASE_PUBLISHABLE_KEY`      | Yes      | Supabase anon key (server/SSR)    |

---

## Testing

Unit tests live in `src/lib/__tests__/` and are run with [Vitest](https://vitest.dev).

```bash
# Run all tests once
npm test

# Run in watch mode during development
npm run test:watch
```

### Current coverage

| Module           | What's tested                                           |
| ---------------- | ------------------------------------------------------- |
| `event.utils.ts` | `keywordsOf` — keyword extraction for AI event matching |
| `event.utils.ts` | `addMinutes` — time arithmetic for runsheet scheduling  |

---

## CI/CD

Every push to `main` and every pull request triggers the GitHub Actions pipeline:

1. **Type check** — `tsc --noEmit`
2. **Lint** — ESLint + Prettier
3. **Test** — Vitest unit tests
4. **Build** — production Vite build

### Required GitHub Secrets

Go to **GitHub → Settings → Secrets and variables → Actions** and add:

| Secret                          | Value                     |
| ------------------------------- | ------------------------- |
| `VITE_SUPABASE_URL`             | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon key    |

---

## Deployment

GatherInn is deployed via [Lovable](https://lovable.dev) to Cloudflare Workers.

**Workflow:**

1. Push changes to `main` on GitHub
2. Open Lovable → your project → click **Publish**

Lovable handles the build and injects environment variables automatically when Supabase is connected via **Connectors → Lovable Cloud**.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a pull request

Please ensure `npm run lint` and `npm test` pass before submitting a PR.

---

## License

This project is licensed under the MIT License.
