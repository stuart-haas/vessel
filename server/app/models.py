from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class JournalBase(SQLModel):
    """Fields shared between the DB model and the create/update schemas."""

    title: str = ""
    # Free-form date the entry is *about* (ISO 8601 string, kept flexible for the client).
    entry_date: str = ""
    # Raw editor content. Supports inline @verse references, #idea tags and /commands.
    content: str = ""


class Journal(JournalBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)


class JournalCreate(JournalBase):
    pass


class JournalUpdate(SQLModel):
    title: str | None = None
    entry_date: str | None = None
    content: str | None = None


class JournalRead(JournalBase):
    id: int
    created_at: datetime
    updated_at: datetime
