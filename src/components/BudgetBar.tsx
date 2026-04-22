interface Props {
  spent: number
  budget: number
}

export default function BudgetBar({ spent, budget }: Props) {
  if (budget <= 0) return null

  const pct = Math.min((spent / budget) * 100, 100)
  const over = spent > budget
  const warn = pct >= 80

  const barColor = over
    ? 'bg-red-500'
    : warn
    ? 'bg-amber-400'
    : 'bg-emerald-400'

  const textColor = over ? 'text-red-400' : warn ? 'text-amber-400' : 'text-emerald-400'

  return (
    <div className="mt-1">
      <div className="flex justify-between text-xs mb-1">
        <span className={textColor}>
          ${spent.toFixed(0)} / ${budget.toFixed(0)}
        </span>
        <span className={textColor}>
          {over ? `$${(spent - budget).toFixed(0)} over` : `$${(budget - spent).toFixed(0)} left`}
        </span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
