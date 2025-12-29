import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { playersApi } from '../api/client'

export function PlayerManager() {
  const queryClient = useQueryClient()
  const { data: players } = useQuery({ queryKey: ['players'], queryFn: playersApi.list })
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#808080')

  const addMutation = useMutation({
    mutationFn: () => playersApi.create(newName, newColor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['standings'] })
      setNewName('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => playersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['standings'] })
    },
  })

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Players</h2>
      <div className="space-y-2 mb-4">
        {players?.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: p.color }} />
            <span className="flex-1">{p.name}</span>
            <button
              onClick={() => deleteMutation.mutate(p.id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New player name"
          className="flex-1 border rounded px-3 py-2"
        />
        <input
          type="color"
          value={newColor}
          onChange={e => setNewColor(e.target.value)}
          className="w-10 h-10 border rounded cursor-pointer"
        />
        <button
          onClick={() => addMutation.mutate()}
          disabled={!newName.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  )
}
