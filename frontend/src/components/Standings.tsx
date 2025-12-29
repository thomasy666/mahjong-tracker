import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { gameApi } from '../api/client'

export function Standings() {
  const { t } = useTranslation()
  const { data: players, isLoading } = useQuery({
    queryKey: ['standings'],
    queryFn: gameApi.standings,
    refetchInterval: 5000,
  })

  if (isLoading) return <div className="p-4">Loading...</div>

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">{t('standings')}</h2>
      <div className="space-y-2">
        {players?.map((player, i) => (
          <div
            key={player.id}
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ backgroundColor: player.color + '20' }}
          >
            <span className="text-lg font-bold w-6">{i + 1}</span>
            {player.avatar_path ? (
              <img
                src={`/static/avatars/${player.avatar_path}`}
                alt={player.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: player.color }}
              >
                {player.name[0]}
              </div>
            )}
            <span className="flex-1 font-medium">{player.name}</span>
            <span
              className="text-xl font-bold"
              style={{ color: player.score >= 0 ? '#22c55e' : '#ef4444' }}
            >
              {player.score >= 0 ? '+' : ''}{player.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
