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

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <button onClick={toggleLang} className="px-3 py-1 bg-white rounded shadow">
            {i18n.language === 'en' ? '中文' : 'EN'}
          </button>
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
