# CLAUDE.md

Guidance for AI coding agents (and humans) working in this repository.

## What Vessel is

Vessel is an app for connecting your thoughts with biblical scripture —
encouraging children of God to spend time in His presence daily. It is a
monorepo:

- `client/` — Expo + React Native + Expo Router app (web, iOS, Android).
- `server/` — FastAPI + SQLModel (SQLite) backend, dependencies managed by `uv`.

The client never hand-writes HTTP calls: the backend's OpenAPI schema is
compiled into a typed client and TanStack Query hooks with
`@hey-api/openapi-ts`. **The schema is the contract that ties the two halves
together — respect it.**

## Repository map

```
client/
  src/
    app/                  Expo Router screens (file-based routing)
    api/
      client/             GENERATED — do not hand-edit
      config.ts           Runtime base URL for the generated client
    editor/tokens.ts      @ / # / trigger parsing for the journal editor
    components/           Shared UI (ThoughtEditor, …)
  openapi-ts.config.ts    Codegen config
server/
  app/
    main.py               FastAPI app, CORS, router wiring, operationId naming
    routers/              Endpoints (bible, journals) + meta (health, config)
    services/bible.py     Async scripture.api.bible client
    models.py             SQLModel tables (Journal)
    schemas.py            Response models — these shape the generated types
  scripts/export_openapi.py   Dumps openapi.json without booting the server
  openapi.json            Committed source of truth for codegen
```

## Common commands

Backend (`server/`):

```bash
uv sync                                         # install from uv.lock
uv run uvicorn app.main:app --reload --port 3000
uv run python scripts/export_openapi.py openapi.json   # refresh the schema
```

App (`client/`):

```bash
npm install
npm run web            # or: npm run ios / npm run android
npm run codegen        # regenerate src/api/client from ../server/openapi.json
npm run typecheck      # tsc --noEmit
```

Backend container: `docker compose up` (builds `server/` only).

## The one workflow that matters: changing the API

When you touch a route, its params, or a response model:

1. Update the FastAPI route and its `schemas.py` response model.
2. `uv run python scripts/export_openapi.py openapi.json` (regenerates the schema).
3. `cd ../client && npm run codegen` (regenerates the typed client).
4. `npm run typecheck` — the compiler will point you at every call site that
   needs updating.

Never edit `client/src/api/client/**` by hand — it is overwritten on every codegen run.
Keep endpoint response models in `schemas.py`; loosely-typed dict returns produce
`unknown` in the client and defeat the purpose.

## Conventions

- **Backend**: one router per resource under `server/app/routers/`. Every endpoint
  declares a `response_model`. `operationId` is the Python function name (via
  `generate_unique_id_function`), which becomes the generated method name — so
  name endpoint functions like you'd want the client method to read
  (`list_journals` → `listJournals`).
- **App**: screens consume generated `*Options` / `*Mutation` from
  `@/api/client/@tanstack/react-query.gen`. Invalidate the relevant query keys
  after a mutation. Base URL comes from `EXPO_PUBLIC_API_URL`.
- **Cross-platform first**: everything must run on web, iOS, and Android. Reach
  for React Native primitives before native modules; if a feature needs a native
  module, that is a deliberate decision, not a default.

## Engineering principles (Karpathy)

Principles distilled from Andrej Karpathy's engineering philosophy. They are the
house style here — apply them to every change.

1. **Keep it simple; the best code is no code.** Prefer deleting to adding.
   Solve the problem in front of you, not the six imagined ones behind it. A
   short, boring, obvious solution beats a clever one.

2. **Resist premature abstraction.** Write the concrete thing first. Add an
   abstraction only after the third real duplication tells you its exact shape —
   never before. A wrong abstraction is more expensive than repetition.

3. **Understand the whole stack; nothing is magic.** Before you change code,
   know what it actually does — read the library, the generated output, the SQL,
   the network call. Do not paste code you can't explain line by line.

4. **Be paranoid — assume it's broken until proven otherwise.** Your code is
   guilty until verified. Don't trust that it works because it compiled or
   because a test is green; make it fail first, then make it pass.

5. **Verify the smallest thing, then grow.** Overfit one case: get a single
   endpoint, a single query, a single render working end-to-end before
   generalizing. Small, checked steps beat a big leap you can't debug.

6. **Make it observable.** When something is wrong, look at the actual value —
   print it, inspect the response, read the row. Debug from evidence, not from a
   story you tell yourself about what the code "should" be doing.

7. **Read the error message.** All of it. The answer is usually in the stack
   trace you skimmed. Reproduce, then fix the cause — not the symptom.

8. **Write for the next human.** Clear names, obvious control flow, comments that
   explain *why*. Match the surrounding code's altitude and style. Code is read
   far more than it is written.

9. **Minimize moving parts.** Fewer dependencies, fewer services, fewer layers.
   Every new one is a lifetime tax in maintenance and a new place for bugs to
   hide. Justify each addition.

10. **Leave it tighter than you found it, and keep it working.** Prefer small,
    reversible changes that keep the app runnable at every commit. Tidy the thing
    you're touching; don't detour into a rewrite the task didn't ask for.

## Gotchas

- The Bible features call `scripture.api.bible` and need a valid key
  (`VESSEL_BIBLE_API_KEY`). Journal features are SQLite-backed and work offline.
- Physical devices can't reach `localhost` — set `EXPO_PUBLIC_API_URL` to your
  machine's LAN IP.
- `server/*.db` and `client/dist` are build artifacts; never commit them.
