'use client'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CartLine } from '@/lib/types'
import { formatIDR } from '@/lib/catalog'
import { cartTotal, clearCart } from '@/lib/cart'
import { useStoreSettings } from '@/components/store-settings-context'

export function Checkout({ lines }: { lines: CartLine[] }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const { settings } = useStoreSettings()
  const formRef = useRef<HTMLFormElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Escape untuk menutup + kunci scroll body saat modal terbuka
  useEffect(() => {
    if (!open) return
    const listener = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', listener)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', listener)
      document.body.style.overflow = prev
    }
  }, [open])

  // Kembalikan fokus ke tombol pemicu saat modal ditutup
  useEffect(() => { if (!open) triggerRef.current?.focus() }, [open])

  // Focus trap sederhana (Tab/Shift+Tab tetap di dalam modal)
  function trapFocus(e: React.KeyboardEvent) {
    if (e.key !== 'Tab' || !formRef.current) return
    const focusables = formRef.current.querySelectorAll<HTMLElement>(
      'button,input,textarea,select,a[href],[tabindex]:not([tabindex="-1"])'
    )
    if (!focusables.length) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }

  const total = cartTotal(lines)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 2 || address.trim().length < 5) {
      setError('Nama minimal 2 karakter dan alamat minimal 5 karakter.')
      return
    }
    setError('')
    setSending(true)
    // Buka tab WA SEGERA (masih dalam gesture klik — menghindari popup blocker),
    // lalu isi URL setelah inquiry tercatat. about:blank → wa.me redirect.
    const wa = window.open('about:blank', '_blank')
    if (!wa) {
      setSending(false)
      setError('Pop-up WhatsApp diblokir browser. Izinkan pop-up lalu coba lagi — keranjangmu tetap aman.')
      return
    }
    const order = lines.map((line, i) =>
      `${i + 1}. [${line.code}] ${line.name}, ${formatIDR(line.promoPrice ?? line.price)}`
    ).join('\n')
    const message =
      `Halo Kak, saya ingin memesan barang berikut.\n\nNama: ${name.trim()}\nAlamat: ${address.trim()}\n\nPesanan:\n${order}\n\nTotal: ${formatIDR(total)}\n\nMohon informasi ketersediaan barang, ongkir, dan metode pembayarannya. Terima kasih.`
    // Catat inquiry ke DB (best-effort — kegagalan tidak memblokir handoff WA)
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          subtotal: total,
          items: lines.map((l) => ({ code: l.code, name: l.name, price: l.promoPrice ?? l.price })),
        }),
      })
    } catch { /* jaringan putus — WA tetap jalan */ }
    wa.location.href = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`
    try { wa.opener = null } catch { /* sebagian browser menolak setter — abaikan */ }
    setSending(false)
    clearCart()
    setOpen(false)
  }

  const modal = open && (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      onKeyDown={trapFocus}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50, /* di atas CS widget (z-40) */
        display: 'grid', placeItems: 'center',
        background: 'rgba(38,54,74,.4)', padding: 16,
        overflowY: 'auto',
      }}
    >
      <form
        ref={formRef}
        onSubmit={submit}
        style={{ width: 'min(100%,480px)', maxHeight: '100%', overflowY: 'auto', background: 'var(--cream)', padding: 24, borderRadius: 16, boxShadow: '0 20px 50px #26364a44' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 id="checkout-title" style={{ margin: 0 }}>Lanjutkan pesanan</h2>
            <p style={{ margin: '5px 0 18px', color: 'var(--muted)' }}>Masukkan nama dan lokasi agar admin dapat menindaklanjuti pesananmu.</p>
          </div>
          <button type="button" ref={closeRef} aria-label="Tutup" onClick={() => setOpen(false)} style={{ border: 0, background: 'transparent', fontSize: 24, height: 36 }}>×</button>
        </div>
        <label className="field">Nama
          <input autoFocus value={name} onChange={e => setName(e.target.value)} minLength={2} maxLength={60} required />
        </label>
        <label className="field" style={{ marginTop: 12 }}>Alamat
          <textarea value={address} onChange={e => setAddress(e.target.value)} minLength={5} maxLength={300} required />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Batal</button>
          <button className="btn" disabled={sending}>{sending ? 'Membuka WhatsApp…' : 'Pesan via WhatsApp'}</button>
        </div>
      </form>
    </div>
  )

  return <>
    <button ref={triggerRef} className="btn" onClick={() => setOpen(true)} disabled={!lines.length}>Lanjutkan pesanan</button>
    {typeof document === 'object' && createPortal(modal, document.body)}
  </>
}
