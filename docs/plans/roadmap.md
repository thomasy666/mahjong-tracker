# Mahjong Tracker - Development Roadmap

## Overview

This document outlines the implementation order for planned features. Each phase builds on the previous.

---

## Phase 1: UI Redesign

**Goal:** Transform from "vibe-coded" glassmorphism to clean, professional light theme.

**Key Changes:**
- Light color palette (`#f5f5f5` background, `#ffffff` cards)
- Single accent color (blue `#2563eb`) for actions
- Green/red only for positive/negative scores
- Flat design - no gradients, glows, or blur effects
- System font stack instead of Exo 2
- Consolidated settings panel (eliminate modal spam)
- Consistent player identity pattern (avatar + name + color everywhere)
- Compact dice roller (keep 3D animation + wall indicator)
- Simplified validation UI (no magic wand button)

**Files to modify:**
- `templates/index.html` - CSS overhaul, consolidate modals
- `static/` - Remove unused assets if any

**Design doc:** `docs/plans/2024-12-29-ui-redesign.md`

---

## Phase 2: Data Model Update

**Goal:** Prepare data structure for win type tracking.

**Key Changes:**
- Add optional `win_details` field to round structure:
```python
{
    "id": 1,
    "deltas": {"妈咪": 8, "皮皮": -8},
    "recorder": "修宝",
    "win_details": {  # Optional
        "winner": "妈咪",
        "win_types": ["清一色", "碰碰胡"],
        "method": "self_draw",
        "fan": 0,
        "flowers": 2,
        "kongs": 1
    }
}
```

**Files to modify:**
- `tracker.py` - Update `add_round()` to accept optional win_details
- `app.py` - Pass win_details from form/API to tracker

**Backward compatible:** Existing rounds without `win_details` continue to work.

---

## Phase 3: AI Image Calculator

**Goal:** Photograph winning hand, AI calculates score automatically.

**Key Components:**
1. **AI Provider Abstraction** - DeepSeek (free) + Claude (paid fallback)
2. **Tile Recognition** - Vision LLM identifies tiles from photo
3. **Scoring Engine** - Pattern detection + score calculation
4. **Camera UI** - Take/upload photo, review detected tiles, confirm score

**Scoring Rules (血战到底 variant):**
- Base patterns: 清一色(3), 七对子(3), 碰碰胡(1), 混一色(1), 大吊车(1), 海底捞月(1)
- Bonuses: Self-draw(1), Kong(1), Flower(1)
- Fan multiplier: 2x for replacement tile wins
- Requirement: 缺一门 (must be missing one suit)

**New files:**
```
ai/
├── providers.py      # AI provider abstraction
├── tile_recognition.py
└── prompts.py
scoring/
├── rules.py          # Scoring configuration
├── calculator.py
└── patterns.py
config.py
```

**Design doc:** `docs/plans/2024-12-29-ai-image-calculator-design.md` (Sections 1-6)

---

## Phase 4: Win Type Statistics

**Goal:** Track and display win patterns in statistics.

**Key Changes:**
1. **Manual entry option** - Collapsible "Win Details" section in score form
2. **Stats table** - Add "Top Pattern" column
3. **Expanded view** - Tap player row to see full pattern breakdown
4. **History table** - Show win type column

**Files to modify:**
- `templates/index.html` - Add win details form, stats columns
- `tracker.py` - Calculate pattern statistics
- `app.py` - Handle win details in form submission

**Design doc:** `docs/plans/2024-12-29-ai-image-calculator-design.md` (Section 7)

---

## Phase 5: Voice Control

**Goal:** Hands-free score recording via Mandarin voice commands.

**Key Components:**
1. **Web Speech API** - Browser-native speech recognition
2. **Intent Parser** - Extract player names, numbers, win/lose keywords
3. **Wake Word** - "小麻" activation (optional)
4. **Confirmation UI** - Show parsed intent, confirm before submitting

**Example commands:**
- "妈咪赢8分" → {player: "妈咪", delta: +8}
- "妈咪赢8分，皮皮输3分，修宝输5分" → Full round

**New files:**
```
voice/
├── speech.py         # Web Speech API wrapper
├── intent_parser.py
└── keywords.py
static/js/voice.js
```

**Design doc:** `docs/plans/2024-12-29-ai-image-calculator-design.md` (Section 8)

---

## Implementation Notes

**Milestone 1 (Phases 1-2):** UI Redesign + Data Model
- Delivers polished, professional UI
- Foundation ready for AI features

**Milestone 2 (Phases 3-4):** AI Calculator + Statistics
- Core AI functionality
- Rich win type tracking

**Milestone 3 (Phase 5):** Voice Control
- Hands-free operation
- Can be done independently after Milestone 1
