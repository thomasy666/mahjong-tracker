# Drawer-Based Layout Redesign

**Status:** Approved
**Created:** 2025-12-30

## Overview

Redesign the app layout from a 3-column grid to a focused main view with drawer-based secondary features. This improves mobile experience and creates better flow during gameplay.

## Main View

Always visible during play:

1. **Header bar** - App title on left, icon buttons on right
2. **Standings card** - Current scores, color-coded positive/negative
3. **ScoreInput card** - Input fields for each player, Submit/Balance buttons
4. **DiceRoller card** - 3D dice, Roll button, wall indicator

## Icon Bar

Header icons trigger drawers:

| Icon | Drawer | Contents |
|------|--------|----------|
| Stats | Statistics | Win rates, averages, best/worst |
| History | RoundHistory | All rounds in scrollable list |
| Players | PlayerManager | Add/remove/rename, colors/avatars |
| Settings | Settings | SessionManager + language + recorder lock + admin |

## Drawer Behavior

**Mobile (<768px):**
- Bottom sheet slides up from bottom
- Covers ~70% of screen height
- Drag handle at top, swipe down to dismiss
- Tap backdrop to dismiss

**Desktop (>=768px):**
- Side drawer slides in from right
- Fixed width ~400px
- Click backdrop or X button to close

**Shared:**
- Backdrop dims main view when drawer open
- Only one drawer open at a time
- ESC key closes drawer on desktop

## Mobile Layout

- Header: Compact title, icons right-aligned
- Standings: 2x2 grid or horizontal scroll for 4+ players
- ScoreInput: Stack inputs vertically (one per row)
- DiceRoller: Full width, dice centered
- Bottom sheet: Rounded top corners, drag handle, scrollable content

## Visual Diagram

```
+----------------------------------------------------------+
|  Mahjong Tracker              [Stats] [History] [Players] [Settings]
+----------------------------------------------------------+
|                                                          |
|  +----------------------------------------------------+  |
|  |              STANDINGS                             |  |
|  |   Alice: +45   Bob: -12   Carol: +8   Dan: -41    |  |
|  +----------------------------------------------------+  |
|                                                          |
|  +----------------------------------------------------+  |
|  |              SCORE INPUT                           |  |
|  |   [Alice: ___] [Bob: ___] [Carol: ___] [Dan: ___] |  |
|  |                  [ Submit ]                        |  |
|  +----------------------------------------------------+  |
|                                                          |
|  +----------------------------------------------------+  |
|  |              DICE ROLLER                           |  |
|  |         [dice] [dice]    Wall: East-3             |  |
|  |              [ Roll ]                              |  |
|  +----------------------------------------------------+  |
|                                                          |
+----------------------------------------------------------+
```

## Changes from Current

- Remove 3-column grid layout
- Move SessionManager, Statistics, RoundHistory, PlayerManager into drawers
- Consolidate Settings popup into Settings drawer
- Add responsive drawer/sheet component
