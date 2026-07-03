// Postgres layer for PBswiki: connection pool + schema init.
// If DATABASE_URL is absent (e.g. local dev), db.enabled is false and the
// site still serves as a read-only static wiki.
const { Pool } = require('pg');

const URL = process.env.DATABASE_URL;
const enabled = !!URL;
const pool = enabled
  ? new Pool({ connectionString: URL, ssl: process.env.PGSSL === '1' ? { rejectUnauthorized: false } : false, max: 5 })
  : null;

async function query(text, params) { return pool.query(text, params); }

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  pass TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  goal_id TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS edits (
  id SERIAL PRIMARY KEY,
  compound_id TEXT NOT NULL,
  compound_name TEXT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fields JSONB NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comments_goal ON comments(goal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_edits_compound ON edits(compound_id, created_at DESC);
`;

async function init() {
  if (!enabled) { console.log('[db] DATABASE_URL not set — running read-only (no accounts).'); return; }
  await pool.query(SCHEMA);
  console.log('[db] schema ready.');
}

module.exports = { enabled, pool, query, init };
