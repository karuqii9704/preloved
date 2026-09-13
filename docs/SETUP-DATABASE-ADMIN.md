# Setup Database (Supabase) & Admin Dashboard

Web ini berjalan penuh tanpa database (mode demo: katalog statis + kontak default),
tapi untuk **login admin + pengaturan WA/IG/FB tersimpan di DB**, ikuti langkah ini.

## 1. Buat project Supabase

1. Buka https://supabase.com → **New project** (plan gratis cukup).
2. Simpan password database (tidak dipakai app ini, hanya untuk Supabase sendiri).
3. Setelah project siap, buka **Project Settings → API** dan salin 3 nilai:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Jalankan migrasi SQL

Buka **SQL Editor** di dashboard Supabase, lalu jalankan **berurutan** isi dua file:

1. `supabase/migrations/202607220001_initial_schema.sql` — skema lengkap: tabel
   products, categories, profiles, consignments, store_settings, order_inquiries,
   RLS policy, storage buckets.
2. `supabase/migrations/202609060001_settings_facebook_seed.sql` — kolom
   `facebook_url`, baris `store_settings` awal (nomor WA 6285123071588), dan
   kategori default.

> Kedua file idempotent — aman dijalankan ulang.

## 3. Buat akun admin

1. Di Supabase: **Authentication → Users → Add user** (email + password, centang
   *Auto Confirm User*).
2. Jalankan di SQL Editor (ganti emailnya):

```sql
insert into public.profiles (id, role, display_name)
select id, 'admin', 'Pemilik Toko' from auth.users where email = 'email@adminmu.com'
on conflict (id) do nothing;
```

## 4. Set environment variable

Buat `.env.local` di root project (sudah di-gitignore):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Restart dev server (`npm run dev`) setelah mengisi env.

## 5. Login & pengaturan

1. Buka `/admin` → diredirect ke `/admin/login` → login dengan email admin.
2. Menu **Pengaturan** (`/admin/settings`): ubah **Nomor WhatsApp**, **Instagram**,
   **Facebook**, lalu simpan.
3. Perubahan langsung aktif di seluruh toko:
   - tombol "Pesan via WhatsApp" di checkout,
   - link eskalasi admin di asisten CS,
   - link Instagram/Facebook di footer.

## 6. Manajemen credential admin

- **Ganti password:** Supabase → Authentication → Users → klik user → *Change
  password*. Atau dari halaman login bila reset email dikonfigurasi.
- **Tambah admin baru:** Add user (langkah 3) → jalankan ulang `insert into
  public.profiles ... where email = '<email baru>'`.
- **Cabut akses:** hapus baris user di tabel `profiles`, atau nonaktifkan/hapus
  user di Authentication. Middleware & RLS membaca tabel `profiles`, jadi
  akses langsung berhenti.
- **Session:** login disimpan sebagai cookie session Supabase; logout lewat
  tombol "Keluar" di nav admin.
- Tidak ada kredensial default tercetak di kode — password hanya ada di Supabase
  Auth (di-hash di sana). Repo tidak menyimpan rahasia apa pun.

## Catatan keamanan
- Tanpa env Supabase: halaman admin selalu redirect ke login, API admin menolak
  permintaan (503) — tidak ada akses publik.
- `SUPABASE_SERVICE_ROLE_KEY` hanya dipakai server-side (API route), tidak pernah
  dikirim ke browser.
- Proteksi di dua lapis: middleware (verifikasi session + role `admin` di tabel
  `profiles`) dan RLS di database.
