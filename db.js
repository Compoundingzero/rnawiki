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

-- Community stewardship (Phase 4) ------------------------------------------
-- Tier 1: frictionless per-intervention voting. voter_key is a client-side
-- random id (localStorage) so voting needs no account; unique per target.
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  target_id TEXT NOT NULL,
  voter_key TEXT NOT NULL,
  value SMALLINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(target_id, voter_key)
);
CREATE INDEX IF NOT EXISTS idx_votes_target ON votes(target_id);

-- Tier 2: domain-isolated expert stewardship.
ALTER TABLE users ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS credential TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS proposals (
  id SERIAL PRIMARY KEY,
  problem_id TEXT NOT NULL,
  root_cause_id TEXT NOT NULL,
  layer TEXT NOT NULL,                 -- move | fuel | stack
  domain TEXT NOT NULL,                -- physio | dietitian | pharmacist
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  change TEXT NOT NULL,
  evidence TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | endorsed | flagged
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_proposals_protocol ON proposals(problem_id, root_cause_id, created_at DESC);

CREATE TABLE IF NOT EXISTS proposal_actions (
  id SERIAL PRIMARY KEY,
  proposal_id INTEGER NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,                -- endorse | flag
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(proposal_id, user_id, action)
);

-- AI food-photo scans: one row per scan, used for the per-user daily cost cap.
CREATE TABLE IF NOT EXISTS scans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kcal INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_scans_user_day ON scans(user_id, created_at);
`;

async function init() {
  if (!enabled) { console.log('[db] DATABASE_URL not set — running read-only (no accounts).'); return; }
  await pool.query(SCHEMA);
  console.log('[db] schema ready.');
}

module.exports = { enabled, pool, query, init };
