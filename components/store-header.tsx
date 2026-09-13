'use client'
import Link from 'next/link'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { CART_KEY } from '@/lib/cart'

const links=[['/home','Home'],['/shop','Shop'],['/offers','Offers'],['/titip-jual','Titip Jual'],['/get-started','Panduan']] as const

export function StoreHeader() {
  const [count,setCount]=useState(0)
  const [menuOpen,setMenuOpen]=useState(false)
  const [bump,setBump]=useState(false)
  const prevCount=useRef(0)

  useEffect(()=>{ const read=()=>{ const next=JSON.parse(localStorage.getItem(CART_KEY)||'[]').reduce((n:number,x:{quantity:number})=>n+x.quantity,0)
    // Bounce hanya saat bertambah (barang masuk), bukan saat berkurang/kosong
    if(next>prevCount.current) { setBump(false); requestAnimationFrame(()=>{ setBump(true); setTimeout(()=>setBump(false),500) }) }
    prevCount.current=next; setCount(next) }; read(); window.addEventListener('storage',read); window.addEventListener('cart-updated',read); return()=>{window.removeEventListener('storage',read);window.removeEventListener('cart-updated',read)} },[])
  const closeMenu=()=>setMenuOpen(false)
  return <header className="store-header"><div className="shell store-header-inner"><Link href="/brief" className="brand">preloved<span style={{color:'var(--pink-strong)'}}>.</span></Link><nav className="desktop-nav" aria-label="Navigasi utama">{links.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</nav><div className="header-actions"><Link href="/cart" aria-label={`Keranjang, ${count} produk`} style={{display:'inline-flex',alignItems:'center',gap:5,fontWeight:700}}><ShoppingBag size={18}/>{count>0&&<span className="cart-badge" data-bump={bump||undefined}>{count}</span>}</Link><button type="button" className="mobile-menu-toggle" aria-label={menuOpen?'Tutup navigasi':'Buka navigasi'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={()=>setMenuOpen(open=>!open)}>{menuOpen?<X size={20}/>:<Menu size={20}/>}</button></div></div>{menuOpen&&<nav id="mobile-navigation" className="mobile-menu" aria-label="Navigasi utama"><div className="shell">{links.map(([href,label])=><Link key={href} href={href} onClick={closeMenu}>{label}</Link>)}</div></nav>}</header>
}
