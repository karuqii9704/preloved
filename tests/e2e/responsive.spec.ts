import { test, expect } from '@playwright/test'

const routes=['/','/home','/shop','/get-started','/tutorial']

test.describe('mobile storefront',()=>{
  test.beforeEach(async({isMobile})=>{
    test.skip(!isMobile,'Responsive checks run only in a mobile viewport')
  })

  for(const route of routes){
    test(`${route} fits a Pixel 5 viewport`,async({page})=>{
      await page.goto(route)
      await expect(page.locator('body')).toBeVisible()
      await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true)
    })
  }

  test('opens and closes the mobile navigation',async({page})=>{
    await page.goto('/home')
    const toggle=page.getByRole('button',{name:'Buka navigasi'})
    await expect(toggle).toBeVisible()
    await toggle.click()
    await expect(page.getByRole('navigation',{name:'Navigasi utama'}).last()).toContainText('Titip Jual')
    await page.getByRole('link',{name:'Panduan'}).last().click()
    await expect(page).toHaveURL(/\/get-started$/)
  })
})
