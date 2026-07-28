# Vessel API

A simple [FastAPI](https://fastapi.tiangolo.com/) backend for Vessel. It proxies
[scripture.api.bible](https://scripture.api.bible) for Bible content and persists
journal entries to SQLite via [SQLModel](https://sqlmodel.tiangolo.com/).

## Run locally

Dependencies are managed with [uv](https://docs.astral.sh/uv/).

```bash
cd server
uv sync                        # create .venv and install from uv.lock
cp .env.example .env           # optional: customize config
uv run uvicorn app.main:app --reload --port 3000
```

Interactive docs: http://localhost:3000/docs

## OpenAPI / client generation

The schema is available live at `/openapi.json`, or export it to a file for the
app's code generator:

```bash
uv run python scripts/export_openapi.py openapi.json
```

`server/openapi.json` is the source of truth for the app's typed TanStack Query
client (see [`../app`](../app)). Regenerate it whenever the API changes.

## Endpoints

| Method | Path                                   | Purpose                               |
| ------ | -------------------------------------- | ------------------------------------- |
| GET    | `/api/health`                          | Health check                          |
| GET    | `/api/config`                          | Client bootstrap (default Bible id)   |
| GET    | `/api/bibles`                          | List available Bible versions         |
| GET    | `/api/bibles/{id}/search?query=`       | Search verses (powers `@` lookup)     |
| GET    | `/api/bibles/{id}/verses/{verseId}`    | Fetch a single verse                  |
| GET    | `/api/journals`                        | List journal entries                  |
| POST   | `/api/journals`                        | Create an entry                       |
| GET    | `/api/journals/{id}`                   | Read an entry                         |
| PUT    | `/api/journals/{id}`                   | Update an entry                       |
| DELETE | `/api/journals/{id}`                   | Delete an entry                       |
| GET    | `/api/journals/tags`                   | Distinct `#idea` tags (powers `#`)    |

## Configuration

All settings are environment variables prefixed with `VESSEL_` (see
[`.env.example`](./.env.example)).
