'use client'
// Provider pengaturan toko (WA/IG/FB) untuk komponen client.
// Fetch sekali per mount dari /api/settings; fallback default bila DB belum ada.
import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, StoreSettings } from '@/lib/store-settings'

const SettingsContext = createContext<{ settings: StoreSettings }>({
  settings: DEFAULT_SETTINGS,
})

export function StoreSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    let alive = true
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (alive && data?.whatsapp_number) setSettings(data) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  return <SettingsContext.Provider value={{ settings }}>{children}</SettingsContext.Provider>
}

export const useStoreSettings = () => useContext(SettingsContext)
