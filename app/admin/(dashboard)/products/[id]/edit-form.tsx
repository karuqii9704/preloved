'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Product = {
  id: string; product_code: string; slug: string; name: string; price_idr: number
  condition: string; status: string; is_highlighted: boolean
  description_short: string; description: string; published_at: string | null
  categories: { id: string; name: string } | null
}
type Image_ = { id: string; storage_path: string; alt_text: string; sort_order: number }
type Category = { id: string; name: string }

const STATUSES = [
  ['draft', 'Draft (belum tampil)'],
  ['available', 'Tersedia (tampil di toko)'],
  ['reserved', 'Sedang dipesan'],
  ['sold', 'Terjual'],
  ['archived', 'Diarsipkan'],
] as const

export default function EditProduct({ product, images, categories }: { product: Product; images: Image_[]; categories: Category[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [status, setStatus] = useState(product.status)

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(''); setSaved(false)
    const data = new FormData(e.currentTarget)
    const nextStatus = String(data.get('status'))
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) { setError('Supabase belum terkonfigurasi.'); return }
    setSaving(true)
    const supabase = createBrowserClient(url, key)
    const { error: err } = await supabase.from('products').update({
      name: String(data.get('name')),
      category_id: data.get('category') ? String(data.get('category')) : null,
      price_idr: Number(data.get('price')) || 0,
      condition: String(data.get('condition')),
      status: nextStatus,
      description_short: String(data.get('short')),
      description: String(data.get('description')),
      is_highlighted: data.get('highlighted') === 'on',
      published_at: nextStatus === 'available' && !product.published_at ? new Date().toISOString() : product.published_at,
      updated_at: new Date().toISOString(),
    }).eq('id', product.id)
    setSaving(false)
    if (err) { setError('Gagal menyimpan: ' + err.message); return }
    setSaved(true)
    router.refresh()
  }

  async function remove() {
    if (!confirm(`Hapus produk "${product.name}"? Foto ikut terhapus. Tindakan ini permanen.`)) return
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return
    setDeleting(true)
    const supabase = createBrowserClient(url, key)
    // kosongkan path foto di bucket dulu
    for (const img of images) {
      await supabase.storage.from('public-assets').remove([img.storage_path]).catch(() => null)
    }
    const { error } = await supabase.from('products').delete().eq('id', product.id)
    if (error) { setError('Gagal menghapus: ' + error.message); setDeleting(false); return }
    router.push('/admin/products')
    router.refresh()
  }

  const publicUrl = (p: string) => {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL
    return base ? `${base}/storage/v1/object/public/public-assets/${p}` : p
  }

  return (
    <main className="shell section" style={{ maxWidth: 800 }}>
      <p><Link href="/admin/products">← Produk</Link></p>
      <p className="eyebrow" style={{ marginTop: 24 }}>{product.product_code}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ margin: '4px 0' }}>Edit produk</h1>
        <Link href={`/products/${product.slug}`} className="btn btn-secondary" style={{ minHeight: 38, fontSize: '.85rem' }}>Lihat di toko</Link>
      </div>

      {images.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '18px 0' }}>
          {images.map((im) => (
            <Image key={im.id} className="admin-thumb" src={publicUrl(im.storage_path)} alt={im.alt_text} width={72} height={72} style={{ width: 72, height: 72 }} />
          ))}
        </div>
      )}

      <form onSubmit={save} style={{ display: 'grid', gap: 14, marginTop: 8 }}>
        <label className="field">Nama produk<input name="name" defaultValue={product.name} required maxLength={140} /></label>
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
          <label className="field">Kategori
            <select name="category" defaultValue={product.categories?.id ?? ''}>
              <option value="">Tanpa kategori</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="field">Harga (IDR)<input name="price" type="number" min="0" step="1000" defaultValue={product.price_idr} required /></label>
          <label className="field">Kondisi
            <select name="condition" defaultValue={product.condition}>
              <option value="like_new">Like new</option>
              <option value="very_good">Sangat baik</option>
              <option value="good">Baik</option>
              <option value="fair">Layak</option>
            </select>
          </label>
          <label className="field">Status
            <select name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        </div>
        <label className="field">Deskripsi singkat<input name="short" maxLength={180} defaultValue={product.description_short} /></label>
        <label className="field">Deskripsi lengkap<textarea name="description" defaultValue={product.description} required /></label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" name="highlighted" defaultChecked={product.is_highlighted} style={{ width: 18, height: 18 }} />
          Tampilkan sebagai highlighted
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        {saved && <p role="status" style={{ color: '#155b3b', fontWeight: 700, margin: 0 }}>Perubahan tersimpan.</p>}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" style={{ width: 'fit-content' }} disabled={saving}>
            {saving ? <><span className="spinner" /> Menyimpan…</> : 'Simpan perubahan'}
          </button>
          <button type="button" className="btn btn-secondary" style={{ width: 'fit-content' }} onClick={remove} disabled={deleting}>
            {deleting ? 'Menghapus…' : 'Hapus produk'}
          </button>
        </div>
      </form>
    </main>
  )
}
