from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/sessions", tags=["sessions"])

@router.get("", response_model=list[schemas.Session])
def list_sessions(db: DBSession = Depends(get_db)):
    sessions = db.query(models.Session).order_by(models.Session.created_at.desc()).all()
    result = []
    for s in sessions:
        round_count = db.query(func.count(models.Round.id)).filter(models.Round.session_id == s.id).scalar()
        result.append(schemas.Session(
            id=s.id,
            name=s.name,
            created_at=s.created_at,
            is_active=s.is_active,
            round_count=round_count
        ))
    return result

@router.get("/active", response_model=schemas.Session | None)
def get_active_session(db: DBSession = Depends(get_db)):
    session = db.query(models.Session).filter(models.Session.is_active == True).first()
    if not session:
        return None
    round_count = db.query(func.count(models.Round.id)).filter(models.Round.session_id == session.id).scalar()
    return schemas.Session(
        id=session.id,
        name=session.name,
        created_at=session.created_at,
        is_active=session.is_active,
        round_count=round_count
    )

@router.post("", response_model=schemas.Session)
def create_session(data: schemas.SessionCreate, db: DBSession = Depends(get_db)):
    # Deactivate all existing sessions
    db.query(models.Session).update({models.Session.is_active: False})
    # Create new active session
    session = models.Session(name=data.name, is_active=True)
    db.add(session)
    db.commit()
    db.refresh(session)
    return schemas.Session(
        id=session.id,
        name=session.name,
        created_at=session.created_at,
        is_active=session.is_active,
        round_count=0
    )

@router.post("/{session_id}/load", response_model=schemas.Session)
def load_session(session_id: int, db: DBSession = Depends(get_db)):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    # Deactivate all, activate this one
    db.query(models.Session).update({models.Session.is_active: False})
    session.is_active = True
    db.commit()
    db.refresh(session)
    round_count = db.query(func.count(models.Round.id)).filter(models.Round.session_id == session.id).scalar()
    return schemas.Session(
        id=session.id,
        name=session.name,
        created_at=session.created_at,
        is_active=session.is_active,
        round_count=round_count
    )

@router.patch("/{session_id}", response_model=schemas.Session)
def rename_session(session_id: int, data: schemas.SessionUpdate, db: DBSession = Depends(get_db)):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.name = data.name
    db.commit()
    db.refresh(session)
    round_count = db.query(func.count(models.Round.id)).filter(models.Round.session_id == session.id).scalar()
    return schemas.Session(
        id=session.id,
        name=session.name,
        created_at=session.created_at,
        is_active=session.is_active,
        round_count=round_count
    )

@router.delete("/{session_id}")
def delete_session(session_id: int, db: DBSession = Depends(get_db)):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    # Delete all rounds in this session
    db.query(models.Round).filter(models.Round.session_id == session_id).delete()
    db.delete(session)
    db.commit()
    return {"ok": True}
