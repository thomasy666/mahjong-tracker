import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { playersApi } from '../api/client'

export function PlayerManager() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: players } = useQuery({ queryKey: ['players'], queryFn: playersApi.list })
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#808080')
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['players'] })
    queryClient.invalidateQueries({ queryKey: ['standings'] })
  }

  const addMutation = useMutation({
    mutationFn: () => playersApi.create(newName, newColor),
    onSuccess: () => { invalidate(); setNewName('') },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => playersApi.delete(id),
    onSuccess: invalidate,
  })

  const avatarMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => playersApi.uploadAvatar(id, file),
    onSuccess: invalidate,
  })

  const handleAvatarClick = (id: number) => {
    fileInputRefs.current[id]?.click()
  }

  const handleFileChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) avatarMutation.mutate({ id, file })
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">{t('players')}</h2>
      <div className="space-y-2 mb-4">
        {players?.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={el => fileInputRefs.current[p.id] = el}
              onChange={e => handleFileChange(p.id, e)}
            />
            {p.avatar_path ? (
              <img
                src={`/static/avatars/${p.avatar_path}`}
                alt={p.name}
                className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 ring-blue-400"
                onClick={() => handleAvatarClick(p.id)}
                title="Click to change avatar"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:ring-2 ring-blue-400"
                style={{ backgroundColor: p.color }}
                onClick={() => handleAvatarClick(p.id)}
                title="Click to add avatar"
              >
                {p.name[0]}
              </div>
            )}
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
          placeholder={t('newPlayer')}
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
          {t('add')}
        </button>
      </div>
    </div>
  )
}
