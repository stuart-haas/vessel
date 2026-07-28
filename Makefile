.PHONY: server app build up install openapi codegen

# Run the FastAPI backend locally with autoreload.
server:
	cd server && uv run uvicorn app.main:app --reload --port 3000

# Run the Expo app (web). Use `npm run ios` / `android` in ./app for native.
app:
	cd app && npm run web

# Install dependencies for both packages.
install:
	cd server && uv sync
	cd app && npm install

# Regenerate the OpenAPI schema (server/openapi.json).
openapi:
	cd server && uv run python scripts/export_openapi.py openapi.json

# Regenerate the typed TanStack Query client from the OpenAPI schema.
codegen: openapi
	cd app && npm run codegen

# Build and run the backend container.
build:
	docker compose build

up:
	docker compose up
