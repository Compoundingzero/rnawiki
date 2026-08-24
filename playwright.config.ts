import { defineConfig, devices } from '@playwright/test'

// End-to-end tests run against a real built-and-started server (npm run start, per package.json),
// not `next dev` — closer to production and it's what `npm run gate` ultimately exercises.
// baseURL + webServer per the task brief. The outer runner supplies a freshly migrated disposable
// database; each spec installs and removes only its own clearly test-only rows.
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
    baseURL: 'http://localhost:3000',
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
    url: 'http://localhost:3000',
    // A release gate must exercise the build made in this run. Reusing an unrelated local server
    // can make stale code look green.
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
