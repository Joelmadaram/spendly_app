import Dexie, { type Table } from 'dexie'

export type EntryType = 'expense' | 'savings' | 'investment'

export interface FamilyMember {
  id?: number
  name: string
  avatar: string // emoji
  createdAt: number
}

export interface Category {
  id?: number
  name: string
  icon: string
  type: EntryType
  isCustom: boolean
}

export interface Budget {
  id?: number
  categoryId: number
  amount: number
  period: 'monthly' // extensible later
  month: string // "YYYY-MM"
}

export interface Entry {
  id?: number
  type: EntryType
  categoryId: number
  memberId: number
  amount: number
  note: string
  date: string // "YYYY-MM-DD"
  createdAt: number
}

export interface SavingsGoal {
  id?: number
  name: string
  targetAmount: number
  icon: string
  createdAt: number
}

class SpendlyDB extends Dexie {
  members!: Table<FamilyMember>
  categories!: Table<Category>
  budgets!: Table<Budget>
  entries!: Table<Entry>
  savingsGoals!: Table<SavingsGoal>

  constructor() {
    super('SpendlyDB')
    this.version(1).stores({
      members: '++id, name',
      categories: '++id, type, name',
      budgets: '++id, categoryId, month',
      entries: '++id, type, categoryId, memberId, date, createdAt',
      savingsGoals: '++id, name',
    })
  }
}

export const db = new SpendlyDB()

// Seed default data on first run
export async function seedDefaults() {
  const memberCount = await db.members.count()
  if (memberCount > 0) return

  await db.members.bulkAdd([
    { name: 'Me', avatar: '🧑', createdAt: Date.now() },
  ])

  await db.categories.bulkAdd([
    // Expenses
    { name: 'Groceries', icon: '🛒', type: 'expense', isCustom: false },
    { name: 'Dining Out', icon: '🍽️', type: 'expense', isCustom: false },
    { name: 'Gas', icon: '⛽', type: 'expense', isCustom: false },
    { name: 'House Rent', icon: '🏠', type: 'expense', isCustom: false },
    { name: 'Utilities', icon: '💡', type: 'expense', isCustom: false },
    { name: 'Entertainment', icon: '🎬', type: 'expense', isCustom: false },
    { name: 'Shopping', icon: '🛍️', type: 'expense', isCustom: false },
    { name: 'Loan Repayment', icon: '🏦', type: 'expense', isCustom: false },
    { name: 'Other', icon: '📦', type: 'expense', isCustom: false },
    // Savings
    { name: 'Emergency Fund', icon: '🛡️', type: 'savings', isCustom: false },
    { name: 'Vacation', icon: '✈️', type: 'savings', isCustom: false },
    { name: 'Education', icon: '🎓', type: 'savings', isCustom: false },
    // Investments
    { name: 'Stocks', icon: '📈', type: 'investment', isCustom: false },
    { name: '401k', icon: '🏛️', type: 'investment', isCustom: false },
    { name: 'Index Funds', icon: '📊', type: 'investment', isCustom: false },
  ])
}
