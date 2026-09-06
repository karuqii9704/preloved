// Keranjang localStorage — satu sumber kebenaran untuk semua komponen.
// Barang preloved = item unik: kuantitas selalu 1, tidak bisa ditumpuk.
import { CartLine } from './types'

export const CART_KEY = 'preloved-cart-v1'
/** Event dispatch setiap isi keranjang berubah (dipakai header & cart page). */
export const CART_EVENT = 'cart-updated'

/** Baca + sanitasi: buang baris rusak, qty>1 (warisan bug lama), duplikat id.
 *  Self-healing: hasil sanitasi ditulis balik bila berbeda dari isi asli. */
export function readCart(): CartLine[] {
  let raw: unknown
  const rawText = localStorage.getItem(CART_KEY) || '[]'
  try {
    raw = JSON.parse(rawText)
  } catch {
    localStorage.setItem(CART_KEY, '[]')
    return []
  }
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const clean: CartLine[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const line = item as Partial<CartLine>
    if (typeof line.id !== 'string' || !line.id) continue
    if (typeof line.name !== 'string') continue
    if (typeof line.price !== 'number') continue
    if (seen.has(line.id)) continue
    seen.add(line.id)
    clean.push({
      id: line.id,
      code: typeof line.code === 'string' ? line.code : '',
      name: line.name,
      price: line.price,
      promoPrice: typeof line.promoPrice === 'number' ? line.promoPrice : undefined,
      status: line.status ?? 'available',
      image: typeof line.image === 'string' ? line.image : '',
      quantity: 1, // item unik — tidak pernah ditumpuk
    })
  }
  // Self-healing: bila sanitasi mengubah isi, simpan balik + beri tahu komponen lain
  const cleanText = JSON.stringify(clean)
  if (cleanText !== rawText) {
    localStorage.setItem(CART_KEY, cleanText)
    window.dispatchEvent(new Event(CART_EVENT))
  }
  return clean
}

export function writeCart(lines: CartLine[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(lines))
  window.dispatchEvent(new Event(CART_EVENT))
}

/** Tambah item; idempotent — kalau sudah ada, tidak menambah kuantitas.
 *  Return true kalau benar-benar baru ditambahkan. */
export function addToCart(line: Omit<CartLine, 'quantity'>): boolean {
  const cart = readCart()
  if (cart.some((x) => x.id === line.id)) return false
  cart.push({ ...line, quantity: 1 })
  writeCart(cart)
  return true
}

export function removeFromCart(id: string): CartLine[] {
  const next = readCart().filter((x) => x.id !== id)
  writeCart(next)
  return next
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY)
  window.dispatchEvent(new Event(CART_EVENT))
}

export const cartTotal = (lines: CartLine[]): number =>
  lines.reduce((n, x) => n + (x.promoPrice ?? x.price) * x.quantity, 0)
