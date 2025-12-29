import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './i18n'
import { Standings } from './components/Standings'
import { ScoreInput } from './components/ScoreInput'
import { RoundHistory } from './components/RoundHistory'
import { Statistics } from './components/Statistics'
import { PlayerManager } from './components/PlayerManager'
import { DiceRoller } from './components/DiceRoller'

function App() {
  const { t, i18n } = useTranslation()
  const [tab, setTab] = useState<'game' | 'stats' | 'players' | 'dice'>('game')

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <button onClick={toggleLang} className="px-3 py-1 bg-white rounded shadow">
            {i18n.language === 'en' ? '中文' : 'EN'}
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(['game', 'stats', 'players', 'dice'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded ${tab === t ? 'bg-blue-600 text-white' : 'bg-white'}`}
            >
              {t === 'game' ? '🎮' : t === 'stats' ? '📊' : t === 'players' ? '👥' : '🎲'}
            </button>
          ))}
        </div>

        {tab === 'game' && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <Standings />
              <ScoreInput />
            </div>
            <RoundHistory />
          </div>
        )}

        {tab === 'stats' && <Statistics />}
        {tab === 'players' && <PlayerManager />}
        {tab === 'dice' && <DiceRoller />}
      </div>
    </div>
  )
}

export default App
