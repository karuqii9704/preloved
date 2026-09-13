import { test, expect } from '@playwright/test'

test('add-to-cart shows loading spinner then check state', async ({ page }) => {
  await page.goto('/products/cardigan-rajut-biru')
  const btn = page.locator('.add-to-cart-btn')
  await expect(btn).toContainText('Tambah ke keranjang')
  await btn.click()
  // fase loading: spinner tampil
  await expect(btn).toContainText('Menambahkan…')
  await expect(btn.locator('.spinner')).toBeVisible()
  // fase selesai: ceklis pop + label final, tombol terkunci
  await expect(btn).toContainText('Sudah di keranjang ✓', { timeout: 4000 })
  await expect(btn.locator('.check-pop')).toBeVisible()
  await expect(btn).toBeDisabled()
  // benar-benar masuk keranjang
  const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('preloved-cart-v1') || '[]'))
  expect(cart).toHaveLength(1)
  expect(cart[0].code).toBe('PLV-0001')
})

test('cart badge bumps when an item is added', async ({ page }) => {
  await page.goto('/products/cardigan-rajut-biru')
  await page.locator('.add-to-cart-btn').click()
  // badge muncul dengan nilai 1
  const badge = page.locator('.cart-badge')
  await expect(badge).toBeVisible()
  await expect(badge).toHaveText('1')
  // animasi bump aktif (atribut data-bump sempat terpasang)
  await expect(badge).toHaveAttribute('data-bump', 'true', { timeout: 2000 })
})

test('shop filters actually filter the catalog', async ({ page }) => {
  await page.goto('/shop')
  // semua produk available tampil: 3 (loafer reserved disembunyikan)
  await expect(page.locator('.grid article')).toHaveCount(3)
  await expect(page.getByRole('status')).toContainText(/3/i)

  // kategori Aksesori → hanya tas kulit
  await page.getByLabel('Kategori').selectOption('Aksesori')
  await expect(page.locator('.grid article')).toHaveCount(1)
  await expect(page.locator('.grid article')).toContainText('Tas Kulit Klasik')

  // kategori Pakaian → cardigan + kemeja
  await page.getByLabel('Kategori').selectOption('Pakaian')
  await expect(page.locator('.grid article')).toHaveCount(2)

  // kembali ke semua + cari "cardigan"
  await page.getByLabel('Kategori').selectOption('Semua kategori')
  await page.getByPlaceholder('Cari produk').fill('cardigan')
  await expect(page.locator('.grid article')).toHaveCount(1)
  await expect(page.locator('.grid article')).toContainText('Cardigan Rajut Biru')

  // search juga menangkap kode produk (PLV-0002)
  await page.getByPlaceholder('Cari produk').fill('PLV-0002')
  await expect(page.locator('.grid article')).toHaveCount(1)
  await expect(page.locator('.grid article')).toContainText('Tas Kulit Klasik')

  // search tanpa hasil → empty state
  await page.getByPlaceholder('Cari produk').fill('zzzz')
  await expect(page.locator('.grid article')).toHaveCount(0)
  await expect(page.getByText(/Tidak ada barang yang cocok/i)).toBeVisible()
  // bersihkan → semua kembali
  await page.getByPlaceholder('Cari produk').fill('')
  await expect(page.locator('.grid article')).toHaveCount(3)

  // sort harga terendah: kemeja (145rb) tampil duluan
  await page.getByLabel('Urutkan').selectOption('Harga terendah')
  const first = page.locator('.grid article').first()
  await expect(first).toContainText('Kemeja Linen Putih')
  // sort harga tertinggi: tas (279rb promo) duluan
  await page.getByLabel('Urutkan').selectOption('Harga tertinggi')
  await expect(page.locator('.grid article').first()).toContainText('Tas Kulit Klasik')
})

test('shop filtering does not break the mobile layout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/shop')
  await page.getByPlaceholder('Cari produk').fill('tas')
  await expect(page.locator('.grid article')).toHaveCount(1)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
