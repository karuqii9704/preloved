import { test, expect } from '@playwright/test'

test('buyer can discover a product and add it to cart @smoke', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Pakaian yang masih punya tempat/i })).toBeVisible()
  await page.getByRole('link', { name: /Cardigan Rajut Biru/i }).click()
  await page.getByRole('button', { name: /Tambah .* ke keranjang/ }).click()
  // Barang preloved unik: setelah masuk keranjang, tombol berubah & tidak bisa ditumpuk
  await expect(page.getByRole('button', { name: /sudah ada di keranjang/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /sudah ada di keranjang/i })).toBeDisabled()
  await page.getByRole('link', { name: /Keranjang, 1 produk/i }).click()
  await expect(page.getByText('PLV-0001')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Lanjutkan pesanan' })).toBeVisible()
})

test('repeated add clicks never stack quantity (preloved items are unique)', async ({ page }) => {
  await page.goto('/products/cardigan-rajut-biru')
  const add = page.getByRole('button', { name: /Tambah .* ke keranjang/ })
  await add.click()
  // tombol langsung berubah jadi disabled — klik lanjutan tidak menambah apa pun
  const done = page.getByRole('button', { name: /sudah ada di keranjang/i })
  await expect(done).toBeDisabled()
  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => /keranjang/i.test(x.textContent ?? ''))
      ;(b as HTMLButtonElement)?.click()
    })
  }
  const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('preloved-cart-v1') || '[]'))
  expect(cart).toHaveLength(1)
  expect(cart[0].quantity).toBe(1)
  expect(cart[0].code).toBe('PLV-0001')
})

test('checkout modal covers full viewport on desktop and closes via Escape', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/products/cardigan-rajut-biru')
  await page.getByRole('button', { name: /Tambah .* ke keranjang/ }).click()
  await page.getByRole('link', { name: /Keranjang, 1 produk/i }).click()
  await page.getByRole('button', { name: 'Lanjutkan pesanan' }).click()
  const overlay = page.getByRole('dialog')
  await expect(overlay).toBeVisible()
  const geo = await overlay.evaluate((el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, w: r.width, h: r.height, vw: innerWidth, vh: innerHeight }
  })
  expect(geo.x).toBe(0)
  expect(geo.y).toBe(0)
  expect(geo.w).toBe(geo.vw)
  expect(geo.h).toBe(geo.vh)
  // form terpusat & utuh
  const form = overlay.locator('form')
  await expect(form).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(overlay).toBeHidden()
})

test('legacy corrupted cart is sanitized on cart page (qty>1, dupes, garbage)', async ({ page }) => {
  await page.goto('/cart')
  await page.evaluate(() => {
    localStorage.setItem('preloved-cart-v1', JSON.stringify([
      { id: '1', code: 'PLV-0001', name: 'Cardigan Rajut Biru', price: 185000, status: 'available', image: 'x', quantity: 7 },
      { id: '1', code: 'PLV-0001', name: 'Cardigan Rajut Biru', price: 185000, status: 'available', image: 'x', quantity: 3 },
      'garbage',
      { broken: true },
    ]))
  })
  await page.reload()
  await expect(page.getByText('PLV-0001')).toBeVisible()
  const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('preloved-cart-v1') || '[]'))
  expect(cart).toHaveLength(1)
  expect(cart[0].quantity).toBe(1)
})

test('checkout form validates and opens WhatsApp deep-link on submit', async ({ page }) => {
  await page.goto('/products/cardigan-rajut-biru')
  await page.getByRole('button', { name: /Tambah .* ke keranjang/ }).click()
  await page.getByRole('link', { name: /Keranjang, 1 produk/i }).click()
  await page.getByRole('button', { name: 'Lanjutkan pesanan' }).click()
  const popupPromise = page.waitForEvent('popup')
  const dialog = page.getByRole('dialog')
  await dialog.locator('input').first().fill('Rifqi')
  await dialog.locator('textarea').fill('Jl. Melati No. 12, Kota Kerinci')
  await dialog.getByRole('button', { name: 'Pesan via WhatsApp' }).click()
  const popup = await popupPromise
  // popup dibuka about:blank dulu (agar lolos popup-blocker saat insert inquiry),
  // lalu dialihkan ke wa.me / api.whatsapp.com — tunggu URL final via poll (halaman
  // WhatsApp memblokir event load di headless, waitForURL sampai timeout).
  await expect.poll(async () => popup.url(), { timeout: 15000 }).toMatch(/wa\.me\/628\d+|whatsapp\.com.*phone=628\d+/)
  expect(decodeURIComponent(popup.url().replace(/\+/g, ' '))).toContain('Cardigan Rajut Biru')
  // keranjang dikosongkan setelah pesanan dikirim
  await page.waitForTimeout(300)
  const cart = await page.evaluate(() => localStorage.getItem('preloved-cart-v1'))
  expect(cart === null || cart === '[]').toBeTruthy()
})