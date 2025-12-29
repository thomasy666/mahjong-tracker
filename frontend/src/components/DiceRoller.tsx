import { useState, useEffect, useRef } from 'react'

const ROTATIONS: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: 0, y: 180 },
  4: { x: 0, y: 90 },
  5: { x: -90, y: 0 },
  6: { x: 90, y: 0 },
}

const DIRECTIONS = ['Self', 'Right', 'Across', 'Left']

function Pip({ row, col, red, big }: { row: number; col: number; red?: boolean; big?: boolean }) {
  return (
    <div
      className={`rounded-full ${red ? 'bg-red-500' : 'bg-gray-800'}`}
      style={{
        gridRow: row,
        gridColumn: col,
        width: big ? 18 : 10,
        height: big ? 18 : 10,
        alignSelf: 'center',
        justifySelf: 'center',
        boxShadow: red ? '0 0 5px #ef4444' : 'inset 0 0 2px rgba(0,0,0,0.5)',
      }}
    />
  )
}

function DieFace({ value }: { value: number }) {
  const pips: JSX.Element[] = []
  if (value === 1) pips.push(<Pip key="1" row={2} col={2} red big />)
  if (value === 2) { pips.push(<Pip key="1" row={1} col={3} />); pips.push(<Pip key="2" row={3} col={1} />) }
  if (value === 3) { pips.push(<Pip key="1" row={1} col={3} />); pips.push(<Pip key="2" row={2} col={2} />); pips.push(<Pip key="3" row={3} col={1} />) }
  if (value === 4) { pips.push(<Pip key="1" row={1} col={1} red />); pips.push(<Pip key="2" row={1} col={3} red />); pips.push(<Pip key="3" row={3} col={1} red />); pips.push(<Pip key="4" row={3} col={3} red />) }
  if (value === 5) { pips.push(<Pip key="1" row={1} col={1} />); pips.push(<Pip key="2" row={1} col={3} />); pips.push(<Pip key="3" row={2} col={2} />); pips.push(<Pip key="4" row={3} col={1} />); pips.push(<Pip key="5" row={3} col={3} />) }
  if (value === 6) { pips.push(<Pip key="1" row={1} col={1} />); pips.push(<Pip key="2" row={1} col={3} />); pips.push(<Pip key="3" row={2} col={1} />); pips.push(<Pip key="4" row={2} col={3} />); pips.push(<Pip key="5" row={3} col={1} />); pips.push(<Pip key="6" row={3} col={3} />) }
  return (
    <div className="absolute w-[60px] h-[60px] bg-gray-100 rounded-lg border border-gray-200 grid grid-cols-3 grid-rows-3 p-1 gap-0.5" style={{ backfaceVisibility: 'hidden' }}>
      {pips}
    </div>
  )
}

function Cube({ rotation, value }: { rotation: { x: number; y: number }; value: number }) {
  const faces = [1, 2, 3, 4, 5, 6]
  const transforms = [
    'rotateY(0deg) translateZ(30px)',
    'rotateY(90deg) translateZ(30px)',
    'rotateY(180deg) translateZ(30px)',
    'rotateY(-90deg) translateZ(30px)',
    'rotateX(90deg) translateZ(30px)',
    'rotateX(-90deg) translateZ(30px)',
  ]
  return (
    <div className="w-[60px] h-[60px]" style={{ perspective: 600 }}>
      <div
        className="w-full h-full relative"
        style={{
          transformStyle: 'preserve-3d',
          transform: `translateZ(-30px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: 'transform 1.5s ease-out',
        }}
      >
        {faces.map((f, i) => (
          <div key={f} className="absolute w-[60px] h-[60px]" style={{ transform: transforms[i] }}>
            <DieFace value={f} />
          </div>
        ))}
      </div>
    </div>
  )
}

function MahjongTable({ activeWall, cutPosition }: { activeWall: number | null; cutPosition: number }) {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="rounded-full" style={{ background: 'rgba(0,0,0,0.2)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
      <text x="100" y="105" textAnchor="middle" fill="#aaa" fontSize="12" opacity="0.5" fontWeight="bold">Table</text>
      {DIRECTIONS.map((dir, i) => {
        const transforms = [
          'translate(100, 170)',
          'translate(170, 100) rotate(90)',
          'translate(100, 30) rotate(180)',
          'translate(30, 100) rotate(-90)',
        ]
        const isActive = activeWall === i
        return (
          <g key={i} transform={transforms[i]}>
            <rect x="-60" y="-8" width="120" height="16" rx="2" fill={isActive ? '#34495e' : '#444'} stroke={isActive ? '#00c6ff' : '#666'} strokeWidth={isActive ? 2 : 1} />
            <text x="0" y="4" textAnchor="middle" fill={isActive ? '#00c6ff' : '#fff'} fontSize="9">{dir}</text>
            {isActive && (
              <>
                <polygon points={`${i % 2 === 0 ? 60 - cutPosition * 7 : -60 + cutPosition * 7},${i === 1 || i === 3 ? 10 : -10} ${i % 2 === 0 ? 55 - cutPosition * 7 : -55 + cutPosition * 7},${i === 1 || i === 3 ? 18 : -18} ${i % 2 === 0 ? 65 - cutPosition * 7 : -65 + cutPosition * 7},${i === 1 || i === 3 ? 18 : -18}`} fill="#FFD700" />
                <text x={i % 2 === 0 ? 60 - cutPosition * 7 : -60 + cutPosition * 7} y={i === 1 || i === 3 ? 35 : -25} textAnchor="middle" fill="#FFD700" fontSize="14" fontWeight="bold">{cutPosition}</text>
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function DiceRoller() {
  const [dice, setDice] = useState([1, 1])
  const [rotations, setRotations] = useState([{ x: 0, y: 0 }, { x: 0, y: 0 }])
  const [rolling, setRolling] = useState(false)
  const [activeWall, setActiveWall] = useState<number | null>(null)
  const totalSpins = useRef([{ x: 0, y: 0 }, { x: 0, y: 0 }])

  const roll = () => {
    setRolling(true)
    setActiveWall(null)

    const v1 = Math.ceil(Math.random() * 6)
    const v2 = Math.ceil(Math.random() * 6)
    const sum = v1 + v2

    const newRotations = [v1, v2].map((v, i) => {
      const target = ROTATIONS[v]
      const extra = (Math.floor(Math.random() * 3) + 2) * 360
      totalSpins.current[i] = {
        x: totalSpins.current[i].x + target.x + extra,
        y: totalSpins.current[i].y + target.y + extra,
      }
      return totalSpins.current[i]
    })

    setRotations(newRotations)

    setTimeout(() => {
      setDice([v1, v2])
      setActiveWall((sum - 1) % 4)
      setRolling(false)
    }, 1500)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-center">🎲 Dice Roller</h2>
      <div className="flex justify-center items-center gap-4 mb-4">
        <Cube rotation={rotations[0]} value={dice[0]} />
        <Cube rotation={rotations[1]} value={dice[1]} />
        <span className="text-5xl font-bold ml-4">{rolling ? '?' : dice[0] + dice[1]}</span>
      </div>
      {activeWall !== null && (
        <p className="text-center text-lg mb-2 text-cyan-600 font-semibold">
          Break from: {DIRECTIONS[activeWall]}
        </p>
      )}
      <div className="flex justify-center mb-4">
        <MahjongTable activeWall={activeWall} cutPosition={dice[0] + dice[1]} />
      </div>
      <div className="text-center">
        <button
          onClick={roll}
          disabled={rolling}
          className="px-6 py-3 bg-cyan-500 text-white rounded-full text-lg font-bold disabled:opacity-50 hover:bg-cyan-600 transition"
        >
          🎲 Roll Dice
        </button>
      </div>
    </div>
  )
}
