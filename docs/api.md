# RNAwiki public API (v1)

Free, read-only, no auth. It serves only published content — no drafts, no reviewer notes, no
internal ids beyond what the site already exposes (entity slugs, and the claim numeric id used in
`/embed/claim/[id]`).

- All responses are `application/json`, all endpoints allow any origin
  (`Access-Control-Allow-Origin: *`).
- Success is cacheable: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`.
  Errors are `no-store`.
- **Rate limit:** 60 requests/minute per IP. Over it returns `429`
  `{"error": "Too many requests. Please slow down."}`.
- **Not found:** a missing slug/id and an unpublished one return the same
  `404 {"error": "Not found"}`. The API never reveals that unpublished content exists.
- **Versioned:** every 200 from the entity and claim endpoints carries top-level
  `"schemaVersion": "1.3.0"`. See [Schema versioning](#schema-versioning).

## The claim shape

Returned by both endpoints below — nested per claim by the entity endpoint, bare by the claim
endpoint.

| field | type | meaning |
|---|---|---|
| `directAnswer` | string | The 1–2 sentence consumer-facing answer, caveat included. |
| `measuredFinding` | string | What was directly measured. |
| `inference` | string | What people conclude from that finding, stated separately from the measurement. |
| `proofBoundaryStage` | string | Machine key, weakest → strongest: `biological_rationale_only`, `isolated_cell_evidence`, `animal_evidence`, `observational_human_evidence`, `uncontrolled_human_intervention`, `controlled_human_evidence`, `independently_supported_controlled_human_evidence`, `regulatory_evidence`. Defined in [`docs/evidence-classification.md`](evidence-classification.md). |
| `proofBoundaryStageLabel` | string | Human-readable label, e.g. "Controlled human evidence". |
| `claimType` | string | Added in 1.3.0. What kind of question the claim answers: `effectiveness`, `safety`, `claimed_use`, `mechanism`, `regulatory` or `access`. Read it before you read `proofBoundaryStage`. |
| `evidencePositionApplies` | boolean | Added in 1.3.0. Whether `proofBoundaryStage` and `proofBoundaryStageLabel` mean anything for this claim. `false` for `mechanism`, `regulatory` and `access` claims — see below. |
| `evidenceContext` | array | One entry per linked source: `{ relationship, relationshipLabel, claimPartAddressed, directlyMeasuredResult, independentGroupStatus }`. `relationship` is `supports`, `contradicts`, `limits` or `contextualizes`; `independentGroupStatus` is a boolean. |
| `sourceLinks` | array | One entry per source with at least one public link: `{ doi, pmid, regulatoryUrl }`, each nullable. Internal source ids are never included. |
| `lastReviewedAt` | string \| null | ISO 8601 timestamp of the last scientific review, `null` if unreviewed. |
| `canonicalUrl` | string | Permanent citable URL for the claim (an entity-page anchor). |
| `claimVersion` | number | Added in 1.1.0. The editorial version of the claim's text. A bump means an editor changed the wording, not that new evidence appeared. |
| `lastCheckedAt` | string | Added in 1.1.0. ISO 8601 timestamp of the last edit to the claim record. Not a re-verification of every source, and not the date of the newest evidence. |
| `checkedAt` | string \| null | Added in 1.2.0. ISO 8601 timestamp of the last **editorial** check: when an editor read the cited sources and checked the answer against them. `null` when none is recorded. Distinct from `lastCheckedAt`, which is a database write timestamp and can move without anyone reading anything. Do not substitute one for the other. Still not a scientific review — that is `reviewState`. |
| `remainingUnknown` | string | Added in 1.1.0. What the available evidence cannot answer. Absence of evidence, not evidence of absence. |
| `evidenceNeededNext` | string | Added in 1.1.0. What would have to be measured to move the claim. Not a prediction that such a study exists or would succeed. |
| `reviewState` | string | Added in 1.1.0. `independently_reviewed` or `editorial_only`. Derived only from an approved row in `reviews`; editorial publication status never produces `independently_reviewed`. No reviewer name, credentials or comments are ever exposed. |
| `claimEvents` | array | Added in 1.1.0. Published claim events, ordered by display priority then newest date. Empty when none is published. Shape below. |
| `evidenceChanges` | array | Added in 1.1.0. Public change history for this claim, newest first. Empty when the record has not changed publicly. Shape below. |

`proofBoundaryStage` and `proofBoundaryStageLabel` are the claim's **evidence position**: how far
testing has gone, never a verdict on whether the claim is true or the treatment advisable. There is
no separate `evidencePosition*` field — these two are it.

**Read `evidencePositionApplies` before you print the position.** The position describes how far
testing has gone for an *outcome*. A claim about what a hospital procedure involves, or about what a
regulator decided, has no evidence ladder to sit on, and the stored stage on such a claim records
where the answer came from rather than how well tested an outcome is. Printed as a position it says
something false: Casgevy's access claim, "What does actually getting treated with Casgevy involve?",
carries `"proofBoundaryStage": "regulatory_evidence"`, and rendering that as an evidence position
puts "a medicines regulator reviewed the evidence and approved the product for a specific use"
underneath a logistics answer, filling the ladder to its top rung for a description of a hospital
stay. RNAwiki's own record page renders no ladder and no position sentence for those claims. When
`evidencePositionApplies` is `false`, do the same: the two `proofBoundary*` fields are still served,
still valid, and still exactly what the database holds, but they do not describe the strength of
evidence for that claim and must not be presented as if they did. The rule is one function,
`stagePositionApplies` in `lib/evidence-view.ts`, called by the API and by every page that prints a
position, so the two cannot disagree.

### `claimEvents[]`

A recorded point where testing or development did not go the way the claim assumes. Every event
carries a source; an event that cannot be cited is not stored. Draft events are never served.

| field | type | meaning |
|---|---|---|
| `eventType` | string | Machine key: `contradictory_result`, `null_result`, `safety_limited`, `exposure_or_delivery_limit`, `target_engagement_not_shown`, `target_engagement_shown_no_clinical_benefit`, `trial_design_limit`, `program_stopped_scientific`, `program_stopped_commercial`, `regulatory_or_safety_change`, `retraction_or_correction`, `other`. |
| `eventTypePublic` | string | The plain-language sentence RNAwiki publishes for that key. Print this, not the key. |
| `developmentGate` | string | Where the development chain broke: `human_biology`, `intervention_direction`, `delivery_or_exposure`, `target_engagement`, `pathway_response`, `patient_selection`, `clinical_outcome`, `safety`, `trial_design`, `manufacturing`, `commercial`, `unknown`. |
| `developmentGatePublic` | string | The plain-language sentence for that gate, defining its own jargon. |
| `plainSummary` | string | What happened, taken from the source's own recorded result. |
| `whatItSuggests` | string | The narrow reading the event supports, bounded to what was measured. |
| `whatItDoesNotEstablish` | string | A boundary statement, not a conclusion — what the event leaves open. |
| `eventDate` | string \| null | ISO 8601. `null` means RNAwiki could not verify a date. |
| `source` | object | `{ title, doi, pmid, clinicalTrialId, regulatoryUrl }`, every field but `title` nullable. No internal source id. |

### `evidenceChanges[]`

| field | type | meaning |
|---|---|---|
| `changeType` | string | `new_controlled_trial`, `regulatory_decision`, `safety_warning`, `retraction_or_correction`, `independent_study` or `boundary_moved`. |
| `previousBoundary` | string \| null | Proof Boundary stage before the change. `null` when the change did not move the position. |
| `newBoundary` | string \| null | Stage after the change. `null` when the change did not move the position. |
| `explanation` | string | Why the record changed, in plain language. |
| `source` | string | URL or citation for the evidence behind the change. |
| `publicationDate` | string | ISO 8601 date RNAwiki published the change, not the date the study or decision happened. |

Nothing else is exposed on a claim: no reviewer name, credentials or comments, no publication-status
workflow state, no unpublished claim event, no correction-moderation data, no internal user or source
ids, and no source metadata beyond the link fields above.

## `GET /api/v1/entities/[slug]`

One published entity with its published claims nested. `slug` is the same slug as `/r/[slug]`.

```bash
curl -s https://rnawiki.com/api/v1/entities/example-entity
```

```json
{
  "schemaVersion": "1.3.0",
  "canonicalName": "Example Peptide",
  "slug": "example-entity",
  "aliases": ["Alt Name"],
  "entityType": "supplement_ingredient",
  "shortDescription": "One-sentence description.",
  "bottomLine": "2-3 sentence plain-language bottom line, caveat included.",
  "regulatoryCategory": "dietary_supplement",
  "canonicalUrl": "https://rnawiki.com/r/example-entity",
  "updatedAt": "2026-06-01T00:00:00.000Z",
  "regulatoryStatuses": [
    {
      "jurisdiction": "United States",
      "legalCategory": "dietary_supplement",
      "approvedIndications": null,
      "statusStatement": "Sold as a dietary supplement; not FDA-approved to treat any condition.",
      "source": "https://www.fda.gov/...",
      "checkedDate": "2026-05-01T00:00:00.000Z"
    }
  ],
  "claims": [ "…one object per published claim, in the claim shape above…" ]
}
```

**Errors:** `404` no such entity, or not published. `429` rate-limited.

## `GET /api/v1/claims/[claimId]`

One published claim by numeric id, returned as the bare claim object above plus top-level
`schemaVersion`, with no wrapping entity — dereference `canonicalUrl` for page context. Empty
`evidenceContext`/`sourceLinks`/`claimEvents`/`evidenceChanges` arrays and a `null` `lastReviewedAt`
are all valid.

```bash
curl -s https://rnawiki.com/api/v1/claims/42
```

**Errors:** `404` no such claim, the claim isn't published, or its entity isn't published. `429`
rate-limited.

## `GET /api/v1/search?q=...`

Case-insensitive substring (`ILIKE`) search over published entity names/aliases and published claim
questions. Returns up to 10 entity matches and 10 claim matches, entities first. `q` is required,
trimmed, truncated to 200 characters.

```bash
curl -s "https://rnawiki.com/api/v1/search?q=tendon"
```

```json
{
  "query": "tendon",
  "results": [
    {
      "type": "entity",
      "canonicalName": "Example Peptide",
      "slug": "example-peptide",
      "shortDescription": "...",
      "canonicalUrl": "https://rnawiki.com/r/example-peptide"
    },
    {
      "type": "claim",
      "id": 42,
      "consumerQuestion": "Does it improve tendon healing?",
      "directAnswer": "...",
      "claimType": "effectiveness",
      "proofBoundaryStage": "animal_evidence",
      "proofBoundaryStageLabel": "Animal evidence",
      "evidencePositionApplies": true,
      "entityName": "Example Peptide",
      "entitySlug": "example-peptide",
      "canonicalUrl": "https://rnawiki.com/r/example-peptide#claim-tendon-healing"
    }
  ]
}
```

`results` is a flat array; read `type` to tell entities and claims apart.

**Read `evidencePositionApplies` before you print the position** — the same rule as
`/api/v1/claims/[claimId]`, and the reason this endpoint carries `claimType` at all. Every claim has
a `proofBoundaryStage`, but the position only describes how far testing went for an *outcome*. When
`evidencePositionApplies` is `false` the claim is a mechanism, regulatory or access question,
RNAwiki's own pages print no position for it, and neither should you: doing so puts "a medicines
regulator reviewed the evidence and approved the product for a specific use" underneath "what does
actually getting treated involve". One function, `stagePositionApplies`, decides this for the API
and for every page that prints a position, so the two cannot disagree.

**Errors:** `400 {"error": "Query parameter \"q\" is required."}` for a missing or empty `q`. `429`
rate-limited.

## Schema versioning

`schemaVersion` is `1.3.0` and appears at the top level of every 200 from
`/api/v1/entities/[slug]` and `/api/v1/claims/[claimId]`. `/api/v1/search` is a lookup helper, not a
record, and does not carry one.

- **Minor bump** — fields were added. Every existing field keeps its name, type and meaning.
- **Major bump** — a field was removed, retyped or given a new meaning. Announced, never silent.

A consumer should ignore properties it does not recognise, so a minor bump never requires a code
change. Version `1.1.0` added `schemaVersion`, `claimVersion`, `lastCheckedAt`, `remainingUnknown`,
`evidenceNeededNext`, `reviewState`, `claimEvents` and `evidenceChanges`. Version `1.2.0` added
`checkedAt`. Version `1.3.0` added `claimType` and `evidencePositionApplies`, which qualify the
`proofBoundary*` fields without changing them. Everything in `1.0.0`, `1.1.0` and `1.2.0` is
unchanged.

Machine-readable definition, including what each field asserts and what it does not:
[`schemas/evidence-record.schema.json`](../schemas/evidence-record.schema.json). The guarantees
behind the record, and the ones RNAwiki does not make, are in
[`docs/open-evidence-record.md`](open-evidence-record.md).

## Known limitations

- **Rate limiting is in-memory, per instance** (`lib/rate-limit.ts`). It resets on every deploy and
  is not shared across replicas — correct for one running instance only. Multi-instance scale needs
  a shared store such as Redis.
- **Search is a separate implementation** from the site's own `lib/search.ts`, which does full-text
  typo-tolerant ranking for the human `/search` page. Results and ranking can differ until the two
  are unified, which they should be.
- **`lastCheckedAt` is an edit date, not a monitoring guarantee.** Nothing re-verifies cited sources
  on a schedule, so a record can be current in the database and stale against the literature.
  `checkedAt` is the editorial check date and is the only one of the two that asserts a person read
  anything; it is `null` on any claim where no check has been recorded, and nothing fills it in.
- **`regulatoryUrl` is the source's own URL, not a promise about its publisher.** It is the only URL
  field on an evidence source, so it carries a regulator's record where one exists and news, trade
  press or manufacturer material where it does not. Read `sourceType` on the record page (or in the
  entity/claim payload's own source rows) to learn who published a given URL.

## Reuse terms

The code is licensed under **AGPL-3.0-only** (`LICENSE`). The evidence records this API serves are
licensed under **CC BY 4.0** (`LICENSE-DATA`): you may copy, redistribute, adapt and build on them,
including commercially and including as retrieval or training data, provided you give credit. The
attribution form, and what each licence does and does not cover, are in
[`docs/licensing.md`](licensing.md) and on the public page at `/licensing`. Those are the canonical
statements — this section points at them rather than restating the terms, so the two cannot drift.
