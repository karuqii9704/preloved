'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Category = { id: string; name: string }

// Form tambah produk — insert ke Supabase (products + product_images + upload foto).
export default function ProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const form = e.currentTarget
    const data = new FormData(form)
    const photos = data.getAll('photos').filter((x): x is File => x instanceof File && x.size > 0)

    if (!data.get('name') || !data.get('price')) { setError('Nama dan harga wajib diisi.'); return }
    if (photos.length < 1 || photos.length > 8) { setError('Unggah 1 sampai 8 foto produk.'); return }
    if (photos.some((p) => p.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(p.type))) {
      setError('Foto harus JPEG/PNG/WebP maksimal 5 MB.'); return
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) { setError('Supabase belum terkonfigurasi.'); return }
    setSaving(true)
    try {
      const supabase = createBrowserClient(url, key)
      // user admin login → RLS admin policy mengizinkan insert
      const name = String(data.get('name'))
      const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'produk'
      const slug = `${slugBase}-${Date.now().toString(36).slice(-4)}`
      const { data: product, error: insertError } = await supabase.from('products').insert({
        slug,
        name,
        category_id: data.get('category') ? String(data.get('category')) : null,
        price_idr: Number(data.get('price')) || 0,
        condition: String(data.get('condition') || 'good'),
        status: String(data.get('status') || 'draft'),
        description_short: String(data.get('short') || ''),
        description: String(data.get('description') || ''),
        is_highlighted: data.get('highlighted') === 'on',
        published_at: data.get('status') === 'available' ? new Date().toISOString() : null,
      }).select('id').single()
      if (insertError || !product) throw new Error(insertError?.message ?? 'Insert gagal')

      for (const [index, photo] of photos.entries()) {
        const path = `products/${product.id}/${index}-${photo.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
        const { error: uploadError } = await supabase.storage.from('public-assets').upload(path, photo, { contentType: photo.type })
        if (uploadError) throw new Error('Foto gagal diunggah: ' + uploadError.message)
        await supabase.from('product_images').insert({ product_id: product.id, storage_path: path, alt_text: name, sort_order: index })
      }
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan produk.')
      setSaving(false)
    }
  }

  return (
    <main className="shell section" style={{ maxWidth: 800 }}>
      <p><Link href="/admin/products">← Produk</Link></p>
      <p className="eyebrow" style={{ marginTop: 24 }}>Produk baru</p>
      <h1>Tambah produk</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 14, marginTop: 20 }}>
        <label className="field">Nama produk<input name="name" required maxLength={140} /></label>
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
          <label className="field">Kategori
            <select name="category" required>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="field">Harga (IDR)<input name="price" type="number" min="0" step="1000" required /></label>
          <label className="field">Kondisi
            <select name="condition" required>
              <option value="like_new">Like new</option>
              <option value="very_good">Sangat baik</option>
              <option value="good" selected>Baik</option>
              <option value="fair">Layak</option>
            </select>
          </label>
          <label className="field">Status
            <select name="status" required>
              <option value="draft">Draft (belum tampil)</option>
              <option value="available">Tersedia (tampil di toko)</option>
              <option value="reserved">Sedang dipesan</option>
            </select>
          </label>
        </div>
        <label className="field">Deskripsi singkat<input name="short" maxLength={180} placeholder="Maks 180 karakter — tampil di kartu produk" /></label>
        <label className="field">Deskripsi lengkap<textarea name="description" required /></label>
        <label className="field">Foto produk
          <input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple required />
          <small style={{ color: 'var(--muted)', fontWeight: 400 }}>Maksimal 8 gambar, 5 MB per gambar. Gambar pertama jadi foto utama.</small>
        </label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" name="highlighted" style={{ width: 18, height: 18 }} />
          Tampilkan sebagai highlighted
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" style={{ width: 'fit-content' }} disabled={saving}>
          {saving ? <><span className="spinner" style={{ borderTopColor: 'var(--ink)' }} /> Menyimpan…</> : 'Simpan produk'}
        </button>
      </form>
    </main>
  )
}
