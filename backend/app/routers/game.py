from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models
from ..database import get_db

router = APIRouter(prefix="/api/game", tags=["game"])

def get_active_session_id(db: Session) -> int | None:
    session = db.query(models.Session).filter(models.Session.is_active == True).first()
    return session.id if session else None

@router.get("/standings")
def get_standings(db: Session = Depends(get_db)):
    session_id = get_active_session_id(db)
    # Only get players for this session
    if session_id:
        players = db.query(models.Player).filter(models.Player.session_id == session_id).all()
    else:
        players = db.query(models.Player).filter(models.Player.session_id == None).all()
    standings = []
    for p in players:
        # Join through Round to filter by session
        query = db.query(func.coalesce(func.sum(models.RoundScore.delta), 0)).join(
            models.Round, models.RoundScore.round_id == models.Round.id
        ).filter(models.RoundScore.player_id == p.id)
        if session_id:
            query = query.filter(models.Round.session_id == session_id)
        else:
            query = query.filter(models.Round.session_id == None)
        score = query.scalar()
        standings.append({"id": p.id, "name": p.name, "color": p.color,
                          "avatar_path": p.avatar_path, "score": score})
    standings.sort(key=lambda x: x["score"], reverse=True)
    return standings

@router.get("/statistics")
def get_statistics(db: Session = Depends(get_db)):
    session_id = get_active_session_id(db)
    # Only get players for this session
    if session_id:
        players = db.query(models.Player).filter(models.Player.session_id == session_id).all()
    else:
        players = db.query(models.Player).filter(models.Player.session_id == None).all()
    stats = []
    for p in players:
        # Join through Round to filter by session
        query = db.query(models.RoundScore).join(
            models.Round, models.RoundScore.round_id == models.Round.id
        ).filter(models.RoundScore.player_id == p.id)
        if session_id:
            query = query.filter(models.Round.session_id == session_id)
        else:
            query = query.filter(models.Round.session_id == None)
        scores = query.all()
        if not scores:
            continue
        deltas = [s.delta for s in scores]
        wins = sum(1 for d in deltas if d > 0)
        stats.append({
            "name": p.name, "color": p.color, "rounds": len(deltas),
            "win_rate": round(wins / len(deltas) * 100, 1),
            "avg": round(sum(deltas) / len(deltas), 1),
            "best": max(deltas), "worst": min(deltas)
        })
    stats.sort(key=lambda x: x["win_rate"], reverse=True)
    return stats

@router.post("/reset")
def reset_game(db: Session = Depends(get_db)):
    # Only reset rounds in active session (or no session)
    session_id = get_active_session_id(db)
    if session_id:
        round_ids = [r.id for r in db.query(models.Round).filter(models.Round.session_id == session_id).all()]
    else:
        round_ids = [r.id for r in db.query(models.Round).filter(models.Round.session_id == None).all()]
    if round_ids:
        db.query(models.RoundScore).filter(models.RoundScore.round_id.in_(round_ids)).delete(synchronize_session=False)
        db.query(models.Round).filter(models.Round.id.in_(round_ids)).delete(synchronize_session=False)
    db.commit()
    return {"ok": True}
