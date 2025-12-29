import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './i18n'
import { Standings } from './components/Standings'
import { ScoreInput } from './components/ScoreInput'
import { RoundHistory } from './components/RoundHistory'
import { Statistics } from './components/Statistics'
import { PlayerManager } from './components/PlayerManager'
import { DiceRoller } from './components/DiceRoller'
import { SettingsPopup } from './components/Settings'

function App() {
  const { t, i18n } = useTranslation()
  const [showSettings, setShowSettings] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  const toggleLang = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en'
    i18n.changeLanguage(newLang)
    localStorage.setItem('lang', newLang)
  }

  useEffect(() => {
    document.title = t('title')
  }, [i18n.language, t])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false)
      }
    }
    if (showSettings) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSettings])

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <div className="flex items-center gap-2">
            <button onClick={toggleLang} className="px-3 py-1 bg-white rounded shadow hover:bg-gray-50">
              {i18n.language === 'en' ? '中文' : 'EN'}
            </button>
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-8 h-8 bg-white rounded shadow hover:bg-gray-50 flex items-center justify-center"
              >
                ⚙️
              </button>
              {showSettings && <SettingsPopup onClose={() => setShowSettings(false)} />}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-4">
            <Standings />
            <ScoreInput />
            <PlayerManager />
          </div>

          {/* Middle Column */}
          <div className="space-y-4">
            <DiceRoller />
            <Statistics />
          </div>

          {/* Right Column */}
          <div>
            <RoundHistory />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
