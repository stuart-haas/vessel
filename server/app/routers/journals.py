import re
from collections import Counter
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Journal, JournalCreate, JournalRead, JournalUpdate
from app.schemas import Tag

router = APIRouter(prefix="/journals", tags=["journals"])

# Matches inline #idea tags, e.g. "#gratitude" or "#faith-over-fear".
TAG_PATTERN = re.compile(r"(?:^|\s)#([\w-]+)")


@router.get("", response_model=list[JournalRead])
def list_journals(session: Session = Depends(get_session)):
    return session.exec(select(Journal).order_by(Journal.updated_at.desc())).all()


@router.post("", response_model=JournalRead, status_code=201)
def create_journal(payload: JournalCreate, session: Session = Depends(get_session)):
    journal = Journal.model_validate(payload)
    session.add(journal)
    session.commit()
    session.refresh(journal)
    return journal


@router.get("/tags", response_model=list[Tag])
def list_tags(session: Session = Depends(get_session)):
    """Distinct #idea tags across all entries, powering the `#` autocomplete."""
    counts: Counter[str] = Counter()
    for journal in session.exec(select(Journal)).all():
        for tag in TAG_PATTERN.findall(journal.content or ""):
            counts[tag.lower()] += 1
    return [{"tag": tag, "count": count} for tag, count in counts.most_common()]


@router.get("/{journal_id}", response_model=JournalRead)
def get_journal(journal_id: int, session: Session = Depends(get_session)):
    journal = session.get(Journal, journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    return journal


@router.put("/{journal_id}", response_model=JournalRead)
def update_journal(
    journal_id: int,
    payload: JournalUpdate,
    session: Session = Depends(get_session),
):
    journal = session.get(Journal, journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(journal, key, value)
    journal.updated_at = datetime.now(timezone.utc)
    session.add(journal)
    session.commit()
    session.refresh(journal)
    return journal


@router.delete("/{journal_id}", status_code=204)
def delete_journal(journal_id: int, session: Session = Depends(get_session)):
    journal = session.get(Journal, journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    session.delete(journal)
    session.commit()
