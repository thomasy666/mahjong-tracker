from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models
from ..database import get_db

router = APIRouter(prefix="/api/game", tags=["game"])

@router.get("/standings")
def get_standings(db: Session = Depends(get_db)):
    players = db.query(models.Player).all()
    standings = []
    for p in players:
        score = db.query(func.coalesce(func.sum(models.RoundScore.delta), 0)).filter(
            models.RoundScore.player_id == p.id
        ).scalar()
        standings.append({"id": p.id, "name": p.name, "color": p.color,
                          "avatar_path": p.avatar_path, "score": score})
    standings.sort(key=lambda x: x["score"], reverse=True)
    return standings

@router.get("/statistics")
def get_statistics(db: Session = Depends(get_db)):
    players = db.query(models.Player).all()
    stats = []
    for p in players:
        scores = db.query(models.RoundScore).filter(models.RoundScore.player_id == p.id).all()
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
    db.query(models.RoundScore).delete()
    db.query(models.Round).delete()
    db.commit()
    return {"ok": True}
