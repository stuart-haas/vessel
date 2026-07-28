"""Thin async client for scripture.api.bible."""

from typing import Any

import httpx

from app.config import get_settings

settings = get_settings()


def _client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        base_url=settings.bible_api_url,
        headers={"api-key": settings.bible_api_key},
        timeout=15.0,
    )


async def list_bibles(language: str = "eng") -> list[dict[str, Any]]:
    async with _client() as client:
        resp = await client.get("/bibles", params={"language": language})
        resp.raise_for_status()
        return resp.json().get("data", [])


async def get_verse(bible_id: str, verse_id: str) -> dict[str, Any]:
    async with _client() as client:
        resp = await client.get(
            f"/bibles/{bible_id}/verses/{verse_id}",
            params={
                "include-chapter-numbers": "false",
                "include-verse-numbers": "false",
            },
        )
        resp.raise_for_status()
        return resp.json().get("data", {})


async def search(bible_id: str, query: str, limit: int = 10) -> list[dict[str, Any]]:
    """Search a Bible for a keyword or reference. Returns simplified verse hits."""
    async with _client() as client:
        resp = await client.get(
            f"/bibles/{bible_id}/search",
            params={"query": query, "limit": limit, "sort": "relevance"},
        )
        resp.raise_for_status()
        data = resp.json().get("data", {}) or {}
        verses = data.get("verses", []) or []
        return [
            {
                "id": v.get("id", ""),
                "reference": v.get("reference", ""),
                "text": (v.get("text", "") or "").strip(),
            }
            for v in verses
        ]
