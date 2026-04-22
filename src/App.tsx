import { useEffect, useState } from 'react'
import { useStore } from './store'
import Dashboard from './screens/Dashboard'
import AddEntry from './screens/AddEntry'
import Budgets from './screens/Budgets'
import History from './screens/History'
import Settings from './screens/Settings'
import BottomNav from './components/BottomNav'
import InstallBanner from './components/InstallBanner'

export type Screen = 'dashboard' | 'add' | 'budgets' | 'history' | 'settings'

export default function App() {
  const { init, loading } = useStore()
  const [screen, setScreen] = useState<Screen>('dashboard')

  useEffect(() => { init() }, [init])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-900">
        <div className="text-4xl animate-pulse">💸</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white max-w-lg mx-auto relative">
      <InstallBanner />
      <main className="flex-1 overflow-y-auto scroll-ios pb-20">
        {screen === 'dashboard' && <Dashboard />}
        {screen === 'add' && <AddEntry onDone={() => setScreen('dashboard')} />}
        {screen === 'budgets' && <Budgets />}
        {screen === 'history' && <History />}
        {screen === 'settings' && <Settings />}
      </main>
      <BottomNav current={screen} onChange={setScreen} />
    </div>
  )
}
