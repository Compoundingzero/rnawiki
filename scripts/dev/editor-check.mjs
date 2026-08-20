import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await ctx.newPage()

// Register through the real UI, so the session is a real one.
await page.goto('http://localhost:3100/', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /Doctor & Contributor Log-in/i }).click()
await page.waitForTimeout(500)
const email = `qa+${Date.now()}@example.test`
await page.getByLabel(/your name/i).fill('QA Contributor')
await page.getByLabel(/^email$/i).fill(email)
await page.getByLabel(/password/i).first().fill('correct-horse-battery-staple')
await page.screenshot({ path: '/tmp/fidelity/modal-auth-filled.png' })
await page.getByRole('button', { name: /create account|save & continue|sign up/i }).first().click()
await page.waitForTimeout(2500)
console.log('signed in as:', await page.locator('header').innerText().catch(() => '?'))

await page.goto('http://localhost:3100/d/inclisiran', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /Edit Wiki Dossier/i }).click()
await page.waitForTimeout(1200)
await page.screenshot({ path: '/tmp/fidelity/editor-overview.png' })

// The Chemical Formula tab is where the engine reports.
await page.getByRole('button', { name: /Chemical Formula/i }).click()
await page.waitForTimeout(2500)
await page.screenshot({ path: '/tmp/fidelity/editor-sequence.png', fullPage: false })
console.log('done')
await browser.close()
