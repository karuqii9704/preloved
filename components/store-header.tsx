'use client'
import Link from 'next/link'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const links=[['/home','Home'],['/shop','Shop'],['/offers','Offers'],['/titip-jual','Titip Jual'],['/get-started','Panduan']] as const

export function StoreHeader() {
  const [count,setCount]=useState(0)
  const [menuOpen,setMenuOpen]=useState(false)
  useEffect(()=>{ const read=()=>setCount(JSON.parse(localStorage.getItem('preloved-cart-v1')||'[]').reduce((n:number,x:{quantity:number})=>n+x.quantity,0)); read(); window.addEventListener('storage',read); window.addEventListener('cart-updated',read); return()=>{window.removeEventListener('storage',read);window.removeEventListener('cart-updated',read)} },[])
  const closeMenu=()=>setMenuOpen(false)
  return <header className="store-header"><div className="shell store-header-inner"><Link href="/brief" style={{fontWeight:800,fontSize:'1.25rem',letterSpacing:'-.04em'}}>preloved<span style={{color:'#b9475a'}}>.</span></Link><nav className="desktop-nav" aria-label="Navigasi utama">{links.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</nav><div className="header-actions"><Link href="/cart" aria-label={`Keranjang, ${count} produk`} style={{display:'inline-flex',alignItems:'center',gap:5,fontWeight:700}}><ShoppingBag size={18}/>{count>0&&<span style={{background:'var(--pink)',borderRadius:999,padding:'1px 6px',fontSize:12}}>{count}</span>}</Link><button type="button" className="mobile-menu-toggle" aria-label={menuOpen?'Tutup navigasi':'Buka navigasi'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={()=>setMenuOpen(open=>!open)}>{menuOpen?<X size={20}/>:<Menu size={20}/>}</button></div></div>{menuOpen&&<nav id="mobile-navigation" className="mobile-menu" aria-label="Navigasi utama"><div className="shell">{links.map(([href,label])=><Link key={href} href={href} onClick={closeMenu}>{label}</Link>)}</div></nav>}</header>
}
