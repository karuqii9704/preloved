-- 20260906_settings_facebook_seed
-- Tambah kolom Facebook + seed baris store_settings + seed kategori awal.
-- Idempotent (amankan jalur ulang).

-- 1) Kolom facebook_url (jika belum ada)
do $$ begin
  alter table public.store_settings add column if not exists facebook_url text;
end $$;

-- 2) Seed baris settings default (id boolean primary key, hanya boleh 1 baris)
insert into public.store_settings (id, store_name, whatsapp_number, instagram_url, facebook_url, contact_note)
values (true, 'preloved.', '6285123071588', null, null, null)
on conflict (id) do nothing;

-- 3) Seed kategori dasar untuk katalog
insert into public.categories (name, slug, sort_order) values
  ('Pakaian', 'pakaian', 1),
  ('Aksesori', 'aksesori', 2),
  ('Sepatu', 'sepatu', 3)
on conflict (name) do nothing;
