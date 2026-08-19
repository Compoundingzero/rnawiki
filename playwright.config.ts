import { defineConfig, devices } from '@playwright/test'

// End-to-end tests run against a real built-and-started server (npm run start, per package.json),
// not `next dev` — closer to production and it's what `npm run gate` ultimately exercises.
// baseURL + webServer per the task brief. These specs also depend on the database being migrated
// and seeded (scripts/seed.ts against the three entities in scripts/seed-data/) — specs skip
// gracefully with a clear comment/annotation when expected seed data isn't present yet, since
// seeding is still in progress in parallel with this task.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }]],
  // The runner wipes its own output directory at the start of every run. tests/e2e/visual.spec.ts
  // writes full-page captures for human review into test-results/visual/, which must survive that
  // wipe — so the runner's traces and failure artefacts are pointed one level down instead of at
  // test-results/ itself. Do not move this back without moving the visual captures too.
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
  // tests/e2e/mobile-viewport.spec.ts (test 8) opts itself into a 375px context directly via
  // test.use({ viewport }) rather than a dedicated Playwright project, so every other spec keeps
  // running once, at desktop width, instead of the whole suite doubling under a second project.
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
