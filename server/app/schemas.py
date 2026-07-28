"""Response schemas for API endpoints (shape the generated client's types)."""

from pydantic import BaseModel


class Config(BaseModel):
    default_bible_id: str


class Health(BaseModel):
    status: str


class Bible(BaseModel):
    id: str
    name: str
    abbreviation: str | None = None
    description: str | None = None


class VerseHit(BaseModel):
    id: str
    reference: str
    text: str


class Verse(BaseModel):
    reference: str
    content: str


class Tag(BaseModel):
    tag: str
    count: int
