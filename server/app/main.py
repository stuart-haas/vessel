from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute

from app.config import get_settings
from app.database import init_db
from app.routers import bible, journals
from app.schemas import Config, Health

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


def custom_generate_unique_id(route: APIRoute) -> str:
    """Use the endpoint function name as the OpenAPI operationId.

    This keeps generated client method names clean (e.g. `listJournals`) instead
    of FastAPI's default verbose ids like `list_journals_api_journals_get`.
    """
    return route.name


app = FastAPI(
    title="Vessel API",
    version="0.1.0",
    lifespan=lifespan,
    generate_unique_id_function=custom_generate_unique_id,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(prefix="/api")


@api.get("/health", tags=["meta"], response_model=Health)
def health():
    return {"status": "ok"}


@api.get("/config", tags=["meta"], response_model=Config)
def config():
    """Client bootstrap: the default Bible version to use before the user picks one."""
    return {"default_bible_id": settings.default_bible_id}


api.include_router(bible.router)
api.include_router(journals.router)
app.include_router(api)


@app.get("/", include_in_schema=False)
def root():
    return {"name": "Vessel API", "docs": "/docs"}
