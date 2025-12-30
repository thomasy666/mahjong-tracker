import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { sessionsApi } from '../api/client'

interface Session {
  id: number
  name: string
  created_at: string
  is_active: boolean
  round_count: number
}

const SESSIONS_LIMIT = 5

export function SessionManager() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [newName, setNewName] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  const { data: sessions = [] } = useQuery({ queryKey: ['sessions'], queryFn: sessionsApi.list })

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['sessions'] })
    queryClient.invalidateQueries({ queryKey: ['activeSession'] })
    queryClient.invalidateQueries({ queryKey: ['players'] })
    queryClient.invalidateQueries({ queryKey: ['rounds'] })
    queryClient.invalidateQueries({ queryKey: ['standings'] })
    queryClient.invalidateQueries({ queryKey: ['statistics'] })
  }

  const createMutation = useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: () => { invalidateAll(); setNewName('') }
  })

  const loadMutation = useMutation({
    mutationFn: sessionsApi.load,
    onSuccess: invalidateAll
  })

  const deleteMutation = useMutation({
    mutationFn: sessionsApi.delete,
    onSuccess: invalidateAll
  })

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => sessionsApi.rename(id, name),
    onSuccess: () => { invalidateAll(); setEditingId(null) }
  })

  const handleCreate = () => {
    if (newName.trim()) createMutation.mutate(newName.trim())
  }

  return (
    <div>
      {/* New session input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          placeholder={t('newSessionName')}
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={handleCreate}
          disabled={!newName.trim() || createMutation.isPending}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50 hover:bg-green-600"
        >
          {t('newSession')}
        </button>
      </div>

      {/* Sessions list */}
      <div className="space-y-2">
        {sessions.length === 0 ? (
          <div className="text-center text-gray-400 py-4">{t('noSavedSessions')}</div>
        ) : (
          <>
            {(showAll ? sessions : sessions.slice(0, SESSIONS_LIMIT)).map((s: Session) => (
              <div
                key={s.id}
                className={`flex items-center justify-between p-2 rounded ${
                  s.is_active ? 'bg-cyan-50 border border-cyan-300' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex-1">
                  {editingId === s.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && editName.trim()) {
                          renameMutation.mutate({ id: s.id, name: editName.trim() })
                        } else if (e.key === 'Escape') {
                          setEditingId(null)
                        }
                      }}
                      onBlur={() => {
                        if (editName.trim() && editName !== s.name) {
                          renameMutation.mutate({ id: s.id, name: editName.trim() })
                        } else {
                          setEditingId(null)
                        }
                      }}
                      autoFocus
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <div
                      className={`font-medium ${s.is_active ? 'cursor-pointer hover:text-cyan-700' : ''}`}
                      onClick={() => {
                        if (s.is_active) {
                          setEditingId(s.id)
                          setEditName(s.name)
                        }
                      }}
                      title={s.is_active ? t('clickToRename') : undefined}
                    >
                      {s.name}
                      {s.is_active && <span className="ml-2 text-xs text-cyan-600">({t('currentSession')})</span>}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {s.round_count} {t('rounds').toLowerCase()} • {new Date(s.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!s.is_active && (
                    <button
                      onClick={() => loadMutation.mutate(s.id)}
                      disabled={loadMutation.isPending}
                      className="px-3 py-1 bg-cyan-500 text-white text-sm rounded hover:bg-cyan-600"
                    >
                      {t('load')}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(t('confirmDeleteSession'))) deleteMutation.mutate(s.id)
                    }}
                    disabled={deleteMutation.isPending}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {sessions.length > SESSIONS_LIMIT && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2"
              >
                {showAll ? t('showLess') : t('showAll', { count: sessions.length - SESSIONS_LIMIT })}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
