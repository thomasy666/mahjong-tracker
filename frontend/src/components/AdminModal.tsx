import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { adminApi } from '../api/client'

interface Props {
  onVerified: () => void
  onClose: () => void
}

export function AdminModal({ onVerified, onClose }: Props) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: () => adminApi.verify(code),
    onSuccess: () => onVerified(),
    onError: () => setError('Invalid code'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80">
        <h3 className="text-lg font-bold mb-4">Admin Verification</h3>
        <input
          type="password"
          value={code}
          onChange={e => { setCode(e.target.value); setError('') }}
          placeholder="Enter admin code"
          className="w-full border rounded px-3 py-2 mb-2"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!code}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  )
}
