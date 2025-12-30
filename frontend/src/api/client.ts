import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export interface Player {
  id: number
  name: string
  color: string
  avatar_path: string | null
  score: number
}

export interface RoundScore {
  player_id: number
  player_name: string
  delta: number
}

export interface Round {
  id: number
  recorder_id: number | null
  recorder_ip: string | null
  created_at: string
  scores: RoundScore[]
}

export const playersApi = {
  list: () => api.get<Player[]>('/players').then(r => r.data),
  create: (name: string, color: string) => api.post<Player>('/players', { name, color }).then(r => r.data),
  update: (id: number, data: Partial<Player>) => api.patch<Player>(`/players/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/players/${id}`),
  isLocked: (id: number) => api.get<{ locked: boolean }>(`/players/${id}/locked`).then(r => r.data.locked),
  uploadAvatar: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/players/${id}/avatar`, formData).then(r => r.data)
  },
}

export const roundsApi = {
  list: () => api.get<Round[]>('/rounds').then(r => r.data),
  create: (scores: { player_id: number; delta: number }[], recorder_id?: number) =>
    api.post<Round>('/rounds', { scores, recorder_id }).then(r => r.data),
  delete: (id: number) => api.delete(`/rounds/${id}`),
}

export const gameApi = {
  standings: () => api.get<Player[]>('/game/standings').then(r => r.data),
  statistics: () => api.get('/game/statistics').then(r => r.data),
  reset: () => api.post('/game/reset'),
}

export const adminApi = {
  verify: (code: string) => api.post('/admin/verify', { code }),
  changeCode: (old_code: string, new_code: string) => api.patch('/admin/code', { old_code, new_code }),
}

export interface Session {
  id: number
  name: string
  created_at: string
  is_active: boolean
  round_count: number
}

export const sessionsApi = {
  list: () => api.get<Session[]>('/sessions').then(r => r.data),
  active: () => api.get<Session | null>('/sessions/active').then(r => r.data),
  create: (name: string) => api.post<Session>('/sessions', { name }).then(r => r.data),
  load: (id: number) => api.post<Session>(`/sessions/${id}/load`).then(r => r.data),
  rename: (id: number, name: string) => api.patch<Session>(`/sessions/${id}`, { name }).then(r => r.data),
  delete: (id: number) => api.delete(`/sessions/${id}`),
}
