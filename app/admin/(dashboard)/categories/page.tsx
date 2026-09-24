import { createClient } from '@supabase/supabase-js'
import { AdminEmpty } from '@/components/admin-empty'

// Kategori katalog — nama, slug, urutan, status. Dipakai filter di storefront.
export const dynamic = 'force-dynamic'

type Row = { id: string; name: string; slug: string; description: string | null; sort_order: number; is_active: boolean; products: { id: string }[] }

export default async function Categories() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  let rows: Row[] | null = null
  if (url && key) {
    const admin = createClient(url, key, { auth: { persistSession: false } })
    const { data, error } = await admin
      .from('categories')
      .select('id,name,slug,description,sort_order,is_active,products(id)')
      .order('sort_order')
    if (!error) rows = data as unknown as Row[]
  }

  return (
    <main className="shell section">
      <div className="admin-head motion-in">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 style={{ margin: '4px 0' }}>Kategori</h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Atur nama, urutan, dan status kategori. Kategori aktif muncul di filter katalog.</p>
        </div>
      </div>
      {rows === null ? (
        <AdminEmpty title="Gagal memuat kategori" body="Periksa koneksi Supabase." />
      ) : rows.length === 0 ? (
        <AdminEmpty title="Belum ada kategori" body="Tambahkan kategori lewat SQL editor Supabase (tabel categories)." />
      ) : (
        <div className="admin-scroll motion-in-2">
          <table className="admin-table">
            <thead>
              <tr><th>Nama</th><th>Slug</th><th>Deskripsi</th><th>Urutan</th><th>Produk</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 750 }}>{r.name}</td>
                  <td><code style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{r.slug}</code></td>
                  <td><span className="admin-sub">{r.description ?? '—'}</span></td>
                  <td>{r.sort_order}</td>
                  <td>{r.products.length}</td>
                  <td>{r.is_active ? <span className="pill pill-ok">Aktif</span> : <span className="pill pill-off">Nonaktif</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
