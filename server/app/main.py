from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.routers import bible, journals

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Vessel API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(prefix="/api")


@api.get("/health", tags=["meta"])
def health():
    return {"status": "ok"}


@api.get("/config", tags=["meta"])
def config():
    """Client bootstrap: the default Bible version to use before the user picks one."""
    return {"default_bible_id": settings.default_bible_id}


api.include_router(bible.router)
api.include_router(journals.router)
app.include_router(api)


@app.get("/", include_in_schema=False)
def root():
    return {"name": "Vessel API", "docs": "/docs"}
