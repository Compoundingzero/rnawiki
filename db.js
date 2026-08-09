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
  -- role: 'user' | 'admin'. THIS IS NOT AN ACCOUNT TYPE AND IT IS NEVER WRITTEN. No INSERT or
  -- UPDATE anywhere in server.js sets it (the two account-creating INSERTs, at server.js ~1115 and
  -- ~1358, do not name the column), so every row in this table holds the literal 'user'.
  -- 'admin' is assigned IN MEMORY ONLY, in currentUser(), from the ADMIN_USER env var or from
  -- isSuper() — which keys on the SERIAL primary key or the Google subject, both immutable and
  -- neither choosable by a registrant. (Keying it on email once was a one-request privilege
  -- escalation; see the note above SUPERADMIN_ID in server.js. Never key it on email again.)
  -- RNAwiki has ONE ACCOUNT TYPE. Everyone reads, everyone creates. The only distinction the site
  -- recognises is "is this the owner's own control room", and this column is that distinction.
  -- If you are adding a permission and reaching for this column, you are probably adding a
  -- second account type. Do not.
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

-- Tier 2: domain-isolated expert stewardship. DISMANTLED 2026-08-08 — RNAwiki has ONE ACCOUNT
-- TYPE, so these six columns no longer mean anything and nothing writes them.
--   · the application path (POST /api/profile/domain) is deleted, so requested_domain, credential,
--     application_status and role_backlink can never be set again;
--   · the grant path (POST /api/admin/verify-domain) is deleted, so domain_verified can never
--     become true again — it is false on every row and now permanently so.
-- The columns are kept for one release, not forever: dropping a column is irreversible, and this
-- repo already handles that discipline twice (newsletter_subscribers below, telegram_*). Drop them
-- by hand once this has shipped and nothing 500s.
ALTER TABLE users ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS credential TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS requested_domain TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS application_status TEXT; -- null | pending | approved | rejected
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_backlink TEXT;      -- their site/socials page that links back to rnawiki.com (admin checks it)
-- Google (Gmail) sign-in: google_sub links the Google account; pass is now optional.
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub TEXT UNIQUE;
ALTER TABLE users ALTER COLUMN pass DROP NOT NULL;
-- SECURITY (2026-07-28): email had no uniqueness constraint, so two accounts could share an
-- address. Combined with the old email-based super-admin check that was a privilege escalation,
-- and it still allows a Google-identity takeover via the email-link branch of /api/auth/google.
-- Case-insensitive, NULLs excluded (most accounts have no email).
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_uniq ON users (lower(email)) WHERE email IS NOT NULL;

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
-- Demo/seed stacks (launch fixtures). They auto-retire per protocol as soon as a REAL
-- (is_demo=false) stack exists for that problem+cause, so real UGC replaces the fakes on its own.
ALTER TABLE protocol_forks ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;
-- one clone per browser per fork (idempotent) — drives the author's reputation
CREATE TABLE IF NOT EXISTS fork_clones (
  id SERIAL PRIMARY KEY,
  fork_id INTEGER NOT NULL REFERENCES protocol_forks(id) ON DELETE CASCADE,
  voter_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(fork_id, voter_key)
);

-- people who built a stack (for the "N people helped" heartbeat; protocol-starters come from experiments)
CREATE TABLE IF NOT EXISTS helped_people (
  voter_key TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
-- 2026-08-08 · ONE ACCOUNT TYPE. proposals.domain recorded WHICH KIND OF EXPERT wrote the row,
-- copied off users.domain. Nobody holds a domain, nobody can be granted one, and the gate that
-- required one before an INSERT is gone — so this column is now always null and the NOT NULL that
-- guarded it would turn the owner's own write into a 500. Verified against Postgres 16: without
-- this line, INSERT ... VALUES(..., null, ...) fails with
-- "null value in column domain of relation proposals violates not-null constraint".
-- The column itself stays: six readers still SELECT it, and dropping a column is irreversible.
ALTER TABLE proposals ALTER COLUMN domain DROP NOT NULL;

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

-- newsletter_subscribers REMOVED from the DDL 2026-08-06, with the newsletter. Its only readers
-- were /api/subscribe and /api/unsubscribe, both deleted in the same commit.
--
-- THERE IS DELIBERATELY NO DROP TABLE HERE. Removing the CREATE stops the table being recreated
-- on a fresh database; it does NOT touch rows in the live Postgres. That is on purpose: the row is
-- the auditable record of consent (address, timestamp, source page), and under PDPA it has to
-- survive until it has been exported or the people on it have been told the mailing has ended.
-- Dropping it is Felix's call, and it needs to happen AFTER any final note is sent — note that the
-- unsubscribe endpoint is already gone, so links in the old welcome email now 404.
-- To count what is there:  SELECT count(*), min(created_at), max(created_at) FROM newsletter_subscribers;

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
-- Widened from Singapore-GP-only to any healthcare professional worldwide: country, professional
-- registration/licence number, and a photo proof of credentials (stored as a data URL) for verification.
ALTER TABLE clinician_interest ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE clinician_interest ADD COLUMN IF NOT EXISTS license_no TEXT;
ALTER TABLE clinician_interest ADD COLUMN IF NOT EXISTS proof_photo TEXT;

-- The interest list behind /interest (2026-08-08). It replaces the newsletter as the site's one
-- call to action, and it is a DIFFERENT FEATURE with DIFFERENT CONSENT — see the newsletter note
-- twenty lines above. newsletter_subscribers is deliberately not reused and deliberately not
-- recreated: those rows carry consent to a mailing that no longer exists, and attaching old consent
-- to a new purpose is the thing PDPA exists to stop.
--
-- WHAT IS DELIBERATELY NOT HERE: no name, no ip, no user_agent, no referrer, no source page. None of
-- them is needed to send the two emails the page promises, and the per-IP signup cap that bounds
-- abuse lives in memory in server.js and is never written down. The only personal datum in this
-- table is the address the reader typed on purpose.
--
--   topic         one of the ids in data/site_config.json -> interest.topics, or NULL. A closed
--                 vocabulary, enforced in server.js, because this column answers "what do most
--                 people name" and a count anyone can invent is a fabricated count.
--   topic_other   free text, stored ONLY when topic = 'other'. A hidden field is still submitted by
--                 the browser, so the server drops it in every other case.
--   remove_token  server-minted, 32 chars of base64url over 24 random bytes, UNIQUE and NOT NULL.
--                 POST /api/interest/remove with this token deletes the row, and it is the only way
--                 to delete a row. This column is what makes the page's removal sentence a fact
--                 rather than a promise; without it the page would be claiming something the code
--                 does not do. NOT NULL so an INSERT that forgets it fails loudly instead of
--                 creating a row nobody can ever delete.
--
-- UNIQUE(email) + ON CONFLICT DO NOTHING is what turns a second submission into an honest "you were
-- already on the list" instead of a second row and (later) a second email. It also means this table
-- cannot be inflated by resubmitting one address.
CREATE TABLE IF NOT EXISTS interest_signups (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  topic TEXT,
  topic_other TEXT,
  creator BOOLEAN NOT NULL DEFAULT false,
  remove_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_interest_created ON interest_signups(created_at DESC);

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

-- Telegram integration REMOVED 2026-07-28. The telegram_users and telegram_link_tokens
-- tables are no longer created here, so a fresh database will not have them. The existing
-- production tables were deliberately NOT dropped -- dropping is irreversible and they still
-- hold one row (dumped to the 2026-07-28 backup). Drop them by hand once you are sure:
--   DROP TABLE IF EXISTS telegram_link_tokens; DROP TABLE IF EXISTS telegram_users;

-- The unified plan object: one active plan per account, shared by the website, sharing cards
-- and (later) the earn layer. Anonymous users keep it in localStorage; it merges up into this
-- row on login.
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

-- ===== THE PROTOCOL STUDIO (W7, 2026-08-09) ==================================================
-- A protocol somebody assembled themselves, out of the locked master library.
--
-- ONE ACCOUNT TYPE. There is no author tier, no reviewer, no badge; the only thing this table
-- records about a person is which row they wrote. There is deliberately NO is_demo column —
-- protocol_forks has one because it exists to retire launch FIXTURES, and a seeded row written by
-- nobody is the fabricated-account defect. Starter protocols here are the owner's own rows under
-- his own user_id, and a row written by a real person never needs retiring.
--
-- WHY A NEW TABLE RATHER THAN WIDENING protocol_forks: forks.stack is an array of compound ids and
-- nothing else — no exercises, no foods, no dose, no frequency, no parent. Widening it would
-- silently reinterpret 100% of its existing rows. forks stays exactly what it is.
--
--   code         base64url over 6 random bytes, minted server-side — same shape and same minting
--                as shared_plans.code, so a URL cannot be walked. NEVER derived from the title.
--   parent_code  the protocol this was remixed from, NULL for an original.
--   depth        DENORMALISED remix depth (0 for an original). Stored so the resolver can refuse a
--                too-deep chain in one read instead of discovering it by walking, and so a cycle —
--                which ON DELETE SET NULL alone does not prevent — is bounded. CHECK caps it at 8:
--                eight diffs is already more indirection than a reader can hold in their head.
--   base_pid /
--   base_rcid    the corpus protocol this was started from (graph.problems[].id and its
--                root_causes[].id), or NULL for a blank build. NOT a foreign key — the corpus is a
--                build artefact, not a table — so the server validates it against the loaded
--                corpus on every write and the renderer degrades to "started from scratch" if a
--                root cause is ever retired.
--   spec         THE WHOLE POINT. When parent_code IS NULL this is a FULL spec:
--                  {"v":1,"items":[{"k":"c","id":"c0","dose":5,"days":[1,3,5]},
--                                  {"k":"x","id":"Barbell_Squat","sets":4,"reps":"6-8"},
--                                  {"k":"f","id":"f0"},{"k":"fn","id":"walk","target":15}],
--                   "note":null}
--                "k" is the kind: c = compound (171), x = exercise (873 slug ids), f = food (656),
--                fn = plan function (PLAN_FUNCTIONS in site/app.js).
--                EVERY KEY OTHER THAN k AND id IS AN OVERRIDE, AND ABSENCE MEANS INHERITANCE.
--                No name, no dose text, no instruction and no evidence star is ever stored here.
--                That is what lets one protocol render Creatine at 5 g without touching the master
--                entry — and it is also what makes a CORRECTION to the master reach every protocol
--                that used it, which a wiki needs and a copy-on-write store would silently prevent.
--                When parent_code IS NOT NULL this is a DIFF and holds only the differences:
--                  {"v":1,"add":[…],"drop":["c:c0"],"set":{"x:Barbell_Squat":{"sets":5}},
--                   "move":[["c:c1",0]]}
--                Resolution = resolve(parent), then drop, then set, then add, then move. A remix
--                that changes one dose therefore stores a few dozen bytes.
--   safety       THE VERDICT THE SAVE-TIME ENGINE RETURNED, STORED WITH THE ROW:
--                  {"engine":"<the corpus it ran against>","at":"<iso>","refusals":[],
--                   "warn":[…],"coverage":{"checked":4,"of":6},"says":"…"}
--                Stored rather than recomputed on read for one reason: the reader has to be able to
--                see WHEN it was checked and against WHAT. "coverage" is mandatory and is the ❔
--                state — an empty "warn" over 0 checked compounds is not a clearance, and
--                interactionPanel() has already had that exact bug fixed twice.
--   status       draft | published | withdrawn. Only "published" is servable.
--                A withdrawn protocol KEEPS its row so existing remixes still resolve; the renderer
--                says it was withdrawn instead of 404ing a page people linked to.
CREATE TABLE IF NOT EXISTS studio_protocols (
  code TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  parent_code TEXT REFERENCES studio_protocols(code) ON DELETE SET NULL,
  depth INTEGER NOT NULL DEFAULT 0 CHECK (depth >= 0 AND depth <= 8),
  base_pid TEXT,
  base_rcid TEXT,
  title TEXT NOT NULL,
  spec JSONB NOT NULL DEFAULT '{}',
  safety JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  clones INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_studio_user ON studio_protocols(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_parent ON studio_protocols(parent_code);
CREATE INDEX IF NOT EXISTS idx_studio_base ON studio_protocols(base_pid, base_rcid, status);
-- "MOST USED", never "works best". This index sorts by clone count and by nothing else, and the
-- column it sorts on counts one clone per browser — whether people STARTED it. There is no
-- efficacy column in this table and there must not be one: with the number of real experiments
-- this site holds, any ranking by outcome is noise, and in Singapore it is a health claim.
CREATE INDEX IF NOT EXISTS idx_studio_used ON studio_protocols(status, clones DESC, published_at DESC);
-- One clone per browser per protocol — verbatim the fork_clones pattern above, keyed on the same
-- anonymous participant cookie the 7-day logger uses. A clone count cannot be inflated by
-- re-tapping, and no account is needed to clone.
CREATE TABLE IF NOT EXISTS studio_clones (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL REFERENCES studio_protocols(code) ON DELETE CASCADE,
  voter_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(code, voter_key)
);
`;

async function init() {
  if (!enabled) { console.log('[db] DATABASE_URL not set — running read-only (no accounts).'); return; }
  await pool.query(SCHEMA);
  console.log('[db] schema ready.');
}

module.exports = { enabled, pool, query, init };
