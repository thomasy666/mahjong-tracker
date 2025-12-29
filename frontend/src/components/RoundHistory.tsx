import { useQuery } from '@tanstack/react-query'
import { roundsApi } from '../api/client'

export function RoundHistory() {
  const { data: rounds, isLoading } = useQuery({
    queryKey: ['rounds'],
    queryFn: roundsApi.list,
  })

  if (isLoading) return <div className="p-4">Loading...</div>

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Round History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">#</th>
              <th className="text-left p-2">Scores</th>
            </tr>
          </thead>
          <tbody>
            {rounds?.map(round => (
              <tr key={round.id} className="border-b hover:bg-gray-50">
                <td className="p-2 font-mono">{round.id}</td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-2">
                    {round.scores.map(s => (
                      <span
                        key={s.player_id}
                        className={`px-2 py-1 rounded text-xs ${
                          s.delta > 0 ? 'bg-green-100 text-green-800' :
                          s.delta < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100'
                        }`}
                      >
                        {s.player_name}: {s.delta > 0 ? '+' : ''}{s.delta}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
