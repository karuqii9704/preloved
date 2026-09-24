'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/** Bar progres tipis di atas viewport — muncul saat navigasi / loading. */
export function RouteProgress() {
  const pathname = usePathname()
  const [active, setActive] = useState(false)

  // Setiap perubahan pathname = navigasi selesai; tampilkan kilat lalu sembunyikan.
  useEffect(() => {
    setActive(true)
    const t = setTimeout(() => setActive(false), 480)
    return () => clearTimeout(t)
  }, [pathname])

  // Tangkap klik link internal → mulai progres segera (instant feedback).
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin || url.pathname === location.pathname) return
      setActive(true)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return <div className="route-progress" data-active={active || undefined} aria-hidden="true" />
}
