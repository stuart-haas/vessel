.PHONY: server app build up install

# Run the FastAPI backend locally with autoreload.
server:
	cd server && uvicorn app.main:app --reload --port 3000

# Run the Expo app (web). Use `npm run ios` / `android` in ./app for native.
app:
	cd app && npm run web

# Install dependencies for both packages.
install:
	cd server && pip install -r requirements.txt
	cd app && npm install

# Build and run the backend container.
build:
	docker compose build

up:
	docker compose up
