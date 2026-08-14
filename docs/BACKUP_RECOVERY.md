# Backup and recovery boundary

## Current state

The Git workflow is manual-only. It is not a production database backup and it is intentionally
unscheduled until a dedicated read-only database view, a fresh verified-private destination and
new least-privileged credentials exist. The former `Compoundingzero/rnawiki-backups` destination
could not be verified through the connected GitHub account at implementation time; it must not be
treated as a working or private recovery system.

No Postgres restore was performed by this change. A read-only Railway check on 2026-08-15 found
both production Postgres PITR and scheduled volume backups **off**. Recovery is therefore not
configured or tested. Enabling a paid recovery option requires the owner's approval.

## What may enter Git

`scripts/backup-community.js` reads exactly one server-side view:
`public.public_git_vote_snapshot_v1`. The view exposes only official protocol-layer target ids
(`problem:route:move|fuel|stack`) with at least ten votes in one displayed direction, with positive
and negative totals rounded down to tens. Creator-stack, request and feature targets are excluded.
The exporter repeats that schema check, rejects unexpected fields or malformed rows, and writes no
timestamp to the snapshot.

Creator protocols are excluded regardless of `visibility`. Choosing “List it on this topic” is
consent to discovery inside RNAwiki, not consent to permanent Git archival. Remix rows are also
diffs whose private or unlisted parents may be needed to resolve them. Git therefore receives no
protocol code, title, spec, safety object, creator relation or activity counter.

Git also receives no users, usernames, emails, raw votes, voter keys, comments, edits, proposals,
memberships, discussion posts, moderation events, plans, experiments, check-ins, profiles,
biomarkers, wearable records, sessions, consent records, operational logs or other private/free-text
data. Git cannot honour a later row-level erasure request, so these exclusions are permanent policy.

The coarse public snapshot is useful only as a low-resolution public signal. It cannot reconstruct
a runnable RNAwiki database and there is no restore importer.

## Required database boundary

Never give the job the application `DATABASE_URL`. Provision a distinct login named
`rnawiki_public_snapshot_v1`, set it read-only, and grant it `SELECT` on exactly one view. Store that
connection string as the GitHub secret `PUBLIC_SNAPSHOT_DATABASE_URL`. TLS certificate verification
is mandatory; if the platform certificate needs an explicit CA chain, store it as
`PUBLIC_SNAPSHOT_DB_CA`.

The database owner can create the projection with a reviewed migration equivalent to:

```sql
CREATE OR REPLACE VIEW public.public_git_vote_snapshot_v1
WITH (security_barrier=true) AS
SELECT target_id,
       ((COUNT(*) FILTER (WHERE value > 0)) / 10 * 10)::int AS up_bucket,
       ((COUNT(*) FILTER (WHERE value < 0)) / 10 * 10)::int AS down_bucket
FROM public.votes
WHERE target_id ~ '^[a-z0-9][a-z0-9_-]{0,63}:[a-z0-9][a-z0-9_-]{0,79}:(move|fuel|stack)$'
GROUP BY target_id
HAVING COUNT(*) FILTER (WHERE value > 0) >= 10
    OR COUNT(*) FILTER (WHERE value < 0) >= 10;

REVOKE ALL ON public.public_git_vote_snapshot_v1 FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM rnawiki_public_snapshot_v1;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM rnawiki_public_snapshot_v1;
REVOKE CREATE ON SCHEMA public FROM rnawiki_public_snapshot_v1;
GRANT USAGE ON SCHEMA public TO rnawiki_public_snapshot_v1;
GRANT SELECT ON public.public_git_vote_snapshot_v1 TO rnawiki_public_snapshot_v1;
ALTER ROLE rnawiki_public_snapshot_v1 SET default_transaction_read_only = on;
```

Create the login and password through the provider's secret-management path, not in a migration or
repository file. Do not grant it membership in another role; review inherited/default grants too.
At runtime the exporter refuses memberships, superuser, role/database creator, replication or
row-security-bypass capability, then enumerates effective public relation privileges and requires
exactly one: `SELECT` on this view.

Every allowlisted query runs inside one repeatable-read, read-only transaction. A role check, view
read, schema validation, file write or checksum failure aborts the run. The previous local snapshot
is moved aside and restored if the final directory swap fails.

## Required GitHub boundary

Use a fresh private repository, not the legacy destination. Configure:

- repository variable `PUBLIC_SNAPSHOT_REPO` as `owner/repo`; and
- secret `PUBLIC_SNAPSHOT_REPO_TOKEN` as a fine-grained token limited to that repository, with only
  metadata-read and contents-write access.

The manual workflow queries authenticated repository metadata and refuses a destination that is not
private, is archived, is this public application repository, is the legacy `rnawiki-backups` name,
has tags, has branches other than `main`, or lacks the policy marker once non-empty.

Before enabling any future schedule, remove the former deploy key from the legacy repository and
GitHub secrets, rotate any credential that may have accessed it, and either delete the legacy
repository or complete and verify a history/ref purge under the applicable deletion policy. A
normal commit deleting files does not remove old Git objects.

## Railway recovery is the real backup path

Railway's current documentation describes [native volume backups](https://docs.railway.com/volumes/backups)
in the service **Backups** tab and [Postgres point-in-time recovery](https://docs.railway.com/volumes/point-in-time-recovery)
based on base backups plus write-ahead logs, with a roughly four-week recovery window. Availability
and cost can depend on the project/plan. For RNAwiki production, the read-only check on 2026-08-15
found PITR and scheduled volume backups both off. Do not enable a paid backup/PITR option without
the owner's approval.

All private, erasable and relational state depends on that encrypted database recovery path:
accounts, ownership, unlisted protocols, discussions, membership roles, moderation audit,
Today/accountability data and the raw relations behind public counters. The production owner must
verify and record:

1. encryption in transit and at rest, including backup copies;
2. the enabled backup/PITR window and a deliberately bounded retention period;
3. recovery-point and recovery-time objectives;
4. who can restore or download backups, with access logs and credential rotation;
5. how account erasure propagates when immutable recovery copies expire; and
6. scheduled restore drills into an isolated, non-production database.

A safe drill restores a provider recovery point to an isolated database, applies no writes to
production, checks schema/version and representative table counts, verifies foreign keys, exercises
critical read paths with outbound messages disabled, and records the observed recovery point and
elapsed time. Only then may the backup be described as restore-tested.

## Verification status

`npm run test:backup` is database-free. It tests the export allowlist, hostile rows, restricted-role
boundary, deterministic manifest/checksums, required-query failure and previous-snapshot
preservation with a fake database client. It does not prove that Railway recovery is enabled, that
the read-only role/view has been provisioned, that a private snapshot repository exists, or that a
Postgres restore succeeds. No restore test is claimed.
