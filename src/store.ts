import { create } from 'zustand'
import { db, seedDefaults, type Entry, type Category, type Budget, type FamilyMember } from './db'
import { format } from 'date-fns'

interface AppState {
  entries: Entry[]
  categories: Category[]
  budgets: Budget[]
  members: FamilyMember[]
  currentMonth: string // "YYYY-MM"
  activeMemberId: number | null
  loading: boolean

  init: () => Promise<void>
  addEntry: (entry: Omit<Entry, 'id' | 'createdAt'>) => Promise<void>
  deleteEntry: (id: number) => Promise<void>
  addCategory: (cat: Omit<Category, 'id'>) => Promise<void>
  setBudget: (categoryId: number, amount: number) => Promise<void>
  addMember: (name: string, avatar: string) => Promise<void>
  setActiveMember: (id: number | null) => void
  setMonth: (month: string) => void
}

export const useStore = create<AppState>((set, get) => ({
  entries: [],
  categories: [],
  budgets: [],
  members: [],
  currentMonth: format(new Date(), 'yyyy-MM'),
  activeMemberId: null,
  loading: true,

  init: async () => {
    await seedDefaults()
    const [entries, categories, budgets, members] = await Promise.all([
      db.entries.toArray(),
      db.categories.toArray(),
      db.budgets.toArray(),
      db.members.toArray(),
    ])
    set({
      entries,
      categories,
      budgets,
      members,
      activeMemberId: members[0]?.id ?? null,
      loading: false,
    })
  },

  addEntry: async (entry) => {
    const id = await db.entries.add({ ...entry, createdAt: Date.now() })
    const saved = await db.entries.get(id)
    if (saved) set((s) => ({ entries: [...s.entries, saved] }))
  },

  deleteEntry: async (id) => {
    await db.entries.delete(id)
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }))
  },

  addCategory: async (cat) => {
    const id = await db.categories.add(cat)
    const saved = await db.categories.get(id)
    if (saved) set((s) => ({ categories: [...s.categories, saved] }))
  },

  setBudget: async (categoryId, amount) => {
    const month = get().currentMonth
    const existing = await db.budgets.where({ categoryId, month }).first()
    if (existing?.id) {
      await db.budgets.update(existing.id, { amount })
      set((s) => ({
        budgets: s.budgets.map((b) =>
          b.categoryId === categoryId && b.month === month ? { ...b, amount } : b
        ),
      }))
    } else {
      const id = await db.budgets.add({ categoryId, amount, period: 'monthly', month })
      const saved = await db.budgets.get(id)
      if (saved) set((s) => ({ budgets: [...s.budgets, saved] }))
    }
  },

  addMember: async (name, avatar) => {
    const id = await db.members.add({ name, avatar, createdAt: Date.now() })
    const saved = await db.members.get(id)
    if (saved) set((s) => ({ members: [...s.members, saved] }))
  },

  setActiveMember: (id) => set({ activeMemberId: id }),
  setMonth: (month) => set({ currentMonth: month }),
}))
