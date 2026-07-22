'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, Circle, Play, X } from 'lucide-react'
import { StoreShell } from '@/components/store-shell'

const steps = [
  { title: 'Mulai dari katalog', text: 'Gunakan Shop untuk membandingkan barang berdasarkan kategori dan harga.', href: '/shop', cta: 'Buka Shop' },
  { title: 'Periksa detail barang', text: 'Cek kondisi, kode produk, foto, dan harga sebelum menambahkannya ke keranjang.', href: '/products/cardigan-rajut-biru', cta: 'Lihat contoh produk' },
  { title: 'Lanjutkan ke WhatsApp', text: 'Isi nama dan alamat. Admin akan mengonfirmasi stok, ongkir, dan metode pembayaran lewat WhatsApp.', href: '/cart', cta: 'Buka keranjang' },
  { title: 'Ajukan Titip Jual', text: 'Kirim detail barang tanpa akun. Admin menilai barang dan menetapkan harga jual setelah kurasi.', href: '/titip-jual', cta: 'Buka Titip Jual' },
]

export default function Tutorial() {
  const [active, setActive] = useState(false)
  const [done, setDone] = useState<number[]>([])
  function finish(index: number) {
    setDone(current => current.includes(index) ? current : [...current, index])
  }

  return (
    <StoreShell>
      <section className="shell section" style={{ maxWidth: 840 }}>
        <Link href="/get-started" style={{ fontWeight: 700 }}>Kembali ke brief</Link>
        <p className="eyebrow" style={{ marginTop: 28 }}>Panduan penggunaan</p>
        <h1 className="page-title">Pahami alurnya sebelum mulai.</h1>
        <p style={{ maxWidth: 620, color: 'var(--muted)' }}>
          Panduan ini hanya berjalan saat kamu mengaktifkannya. Ikuti empat langkah untuk melihat cara katalog, pesanan WhatsApp, dan Titip Jual bekerja.
        </p>
        {!active ? (
          <section style={{ marginTop: 28, padding: 20, border: '1px solid #f4cfdd', borderRadius: 16, background: 'var(--rose-wash)' }}>
            <h2 style={{ marginTop: 0 }}>Panduan belum dimulai</h2>
            <p>Kamu dapat menutupnya kapan saja tanpa mengubah data atau pesanan.</p>
            <button className="btn" onClick={() => setActive(true)}><Play size={16} /> Mulai panduan</button>
          </section>
        ) : (
          <section style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{done.length} dari {steps.length} langkah selesai</p>
              <button className="btn btn-secondary" onClick={() => { setActive(false); setDone([]) }}><X size={16} /> Tutup panduan</button>
            </div>
            <ol style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
              {steps.map((step, index) => {
                const complete = done.includes(index)
                return (
                  <li key={step.title} style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: 14, padding: 18, border: '1px solid var(--line)', borderRadius: 14, background: complete ? '#eef7ee' : '#fffdf9' }}>
                    {complete ? <Check aria-label="Selesai" color="#48734c" /> : <Circle aria-hidden="true" color="var(--muted)" />}
                    <div>
                      <h2 style={{ fontSize: '1.08rem', margin: '0 0 5px' }}>{index + 1}. {step.title}</h2>
                      <p style={{ margin: '0 0 13px', color: 'var(--muted)' }}>{step.text}</p>
                      <Link href={step.href} onClick={() => finish(index)} className="btn btn-secondary">{step.cta}</Link>
                    </div>
                  </li>
                )
              })}
            </ol>
            {done.length === steps.length && (
              <div role="status" style={{ marginTop: 18, padding: 18, borderRadius: 14, background: 'var(--pink-soft)' }}>
                <strong>Panduan selesai.</strong> Kamu sudah memahami alur utama Preloved. <Link href="/home" style={{ textDecoration: 'underline', fontWeight: 700 }}>Jelajahi storefront</Link>.
              </div>
            )}
          </section>
        )}
      </section>
    </StoreShell>
  )
}
