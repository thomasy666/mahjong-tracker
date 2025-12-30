# Mahjong Tracker

A score tracking app for Mahjong games, built with React + FastAPI.

## Features

- Session management (save/load multiple game sessions)
- Round-by-round score tracking with zero-sum validation
- Player management (add, remove, rename, custom colors, avatars)
- 3D dice roller with wall-start indicator
- Game statistics (win rate, avg score, best/worst)
- Bilingual UI (English/Chinese) with persistence
- Admin-protected actions (reset, undo, delete players with history)
- Recorder lock (prevents accidental changes by non-recorder)

## Tech Stack

**Frontend:** React + TypeScript + Vite + Tailwind CSS v4
**Backend:** FastAPI + SQLAlchemy + SQLite
**State:** React Query (@tanstack/react-query)
**i18n:** react-i18next

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Project Structure

```
mahjong_tracker/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, static files
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── database.py      # DB connection
│   │   └── routers/         # API endpoints
│   │       ├── players.py
│   │       ├── rounds.py
│   │       ├── game.py
│   │       ├── sessions.py
│   │       └── admin.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main layout
│   │   ├── api/client.ts    # API client
│   │   ├── i18n/index.ts    # Translations
│   │   └── components/
│   │       ├── Standings.tsx
│   │       ├── ScoreInput.tsx
│   │       ├── RoundHistory.tsx
│   │       ├── Statistics.tsx
│   │       ├── PlayerManager.tsx
│   │       ├── DiceRoller.tsx
│   │       ├── SessionManager.tsx
│   │       ├── Settings.tsx
│   │       └── AdminModal.tsx
│   └── package.json
├── static/avatars/          # Player avatar images
└── docs/plans/              # Design docs and roadmap
```

## Changelog

### v2.1.0 (Dec 2025) - Session Management

- Save and load multiple game sessions
- Each session has isolated players, rounds, and statistics
- Create new sessions (auto-activates, resets players)
- Load existing sessions with one click
- Rename active session inline (click to edit)
- Delete sessions with confirmation
- Shows 5 most recent sessions with "show more" toggle

### v2.0.0 (Dec 2025) - React Migration

**Architecture:**
- Migrated from Flask to React + FastAPI
- Added TypeScript for type safety
- Switched to Tailwind CSS v4 for styling
- Added React Query for server state management

**New Features:**
- Recorder lock - select who's recording, requires admin to unlock
- Inline player rename - click name to edit
- Settings popup in header with gear icon
- Language preference persists across refreshes
- Dynamic browser tab title follows language

**UI Improvements:**
- Round history redesigned as aligned table with player columns
- Compact, scannable score display with color coding
- Click-outside-to-close for settings popup

**Backend:**
- RESTful API with proper endpoints
- Player lock check endpoint (prevents deleting players with history)
- Proper error handling and validation

## Planned Features

See `docs/plans/roadmap.md` for the development roadmap:

1. ~~UI Redesign~~ - Done
2. AI Image Calculator - Photo a winning hand, auto-calculate score
3. Win Type Statistics - Track patterns
4. Voice Control - Hands-free Mandarin voice commands
