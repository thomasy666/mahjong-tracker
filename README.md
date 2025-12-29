# Mahjong Tracker

A score tracking app for Mahjong games, built with Flask.

## Features

- Round-by-round score tracking with zero-sum validation
- Player management (add, remove, rename, custom colors, avatars)
- 3D dice roller with wall-start indicator
- Game statistics (win rate, avg score, best/worst)
- Bilingual UI (English/Mandarin)
- Admin-protected actions (reset, undo)

## Setup

```bash
pip install flask
python app.py
```

Open http://localhost:5000

## Planned Features

See `docs/plans/roadmap.md` for the development roadmap:

1. UI Redesign - Clean light theme
2. AI Image Calculator - Photo a winning hand, auto-calculate score
3. Win Type Statistics - Track patterns like 清一色, 七对子
4. Voice Control - Hands-free Mandarin voice commands
