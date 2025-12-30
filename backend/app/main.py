from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from .routers import players, rounds, game, admin, sessions
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mahjong Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(players.router)
app.include_router(rounds.router)
app.include_router(game.router)
app.include_router(admin.router)
app.include_router(sessions.router)

# Serve avatars
avatars_dir = os.path.join(os.path.dirname(__file__), "..", "..", "static", "avatars")
if os.path.exists(avatars_dir):
    app.mount("/static/avatars", StaticFiles(directory=avatars_dir), name="avatars")

@app.get("/api/health")
def health():
    return {"status": "ok"}
