'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

export default function Login() {
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const data = new FormData(e.currentTarget)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) { setError('Hubungkan Supabase untuk mengaktifkan login admin.'); return }
    setSending(true)
    const supabase = createBrowserClient(url, key)
    const { error } = await supabase.auth.signInWithPassword({ email: String(data.get('email')), password: String(data.get('password')) })
    if (error) { setError('Email atau password tidak valid.'); setSending(false); return }
    // Full reload, bukan router.replace: prefetch /admin sebelum login men-cache
    // redirect 307 di Router Cache Next.js, sehingga replace() memantul balik ke login.
    window.location.assign('/admin')
  }

  return (
    <main className="shell" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px 0' }}>
      <form onSubmit={login} className="motion-in" style={{ width: 'min(100%,420px)', background: '#fffdf9', padding: 28, border: '1px solid var(--line)', borderRadius: 18, boxShadow: '0 18px 44px rgba(38,54,74,.08)' }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: '1.15rem' }}>preloved<span style={{ color: 'var(--pink-strong)' }}>.</span></Link>
        <h1 style={{ margin: '18px 0 4px' }}>Masuk admin</h1>
        <p style={{ color: 'var(--muted)', margin: '0 0 18px', fontSize: '.92rem' }}>Panel untuk mengelola katalog, titip jual, dan inquiry.</p>
        <label className="field">Email<input name="email" type="email" required autoComplete="username" /></label>
        <label className="field" style={{ marginTop: 12 }}>Password<input name="password" type="password" required autoComplete="current-password" /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" style={{ width: '100%', marginTop: 18 }} disabled={sending}>
          {sending ? <><span className="spinner" /> Memeriksa…</> : 'Masuk'}
        </button>
      </form>
    </main>
  )
}
