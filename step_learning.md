# Step Learning Log

Every step in the build order gets an explanation here before any code is written.
Use this as a reference to understand what was built and why.

---

## Step 1: Scaffold

### What is scaffolding?
Scaffolding means generating the skeleton of the project — the folder structure, config files, and base code — before writing any real features. Think of it as pouring the foundation before building walls.

### `pnpm` and workspaces
We're using `pnpm` as the package manager instead of `npm` or `yarn`. It's faster and handles *workspaces* — multiple apps living in one repo (a "monorepo"). The root `pnpm-workspace.yaml` tells pnpm that anything in `apps/*` and `packages/*` is a workspace package. This means later when we add the FastAPI backend at `apps/api/`, it slots in without restructuring anything.

### Next.js App Router
Next.js has two routing systems. The old one (Pages Router) maps files in a `pages/` folder to URLs. The new one (App Router) maps files in an `app/` folder — but with more power: every component is a React Server Component by default, meaning it renders on the server and sends plain HTML to the browser. You only opt into client-side JavaScript when you actually need interactivity (like the URL input form), by adding `'use client'` at the top of the file.

### TypeScript strict mode
TypeScript adds types to JavaScript so mistakes are caught before runtime. `strict: true` in `tsconfig.json` turns on the strictest checks — it won't let you write `params.id` if `params` might be `undefined`. This catches whole categories of bugs early.

### Tailwind CSS
Instead of writing separate CSS files, Tailwind gives you utility classes you apply directly in the HTML: `className="flex flex-col gap-4 text-zinc-900"`. There's no stylesheet to maintain. We're on Tailwind v4, which uses `@import "tailwindcss"` in `globals.css` instead of the older `@tailwind` directives.

### The `@/*` import alias
Without this, imports look like `../../components/url-input`. With the alias set to point at the `apps/web/` root, it becomes `@/app/components/url-input` — readable and refactor-safe.

### The landing page split: server + client
`app/page.tsx` is a server component (no `'use client'`) — it renders to HTML on the server. But the URL input needs `useState` to track what the user is typing, which only works in the browser. So we extracted it into `app/components/url-input.tsx` and marked *just that file* `'use client'`. The page stays fast and SEO-friendly; only the interactive bit ships JavaScript.

### Clerk
Clerk handles auth so we don't have to build login/signup ourselves. It gives you hosted sign-in pages, session management, and a React context (`ClerkProvider`) that wraps the whole app. The `proxy.ts` file (Next.js 16's replacement for `middleware.ts`) intercepts every request before it hits a page — if someone tries to visit `/library` or `/cook` without being signed in, Clerk redirects them to sign in automatically.

### `.env.local.example`
Real API keys (Clerk secret key, etc.) must never be committed to git. The `.env.local` file is gitignored. The `.example` file is committed and shows exactly which variables you need to set, without the values.

### The folder stubs
`app/library/`, `app/recipe/[id]/`, `app/cook/[id]/`, `lib/api/`, `lib/types/` — these don't do anything yet. They exist so the planned structure is visible in the file tree and the team (or future you) can see where things will go.

### Files created
- `apps/web/` — entire Next.js app (scaffolded via `create-next-app`)
- `apps/web/app/layout.tsx` — root layout with ClerkProvider and metadata
- `apps/web/app/page.tsx` — landing page (server component)
- `apps/web/app/components/url-input.tsx` — URL input form (`'use client'`)
- `apps/web/proxy.ts` — Clerk auth middleware protecting `/library` and `/cook`
- `apps/web/.env.local.example` — required environment variable names
- `apps/web/app/library/page.tsx` — stub
- `apps/web/app/recipe/[id]/page.tsx` — stub
- `apps/web/app/cook/[id]/page.tsx` — stub
- `apps/web/lib/api/index.ts` — stub
- `apps/web/lib/types/index.ts` — stub

---

## Step 2: Mock Parser Route

### What is a Route Handler?
In Next.js App Router, a file at `app/api/parse/route.ts` becomes an HTTP endpoint at `/api/parse`. Instead of exporting a default page component, you export named functions matching HTTP methods — `GET`, `POST`, `PUT`, etc. Next.js wires them up automatically. No Express, no separate server needed.

### Why mock before building the real thing?
The real parser is a Python FastAPI service that doesn't exist yet (step 6). But the recipe display UI (step 3) needs data to render against right now. The mock route lets us build the full UI with realistic data and defines the exact JSON shape the frontend expects — which becomes the contract FastAPI has to match later. Swapping mock → real is a one-line change in one file.

### TypeScript types first
`lib/types/index.ts` defines `Recipe`, `Ingredient`, `Step`, and `StepTimer` — the shape of every recipe object in the app. These types are used by both the API route and the UI components in step 3. One source of truth means a type error in one place catches a mismatch everywhere.

### The `satisfies` keyword
The route returns `{ recipe } satisfies ParseResponse`. `satisfies` is a TypeScript keyword that checks the value matches the type without widening it — you get a type error if the shape is wrong, but TypeScript still infers the most specific type. It's stricter than a cast (`as ParseResponse`) and more precise than a plain annotation.

### The `original_url` stamp
The mock ignores the URL and returns hardcoded data, but it copies the submitted URL onto the response so the frontend always sees the URL it sent. When the real parser lands, this field will be populated naturally — the mock matches that behavior today.

### Files created / edited
- `lib/types/index.ts` — `Recipe`, `Ingredient`, `Step`, `StepTimer`, `ParseRequest`, `ParseResponse` types
- `app/api/parse/route.ts` — `POST` handler returning a hardcoded Spaghetti Carbonara recipe

---

## Step 3: Recipe Display UI

### Wiring the URL input
The `url-input.tsx` component now calls `POST /api/parse` on submit, shows a loading state ("Saving…") while waiting, and navigates to `/recipe/[id]` on success. If the API returns an error, it's displayed below the input. The button is disabled while parsing and when the field is empty.

### sessionStorage as a data bridge
There's no database yet, so after parsing we store the recipe JSON in `sessionStorage` under the key `recipe_${id}`. The recipe page reads it back on mount. This is explicitly temporary — when Postgres arrives, sessionStorage gets deleted and replaced with a real fetch. The pattern teaches the real flow (parse → store → navigate → display) without needing a backend.

### Server vs. client component decisions
- `url-input.tsx` — already `'use client'` (needs `useState`, `useRouter`)
- `recipe/[id]/page.tsx` — `'use client'` because it reads from `sessionStorage` (browser-only) and uses `useParams()`
- `recipe-view.tsx` — no `'use client'`, it's a pure render function that takes a `recipe` prop. Even though it's rendered inside a client-component page, it has no interactivity itself

### `useParams()` vs awaiting `params`
Server components get `params` as a `Promise<{ id: string }>` that you `await`. Client components can't `await` at the top level, so they use the `useParams()` hook from `next/navigation` instead — it reads the same dynamic segment from the URL.

### The loading / not-found states
The recipe page has three states:
1. **Loading** — `sessionStorage` hasn't been read yet (brief spinner)
2. **Not found** — key missing in `sessionStorage` (e.g. user refreshed) — shows a message with a link home
3. **Loaded** — renders `RecipeView`

### `formatDuration` and timer badges
Each step can have multiple timers (from the `step_timers` table). `formatDuration` converts raw seconds to "X min" or "X hr Y min". Timer badges appear as small orange pills below the step text — a preview of the cooking mode UI in step 5.

### Files created / edited
- `app/components/url-input.tsx` — added API call, loading state, error state, `router.push`
- `app/recipe/[id]/page.tsx` — rewritten as client component reading from sessionStorage
- `app/components/recipe-view.tsx` — new; renders title, meta row, ingredients list, numbered steps with timer badges, Start cooking + Save another buttons

---

## Step 4: Library + Collections

### localStorage as a persistence layer
`sessionStorage` (used in step 3) clears when the tab closes. The library needs to survive that. `localStorage` persists until explicitly cleared. We use it as a stand-in for the database — the swap later is contained entirely in `lib/store.ts`. Every component stays untouched.

### `lib/store.ts` — pure functions
The store is a plain module of typed read/write functions (`getRecipes`, `saveRecipe`, `createCollection`, etc.). It guards every access with `typeof window === 'undefined'` so it's safe to import in server contexts without crashing. No React, no side effects — just data access.

### `RecipeSummary` vs `Recipe`
The library list stores only the fields needed to render a card: `id`, `title`, `cook_time`, `servings`, `original_url`, `saved_at`. Storing full recipes (with all ingredients and steps) in the library list would be wasteful and would mirror a bad DB query. `RecipeSummary` is what a `SELECT id, title, ...` list query returns — the detail page fetches the full recipe separately.

### `useLibrary` — custom hook
Wraps the store with React state. The `useEffect` on mount reads from localStorage and hydrates the state. Mutation functions (`saveRecipe`, `createCollection`, etc.) call the store and then re-read to update state. Components call the hook — they never touch localStorage directly. When the backend arrives, this hook is the only file that changes.

### `useCallback` on mutations
The mutation functions are wrapped in `useCallback` so they have stable references. This prevents unnecessary re-renders when a parent passes them down as props to child components like `RecipeCard`.

### Collection membership UI
Each `RecipeCard` has a `+` button that opens a dropdown showing all collections with checkboxes. Clicking a collection toggles membership. The dropdown is closed by rendering a full-screen invisible `<div>` underneath it — clicking anywhere outside triggers `onClick` on that div, which closes the menu. This is a common lightweight alternative to a focus-trap or a library.

### Empty states
Two distinct empty states: (1) no recipes at all → prompt to save the first one, (2) recipes exist but the selected collection is empty → tell the user how to add recipes. Good UX always accounts for the zero-data case.

### Files created / edited
- `lib/types/index.ts` — added `RecipeSummary`, `Collection`, `CollectionMembership`
- `lib/store.ts` — typed localStorage read/write functions
- `lib/hooks/use-library.ts` — custom React hook wrapping the store
- `app/components/url-input.tsx` — calls `store.saveRecipe` after successful parse
- `app/components/recipe-card.tsx` — new; card with title, meta, collection badges, collection toggle dropdown
- `app/library/page.tsx` — rewritten; sidebar with collections + New collection form, recipe grid, two empty states

---

## Step 5: Cooking Mode

### Wall-clock based timers (the most important pattern)
A naïve countdown decrements a number every second: `setInterval(() => setRemaining(r => r - 1), 1000)`. This breaks the moment the browser throttles your tab, the screen locks, or the device sleeps — those events can pause `setInterval` for arbitrary durations, and your timer drifts. The fix is to time against the wall clock instead. We store a `startedAt` timestamp in a ref when the timer begins, and on every tick compute `remaining = duration - (Date.now() - startedAt) / 1000`. Now the displayed value is always the *truth* — if a tick runs late, the next one self-corrects. This is the same pattern web video players use to stay in sync with audio.

### `useState` vs `useRef` — a concrete example
The timer holds two kinds of values. `remaining` (the number you see) is **state** because it should re-render the screen. `startedAt` (the wall-clock epoch we measure against) is a **ref** because nothing on screen depends on it directly — the tick reads it, computes a new `remaining`, and only that triggers the render. Putting `startedAt` in state would cause an extra re-render every time we updated it, and it would also be subject to React's stale-closure problem inside the interval. Refs are the right tool for "values the code needs but the UI doesn't directly display."

### Phase machine for the timer
A timer here isn't just "counting down or not" — it has five distinct phases: `idle`, `prep` (the 30-second buffer), `running` (the real countdown), `done`, and `expired`. Modeling this as a single `phase` state instead of multiple booleans (`isRunning`, `isPaused`, `isDone`...) prevents impossible states (you can't be both `done` and `running`) and makes rendering trivial — one `switch` over `phase` decides what color the ring is and what button to show.

### The 30-second prep buffer
Real cooking has a small lag between "I tap start" and "I'm actually doing the action." The spec calls for a 30-second prep window before the real countdown begins. Implementation-wise, prep is just another wall-clock countdown, but `onComplete` is *not* called when prep ends — instead we transition straight into `running`. The user sees the same UI but with a different label ("Get ready · Boil pasta") and a different ring color.

### The 1-minute grace fallback
The spec says "if the screen locks, timers continue running for up to 1 minute past expiry before pausing." Because we use wall-clock timing, the timer naturally keeps "running" past zero — when the page wakes back up, the next tick computes a *negative* remaining. If that negative is within −60 seconds, we treat it as "completed normally" and auto-advance. If it's beyond −60, we enter the `expired` phase and require the user to tap "I'm back" before advancing. This means a quick screen lock doesn't ruin a cook, but a 10-minute distraction also doesn't silently advance through three steps.

### Wake Lock API
Browsers turn the screen off after an idle timeout. The Wake Lock API lets a page request "please keep the screen on while I'm visible." We request it on slideshow mount and release it on unmount. Important quirk: browsers automatically release the lock when the tab becomes hidden, so we listen for `visibilitychange` and re-request whenever we come back to visible. The API isn't on every browser yet (notably older iOS), so we feature-detect with `'wakeLock' in navigator` and silently no-op if missing. The 1-minute grace covers the case where the screen *does* turn off.

### Lifting state up + the `key` reset trick
The current step index lives in `CookingSlideshow`, not in `CookingStep` or `CookingTimer`. The slideshow passes the current step as a prop and a `goNext` callback. Because each `CookingStep` is rendered with `key={step.id}`, navigating to a new step *unmounts and remounts* the component — which means all its internal state (which timers were started, which completed) resets automatically. No `useEffect` cleanup needed. The `key` prop is React's escape hatch for "I want a fresh instance" — extremely useful when the data changes but the component type doesn't.

### Auto-advance with a manual escape hatch
A step with timers should auto-advance when the user's started timers all complete. We track two `Set`s — timers the user *started* and timers that *completed*. When `started.size > 0` and every started ID is in `completed`, we set a 1.5s `setTimeout` that calls `onAdvance`. The delay gives the user a moment to see "All timers done — advancing…" before the slide flips. There's always a manual "Done" button too — necessary because some steps have no timers (e.g. "let cool for 5 min" where you used your phone alarm), and because users sometimes want to advance early.

### Why we extended the storage layer
Step 3 stored full recipes in `sessionStorage` only at parse time. That works for `/recipe` immediately after parsing, but breaks the library → cook flow: a recipe saved last week isn't in `sessionStorage`. So `saveRecipe` in the store now also writes the full recipe to `localStorage` under `cd_recipe_${id}`, with a matching `getFullRecipe(id)` reader. The `/cook` page reads from there. When the FastAPI backend lands in step 7, both writes get replaced with one HTTP call — same call site, much simpler implementation.

### Files created / edited
- `app/components/cooking-timer.tsx` — new; one timer with prep buffer, wall-clock countdown, 1-min grace, phase machine
- `app/components/cooking-step.tsx` — new; one step's text + row of timers, auto-advance when started timers complete
- `app/components/cooking-slideshow.tsx` — new; parent shell with progress bar, prev/next, exit, finish state, wake lock
- `app/cook/[id]/page.tsx` — replaced stub; reads full recipe via `getFullRecipe`, renders slideshow
- `lib/store.ts` — added `getFullRecipe`; `saveRecipe` now also persists the full recipe to `localStorage`

---
