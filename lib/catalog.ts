import { Product } from './types'

export const products: Product[] = [
  { id:'1', code:'PLV-0001', slug:'cardigan-rajut-biru', name:'Cardigan Rajut Biru', category:'Pakaian', price:185000, condition:'very_good', status:'available', shortDescription:'Rajut lembut, jatuh rapi.', description:'Cardigan rajut warna biru muda. Kondisi sangat baik, tanpa noda atau sobek.', image:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80', featured:true },
  { id:'2', code:'PLV-0002', slug:'tas-kulit-klasik', name:'Tas Kulit Klasik', category:'Aksesori', price:325000, promoPrice:279000, condition:'good', status:'available', shortDescription:'Tas tangan kulit dengan patina cantik.', description:'Tas kulit klasik dengan kompartemen utama dan tali pendek. Ada tanda pakai wajar di sudut.', image:'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', featured:true },
  { id:'3', code:'PLV-0003', slug:'kemeja-linen-putih', name:'Kemeja Linen Putih', category:'Pakaian', price:145000, condition:'like_new', status:'available', shortDescription:'Linen ringan untuk hari cerah.', description:'Kemeja linen putih dengan siluet rileks. Dipakai kurang dari tiga kali.', image:'https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=800&q=80' },
  { id:'4', code:'PLV-0004', slug:'sepatu-loafer-cokelat', name:'Sepatu Loafer Cokelat', category:'Sepatu', price:220000, condition:'good', status:'reserved', shortDescription:'Loafer nyaman dengan sol kuat.', description:'Sepatu loafer cokelat ukuran 38. Ada sedikit lipatan pemakaian pada bagian depan.', image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
]
export const formatIDR = (amount:number) => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(amount)
export const activeProducts = products.filter((p)=>p.status === 'available')
export const bySlug = (slug:string) => products.find((p)=>p.slug===slug)
