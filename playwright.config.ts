import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:3000'

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL, trace: 'on-first-retry', screenshot: 'only-on-failure', channel: process.env.PW_CHANNEL },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: process.env.BASE_URL ? undefined : { command: 'npm run dev', url: baseURL, reuseExistingServer: !process.env.CI },
})
