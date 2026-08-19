import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { databaseSslConfig } from './ssl'

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set')

  // Same TLS rules as the app pool. This used to pass no `ssl` option at all, so a migration run
  // over DATABASE_PUBLIC_URL crossed the public internet in cleartext unless the operator happened
  // to put sslmode in the string. See db/ssl.ts.
  const pool = new Pool({ connectionString, ssl: databaseSslConfig(connectionString) })
  const db = drizzle(pool)

  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './db/migrations' })
  console.log('Migrations complete.')

  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
