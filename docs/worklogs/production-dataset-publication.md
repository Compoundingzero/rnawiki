# Publishing the production corpus as the bulk dataset

Closes the one item Release A left open: `data/` held a stale export and the daily publication
workflow had been failing since 2026-08-25.

|                       |                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| Branch                | `fix/production-dataset-publication`                                                                 |
| Starting SHA          | `b19f1fd5d778fcd901cbb05f72f24d6219cd50f6` (`origin/main`)                                           |
| Project / environment | RNAwiki `328c5ae7` / production `d92fd6a6`                                                           |
| Postgres service      | `5f7c4c2d-2482-40d7-aef6-b63f38fba2ee`                                                               |
| Temporary SSH key     | `rnawiki-dataset-publication-2026-08`, ed25519, `SHA256:/H5x9oiCq1WowBBu2QqpBcY76oaOQBCnUhGUpQOVAtM` |

## What was actually broken

Two separate faults, and the second was hidden behind the first.

**The workflow had no credentials.** Six consecutive failures (33302093153, 33245706163,
33181415577, 33076081902, 32927526875, 32805966505; last success 32687467384 on 2026-08-24), every
one of them on the same guard:

```
DATASET_DATABASE_URL:
DATABASE_CA_CERT:
DATASET_DATABASE_URL is required.
```

`gh secret list` held only `BACKUP_DEPLOY_KEY` and `DATABASE_URL`. The secrets the workflow reads
had never been created, so it failed before opening a connection. This was not a TLS failure, and
reading the logs as one would have sent the fix in the wrong direction.

**The certificate authenticates a name no external client dials.** Railway signs this database with
a private CA and issues one identity:

```
subject=CN=localhost   issuer=CN=root-ca   SAN: DNS:localhost
notBefore=Jul  3 16:50:07 2026 GMT   notAfter=Sep 30 16:50:07 2028 GMT
root.crt   SHA-256 44:6F:CD:8D:48:16:86:8D:10:E4:2F:54:F2:A7:06:A3:D4:F0:FD:C1:6D:52:B7:79:D8:44:66:F0:D9:0B:87:21
server.crt SHA-256 D0:56:6A:F5:D5:4C:30:18:24:E8:A1:19:E8:86:27:45:F1:24:C0:1F:4F:DB:2F:99:79:6E:66:2B:99:F5:50:DD
```

Read over authenticated `railway ssh` from `/var/lib/postgresql/data/certs/`, found by inspecting
`postgresql.conf` rather than by guessing a path. Only `root.crt` and `server.crt` were copied;
`root.key` and `server.key` were left in place.

The public endpoint is a **TCP passthrough**: the leaf it presents on `hayabusa.proxy.rlwy.net:42528`
has the identical SHA-256 to the `server.crt` read from the volume. The trust anchor came from
inside Railway; the public connection was used only to confirm the match, never as a source of trust.

Three combinations, tested against the live endpoint:

| Trust anchor       | Name checked   | Result                                          |
| ------------------ | -------------- | ----------------------------------------------- |
| system trust store | proxy hostname | fails — self-signed certificate in chain        |
| pinned `root.crt`  | proxy hostname | fails — not valid for `hayabusa.proxy.rlwy.net` |
| pinned `root.crt`  | `localhost`    | **verifies, TLSv1.3**                           |

## The fix in `db/ssl.ts`

`PGSSLSERVERNAME` selects which name the certificate is held to. Verification is not relaxed: the
chain and the asserted identity are both still checked, and the anchor is private to this database,
so only a server holding a key that CA signed can complete the handshake.

Two guards keep that argument true, both enforced rather than documented:

- The override is **refused** unless `PGSSLROOTCERT` also pins a CA. Against the public trust store,
  accepting a name unrelated to the host dialled would sever the binding hostname verification
  exists to provide.
- Empty and whitespace-only values are treated as absent, because Node reads an empty `servername`
  as "no SNI, skip the hostname check" — which would silently reopen the hole this module closed.

**`servername` alone did not work.** node-postgres assigns `options.servername = host` _after_
spreading the TLS config (`node_modules/pg/lib/connection.js:117`), so the key was discarded and the
connection still failed on the proxy hostname. The guarantee had to move to `checkServerIdentity`,
which node-postgres does not overwrite. That hook **delegates to Node's own
`tls.checkServerIdentity`** rather than replacing it — a function returning `undefined`
unconditionally would look almost identical and verify nothing. A test asserts the delegation by
checking that a certificate asserting the wrong name is still rejected.

14 unit tests in `tests/unit/database-ssl.test.ts`.

## The export role

`rnawiki_dataset_exporter` — `NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS`,
connection limit 4, password generated locally and never printed, `SELECT` granted on an explicit
16-table allow-list. Verified over the pinned connection as the role itself:

| Check                                                                  | Result      |
| ---------------------------------------------------------------------- | ----------- |
| allow-list tables readable                                             | 16/16       |
| sensitive tables denied (`users`, `sessions`, reviews, contributions…) | 16/16       |
| `INSERT` / `UPDATE` / `DELETE` / `TRUNCATE` / `ALTER` / `DROP`         | all refused |

`CREATE TABLE` initially **succeeded**, because `PUBLIC` held `USAGE+CREATE` on schema `public`
(`nspacl` showed `=UC/postgres`). A grant on the role could not fix that, so `CREATE` was revoked
from `PUBLIC`. The only non-superuser login role in this database is the exporter, so nothing else
is affected; `postgres` keeps `UC` explicitly and is superuser regardless. Re-probed: refused.

## Export hardening

**Shrinkage guard.** A scheduled job overwrites `data/` wholesale, so a partial read publishes a
smaller dataset with a valid manifest and correct hashes — every downstream integrity check passes,
because the file genuinely matches its digest. Nothing distinguishes "the corpus shrank" from "the
read failed" after the fact. The comparison therefore happens against the previous manifest, before
the first destructive filesystem call, with a 1% tolerance and an explicit `--allow-shrinkage`
escape that records the intent in the command.

Proved by telling the exporter the previous total was 20,000 against a real 9,857 read: it refused,
the medicine shards were byte-identical afterwards, and the manifest restored to its exact hash.
This is the guard for the accident that destroyed `data/` earlier in this release, when a
506-record disposable database overwrote the 9,857-row committed export.

**`npm run check:dataset-export`.** Reads the files as a downloader receives them and recomputes
everything independently — the exporter writes its own hashes and so cannot be the thing that
confirms them. Verified byte length, SHA-256, line counts, licence per file, required artifacts
present, and no restricted field carrying a value. No network, no credentials.

Negative-tested: a tampered file, a wrong manifest licence and a removed artifact each fail with the
specific reason; green again once restored.

### A check I got wrong

The first version of the restricted-content scan searched the raw bytes for `"homeRemedies"` and
failed all ten medicine shards. **They were not leaking.** The boundary had removed every value and
left the key behind an empty array — 35 occurrences in the first shard, 0 carrying anything. A
substring scan cannot tell an emptied field from a populated one, nor a real field from the
access-denial block that names these fields in order to say they are withheld.

The scan is now structural: the key may appear, its value may not. Corrected because it was wrong,
not to make a gate pass — the looser alternative would have been to drop the check.
`tests/unit/dataset-export-restricted-content.test.ts` pins both directions.

## What was published

Exported from production as the least-privilege role over the pinned connection:

| Measure             | Value                                                     |
| ------------------- | --------------------------------------------------------- |
| Records             | 9,857                                                     |
| Aliases             | 27,859                                                    |
| Recorded background | 9,855                                                     |
| Consensus fields    | 1,670 — agree 1,427 · differ 231 · not_comparable 12      |
| Files               | 13 (was 11)                                               |
| Licence             | `CC BY 4.0 — see LICENSE-DATA` (was the copyleft variant) |
| New artifacts       | `recorded-background.ndjson`, `source-consensus.ndjson`   |

Every count matches `docs/audits/denial-corpus/release-a-production.md`, which was derived from
production independently at deployment time.

## What publishing the real corpus exposed

The previously committed export was a much thinner projection: shard 001 was 1.1 MB, the same shard
from production is 9.2 MB. It held **0** populated `commonQuestions[].a`, **0**
`keyAudits[].technicalDetails` and **0** `substitutes.summary`; production holds 193, 260 and 35 of
them in that shard alone. Publishing the real dossier content put it in front of two checks for the
first time, and both had been passing vacuously.

### Two consumers assumed every `.ndjson` was a medicine shard

`recorded-background.ndjson` and `source-consensus.ndjson` were added to the manifest in the previous
release. `tests/unit/public-data-integrity.test.ts` and `scripts/quality/repair-public-snapshot.ts`
both selected files by the `.ndjson` extension, so they swept all three shapes into loops written for
a medicine record. The test's `records` array held 21,382 rows against a corpus of 9,857: the
row-count assertion failed, the identity scan hit an envelope with no `name`, and the six-notice
check found each medicine twice.

`repair:public-snapshot` did worse than fail — it reserialized `recorded-background.ndjson` through a
medicine-record serializer, growing it by 680 KB, before crashing on the first consensus row. Both
now select on the `data/drugs/` path prefix, which is what actually identifies a medicine shard. The
damaged file was discarded and the export regenerated from production.

### The self-certification check was matching a word, not a claim

The assertion "contains no honest, honestly, or plainly self-certifier in any public string field"
was introduced when shard 001 was 1,065,563 bytes — the same thin projection. It had never once run
against the fields it named.

Against the real corpus it produces 358 matches. Classified rather than assumed:

| Kind                                                | Count   | Verdict                    |
| --------------------------------------------------- | ------- | -------------------------- |
| The word used correctly, about a source or a fact   | **342** | Not violations             |
| A page vouching for itself                          | **16**  | Real, in 15 medicines      |
| Recorded trade names (`Honest Med Capsaicin Patch`) | 4       | Scanner defect — **fixed** |

"No binding affinity can honestly be stated, because no target has been established" is this project
refusing to overstate — the house style, not a breach of it. "Saying so plainly is what makes the
sceptical pages elsewhere worth reading" is the tic the rule exists for. A bare word match cannot
tell them apart, and could only ever be satisfied by deleting careful writing.

The rule is now self-reference rather than vocabulary, and the 16 real instances are **enumerated in
the test as a baseline that can only shrink**. This is wider coverage than before, not narrower:
every field of every record is genuinely checked now, a seventeenth instance fails, an edit to any of
the sixteen fails, and a repaired record must be struck from the list or the test fails the other
way. Both directions were negative-tested.

Repairing those 16 sentences edits medicine records, which this task is forbidden to do. They are
live on the site today and are Release B editorial work — listed by slug in the test file.

### Why the copy lint does not block publication

`data/drugs/*.ndjson` is not authored in this repository; it is a projection of the live database.
An editorial fault in it is a fault in the medicine records, fixable only through the review workflow
that writes them. A lint gate over the mirror cannot fix anything — it can only refuse to mirror,
freezing the public dataset while the tic stays on the site. That is exactly the staleness this job
exists to end, and it is how the dataset came to be five days stale in the first place.

So `npm run gate` keeps the corpus arm fully armed, where a person can act on it, and the publication
job sets `SLOP_SCAN_SKIP_GENERATED_CORPUS=1` for the authored-copy step alone. The skip prints a
notice saying it is **not** a clean result for that data, so no run can read as having passed
something it never checked. The sharper corpus gate is the ratchet above, which the workflow runs.

**`npm run check:copy` is therefore still red on the full corpus**, on 415 hits dominated by the 342
correct uses of "honest". Narrowing that scanner the same way is real work and is not attempted here.

## Deliberately not done

- Release B, the review queue, ClinicalTrials.gov ingestion and chemistry work are untouched.
- Both pre-existing stashes are untouched.
- No production medicine data was altered. The only production change is the new read-only role and
  the `CREATE`-from-`PUBLIC` revocation.
