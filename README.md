# Successor's Blueprint

A society management platform for university clubs and organisations. It helps society leaders plan events, build runsheets, track history, and pass institutional knowledge to future committees.

## What it does

### Dashboard
- Overview of all societies you belong to and your role in each
- Contribution calendar showing your event creation history over the past year
- Timeline of all events you have created across societies

### Societies
- Create and manage societies with member roles (Executive, Project Owner, Member)
- View all events under a society grouped by project
- Clone past events into new ones, carrying over tasks, vendors, and risks as a starting blueprint
- AI-powered suggestion of similar past events when creating a new one

### Event Runsheet
- Build and manage a drag-and-drop event runsheet (timeline of blocks)
- Each block has a title, start time, duration, and description
- AI can generate a full runsheet draft from just the event name
- Clone runsheet blocks from past similar events
- Edit event details inline (name, date, location, status)

### Authentication
- Email/password login via Supabase Auth
- Route-level protection — unauthenticated users are redirected to login

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start (React 19, SSR) |
| Routing | TanStack Router |
| Database & Auth | Supabase (Postgres + Auth) |
| Styling | Tailwind CSS + shadcn/ui |
| Deployment | Lovable Cloud → Cloudflare Workers |
| AI | Lovable AI Gateway (Gemini 2.5 Flash) |

---

## Local development

### Prerequisites
- Node.js 20+
- A Supabase project (or use the existing Lovable Cloud instance)

### Setup

```bash
npm install
```

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Fill in your Supabase credentials, then:

```bash
npm run dev
```

### Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

---

## Testing

Unit tests live in `src/lib/__tests__/`. Run them with:

```bash
npm test
```

Currently covers:
- `keywordsOf` — keyword extraction for AI event matching
- `addMinutes` — time arithmetic for runsheet block scheduling

---

## CI/CD

Every push to `main` and every pull request triggers a GitHub Actions pipeline that runs:

1. TypeScript type check
2. ESLint
3. Unit tests
4. Production build

Deployment is handled by Lovable — push to `main`, then publish from the Lovable dashboard.

### Required GitHub Secrets

Add these in **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon key |

---

## Project structure

```
src/
├── lib/
│   ├── auth.tsx              # Auth context and provider
│   ├── event.utils.ts        # Pure utility functions (tested)
│   ├── blueprint.functions.ts # AI runsheet generation (server fn)
│   ├── match.functions.ts    # AI past-event matching (server fn)
│   └── __tests__/            # Unit tests
├── routes/
│   ├── login.tsx             # Login page
│   ├── _authenticated/
│   │   ├── dashboard.tsx     # Portfolio + societies overview
│   │   ├── societies.$societyId.tsx  # Society detail + events
│   │   └── events.$eventId.tsx       # Event runsheet editor
├── integrations/supabase/    # Auto-generated Supabase client + types
└── components/               # shadcn/ui components
```

---

## Environment variables

| Variable | Used by | Description |
|----------|---------|-------------|
| `VITE_SUPABASE_URL` | Browser | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser | Supabase anon key |
| `SUPABASE_URL` | Server (SSR) | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Server (SSR) | Supabase anon key |

Never commit `.env`. Use `.env.example` as a template.
