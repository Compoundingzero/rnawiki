import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import { databaseSslConfig } from './ssl'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

// TLS decision, including why it is not a regex over the connection string any more: db/ssl.ts.
const pool = new Pool({
  connectionString,
  max: 10,
  ssl: databaseSslConfig(connectionString),
})

export const db = drizzle(pool, { schema })
export type Db = typeof db

/**
 * Short-lived workers must release the shared pool before exiting. The web process deliberately
 * never calls this; scheduled scripts call it in a `finally` block so Railway can observe a clean
 * terminal run instead of leaving the cron deployment active forever.
 */
export async function closeDatabasePool(): Promise<void> {
  await pool.end()
}
