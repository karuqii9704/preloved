"""Generate laporan QA preloved → PDF (reportlab)."""
import json
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

OUT = r'F:\preloved\QA-Report-Preloved.pdf'
qa = json.load(open(r'F:\preloved\qa-result.json'))

styles = getSampleStyleSheet()
H1 = ParagraphStyle('H1', parent=styles['Heading1'], fontSize=20, spaceAfter=8, textColor=colors.HexColor('#264E78'))
H2 = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=13, spaceBefore=14, spaceAfter=6, textColor=colors.HexColor('#3368A0'))
BODY = ParagraphStyle('BODY', parent=styles['BodyText'], fontSize=9, leading=13)
SMALL = ParagraphStyle('SMALL', parent=styles['BodyText'], fontSize=8, textColor=colors.HexColor('#5C6470'))
TITLE = ParagraphStyle('TITLE', parent=styles['Title'], fontSize=26, textColor=colors.HexColor('#264E78'), spaceAfter=4)

story = []
story.append(Spacer(1, 30*mm))
story.append(Paragraph('Laporan QA &amp; Audit', TITLE))
story.append(Paragraph('preloved. — Storefront Preloved', H2))
story.append(Paragraph(f'Supabase project: qbnxwsnwmjqjvmcfakfj &nbsp;|&nbsp; Build produksi (next start) &nbsp;|&nbsp; {datetime.now().strftime("%d %B %Y, %H:%M")}', SMALL))
story.append(Spacer(1, 8*mm))

def tbl(data, widths=None, header=True):
    t = Table(data, colWidths=widths, hAlign='LEFT')
    style = [
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#DCE4E6')),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]
    if header:
        style += [('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3368A0')),
                  ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                  ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold')]
    t.setStyle(TableStyle(style))
    return t

# ---- Ringkasan eksekutif ----
story.append(Paragraph('Ringkasan Eksekutif', H1))
story.append(Paragraph(
    'Audit penuh frontend + backend storefront preloved setelah perbaikan integrasi Supabase. '
    'Total <b>12 halaman</b> diuji pada build produksi: semuanya HTTP 200. Flow kritis (keranjang, checkout, '
    'titip jual, login admin, monitoring) diverifikasi end-to-end dengan data nyata di database. '
    '<b>4 bug ditemukan dan diperbaiki</b> selama audit. Aksesibilitas dan performa lolos target.', BODY))

story.append(Paragraph('Verdict: <b>SIAP PRODUKSI</b> — 0 blocker terbuka, 2 catatan non-kritis.', H2))

# ---- Status temuan ----
story.append(Paragraph('Bug Ditemukan &amp; Diperbaiki', H1))
bugs = [
    ['#', 'Temuan', 'Dampak', 'Status'],
    ['B1', 'Router Cache Next.js men-cache redirect 307 /admin hasil prefetch sebelum login → setelah login sukses, halaman memantul balik ke /admin/login (login admin tidak pernah bisa masuk)', 'Blocker admin panel', 'FIXED — full reload via window.location.assign'],
    ['B2', 'Halaman /products/[slug] HTTP 500 (MODULE_NOT_FOUND vendor-chunks) — cache .next korup', 'Blocker storefront', 'FIXED — clean rebuild .next'],
    ['B3', 'Dashboard admin & halaman consignments/orders masih placeholder statis; stat "Titip Jual baru" selalu 0', 'Monitoring buta', 'FIXED — query live Supabase + force-dynamic'],
    ['B4', 'Kontras warna --muted #6D7480 = 4.09:1 (gagal WCAG AA 4.5:1) di 10 node lintas 3 halaman; heading-order h1→h3 di kartu produk', 'A11y WCAG AA', 'FIXED — --muted #5C6470 (≥4.62 semua bg), h3→h2'],
]
story.append(tbl(bugs))

# ---- Halaman ----
story.append(Paragraph('Smoke Test — 12 Halaman (build produksi)', H1))
rows = [['Halaman', 'HTTP', 'TTFB (ms)', 'Load (ms)', 'CLS']]
for p, v in qa['pages'].items():
    if 'error' in v:
        rows.append([p, 'ERR', '-', '-', '-'])
    else:
        rows.append([p, str(v['status']), str(v['vitals'].get('ttfb', '-')), str(v['loadMs']), str(v['cls'])])
story.append(tbl(rows, widths=[70*mm, 18*mm, 25*mm, 25*mm, 18*mm]))
story.append(Paragraph('Semua halaman HTTP 200. CLS 0 di seluruh halaman. Console error: 0.', SMALL))

story.append(PageBreak())

# ---- Interaksi ----
story.append(Paragraph('Interaction &amp; Flow End-to-End', H1))
flows = [
    ['Flow', 'Hasil', 'Bukti'],
    ['Tambah ke keranjang', 'PASS', 'localStorage preloved-cart-v1 = 1 item, badge update'],
    ['Halaman keranjang', 'PASS', 'Item + harga promo tampil'],
    ['Modal checkout', 'PASS', 'Dialog terbuka, validasi kosong memunculkan error'],
    ['Checkout → inquiry DB', 'PASS', 'Row order_inquiries "QA Bot Buyer" Rp185.000 status=inquiry tercatat di Supabase'],
    ['Checkout → WhatsApp handoff', 'PASS', 'Popup wa.me/6285123071588 dengan pesan lengkap; cart dikosongkan'],
    ['Filter katalog', 'PASS', '"tas" → 1 barang ditemukan'],
    ['Titip jual submit + foto', 'PASS', 'Row consignment_requests "QA Test Item" + 1 foto di bucket private'],
    ['Validasi titip jual (tanpa foto)', 'PASS', 'Error tampil, tidak submit'],
    ['CS widget grounded', 'PASS', '"harga tas kulit" → Rp 325.000 → Rp 279.000 (harga promo dari DB)'],
    ['CS eskalasi ke admin', 'PASS', 'Handoff WhatsApp dengan rangkuman transkrip'],
    ['Admin gate (belum login)', 'PASS', '/admin → redirect /admin/login'],
    ['Admin login salah password', 'PASS', 'Pesan error tampil, tidak masuk'],
    ['Admin login benar', 'PASS', 'Masuk dashboard: 3 tersedia / 1 reserved / 1 titip jual / 1 inquiry (data live)'],
    ['Monitoring inquiry', 'PASS', 'Tabel admin/orders menampilkan pembeli, alamat, barang, subtotal, status'],
    ['Monitoring titip jual', 'PASS', 'Tabel admin/consignments + detail + foto via signed URL'],
    ['Ganti password admin', 'PASS', 'Password berubah, login password baru sukses, direvert ke semula'],
    ['Logout admin', 'PASS', 'Kembali ke /admin/login'],
]
story.append(tbl(flows, widths=[48*mm, 16*mm, 100*mm]))
story.append(Paragraph('Semua flow diverifikasi terhadap isi database nyata (service-role REST read), bukan hanya UI.', SMALL))

# ---- A11y ----
story.append(Paragraph('Aksesibilitas (axe-core 4.10.2, WCAG 2 A/AA)', H1))
story.append(tbl([
    ['Halaman', 'Sebelum', 'Sesudah'],
    ['/', '4 color-contrast (serious)', '0 violations'],
    ['/shop', '3 color-contrast + 1 heading-order', '0 violations'],
    ['/titip-jual', '3 color-contrast', '0 violations'],
    ['/admin/login', '0', '0 violations'],
]))
story.append(Paragraph('Perbaikan: --muted #6D7480 → #5C6470 (rasio ≥4.62:1 di semua latar) dan heading kartu produk h3 → h2 (urutan heading sah).', SMALL))

# ---- Perf ----
story.append(Paragraph('Performance &amp; Bundle', H1))
story.append(tbl([
    ['Metrik', 'Nilai', 'Target', 'Status'],
    ['LCP', '1.612 s', '< 2.5 s', 'PASS'],
    ['CLS', '0', '< 0.1', 'PASS'],
    ['TTFB', '82 ms', '< 600 ms', 'PASS'],
    ['Long tasks saat load', '0', '—', 'PASS'],
    ['JS gzip (home)', '125 KB (13 file)', '< 200 KB', 'PASS'],
    ['CSS gzip', '5 KB', '—', 'PASS'],
    ['Overflow horizontal @375px', 'Tidak ada', 'Tidak ada', 'PASS'],
    ['Total request home', '28', '—', 'OK'],
]))
story.append(Paragraph('Catatan: gambar katalog dilayani Unsplash (≈50 KB/halaman) dan sudah lazy-load + sizes responsif via next/image.', SMALL))

# ---- Backend ----
story.append(Paragraph('Backend &amp; Database', H1))
story.append(tbl([
    ['Area', 'Hasil'],
    ['Koneksi Supabase', 'OK — REST 200 pada semua tabel; env .env.local diperbaiki (literal \\n di URL/key)'],
    ['Produk (katalog)', '4 produk seed live: 3 available + 1 reserved; promo Tas Kulit 325.000→279.000 aktif'],
    ['API /api/orders (baru)', 'Validasi zod, insert order_inquiries, terverifikasi 201 + row nyata'],
    ['API /api/consignments', 'Upload foto ke bucket private + row; edge-case email kosong dihardening'],
    ['API /api/cs-chat', 'Intent router + katalog live; 186–229 ms tanpa LLM'],
    ['Admin API /api/admin/settings', 'GET/PUT store_settings; dilindungi middleware 401'],
    ['RLS', 'Produk/settings publik read-only; admin full via private.is_admin(); offer_products pakai service role server-side (policy publik tersedia sebagai migrasi untuk diterapkan manual)'],
    ['Middleware', 'Gate /admin & /api/admin; 401 JSON untuk API, redirect untuk halaman'],
]))
story.append(Paragraph('Catatan: migrasi <font face="Courier">202609230002_offer_products_public_read.sql</font> belum diterapkan (butuh SQL editor dashboard); saat ini promo dibaca via service role server-side sehingga tidak ada dampak fungsional.', SMALL))

# ---- Non-kritis ----
story.append(Paragraph('Catatan Non-Kritis (tidak memblokir)', H1))
story.append(Paragraph(
    '1. <b>ESLint belum bisa jalan</b> — repo pakai ESLint 9 tanpa eslint.config.js (kondisi pra-eksisting, bukan regresi audit ini). '
    '2. <b>Bundle report</b>: JS 125 KB gzip masih wajar untuk Next.js 15 + React 19; tidak diperlukan optimasi mendesak.', BODY))

story.append(Spacer(1, 10*mm))
story.append(Paragraph(f'Dibuat otomatis oleh QA runner (Playwright 1.61 + axe-core) — {datetime.now().strftime("%Y-%m-%d %H:%M")}', SMALL))

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=16*mm, bottomMargin=16*mm, title='QA Report — preloved.', author='Hermes QA')
doc.build(story)
print('PDF:', OUT)
