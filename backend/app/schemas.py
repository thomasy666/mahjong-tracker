from pydantic import BaseModel
from datetime import datetime

class PlayerBase(BaseModel):
    name: str
    color: str = "#808080"

class PlayerCreate(PlayerBase):
    pass

class PlayerUpdate(BaseModel):
    name: str | None = None
    color: str | None = None
    avatar_path: str | None = None

class Player(PlayerBase):
    id: int
    avatar_path: str | None
    created_at: datetime
    score: int = 0
    class Config:
        from_attributes = True

class RoundScoreCreate(BaseModel):
    player_id: int
    delta: int

class RoundCreate(BaseModel):
    scores: list[RoundScoreCreate]
    recorder_id: int | None = None
    recorder_ip: str | None = None

class RoundScore(BaseModel):
    player_id: int
    player_name: str
    delta: int
    class Config:
        from_attributes = True

class Round(BaseModel):
    id: int
    recorder_id: int | None
    recorder_ip: str | None
    created_at: datetime
    scores: list[RoundScore]
    class Config:
        from_attributes = True

class AdminVerify(BaseModel):
    code: str

class AdminCodeChange(BaseModel):
    old_code: str
    new_code: str

class SessionCreate(BaseModel):
    name: str

class SessionUpdate(BaseModel):
    name: str

class Session(BaseModel):
    id: int
    name: str
    created_at: datetime
    is_active: bool
    round_count: int = 0
    class Config:
        from_attributes = True
