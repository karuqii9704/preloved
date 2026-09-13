# Preloved Store

Storefront preloved (thrift) mobile-first untuk penjual perorangan/kecil.
Pembeli menjelajah katalog → keranjang → **modal form Nama + Alamat** → diarahkan ke
chat WhatsApp admin. Stok, ongkir, dan pembayaran dinegosiasikan di WhatsApp —
tanpa payment gateway, tanpa akun pembeli.

- **Framework:** Next.js 15 (App Router, TypeScript) + Tailwind CSS v4
- **Database/Auth:** Supabase (Postgres + Auth + Storage) — *opsional, app tetap jalan tanpa DB (mode demo)*
- **Testing:** Playwright E2E (desktop + mobile)
- **Deploy:** Vercel (push `main` = deploy)

---

## Daftar Isi

1. [Quick Start](#1-quick-start)
2. [Environment Variables](#2-environment-variables)
3. [Setup Database & Akun Admin (Credential)](#3-setup-database--akun-admin-credential)
4. [Admin Dashboard](#4-admin-dashboard)
5. [Alur Pembeli (Storefront)](#5-alur-pembeli-storefront)
6. [Titip Jual (Consignment)](#6-titip-jual-consignment)
7. [Asisten CS "Prelo"](#7-asisten-cs-prelo)
8. [Struktur Proyek](#8-struktur-proyek)
9. [Testing](#9-testing)
10. [Build & Deploy](#10-build--deploy)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Quick Start

```bash
# 1) Install dependency
npm install

# 2) (Opsional tapi disarankan) siapkan .env.local — lihat bagian 2-3
cp .env.example .env.local

# 3) Jalankan dev server
npm run dev
# → http://localhost:3000
```

**Mode demo (tanpa `.env.local`):** katalog statis dari `lib/catalog.ts`, kontak
memakai fallback WA `6285123071588`, halaman `/admin` selalu redirect ke login, dan
API admin menolak permintaan (503). Tidak ada akses publik ke admin.

**Script yang tersedia:**

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server (`localhost:3000`) |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan hasil build |
| `npm run typecheck` | Cek tipe TypeScript (`tsc --noEmit`) |
| `npm run lint` | ESLint *(catatan: butuh `eslint.config` flat config — belum ada di repo)* |
| `npm run test:e2e` | Playwright E2E (otomatis menyalakan dev server) |

---

## 2. Environment Variables

Buat `.env.local` di root (sudah di-`.gitignore`, **jangan pernah di-commit**):

```env
# Wajib untuk admin dashboard + penyimpanan pengaturan ke DB
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Hanya dipakai server-side (API routes & server components).
# TIDAK PERNAH dikirim ke browser.
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Opsional — dipakai untuk absolute URL (OG image, dsb.)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

| Variabel | Dipakai oleh | Wajib? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | middleware, login, semua API Supabase | Untuk admin: **ya** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | login admin (browser client) | Untuk admin: **ya** |
| `SUPABASE_SERVICE_ROLE_KEY` | API routes & dashboard (server-side only) | Untuk dashboard: **ya** |

> Ketiga nilai didapat dari **Supabase Dashboard → Project Settings → API**.
> Restart `npm run dev` setelah mengubah env.

---

## 3. Setup Database & Akun Admin (Credential)

> **Penting:** aplikasi ini **tidak punya username/password default yang tercetak
> di kode**. Credential admin **kamu buat sendiri** lewat Supabase Auth, jadi
> tidak ada kredensial yang bisa bocor dari repo ini. Panduan lengkap juga ada di
> [`docs/SETUP-DATABASE-ADMIN.md`](docs/SETUP-DATABASE-ADMIN.md).

### 3.1 Buat project Supabase

1. Buka <https://supabase.com> → **New project** (plan gratis cukup).
2. Setelah siap, buka **Project Settings → API**, salin 3 nilai (URL, `anon` key,
   `service_role` key) ke `.env.local` seperti di bagian 2.

### 3.2 Jalankan migrasi SQL

Buka **SQL Editor** di dashboard Supabase, jalankan **berurutan** isi dua file
(keduanya idempotent — aman diulang):

1. `supabase/migrations/202607220001_initial_schema.sql` — seluruh skema:
   tabel `products`, `categories`, `profiles`, `consignment_requests`,
   `store_settings`, `order_inquiries`, `highlight_slides`, `offers`, RLS policy,
   storage buckets (`public-assets`, `consignment-private`).
2. `supabase/migrations/202609060001_settings_facebook_seed.sql` — kolom
   `facebook_url`, baris `store_settings` awal (WA `6285123071588`), kategori
   default (Pakaian/Aksesori/Sepatu).

### 3.3 Buat akun admin (inilah "credential"-nya)

1. Di Supabase: **Authentication → Users → Add user**
   - isi **email** + **password** milikmu (ini yang dipakai login),
   - centang **Auto Confirm User**.
2. Naikkan akun itu jadi admin — jalankan di SQL Editor (ganti emailnya):

```sql
insert into public.profiles (id, role, display_name)
select id, 'admin', 'Pemilik Toko' from auth.users where email = 'email@adminmu.com'
on conflict (id) do nothing;
```

3. Login di **`/admin/login`** dengan email + password tersebut.

**Cara kerja autentikasi (dua lapis):**

- **Middleware** (`middleware.ts`): setiap request ke `/admin/*` diverifikasi —
  session Supabase valid **dan** baris `profiles.role = 'admin'` untuk user itu.
  Gagal → redirect ke `/admin/login`. Request ke `/api/admin/*` gagal → 401 JSON
  (bukan redirect).
- **RLS database:** tabel hanya bisa ditulis oleh role `admin` (fungsi
  `private.is_admin()`); pembaca anon dibatasi ke produk yang published.

Menambah admin lain: ulangi langkah 1-2 dengan email orang tersebut.
Mencabut akses: hapus barisnya di tabel `profiles` (atau nonaktifkan user di
Supabase Auth).

---

## 4. Admin Dashboard

Setelah login, semua halaman berada di bawah `/admin` (nav: `components/admin-nav.tsx`):

| Route | Menu | Fungsi |
|---|---|---|
| `/admin` | Ringkasan | Statistik toko: produk tersedia/reserved/terjual, Titip Jual baru, total inquiry — langsung dari Supabase (`service_role`, server-side) |
| `/admin/products` | Produk | Kelola katalog (list; form baru di `/admin/products/new`) |
| `/admin/products/new` | — | Form produk baru |
| `/admin/products/[id]` | — | Edit produk |
| `/admin/consignments` | Titip Jual | Review/menyetujui/menolak request Titip Jual |
| `/admin/orders` | Inquiry | Catatan inquiry WhatsApp |
| `/admin/categories` | Kategori | Atur nama, slug, urutan kategori |
| `/admin/slides` | Slides | Atur highlight & CTA |
| `/admin/offers` | Offers | Atur harga promo & periode |
| `/admin/settings` | Pengaturan | **Ubah Nomor WhatsApp, Instagram, Facebook, nama toko** |

Halaman Pengaturan (`/admin/settings`) menyimpan ke tabel `store_settings` via
`PUT /api/admin/settings` (divalidasi zod: WA harus 8-16 digit, IG/FB harus URL
valid). Perubahan langsung aktif di seluruh toko:

- tombol **"Pesan via WhatsApp"** di modal checkout,
- link eskalasi admin di asisten CS,
- link Instagram/Facebook di footer.

> Halaman Produk/Slides/Offers/Kategori/Orders/Consignments saat ini masih
> **halaman kerangka** (`components/admin-list.tsx`) — menampilkan pesan
> "Belum ada data" hingga CRUD-nya disambungkan. Yang berfungsi penuh:
> Ringkasan, Pengaturan, dan semua proteksi login.

**Logout:** tombol "Keluar" di kanan nav admin (menghapus session Supabase).

---

## 5. Alur Pembeli (Storefront)

| Route | Isi |
|---|---|
| `/` & `/brief` | Landing untuk calon mitra |
| `/home` | Hero + katalog pilihan |
| `/shop` | Katalog dengan **filter yang berfungsi** |
| `/products/[slug]` | Detail produk + tombol tambah-ke-keranjang |
| `/cart` | Keranjang + tombol "Lanjutkan pesanan" |
| `/offers`, `/highlighted`, `/how-it-works`, `/tutorial`, `/get-started` | Halaman pendukung |
| `/titip-jual` | Form pengajuan consignment (tanpa akun) |
| `/syarat-titip-jual` | Syarat & ketentuan |

### Perilaku kunci

- **Item unik:** barang preloved tidak bisa ditumpuk — tombol berubah jadi
  "Sudah di keranjang ✓" dan disabled; keranjang menolak duplikat/qty>1
  (sanitasi otomatis di `lib/cart.ts`, state `preloved-cart-v1` di localStorage).
- **Animasi tambah-ke-keranjang:** klik → spinner "Menambahkan…" (~450 ms) →
  ceklis muncul dengan animasi pop; badge keranjang di header ikut **bounce**
  saat count bertambah. Semua animasi hanya `transform`/`opacity` dan mati
  otomatis bila user mengaktifkan `prefers-reduced-motion`.
- **Filter `/shop`:** pencarian (nama/kode PLV-xxxx/deskripsi), dropdown kategori
  (otomatis dari kategori produk tersedia), sort (Terbaru/Harga terendah/
  Harga tertinggi — harga promo dihitung), penghitung "N barang ditemukan",
  dan empty state.
- **Checkout:** tombol "Lanjutkan pesanan" **selalu** membuka **modal form**
  (portal, full-viewport, focus-trap, Escape untuk tutup) berisi **Nama** (min 2
  karakter) dan **Alamat** (min 5 karakter). Setelah valid → tab WhatsApp terbuka
  dengan pesan yang sudah berisi nama, alamat, rincian pesanan, dan total.
  Keranjang dikosongkan hanya bila tab WA benar-benar terbuka (deteksi popup
  blocker).
- **Nomor WhatsApp tujuan** diambil dari `/api/settings` (DB) dengan fallback
  `6285123071588`.

---

## 6. Titip Jual (Consignment)

Form di `/titip-jual` (tanpa akun): nama, WA, email opsional, nama produk,
kategori, kondisi, deskripsi, harga bersih yang diharapkan, 1-6 foto
(JPEG/PNG/WebP, max 5 MB), + persetujuan syarat.

- `POST /api/consignments` → data masuk tabel `consignment_requests`,
  foto masuk bucket storage **private** `consignment-private` (hanya admin
  yang bisa membaca).
- Tanpa env Supabase: request diterima tapi hanya mode demo (`{ok:true, demo:true}`).
- Status consignment: `pending → reviewing → approved → published` (atau
  `rejected`/`withdrawn`; `sold`/`settled` setelah selesai) — dikelola admin.

---

## 7. Asisten CS "Prelo"

Widget melayang kanan-bawah (`components/cs-widget.tsx`) — chat stateless,
tanpa API key, tanpa LLM eksternal:

- Intent rutin (harga/stok/kondisi/titip jual/cara pesan) dijawab **grounded**
  dari katalog (`lib/cs/engine.ts`) — tidak ada angka yang diarangka bebas.
- Komplain / minta "admin" → **eskalasi otomatis**: tombol membuka WhatsApp
  dengan rangkuman 6 pesan terakhir + alasan eskalasi
  (`lib/cs/index.ts`, nomor dari pengaturan toko).
- Endpoint: `POST /api/cs-chat` — tidak menyimpan percakapan.

---

## 8. Struktur Proyek

```text
app/
  (public storefront)
    page.tsx, home/, shop/, products/[slug]/, cart/, offers/, highlighted/,
    how-it-works/, tutorial/, get-started/, titip-jual/, syarat-titip-jual/, brief/
  admin/
    login/page.tsx                # login Supabase Auth
    (dashboard)/                 # SEMUA di bawah sini dilindungi middleware
      page.tsx                    # ringkasan statistik
      products/, consignments/, orders/, categories/, slides/, offers/, settings/
  api/
    cs-chat/route.ts              # asisten CS (stateless)
    consignments/route.ts         # submit titip jual (+ upload foto)
    settings/route.ts             # pengaturan publik (WA untuk storefront)
    admin/settings/route.ts       # PUT pengaturan (admin only, middleware)
components/
  store-header.tsx                # header + badge keranjang (bounce)
  checkout.tsx                    # modal form Nama+Alamat → WhatsApp
  add-to-cart.tsx                 # spinner → ceklis animasi
  product-card.tsx, footer.tsx, store-shell.tsx, cs-widget.tsx,
  admin-nav.tsx, admin-list.tsx, store-settings-context.tsx
lib/
  cart.ts                         # localStorage cart + sanitasi (item unik)
  catalog.ts                      # katalog statis (mode demo) + formatIDR
  store-settings.ts               # baca pengaturan (DB → fallback default)
  supabase.ts, types.ts
  cs/                             # engine, intent, kb asisten CS
middleware.ts                     # proteksi /admin & /api/admin (session + role)
supabase/migrations/              # 2 file SQL idempotent
tests/e2e/                        # storefront, interactions, responsive
docs/                             # SETUP-DATABASE-ADMIN.md + verification screenshots
```

---

## 9. Testing

```bash
# Semua (dev server otomatis dinyalakan bila belum ada)
npm run test:e2e

# Kalau dev server sudah jalan — pakai ini (lebih cepat)
BASE_URL=http://127.0.0.1:3000 npx playwright test

# Project tertentu saja
BASE_URL=http://127.0.0.1:3000 npx playwright test --project=chromium
BASE_URL=http://127.0.0.1:3000 npx playwright test --project=mobile
```

Suite saat ini (3 file, 15 test — dijalankan di 2 project: desktop + mobile):

- `storefront.spec.ts` — smoke belanja, item unik (tidak menumpuk), modal
  checkout full-viewport + Escape, sanitasi keranjang korup warisan bug lama,
  validasi form + deep-link WhatsApp.
- `interactions.spec.ts` — spinner → ceklis add-to-cart, badge bump, filter
  shop (kategori/search/sort/empty state), mobile layout.
- `responsive.spec.ts` — semua route muat viewport Pixel 5 + navigasi mobile.

Asumsi fixture: katalog statis memuat "Cardigan Rajut Biru" (PLV-0001) dst.
di `lib/catalog.ts` — kalau katalog demo diubah, sesuaikan test.

---

## 10. Build & Deploy

```bash
npm run build   # lulus = bebas type error
```

Deploy standar: Vercel → import repo → set 3 env var Supabase di
Project Settings → Environment Variables → Deploy. Setiap push ke `main`
mendeploy ulang.

**Sebelum publish, checklist:**

- [ ] Env Supabase terisi di platform deploy
- [ ] Migrasi SQL sudah dijalankan di project Supabase
- [ ] Akun admin dibuat + role `admin` di tabel `profiles`
- [ ] Nomor WhatsApp diubah di `/admin/settings` dari fallback
- [ ] `npm run build` lulus

---

## 11. Troubleshooting

| Gejala | Penyebab & solusi |
|---|---|
| `/admin` selalu redirect ke login, login gagal | `.env.local` belum ada / belum diisi → login butuh URL + anon key; isi lalu restart dev server |
| Login sukses tapi langsung dilempar balik | Baris `profiles` untuk user itu belum ada atau `role ≠ 'admin'` → jalankan SQL di [3.3](#33-buat-akun-admin-inilah-credentialnya) |
| Dashboard menampilkan "—" semua | `SUPABASE_SERVICE_ROLE_KEY` belum diset (server-side) → cek env, restart |
| Halaman admin CRUD bilang "Belum ada data" | Normal — halaman itu masih kerangka; kelola data langsung dari Supabase Table Editor |
| Nomor WA yang terpakai masih `6285123071588` | Itu fallback. Ubah di `/admin/settings` (butuh DB aktif) |
| `npm run lint` error "couldn't find eslint.config" | Pre-existing: ESLint 9 butuh flat config yang belum ada di repo |
| E2E timeout `net::ERR_ABORTED` di startup | Dev server lama masih menggantung di port 3000 → matikan proses node lama, nyalakan ulang |
| Foto titip jual gagal upload | Cek maks 6 foto, tiap foto ≤5 MB, tipe JPEG/PNG/WebP, dan bucket `consignment-private` sudah dibuat (migrasi #1) |

---

Dibuat sebagai proyek v1 sesuai PRD (`preview.md`) — sengaja tanpa payment
gateway, akun pembeli, atau portal pesanan pembeli.
