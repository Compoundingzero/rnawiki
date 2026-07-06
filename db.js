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
-- domain = the GRANTED role (only an admin sets it, by approving an application). A user cannot
-- self-assign it — they set requested_domain via an application, admin approval promotes it.
ALTER TABLE users ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS credential TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS requested_domain TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS application_status TEXT; -- null | pending | approved | rejected
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_backlink TEXT;      -- their site/socials page that links back to rnawiki.com (admin checks it)
-- Google (Gmail) sign-in: google_sub links the Google account; pass is now optional.
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub TEXT UNIQUE;
ALTER TABLE users ALTER COLUMN pass DROP NOT NULL;

-- Reputation + public profile (Phase 5) -----------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation_points INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS socials JSONB NOT NULL DEFAULT '{}';   -- {instagram,twitter,linkedin,website,booking_link}
ALTER TABLE users ADD COLUMN IF NOT EXISTS badges JSONB NOT NULL DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_views INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS booking_clicks INTEGER NOT NULL DEFAULT 0;
-- Points ledger. UNIQUE(user,kind,ref) makes every award idempotent (no double-counting).
CREATE TABLE IF NOT EXISTS rep_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,     -- vote | comment | edit | proposal | merged | food_log | share
  ref TEXT NOT NULL,      -- dedupe key (target id, row id, or YYYY-MM-DD for daily caps)
  points INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, kind, ref)
);
CREATE INDEX IF NOT EXISTS idx_rep_user ON rep_events(user_id);

-- Protocol stewardship: one verified expert "owns" a protocol (lead-gen). Their clinic + booking
-- link sits atop that protocol page. Inactive stewards (60d) can be challenged/taken over.
CREATE TABLE IF NOT EXISTS stewardships (
  id SERIAL PRIMARY KEY,
  problem_id TEXT NOT NULL,
  root_cause_id TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain TEXT,
  adopted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(problem_id, root_cause_id)
);
CREATE INDEX IF NOT EXISTS idx_steward_user ON stewardships(user_id);

-- Local partners (gyms/clinics/stores). To be shown they must link back to rnawiki.com
-- (backlink_url) and be approved — a strict, transparent link exchange for lead-gen.
CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  location TEXT,
  link TEXT,
  backlink_url TEXT,
  serves TEXT,                 -- problem category it serves
  submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | active | rejected
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_partners_serves ON partners(serves, status);

-- Crowdsourced local foods: anyone can submit a missing dish; a verified dietitian (or admin)
-- approves it, after which it shows in the fuel tracker's search with a verified badge.
CREATE TABLE IF NOT EXISTS user_foods (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  serving TEXT,
  data JSONB NOT NULL,        -- {kcal, protein_g, carbs_g, sugar_g, fat_g, fiber_g, sodium_mg, ...}
  submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | active | rejected
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_userfoods_status ON user_foods(status);

-- "Don't see a protocol?" — users request one; others upvote; experts/admin pick them up.
CREATE TABLE IF NOT EXISTS protocol_requests (
  id SERIAL PRIMARY KEY,
  request TEXT NOT NULL,
  detail TEXT,
  submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  votes INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open',   -- open | building | done | declined
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_protoreq_status ON protocol_requests(status, votes DESC);

-- Root-cause governance: experts propose ADDING a new root cause to a problem, or
-- REMOVING an existing one. Approval comes from the relevant panel (experts whose
-- domain is required by that root cause) via endorsements, or the superadmin. A change
-- is applied to the (otherwise static) graph as a runtime overlay once approved.
CREATE TABLE IF NOT EXISTS rootcause_changes (
  id SERIAL PRIMARY KEY,
  problem_id TEXT NOT NULL,
  action TEXT NOT NULL,                    -- add | remove
  root_cause_id TEXT,                      -- target rc (remove) or new slug (add)
  name TEXT,                               -- proposed name (add)
  diagnostic TEXT,                         -- proposed "how you'd know" line (add)
  domains JSONB NOT NULL DEFAULT '[]',     -- relevant expert domains = the panel
  rationale TEXT,
  submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  decided_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rcchange_problem ON rootcause_changes(problem_id, status);
-- Panel endorsements: one row per (change, expert). Unique keeps a vote idempotent.
CREATE TABLE IF NOT EXISTS rootcause_endorsements (
  id SERIAL PRIMARY KEY,
  change_id INTEGER NOT NULL REFERENCES rootcause_changes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(change_id, user_id)
);

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
