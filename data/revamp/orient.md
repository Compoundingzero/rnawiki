# Phase 0 Step 0.1 — orientation: the ruler as the code defines it

Written 2026-09-05T05:18:12Z. Every rule below is quoted from the file and line named. Nothing here
is paraphrased and nothing is re-derived; where a number is given, the JSON that holds it is named.

Read first: `docs/worklogs/corpus-20k.md` lines 503–677 (FINAL REPORT), `docs/specs/identity-resolution.md`,
`data/corpus-20k/identity/worked-examples.md`, `docs/specs/field-models.md`.

---

## 1. The three field models as the code defines them

**Authority: `scripts/corpus-20k/fields/coverage.py` lines 33–43.** This dict, not the spec prose, is
what every count in the run was computed against.

```python
MODELS = {
    "LONGEVITY": ["hallmark", "organismLadder", "itp", "endpointType", "humanCeiling", "clocks",
                  "doseResponse", "pathway", "kinetics", "interactions", "trialFailures",
                  "biomarkers", "regulatory", "ongoingTrials", "faers"],
    "CLINICAL": ["indication", "labelKinetics", "interactions", "adverseEvents", "faers",
                 "trialHistory", "trialFailures", "regulatory", "withdrawal"],
    "DEVELOPMENT": ["target", "mechanismClass", "highestPhase", "whyStopped", "sponsor",
                    "patentStatus", "everDosedInHumans", "relatedOnTarget"],
}
```

LONGEVITY **15**, CLINICAL **9**, DEVELOPMENT **8**. The human-readable names are the `LABELS` dict at
`coverage.py` lines 45–66, whose LONGEVITY entries carry the numbering of `docs/specs/field-models.md`:

| # | LONGEVITY key | Label at `coverage.py:46-54` |
| ---: | --- | --- |
| 1 | `hallmark` | 1 Hallmark of aging |
| 2 | `organismLadder` | 2 Model-organism ladder |
| 3 | `itp` | 3 NIA ITP |
| 4 | `endpointType` | 4 Endpoint type per finding |
| 5 | `humanCeiling` | 5 Human evidence ceiling |
| 6 | `clocks` | 6 Epigenetic clocks |
| 7 | `doseResponse` | 7 Dose-response shape |
| 8 | `pathway` | 8 Pathway |
| 9 | `kinetics` | 9 Kinetics |
| 10 | `interactions` | 10 Interactions |
| 11 | `trialFailures` | 11 Trial failures |
| 12 | `biomarkers` | 12 Biomarkers measured |
| 13 | `regulatory` | 13 Regulatory status by jurisdiction |
| 14 | `ongoingTrials` | 14 Ongoing trials |
| 15 | `faers` | 15 FAERS signal |

CLINICAL 9 (`coverage.py:55-61`): Indication (label) · Label kinetics · 10 Interactions · Adverse
events · 15 FAERS signal · Trial history · 11 Trial failures · 13 Regulatory status by jurisdiction ·
Withdrawal status.

DEVELOPMENT 8 (`coverage.py:62-66`): Molecular target · Mechanism class · Highest phase reached · Why
development stopped · Sponsor · Patent status · Ever dosed in humans · Related compounds on the same
target.

### The TypeScript mirror, and where it disagrees

`scripts/corpus-20k/questions/derive.ts` line 207, `export const FIELD_IDS`, is the only TypeScript
list of field names. It is **not** a mirror of `MODELS`: it is one flat union of 32 ids under
different spellings, with `doseStudied` and `approvalDate` appended under a `// shared` comment.

```ts
/** Canonical field ids, one per field in docs/specs/field-models.md. */
export const FIELD_IDS = [
  // LONGEVITY 1..15
  'hallmarks',
  'organismLadder',
  'itp',
  'endpointTypes',
  'humanEvidenceCeiling',
  'epigeneticClocks',
  'doseResponseShape',
  'pathways',
  'kinetics',
  'interactions',
  'trialFailures',
  'biomarkersMeasured',
  'regulatoryStatus',
  'ongoingTrials',
  'faersSignal',
  // CLINICAL extras
  'indication',
  'adverseEvents',
  'trialHistory',
  'withdrawalStatus',
  // DEVELOPMENT
  'molecularTarget',
  'mechanismClass',
  'highestPhase',
  'whyDevelopmentStopped',
  'sponsor',
  'patentStatus',
  'everDosedInHumans',
  'relatedCompounds',
  // shared
  'doseStudied',
  'approvalDate',
```

There is no `lib/corpus` copy of the field list. `lib/corpus/page-text.ts` names no model.

`coverage.py` lines 12–16 state the counting decision that the loader then contradicts (§2):

> Counting rule, unchanged from Phase 2: coverage is counted **within** one model; only `present`
> counts; the denominator is that page's applicable fields (`present` + `absent`). A record key that
> sits beside `fields` — `doseStudied` and `approvalDate`, added in Phase 2b — is a sub-field of an
> existing field (docs/specs/field-models.md 15b and the CLINICAL withdrawal row), never a new field,
> and is deliberately not counted here.

---

## 2. Field presence per page

### 2a. The census reading — `scripts/corpus-20k/fields/coverage.py:main()`, lines 121–153

```python
    for model, field_names in MODELS.items():
        rows = records.get(model, [])
        state_by_field = {f: Counter() for f in field_names}
        histogram = Counter()
        applicable_counts = []
        coverage_ratios = []
        present_counts = []
        for r in rows:
            key = r["key"]
            if key in seen_keys:
                duplicate_keys += 1
            seen_keys.add(key)
            keys_with_record.add(key)
            assigned = (assignment.get(key) or {}).get("model")
            if assigned != model:
                model_mismatch += 1
            fields = r.get("fields") or {}
            if set(fields) != set(field_names):
                unmodelled += 1
            n_present = 0
            n_applicable = 0
            for f in field_names:
                state = (fields.get(f) or {}).get("state", "absent")
                state_by_field[f][state] += 1
                if state == "present":
                    n_present += 1
                if state != "not-applicable":
                    n_applicable += 1
            histogram[n_present] += 1
            present_counts.append(n_present)
            applicable_counts.append(n_applicable)
            coverage_ratios.append(n_present / n_applicable if n_applicable else 0.0)
            present_counts_by_key[key] = n_present
```

The rule in one line: iterate the model's own field list; `present` increments the numerator;
anything that is not `not-applicable` increments the denominator; a field absent from the record
defaults to `"absent"`, so it is counted as applicable-and-missing, never as not-applicable.

### 2b. The loader reading — `scripts/corpus-20k/load/materialise.ts`, function `buildBatch` (line 1355), lines 1445–1455

```ts
    const presentFieldCount = pageFieldRows.filter((row) => row.state === 'present').length
    const applicableFieldCount = pageFieldRows.filter(
      (row) => row.state !== 'not-applicable',
    ).length
    const pageType = pageTypeOf({
      tier,
      model: assignment.model,
      withdrawn: assignment.withdrawn,
      presentFieldCount,
    })
    const indexable = tier <= 2 && pageType !== 'stub' && presentFieldCount >= threshold
```

`pageFieldRows` is built at lines 1324–1351 from `recordedFields.fields` — one row per entry that
**exists** in the record, so a missing field contributes no row at all. That is the first divergence
from §2a, which fabricates an `"absent"` state for a missing field.

The second divergence is `liftTopLevelFields` (`materialise.ts:535-550`), applied at line 1022, whose
own comment states why it exists and what it does:

```ts
/* The augment stage writes some recorded fields beside `fields` rather than inside it —
 * `doseStudied` on every LONGEVITY and CLINICAL record, `approvalDate` on every CLINICAL record.
 * The page-text renderer already reads them (scripts/corpus-20k/render/page-text.ts, the
 * `for (const [k, v] of Object.entries(row))` pass), so the loader must read them by the same rule
 * or `present_field_count` disagrees with the count Gate 1b measured. The rule is exactly the
 * renderer's: any top-level entry that is an object carrying a string `state`, and whose name is
 * not already inside `fields`, is that field. Nothing is invented; the entry is copied as written. */
function liftTopLevelFields(record: FieldsRecord, counters: Counters): FieldsRecord {
  const fields: Record<string, RecordedField> = { ...(record.fields ?? {}) }
  for (const [name, value] of Object.entries(record)) {
    if (name === 'fields' || name === 'key' || name === 'model') continue
    if (value === null || typeof value !== 'object' || Array.isArray(value)) continue
    const entry = value as { state?: unknown }
    if (typeof entry.state !== 'string') continue
    if (fields[name] !== undefined) {
      counters.bump(`top-level field also present inside fields (kept the inner one): ${name}`)
      continue
    }
    fields[name] = value as RecordedField
    counters.bump(`fields read from a top-level entry: ${name}`)
  }
  return { ...record, fields }
}
```

So `present_field_count` counts **11 possible fields on a CLINICAL page** (9 + `doseStudied` +
`approvalDate`), **16 on a LONGEVITY page** (15 + `doseStudied`) and **8 on a DEVELOPMENT page**,
while `coverage.py` counts 9, 15 and 8 and deliberately excludes the two lifted keys (`coverage.py:12-16`).

`pageTypeOf` (`materialise.ts:758-768`) and `tierOf` (`materialise.ts:753-756`):

```ts
export function tierOf(assignment: ModelAssignment): number {
  if (assignment.model === 'LONGEVITY' || assignment.withdrawn) return 1
  return assignment.model === 'CLINICAL' ? 2 : 3
}

export function pageTypeOf(input: {
  tier: number
  model: string
  withdrawn: boolean
  presentFieldCount: number
}): string {
  if (input.tier === 3 && input.presentFieldCount < 3) return 'stub'
  if (input.model === 'LONGEVITY') return 'longevity'
  if (input.withdrawn) return 'withdrawn'
  if (input.model === 'CLINICAL') return 'clinical'
  return 'development'
}
```

The column is declared at `db/schema.ts:4707` (`presentFieldCount: integer('present_field_count')`)
with the migration constraint at `db/migrations/0024_corpus_pages.sql:36`:

```sql
CONSTRAINT "corpus_pages_field_counts" CHECK ("corpus_pages"."present_field_count" >= 0 and "corpus_pages"."applicable_field_count" >= 0 and "corpus_pages"."present_field_count" <= "corpus_pages"."applicable_field_count")
```

---

## 3. The three gates, in code

### Gate 1 — Tier 1 median ≥ 8 of 15
**`scripts/corpus-20k/fields/coverage.py:main()`, lines 286–291.**

```python
    gate1 = {
        "figure": "Tier 1 LONGEVITY-model median present fields of 15",
        "value": models_out["LONGEVITY"]["medianPresentFields"],
        "threshold": 8,
        "meets": models_out["LONGEVITY"]["medianPresentFields"] >= 8,
    }
```

The median itself is `coverage.py:69-71`, a lower-median (upper element on even counts, no
interpolation):

```python
def median(values):
    s = sorted(values)
    return s[len(s) // 2] if s else 0
```

fed from `"medianPresentFields": median(present_counts)` at `coverage.py:166`. Recorded result,
`data/corpus-20k/fields/coverage-summary.json` → `gate1`: `value` **10**, `threshold` 8, `meets` true.
Model medians in the same file: LONGEVITY 1,109 pages median 10 present / 15 applicable; CLINICAL
5,087 pages median 3 / 9; DEVELOPMENT 22,636 pages median 2 / **7** applicable — the DEVELOPMENT
ceiling of 7 is `patentStatus` being `not-applicable` corpus-wide.

Note for Phase 1: the comparison is against `medianPresentFields` — the raw count out of 15 — not
against `medianCoverageOfApplicable` (`coverage.py:170`), which the same function computes and does
not use for the gate.

### Gate 1b — the threshold rule
**`scripts/corpus-20k/overlap/gate1b_v3.py:analyse_matched()`, line 236.** The bucket construction
(lines 243–261), the selection rule (263–268) and the recorded rule string (283–288):

```python
    fields = {k: meta[k]["presentFields"] for k in rows}
    buckets: dict[str, dict] = {}
    counts = sorted(set(fields.values()))
    for c in counts:
        members = [k for k in rows if fields[k] == c]
        cum = [k for k in rows if fields[k] >= c]
        bp = np.array([rows[k]["positional"] for k in members])
        bl = np.array([rows[k]["lexical"] for k in members])
        cp = np.array([rows[k]["positional"] for k in cum])
        cl = np.array([rows[k]["lexical"] for k in cum])
        buckets[str(c)] = {
            "n": len(members),
            "posMed": float(np.median(bp)),
            "posP90": float(np.percentile(bp, 90)),
            "lexMed": float(np.median(bl)),
            "cumN": len(cum),
            "cumPosMed": float(np.median(cp)),
            "cumLexMed": float(np.median(cl)),
        }

    threshold = None
    for c in counts:
        b = buckets[str(c)]
        if b["posMed"] <= 0.20 and b["cumPosMed"] <= 0.20:
            threshold = c
            break
```

**The ≤ 0.20 line is `gate1b_v3.py:266`**, and it is applied twice in one `and`: the bucket's own
median and the cumulative (at-or-above) median. The rule as the script records it, `gate1b_v3.py:283-288`:

```python
        "rule": "smallest present-field count whose own bucket median positional <= 0.20 and whose "
                "cumulative set (pages at or above it) also keeps median <= 0.20",
        "cumulativeOnlyThreshold": next(
            (c for c in counts if buckets[str(c)]["cumPosMed"] <= 0.20), None
        ),
```

**The lexical line is not a selection criterion.** Lexical overlap is measured and reported —
`"cumulativeLexicalMedian": buckets[str(threshold)]["cumLexMed"]` (`gate1b_v3.py:282`) and
`"lexicalAbove_0_40": int((lex > 0.40).sum())` (`gate1b_v3.py:297`) — but no `if` compares it to
0.40 anywhere in the selection. The 0.40 target appears only in the report prose,
`gate1b_v3.py:814`: `cumulative lexical {thr['cumulativeLexicalMedian']:.3f} (target 0.40)`. The
verdict block that the summary carries (`gate1b_v4.py:709-715`) likewise reports lexical without
testing it:

```python
        "verdict": {
            "clears_0_20": thr["threshold"] is not None,
            "threshold": thr["threshold"],
            "indexed": thr["indexed"],
            "boundaryBucketPositionalMedian": thr["boundaryBucketPositionalMedian"],
            "cumulativeLexicalMedian": thr["cumulativeLexicalMedian"],
        },
```

`gate1b_v4.py` is the same rule verbatim (`v4:269`, `v4:286-289`) with one addition at `v4:292`,
`# Both readings, side by side, and the two counts the deploy procedure names.`, which is what
produces the `readings` block of `threshold-v4.json`.

**Deploy procedure that chose 11** — `data/corpus-20k/deploy/threshold.json`, verbatim:

```json
{
  "threshold": 11,
  "indexedCount": 636,
  "basis": "Gate 2 recheck (data/corpus-20k/gate2/summary-v2.json, 2026-09-05). The deploy procedure fixed in Phase 2d: index at 7 only if the threshold-7 set clears a size-matched cumulative positional nearest-neighbour median of 0.20 and an all-pairs median of 0.30. Measured on the rendered HTML of all 2,249 threshold-7 pages: size-matched 0.202454 (fails <= 0.20), all-pairs 0.256167 (passes <= 0.30), and the all-pairs lexical median 0.453177 is also above R3’s 0.40. The 636 pages at threshold 11 measure 0.188161 size-matched, 0.195831 all pairs, 0.368746 lexical. Indexing therefore deploys at 11; present-field counts 7 to 10 are the promotion criterion, to be re-measured as those pages gain fields."
}
```

The loader reads a threshold from `state.json`, not from this file —
`materialise.ts:1314-1334`, `indexableThreshold`:

```ts
async function indexableThreshold(
  override: string | undefined,
  counters: Counters,
): Promise<number> {
  if (override !== undefined) return Number(override)
  try {
    const state = JSON.parse(await readFile(join(DATA, 'state.json'), 'utf8')) as {
      gates?: Record<string, { figures?: Record<string, unknown> }>
    }
    const figures = state.gates?.['gate-1b']?.figures
    /* The gate records the present-field count as `threshold`; `indexableThreshold` is accepted
     * too, because a later gate entry may name it that way. Reading only the second name meant a
     * load silently fell back to the R15 stub floor of 3 with Gate 1b's own figure sitting in
     * state.json. */
    const recorded = figures?.indexableThreshold ?? figures?.threshold
    if (typeof recorded === 'number') return recorded
  } catch {
    /* state.json is optional here; the default below is used and reported. */
  }
  counters.bump('Gate 1b recorded no indexable threshold; the R15 stub floor of 3 was used')
  return 3
}
```

Called once per load at `materialise.ts:1104` and echoed at 1105.

### Gate 2 — the scripts and the verdict fields
Gate 2 is four Python scripts plus one Playwright file under `scripts/corpus-20k/gate2/`, with no
single script that emits the verdict:

| Script | What it decides or measures |
| --- | --- |
| `scripts/corpus-20k/gate2/fetch.py` | fetches `<base>/d/<slug>` for a TSV slug list; writes visible text, status code, HTML byte count; every request logged (legal gate) |
| `scripts/corpus-20k/gate2/extract.py` | the single visible-text extractor for both localhost and live: `text` (reading column, chrome excluded), `proseText` (markup rows removed), `fullText` (text-to-HTML numerator) |
| `scripts/corpus-20k/gate2/folds.py` | size-matched folds; reuses `gate1b_v3.fold_membership`, the same shingles and the same exhaustive scorer, fold size 324 |
| `scripts/corpus-20k/gate2/html-audit.py` | crawl text-to-HTML, RSC payload bytes, empty elements, the nine filler phrases its docstring lists (two of them are words Operating Rule 2 keeps out of this file), `data-block` order for the suppression check |
| `scripts/corpus-20k/gate2/browser-checks.ts` | the browser journey: 320 px overflow, frozen home search bar, keyboard and interface checks |

The verdict lives in the artefact, `data/corpus-20k/gate2/summary-v2.json`, whose top-level fields
are: `gate`, `run`, `date`, `stage`, `method`, `load`, `indexable`, `thresholdDecision`, `threshold7`,
`threshold11`, `questions`, `samples`, `suppression`, `interface`, `frozenHomeSearchBar`, `files`.
There is **no** `verdict` key (it reads `null`). The decision field is `thresholdDecision`, verbatim:

```json
 "thresholdDecision": {
  "statement": "deploy indexing at 7 if the threshold-7 size-matched cumulative positional median <= 0.20 AND its all-pairs positional median <= 0.30; otherwise 11, with 7-10 as the promotion criterion",
  "sizeMatchedAt7": 0.202454,
  "sizeMatchedAt7Passes": false,
  "allPairsAt7": 0.256167,
  "allPairsAt7Passes": true,
  "chosen": 11,
  "indexedCount": 636
 }
```

and the count reconciliation, same file, `indexable`:

```json
 "indexable": {
  "thresholdUsedForTheLoad": 7,
  "at7": 2249,
  "at11": 636,
  "gate1bV4At7": 2249,
  "gate1bV4At11": 636,
  "note": "the loader present-field count now agrees exactly with Gate 1b v4 at both thresholds (2,249 and 636); the first Gate 2 run disagreed by 117 pages at threshold 11."
 }
```

---

## 4. How 11 was derived by measurement — the exact chain

Four steps, each with the code and the number.

**Step 1 — the rule proposed 11 on the v3 render.** `gate1b_v3.py:263-268` (quoted in §3) run over
`data/corpus-20k/gate1b/page-meta-v3.json` produced `data/corpus-20k/gate1b/threshold-v3.json`:

```json
{
 "threshold": 11,
 "indexed": 638,
 "belowByTier": {"1": 870, "2": 4375},
 "aboveByTier": {"1": 617, "2": 21},
 "boundaryBucketPositionalMedian": 0.180851,
 "cumulativePositionalMedian": 0.1729795,
 "cumulativeLexicalMedian": 0.302752,
 "rule": "smallest present-field count whose own bucket median positional <= 0.20 and whose cumulative set (pages at or above it) also keeps median <= 0.20",
 "cumulativeOnlyThreshold": 7
}
```

Both readings existed from the start: the strict rule said 11, `cumulativeOnlyThreshold` said 7.

**Step 2 — the v4 re-render moved the rule's own answer to 10.**
`data/corpus-20k/gate1b/threshold-v4.json` → `"threshold": 10, "indexed": 1057`,
`boundaryBucketPositionalMedian` 0.1875, `cumulativePositionalMedian` 0.173913,
`cumulativeLexicalMedian` 0.325874, `cumulativeOnlyThreshold` 7. Its `readings` block then records
the two candidates the deploy procedure names, measured on the same render:

```json
  "at7":  {"threshold": 7,  "indexed": 2249, "bucketPositionalMedian": 0.25641,  "cumulativePositionalMedian": 0.191489, "cumulativeLexicalMedian": 0.36919,  "aboveByTier": {"1": 993, "2": 1256}},
  "at11": {"threshold": 11, "indexed": 636,  "bucketPositionalMedian": 0.172028, "cumulativePositionalMedian": 0.1583955,"cumulativeLexicalMedian": 0.299268, "aboveByTier": {"1": 610, "2": 26}}
```

So 11 was never re-derived by the rule at v4 — the rule said 10. 11 survived as the v3 answer and was
carried into the deploy procedure as the fallback candidate.

**Step 3 — Gate 2 measured both candidates through rendered HTML and applied the two-line procedure.**
`data/corpus-20k/gate2/summary-v2.json` → `thresholdDecision` (quoted in §3). Threshold 7 fails the
size-matched line by 0.002454 (0.202454 against ≤ 0.20) and passes the all-pairs line
(0.256167 ≤ 0.30); the `and` therefore fails and the procedure falls to 11. Supporting numbers from
the same file: `threshold7.sizeMatchedCumulative` positional median 0.202454, p90 0.277586,
lexical median 0.40285, folds `[324×7]`; `threshold7.allPairs` positional median 0.256167, p90
0.678161, lexical median 0.453177, exhaustive; `threshold11.sizeMatchedCumulative` positional median
0.188161, p90 0.333633, lexical median 0.352953, folds `[324, 324]`; `threshold11.allPairs`
positional median 0.195831, p90 0.576669, `positionalAbove_0_20` 277, lexical median 0.368746.

**Step 4 — the decision was written to `data/corpus-20k/deploy/threshold.json`** (quoted in §3) and
reaches the loader only through `data/corpus-20k/state.json` → `gates["gate-1b"].figures.threshold`,
read by `indexableThreshold` (`materialise.ts:1314`).

In one sentence: 11 is the `gate1b_v3` bucket-plus-cumulative rule's answer on the v3 render, kept as
the fallback branch of a two-line deploy procedure that 7 missed by 0.002454 on the size-matched
positional median measured through Gate 2's rendered HTML.

### The ceiling that the 11 collides with

Counted from `data/corpus-20k/gate1b/page-meta-v4.json`, `presentFields` by tier — the histogram, not
a claim:

| Tier | Pages | Max `presentFields` observed | ≥ 11 |
| --- | ---: | ---: | ---: |
| 1 | 1,719 | 16 | 610 |
| 2 | 4,477 | **11** | 26 |
| 3 | 22,636 | **7** | 0 |

Tier 2 histogram: `{0:204, 1:869, 2:769, 3:499, 4:339, 5:284, 6:257, 7:257, 8:292, 9:369, 10:312, 11:26}`.
Tier 3 histogram: `{1:11145, 2:6025, 3:2039, 4:1031, 5:742, 6:902, 7:752}`.

The maxima are exactly the model sizes after `liftTopLevelFields`: CLINICAL 9 + `doseStudied` +
`approvalDate` = 11; LONGEVITY 15 + `doseStudied` = 16; DEVELOPMENT 8 with `patentStatus`
not-applicable corpus-wide = 7. A Tier 2 page therefore clears an 11-field threshold only by holding
**every one of its 11 possible fields**, and a Tier 3 page can never clear it at all — which is what
`materialise.ts:1455` encodes as a single corpus-wide `presentFieldCount >= threshold`. The FINAL
REPORT states the Tier 3 half of this ("a DEVELOPMENT page cannot reach 11 on an 8-field model …
the ceiling is 7", `docs/worklogs/corpus-20k.md:554`); the Tier 2 half — that 11 is CLINICAL's exact
ceiling, so the pass rate is 26 of 4,477 by arithmetic — is not stated anywhere in the log.

---

## 5. `indexable`: written by the loader, read by the sitemap and the robots tag

**Written** — `materialise.ts:1455`, one expression:

```ts
    const indexable = tier <= 2 && pageType !== 'stub' && presentFieldCount >= threshold
```

carried into the row at `materialise.ts:1523`, into the insert column list at 1746 and the value at
1776, and re-asserted on conflict at 1805 (`"indexable" = EXCLUDED."indexable"`). The column is
declared at `db/schema.ts:4698-4707`, whose doc comment states the same rule:

```ts
    /** tier in (1,2) and page_type <> 'stub' and present_field_count >= the Gate 1b threshold. */
```

and `docs/specs/corpus-schema.md:40`:

> `indexable` = tier ∈ {1,2} AND present_field_count ≥ Gate 1b threshold AND page_type ≠ stub.

**Read by the sitemap** — `lib/corpus/sitemap.ts:8-16` states the contract:

```
 *  - A corpus record is listed only where `corpus_pages.indexable` is true, which the load sets to
 *    false for every Tier 3 record and for anything under the Gate 1b present-field threshold. A
 *    Tier 3 page carries `noindex, follow` and is reachable through browse, so it is never
 *    robots-disallowed and never in a sitemap.
 *  - Where a corpus record exists for a slug, that record decides the URL's eligibility. The legacy
 *    publication report is consulted only for slugs the corpus has not loaded, so a slug can never
 *    be advertised by one source while the other withholds it.
```

and enforces it at `lib/corpus/sitemap.ts:58-66`:

```ts
/** Indexed corpus records of one deployment tier. Tier 3 is never a child name, so never listed. */
export async function tierSitemapEntries(tier: 1 | 2): Promise<SitemapEntry[]> {
  const records = await loadCorpusFacetRecords()
  return records
    .filter((record) => record.indexable && record.tier === tier)
```

with the same flag deciding which sitemap children are announced at `lib/corpus/sitemap.ts:182-183`:

```ts
  if (records.some((record) => record.indexable && record.tier === 1)) populated.push('tier-1')
  if (records.some((record) => record.indexable && record.tier === 2)) populated.push('tier-2')
```

and consulted again at line 148 for the legacy-slug precedence.

**Read by the robots metadata** — `app/d/[slug]/page.tsx:85`:

```ts
      robots: pageRobotsMetadata({ index: corpus.indexable, follow: true }),
```

`follow` is unconditionally true, so a below-threshold or Tier 3 page is `noindex, follow` and stays
crawlable, matching R6. The other four `pageRobotsMetadata` calls in that file (lines 99, 112, 123,
144) are the non-corpus branches and pass `index: false` or a legacy `mayIndex`.

The reading path from the database is `loadCorpusFacetRecords` in `lib/corpus/facets.ts` (column at
line 229, selected at 466, mapped at 543) and `lib/corpus/search.ts` (line 40, 66, 85, 103), which
orders search results by `present_field_count desc` (`search.ts:91`).

---

## 6. Issues this orientation surfaced, for Phase 1

1. **The threshold is a single corpus-wide integer compared against three models of different size.**
   `materialise.ts:1455` compares `presentFieldCount >= threshold` with no tier or model term. With
   threshold 11 the CLINICAL ceiling is 11 and the DEVELOPMENT ceiling is 7, so Tier 2 must be
   perfect and Tier 3 is excluded by arithmetic rather than by evidence. Measured maxima in §4.
2. **Two different quantities are both called the present-field count.** `coverage.py:12-16`
   deliberately excludes `doseStudied` and `approvalDate`; `materialise.ts:535-550` deliberately
   includes them, because Gate 1b's page-text model included them. Gate 1's median-of-15 and
   Gate 1b's threshold-of-11 are therefore not measured on the same scale, and no code asserts the
   relationship.
3. **The lexical line is reported but never tested.** No comparison against 0.40 exists in
   `gate1b_v3.py` or `gate1b_v4.py` selection; only `lexicalAbove_0_40` (`v3:297`) and report prose
   (`v3:814`). The 0.353 / 0.453 lexical figures that decided the deploy sit in
   `deploy/threshold.json` prose and in `gate2/summary-v2.json` numbers, not in an executed rule.
4. **11 is not the current rule's answer.** `gate1b_v4.py` on the v4 render selects **10**
   (`threshold-v4.json`); 11 is the v3 answer carried forward as the deploy procedure's fallback.
   Re-running the same rule unchanged in Phase 1.3 will not reproduce 11.
5. **Gate 2 has no verdict-emitting script.** `summary-v2.json` carries `thresholdDecision` but the
   `verdict` key is `null`, and `grep` finds no source for `thresholdDecision` or `sizeMatchedAt7`
   outside the artefact itself — the four Gate 2 scripts each write a part and the decision was
   assembled by the operator. Any Phase 1 re-evaluation of Gate 2 must write that assembly as code.
6. **Gate 1's comparison ignores applicability.** `coverage.py:286-291` compares
   `medianPresentFields` (raw, out of 15) to 8, while `medianCoverageOfApplicable`
   (`coverage.py:170`) is computed in the same function and unused by the gate. `docs/specs/field-models.md`
   ("Coverage report format (Gate 1)") states the gate as "median is ≥ 8 of 15", so the code matches
   the spec — the spec is what Phase 1.2 has to change.
7. **`indexableThreshold` silently falls back to 3.** `materialise.ts:1314-1334` returns the R15 stub
   floor when `state.json` holds no Gate 1b figure, bumping a counter rather than failing. The
   comment records that this already happened once. A load against a fresh `state.json` would publish
   a very different sitemap without an error.
8. **The rendered duplicate check required by `docs/specs/identity-resolution.md` §5.3 never ran**
   (FINAL REPORT, `docs/worklogs/corpus-20k.md`: "**the §5.3 rendered-overlap check never ran** and is
   deferred"), so the 697 suspected missed merges rest on structural and nominal tests only. Any
   overlap figure the revamp reports inherits that gap until §5.3 executes.
9. **`FIELD_IDS` (`derive.ts:207`) and `MODELS` (`coverage.py:33`) use different spellings for the
   same fields** (`hallmark`/`hallmarks`, `endpointType`/`endpointTypes`, `clocks`/`epigeneticClocks`,
   `pathway`/`pathways`, `regulatory`/`regulatoryStatus`, `faers`/`faersSignal`, `target`/`molecularTarget`,
   `whyStopped`/`whyDevelopmentStopped`, `relatedOnTarget`/`relatedCompounds`) with no mapping table
   in either file. Nothing checks that the two lists stay in step.
