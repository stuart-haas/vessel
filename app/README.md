# Vessel App

The Vessel client, built with [Expo](https://expo.dev) and
[Expo Router](https://docs.expo.dev/router/introduction/). One codebase targets
**web, iOS, and Android**.

## Run locally

```bash
cd app
npm install
cp .env.example .env          # point EXPO_PUBLIC_API_URL at your backend
npm run web                   # or: npm run ios / npm run android
```

The backend must be running (see [`../server`](../server)). For a physical
device, set `EXPO_PUBLIC_API_URL` to your computer's LAN IP.

## Structure

```
app/
├── app/                     # Expo Router screens (file-based routing)
│   ├── _layout.tsx          # Root stack + providers (incl. React Query)
│   ├── index.tsx            # Home
│   ├── read.tsx             # Verse reader
│   ├── settings.tsx         # Bible version picker
│   └── journals/
│       ├── index.tsx        # Entry list
│       └── [id].tsx         # Editor (id = "new" or an entry id)
├── openapi-ts.config.ts     # hey-api codegen config
└── src/
    ├── client/              # GENERATED — typed client + TanStack Query options
    ├── api.ts               # Runtime config (base URL) for the generated client
    ├── errors.ts            # Error → message helper
    ├── settings.tsx         # Selected-Bible context (persisted)
    ├── theme.ts             # Colors / spacing tokens
    ├── editor/tokens.ts     # @ / # / trigger parsing + commands
    └── components/ThoughtEditor.tsx
```

## Data layer (generated)

The app never hand-writes fetch calls. The backend's OpenAPI schema is compiled
into a fully-typed client and TanStack Query options with
[`@hey-api/openapi-ts`](https://heyapi.dev):

```bash
# from the repo root (exports server/openapi.json first, then generates):
make codegen
# or, if server/openapi.json is already up to date:
npm run codegen
```

Screens then consume the generated options directly:

```ts
import { useQuery } from '@tanstack/react-query';
import { listJournalsOptions } from '@/client/@tanstack/react-query.gen';

const { data, error } = useQuery(listJournalsOptions());
```

`src/client/` is committed so the app builds without running codegen, but
regenerate it whenever the API changes. The base URL is injected at runtime by
`createClientConfig` in [`src/api.ts`](./src/api.ts).

## The Thought editor

The journal editor is a plain text field with three inline triggers:

| Type | Trigger | Opens                                            |
| ---- | ------- | ------------------------------------------------ |
| `@`  | verse   | Bible verse search (via the backend)             |
| `#`  | idea    | Connect to an existing idea tag, or make a new one |
| `/`  | command | Quick inserts (date, prompts, divider, …)        |

Because it is a single cross-platform `TextInput`, it behaves identically on
web, iOS, and Android with no native modules.
