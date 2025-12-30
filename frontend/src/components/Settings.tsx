import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { gameApi, adminApi } from '../api/client'
import { AdminModal } from './AdminModal'

export function SettingsContent({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [showResetModal, setShowResetModal] = useState(false)
  const [showChangeCodeModal, setShowChangeCodeModal] = useState(false)
  const [oldCode, setOldCode] = useState('')
  const [newCode, setNewCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [codeSuccess, setCodeSuccess] = useState(false)

  const resetMutation = useMutation({
    mutationFn: () => gameApi.reset(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['standings'] })
      queryClient.invalidateQueries({ queryKey: ['rounds'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
      setShowResetModal(false)
      onClose()
    },
  })

  const changeCodeMutation = useMutation({
    mutationFn: () => adminApi.changeCode(oldCode, newCode),
    onSuccess: () => {
      setCodeSuccess(true)
      setOldCode('')
      setNewCode('')
    },
    onError: () => setCodeError(t('invalidCode')),
  })

  return (
    <>
      <div className="space-y-2">
        <button
          onClick={() => setShowResetModal(true)}
          className="w-full px-3 py-2 text-left text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
        >
          🔄 {t('resetGame')}
        </button>
        <button
          onClick={() => setShowChangeCodeModal(true)}
          className="w-full px-3 py-2 text-left text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
        >
          🔑 {t('changeAdminCode')}
        </button>
      </div>

      {showResetModal && (
        <AdminModal onVerified={() => resetMutation.mutate()} onClose={() => setShowResetModal(false)} />
      )}

      {showChangeCodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-lg font-bold mb-4">{t('changeAdminCode')}</h3>
            {codeSuccess ? (
              <p className="text-green-600 text-center py-4">✓ {t('codeChanged')}</p>
            ) : (
              <>
                <input
                  type="password"
                  value={oldCode}
                  onChange={e => { setOldCode(e.target.value); setCodeError('') }}
                  placeholder={t('currentCode')}
                  className="w-full border rounded px-3 py-2 mb-2"
                />
                <input
                  type="password"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  placeholder={t('newCode')}
                  className="w-full border rounded px-3 py-2 mb-2"
                />
                {codeError && <p className="text-red-500 text-sm mb-2">{codeError}</p>}
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowChangeCodeModal(false)} className="px-4 py-2 bg-gray-200 rounded">
                    {t('cancel')}
                  </button>
                  <button
                    onClick={() => changeCodeMutation.mutate()}
                    disabled={!oldCode || !newCode}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                  >
                    {t('save')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
