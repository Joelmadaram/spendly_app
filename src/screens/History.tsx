import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { parseISO, format, startOfMonth, endOfMonth } from 'date-fns'
import type { EntryType } from '../db'

export default function History() {
  const { entries, categories, members, currentMonth, deleteEntry } = useStore()
  const [filterType, setFilterType] = useState<EntryType | 'all'>('all')

  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories])
  const memberMap = useMemo(() => Object.fromEntries(members.map((m) => [m.id, m])), [members])

  const monthStart = startOfMonth(new Date(currentMonth + '-01'))
  const monthEnd = endOfMonth(monthStart)

  const filtered = useMemo(() => {
    return entries
      .filter((e) => {
        const d = parseISO(e.date)
        return d >= monthStart && d <= monthEnd && (filterType === 'all' || e.type === filterType)
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
  }, [entries, currentMonth, filterType])

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    filtered.forEach((e) => {
      const g = map.get(e.date) ?? []
      g.push(e)
      map.set(e.date, g)
    })
    return [...map.entries()].sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  const typeColor = (t: EntryType) =>
    t === 'expense' ? 'text-red-400' : t === 'savings' ? 'text-emerald-400' : 'text-indigo-400'

  return (
    <div className="px-4 pt-4">
      <h1 className="text-2xl font-bold text-white mb-4">History 📋</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'expense', 'savings', 'investment'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === t ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {t === 'all' ? 'All' : t === 'expense' ? '💸' : t === 'savings' ? '🏦' : '📈'}
            {t !== 'all' && <span className="ml-1 capitalize">{t}</span>}
          </button>
        ))}
      </div>

      {grouped.length === 0 && (
        <div className="text-center text-slate-500 py-16">
          <div className="text-4xl mb-2">🤷</div>
          <p>No entries this month.</p>
        </div>
      )}

      <div className="space-y-4">
        {grouped.map(([date, dayEntries]) => (
          <div key={date}>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">
              {format(parseISO(date), 'EEEE, MMM d')}
            </p>
            <div className="space-y-2">
              {dayEntries.map((e) => {
                const cat = catMap[e.categoryId]
                const member = memberMap[e.memberId]
                return (
                  <div key={e.id} className="bg-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <span className="text-2xl">{cat?.icon ?? '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{cat?.name}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {member?.avatar} {member?.name}{e.note ? ` · ${e.note}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-sm font-bold ${typeColor(e.type)}`}>
                        ${e.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => e.id && deleteEntry(e.id)}
                        className="text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
