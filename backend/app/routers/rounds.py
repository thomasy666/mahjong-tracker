from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/rounds", tags=["rounds"])

def get_active_session_id(db: Session) -> int | None:
    session = db.query(models.Session).filter(models.Session.is_active == True).first()
    return session.id if session else None

@router.get("", response_model=list[schemas.Round])
def list_rounds(db: Session = Depends(get_db)):
    session_id = get_active_session_id(db)
    query = db.query(models.Round).order_by(models.Round.id.desc())
    if session_id:
        query = query.filter(models.Round.session_id == session_id)
    else:
        query = query.filter(models.Round.session_id == None)
    rounds = query.all()
    result = []
    for r in rounds:
        scores = [schemas.RoundScore(player_id=s.player_id, player_name=s.player.name, delta=s.delta) for s in r.scores]
        result.append(schemas.Round(id=r.id, recorder_id=r.recorder_id, recorder_ip=r.recorder_ip,
                                    created_at=r.created_at, scores=scores))
    return result

@router.post("", response_model=schemas.Round)
def create_round(round_data: schemas.RoundCreate, db: Session = Depends(get_db)):
    total = sum(s.delta for s in round_data.scores)
    if total != 0:
        raise HTTPException(400, f"Scores must sum to zero, got {total}")

    session_id = get_active_session_id(db)
    db_round = models.Round(session_id=session_id, recorder_id=round_data.recorder_id, recorder_ip=round_data.recorder_ip)
    db.add(db_round)
    db.flush()

    for score in round_data.scores:
        player = db.query(models.Player).filter(models.Player.id == score.player_id).first()
        if not player:
            raise HTTPException(400, f"Player {score.player_id} not found")
        db_score = models.RoundScore(round_id=db_round.id, player_id=score.player_id, delta=score.delta)
        db.add(db_score)

    db.commit()
    db.refresh(db_round)
    scores = [schemas.RoundScore(player_id=s.player_id, player_name=s.player.name, delta=s.delta) for s in db_round.scores]
    return schemas.Round(id=db_round.id, recorder_id=db_round.recorder_id, recorder_ip=db_round.recorder_ip,
                         created_at=db_round.created_at, scores=scores)

@router.delete("/{round_id}")
def delete_round(round_id: int, db: Session = Depends(get_db)):
    round_obj = db.query(models.Round).filter(models.Round.id == round_id).first()
    if not round_obj:
        raise HTTPException(404, "Round not found")
    db.delete(round_obj)
    db.commit()
    return {"ok": True}
