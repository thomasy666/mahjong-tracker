# AI Image Point Calculator Design

**Status:** Draft - In Progress
**Created:** 2024-12-29
**Last Updated:** 2024-12-29

---

## 1. Overview & Goals

**Purpose:** Allow players to photograph a winning hand and have AI automatically calculate the score based on custom Mahjong rules.

**Goals:**
- Reduce manual score calculation errors
- Speed up game flow (no mental math needed)
- Support custom 血战到底 (xuezhandaodi) variant rules
- Be extensible for adding new scoring patterns later

**User Flow:**
1. Player wins a hand
2. Player takes photo of winning hand (14 tiles + exposed melds + flowers laid flat)
3. AI identifies all tiles in the image
4. AI calculates score based on custom rules
5. Score is suggested in the "Record Round" form
6. Player confirms or adjusts, then submits

**Scope for v1:**
- Single winning hand per photo
- Tiles must be laid flat and reasonably visible
- Manual input for: who won, self-draw vs discard, replacement tile win (fan)
- AI handles: tile recognition, pattern detection, score calculation

---

## 2. Custom Mahjong Rules Reference

### 2.1 Basic Requirements
- **缺一门 (Missing One Suit):** To win, hand must be missing one of the three suits (条/tiao, 筒/tong, or 万/wan)
- **Player Count:** 3-4 players (variable)
- **Game Variant:** 血战到底 - game continues after someone wins until only one player remains

### 2.2 Scoring System

#### Base Hand Values (Additive)
| Pattern | Chinese | Points | Description |
|---------|---------|--------|-------------|
| Basic Win | 基本胡 | 1 | Valid winning hand with no special patterns |
| Pure One Suit | 清一色 | 3 | All tiles from single suit (no honors) |
| Seven Pairs | 七对子 | 3 | Seven pairs |
| All Pongs | 碰碰胡 | 1 | All pongs/kongs, no chows |
| Single Wait | 大吊车 | 1 | Holding ONE tile, all melds exposed (pong/chi/kong), waiting for pair |
| Mixed One Suit | 混一色 | 1 | One suit + honor tiles |
| Last Tile of Wall | 海底捞月 | 1 | Winning on the last drawable tile |

*Note: Patterns are additive (they stack)*

**Important clarification on 大吊车:**
- Requires ALL melds to be EXPOSED on the table (pong, chi, or kong)
- You are literally holding only ONE tile in your hand
- Waiting for that single tile to complete your pair
- Does NOT apply if you have concealed melds in hand

#### Flat Bonuses (Not Multiplied by Fan)
| Bonus | Points | Description |
|-------|--------|-------------|
| Each Flower | 1 | Flowers are flat points |
| Each Kong | 1 | All kong types (明杠/暗杠/加杠) worth same |
| Self-Draw | 1 | 自摸 adds 1 point |

#### Fan System (2x Multiplier)
Fan doubles the hand value (excluding flowers). Fan is earned when:
- 杠上花 - Self-draw win on kong replacement tile
- 杠上炮 - Win on discard that was drawn as kong replacement
- Self-draw win on flower replacement tile
- Win on discard that was drawn as flower replacement tile

**Formula:** `Total = (Base Hand + Kongs + Self-Draw Bonus) × 2^fan + Flowers`

### 2.3 Example Calculations

**Example 1: Simple discard win**
```
Hand: 1-2-3万, 4-5-6万, 7-8-9万, East Wind pong, Red Dragon pair
Win: Discard (dianpao), 2 flowers, no replacement tile

Patterns: Basic (1) + 混一色 (1) = 2
Bonuses: Kong (0) + Self-draw (0) = 0
Fan: 0 (no replacement tile)
Flowers: 2

Calculation: (2 + 0 + 0) × 2^0 + 2 = 2 × 1 + 2 = 4 points
Payment: Discarder pays 4 to winner
```

**Example 2: Self-draw with kong and fan**
```
Hand: 8-Bamboo kong, 2-3-4 Bamboo, 5-6-7 Bamboo, Green Dragon pong, 1-Bamboo pair
Win: Self-draw on kong replacement tile (杠上花), 1 flower, 2 other players

Patterns: Basic (1) + 混一色 (1) = 2
Bonuses: Kong (1) + Self-draw (1) = 2
Fan: 1 (杠上花)
Flowers: 1

Calculation: (2 + 1 + 1) × 2^1 + 1 = 4 × 2 + 1 = 9 points per player
Payment: Each of 2 players pays 9, winner receives 18 total
```

**Example 3: Invalid hand (fails 缺一门)**
```
Hand: 2-3-4 Bamboo, 5-6-7 Dots, 1-2-3 Characters, 9-9-9 Characters, Red Dragon pair

INVALID - Contains all three suits (Bamboo, Dots, Characters)
Must be missing at least one suit to win
```

### 2.4 Win Conditions

#### Discard Win Requirements
- Hand must be worth more than 1 point (excluding flowers)
- Flowers only count toward minimum if you have more than 4

#### Multiple Winners (一炮多响)
- Multiple players can win on the same discard
- Discarder pays all winners (点炮 for each)

### 2.5 Payment Structure
- **Self-Draw (自摸):** All other players pay the winner
- **Discard Win (放炮):** Only the discarder pays

### 2.6 Draw Rules (流局)
- If all players are 下叫 (ready/waiting): tie, no payment
- If you're NOT 下叫 but others are: you pay them what they would've won
- 下叫 = valid waiting hand (1 tile away from winning)
- Penalty calculated as if they self-drew

### 2.7 Honor Tiles
- Winds (东南西北) and Dragons (中发白) exist
- No special scoring for honor tiles

### 2.8 Other Rules
- No maximum score cap (封顶)
- No 天胡, 地胡, or 十三幺
- 血战到底: After winning, player sits out, remaining players continue
- All wins in a round combined into one score entry

---

## 3. Technical Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Browser)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Camera/     │  │ Score       │  │ Manual Override     │  │
│  │ Upload UI   │  │ Display     │  │ Controls            │  │
│  └──────┬──────┘  └──────▲──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼───────────────────┼──────────────┘
          │                │                   │
          ▼                │                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Flask)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Image       │  │ Score       │  │ AI Provider         │  │
│  │ Handler     │──▶ Calculator  │◀─│ Abstraction Layer   │  │
│  └─────────────┘  └─────────────┘  └──────────┬──────────┘  │
└────────────────────────────────────────────────┼────────────┘
                                                 │
                    ┌────────────────────────────┼────────────┐
                    │                            │            │
                    ▼                            ▼            ▼
            ┌──────────────┐            ┌──────────────┐  ┌───────┐
            │ DeepSeek API │            │ Claude API   │  │ More  │
            │ (Free)       │            │ (Paid)       │  │ ...   │
            └──────────────┘            └──────────────┘  └───────┘
```

### 3.2 Multi-Provider AI Support

The system supports multiple AI vision providers through an abstraction layer:

**Supported Providers:**
| Provider | Model | Cost | Notes |
|----------|-------|------|-------|
| DeepSeek | deepseek-chat (vision) | Free | Default, good for most cases |
| Claude | claude-3-5-sonnet | ~$0.01/image | Higher accuracy fallback |

**Provider Selection Logic:**
1. User can set preferred provider in settings
2. Default to DeepSeek (free)
3. Automatic fallback to Claude if DeepSeek fails
4. Manual override available per request

### 3.3 Configuration

```python
# config.py (example structure)
AI_PROVIDERS = {
    'deepseek': {
        'api_url': 'https://api.deepseek.com/v1/chat/completions',
        'model': 'deepseek-chat',
        'api_key_env': 'DEEPSEEK_API_KEY',
        'priority': 1  # Primary
    },
    'claude': {
        'api_url': 'https://api.anthropic.com/v1/messages',
        'model': 'claude-3-5-sonnet-20241022',
        'api_key_env': 'ANTHROPIC_API_KEY',
        'priority': 2  # Fallback
    }
}

DEFAULT_PROVIDER = 'deepseek'
```

### 3.4 New Files Structure

```
mahjong_tracker/
├── app.py                 # Existing - add new routes
├── tracker.py             # Existing
├── translations.py        # Existing - add new strings
├── ai/                    # NEW - AI module
│   ├── __init__.py
│   ├── providers.py       # AI provider abstraction
│   ├── tile_recognition.py # Tile detection logic
│   └── prompts.py         # AI prompts for tile recognition
├── scoring/               # NEW - Scoring engine
│   ├── __init__.py
│   ├── rules.py           # Scoring rules configuration
│   ├── calculator.py      # Score calculation logic
│   └── patterns.py        # Pattern detection
├── config.py              # NEW - Configuration
└── templates/
    └── index.html         # Existing - add camera UI
```

---

## 4. AI Tile Recognition

### 4.1 Approach

Use vision-capable LLMs to identify Mahjong tiles from photos. The AI receives:
1. The image of the winning hand
2. A structured prompt asking for tile identification
3. Context about what to look for (suits, honors, flowers)

### 4.2 AI Prompt Strategy

```
System: You are a Mahjong tile recognition assistant. Analyze the image and identify all visible Mahjong tiles.

User: [Image attached]
Please identify all Mahjong tiles in this image. Return a JSON response with:
{
  "hand_tiles": ["1wan", "1wan", "1wan", "2wan", "3wan", ...],
  "exposed_melds": [
    {"type": "pong", "tiles": ["5tong", "5tong", "5tong"]},
    {"type": "kong", "tiles": ["9tiao", "9tiao", "9tiao", "9tiao"]}
  ],
  "flowers": ["spring", "summer", ...],
  "confidence": 0.95,
  "notes": "Any uncertainty or issues"
}

Tile naming convention:
- Suits: 1-9 followed by wan/tong/tiao (e.g., "1wan", "5tong", "9tiao")
- Winds: dong/nan/xi/bei
- Dragons: zhong/fa/bai
- Flowers: spring/summer/autumn/winter/plum/orchid/bamboo/chrysanthemum
```

### 4.3 Response Parsing

The backend parses the AI response and validates:
- All tiles are valid Mahjong tiles
- Hand structure makes sense (correct tile counts)
- Melds are valid (3 for pong/chow, 4 for kong)

### 4.4 Error Handling

| Scenario | Handling |
|----------|----------|
| AI can't identify tiles | Return error, ask user to retake photo |
| Low confidence (<0.7) | Show warning, allow manual correction |
| Invalid tile combination | Highlight issue, allow manual fix |
| API failure | Try fallback provider, then show error |

---

## 5. Score Calculation Engine

### 5.1 Calculation Flow

```
Tile Data (from AI) + User Input (self-draw, fan, etc.)
                    │
                    ▼
        ┌───────────────────────┐
        │ Pattern Detection     │
        │ - Check 清一色        │
        │ - Check 七对子        │
        │ - Check 碰碰胡        │
        │ - Check 混一色        │
        │ - Check 大吊车        │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Base Score Calc       │
        │ - Sum pattern points  │
        │ - Add kong points     │
        │ - Add self-draw bonus │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Apply Fan Multiplier  │
        │ - If replacement win  │
        │ - Multiply by 2^fan   │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Add Flowers           │
        │ - Flat addition       │
        └───────────┬───────────┘
                    │
                    ▼
            Final Score
```

### 5.2 Extensible Rules Configuration

```python
# scoring/rules.py (example structure)
SCORING_RULES = {
    'patterns': {
        'qingyise': {
            'name_zh': '清一色',
            'name_en': 'Pure One Suit',
            'points': 3,
            'detector': 'detect_pure_suit'
        },
        'qiduizi': {
            'name_zh': '七对子',
            'name_en': 'Seven Pairs',
            'points': 3,
            'detector': 'detect_seven_pairs'
        },
        'pengpenghu': {
            'name_zh': '碰碰胡',
            'name_en': 'All Pongs',
            'points': 1,
            'detector': 'detect_all_pongs'
        },
        # ... more patterns
    },
    'bonuses': {
        'self_draw': 1,
        'flower': 1,
        'kong': 1,
        'last_tile': 1
    },
    'fan_multiplier': 2,
    'base_win': 1
}
```

### 5.3 Pattern Detection Functions

Each pattern has a detector function that takes the tile data and returns True/False:

```python
def detect_pure_suit(hand_tiles, exposed_melds):
    """Check if all tiles are from a single suit (no honors)"""
    # Implementation

def detect_seven_pairs(hand_tiles, exposed_melds):
    """Check if hand is 7 pairs (no exposed melds)"""
    # Implementation

def detect_all_pongs(hand_tiles, exposed_melds):
    """Check if all melds are pongs/kongs (no chows)"""
    # Implementation
```

### 5.4 Adding New Patterns

To add a new scoring pattern:
1. Add entry to `SCORING_RULES['patterns']`
2. Implement detector function in `patterns.py`
3. Pattern automatically included in calculation

---

## 6. User Interface

### 6.1 New UI Components

**Camera/Upload Button** (in Record Round section):
```
┌─────────────────────────────────────────┐
│  📷 Scan Winning Hand                   │
│  ─────────────────────────────────────  │
│  [Take Photo]  [Upload Image]           │
└─────────────────────────────────────────┘
```

**Score Result Modal** (after AI analysis):
```
┌─────────────────────────────────────────┐
│  🀄 Score Calculation                   │
│  ─────────────────────────────────────  │
│                                         │
│  Detected Tiles:                        │
│  [1万][1万][1万][2万][3万]...           │
│                                         │
│  Patterns Found:                        │
│  ✓ 清一色 (+3)                          │
│  ✓ 碰碰胡 (+1)                          │
│                                         │
│  Bonuses:                               │
│  ☐ Self-Draw (+1)                       │
│  ☐ Replacement Tile Win (×2)            │
│  Flowers: 2 (+2)                        │
│  Kongs: 1 (+1)                          │
│                                         │
│  ─────────────────────────────────────  │
│  Base: 5  ×  Fan: 1  +  Flowers: 2      │
│  TOTAL: 7 points                        │
│                                         │
│  [Edit Tiles]  [Confirm & Fill Score]   │
└─────────────────────────────────────────┘
```

### 6.2 User Flow

1. User clicks "📷 Scan Winning Hand" button
2. Camera opens (or file picker on desktop)
3. User takes/selects photo
4. Loading spinner while AI processes
5. Score Result Modal appears with:
   - Detected tiles (visual representation)
   - Identified patterns
   - Checkboxes for manual inputs (self-draw, fan)
   - Calculated score
6. User can:
   - Edit tiles if AI made mistakes
   - Toggle self-draw/fan options
   - Confirm to auto-fill the score form
7. Score is filled into the appropriate player's input field

### 6.3 Settings Addition

Add to Settings modal:
```
┌─────────────────────────────────────────┐
│  AI Provider                            │
│  ○ DeepSeek (Free)                      │
│  ○ Claude (Paid, higher accuracy)       │
│                                         │
│  API Keys:                              │
│  DeepSeek: [••••••••••] [Save]          │
│  Claude:   [••••••••••] [Save]          │
└─────────────────────────────────────────┘
```

---

## 7. Win Type Tracking & Enhanced Statistics

### 7.1 Overview

When the AI calculates a score, it already identifies the winning patterns. Store this data to enable richer statistics.

### 7.2 Data Model Changes

**Current round structure:**
```python
{
    "id": 1,
    "deltas": {"妈咪": 8, "皮皮": -8, "修宝": 0},
    "recorder": "修宝"
}
```

**Enhanced round structure:**
```python
{
    "id": 1,
    "deltas": {"妈咪": 8, "皮皮": -8, "修宝": 0},
    "recorder": "修宝",
    "win_details": {
        "winner": "妈咪",
        "win_types": ["清一色", "碰碰胡"],  # Multiple patterns can stack
        "method": "self_draw",  # or "discard"
        "fan": 0,
        "flowers": 2,
        "kongs": 1
    }
}
```

**Notes:**
- `win_details` is optional - rounds without it just show scores
- `win_types` is an array (hands can have multiple patterns)
- Photo entry auto-populates `win_details`
- Manual entry can optionally add `win_details` via dropdown

### 7.3 Manual Entry (Optional Win Type)

Add collapsible "Win Details" section to score entry form:

```
┌─────────────────────────────────────────┐
│  Record Round                           │
│  ─────────────────────────────────────  │
│  [Score inputs as usual]                │
│                                         │
│  ▶ Win Details (optional)               │  ← Collapsed by default
└─────────────────────────────────────────┘

Expanded:
┌─────────────────────────────────────────┐
│  ▼ Win Details (optional)               │
│  ─────────────────────────────────────  │
│  Winner: [Dropdown: 妈咪/修宝/皮皮]     │
│  Patterns: [Multi-select dropdown]      │
│    ☐ 清一色  ☐ 七对子  ☐ 碰碰胡        │
│    ☐ 混一色  ☐ 大吊车  ☐ 海底捞月      │
│  Method: ○ Self-draw  ○ Discard         │
└─────────────────────────────────────────┘
```

### 7.4 Statistics Integration

Add "Top Pattern" column to existing statistics table:

| Player | Win Rate | Rounds | Best | Worst | Avg | Top Pattern |
|--------|----------|--------|------|-------|-----|-------------|
| 妈咪🦄 | 45% | 12 | +24 | -8 | +2.3 | 清一色 (4) |
| 修宝🦦 | 38% | 12 | +16 | -12 | +1.9 | 七对子 (3) |
| 皮皮🐖 | 17% | 12 | +8 | -24 | -4.2 | - |

**Top Pattern logic:**
- Shows most frequent win type for that player
- Number in parentheses = count
- "-" if no win type data recorded

### 7.5 Expanded Stats (Tap to View)

Tapping a player row expands to show full pattern breakdown:

```
┌─────────────────────────────────────────┐
│  妈咪🦄 - Win Pattern Breakdown         │
│  ─────────────────────────────────────  │
│  清一色     ████████░░  4 wins (33%)    │
│  碰碰胡     ████░░░░░░  2 wins (17%)    │
│  七对子     ██░░░░░░░░  1 win  (8%)     │
│  Basic only ████████████ 5 wins (42%)   │
│  ─────────────────────────────────────  │
│  Self-draw rate: 58%                    │
│  Avg patterns per win: 1.4              │
└─────────────────────────────────────────┘
```

### 7.6 History Table Enhancement

Optionally show win type in history:

| # | Recorder | 妈咪 | 修宝 | 皮皮 | Win Type |
|---|----------|------|------|------|----------|
| 5 | 修宝 | +8 | -3 | -5 | 清一色 🀄 |
| 4 | 妈咪 | -6 | +6 | - | 七对子 |
| 3 | 皮皮 | +4 | -4 | - | - |

---

## 8. Future Features (Backlog)

### Data & Analytics
- Export game data (CSV/JSON)
- Advanced charts/graphs
- Player performance trends over time

### AI Chat Interface
- Conversational queries about game history
- Statistics explanations
- Game summaries

### Voice Control
- Hands-free score input
- Voice commands for common actions

---

## Appendix: Extensibility

The scoring system should be designed to allow easy addition of new patterns. Consider:
- Configuration file for scoring rules
- Pattern definitions separate from calculation logic
- Admin interface for adding/modifying patterns

---

## 8. Voice Control Design

**Status:** Draft
**Added:** 2024-12-29

### 8.1 Overview & Scope

**Purpose:** Enable hands-free score recording and quick actions via voice commands in Mandarin Chinese.

**Goals:**
- Record scores without touching the device (hands may be holding tiles)
- Speed up game flow with natural language input
- Support full round recording in a single utterance

**Scope for v1:**
- Score recording (single player or full round)
- Quick actions: dice roll
- Mandarin Chinese (zh-CN) primary, English secondary
- Push-to-talk AND wake word activation

**Out of Scope for v1:**
- Voice queries ("what's my score?")
- Complex game state questions

### 8.2 Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Browser)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Microphone  │  │ Wake Word   │  │ Web Speech API      │  │
│  │ Button      │  │ Detector    │  │ (SpeechRecognition) │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┴─────────────────────┘             │
│                          │                                   │
│                          ▼                                   │
│              ┌───────────────────────┐                       │
│              │ Voice Confirmation UI │                       │
│              └───────────┬───────────┘                       │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Flask)                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Intent Parser                                        │    │
│  │ - Extract player names (fuzzy match)                 │    │
│  │ - Extract numbers (Chinese/Arabic)                   │    │
│  │ - Detect win/lose keywords                           │    │
│  │ - Handle multiple players per utterance              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Technology Choice:**
- Primary: Web Speech API (browser-native, no cost)
- Future: Cloud speech fallback for better accuracy

### 8.3 Intent Parsing & Score Recording

**Score Recording Formats:**
```
Simple:        "妈咪赢了8分" → {player: "妈咪", delta: +8}
With context:  "皮皮自摸12分" → {player: "皮皮", delta: +12, type: "zimo"}
Multiple:      "妈咪赢8分，皮皮输8分" → [{player: "妈咪", delta: +8}, {player: "皮皮", delta: -8}]
Full round:    "妈咪赢8分，修宝输3分，皮皮输5分" → auto-balance 4th player
```

**Intent Parser Logic:**
1. Extract player names (fuzzy match against registered players)
2. Extract numbers (Chinese numerals: 一二三... or Arabic: 1,2,3...)
3. Detect win/lose keywords: 赢/胡/自摸 = positive, 输/点炮 = negative
4. Handle multiple players in one utterance (split on 和/，)

**Keywords (Extensible):**
```python
WIN_KEYWORDS = ['赢', '胡', '自摸', '赢了']
LOSE_KEYWORDS = ['输', '点炮', '输了']
# More keywords can be added as needed
```

**Quick Actions:**
```
"掷骰子" / "roll dice" → trigger dice roll
```

**Fuzzy Matching:**
- Player names matched with tolerance for speech recognition errors
- "妈咪" matches "妈咪🦄" (ignores emoji suffix)
- Numbers: "八" = "8", "十二" = "12"

### 8.4 Activation Methods

**Push-to-Talk:**
- Hold microphone button to speak
- Release to process

**Wake Word:**
- Configurable in settings (default: "小麻")
- Always listening for wake word when enabled
- After wake word detected, listen for command

### 8.5 UI Components

**Microphone Button** (in Record Round section):
```
┌─────────────────────────────────────────┐
│  🎤 Voice Input                         │
│  ─────────────────────────────────────  │
│  [Hold to Speak]  or  Say "小麻" first  │
│                                         │
│  Status: Ready / Listening... / ✓ Got it│
└─────────────────────────────────────────┘
```

**Voice Confirmation Card** (appears after speech recognized):
```
┌─────────────────────────────────────────┐
│  Heard: "妈咪赢8分，修宝输3分，皮皮输5分" │
│                                         │
│  Parsed:                                │
│  妈咪🦄  →  +8                          │
│  修宝🦦  →  -3                          │
│  皮皮🐖  →  -5                          │
│  (4th player auto-balanced)             │
│                                         │
│  [✓ Confirm]  [✗ Cancel]  [🔄 Retry]    │
└─────────────────────────────────────────┘
```

**Settings Addition:**
```
┌─────────────────────────────────────────┐
│  Voice Control                          │
│  ─────────────────────────────────────  │
│  ☑ Enable Voice Input                   │
│  Wake Word: [小麻______] (configurable) │
│  Language: ○ 中文  ○ English            │
└─────────────────────────────────────────┘
```

### 8.6 Implementation Notes

**New Files:**
```
mahjong_tracker/
├── voice/                    # NEW - Voice module
│   ├── __init__.py
│   ├── speech.py            # Web Speech API wrapper
│   ├── intent_parser.py     # Parse speech → structured data
│   └── keywords.py          # Extensible keyword definitions
├── static/
│   └── js/
│       └── voice.js         # Frontend voice handling
└── templates/
    └── index.html           # Add voice UI components
```

**Browser Compatibility:**
- Web Speech API: Chrome, Edge, Safari (good coverage)
- Fallback: Show "Voice not supported" message on Firefox/older browsers

**Privacy:**
- Audio processed locally via browser API
- No audio sent to server (only parsed text/intent)
- Wake word detection runs client-side
