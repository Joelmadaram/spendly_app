/// <reference types="vite-plugin-pwa/react" />
import { useState } from 'react'
import { useStore } from '../store'
import { useRegisterSW } from 'virtual:pwa-register/react'
import type { FamilyMember } from '../db'

const AVATARS = ['🧑', '👩', '👨', '🧒', '👧', '👦', '🧓', '👴', '👵', '🐶', '🐱', '🦊']

export default function Settings() {
  const { members, addMember, updateMember, deleteMember, categories } = useStore()

  // "add" form state
  const [showAdd, setShowAdd]     = useState(false)
  const [newName, setNewName]     = useState('')
  const [newAvatar, setNewAvatar] = useState('🧑')

  // which member is being edited
  const [editingId, setEditingId]       = useState<number | null>(null)
  const [editName, setEditName]         = useState('')
  const [editAvatar, setEditAvatar]     = useState('🧑')

  const {
    offlineReady: [offlineReady],
    needRefresh:  [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  function startEdit(m: FamilyMember) {
    setEditingId(m.id!)
    setEditName(m.name)
    setEditAvatar(m.avatar)
  }

  async function saveEdit() {
    if (!editName.trim() || editingId === null) return
    await updateMember(editingId, editName.trim(), editAvatar)
    setEditingId(null)
  }

  async function handleDelete(id: number) {
    if (members.length <= 1) return // always keep at least one member
    await deleteMember(id)
    if (editingId === id) setEditingId(null)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    await addMember(newName.trim(), newAvatar)
    setNewName('')
    setNewAvatar('🧑')
    setShowAdd(false)
  }

  const customCats = categories.filter((c) => c.isCustom)

  return (
    <div className="px-4 pt-4 space-y-4">
      <h1 className="text-2xl font-bold text-white">Settings ⚙️</h1>

      {/* PWA status */}
      <div className="bg-slate-800 rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">App Status</h2>
        {offlineReady && <p className="text-emerald-400 text-sm">✅ App ready to work offline</p>}
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
          {members.map((m) =>
            editingId === m.id ? (
              // ── Inline edit form ──────────────────────────────────────────
              <div key={m.id} className="bg-slate-700 rounded-2xl p-3 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    maxLength={2}
                    className="w-12 bg-slate-600 text-white rounded-xl text-center text-xl outline-none py-2 shrink-0"
                  />
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveEdit() }}
                    placeholder="Name"
                    className="flex-1 bg-slate-600 text-white rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setEditAvatar(a)}
                      className={`text-xl p-1 rounded-lg ${editAvatar === a ? 'bg-indigo-600' : 'bg-slate-600'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-semibold"
                  >
                    Save
                  </button>
                  {members.length > 1 && (
                    <button
                      onClick={() => handleDelete(m.id!)}
                      className="bg-red-900 text-red-300 px-3 py-2 rounded-xl text-sm"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-slate-600 text-slate-300 px-3 py-2 rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // ── Member row ────────────────────────────────────────────────
              <button
                key={m.id}
                onClick={() => startEdit(m)}
                className="w-full flex items-center gap-3 bg-slate-700 rounded-xl px-3 py-2.5 text-left"
              >
                <span className="text-2xl">{m.avatar}</span>
                <span className="text-white font-medium flex-1">{m.name}</span>
                <span className="text-slate-500 text-xs">Edit</span>
              </button>
            )
          )}
        </div>

        {/* Add member */}
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full border border-dashed border-slate-600 text-slate-400 text-sm py-2.5 rounded-xl"
          >
            + Add family member
          </button>
        ) : (
          <form onSubmit={handleAdd} className="space-y-3 pt-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={newAvatar}
                onChange={(e) => setNewAvatar(e.target.value)}
                maxLength={2}
                className="w-12 bg-slate-700 text-white rounded-xl text-center text-xl outline-none py-2 shrink-0"
              />
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name"
                className="flex-1 bg-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setNewAvatar(a)}
                  className={`text-xl p-1 rounded-lg ${newAvatar === a ? 'bg-indigo-600' : 'bg-slate-700'}`}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-semibold">
                Add
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm">
                Cancel
              </button>
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
