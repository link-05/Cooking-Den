# Cooking-Den

A recipe enhancement app. Users paste any recipe URL, the app strips the ads, saves it forever, and layers on cost estimation, nutrition analysis, and a dedicated cooking mode. Think Pocket, but for recipes — with extra features the original sites don't have.

The core insight: don't compete with SuperCook or AllRecipes on recipe discovery. Become the layer that every recipe site should have but doesn't.

---

## Elevator pitch

> Paste any recipe URL. We strip the ads, save it forever, and add cost, nutrition, and cooking mode.

---

## Tech stack

**Frontend (current focus)**
- Next.js (App Router) with React
- TypeScript
- Tailwind CSS for styling
- Clerk for auth
- Deployed to Vercel

**Backend (added later, not yet scaffolded)**
- FastAPI (Python, async)
- PostgreSQL
- Celery for background parsing jobs
- Deployed to Railway (FastAPI + PostgreSQL + Celery as separate services on a private network)

**Parsing strategy (three tiers, fall through in order)**
1. `recipe-scrapers` (Python) — handles most food sites that use Schema.org Recipe markup
2. BeautifulSoup — covers sites with consistent HTML but no markup
3. Claude API — last resort for messy pages or pasted raw text

**External APIs**
- Edamam — nutrition analysis (on-demand only, not at parse time)
- Grocery pricing API (TBD — Kroger, Walmart, or user-set store)

**Mobile (future)**
- React Native + Expo when web is stable
- Shared logic lives in `packages/core` once the monorepo expands

---

## Repo layout

Web-first, single repo for now. The structure is laid out so the API can be added as a sibling later without restructuring.

```
cooked-den/
  apps/
    web/                ← Next.js app (current focus)
  packages/             ← created when shared logic emerges
  CLAUDE.md             ← this file
  package.json          ← workspace root
  pnpm-workspace.yaml
```

When the FastAPI backend is added, it goes at `apps/api/`. When shared TypeScript logic emerges (API client types, validation schemas, formatters), it goes at `packages/core/`.

**Package manager:** pnpm. Use pnpm workspaces from day one so adding the API and shared packages later is friction-free.

---

## Database schema

Locked-in design. PostgreSQL.

**`users`** — managed by Clerk, but we mirror a row here keyed by `clerk_user_id` for foreign keys.

**`recipes`** — the recipe slot. One row per saved recipe.
- `id`, `user_id`, `original_url`, `raw_html` (insurance for re-parsing later), `title`, `servings`, `cook_time`, `last_fetched_at`, `nutrition_text` (nullable), `nutrition_calculated` (boolean), `cost_text` (nullable), `cost_calculated` (boolean)

**`ingredients`** — many per recipe.
- `id`, `recipe_id`, `position`, `quantity`, `unit`, `name`, `raw_text`

**`steps`** — many per recipe, ordered.
- `id`, `recipe_id`, `position`, `content`

**`step_timers`** — many per step (a single step can have multiple simultaneous timers).
- `id`, `step_id`, `label`, `duration_seconds`, `prep_buffer_seconds` (default 30)

**`collections`** — user-defined groupings.
- `id`, `user_id`, `name`

**`collection_recipes`** — join table.
- `collection_id`, `recipe_id`, `nickname` (optional per-collection nickname)

**`cook_log`** — append-only log of every cooking session. Survives recipe refreshes.
- `id`, `recipe_id`, `user_id`, `cooked_at`, `outcome_rating`, `notes`

---

## Key product decisions

**Parse once, store the data, refresh on demand.** Database is the cache. No Redis. The original URL is only re-fetched when the user clicks a "refetch from source" button.

**Refresh flow.** User triggers refresh → we re-fetch the URL → if parseable, replace structured data and clear `nutrition_calculated` / `cost_calculated` flags so they re-run on next view. If unparseable (dead URL), prompt user to paste a substitute URL. **`cook_log` and user notes survive refresh** — they belong to the recipe slot, not the version.

**Nutrition is on-demand.** Don't call Edamam at parse time. Show a "Run nutrition analysis" button. Result is stored in `nutrition_text` and `nutrition_calculated` flips to true. On refresh, both clear so the user can re-run.

**Cost is on-demand** — same pattern as nutrition.

**Cooking mode is a slideshow.** One step per screen. If a step has multiple timed actions, render multiple simultaneous on-screen timers. Each timer has a 30-second prep buffer (configurable). Timers auto-advance the slide when complete. If the screen locks, timers continue running for up to 1 minute past expiry before pausing.

**Collections + nicknames + cook log** — users organize saved recipes into collections, can give a recipe a per-collection nickname, mark it cooked, and log every cooking session with an outcome rating. Each cook is a row in `cook_log`, not a checkbox.

---

## Free vs. premium tier

**Free**
- Parse + save up to 10 recipes
- Pantry / fridge with expiration tracking
- Cooking mode (solo)

**Premium**
- Unlimited saves
- Nutrition analysis (Edamam)
- Cost analysis
- Collaborative cooking mode (multi-device sync)

---

## Conventions

**Code style**
- TypeScript strict mode on
- Function components only (no class components)
- Server components by default in Next.js; only mark `'use client'` when interactivity is needed
- Tailwind for all styling — no CSS modules, no styled-components

**File organization (apps/web)**
- App Router structure: `app/recipe/[id]/page.tsx`, `app/library/page.tsx`, `app/cook/[id]/page.tsx`, etc.
- Shared components in `app/components/`
- API client / fetchers in `lib/api/`
- Types in `lib/types/`

**State**
- React Query (TanStack Query) for server state
- `useState` / `useReducer` for local UI state
- No Redux

**Naming**
- React components: PascalCase
- Files: kebab-case
- Database columns: snake_case (Postgres convention)

**Environment variables**
- `NEXT_PUBLIC_*` prefix only for things that must reach the browser
- API base URL: `NEXT_PUBLIC_API_URL` (will point to FastAPI on Railway later; for now, mock data or local routes)

---

## Build order

The smartest sequence — each step gives you something working before adding the next layer:

1. **Scaffold** — Next.js app inside `apps/web`, Tailwind set up, Clerk auth wired, basic layout shell
2. **Mock parser route** — Next.js API route that returns hardcoded recipe JSON so the frontend has something to render against
3. **Recipe display UI** — paste-URL input on home, recipe view page with ingredients + steps
4. **Library + collections** — saved recipes list, create collection, assign recipes
5. **Cooking mode** — slideshow with multi-timer support
6. **FastAPI backend scaffolded** in `apps/api` — replace the mock route with a real call
7. **PostgreSQL + migrations** — wire the FastAPI backend to a real DB
8. **Three-tier parser** — recipe-scrapers → BeautifulSoup → Claude API fallback
9. **Edamam nutrition** — on-demand button + storage flow
10. **Cost analysis** — same pattern as nutrition
11. **Pantry / fridge with expiration tracking**
12. **Refresh + substitute URL flow**
13. **Premium tier gating**
14. **Mobile (Expo)** — once web is stable

---

## Working style

Before writing any code, always explain:
- **What** you're about to build (files, structure)
- **Why** it exists and what problem it solves
- **How** it fits into the build order and what the next step builds on top of it

Keep the explanation concise but educational — the user is learning the stack as we build. Use plain language. Cover the key concept (e.g. what a Route Handler is, why we mock before building real) so the user understands the pattern, not just the output.

Wait for the user to confirm before starting.

When the user says they are closing or ending the session, immediately update the project memory in `~/.claude/projects/-Users-linke-Documents-Cooked-Den/memory/project_scaffold.md` with: steps completed this session, current progress in the build order, what's next, and any new files or conventions introduced. No need to ask — just do it.

After the step is complete, append the explanation to `step_learning.md` at the repo root. Each entry should follow this format:

```
## Step N: Title

### Concept name
Explanation...

### Files created
- path — what it does
```

---

## Things to remember

- Recipe content is stored privately per user, not republished. Stay clearly on the personal-use side of fair use (similar to Pocket).
- The `raw_html` column on `recipes` is the insurance policy — never delete it; it lets the parser improve over time without re-fetching.
- The `cook_log` is append-only. Never modify or delete a cook log row when refreshing or substituting a recipe.
- CORS will need to be configured on the FastAPI side once the backend is live, allowing the Vercel domain.
