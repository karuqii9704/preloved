'use client'
import { useEffect, useState } from 'react'
import { Product } from '@/lib/types'
import { addToCart, readCart, CART_EVENT } from '@/lib/cart'

type Phase = 'idle' | 'adding' | 'added'

export function AddToCart({ product }: { product: Product }) {
  const unavailable = product.status !== 'available'
  const [phase, setPhase] = useState<Phase>('idle')
  const [inCart, setInCart] = useState(false)

  // Sinkron dengan keranjang: ceklis mengikuti isi keranjang lintas
  // tab/halaman. Kalau item dihapus dari keranjang, phase 'added' di-reset.
  useEffect(() => {
    const read = () => {
      const has = readCart().some((x) => x.id === product.id)
      setInCart(has)
      setPhase((p) => (p === 'added' && !has ? 'idle' : p))
    }
    read()
    window.addEventListener(CART_EVENT, read)
    return () => window.removeEventListener(CART_EVENT, read)
  }, [product.id])

  function add() {
    if (unavailable || inCart || phase !== 'idle') return
    setPhase('adding')
    // Loading singkat sebagai feedback taktil; penambahan sebenarnya instan (localStorage).
    setTimeout(() => {
      const added = addToCart({
        id: product.id, code: product.code, name: product.name,
        price: product.price, promoPrice: product.promoPrice,
        status: product.status, image: product.image,
      })
      if (!added) setInCart(true) // sudah ada dari tab lain — anggap selesai
      setPhase(added ? 'added' : 'idle')
    }, 450)
  }

  const done = inCart || phase === 'added'
  const label = unavailable ? 'Tidak tersedia'
    : phase === 'adding' ? 'Menambahkan…'
    : done ? 'Sudah di keranjang ✓'
    : 'Tambah ke keranjang'

  return (
    <button
      type="button"
      className="btn add-to-cart-btn"
      data-phase={phase}
      onClick={add}
      disabled={unavailable || inCart}
      style={unavailable ? { opacity: .55, cursor: 'not-allowed' } : undefined}
      aria-label={done ? `${product.name} sudah ada di keranjang` : label === 'Tambah ke keranjang' ? `Tambah ${product.name} ke keranjang` : label}
      aria-live="polite"
    >
      {phase === 'adding'
        ? <span className="spinner" aria-hidden="true" />
        : done && <span className="check-pop" aria-hidden="true">✓</span>}
      <span>{label}</span>
    </button>
  )
}
