'use client'
import { useEffect, useState } from 'react'

type Settings = {
  store_name: string
  whatsapp_number: string
  instagram_url: string | null
  facebook_url: string | null
  contact_note: string | null
}

export default function Settings() {
  const [form, setForm] = useState<Settings>({
    store_name: '', whatsapp_number: '', instagram_url: '', facebook_url: '', contact_note: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('gagal memuat')))
      .then((data: Settings) => setForm({
        store_name: data.store_name ?? '',
        whatsapp_number: data.whatsapp_number ?? '',
        instagram_url: data.instagram_url ?? '',
        facebook_url: data.facebook_url ?? '',
        contact_note: data.contact_note ?? '',
      }))
      .catch(() => setError('Pengaturan belum dapat dimuat. Pastikan Supabase sudah terhubung.'))
      .finally(() => setLoading(false))
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSaved(false)
    const wa = form.whatsapp_number.replace(/\D/g, '')
    if (!form.store_name.trim()) { setError('Nama toko wajib diisi.'); return }
    if (wa.length < 8 || wa.length > 16) { setError('Nomor WhatsApp harus 8-16 digit (format internasional tanpa tanda +, mis. 62812xxxxxxx).'); return }
    for (const [label, url] of [['Instagram', form.instagram_url], ['Facebook', form.facebook_url]] as const) {
      if (url && !/^https?:\/\/.+/.test(url)) { setError(`${label} harus berupa URL lengkap (dimulai http:// atau https://).`); return }
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: form.store_name.trim(),
          whatsapp_number: wa,
          instagram_url: form.instagram_url?.trim() || null,
          facebook_url: form.facebook_url?.trim() || null,
          contact_note: form.contact_note?.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Gagal menyimpan pengaturan.')
      }
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.')
    } finally {
      setSaving(false)
    }
  }

  const field = (label: string, key: keyof Settings, props: Record<string, unknown> = {}) => (
    <label className="field">{label}
      <input
        value={form[key] ?? ''}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        disabled={loading || saving}
        {...props}
      />
    </label>
  )

  return (
    <main className="shell section" style={{ maxWidth: 680 }}>
      <p className="eyebrow">Admin</p>
      <h1>Pengaturan toko</h1>
      <p style={{ color: 'var(--muted)', marginTop: 0 }}>
        Nomor WhatsApp, Instagram, dan Facebook di sini otomatis dipakai tombol pesanan dan asisten CS di seluruh toko.
      </p>
      {loading ? <p>Memuat pengaturan…</p> : (
        <form onSubmit={save} style={{ display: 'grid', gap: 14 }}>
          {field('Nama toko', 'store_name', { required: true, maxLength: 60 })}
          {field('Nomor WhatsApp (format internasional tanpa +, mis. 62812xxxxxxx)', 'whatsapp_number', { inputMode: 'numeric', placeholder: '62812xxxxxxx', required: true })}
          {field('Instagram (URL lengkap)', 'instagram_url', { type: 'url', placeholder: 'https://instagram.com/akunmu' })}
          {field('Facebook (URL lengkap)', 'facebook_url', { type: 'url', placeholder: 'https://facebook.com/halamanku' })}
          <label className="field">Catatan kontak
            <textarea
              value={form.contact_note ?? ''}
              onChange={e => setForm(f => ({ ...f, contact_note: e.target.value }))}
              maxLength={300}
              disabled={loading || saving}
            />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          {saved && <p role="status" style={{ color: '#155b3b', fontWeight: 700, margin: 0 }}>Pengaturan tersimpan. Nomor kontak baru langsung aktif di seluruh toko.</p>}
          <button className="btn" style={{ width: 'fit-content' }} disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan pengaturan'}
          </button>
        </form>
      )}
    </main>
  )
}
