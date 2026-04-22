import { useState } from 'react'
import { useStore } from '../store'
import BudgetBar from '../components/BudgetBar'
import { startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { useMemo } from 'react'

export default function Budgets() {
  const { categories, budgets, entries, currentMonth, setBudget, addCategory } = useStore()

  const expenseCats = categories.filter((c) => c.type === 'expense')

  const monthStart = startOfMonth(new Date(currentMonth + '-01'))
  const monthEnd = endOfMonth(monthStart)

  const spendingByCat = useMemo(() => {
    const map: Record<number, number> = {}
    entries
      .filter((e) => e.type === 'expense' && parseISO(e.date) >= monthStart && parseISO(e.date) <= monthEnd)
      .forEach((e) => { map[e.categoryId] = (map[e.categoryId] ?? 0) + e.amount })
    return map
  }, [entries, currentMonth])

  const budgetMap = useMemo(() => {
    const map: Record<number, number> = {}
    budgets.filter((b) => b.month === currentMonth).forEach((b) => { map[b.categoryId] = b.amount })
    return map
  }, [budgets, currentMonth])

  const [editing, setEditing] = useState<number | null>(null)
  const [value, setValue] = useState('')
  const [showAddCat, setShowAddCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('📦')

  async function saveBudget(catId: number) {
    const v = parseFloat(value)
    if (!isNaN(v) && v >= 0) await setBudget(catId, v)
    setEditing(null)
    setValue('')
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCatName.trim()) return
    await addCategory({ name: newCatName.trim(), icon: newCatIcon, type: 'expense', isCustom: true })
    setNewCatName('')
    setNewCatIcon('📦')
    setShowAddCat(false)
  }

  return (
    <div className="px-4 pt-4">
      <h1 className="text-2xl font-bold text-white mb-1">Budgets 🎯</h1>
      <p className="text-slate-400 text-sm mb-4">Set monthly spending limits per category.</p>

      <div className="space-y-3">
        {expenseCats.map((cat) => {
          const spent = spendingByCat[cat.id!] ?? 0
          const budget = budgetMap[cat.id!] ?? 0
          return (
            <div key={cat.id} className="bg-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{cat.icon}</span>
                <span className="font-medium text-white flex-1">{cat.name}</span>
                <button
                  onClick={() => { setEditing(cat.id!); setValue(budget > 0 ? String(budget) : '') }}
                  className="text-xs text-indigo-400 px-2 py-1 rounded-lg bg-indigo-950"
                >
                  {budget > 0 ? 'Edit' : 'Set limit'}
                </button>
              </div>

              {editing === cat.id ? (
                <div className="flex gap-2 mt-2">
                  <input
                    autoFocus
                    type="number"
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Monthly limit ($)"
                    className="flex-1 bg-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none"
                  />
                  <button onClick={() => saveBudget(cat.id!)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                    Save
                  </button>
                  <button onClick={() => setEditing(null)} className="bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-sm">
                    ✕
                  </button>
                </div>
              ) : (
                budget > 0
                  ? <BudgetBar spent={spent} budget={budget} />
                  : <p className="text-xs text-slate-500 mt-1">No limit set · spent ${spent.toFixed(2)}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Add custom category */}
      <div className="mt-4">
        {!showAddCat ? (
          <button
            onClick={() => setShowAddCat(true)}
            className="w-full py-3 rounded-2xl border border-dashed border-slate-600 text-slate-400 text-sm font-medium"
          >
            + Add custom category
          </button>
        ) : (
          <form onSubmit={handleAddCategory} className="bg-slate-800 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-white">New expense category</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                maxLength={2}
                className="w-12 bg-slate-700 text-white rounded-xl text-center text-xl outline-none py-2"
              />
              <input
                autoFocus
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category name"
                className="flex-1 bg-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-semibold">Add</button>
              <button type="button" onClick={() => setShowAddCat(false)} className="bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
