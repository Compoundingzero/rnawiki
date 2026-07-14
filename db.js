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

-- Wiki-improvement feedback: anyone (signed in or not) can suggest an improvement or report
-- something wrong. Surfaced in the super-admin control room.
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  body TEXT NOT NULL,
  page TEXT,
  kind TEXT,                               -- idea | wrong | other
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  contact TEXT,
  status TEXT NOT NULL DEFAULT 'open',      -- open | done | archived
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status, created_at DESC);

-- Protocol "forks": a user's named, annotated variation of an existing protocol's stack.
-- Clearly community-made (NOT the authoritative protocol). When others clone a fork, its author
-- earns reputation — a zero-effort user-generated-content engine.
CREATE TABLE IF NOT EXISTS protocol_forks (
  id SERIAL PRIMARY KEY,
  problem_id TEXT NOT NULL,
  root_cause_id TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  note TEXT,
  stack JSONB NOT NULL DEFAULT '[]',        -- array of compound ids the forker chose
  clones INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_forks_protocol ON protocol_forks(problem_id, root_cause_id, clones DESC);
CREATE INDEX IF NOT EXISTS idx_forks_popular ON protocol_forks(clones DESC, created_at DESC);
-- one clone per browser per fork (idempotent) — drives the author's reputation
CREATE TABLE IF NOT EXISTS fork_clones (
  id SERIAL PRIMARY KEY,
  fork_id INTEGER NOT NULL REFERENCES protocol_forks(id) ON DELETE CASCADE,
  voter_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(fork_id, voter_key)
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

-- Founding-clinician waitlist (Phase-2 marketplace demand capture). A public, no-account form:
-- a physio/dietitian/pharmacist/MD registers interest to shape protocols in their field. Surfaced,
-- with a one-click CSV export, in the super-admin control room. UNIQUE(email) keeps it de-duped.
CREATE TABLE IF NOT EXISTS clinician_interest (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  discipline TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clinician_created ON clinician_interest(created_at DESC);

-- The outcome loop (Phase 4). One experiment = one participant running one protocol. participant is
-- 'u:<user id>' when signed in, else 'v:<anonymous voter key>' so anyone can take part and the ledger
-- aggregates honestly (one row per participant per protocol = no double counting).
CREATE TABLE IF NOT EXISTS experiments (
  id SERIAL PRIMARY KEY,
  participant TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  problem_id TEXT NOT NULL,
  root_cause_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',   -- running | completed
  outcome TEXT,                             -- better | same | worse
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  outcome_at TIMESTAMPTZ,
  UNIQUE(participant, problem_id, root_cause_id)
);
CREATE INDEX IF NOT EXISTS idx_exp_protocol ON experiments(problem_id, root_cause_id);
CREATE INDEX IF NOT EXISTS idx_exp_user ON experiments(user_id);
-- One daily check-in per experiment (UNIQUE(experiment,day) keeps streaks idempotent).
CREATE TABLE IF NOT EXISTS experiment_checkins (
  id SERIAL PRIMARY KEY,
  experiment_id INTEGER NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(experiment_id, day)
);

-- Referral attribution (Phase 6 backlink engine). A shared link carries ?ref=<sharer key>; the first
-- one a new participant arrives with is credited once (UNIQUE(participant) = first-touch, no double
-- credit). Powers the "builders you've brought in" status that incentivises link-dropping.
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer TEXT NOT NULL,
  participant TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ref_referrer ON referrals(referrer);

-- Telegram coach: one row per chat that has activated @rnawikibot. Linked (optionally) to a web
-- user and pinned to a protocol (pid/rcid) so the bot coaches that person on that exact protocol.
-- keystone_days = dates the user marked their keystone done; streak derived from it.
CREATE TABLE IF NOT EXISTS telegram_users (
  chat_id BIGINT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  pid TEXT,
  rcid TEXT,
  first_name TEXT,
  keystone_days JSONB NOT NULL DEFAULT '[]',
  streak INTEGER NOT NULL DEFAULT 0,
  food_log JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active TIMESTAMPTZ NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE telegram_users ADD COLUMN IF NOT EXISTS food_log JSONB NOT NULL DEFAULT '{}';
ALTER TABLE telegram_users ADD COLUMN IF NOT EXISTS flow JSONB NOT NULL DEFAULT '{}';
ALTER TABLE telegram_users ADD COLUMN IF NOT EXISTS sel JSONB NOT NULL DEFAULT '{}';
ALTER TABLE telegram_users ADD COLUMN IF NOT EXISTS nudge_hour INTEGER;          -- local hour 0-23 for the daily check-in (null = off)
ALTER TABLE telegram_users ADD COLUMN IF NOT EXISTS tz_offset INTEGER NOT NULL DEFAULT 480; -- minutes from UTC (480 = SGT)
ALTER TABLE telegram_users ADD COLUMN IF NOT EXISTS last_nudge TEXT;             -- YYYY-MM-DD of the last nudge sent
ALTER TABLE telegram_users ADD COLUMN IF NOT EXISTS functions JSONB NOT NULL DEFAULT '[]';  -- selected protocol function ids (mirrors web plan.functions)
ALTER TABLE telegram_users ADD COLUMN IF NOT EXISTS tools JSONB NOT NULL DEFAULT '{}';       -- per-day/week function state: {day:{date,counters,done}, week:{key,counters}}
CREATE INDEX IF NOT EXISTS idx_tg_active ON telegram_users(active, last_active DESC);

-- Short-lived deep-link tokens: web mints one when a user taps "Coach me on Telegram" on a
-- protocol; the bot's /start <token> consumes it to link the chat to that user + protocol.
CREATE TABLE IF NOT EXISTS telegram_link_tokens (
  token TEXT PRIMARY KEY,
  user_id INTEGER,
  pid TEXT,
  rcid TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- chat_id is set for the reverse direction: the bot mints a token, the user opens ?tgsync=<token>
-- on the site while signed in, and /api/telegram/attach binds that chat to their account.
ALTER TABLE telegram_link_tokens ADD COLUMN IF NOT EXISTS chat_id BIGINT;

-- The unified plan object (the omnichannel spine): one active plan per account, shared by the
-- website, the Telegram bot, sharing cards and (later) the earn layer. Anonymous users keep it
-- in localStorage; it merges up into this row on login.
CREATE TABLE IF NOT EXISTS user_plans (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  plan JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shared protocols: anyone (e.g. a trainer) builds a plan and shares a code; a client opens it,
-- previews the exact selections, and creates an account to use it. Author may be anonymous (null).
CREATE TABLE IF NOT EXISTS shared_plans (
  code TEXT PRIMARY KEY,
  author_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  pid TEXT NOT NULL,
  rcid TEXT NOT NULL,
  plan JSONB NOT NULL DEFAULT '{}',   -- {moves, supps, functions}
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===== Outcome-data moat (PDPA: explicit opt-in, purpose-limited, user-deletable) =====
-- Research consent, versioned. No data below is used for research unless consent_research = true.
CREATE TABLE IF NOT EXISTS user_consent (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  consent_research BOOLEAN NOT NULL DEFAULT false,
  version TEXT,                       -- consent-notice version the user agreed to
  consented_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ
);
-- Self-declared demographics — all optional, stored as coarse bands (no birthdate, no NRIC).
CREATE TABLE IF NOT EXISTS user_profile (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  age_band TEXT,                      -- e.g. '18-24','25-34',... ,'65+'
  sex TEXT,                           -- 'male','female','other','prefer_not'
  ethnicity TEXT,                     -- 'chinese','malay','indian','other','prefer_not'
  conditions JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Structured outcome check-ins at baseline / 30d / 90d — the feedback loop.
CREATE TABLE IF NOT EXISTS outcome_checkins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pid TEXT NOT NULL,
  rcid TEXT NOT NULL,
  phase TEXT NOT NULL,                -- 'baseline' | 'd30' | 'd90'
  symptom_0_10 INTEGER,              -- 0 = none, 10 = worst
  improvement INTEGER,               -- global rating -3..+3 (much worse .. much better)
  adherence_pct INTEGER,
  still_on BOOLEAN,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, pid, rcid, phase)
);
CREATE INDEX IF NOT EXISTS idx_outcome_proto ON outcome_checkins(pid, rcid, phase);
-- Optional blood markers, self-entered.
CREATE TABLE IF NOT EXISTS blood_markers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  marker TEXT NOT NULL,              -- 'hba1c','ldl','hdl','testosterone','tsh','ferritin','crp','vit_d','bp_sys','bp_dia',...
  value NUMERIC,
  unit TEXT,
  taken_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_blood_user ON blood_markers(user_id, marker, taken_on);
-- Wearable / daily body metrics (manual for v1; API sync later).
CREATE TABLE IF NOT EXISTS wearable_daily (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  steps INTEGER,
  sleep_min INTEGER,
  resting_hr INTEGER,
  weight_kg NUMERIC,
  source TEXT,
  PRIMARY KEY (user_id, day)
);
-- ---- High-value data extensions (2026-07) — all optional / nullable, PDPA-safe ----
-- outcome_checkins: why people stop (persistence), side-effects (pharmacovigilance), per-protocol validated screener answers
ALTER TABLE outcome_checkins ADD COLUMN IF NOT EXISTS stop_reason TEXT;   -- when still_on=false: didnt_work|side_effects|too_hard|cost|got_better|other
ALTER TABLE outcome_checkins ADD COLUMN IF NOT EXISTS side_effects TEXT;  -- free/one-tap side-effect report
ALTER TABLE outcome_checkins ADD COLUMN IF NOT EXISTS extra JSONB;        -- {mood_freq, sleep_quality, vitality, pain_interference, ...} category-specific outcome items
-- user_profile: height (→ waist-to-height ratio) + concurrent meds/supplements (polypharmacy / interactions)
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS meds JSONB NOT NULL DEFAULT '[]';
-- wearable_daily: waist circumference — best cheap metabolic-risk marker (visceral fat / T2D / CVD)
ALTER TABLE wearable_daily ADD COLUMN IF NOT EXISTS waist_cm NUMERIC;
-- users: last time we emailed a check-in nudge (avoid spamming), for the email nudge engine
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_checkin_email TEXT;       -- YYYY-MM-DD of last check-in nudge email
-- users: opt-in DAILY reminder email (keystone + selected nudge tools), TZ-aware — web parity of the Telegram daily nudge
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_nudge_hour INTEGER;      -- local hour 0-23 for the daily reminder email (null = off)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_tz_offset INTEGER NOT NULL DEFAULT 480; -- minutes east of UTC (480 = SGT)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_last_nudge TEXT;         -- YYYY-MM-DD of last daily reminder email sent
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_winback_email TEXT;       -- YYYY-MM-DD of last inactivity/win-back email sent
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_off BOOLEAN NOT NULL DEFAULT false; -- global email suppress (protects sender reputation / user choice)

-- "Explain it back" community discussion: on a compound/pathway page, a reader writes their own
-- explanation ("the Feynman test"), and it's shared as a thread others can reply to. parent_id null
-- = a top-level explanation; set = a reply. handle snapshots the username at post time so anonymous
-- (user_id null) posts still render. Replies notify the parent's author by Telegram + email.
CREATE TABLE IF NOT EXISTS explain_posts (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'compound',
  parent_id INTEGER REFERENCES explain_posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  handle TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_explain_slug ON explain_posts(slug, created_at);
CREATE INDEX IF NOT EXISTS idx_explain_parent ON explain_posts(parent_id);
`;

async function init() {
  if (!enabled) { console.log('[db] DATABASE_URL not set — running read-only (no accounts).'); return; }
  await pool.query(SCHEMA);
  console.log('[db] schema ready.');
}

module.exports = { enabled, pool, query, init };
