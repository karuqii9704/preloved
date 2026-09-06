'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { StoreShell } from '@/components/store-shell'
import { Checkout } from '@/components/checkout'
import { CartLine } from '@/lib/types'
import { formatIDR } from '@/lib/catalog'
import { readCart, removeFromCart, cartTotal, CART_EVENT } from '@/lib/cart'

const SAFE_IMAGE = /^https?:\/\//i

export default function Cart() {
  const [lines, setLines] = useState<CartLine[]>([])

  // Reaktif: state sinkron setiap keranjang berubah (tambah/hapus/checkout
  // dari tab lain), dan sekaligus men-sanitasi keranjang warisan bug lama.
  useEffect(() => {
    const read = () => setLines(readCart())
    read()
    window.addEventListener(CART_EVENT, read)
    window.addEventListener('storage', read)
    return () => { window.removeEventListener(CART_EVENT, read); window.removeEventListener('storage', read) }
  }, [])

  function remove(id: string) { setLines(removeFromCart(id)) }

  const total = cartTotal(lines)

  return (
    <StoreShell>
      <section className="shell section">
        <p className="eyebrow">Keranjang</p>
        <h1 style={{ marginTop: 4 }}>Pesananmu</h1>
        {!lines.length ? (
          <p>Keranjang masih kosong. <Link href="/shop" style={{ fontWeight: 700, textDecoration: 'underline' }}>Lihat barang</Link></p>
        ) : (
          <div className="cart-layout">
            <div style={{ display: 'grid', gap: 12 }}>
              {lines.map(line => (
                <article className="card cart-line" key={line.id}>
                  <div style={{ position: 'relative', width: 80, aspectRatio: '4/5', overflow: 'hidden', borderRadius: 8, flexShrink: 0, background: 'var(--rose-wash)' }}>
                    {SAFE_IMAGE.test(line.image) ? (
                      // eslint-disable-next-line @next/next/no-img-element -- src dari localStorage, domainnya tak bisa diverifikasi
                      <img src={line.image} alt={line.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : null}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="eyebrow" style={{ margin: 0 }}>{line.code}</p>
                    <strong>{line.name}</strong>
                    <p style={{ margin: '5px 0' }}>{formatIDR(line.promoPrice ?? line.price)}{line.quantity > 1 ? ` × ${line.quantity}` : ''}</p>
                    <button onClick={() => remove(line.id)} style={{ border: 0, background: 'transparent', padding: 0, color: 'var(--danger)', fontWeight: 700 }}>Hapus</button>
                  </div>
                </article>
              ))}
              <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginTop: 4 }}>
                Setiap barang preloved adalah item unik — satu barang, satu pesanan.
              </p>
            </div>
            <aside className="card" style={{ padding: 18, height: 'fit-content' }}>
              <p style={{ marginTop: 0, color: 'var(--muted)' }}>Subtotal</p>
              <p style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 18px' }}>{formatIDR(total)}</p>
              <Checkout lines={lines} />
            </aside>
          </div>
        )}
      </section>
    </StoreShell>
  )
}
