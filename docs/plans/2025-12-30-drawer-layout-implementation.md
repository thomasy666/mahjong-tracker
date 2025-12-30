# Drawer-Based Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the app from 3-column grid to focused main view with responsive drawer-based secondary features.

**Architecture:** Create a reusable Drawer component that renders as bottom sheet on mobile (<768px) and side drawer on desktop. Update App.tsx to show only Standings, ScoreInput, and DiceRoller in main view, with icon buttons triggering drawers for Stats, History, Players, and Settings.

**Tech Stack:** React, TypeScript, Tailwind CSS v4, existing component library

---

### Task 1: Create Drawer Component

**Files:**
- Create: `frontend/src/components/Drawer.tsx`

**Step 1: Create the Drawer component**

```tsx
import { useEffect, useRef } from 'react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Mobile: Bottom sheet */}
      <div
        ref={drawerRef}
        className="absolute bg-white md:hidden bottom-0 left-0 right-0 max-h-[70vh] rounded-t-2xl flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="w-12 h-1 bg-gray-300 rounded-full absolute top-2 left-1/2 -translate-x-1/2" />
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>

      {/* Desktop: Side drawer */}
      <div
        ref={drawerRef}
        className="absolute bg-white hidden md:flex right-0 top-0 bottom-0 w-[400px] flex-col shadow-xl"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}
```

**Step 2: Verify component renders**

Run: `cd /Users/yangx/Desktop/Learn/mahjong_tracker/frontend && npm run build`
Expected: Build succeeds with no TypeScript errors

**Step 3: Commit**

```bash
git add frontend/src/components/Drawer.tsx
git commit -m "feat: add responsive Drawer component"
```

---

### Task 2: Create Icon Button Component

**Files:**
- Create: `frontend/src/components/IconButton.tsx`

**Step 1: Create the IconButton component**

```tsx
interface IconButtonProps {
  icon: string
  label: string
  isActive?: boolean
  onClick: () => void
}

export function IconButton({ icon, label, isActive, onClick }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
        isActive ? 'bg-gray-200 text-black' : 'bg-white text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
    </button>
  )
}
```

**Step 2: Verify component renders**

Run: `cd /Users/yangx/Desktop/Learn/mahjong_tracker/frontend && npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add frontend/src/components/IconButton.tsx
git commit -m "feat: add IconButton component"
```

---

### Task 3: Update App.tsx Layout

**Files:**
- Modify: `frontend/src/App.tsx`

**Step 1: Replace App.tsx with new layout**

```tsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './i18n'
import { Standings } from './components/Standings'
import { ScoreInput } from './components/ScoreInput'
import { DiceRoller } from './components/DiceRoller'
import { RoundHistory } from './components/RoundHistory'
import { Statistics } from './components/Statistics'
import { PlayerManager } from './components/PlayerManager'
import { SessionManager } from './components/SessionManager'
import { SettingsPopup } from './components/Settings'
import { Drawer } from './components/Drawer'
import { IconButton } from './components/IconButton'

type DrawerType = 'stats' | 'history' | 'players' | 'settings' | null

function App() {
  const { t, i18n } = useTranslation()
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null)

  const toggleLang = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en'
    i18n.changeLanguage(newLang)
    localStorage.setItem('lang', newLang)
  }

  useEffect(() => {
    document.title = t('title')
  }, [i18n.language, t])

  const openDrawer = (drawer: DrawerType) => {
    setActiveDrawer(activeDrawer === drawer ? null : drawer)
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] p-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <div className="flex items-center gap-2">
            <button onClick={toggleLang} className="px-3 py-1 bg-white rounded-xl shadow-sm hover:bg-gray-50 text-sm">
              {i18n.language === 'en' ? '中文' : 'EN'}
            </button>
            <IconButton icon="📊" label={t('statistics')} isActive={activeDrawer === 'stats'} onClick={() => openDrawer('stats')} />
            <IconButton icon="📜" label={t('history')} isActive={activeDrawer === 'history'} onClick={() => openDrawer('history')} />
            <IconButton icon="👥" label={t('players')} isActive={activeDrawer === 'players'} onClick={() => openDrawer('players')} />
            <IconButton icon="⚙️" label={t('settings')} isActive={activeDrawer === 'settings'} onClick={() => openDrawer('settings')} />
          </div>
        </div>

        {/* Main View */}
        <div className="space-y-4">
          <Standings />
          <ScoreInput />
          <DiceRoller />
        </div>
      </div>

      {/* Drawers */}
      <Drawer isOpen={activeDrawer === 'stats'} onClose={() => setActiveDrawer(null)} title={t('statistics')}>
        <Statistics />
      </Drawer>
      <Drawer isOpen={activeDrawer === 'history'} onClose={() => setActiveDrawer(null)} title={t('history')}>
        <RoundHistory />
      </Drawer>
      <Drawer isOpen={activeDrawer === 'players'} onClose={() => setActiveDrawer(null)} title={t('players')}>
        <PlayerManager />
      </Drawer>
      <Drawer isOpen={activeDrawer === 'settings'} onClose={() => setActiveDrawer(null)} title={t('settings')}>
        <div className="space-y-4">
          <SessionManager />
          <SettingsPopup onClose={() => setActiveDrawer(null)} />
        </div>
      </Drawer>
    </div>
  )
}

export default App
```

**Step 2: Verify app runs**

Run: `cd /Users/yangx/Desktop/Learn/mahjong_tracker/frontend && npm run dev`
Expected: App loads with new layout, icons visible in header

**Step 3: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: update App.tsx to drawer-based layout"
```

---

### Task 4: Update Settings Component for Drawer

**Files:**
- Modify: `frontend/src/components/Settings.tsx`

**Step 1: Remove absolute positioning from SettingsPopup**

Change the outer div from absolute positioned popup to inline content:

```tsx
// In SettingsPopup, replace the outer div:
// FROM:
<div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg p-3 w-48 z-40">

// TO:
<div className="space-y-2">
```

Also remove the outer fragment and just return the content div with the buttons and modals.

**Step 2: Verify settings work in drawer**

Run: `cd /Users/yangx/Desktop/Learn/mahjong_tracker/frontend && npm run dev`
Expected: Settings drawer shows reset and change code buttons

**Step 3: Commit**

```bash
git add frontend/src/components/Settings.tsx
git commit -m "refactor: update Settings for drawer layout"
```

---

### Task 5: Update Secondary Components for Drawer Context

**Files:**
- Modify: `frontend/src/components/Statistics.tsx`
- Modify: `frontend/src/components/RoundHistory.tsx`
- Modify: `frontend/src/components/PlayerManager.tsx`
- Modify: `frontend/src/components/SessionManager.tsx`

**Step 1: Remove card wrapper from Statistics**

The Drawer already provides padding and background. Remove the outer card div:

```tsx
// In Statistics, change:
// FROM: <div className="bg-white rounded-lg shadow p-4">
// TO: <div>
// And remove the closing shadow div
```

**Step 2: Remove card wrapper from RoundHistory**

Same pattern - remove bg-white rounded-lg shadow p-4 wrapper.

**Step 3: Remove card wrapper from PlayerManager**

Same pattern.

**Step 4: Remove card wrapper from SessionManager**

Same pattern.

**Step 5: Verify all drawers render correctly**

Run: `cd /Users/yangx/Desktop/Learn/mahjong_tracker/frontend && npm run dev`
Expected: All drawer contents display without double backgrounds

**Step 6: Commit**

```bash
git add frontend/src/components/Statistics.tsx frontend/src/components/RoundHistory.tsx frontend/src/components/PlayerManager.tsx frontend/src/components/SessionManager.tsx
git commit -m "refactor: remove card wrappers from drawer components"
```

---

### Task 6: Add Mobile-Optimized Standings Layout

**Files:**
- Modify: `frontend/src/components/Standings.tsx`

**Step 1: Update Standings for responsive grid**

```tsx
// Replace the space-y-2 div with a responsive grid:
<div className="grid grid-cols-2 gap-2 md:grid-cols-1 md:space-y-2">
```

This shows 2x2 grid on mobile, single column on desktop.

**Step 2: Verify mobile layout**

Run: `cd /Users/yangx/Desktop/Learn/mahjong_tracker/frontend && npm run dev`
Expected: Standings shows 2x2 grid on narrow screens

**Step 3: Commit**

```bash
git add frontend/src/components/Standings.tsx
git commit -m "feat: add responsive grid layout to Standings"
```

---

### Task 7: Add Mobile-Optimized ScoreInput Layout

**Files:**
- Modify: `frontend/src/components/ScoreInput.tsx`

**Step 1: Update ScoreInput for vertical stacking on mobile**

The current layout already stacks vertically, which works well. No changes needed unless testing reveals issues.

**Step 2: Verify mobile layout**

Run: `cd /Users/yangx/Desktop/Learn/mahjong_tracker/frontend && npm run dev`
Expected: ScoreInput works well on mobile

**Step 3: Commit (if changes made)**

```bash
git add frontend/src/components/ScoreInput.tsx
git commit -m "feat: optimize ScoreInput for mobile"
```

---

### Task 8: Final Testing and Cleanup

**Step 1: Test all drawers on desktop**

- Click each icon, verify drawer opens from right
- Click backdrop, verify drawer closes
- Press ESC, verify drawer closes
- Click different icon, verify drawer switches

**Step 2: Test all drawers on mobile (use browser dev tools)**

- Resize to <768px width
- Click each icon, verify bottom sheet appears
- Tap backdrop, verify sheet closes
- Verify content scrolls within sheet

**Step 3: Test main functionality**

- Add scores, submit round
- Roll dice
- Check standings update
- View history in drawer
- View stats in drawer

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: drawer layout polish and fixes"
```

---

### Task 9: Apple-Inspired Color Consistency Pass

**Files:**
- Modify: `frontend/src/components/ScoreInput.tsx`
- Modify: `frontend/src/components/AdminModal.tsx`
- Modify: `frontend/src/components/RoundHistory.tsx`
- Modify: `frontend/src/components/Settings.tsx`
- Modify: `frontend/src/components/PlayerManager.tsx`
- Modify: `frontend/src/components/SessionManager.tsx`

**Color Reference:**
- Primary buttons (Submit, Create, Confirm): `bg-[#1C1C1E] text-white`
- Secondary buttons (Cancel, Balance): `bg-white border border-[#E5E5EA]`
- Destructive buttons (Delete, Reset): `bg-[#FF3B30] text-white`
- Positive scores: `#34C759`
- Negative scores: `#FF3B30`

**Step 1: Update ScoreInput recorder buttons**

```tsx
// Line 94: Change recorder selection buttons
// FROM: className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm"
// TO: className="px-3 py-1 bg-white border border-[#E5E5EA] rounded-lg hover:bg-gray-50 text-sm"
```

**Step 2: Update AdminModal confirm button**

```tsx
// Line 42: Change verify button
// FROM: className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
// TO: className="px-4 py-2 bg-[#1C1C1E] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
```

**Step 3: Update RoundHistory undo button**

```tsx
// Line 42: Change undo button (keep yellow as warning indicator, or use secondary)
// FROM: className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
// TO: className="px-2 py-1 bg-white border border-[#E5E5EA] text-gray-700 rounded-lg text-xs hover:bg-gray-50"
```

**Step 4: Update Settings save button**

```tsx
// Line 93: Change save button
// FROM: className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
// TO: className="px-4 py-2 bg-[#1C1C1E] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
```

**Step 5: Update PlayerManager add button**

```tsx
// Line 162: Change add player button
// FROM: className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
// TO: className="px-4 py-2 bg-[#1C1C1E] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
```

**Step 6: Update SessionManager buttons**

```tsx
// Line 76: Change new session button
// FROM: className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50 hover:bg-green-600"
// TO: className="px-4 py-2 bg-[#1C1C1E] text-white rounded-lg hover:opacity-90 disabled:opacity-50"

// Line 92: Change active session highlight
// FROM: s.is_active ? 'bg-cyan-50 border border-cyan-300' : 'bg-gray-50 hover:bg-gray-100'
// TO: s.is_active ? 'bg-gray-100 border border-gray-300' : 'bg-gray-50 hover:bg-gray-100'

// Line 142: Change load button
// FROM: className="px-3 py-1 bg-cyan-500 text-white text-sm rounded hover:bg-cyan-600"
// TO: className="px-3 py-1 bg-[#1C1C1E] text-white text-sm rounded-lg hover:opacity-90"
```

**Step 7: Verify all buttons updated**

Run: `cd /Users/yangx/Desktop/Learn/mahjong_tracker/frontend && grep -r "bg-blue-\|bg-green-\|bg-cyan-\|bg-yellow-" src/components/`
Expected: No matches (all colored buttons replaced)

**Step 8: Commit**

```bash
git add frontend/src/components/
git commit -m "style: apply Apple-inspired color consistency pass"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Create Drawer component | Drawer.tsx |
| 2 | Create IconButton component | IconButton.tsx |
| 3 | Update App.tsx layout | App.tsx |
| 4 | Update Settings for drawer | Settings.tsx |
| 5 | Remove card wrappers from drawer components | Statistics, RoundHistory, PlayerManager, SessionManager |
| 6 | Mobile-optimized Standings | Standings.tsx |
| 7 | Mobile-optimized ScoreInput | ScoreInput.tsx |
| 8 | Final testing and cleanup | - |
| 9 | Apple-inspired color consistency pass | ScoreInput, AdminModal, RoundHistory, Settings, PlayerManager, SessionManager |
