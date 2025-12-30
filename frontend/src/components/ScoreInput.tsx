import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { playersApi, roundsApi } from '../api/client'
import { AdminModal } from './AdminModal'

const RECORDER_KEY = 'mahjong_recorder'

export function ScoreInput() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: players } = useQuery({ queryKey: ['players'], queryFn: playersApi.list })
  const [scores, setScores] = useState<Record<number, number>>({})
  const [recorderId, setRecorderId] = useState<number | null>(null)
  const [showAdminModal, setShowAdminModal] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(RECORDER_KEY)
    if (saved) setRecorderId(Number(saved))
  }, [])

  const lockRecorder = (id: number) => {
    setRecorderId(id)
    localStorage.setItem(RECORDER_KEY, String(id))
  }

  const unlockRecorder = () => {
    setRecorderId(null)
    localStorage.removeItem(RECORDER_KEY)
    setShowAdminModal(false)
  }

  const mutation = useMutation({
    mutationFn: (data: { player_id: number; delta: number }[]) => roundsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['standings'] })
      queryClient.invalidateQueries({ queryKey: ['rounds'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
      setScores({})
    },
  })

  const total = Object.values(scores).reduce((a, b) => a + (b || 0), 0)
  const recorderPlayer = players?.find(p => p.id === recorderId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (total !== 0) return alert('Scores must sum to zero!')
    const data = Object.entries(scores)
      .filter(([, v]) => v !== 0)
      .map(([id, delta]) => ({ player_id: Number(id), delta }))
    if (data.length === 0) return
    mutation.mutate(data)
  }

  const autoBalance = () => {
    if (!players) return
    const nonZero = Object.entries(scores).filter(([, v]) => v !== 0)
    if (nonZero.length === 0) return
    const remaining = players.find(p => !(p.id in scores) || scores[p.id] === 0)
    if (remaining) {
      setScores({ ...scores, [remaining.id]: -total })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">{t('recordRound')}</h2>

      {/* Recorder Lock Section */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        {recorderId && recorderPlayer ? (
          <div className="flex items-center justify-between">
            <span className="text-sm">
              🔒 {t('recordingAs')}: <strong>{recorderPlayer.name}</strong>
            </span>
            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              {t('unlock')}
            </button>
          </div>
        ) : (
          <div>
            <label className="text-sm text-gray-600 block mb-2">{t('selectRecorder')}</label>
            <div className="flex flex-wrap gap-2">
              {players?.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => lockRecorder(p.id)}
                  className="px-3 py-1 bg-white border border-[#E5E5EA] rounded-lg hover:bg-gray-50 text-sm"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {players?.map((p) => (
          <div key={p.id} className="flex items-center gap-3">
            <span className="w-24 truncate">{p.name}</span>
            <input
              type="number"
              value={scores[p.id] || ''}
              onChange={e => setScores({ ...scores, [p.id]: Number(e.target.value) || 0 })}
              className="flex-1 border rounded px-3 py-2"
              placeholder="0"
              disabled={!recorderId}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className={`font-bold ${total === 0 ? 'text-green-600' : 'text-red-600'}`}>
          {t('sum')}: {total}
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={autoBalance} disabled={!recorderId} className="px-4 py-2 bg-white border border-[#E5E5EA] rounded-lg hover:bg-gray-50 disabled:opacity-50">
            {t('balance')}
          </button>
          <button
            type="submit"
            disabled={total !== 0 || mutation.isPending || !recorderId}
            className="px-4 py-2 bg-[#1C1C1E] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {t('submit')}
          </button>
        </div>
      </div>

      {showAdminModal && (
        <AdminModal onVerified={unlockRecorder} onClose={() => setShowAdminModal(false)} />
      )}
    </form>
  )
}
