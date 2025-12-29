# UI Redesign: Clean Light Theme

## Overview

Redesign the Mahjong Tracker UI from a "vibe-coded" glassmorphism dark theme to a clean, professional light theme inspired by Apple, Google, and Notion.

## Design Principles

1. **Restraint with color** - One accent color (blue) for actions, green/red only for scores
2. **Clear hierarchy** - Primary info large, secondary info muted
3. **Flat, not glossy** - No gradients, no glows, subtle shadows only
4. **Consistency** - Same patterns everywhere

---

## Color Palette

| Element | Value |
|---------|-------|
| Background | `#f5f5f5` |
| Cards | `#ffffff` |
| Card border | `#e5e5e5` |
| Primary text | `#1a1a1a` |
| Secondary text | `#6b7280` |
| Accent (actions) | `#2563eb` |
| Positive scores | `#16a34a` |
| Negative scores | `#dc2626` |
| Input border | `#d1d5db` |
| Input focus | `#2563eb` |

---

## Typography

- Font: System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
- Remove Exo 2 custom font
- No text shadows or glows
- Muted text uses `#6b7280`, not opacity tricks

---

## Components

### Cards
```css
background: #ffffff;
border: 1px solid #e5e5e5;
border-radius: 12px;
box-shadow: 0 1px 3px rgba(0,0,0,0.08);
```

### Buttons
- Primary: Solid `#2563eb`, white text, no gradient
- Secondary: White background, gray border
- Danger: Solid `#dc2626`
- Hover: Slight darken, no transform/glow effects
- Border-radius: `8px` (not pill-shaped 30px)

### Inputs
```css
background: #ffffff;
border: 1px solid #d1d5db;
border-radius: 8px;
```
Focus state: Blue border, subtle blue ring

### Score Display
- Positive: `#16a34a` text, no glow
- Negative: `#dc2626` text, no glow

---

## Layout Changes

### Header
- Clean single row: Title + Settings gear + Language toggle
- Remove admin badge clutter
- Settings gear opens unified settings panel

### Main Content (Two Columns)
```
LEFT COLUMN                RIGHT COLUMN
┌─────────────────┐       ┌─────────────────┐
│ Record Round    │       │ Standings       │
│ (hero section)  │       │ (compact list)  │
└─────────────────┘       └─────────────────┘
┌─────────────────┐       ┌─────────────────┐
│ Dice Roller     │       │ Statistics      │
│ (compact)       │       │ (table)         │
└─────────────────┘       └─────────────────┘
┌─────────────────────────────────────────┐
│ Round History (full width, scrollable)  │
└─────────────────────────────────────────┘
              [End Game]
```

### Dice Roller
- Keep 3D dice animation
- Keep SVG table with wall-start indicator
- Reduce SVG size: 200px → 150px
- Tighter padding

### Settings Panel (Consolidated)
Move to single settings modal/drawer:
- Admin login/logout
- Change admin code
- Player management (add, rename, color, avatar, remove)
- Reset game

---

## Player Identity (Consistent Pattern)

Every player reference uses:
```
[Avatar 24px or colored initial] [Name in player color] [Score if shown]
```

Apply consistently in:
- Standings list
- Score input labels
- History table
- Statistics table

---

## Removals

- Glassmorphism blur effects
- Gradient backgrounds on buttons
- Text shadows and glows
- Magic wand auto-balance button (auto-fill silently instead)
- Multiple scattered modals (consolidate to settings)
- Uppercase text transforms on headers
- Letter-spacing effects

---

## Validation Box

Current: Glowing success/error box with magic wand button

New:
- Simple text below inputs
- Green text when sum = 0: "Ready to submit"
- Red text when sum ≠ 0: "Total must equal zero (currently +5)"
- No box, no glow, no button
- Auto-fill last empty field silently

---

## End Game Modal

- Keep podium visualization
- Keep confetti animation
- Update colors to match light theme
- Smaller trigger button, centered at bottom

---

## Implementation Order

1. Replace CSS variables with light theme palette
2. Remove all glow/gradient/blur effects
3. Update button styles to flat design
4. Update card styles
5. Consolidate modals into settings panel
6. Apply consistent player identity pattern
7. Simplify validation UI
8. Resize dice roller
9. Test and polish
