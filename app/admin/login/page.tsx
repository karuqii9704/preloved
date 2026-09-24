'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
export default function Login(){const [error,setError]=useState('');async function login(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const data=new FormData(e.currentTarget),url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key){setError('Hubungkan Supabase untuk mengaktifkan login admin.');return}const supabase=createBrowserClient(url,key);const {error}=await supabase.auth.signInWithPassword({email:String(data.get('email')),password:String(data.get('password'))});if(error){setError('Email atau password tidak valid.');return}
// Full reload, bukan router.replace: prefetch /admin sebelum login men-cache
// redirect 307 di Router Cache Next.js, sehingga replace() memantul balik ke login.
window.location.assign('/admin')}return <main className="shell" style={{minHeight:'100vh',display:'grid',placeItems:'center'}}><form onSubmit={login} style={{width:'min(100%,420px)',background:'white',padding:24,border:'1px solid var(--line)',borderRadius:16}}><Link href="/" style={{fontWeight:800}}>preloved.</Link><h1>Masuk admin</h1><label className="field">Email<input name="email" type="email" required/></label><label className="field" style={{marginTop:12}}>Password<input name="password" type="password" required/></label>{error&&<p className="error" role="alert">{error}</p>}<button className="btn" style={{width:'100%',marginTop:18}}>Masuk</button></form></main>}
