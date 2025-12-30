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
import { SettingsContent } from './components/Settings'
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
  }, [i18n.language])

  const openDrawer = (drawer: DrawerType) => {
    setActiveDrawer(activeDrawer === drawer ? null : drawer)
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] p-4">
      <div className="max-w-xl md:max-w-5xl lg:max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <div className="flex items-center gap-2">
            <button onClick={toggleLang} className="px-3 py-1 bg-white rounded-xl shadow-sm hover:bg-gray-50 text-sm" aria-label="Toggle language">
              {i18n.language === 'en' ? '中文' : 'EN'}
            </button>
            <IconButton icon="📊" label={t('statistics')} isActive={activeDrawer === 'stats'} onClick={() => openDrawer('stats')} />
            <IconButton icon="📜" label={t('history')} isActive={activeDrawer === 'history'} onClick={() => openDrawer('history')} />
            <IconButton icon="👥" label={t('players')} isActive={activeDrawer === 'players'} onClick={() => openDrawer('players')} />
            <IconButton icon="⚙️" label={t('settings')} isActive={activeDrawer === 'settings'} onClick={() => openDrawer('settings')} />
          </div>
        </div>

        {/* Main View */}
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          <div className="space-y-4">
            <Standings />
            <DiceRoller />
          </div>
          <ScoreInput />
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
          <SettingsContent onClose={() => setActiveDrawer(null)} />
        </div>
      </Drawer>
    </div>
  )
}

export default App
