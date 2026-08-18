import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const needsNoSsl = /localhost|127\.0\.0\.1|railway\.internal/.test(connectionString)

const pool = new Pool({
  connectionString,
  max: 10,
  ssl: needsNoSsl ? false : { rejectUnauthorized: false },
})

export const db = drizzle(pool, { schema })
export type Db = typeof db
