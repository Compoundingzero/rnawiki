import { defineConfig, devices } from '@playwright/test'

// End-to-end tests run against a real built-and-started server (npm run start, per package.json),
// not `next dev` — closer to production and it's what `npm run gate` ultimately exercises.
// baseURL + webServer per the task brief. The outer runner supplies a freshly migrated disposable
// database; each spec installs and removes only its own clearly test-only rows.
/*
 * The port the suite builds and serves on. It defaults to 3000, which is what CI uses, and is
 * overridable so a developer whose 3000 is held by another project can still run the gate rather
 * than stopping that other process.
 */
const PORT = process.env.E2E_PORT ?? '3000'
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }]],
  // Keep Playwright's traces and failure artefacts separate from any manually captured visual
  // review files under test-results/.
  outputDir: './test-results/playwright',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    // Dossier v3 renders only for the e2e fixture prefix unless the runner names other slugs, so
    // every other spec still exercises the corpus document (docs/dossier-information-architecture.md).
    // There is one medicine layout and no variable selecting it, so the suite sets none.
    env: { PORT },
    url: BASE_URL,
    // A release gate must exercise the build made in this run. Reusing an unrelated local server
    // can make stale code look green.
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
