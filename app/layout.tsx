import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Preloved — Barang baik, cerita baru',
  description: 'Koleksi preloved pilihan yang dirawat dengan baik.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>
}
