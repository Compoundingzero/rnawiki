# The Evidence Record

What RNAwiki publishes about one claim, in a form a person can read and a program can parse.
Companion documents: [`docs/api.md`](api.md) for the endpoints and the field table,
[`schemas/evidence-record.schema.json`](../schemas/evidence-record.schema.json) for what each field
asserts and what it does not.

## What an Evidence Record is

An Evidence Record is everything RNAwiki has published about one claim: the answer, what was
directly measured, what is inferred from that measurement, how far testing has gone, what is still
unknown, what would move the answer, the recorded points where testing did not go the way the claim
assumes, and the history of how the record itself changed.

The unit is the claim, not the paper. A claim is one answerable question about one substance, such
as "Does BPC-157 heal tendons and ligaments faster?". One paper often appears under several claims,
scoped each time to what it measured, and a claim moves independently of every other claim about the
same substance.

The same record exists in two forms. The reader's form is the page at `/r/{slug}#claim-{claim-slug}`.
The machine form is JSON from `/api/v1/claims/{claimId}`, or from `/api/v1/entities/{slug}` with
every published claim about one substance nested. Both are built from the same rows, so they cannot
disagree.

## What is in one

Four groups.

**The answer.** `directAnswer` states how solid the claim is, with its caveat in the same sentence.
`measuredFinding` is what a study observed under the conditions it ran in. `inference` is what that
finding is commonly taken to mean, recorded separately because it is not itself a measurement.

**The position.** `proofBoundaryStage` and `proofBoundaryStageLabel` give the stage reached by the
strongest directly relevant evidence, on the eight-stage scale defined in
[`docs/evidence-classification.md`](evidence-classification.md). They are meaningful only when
`evidencePositionApplies` is `true` — see below. `claimType` says what kind of question the claim
answers. `evidenceContext` says how each source bears on this claim: supports, contradicts, limits
or contextualizes. `sourceLinks` carries the DOI, PMID and regulatory URL for reaching the
originals.

**The limits.** `remainingUnknown` is what the available evidence cannot answer. `evidenceNeededNext`
is what would have to be measured. `claimEvents` records the null results, contradictory results,
exposure limits, stopped programmes and retractions that are already in the cited corpus, each one
tied to a source.

**The record's own state.** `claimVersion`, `lastCheckedAt`, `checkedAt`, `lastReviewedAt`, `reviewState`,
`evidenceChanges` and `canonicalUrl`. These describe the record, not the science.

Per-field types and nullability are in [`docs/api.md`](api.md). The meaning of each field, written
as what it asserts and what it does not, is in the JSON Schema.

## Four fields that get read wrong

`evidencePositionApplies` decides whether the position fields say anything at all. An evidence
position describes how far testing has gone for an **outcome**. A claim about what a hospital
procedure involves, or about what a regulator decided, or about a proposed mechanism, has no
evidence ladder to sit on: the stored stage on such a claim records where its answer came from, not
how well tested an outcome is. Casgevy's access claim, "What does actually getting treated with
Casgevy involve?", is stored at `regulatory_evidence`, and read as a position that says a regulator
reviewed the evidence and approved the product — underneath a description of apheresis,
chemotherapy and a hospital stay. It fills the ladder to its top rung for a logistics answer. So
RNAwiki's own record page prints no ladder and no position sentence for `mechanism`, `regulatory`
and `access` claims, and a consumer must not print one either. The `proofBoundary*` fields are still
served for those claims, still valid and still exactly what the database holds; they simply are not
a statement about the strength of the evidence. One function decides this for the page and the API
alike — `stagePositionApplies` in `lib/evidence-view.ts` — so the JSON and the page cannot drift
apart on it.

`proofBoundaryStage` answers how far the evidence reaches. It never answers whether the claim is
true or whether the treatment is a good idea. A claim at `biological_rationale_only` is early rather
than wrong. A claim at `regulatory_evidence` records that a regulator authorised a defined use under
defined conditions, and says nothing beyond that use. The stage is also direction-neutral: rapamycin's
human-healthspan claim sits at `controlled_human_evidence` with a null primary endpoint, because a
controlled trial exists.

`whatItDoesNotEstablish` on a claim event is a boundary statement, not a conclusion. It records what
the event leaves open. A missed endpoint does not establish that a treatment does nothing, an
untested question is not a disproved one, and a programme stopped for commercial reasons is not a
scientific result.

`reviewState` is `independently_reviewed` only when an approved review row exists for that claim.
Editorial publication status never produces that value, because passing editorial workflow is not
scientific sign-off. `editorial_only` is the normal state for most claims and does not mean the
claim is unreliable.

## Versioning and change history

Four things version separately, and conflating them is the usual mistake.

| What moved | Where it shows | What a change means |
|---|---|---|
| The response format | `schemaVersion` | Fields were added. Within a major version nothing is renamed, retyped or removed. |
| The claim's wording | `claimVersion` | An editor changed this record's text. No new evidence is implied. |
| The record's last edit | `lastCheckedAt` | RNAwiki touched the record on that date. A database write, not a reading. |
| The record's last editorial check | `checkedAt` | An editor read the cited sources and checked the answer against them on that date. `null` when none is recorded, and nothing substitutes the write date for it. |
| The evidence | `evidenceChanges` | A new trial, a regulatory decision, a safety warning, a retraction, an independent study, or a moved boundary. |

`evidenceChanges` is newest first. Each entry carries `previousBoundary` and `newBoundary`, which are
null when the change did not move the position, plus a plain-language `explanation`, the `source`
that caused it, and the `publicationDate` on which RNAwiki published the change. That date is not
the date the underlying study or decision happened.

`schemaVersion` is `1.3.0`. Version 1.1.0 added `schemaVersion`, `claimVersion`, `lastCheckedAt`,
`remainingUnknown`, `evidenceNeededNext`, `reviewState`, `claimEvents` and `evidenceChanges`.
Version 1.2.0 added `checkedAt`. Version 1.3.0 added `claimType` and `evidencePositionApplies`,
which qualify the `proofBoundary*` fields rather than replacing them: both of those keep their
names, types and values. Everything published in 1.0.0, 1.1.0 and 1.2.0 kept its name, type and
meaning.

## What RNAwiki guarantees

1. Only published content is served. Drafts, unpublished claim events, the corrections moderation
   queue, reviewer identity and reviewer comments never appear in a record, on the page or in JSON.
2. Every cited source is a real identifier that was checkable when an editor recorded it. Nothing is
   generated, filled in from a pattern, or shown as a placeholder.
3. Every claim event has a source. The column is `NOT NULL` in the schema, so an event that cannot be
   cited cannot be stored.
4. A measurement and an inference are always separated. `measuredFinding` never carries a conclusion
   the study did not measure.
5. No dosage, protocol, stacking or sourcing information appears in any field. That is the boundary
   the product exists to hold.
6. No score, percentage, star rating or confidence value is ever attached to the **evidence**. The
   evidence has three states and no fourth: Measured, Inferred, Unknown. Numbers in a record come
   from a named study only, such as a sample size or a quoted p-value.

   One carve-out, and it is not about the evidence. A record page may publish an aggregate of the
   anonymous comprehension check — "N% of readers correctly identified where the evidence ends" —
   which measures whether RNAwiki's own writing was understood, not whether the treatment works. It
   appears only once at least 20 readers have answered that question, it is never a rating of a
   claim, and it never appears in the JSON record.
7. Within one major `schemaVersion`, a consumer that parses the record today keeps working. New
   fields may appear; existing fields do not change.
8. A record that does not exist and a record that is not published return the same `404`. The API
   cannot be used to detect unpublished content.

## What RNAwiki does not guarantee

- **It is not medical advice.** The record states how far the evidence reaches. It does not tell
  anyone what to take, whether to stop, or what to do next.
- **It is not complete.** The sources listed are what RNAwiki checked for that claim, not the
  literature of the field. Absence from a record means RNAwiki has not published it, never that it
  does not exist.
- **It is not continuously monitored.** `lastCheckedAt` is the date of the last edit to the record
  — a database write, which can advance without anyone reading anything. `checkedAt` is the date an
  editor last read the cited sources and checked the answer against them, and is `null` where no
  such check is recorded. Neither is a promise that every cited source was re-verified that day, and
  neither is the date of the newest evidence.
- **It is not peer review.** Most claims are `editorial_only`. Where `independently_reviewed`
  appears, it records that an approved review exists for the version you are reading — an approval
  of an earlier version degrades to `editorial_only` rather than travelling as a live one — but it
  is one reviewer's decision, not the judgement of a field.
- **It is not immutable.** `canonicalUrl` resolves to the current version of a claim, not to the
  version you fetched. Store `claimVersion` and `lastCheckedAt` if you need to know which version
  you read.
- **It is not a mirror.** RNAwiki holds identifiers and links, not copies of the sources. Follow the
  DOI, PMID, trial id or regulatory URL for the original.
- **It is not a regulator, and it is not a substitute for one.** Regulatory status is recorded per
  jurisdiction with the date it was checked, and asserts nothing about any other jurisdiction.

## How to retrieve one

Free, read-only, no key, any origin.

```bash
# One claim
curl -s https://rnawiki.com/api/v1/claims/42

# One substance, with every published claim nested
curl -s https://rnawiki.com/api/v1/entities/bpc-157

# Find the id or slug first
curl -s "https://rnawiki.com/api/v1/search?q=tendon"
```

The record page advertises its own JSON form through a `<link rel="alternate" type="application/json">`
in the page metadata, so a crawler that has the HTML does not need to guess the API path.

Success responses are cacheable for an hour and revalidate for a day. The rate limit is 60 requests
per minute per IP, and over it the response is `429`. Errors are never cached. Full endpoint
behaviour, including the limits of that rate limiter, is in [`docs/api.md`](api.md).

## How to cite one

Cite `canonicalUrl`, not the API URL. The API path is for fetching; the canonical anchor is the
address a reader can open and check.

Quote `directAnswer` whole. The caveat lives inside that sentence by construction, and splitting the
claim from its qualifier turns a bounded answer into an unbounded one. `lib/citation.ts` enforces
the same rule for the site's own copy control, which produces:

```
<directAnswer> RNAwiki, checked <YYYY-MM-DD>: https://rnawiki.com/r/<slug>#claim-<claim-slug>
```

The verb is load-bearing, and it is chosen from the record rather than fixed. `checked` states that
an editor read the cited sources and is used only where `checkedAt` exists, dated from it. Where no
editorial check is recorded the verb drops to `edited`, dated from `lastCheckedAt`, because a
database write cannot support the word "checked". It becomes `reviewed` only for a claim whose
`reviewState` is
`independently_reviewed` — an approved review row that still covers the version on screen. A
citation pasted onto a page RNAwiki does not control may not over-claim by a single word.

For a citation that has to stay resolvable to an exact version, record `claimVersion` and
`lastCheckedAt` alongside the URL, because the URL itself always resolves to the current version.

An embeddable single-claim view is available at `/embed/claim/{claimId}`. It carries the question,
the answer, the evidence position and a link back to the full record, and it is served `noindex` so
embedding it does not compete with the canonical page.

## Reuse terms

The evidence records are licensed under **CC BY 4.0** (`LICENSE-DATA`); the application code is
licensed separately under **AGPL-3.0-only** (`LICENSE`). Copying, redistributing, adapting and
building on a record is permitted, commercially and as retrieval or training data, provided you
give credit. The attribution form and the full terms are in [`docs/licensing.md`](licensing.md) and
on `/licensing`; this section deliberately does not restate them, so it cannot drift from them.

Cite by canonical URL and retrieval date. A record is versioned and its conclusion can change when
new evidence lands, so a citation without a link and a date describes a position that may no longer
hold.
