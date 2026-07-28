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
│   ├── _layout.tsx          # Root stack + providers
│   ├── index.tsx            # Home
│   ├── read.tsx             # Verse reader
│   ├── settings.tsx         # Bible version picker
│   └── journals/
│       ├── index.tsx        # Entry list
│       └── [id].tsx         # Editor (id = "new" or an entry id)
└── src/
    ├── api.ts               # Typed backend client
    ├── settings.tsx         # Selected-Bible context (persisted)
    ├── theme.ts             # Colors / spacing tokens
    ├── editor/tokens.ts     # @ / # / trigger parsing + commands
    └── components/ThoughtEditor.tsx
```

## The Thought editor

The journal editor is a plain text field with three inline triggers:

| Type | Trigger | Opens                                            |
| ---- | ------- | ------------------------------------------------ |
| `@`  | verse   | Bible verse search (via the backend)             |
| `#`  | idea    | Connect to an existing idea tag, or make a new one |
| `/`  | command | Quick inserts (date, prompts, divider, …)        |

Because it is a single cross-platform `TextInput`, it behaves identically on
web, iOS, and Android with no native modules.
