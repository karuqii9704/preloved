'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

// Ganti password akun admin yang sedang login (Supabase Auth).
export function ChangePassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setDone(false)
    if (password.length < 8) { setError('Password minimal 8 karakter.'); return }
    if (password !== confirm) { setError('Konfirmasi password tidak sama.'); return }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) { setError('Supabase belum terkonfigurasi.'); return }
    setSaving(true)
    const supabase = createBrowserClient(url, key)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (error) { setError('Gagal mengganti password. Coba keluar lalu masuk kembali.'); return }
    setDone(true)
    setPassword(''); setConfirm('')
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 14, marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
      <h2 style={{ margin: 0 }}>Ganti password admin</h2>
      <label className="field">Password baru
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required autoComplete="new-password" />
      </label>
      <label className="field">Ulangi password baru
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} minLength={8} required autoComplete="new-password" />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      {done && <p role="status" style={{ color: '#155b3b', fontWeight: 700, margin: 0 }}>Password berhasil diganti. Berlaku untuk login berikutnya.</p>}
      <button className="btn btn-secondary" style={{ width: 'fit-content' }} disabled={saving}>
        {saving ? 'Menyimpan…' : 'Ganti password'}
      </button>
    </form>
  )
}
