from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/players", tags=["players"])

@router.get("", response_model=list[schemas.Player])
def list_players(db: Session = Depends(get_db)):
    players = db.query(models.Player).all()
    result = []
    for p in players:
        score = db.query(func.coalesce(func.sum(models.RoundScore.delta), 0)).filter(
            models.RoundScore.player_id == p.id
        ).scalar()
        result.append(schemas.Player(
            id=p.id, name=p.name, color=p.color,
            avatar_path=p.avatar_path, created_at=p.created_at, score=score
        ))
    return result

@router.post("", response_model=schemas.Player)
def create_player(player: schemas.PlayerCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Player).filter(models.Player.name == player.name).first()
    if existing:
        raise HTTPException(400, "Player already exists")
    db_player = models.Player(name=player.name, color=player.color)
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return schemas.Player(id=db_player.id, name=db_player.name, color=db_player.color,
                          avatar_path=db_player.avatar_path, created_at=db_player.created_at, score=0)

@router.patch("/{player_id}", response_model=schemas.Player)
def update_player(player_id: int, update: schemas.PlayerUpdate, db: Session = Depends(get_db)):
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        raise HTTPException(404, "Player not found")
    if update.name is not None:
        player.name = update.name
    if update.color is not None:
        player.color = update.color
    if update.avatar_path is not None:
        player.avatar_path = update.avatar_path
    db.commit()
    db.refresh(player)
    score = db.query(func.coalesce(func.sum(models.RoundScore.delta), 0)).filter(
        models.RoundScore.player_id == player.id
    ).scalar()
    return schemas.Player(id=player.id, name=player.name, color=player.color,
                          avatar_path=player.avatar_path, created_at=player.created_at, score=score)

@router.delete("/{player_id}")
def delete_player(player_id: int, db: Session = Depends(get_db)):
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        raise HTTPException(404, "Player not found")
    db.delete(player)
    db.commit()
    return {"ok": True}
