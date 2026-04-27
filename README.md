# Cooked-Den

Paste any recipe URL. The app strips the ads, saves it forever, and adds cost, nutrition, and a dedicated cooking mode.

See [`CLAUDE.md`](./CLAUDE.md) for the full architecture, schema, and build plan.

## Getting started

```bash
pnpm install
pnpm dev
```

## Structure

```
cooked-den/
  apps/
    web/      ← Next.js app (current focus)
    api/      ← FastAPI backend (added later)
  packages/   ← shared logic (added later)
```
