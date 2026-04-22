import type { Screen } from '../App'

interface Props {
  current: Screen
  onChange: (s: Screen) => void
}

const tabs: { id: Screen; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '🏠', label: 'Home' },
  { id: 'history', icon: '📋', label: 'History' },
  { id: 'add', icon: '➕', label: 'Add' },
  { id: 'budgets', icon: '🎯', label: 'Budgets' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
]

export default function BottomNav({ current, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-slate-800 border-t border-slate-700 flex z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
            current === tab.id ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
