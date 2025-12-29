from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Player(Base):
    __tablename__ = "players"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    color = Column(String(7), default="#808080")
    avatar_path = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    scores = relationship("RoundScore", back_populates="player")

class Round(Base):
    __tablename__ = "rounds"
    id = Column(Integer, primary_key=True, index=True)
    recorder_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    recorder_ip = Column(String(45), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    scores = relationship("RoundScore", back_populates="round", cascade="all, delete-orphan")
    recorder = relationship("Player")

class RoundScore(Base):
    __tablename__ = "round_scores"
    id = Column(Integer, primary_key=True, index=True)
    round_id = Column(Integer, ForeignKey("rounds.id", ondelete="CASCADE"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    delta = Column(Integer, nullable=False)
    round = relationship("Round", back_populates="scores")
    player = relationship("Player", back_populates="scores")

class Setting(Base):
    __tablename__ = "settings"
    key = Column(String(50), primary_key=True)
    value = Column(Text, nullable=False)
