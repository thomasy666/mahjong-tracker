import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { playersApi, roundsApi } from '../api/client'

export function ScoreInput() {
  const queryClient = useQueryClient()
  const { data: players } = useQuery({ queryKey: ['players'], queryFn: playersApi.list })
  const [scores, setScores] = useState<Record<number, number>>({})

  const mutation = useMutation({
    mutationFn: (data: { player_id: number; delta: number }[]) => roundsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['standings'] })
      queryClient.invalidateQueries({ queryKey: ['rounds'] })
      setScores({})
    },
  })

  const total = Object.values(scores).reduce((a, b) => a + (b || 0), 0)

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
      <h2 className="text-xl font-bold mb-4">Record Round</h2>
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
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className={`font-bold ${total === 0 ? 'text-green-600' : 'text-red-600'}`}>
          Sum: {total}
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={autoBalance} className="px-4 py-2 bg-gray-200 rounded">
            Balance
          </button>
          <button
            type="submit"
            disabled={total !== 0 || mutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  )
}
