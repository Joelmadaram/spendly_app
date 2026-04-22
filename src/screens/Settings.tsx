/// <reference types="vite-plugin-pwa/react" />
import { useState } from 'react'
import { useStore } from '../store'
import { useRegisterSW } from 'virtual:pwa-register/react'

const AVATARS = ['🧑', '👩', '👨', '🧒', '👧', '👦', '🧓', '👴', '👵', '🐶', '🐱', '🦊']

export default function Settings() {
  const { members, addMember, categories } = useStore()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🧑')
  const [showForm, setShowForm] = useState(false)

  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await addMember(name.trim(), avatar)
    setName('')
    setAvatar('🧑')
    setShowForm(false)
  }

  const customCats = categories.filter((c) => c.isCustom)

  return (
    <div className="px-4 pt-4 space-y-4">
      <h1 className="text-2xl font-bold text-white">Settings ⚙️</h1>

      {/* PWA status */}
      <div className="bg-slate-800 rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">App Status</h2>
        {offlineReady && (
          <p className="text-emerald-400 text-sm">✅ App ready to work offline</p>
        )}
        {needRefresh && (
          <div className="flex items-center gap-3">
            <p className="text-amber-400 text-sm flex-1">🔄 Update available</p>
            <button
              onClick={() => updateServiceWorker(true)}
              className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg"
            >
              Update now
            </button>
          </div>
        )}
        {!offlineReady && !needRefresh && (
          <p className="text-slate-400 text-sm">Spendly · Family Expense Tracker</p>
        )}
      </div>

      {/* Family members */}
      <div className="bg-slate-800 rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Family Members</h2>
        <div className="space-y-2 mb-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 bg-slate-700 rounded-xl px-3 py-2">
              <span className="text-2xl">{m.avatar}</span>
              <span className="text-white font-medium">{m.name}</span>
            </div>
          ))}
        </div>

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full border border-dashed border-slate-600 text-slate-400 text-sm py-2.5 rounded-xl"
          >
            + Add family member
          </button>
        ) : (
          <form onSubmit={handleAddMember} className="space-y-3">
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full bg-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none"
            />
            <div>
              <p className="text-xs text-slate-400 mb-1">Pick an avatar</p>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvatar(a)}
                    className={`text-2xl p-1 rounded-lg ${avatar === a ? 'bg-indigo-600' : 'bg-slate-700'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-semibold">Add</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Custom categories */}
      {customCats.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Custom Categories</h2>
          <div className="space-y-2">
            {customCats.map((c) => (
              <div key={c.id} className="flex items-center gap-2 text-white text-sm">
                <span className="text-xl">{c.icon}</span>
                <span>{c.name}</span>
                <span className="text-xs text-slate-500 ml-auto capitalize">{c.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* iOS Install instructions */}
      <div className="bg-slate-800 rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">Install on iPhone</h2>
        <ol className="text-sm text-slate-300 space-y-1.5 list-decimal list-inside">
          <li>Open this app in <strong>Safari</strong></li>
          <li>Tap the <strong>Share</strong> button (box with arrow)</li>
          <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
          <li>Tap <strong>Add</strong> — done! 🎉</li>
        </ol>
      </div>

      <p className="text-center text-slate-600 text-xs pb-4">Spendly v1.0 · All data stored locally on your device</p>
    </div>
  )
}
