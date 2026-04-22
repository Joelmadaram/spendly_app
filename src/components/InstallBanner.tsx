import { useState, useEffect } from 'react'

export default function InstallBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Show iOS install hint if in Safari and not already installed
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as { standalone?: boolean }).standalone
    const dismissed = localStorage.getItem('install-dismissed')
    if (isIOS && !isInStandaloneMode && !dismissed) {
      setTimeout(() => setShow(true), 2000)
    }
  }, [])

  if (!show) return null

  return (
    <div className="bg-indigo-600 px-4 py-3 flex items-start gap-3 text-sm">
      <span className="text-xl">📲</span>
      <div className="flex-1">
        <p className="font-semibold">Install Spendly</p>
        <p className="text-indigo-200 text-xs">Tap <strong>Share</strong> then <strong>"Add to Home Screen"</strong> for the best experience.</p>
      </div>
      <button
        onClick={() => { setShow(false); localStorage.setItem('install-dismissed', '1') }}
        className="text-indigo-200 text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}
