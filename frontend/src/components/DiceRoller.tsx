import { useState } from 'react'

export function DiceRoller() {
  const [dice, setDice] = useState([1, 1])
  const [rolling, setRolling] = useState(false)

  const roll = () => {
    setRolling(true)
    let count = 0
    const interval = setInterval(() => {
      setDice([Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)])
      count++
      if (count > 10) {
        clearInterval(interval)
        setRolling(false)
      }
    }, 100)
  }

  const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <h2 className="text-xl font-bold mb-4">Dice Roller</h2>
      <div className="flex justify-center gap-4 mb-4">
        {dice.map((d, i) => (
          <span
            key={i}
            className={`text-6xl ${rolling ? 'animate-bounce' : ''}`}
          >
            {faces[d - 1]}
          </span>
        ))}
      </div>
      <p className="text-2xl font-bold mb-4">Total: {dice[0] + dice[1]}</p>
      <button
        onClick={roll}
        disabled={rolling}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg text-lg disabled:opacity-50"
      >
        🎲 Roll
      </button>
    </div>
  )
}
