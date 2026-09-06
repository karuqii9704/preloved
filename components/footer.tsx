'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, StoreSettings } from '@/lib/store-settings'

export function Footer() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.whatsapp_number) setSettings(data) })
      .catch(() => {})
  }, [])

  return (
    <footer style={{ borderTop: '1px solid var(--line)', padding: '2rem 0', marginTop: '2rem' }}>
      <div className="shell" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', fontSize: '.9rem' }}>
        <strong>{settings.store_name}</strong>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/how-it-works">Cara pesan</Link>
          <Link href="/titip-jual">Titip Jual</Link>
          <Link href="/syarat-titip-jual">Syarat</Link>
          {settings.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">Instagram</a>}
          {settings.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer">Facebook</a>}
        </div>
        <span style={{ color: 'var(--muted)' }}>Barang terpilih, informasi yang terbuka.</span>
      </div>
    </footer>
  )
}
