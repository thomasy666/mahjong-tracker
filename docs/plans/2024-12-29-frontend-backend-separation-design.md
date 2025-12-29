# Frontend/Backend Separation Design

## Overview

Separate the mahjong tracker into a React + TypeScript frontend and FastAPI + Python backend, replacing the current Flask monolith with inline templates.

## Motivation

- Future scaling - cleaner foundation for new features
- UI revamp - React + Tailwind enables modern, maintainable UI
- Better developer experience - hot reload, TypeScript checking, component libraries

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript + Vite |
| UI Components | Tailwind CSS + shadcn/ui |
| API Client | Auto-generated from OpenAPI |
| Backend | FastAPI + Pydantic |
| Database | SQLite + SQLAlchemy |
| Dev Tooling | npm concurrently |

## Project Structure

```
mahjong_tracker/
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── api/              # Generated TypeScript client
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── lib/              # Utilities
│   │   └── App.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app entry
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── database.py       # DB connection
│   │   └── routers/
│   │       ├── players.py
│   │       ├── rounds.py
│   │       └── game.py
│   ├── migrations/           # Alembic migrations
│   ├── scripts/
│   │   └── migrate_json.py   # JSON → SQLite migration
│   ├── requirements.txt
│   └── mahjong.db            # SQLite database
│
├── docs/plans/
├── package.json              # Root package.json with dev script
└── README.md
```

## Database Schema

### players
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| name | TEXT | Unique player name |
| color | TEXT | Hex color (default #808080) |
| avatar_path | TEXT | Avatar filename |
| created_at | TIMESTAMP | When player was added |

### rounds
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (round number) |
| recorder_id | INTEGER | FK to players |
| recorder_ip | TEXT | IP address for audit |
| created_at | TIMESTAMP | When round was recorded |

### round_scores
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| round_id | INTEGER | FK to rounds (cascade delete) |
| player_id | INTEGER | FK to players |
| delta | INTEGER | Score change |

### settings
| Column | Type | Description |
|--------|------|-------------|
| key | TEXT | Primary key |
| value | TEXT | Setting value |

## API Endpoints

### Players
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/players` | List all players with scores |
| POST | `/api/players` | Add new player |
| PATCH | `/api/players/{id}` | Update name/color/avatar |
| DELETE | `/api/players/{id}` | Remove player |

### Rounds
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rounds` | Get all rounds (ledger) |
| POST | `/api/rounds` | Record new round |
| DELETE | `/api/rounds/{id}` | Undo/delete round (admin) |

### Game
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/game/standings` | Current scores, sorted |
| GET | `/api/game/statistics` | Win rates, averages |
| POST | `/api/game/reset` | Reset all scores (admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/verify` | Check admin code |
| PATCH | `/api/admin/code` | Change admin code |

## Frontend Components

```
src/components/
├── Standings.tsx        # Player list with scores, colors, avatars
├── ScoreInput.tsx       # Form to record new round
├── RoundHistory.tsx     # Table of all rounds
├── Statistics.tsx       # Win rates, averages
├── PlayerManager.tsx    # Add/edit/remove players
├── DiceRoller.tsx       # 3D dice animation
├── AdminModal.tsx       # Admin code verification
└── ui/                  # shadcn components
```

## Development Workflow

### Running locally

Root `package.json`:
```json
{
  "name": "mahjong-tracker",
  "scripts": {
    "dev": "concurrently -n api,web -c blue,green \"cd backend && source venv/bin/activate && uvicorn app.main:app --reload\" \"cd frontend && npm run dev\"",
    "generate-api": "cd frontend && npm run generate-api"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

Usage:
```bash
npm run dev  # Starts both frontend and backend
```

### API client generation

After backend changes:
```bash
npm run generate-api  # Regenerates TypeScript client from OpenAPI spec
```

### Proxy configuration

Vite dev server proxies `/api/*` to FastAPI backend - no CORS issues during development.

## Feature Parity

| Feature | Implementation |
|---------|----------------|
| Score tracking | FastAPI endpoints + React form |
| Zero-sum validation | Backend validates, frontend shows live sum |
| Player management | CRUD endpoints + React components |
| Player colors/avatars | Stored in SQLite, served via API |
| Round history | GET /api/rounds endpoint |
| Statistics | Computed on backend via SQL |
| Admin code protection | Backend verifies, frontend prompts |
| Recorder locking | localStorage (client-side) |
| Undo last round | DELETE /api/rounds/{id} (admin) |
| Reset game | POST /api/game/reset (admin) |
| 3D dice roller | Port to React component |
| Bilingual UI | react-i18next |
| Auto-balance button | Frontend calculation |

## Validation Strategy

- Backend is authoritative - rejects invalid data
- Frontend has lightweight validation for instant UX feedback
- Zero-sum check exists in both (frontend for UX, backend for security)

## Migration Plan

1. Create SQLite database with schema
2. Run migration script to convert `mahjong_data.json` to SQLite
3. Verify data integrity (compare totals, round counts)
4. Remove old Flask files after migration complete

Data preserved:
- All rounds of history
- Player names, colors, avatars
- Admin code
- Recorder info per round

## Files to Remove After Migration

- `app.py` (Flask server)
- `tracker.py` (old game logic)
- `templates/index.html` (Jinja template)
- `mahjong_data.json` (after verified migration)
- `translations.py` (replaced by react-i18next)
