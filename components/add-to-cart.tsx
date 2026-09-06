'use client'
import { useEffect, useState } from 'react'
import { Product } from '@/lib/types'
import { addToCart, readCart, CART_EVENT } from '@/lib/cart'

export function AddToCart({ product }: { product: Product }) {
  const unavailable = product.status !== 'available'
  const [inCart, setInCart] = useState(false)

  useEffect(() => {
    const read = () => setInCart(readCart().some((x) => x.id === product.id))
    read()
    window.addEventListener(CART_EVENT, read)
    return () => window.removeEventListener(CART_EVENT, read)
  }, [product.id])

  function add() {
    const added = addToCart({
      id: product.id, code: product.code, name: product.name,
      price: product.price, promoPrice: product.promoPrice,
      status: product.status, image: product.image,
    })
    if (added) setInCart(true) // kalau sudah ada: tidak menambah apa pun
  }

  return (
    <button
      type="button"
      className="btn"
      onClick={add}
      disabled={unavailable || inCart}
      style={unavailable ? { opacity: .55, cursor: 'not-allowed' } : undefined}
      aria-label={inCart ? `${product.name} sudah ada di keranjang` : `Tambah ${product.name} ke keranjang`}
    >
      {unavailable ? 'Tidak tersedia' : inCart ? 'Sudah di keranjang ✓' : 'Tambah ke keranjang'}
    </button>
  )
}
