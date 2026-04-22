import { useState } from 'react'
import { useStore } from '../store'
import { format } from 'date-fns'
import type { EntryType } from '../db'

interface Props {
  onDone: () => void
}

const TYPE_TABS: { id: EntryType; label: string; icon: string; color: string }[] = [
  { id: 'expense', label: 'Expense', icon: '💸', color: 'bg-red-500' },
  { id: 'savings', label: 'Savings', icon: '🏦', color: 'bg-emerald-500' },
  { id: 'investment', label: 'Investment', icon: '📈', color: 'bg-indigo-500' },
]

export default function AddEntry({ onDone }: Props) {
  const { categories, members, activeMemberId, addEntry } = useStore()

  const [type, setType] = useState<EntryType>('expense')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [memberId, setMemberId] = useState<number>(activeMemberId ?? members[0]?.id ?? 0)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [saving, setSaving] = useState(false)

  const filteredCats = categories.filter((c) => c.type === type)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!categoryId || !amount || isNaN(Number(amount)) || Number(amount) <= 0) return
    setSaving(true)
    await addEntry({ type, categoryId, memberId, amount: Number(amount), note, date })
    setSaving(false)
    onDone()
  }

  return (
    <div className="px-4 pt-4">
      <h1 className="text-2xl font-bold text-white mb-4">Add Entry</h1>

      {/* Type selector */}
      <div className="flex gap-2 mb-5">
        {TYPE_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setType(t.id); setCategoryId(null) }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
              type === t.id ? t.color + ' text-white shadow-lg scale-105' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div className="bg-slate-800 rounded-2xl p-4">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Amount ($)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent text-3xl font-bold text-white mt-1 outline-none placeholder:text-slate-600"
          />
        </div>

        {/* Category */}
        <div className="bg-slate-800 rounded-2xl p-4">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-2">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {filteredCats.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id!)}
                className={`py-2 px-1 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  categoryId === cat.id
                    ? 'bg-indigo-600 text-white scale-105'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="leading-tight text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="bg-slate-800 rounded-2xl p-4">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-1">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent text-white outline-none text-base"
          />
        </div>

        {/* Member */}
        {members.length > 1 && (
          <div className="bg-slate-800 rounded-2xl p-4">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-2">Who</label>
            <div className="flex gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMemberId(m.id!)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium flex flex-col items-center gap-0.5 transition-all ${
                    memberId === m.id ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-xl">{m.avatar}</span>
                  <span className="text-xs">{m.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="bg-slate-800 rounded-2xl p-4">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-1">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What was this for?"
            className="w-full bg-transparent text-white outline-none text-base placeholder:text-slate-600"
          />
        </div>

        <button
          type="submit"
          disabled={saving || !categoryId || !amount}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg disabled:opacity-40 active:scale-95 transition-all"
        >
          {saving ? 'Saving…' : 'Save Entry'}
        </button>
      </form>
    </div>
  )
}
