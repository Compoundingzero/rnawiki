import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:3100/', { waitUntil: 'networkidle' })

// The reading guide, reachable from the footer.
await page.getByRole('button', { name: 'How to read a dossier' }).click()
await page.waitForTimeout(600)
await page.screenshot({ path: '/tmp/fidelity/modal-guide.png' })
console.log('guide dialog:', await page.getByRole('dialog').isVisible())
await page.keyboard.press('Escape')
await page.waitForTimeout(400)

// Sign-in / registration.
await page.getByRole('button', { name: /Doctor & Contributor Log-in/i }).click()
await page.waitForTimeout(600)
await page.screenshot({ path: '/tmp/fidelity/modal-auth.png' })
console.log('auth dialog:', await page.getByRole('dialog').isVisible())
await page.keyboard.press('Escape')
await page.waitForTimeout(400)

// Feedback.
await page.getByRole('button', { name: /Feedback/i }).first().click()
await page.waitForTimeout(600)
await page.screenshot({ path: '/tmp/fidelity/modal-feedback.png' })
console.log('feedback dialog:', await page.getByRole('dialog').isVisible())
await page.keyboard.press('Escape')

// The editor, on a dossier.
await page.goto('http://localhost:3100/d/inclisiran', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /Edit Wiki Dossier/i }).click()
await page.waitForTimeout(800)
await page.screenshot({ path: '/tmp/fidelity/modal-editor.png' })
console.log('editor dialog:', await page.getByRole('dialog').isVisible())

await browser.close()
