# Cooking Den API

FastAPI service for parsing and storing recipes.

## Setup

Requires Python 3.12+ and [uv](https://github.com/astral-sh/uv).

```bash
cd apps/api
uv sync
```

`uv sync` reads `pyproject.toml`, creates `.venv/` if it doesn't exist, and
installs locked deps from `uv.lock` (creating the lock the first time).

## Run

```bash
uv run uvicorn app.main:app --reload
```

- API: <http://localhost:8000>
- Interactive docs: <http://localhost:8000/docs> (auto-generated from Pydantic)
- Health check: <http://localhost:8000/health>

`--reload` watches the `app/` folder and restarts on save.

## Layout

```
app/
  main.py        FastAPI app, CORS config, router includes
  schemas.py     Pydantic models (mirror of apps/web/lib/types/index.ts)
  routers/
    parse.py     POST /parse endpoint
```

## Adding dependencies

```bash
uv add <package>            # runtime dep
uv add --dev <package>      # dev-only dep
```
