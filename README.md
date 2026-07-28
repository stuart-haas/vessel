# Vessel

Vessel is an app for connecting your thoughts with biblical scripture —
encouraging children of God to spend time in His presence daily.

This repository is a monorepo:

| Path                    | Stack                                    | Runs on              |
| ----------------------- | ---------------------------------------- | -------------------- |
| [`app/`](./app)         | Expo + React Native + Expo Router        | Web, iOS, Android    |
| [`server/`](./server)   | FastAPI + SQLModel (SQLite)              | Python 3.11+         |

## Quick start

**1. Backend**

```bash
cd server
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3000
```

**2. App** (in a second terminal)

```bash
cd app
npm install
npm run web        # or: npm run ios / npm run android
```

The app talks to the backend via `EXPO_PUBLIC_API_URL` (default
`http://localhost:3000`; see [`app/.env.example`](./app/.env.example)).

Or run just the backend in Docker:

```bash
make build && make up
```

## Features

- **Home** — the Vessel welcome, with Read / Listen / Journal / Settings.
- **Read** — pulls a verse from [scripture.api.bible](https://scripture.api.bible)
  in the selected translation.
- **Journal** — a trigger-driven "thought" editor:
  - `@` looks up Bible verses,
  - `#` connects ideas via tags,
  - `/` runs quick commands.
  Entries are persisted by the backend.
- **Settings** — choose your Bible translation (persisted on-device).

See [`app/README.md`](./app/README.md) and [`server/README.md`](./server/README.md)
for details.
