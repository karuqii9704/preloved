'use client'
import { useMemo, useState } from 'react'
import { Product } from '@/lib/types'
import { ProductCard } from '@/components/product-card'

const ALL = 'Semua kategori'

export function ShopBrowser({ products }: { products: Product[] }) {
  const categories = useMemo(() => [ALL, ...Array.from(new Set(products.map((p) => p.category))).sort()], [products])

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(ALL)
  const [sort, setSort] = useState('Terbaru')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = products.filter((p) => {
      const matchQ = !q || `${p.name} ${p.code} ${p.shortDescription}`.toLowerCase().includes(q)
      const matchC = category === ALL || p.category === category
      return matchQ && matchC
    })
    if (sort === 'Harga terendah') list = [...list].sort((a, b) => (a.promoPrice ?? a.price) - (b.promoPrice ?? b.price))
    if (sort === 'Harga tertinggi') list = [...list].sort((a, b) => (b.promoPrice ?? b.price) - (a.promoPrice ?? a.price))
    return list
  }, [products, query, category, sort])

  return (
    <>
      <form role="search" className="shop-filters" onSubmit={(e) => e.preventDefault()}>
        <label className="field">
          <span className="sr-only">Cari produk</span>
          <input
            type="search"
            placeholder="Cari produk"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select aria-label="Kategori" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select aria-label="Urutkan" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option>Terbaru</option>
          <option>Harga terendah</option>
          <option>Harga tertinggi</option>
        </select>
      </form>
      <p className="shop-result-count" role="status" aria-live="polite">
        {filtered.length} barang ditemukan
      </p>
      {filtered.length ? (
        <div className="grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      ) : (
        <p className="shop-empty">Tidak ada barang yang cocok. Coba kata kunci lain atau ganti kategori.</p>
      )}
    </>
  )
}
