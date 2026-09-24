-- Seed katalog awal: kategori + 4 produk contoh yang tampil publik.
-- Idempotent: pakai slug unik; aman dijalankan ulang.

insert into public.categories (name, slug, description, sort_order) values
  ('Pakaian', 'pakaian', 'Atasan, luaran, dan pakaian harian.', 1),
  ('Aksesori', 'aksesori', 'Tas, dompet, dan aksesori pelengkap.', 2),
  ('Sepatu', 'sepatu', 'Sepatu dan alas kaki preloved.', 3)
on conflict (slug) do nothing;

with c as (select id, name from public.categories)
insert into public.products (slug, name, category_id, price_idr, description_short, description, condition, status, is_highlighted, published_at)
select * from (values
  ('cardigan-rajut-biru','Cardigan Rajut Biru',(select id from c where name='Pakaian'),185000,'Rajut lembut, jatuh rapi.','Cardigan rajut warna biru muda. Kondisi sangat baik, tanpa noda atau sobek.','very_good','available',true, now()),
  ('tas-kulit-klasik','Tas Kulit Klasik',(select id from c where name='Aksesori'),325000,'Tas tangan kulit dengan patina cantik.','Tas kulit klasik dengan kompartemen utama dan tali pendek. Ada tanda pakai wajar di sudut.','good','available',true, now()),
  ('kemeja-linen-putih','Kemeja Linen Putih',(select id from c where name='Pakaian'),145000,'Linen ringan untuk hari cerah.','Kemeja linen putih dengan siluet rileks. Dipakai kurang dari tiga kali.','like_new','available',false, now()),
  ('sepatu-loafer-cokelat','Sepatu Loafer Cokelat',(select id from c where name='Sepatu'),220000,'Loafer nyaman dengan sol kuat.','Sepatu loafer cokelat ukuran 38. Ada sedikit lipatan pemakaian pada bagian depan.','good','reserved',false, now())
) as v(slug, name, category_id, price_idr, description_short, description, condition, status, is_highlighted, published_at)
on conflict (slug) do nothing;

insert into public.product_images (product_id, storage_path, alt_text, sort_order)
select p.id, u.path, p.name, 0
from public.products p
join (values
  ('cardigan-rajut-biru','https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80'),
  ('tas-kulit-klasik','https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'),
  ('kemeja-linen-putih','https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=800&q=80'),
  ('sepatu-loafer-cokelat','https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80')
) as u(slug, path) on u.slug = p.slug
where not exists (select 1 from public.product_images pi where pi.product_id = p.id and pi.sort_order = 0);
