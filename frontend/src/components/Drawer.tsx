import { useEffect, useRef } from 'react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Mobile: Bottom sheet */}
      <div
        ref={drawerRef}
        className="absolute bg-white md:hidden bottom-0 left-0 right-0 max-h-[70vh] rounded-t-2xl flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="w-12 h-1 bg-gray-300 rounded-full absolute top-2 left-1/2 -translate-x-1/2" />
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>

      {/* Desktop: Side drawer */}
      <div
        ref={drawerRef}
        className="absolute bg-white hidden md:flex right-0 top-0 bottom-0 w-[400px] flex-col shadow-xl"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}
