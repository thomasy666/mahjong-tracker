import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

const FACE_TARGETS: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: 0, y: -180 },
  4: { x: 0, y: 90 },
  5: { x: -90, y: 0 },
  6: { x: 90, y: 0 },
}

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
  const pips: React.ReactElement[] = []
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

function Cube({ rotX, rotY }: { rotX: number; rotY: number }) {
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
          transform: `translateZ(-30px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
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

function MahjongTable({ activeWall, breakPoint, directions, tableLabel }: { activeWall: number | null; breakPoint: number; directions: string[]; tableLabel: string }) {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="rounded-full" style={{ background: 'rgba(0,0,0,0.2)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
      <text x="100" y="105" textAnchor="middle" fill="#aaa" fontSize="12" opacity="0.5" fontWeight="bold">{tableLabel}</text>
      {directions.map((dir, i) => {
        const transforms = [
          'translate(100, 170)',
          'translate(170, 100) rotate(90)',
          'translate(100, 30) rotate(180)',
          'translate(30, 100) rotate(-90)',
        ]
        const isActive = activeWall === i
        const stackWidth = 120 / 17
        const xPos = i % 2 === 0 ? 60 - breakPoint * stackWidth : -60 + breakPoint * stackWidth
        const yPos = (i === 1 || i === 3) ? 10 : -10
        const textY = (i === 1 || i === 3) ? 35 : -25

        return (
          <g key={i} transform={transforms[i]}>
            <rect x="-60" y="-8" width="120" height="16" rx="2" fill={isActive ? '#34495e' : '#444'} stroke={isActive ? '#00c6ff' : '#666'} strokeWidth={isActive ? 2 : 1} />
            <text x="0" y="4" textAnchor="middle" fill={isActive ? '#00c6ff' : '#fff'} fontSize="9">{dir}</text>
            {isActive && (
              <>
                <polygon points={`${xPos},${yPos} ${xPos - 5},${yPos + (yPos > 0 ? 8 : -8)} ${xPos + 5},${yPos + (yPos > 0 ? 8 : -8)}`} fill="#FFD700" />
                <text x={xPos} y={textY} textAnchor="middle" fill="#FFD700" fontSize="14" fontWeight="bold">{breakPoint}</text>
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function DiceRoller() {
  const { t } = useTranslation()
  const [dice, setDice] = useState([1, 1])
  const [rot1, setRot1] = useState({ x: 0, y: 0 })
  const [rot2, setRot2] = useState({ x: 0, y: 0 })
  const [rolling, setRolling] = useState(false)
  const [activeWall, setActiveWall] = useState<number | null>(null)
  const [breakPoint, setBreakPoint] = useState(1)
  const state1 = useRef({ x: 0, y: 0 })
  const state2 = useRef({ x: 0, y: 0 })

  const directions = [t('dirSelf'), t('dirRight'), t('dirAcross'), t('dirLeft')]

  const getNextRot = (current: number, target: number) => {
    const minSpin = 720
    const diff = current + minSpin - target
    const k = Math.ceil(diff / 360)
    return target + k * 360
  }

  const roll = () => {
    setRolling(true)
    setActiveWall(null)

    const v1 = Math.floor(Math.random() * 6) + 1
    const v2 = Math.floor(Math.random() * 6) + 1

    const t1 = FACE_TARGETS[v1]
    const extra1 = Math.floor(Math.random() * 2) * 360
    const nextX1 = getNextRot(state1.current.x, t1.x) + extra1
    const nextY1 = getNextRot(state1.current.y, t1.y) + extra1
    state1.current = { x: nextX1, y: nextY1 }
    setRot1({ x: nextX1, y: nextY1 })

    const t2 = FACE_TARGETS[v2]
    const extra2 = Math.floor(Math.random() * 2) * 360
    const nextX2 = getNextRot(state2.current.x, t2.x) + extra2
    const nextY2 = getNextRot(state2.current.y, t2.y) + extra2
    state2.current = { x: nextX2, y: nextY2 }
    setRot2({ x: nextX2, y: nextY2 })

    setTimeout(() => {
      const sum = v1 + v2
      const bp = Math.min(v1, v2)
      setDice([v1, v2])
      setActiveWall((sum - 1) % 4)
      setBreakPoint(bp)
      setRolling(false)
    }, 1500)
  }

  const sum = dice[0] + dice[1]

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-center">🎲 {t('diceRoller')}</h2>
      <div className="flex justify-center items-center gap-4 mb-4">
        <Cube rotX={rot1.x} rotY={rot1.y} />
        <Cube rotX={rot2.x} rotY={rot2.y} />
        <span className="text-5xl font-bold ml-4">{rolling ? '...' : sum}</span>
      </div>
      <p className={`text-center text-lg mb-2 font-semibold ${activeWall !== null ? 'text-cyan-600' : 'invisible'}`}>
        {t('breakFrom')}: {directions[activeWall ?? 0]} ({breakPoint})
      </p>
      <div className="flex justify-center mb-4">
        <MahjongTable activeWall={activeWall} breakPoint={breakPoint} directions={directions} tableLabel={t('table')} />
      </div>
      <div className="text-center">
        <button
          onClick={roll}
          disabled={rolling}
          className="px-6 py-3 bg-[#1C1C1E] text-white rounded-lg text-lg font-semibold disabled:opacity-50 hover:opacity-90 transition"
        >
          🎲 {t('roll')}
        </button>
      </div>
    </div>
  )
}
