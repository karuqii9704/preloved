import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const url=process.env.NEXT_PUBLIC_SUPABASE_URL
const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const isSupabaseConfigured=Boolean(url&&key)
export function browserSupabase(){if(!url||!key)throw new Error('Supabase belum dikonfigurasi');return createBrowserClient(url,key)}
export async function serverSupabase(){if(!url||!key)throw new Error('Supabase belum dikonfigurasi');const store=await cookies();return createServerClient(url,key,{cookies:{getAll:()=>store.getAll(),setAll(items: {name:string;value:string;options:Parameters<typeof store.set>[2]}[]){try{items.forEach(({name,value,options})=>store.set(name,value,options))}catch{}}}})}
