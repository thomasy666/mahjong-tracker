import { useQuery } from '@tanstack/react-query'
import { gameApi } from '../api/client'

export function Statistics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['statistics'],
    queryFn: gameApi.statistics,
  })

  if (isLoading) return <div className="p-4">Loading...</div>
  if (!stats?.length) return null

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Statistics</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Player</th>
              <th className="p-2">Rounds</th>
              <th className="p-2">Win%</th>
              <th className="p-2">Avg</th>
              <th className="p-2">Best</th>
              <th className="p-2">Worst</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s: any) => (
              <tr key={s.name} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium">{s.name}</td>
                <td className="p-2">{s.rounds}</td>
                <td className="p-2">{s.win_rate}%</td>
                <td className="p-2" style={{ color: s.avg >= 0 ? '#22c55e' : '#ef4444' }}>
                  {s.avg > 0 ? '+' : ''}{s.avg}
                </td>
                <td className="p-2 text-green-600">+{s.best}</td>
                <td className="p-2 text-red-600">{s.worst}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
