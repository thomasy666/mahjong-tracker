import { Standings } from './components/Standings'
import { ScoreInput } from './components/ScoreInput'
import { RoundHistory } from './components/RoundHistory'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">🀄 Mahjong Tracker</h1>
      <div className="max-w-4xl mx-auto grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <Standings />
          <ScoreInput />
        </div>
        <RoundHistory />
      </div>
    </div>
  )
}

export default App
