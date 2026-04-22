import { useMemo } from 'react'
import { useStore } from '../store'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import BudgetBar from '../components/BudgetBar'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#84cc16']

export default function Dashboard() {
  const { entries, categories, budgets, members, currentMonth, setMonth } = useStore()

  const monthStart = startOfMonth(new Date(currentMonth + '-01'))
  const monthEnd = endOfMonth(monthStart)

  const monthEntries = useMemo(() =>
    entries.filter((e) => {
      const d = parseISO(e.date)
      return d >= monthStart && d <= monthEnd
    }),
    [entries, currentMonth]
  )

  const expenseEntries = monthEntries.filter((e) => e.type === 'expense')
  const savingsEntries = monthEntries.filter((e) => e.type === 'savings')
  const investEntries = monthEntries.filter((e) => e.type === 'investment')

  const expenseCategories = categories.filter((c) => c.type === 'expense')

  const spendingByCat = useMemo(() => {
    const map: Record<number, number> = {}
    expenseEntries.forEach((e) => {
      map[e.categoryId] = (map[e.categoryId] ?? 0) + e.amount
    })
    return map
  }, [expenseEntries])

  const totalExpenses = Object.values(spendingByCat).reduce((a, b) => a + b, 0)
  const totalSavings = savingsEntries.reduce((a, e) => a + e.amount, 0)
  const totalInvest = investEntries.reduce((a, e) => a + e.amount, 0)

  const budgetMap = useMemo(() => {
    const map: Record<number, number> = {}
    budgets.filter((b) => b.month === currentMonth).forEach((b) => {
      map[b.categoryId] = b.amount
    })
    return map
  }, [budgets, currentMonth])

  const pieData = expenseCategories
    .map((c) => ({ name: c.name, value: spendingByCat[c.id!] ?? 0, icon: c.icon }))
    .filter((d) => d.value > 0)

  const prevMonth = () => {
    const d = new Date(currentMonth + '-01')
    d.setMonth(d.getMonth() - 1)
    setMonth(format(d, 'yyyy-MM'))
  }
  const nextMonth = () => {
    const d = new Date(currentMonth + '-01')
    d.setMonth(d.getMonth() + 1)
    setMonth(format(d, 'yyyy-MM'))
  }

  const isCurrentMonth = currentMonth === format(new Date(), 'yyyy-MM')

  return (
    <div className="px-4 pt-4 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Spendly 💸</h1>
          <p className="text-slate-400 text-sm">Family expense tracker</p>
        </div>
        {/* Member avatars */}
        <div className="flex gap-1">
          {members.map((m) => (
            <span key={m.id} className="text-2xl" title={m.name}>{m.avatar}</span>
          ))}
        </div>
      </div>

      {/* Month picker */}
      <div className="flex items-center justify-between bg-slate-800 rounded-2xl px-4 py-3 mb-4">
        <button onClick={prevMonth} className="text-slate-400 text-xl px-2">‹</button>
        <span className="font-semibold text-white">
          {format(new Date(currentMonth + '-01'), 'MMMM yyyy')}
        </span>
        <button onClick={nextMonth} disabled={isCurrentMonth} className="text-slate-400 text-xl px-2 disabled:opacity-30">›</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <SummaryCard label="Expenses" value={totalExpenses} color="text-red-400" icon="💸" />
        <SummaryCard label="Savings" value={totalSavings} color="text-emerald-400" icon="🏦" />
        <SummaryCard label="Invested" value={totalInvest} color="text-indigo-400" icon="📈" />
      </div>

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-4 mb-4">
          <h2 className="text-sm font-semibold text-slate-400 mb-2">Spending breakdown</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                formatter={(v) => [`$${Number(v).toFixed(2)}`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {pieData.map((d, i) => (
              <span key={d.name} className="text-xs text-slate-300 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.icon} {d.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Budget bars per expense category */}
      <div className="bg-slate-800 rounded-2xl p-4 mb-4">
        <h2 className="text-sm font-semibold text-slate-400 mb-3">Budget status</h2>
        <div className="space-y-4">
          {expenseCategories.map((cat) => {
            const spent = spendingByCat[cat.id!] ?? 0
            const budget = budgetMap[cat.id!] ?? 0
            if (spent === 0 && budget === 0) return null
            return (
              <div key={cat.id}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm font-medium text-white flex-1">{cat.name}</span>
                  {budget === 0 && (
                    <span className="text-xs text-slate-500">${spent.toFixed(2)}</span>
                  )}
                </div>
                {budget > 0
                  ? <BudgetBar spent={spent} budget={budget} />
                  : <div className="h-1.5 bg-slate-700 rounded-full mt-1">
                      <div className="h-full w-0 bg-slate-600 rounded-full" />
                    </div>
                }
              </div>
            )
          })}
          {Object.values(spendingByCat).every((v) => v === 0) && (
            <p className="text-slate-500 text-sm text-center py-2">No expenses this month yet.</p>
          )}
        </div>
      </div>

      {/* Recent entries */}
      <RecentEntries entries={monthEntries.slice(-5).reverse()} categories={categories} members={members} />
    </div>
  )
}

function SummaryCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-3 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className={`text-base font-bold ${color}`}>${value.toFixed(0)}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  )
}

function RecentEntries({ entries, categories, members }: {
  entries: import('../db').Entry[]
  categories: import('../db').Category[]
  members: import('../db').FamilyMember[]
}) {
  if (entries.length === 0) return null
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]))
  const memberMap = Object.fromEntries(members.map((m) => [m.id, m]))

  return (
    <div className="bg-slate-800 rounded-2xl p-4 mb-4">
      <h2 className="text-sm font-semibold text-slate-400 mb-3">Recent entries</h2>
      <div className="space-y-3">
        {entries.map((e) => {
          const cat = catMap[e.categoryId]
          const member = memberMap[e.memberId]
          return (
            <div key={e.id} className="flex items-center gap-3">
              <span className="text-2xl">{cat?.icon ?? '📦'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{cat?.name}</p>
                <p className="text-xs text-slate-400 truncate">{e.note || member?.name} · {e.date}</p>
              </div>
              <span className={`text-sm font-semibold ${e.type === 'expense' ? 'text-red-400' : e.type === 'savings' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                ${e.amount.toFixed(2)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
