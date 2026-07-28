# Vessel

**Vessel is an app for connecting your thoughts with biblical scripture —
encouraging children of God to spend time in His presence daily.**

Write freely in a journal and weave scripture, ideas, and prompts directly into
your words: type `@` to look up a Bible verse, `#` to connect a recurring idea,
and `/` to run a quick command. One codebase runs on **web, iOS, and Android**.

---

## Project overview

Vessel is a monorepo with two halves connected by a generated, fully-typed API
contract:

| Path                  | Stack                                         | Runs on           |
| --------------------- | --------------------------------------------- | ----------------- |
| [`app/`](./app)       | Expo · React Native · Expo Router · TanStack Query | Web, iOS, Android |
| [`server/`](./server) | FastAPI · SQLModel (SQLite) · managed by `uv` | Python 3.11+      |

The app never hand-writes HTTP calls. The backend's OpenAPI schema
(`server/openapi.json`) is compiled by [`@hey-api/openapi-ts`](https://heyapi.dev)
into a typed client and [TanStack Query](https://tanstack.com/query) hooks under
`app/src/client/`. Change the API in one place and the client types follow.

## Features / status

Implemented so far:

- **Home** — the Vessel welcome (Psalm 119:105) with Read / Listen / Journal /
  Settings.
- **Journal** — the centerpiece: a cross-platform "thought" editor with three
  inline triggers, backed by persistent storage.
  - `@` — search and insert a Bible verse (via the backend).
  - `#` — connect an idea; autocompletes existing tags or creates a new one.
  - `/` — quick commands (today's date, gratitude/prayer/reflection prompts,
    divider).
  - Full journal CRUD (list, create, edit, delete) with pull-to-refresh.
- **Read** — pulls a verse from [scripture.api.bible](https://scripture.api.bible)
  in the selected translation.
- **Settings** — choose your Bible translation, persisted on-device.
- **Backend** — FastAPI with journal CRUD, a `#tag` aggregation endpoint, and an
  async Bible-API proxy; SQLite persistence via SQLModel.
- **Typed data layer** — end-to-end types generated from the OpenAPI schema.

Not yet built (see [Roadmap](#roadmap)):

- **Listen** — audio reading (placeholder for now).
- Authentication / multi-user accounts and cloud sync.
- Rich text / formatting in the editor (currently a single cross-platform text
  field).

## Requirements

- **Node.js** ≥ 18 and npm (for the app / Expo).
- **Python** ≥ 3.11 and [`uv`](https://docs.astral.sh/uv/) (for the backend).
- A **[scripture.api.bible](https://scripture.api.bible) API key** for the Bible
  features (a shared demo key ships as the default; replace it for real use).
- Optional: **Docker** (to run the backend in a container) and the **Expo Go**
  app or a simulator/emulator to run on a device.

## Setup

### 1. Backend

```bash
cd server
uv sync                                  # create .venv and install from uv.lock
cp .env.example .env                     # optional: set your Bible API key, etc.
uv run uvicorn app.main:app --reload --port 3000
```

- Interactive API docs: <http://localhost:3000/docs>
- Config is via `VESSEL_*` environment variables — see
  [`server/.env.example`](./server/.env.example).

### 2. App

In a second terminal:

```bash
cd app
npm install
cp .env.example .env                     # point EXPO_PUBLIC_API_URL at the backend
npm run web                              # or: npm run ios / npm run android
```

- Default backend URL is `http://localhost:3000` (correct for web and the iOS
  simulator).
- Android emulator: use `http://10.0.2.2:3000`.
- Physical device: use your computer's LAN IP (e.g. `http://192.168.1.x:3000`).

### Backend via Docker (alternative)

```bash
docker compose up        # builds and runs the FastAPI server on :3000
```

## Regenerating the typed client

Whenever the API changes, refresh the schema and regenerate the client:

```bash
# 1. export the schema from the backend (in server/)
cd server && uv run python scripts/export_openapi.py openapi.json

# 2. regenerate the typed client + query hooks (in app/)
cd ../app && npm run codegen
```

`app/src/client/` is committed so the app builds without running codegen, but it
is generated — never edit it by hand.

## Project structure

```
vessel/
├── app/                      # Expo React Native app
│   ├── app/                  # Expo Router screens (index, read, settings, journals/…)
│   ├── src/
│   │   ├── client/           # GENERATED typed client + TanStack Query options
│   │   ├── api.ts            # Runtime base URL for the client
│   │   ├── editor/tokens.ts  # @ / # / trigger parsing + slash commands
│   │   └── components/       # ThoughtEditor, …
│   └── openapi-ts.config.ts  # codegen config
├── server/                   # FastAPI backend
│   ├── app/
│   │   ├── main.py           # app wiring, CORS, operationId naming
│   │   ├── routers/          # bible + journals endpoints
│   │   ├── services/bible.py # scripture.api.bible client
│   │   ├── models.py         # SQLModel tables
│   │   └── schemas.py        # response models (shape the generated types)
│   ├── scripts/export_openapi.py
│   └── openapi.json          # source of truth for codegen
├── compose.yml               # backend container
└── CLAUDE.md                 # engineering guidelines for contributors/agents
```

## API endpoints

| Method | Path                                | Purpose                             |
| ------ | ----------------------------------- | ----------------------------------- |
| GET    | `/api/health`                       | Health check                        |
| GET    | `/api/config`                       | Client bootstrap (default Bible id) |
| GET    | `/api/bibles`                       | List Bible versions                 |
| GET    | `/api/bibles/{id}/search?query=`    | Search verses (powers `@`)          |
| GET    | `/api/bibles/{id}/verses/{verseId}` | Fetch a verse                       |
| GET    | `/api/journals`                     | List entries                        |
| POST   | `/api/journals`                     | Create an entry                     |
| GET    | `/api/journals/{id}`                | Read an entry                       |
| PUT    | `/api/journals/{id}`                | Update an entry                     |
| DELETE | `/api/journals/{id}`                | Delete an entry                     |
| GET    | `/api/journals/tags`                | Distinct `#idea` tags (powers `#`)  |

## Roadmap

- **Listen**: audio playback of scripture.
- **Accounts & sync**: authentication and cloud-backed journals (swap SQLite for
  Postgres — the SQLModel layer is ready for it).
- **Editor**: richer formatting and rendering `@verse` / `#idea` tokens as styled
  chips.
- **Offline-first**: cache verses and queue journal writes.

## Contributing

Development conventions and engineering principles live in
[`CLAUDE.md`](./CLAUDE.md). Per-package details are in
[`app/README.md`](./app/README.md) and [`server/README.md`](./server/README.md).
