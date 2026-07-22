export type ProductStatus = 'draft' | 'available' | 'reserved' | 'sold' | 'archived'
export type Condition = 'like_new' | 'very_good' | 'good' | 'fair'
export type Product = { id:string; code:string; slug:string; name:string; category:string; price:number; promoPrice?:number; condition:Condition; status:ProductStatus; shortDescription:string; description:string; image:string; featured?:boolean }
export type CartLine = Pick<Product, 'id'|'code'|'name'|'price'|'promoPrice'|'status'|'image'> & { quantity:number }
export type ConsignmentStatus = 'pending'|'reviewing'|'approved'|'published'|'rejected'|'withdrawn'|'sold'|'settled'
