import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { roundsApi, playersApi } from '../api/client'
import { AdminModal } from './AdminModal'

export function RoundHistory() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: rounds, isLoading } = useQuery({ queryKey: ['rounds'], queryFn: roundsApi.list })
  const { data: players } = useQuery({ queryKey: ['players'], queryFn: playersApi.list })
  const [showAdminModal, setShowAdminModal] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: (id: number) => roundsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rounds'] })
      queryClient.invalidateQueries({ queryKey: ['standings'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
    },
  })

  const handleUndo = () => {
    if (rounds?.length) {
      deleteMutation.mutate(rounds[0].id)
      setShowAdminModal(false)
    }
  }

  if (isLoading) return <div className="p-4">Loading...</div>

  // Get consistent player order
  const playerIds = players?.map(p => p.id) || []

  return (
    <div>
      <div className="flex justify-end items-center mb-3">
        {rounds?.length ? (
          <button
            onClick={() => setShowAdminModal(true)}
            className="px-2 py-1 bg-white border border-[#E5E5EA] text-gray-700 rounded-lg hover:bg-gray-50 text-xs"
          >
            {t('undoLast')}
          </button>
        ) : null}
      </div>

      <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b">
              <th className="text-left py-1 px-1 text-gray-400 font-normal">#</th>
              {players?.map(p => (
                <th key={p.id} className="text-right py-1 px-2 font-medium text-gray-600 truncate max-w-[60px]">
                  {p.name.slice(0, 4)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rounds?.map(round => {
              const scoreMap = Object.fromEntries(round.scores.map(s => [s.player_id, s.delta]))
              return (
                <tr key={round.id} className="border-b border-gray-100">
                  <td className="py-1 px-1 text-gray-400">{round.id}</td>
                  {playerIds.map(pid => {
                    const delta = scoreMap[pid]
                    return (
                      <td
                        key={pid}
                        className={`py-1 px-2 text-right font-mono ${
                          delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-gray-300'
                        }`}
                      >
                        {delta !== undefined ? (delta > 0 ? '+' : '') + delta : '-'}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
        {!rounds?.length && (
          <div className="text-center text-gray-400 py-4">{t('noRounds')}</div>
        )}
      </div>

      {showAdminModal && (
        <AdminModal onVerified={handleUndo} onClose={() => setShowAdminModal(false)} />
      )}
    </div>
  )
}
