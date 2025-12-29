# Changelog

## v2.0.0 - React Migration (December 2025)

Complete rewrite from Flask monolith to React + FastAPI architecture.

### Architecture Changes

**Before:** Single Flask app (`app.py`) with Jinja2 templates, jQuery frontend, JSON file storage

**After:**
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS v4
- Backend: FastAPI + SQLAlchemy + SQLite
- State management: React Query (@tanstack/react-query)
- i18n: react-i18next

### Files Removed

- `app.py` - Flask application
- `tracker.py` - Game logic and data persistence
- `translations.py` - i18n dictionary
- `templates/index.html` - Jinja2 template with embedded JS

### New Project Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI app, CORS config, static file serving
│   ├── models.py         # SQLAlchemy models (Player, Round, RoundScore, Settings)
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── database.py       # SQLite connection setup
│   └── routers/
│       ├── players.py    # CRUD + avatar upload + lock check
│       ├── rounds.py     # Create/list/delete rounds
│       ├── game.py       # Reset, standings, statistics
│       └── admin.py      # Code verification and change

frontend/
├── src/
│   ├── main.tsx          # React entry point
│   ├── App.tsx           # Layout, language toggle, settings popup
│   ├── api/client.ts     # Axios API client with typed endpoints
│   ├── i18n/index.ts     # Translation strings (en/zh)
│   └── components/
│       ├── Standings.tsx      # Player rankings with totals
│       ├── ScoreInput.tsx     # Score entry with recorder lock
│       ├── RoundHistory.tsx   # Aligned table of all rounds
│       ├── Statistics.tsx     # Win rate, avg, best/worst
│       ├── PlayerManager.tsx  # Add/rename/delete players
│       ├── DiceRoller.tsx     # 3D dice with wall indicator
│       ├── Settings.tsx       # Reset game, change admin code
│       └── AdminModal.tsx     # Password verification modal
```

### New Features

**Recorder Lock**
- Select which player is recording scores
- Persists in localStorage
- Requires admin verification to unlock/change
- Prevents accidental edits by other players

**Inline Player Rename**
- Click player name to edit directly
- Press Enter to save, Escape to cancel
- No modal required

**Player Delete Protection**
- Players with round history require admin verification to delete
- New `/players/{id}/locked` endpoint checks if player has scores

**Settings Popup**
- Gear icon in header next to language toggle
- Click-outside-to-close behavior
- Contains: Reset Game, Change Admin Code

**Language Persistence**
- Selected language saved to localStorage
- Restored on page refresh
- Browser tab title updates with language

### UI Changes

**Round History Redesign**
- Changed from card-based to table layout
- Fixed columns per player for alignment
- Color-coded scores (green positive, red negative)
- Sticky header for scrolling
- Compact rows for better scanning

**Header Layout**
- Language toggle button (EN/中文)
- Settings gear icon with dropdown
- Dynamic page title

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /players | List all players |
| POST | /players | Create player |
| PUT | /players/{id} | Update player name |
| DELETE | /players/{id} | Delete player |
| POST | /players/{id}/avatar | Upload avatar image |
| GET | /players/{id}/locked | Check if player has history |
| GET | /rounds | List all rounds (newest first) |
| POST | /rounds | Create round with scores |
| DELETE | /rounds/{id} | Delete round (undo) |
| GET | /game/standings | Get player totals |
| GET | /game/statistics | Get win rates, averages |
| POST | /game/reset | Reset all scores |
| POST | /admin/verify | Verify admin code |
| POST | /admin/change-code | Change admin code |

### Database Schema

```sql
CREATE TABLE players (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#808080',
    avatar_path TEXT
);

CREATE TABLE rounds (
    id INTEGER PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE round_scores (
    id INTEGER PRIMARY KEY,
    round_id INTEGER REFERENCES rounds(id),
    player_id INTEGER REFERENCES players(id),
    delta INTEGER NOT NULL
);

CREATE TABLE settings (
    id INTEGER PRIMARY KEY,
    admin_code TEXT DEFAULT '1234'
);
```

### Migration Notes

- Existing `mahjong_data.json` can be migrated using `python scripts/migrate_json.py`
- Avatar images remain in `static/avatars/`
- Default admin code is `1234`
