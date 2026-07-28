# Vessel API

A simple [FastAPI](https://fastapi.tiangolo.com/) backend for Vessel. It proxies
[scripture.api.bible](https://scripture.api.bible) for Bible content and persists
journal entries to SQLite via [SQLModel](https://sqlmodel.tiangolo.com/).

## Run locally

```bash
cd server
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # optional: customize config
uvicorn app.main:app --reload --port 3000
```

Interactive docs: http://localhost:3000/docs

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
