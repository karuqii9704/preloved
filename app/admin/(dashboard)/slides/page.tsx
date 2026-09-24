import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { AdminEmpty } from '@/components/admin-empty'

// Highlight slides — banner beranda. Dijadwalkan lewat starts_at/ends_at.
export const dynamic = 'force-dynamic'

type Row = {
  id: string; image_path: string; eyebrow: string | null; title: string; body: string | null
  cta_label: string; cta_type: string; cta_target: string; sort_order: number
  is_active: boolean; starts_at: string | null; ends_at: string | null
}

function window_(r: Row): { label: string; cls: string } {
  const now = Date.now()
  if (!r.is_active) return { label: 'Nonaktif', cls: 'pill-off' }
  if (r.starts_at && new Date(r.starts_at).getTime() > now) return { label: 'Terjadwal', cls: 'pill-mute' }
  if (r.ends_at && new Date(r.ends_at).getTime() < now) return { label: 'Berakhir', cls: 'pill-off' }
  return { label: 'Tayang', cls: 'pill-ok' }
}

export default async function Slides() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  let rows: Row[] | null = null
  if (url && key) {
    const admin = createClient(url, key, { auth: { persistSession: false } })
    const { data, error } = await admin
      .from('highlight_slides')
      .select('id,image_path,eyebrow,title,body,cta_label,cta_type,cta_target,sort_order,is_active,starts_at,ends_at')
      .order('sort_order')
    if (!error) rows = data as unknown as Row[]
  }

  return (
    <main className="shell section">
      <div className="admin-head motion-in">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 style={{ margin: '4px 0' }}>Slides</h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Atur gambar, CTA, urutan, dan jadwal highlight beranda.</p>
        </div>
      </div>
      {rows === null ? (
        <AdminEmpty title="Gagal memuat slides" body="Periksa koneksi Supabase." />
      ) : rows.length === 0 ? (
        <AdminEmpty title="Belum ada slide" body="Tambahkan slide lewat SQL editor Supabase (tabel highlight_slides) untuk mengisi banner beranda." />
      ) : (
        <div className="admin-scroll motion-in-2">
          <table className="admin-table">
            <thead>
              <tr><th>Gambar</th><th>Judul</th><th>CTA</th><th>Urutan</th><th>Jadwal</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const w = window_(r)
                const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '—'
                return (
                  <tr key={r.id}>
                    <td style={{ width: 92 }}>
                      {r.image_path ? (
                        <Image className="admin-thumb" style={{ width: 74, height: 52 }} src={r.image_path} alt={r.title} width={74} height={52} />
                      ) : <div className="admin-thumb" aria-hidden="true" />}
                    </td>
                    <td>
                      {r.eyebrow && <div className="admin-sub" style={{ textTransform: 'uppercase', letterSpacing: '.08em' }}>{r.eyebrow}</div>}
                      <strong>{r.title}</strong>
                      {r.body && <div className="admin-sub">{r.body}</div>}
                    </td>
                    <td>
                      <span className="pill pill-mute">{r.cta_label}</span>
                      <div className="admin-sub">{r.cta_type}: {r.cta_target}</div>
                    </td>
                    <td>{r.sort_order}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmt(r.starts_at)} – {fmt(r.ends_at)}</td>
                    <td><span className={`pill ${w.cls}`}>{w.label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
