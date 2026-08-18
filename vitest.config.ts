import { defineConfig } from 'vitest/config'
import path from 'node:path'

// Unit + integration tests only (tests/e2e is Playwright's domain — see playwright.config.ts).
// Node environment: nothing here touches the DOM. Integration tests talk to the real local
// Postgres pointed at by DATABASE_URL (see .env, already migrated) via db/index.ts — no mocking
// of the database layer, per the task brief.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    setupFiles: ['./tests/setup/load-env.ts'],
    // Integration tests share one real Postgres instance; running files in parallel worker
    // processes is fine (each test uses its own rows), but keep it modest to avoid pool exhaustion
    // against db/index.ts's max:10 connection pool.
    fileParallelism: false,
    hookTimeout: 15_000,
    testTimeout: 15_000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
