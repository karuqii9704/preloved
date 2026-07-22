'use client'
import Link from 'next/link'
import { Menu, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'

export function StoreHeader() {
  const [count,setCount]=useState(0)
  useEffect(()=>{ const read=()=>setCount(JSON.parse(localStorage.getItem('preloved-cart-v1')||'[]').reduce((n:number,x:{quantity:number})=>n+x.quantity,0)); read(); window.addEventListener('storage',read); window.addEventListener('cart-updated',read); return()=>{window.removeEventListener('storage',read);window.removeEventListener('cart-updated',read)} },[])
  return <header style={{borderBottom:'1px solid var(--line)',background:'rgba(255,249,242,.92)',position:'sticky',top:0,zIndex:10,backdropFilter:'blur(10px)'}}><div className="shell" style={{height:68,display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}><Link href="/brief" style={{fontWeight:800,fontSize:'1.25rem',letterSpacing:'-.04em'}}>preloved<span style={{color:'#b9475a'}}>.</span></Link><nav aria-label="Navigasi utama" style={{display:'flex',alignItems:'center',gap:18,fontWeight:600,fontSize:'.92rem'}}><Link href="/home">Home</Link><Link href="/shop">Shop</Link><Link href="/offers">Offers</Link><Link href="/titip-jual" className="desktop-link">Titip Jual</Link><Link href="/get-started">Panduan</Link><Link href="/cart" aria-label={`Keranjang, ${count} produk`} style={{display:'inline-flex',alignItems:'center',gap:5}}><ShoppingBag size={18}/>{count>0&&<span style={{background:'var(--pink)',borderRadius:999,padding:'1px 6px',fontSize:12}}>{count}</span>}</Link><Menu size={20} aria-hidden="true"/></nav></div></header>
}
