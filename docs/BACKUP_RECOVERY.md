# Backup and recovery boundary

> Rewritten 2026-08-18 for the Proof Boundary rebuild. The previous version of this file
> described the old product's community-voting Git export (`scripts/backup-community.js`, a
> `public_git_vote_snapshot_v1` view, votes/protocols tables) — none of that exists in this
> product. The new schema (`db/schema.ts`) has no community voting, no protocols, no votes. If
> you are reading an older copy of this file anywhere, discard it.

## Current state

**There is no automated backup or PITR configured for production Postgres.** A read-only Railway
check on 2026-08-15 (carried over from the pre-rebuild product, re-verified during this rebuild)
found both Postgres point-in-time recovery and scheduled volume backups **off**. Enabling either
is a paid option and requires the owner's (Felix's) explicit approval before turning on.

**One manual, one-time backup exists**, taken 2026-08-18 immediately before this rebuild replaced
the production schema:
- `pg_dump -F c` (full data, custom format) and a schema-only companion dump
- stored locally at `RNAwiki-db-backups/`, a sibling directory to this repo checkout —
  deliberately **outside** the git tree, and must stay that way
- contains real user PII/health data from the pre-rebuild schema (`users`, `consent_records`,
  `blood_markers`, `experiments`, and more) — the entire reason it must never be committed,
  shared, or copied anywhere without deliberately re-assessing that decision
- verified restorable with `pg_restore --list` at backup time (348 objects, 45 base tables)

**This is a snapshot of the pre-rebuild database, not an ongoing backup strategy.** It exists
solely so the pre-rebuild product (`archive/legacy-rnawiki`) has something to restore into if it
is ever rolled back to — see `docs/deployment.md`'s Rollback section. It says nothing about
whether *this* (post-rebuild) database is being backed up going forward. It is not, until PITR or
scheduled volume backups are turned on.

## What data this product actually holds

The new schema is much smaller in scope than the old one. There is no user-generated protocol
content, no voting, no social/community features. What it does hold, that a future backup policy
should account for:
- `users` — internal accounts only (administrator/editor/scientific_reviewer), with password
  hashes. Not public accounts; there is no reader signup.
- `correction_submissions` — public, anonymous submissions (message text, an optional proposed
  source, a non-identifying session hash for rate-limiting). No email, no account, no raw IP
  stored (see `lib/session-hash.ts`).
- `comprehension_responses` — anonymous, non-identifying (session hash only, same as above).
- `subscriptions` — email addresses of readers who opt to follow an entity for evidence-change
  alerts. Currently unused (feature-flagged off; no email provider configured — see
  `.env.example`'s `RESEND_API_KEY`). This is the one table that would hold real reader PII if the
  feature is ever turned on.
- Everything else (`entities`, `claims`, `evidence_sources`, `reviews`, `revisions`,
  `evidence_changes`, `legacy_redirects`, `comprehension_questions`) is editorial content with no
  personal data — safe to reconstruct from `scripts/seed-data/*.ts` plus the admin panel if ever
  lost, though a real restore is obviously faster.

## Required next steps (owner decision)

1. Decide whether to enable Railway Postgres PITR and/or scheduled volume backups (paid) — this
   is the real, ongoing backup path per Railway's own
   [PITR](https://docs.railway.com/volumes/point-in-time-recovery) and
   [volume backup](https://docs.railway.com/volumes/backups) docs. Nothing in this rebuild enables
   either automatically.
2. If `subscriptions` (reader emails) is ever turned on, revisit encryption-at-rest and retention
   policy for that table specifically before launch — it's the one place this product holds
   contactable reader PII.
3. Move the one-time pre-rebuild dump (`RNAwiki-db-backups/`) somewhere more durable than a single
   local machine — it is currently a single point of failure for rolling back to the pre-rebuild
   product.
4. Once PITR/backups are enabled, run an actual restore drill (Railway's own recommended
   practice): restore a recovery point into an isolated database, verify schema/row counts, and
   record the observed recovery point and elapsed time. Nothing here is "restore-tested" until
   that happens.
