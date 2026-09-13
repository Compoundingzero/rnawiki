# Trial results — operating brief

Everything a fresh session needs to resume this work without reading anything else. Figures come
from `full-corpus-completion.md` (FCC), `search-indexing-investigation.md` (SII),
`page-overlap-diagnosis.md` (POD) and `trial-data-and-empty-records.md` (TDE) on `main`, plus
`full-corpus-completion.json`. Where those disagree, or a figure is usually restated with a
qualifier the source lacks, it is recorded in **Discrepancies** rather than smoothed over — read
that section before quoting any number here.

---

## 1. Baselines to compare against later

Measured 2026-09-03 (POD) on a fixed 324-record sample, stratified by evidence depth and drawn
proportionally across entity classes, fetched from the live site; all 52,326 page pairs computed
exhaustively. Re-measure the same way or the comparison is meaningless.

**Nearest-neighbour overlap: 0.877.** POD does *not* call this a median — see Discrepancies.

Overlap decomposed. The third column is the control that matters — the same number of tokens per
page deleted at random rather than by targeting shared text:

| Measure                         |   Raw | Shared text removed | Same volume removed at random |
| ------------------------------- | ----: | ------------------: | ----------------------------: |
| Lexical, shared vocabulary      | 0.651 |               0.400 |                         0.444 |
| Positional, five-word sequences | 0.645 |               0.266 |                         0.116 |
| Semantic, embedding cosine      | 0.948 |               0.892 |                         0.930 |

These three *are* medians over all 52,326 pairs. Read them correctly: only lexical and semantic fall
*below* their controls, by 0.044 and 0.038 — a real but modest effect. Positional overlap appears to
collapse, but a random cut of the same size drops it further (0.116), so that collapse is mostly the
cost of deleting half the page, not evidence about what was deleted. At sentence granularity,
targeted removal reaches 0.438 where a random cut reaches 0.258. An out-of-domain English page
scores 0.737 cosine here, so 0.948 is genuinely close.

**Corpus counts:** 9,852 canonical records (9,859 raw `drugs` rows = 9,852 + 5 duplicate redirects +
2 justified gone); 6,752 empty after the extractor fix; 3,569 carrying a "Registered clinical
trials" section.

**Sitemap: 10,027 URLs** — 9,852 dossiers, 164 later browse pages, 11 other routes (SII, verified
live after deployment `5e276644`).

**The measured ceiling.** Deleting every sentence shared by at least half the corpus, plus every
within-page repetition, removes 49.1% of a page and moves nearest-neighbour overlap from 0.877 to
0.761. A 5% threshold reaches 0.647 and no further. Below 0.35 is reachable corpus-wide (0.269) but
not for the thin half without inventing content. A median page carries 5,138 visible words, 46.8% of
which appear on more than 90% of pages.

---

## 2. Trial data: what is actually stored

The stored ClinicalTrials.gov snapshot (2026-09-01) holds **601,158 studies**. The exact-name pass
**matched 148,733 study rows** across 3,569 records — join output, not a stored-row count — which is
**101,831 distinct studies** once a study matched to several records is counted once. Four numbers get
called "trial rows" here; see Discrepancies.

| Distinct **matched** studies    |  Count | Share of 101,831 |
| ------------------------------- | -----: | ---------------: |
| Results posted on the registry  | 30,556 |            30.0% |
| Completed, no results posted    | 39,496 |            38.8% |
| Ongoing                         | 12,847 |            12.6% |
| Stopped, withdrawn or suspended | 13,470 |            13.2% |
| Status unknown                  | 10,754 |            10.6% |

**The stored snapshot holds registration facts only.** `hasResults` is a flag, not a result. The
stored fields are title, status, phase, dates, enrollment, sponsor, conditions, eligibility, primary
outcome measure and time frame, design, and whether results were posted and when. **No effect sizes.
No comparator arms. No adverse-event tables.** That is what the fetch requested, so it holds for
every trial.

**Reach if results were fetched:** 2,431 records have at least one results-posted study; 1,767 have
three or more; 1,138 matched studies but none with results; 6,283 matched nothing. At most 24.7% of
the corpus.

What shipped instead is the registration record: a "Registered clinical trials" section on 3,569
records, median +1,312 words each, ranked results-posted first then completed, capped at eight with
the remainder counted. Registered titles and sponsor stopping reasons are deliberately **not
rendered** — they routinely contain "efficacy" and "lack of efficacy", which would put a
characterisation of a result on the page. Both stay in the API record and the stored row.

---

## 3. The editorial constraint

**This project publishes medical interpretation only through reviewed publication.** Every design
decision here passes that gate.

**Permits:** transcribing stated outcome values; printing the registration record as structured
registry facts in ordinary language; quoting the primary outcome measure exactly as registered.

**Forbids:** writing efficacy narrative. A sentence saying what a trial showed against its
comparator is medical interpretation and cannot be generated. This is why the original Phase 4 was
never available, and why registered titles and sponsor stopping reasons stay off the page.

The page framing already says once, honestly: registration says nothing about whether the medicine
worked; results where posted live on the registry, not here; absence from an exact-name pass is not
evidence that no study exists. Keep that framing if the surface changes.

---

## 4. Build and deploy order — the gotcha that cost three deployments

`agents:import` refuses a deploy when production's recorded background disagrees with the checked
agent package. The package's per-record digests come from `data/recorded-background.ndjson`, which
**`agents:run` reads rather than writes** — `export:dataset` writes it. Changing the extractor
invalidates that file, and rebuilding the agent package alone does not fix it. **Three deployments
failed identically**, each reporting the same 733 subjects and stale corpus digest, while
`agents:import:check` passed locally because `--check` never opens the transaction performing the
comparison. The manifest digest is checked against the **committed** corpus as well as the working
tree, so the export must be committed before the package is attached.

The order that works:

```bash
npm run apply:background                        # 1. apply the background first
npm run export:dataset -- --output-dir data     # 2. republish the export (writes recorded-background.ndjson)
git add data && git commit -m "Publish corpus"  # 3. COMMIT it — the digest checks the committed corpus
npm run agents:run                              # 4. the agent package now reads a current file
npm run attach:agent-datasets                   # 5. attach to the manifest
```

Production data steps, all over certificate-verified TLS (FCC), in this order:

```bash
npm run apply:background          # curated-gap modules; only recorded_background
npm run inventory:apply           # inventory_resolutions and the MERGED ledger rows
npm run completion:match-trials   # needs the local snapshot
npm run completion:pubmed:import  # same
npm run completion:run            # then completion:check must report 0 changed
npm run semantic:project          # optional
```

Then discovery, once the deployment serves the new sitemap:

```bash
npx tsx scripts/discovery/submit-indexnow.ts                 # dry run: counts only
npx tsx scripts/discovery/submit-indexnow.ts --submit --json
npx tsx scripts/discovery/monitor-discovery.ts --origin https://rnawiki.com --resume
npm run audit:search -- --origin https://rnawiki.com --orphan-audit --max-depth 20 --max-urls 8000
```

Verify before pushing by comparing package digests against production directly — the last clean run
compared all 9,855 and found 0 mismatched.

---

## 5. Known defects

**Monitor holds every result in memory.** `scripts/discovery/monitor-discovery.ts` keeps every
result in memory. The first pass aborted with a JavaScript heap exhaustion after 4,352 of 9,852
records and was **resumed from its checkpoint with a 6 GB heap** — what finished that partial
resume; no source states it as a requirement, and no heap flag appears in the recorded resume
command. Fix: stream results to the checkpoint file.

**429 under the monitor's default burst.** The site's API rate limiter answered HTTP 429 to 1,130 of
the 9,852 machine-record checks **during the monitor's default request pace** — the client tool's
default, not the limiter's configuration. Those rows were re-checked at two concurrent requests with
a 400 ms delay, the last 31 one at a time with a two-second delay; every one answered 200.

**The header line under each medicine name does not follow the entity class.** Rule 5 reclassified
**284 records** out of a class they did not belong in; the stored entity class, meta description and
completion assessment all updated correctly. The page header did not: it still reads e.g. "Small
chemical medicine. Approved in the United States (FDA)" because that line is built from
`drugs.modality` and `drugs.approval_status` — ingest facts, and *literally true*, since openFDA does
carry an OTC label naming the substance as an active ingredient. The problem is placement: as the
first line under the name it tells a reader a cosmetic humectant is an approved medicine.
**The worklog attaches no record count to this defect** — 284 counts reclassifications, not
misleading headers.

---

## 6. Open decisions — Felix's, not the session's

1. **Suppressing the 6,752 empty records.** Not proposed for removal: they are honest,
   correctly-stated records of what is and is not recorded. But they will not be indexed however the
   page is arranged, and the alternative is to stop them competing for crawl budget with records
   that can win — partly reversing the 2 September change that made every record eligible.
2. **The cross-surface label wording change.** Making the header follow the entity class is a copy
   change across the dossier header, home page, search result and site header — and a product
   decision about how to describe a substance that genuinely holds an FDA label of that kind.
3. **Deleting the Railway generated domain.** `doswiki-production.up.railway.app` serves the whole
   site from the same container, bypassing Cloudflare. `app/robots.ts` now compares the request's
   `Host` header and serves `Disallow: /` to any other hostname, failing closed — but that stops
   well-behaved crawlers only; the domain still answers requests directly. Removing it in the
   dashboard is the owner's action.

Also parked: `Disallow: /api/` blocks the machine-readable representation from answer engines
`robots.txt` welcomes; and every HTML response is uncacheable (`private, no-cache, no-store`, no
`ETag`/`Last-Modified`) — the likeliest next crawl constraint.

---

## Discrepancies

Found by auditing each figure against the worklogs. Several are restatements carrying a qualifier
the source does not.

- **0.877 is not labelled a median.** It appears exactly once (POD, "The measured ceiling") as the
  untrimmed baseline of "nearest-neighbour overlap". POD labels its medians explicitly everywhere
  else, so the omission is meaningful. Nearest-neighbour overlap is a per-page *maximum*, so
  aggregating it needs a step POD never states; and its population may be narrower than corpus-wide
  (post-trim it reaches 0.647 "and no further", where the corpus-wide figure is 0.269). POD
  withdraws a neighbouring figure for exactly this error: "The earlier 83.7% figure was
  directionally right and mis-scoped." Use 0.877 as the trim baseline, not as a corpus median.
- **148,733 is matched study rows, not stored trial rows** — and two worklogs conflict. FCC reports
  the *same* `completion:match-trials` over the *same* 3,569 entities as matching **224,946
  registrations**. Unreconciled. Separately, "trial rows" is already taken: FCC's census reads
  "Records with legacy trial rows | 6,515 (31,232 trial rows)". Stored = 601,158 studies. POD's
  "148,733 stored studies" is the loose rendering; TDE's is the precise one.
- **284 belongs to the reclassification, not the header defect.** The entity class updated
  correctly; the broken line is a separate modality-plus-approval-status line. No source counts the
  records showing a misleading header, and the worklog calls that line "literally true".
- **6 GB is an observation, not a requirement.** It resumed ~5,500 remaining records from a
  checkpoint; a full single pass at 6 GB was never run.
- **"Default burst" is the monitor's, not the limiter's.** No rate-limiter threshold, window or
  burst parameter is recorded anywhere.
- **Empty-record count.** POD says 6,792 (68.9%) store no recorded use, mechanism, safety, adverse
  reaction, pharmacokinetic or population statement. TDE says 6,760 before the extractor fix and
  6,752 after (only 8 stopped being empty). Both dated 2026-09-03. 6,752/6,760 reconciles; the
  32-record gap to 6,792 does not, and may be a different section set. **6,752 is used here.**
- **Sitemap.** FCC records 9,863 URLs at the 2026-09-02 deployment; SII records 10,027 once the 164
  browse pages joined. Superseded, not contradictory. **10,027 is current.**
- Confirmed verbatim: the three measures and their controls, 9,852, 3,569, 30,556 (of matched
  studies), 2,431, the registration-facts-only limit, the export-before-attach ordering, the three
  failures.
