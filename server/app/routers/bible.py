import httpx
from fastapi import APIRouter, HTTPException, Query

from app.config import get_settings
from app.schemas import Bible, Verse, VerseHit
from app.services import bible

router = APIRouter(prefix="/bibles", tags=["bible"])
settings = get_settings()


@router.get("", response_model=list[Bible])
async def list_bibles(language: str = "eng"):
    try:
        return await bible.list_bibles(language)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Bible API error: {exc}") from exc


@router.get("/{bible_id}/search", response_model=list[VerseHit])
async def search_verses(
    bible_id: str,
    query: str = Query(..., min_length=1, description="Keyword or reference to search"),
    limit: int = Query(10, ge=1, le=25),
):
    """Powers the `@` verse-lookup autocomplete in the journal editor."""
    try:
        return await bible.search(bible_id, query, limit)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Bible API error: {exc}") from exc


@router.get("/{bible_id}/verses/{verse_id}", response_model=Verse)
async def get_verse(bible_id: str, verse_id: str):
    try:
        return await bible.get_verse(bible_id, verse_id)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Bible API error: {exc}") from exc
