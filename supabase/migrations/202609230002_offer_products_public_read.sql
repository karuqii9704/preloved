-- Publik perlu membaca offer_products untuk menampilkan harga promo di katalog.
-- Aman: hanya SELECT, dan hanya baris yang induk offer-nya aktif & dalam periode.
create policy "public reads offer products of active offers" on public.offer_products
  for select to anon, authenticated
  using (exists (
    select 1 from public.offers o
    where o.id = offer_id
      and o.is_active
      and (o.starts_at is null or o.starts_at <= now())
      and (o.ends_at is null or o.ends_at >= now())
  ));
