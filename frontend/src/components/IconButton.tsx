interface IconButtonProps {
  icon: string
  label: string
  isActive?: boolean
  onClick: () => void
}

export function IconButton({ icon, label, isActive, onClick }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={isActive}
      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
        isActive ? 'bg-gray-200 text-black' : 'bg-white text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
    </button>
  )
}
