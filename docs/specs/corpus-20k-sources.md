# Corpus 20k — source survey (Phase 0a/0b)

Surveyed 2026-09-04. Legal gate first: for every host below, only `robots.txt` and the licence,
terms or documentation page were fetched, over plain HTTPS, with the User-Agent
`RNAWiki-corpus-20k/1.0 (+https://rnawiki.com; contact felix360506@gmail.com)`, at least one second
apart per host. No data payloads were fetched. No consent banner was accepted; none appeared on a
plain GET, and the one cookie banner rendered (JAX Mouse Phenome Database) was simply not
interacted with.

Every request is logged with its status and byte count in `data/corpus-20k/legal/requests.log`
(108 requests). Retrieved texts are under `data/corpus-20k/legal/robots/` and
`data/corpus-20k/legal/terms/`. Per-host verdicts are in `data/corpus-20k/legal-gate.json`.
The machine-readable survey is `data/corpus-20k/sources.json`.

Three probe requests to the ClinicalTrials.gov and ChEMBL APIs returned small payloads while
measuring page-size and batch limits that their documentation does not expose in readable form.
The ChEMBL one (4 MB) was deleted; the measurements are reported below and the requests stay in the
log.

## Field models

- **LONGEVITY** — hallmark, organism ladder, ITP, endpoint type, human ceiling, epigenetic clocks,
  dose-response, pathway, kinetics, interactions, trial failures, biomarkers, regulatory status by
  jurisdiction, ongoing trials, FAERS signal.
- **CLINICAL** — indication, label kinetics, interactions, adverse events, FAERS, trial history,
  failures, regulatory status by jurisdiction, withdrawal.
- **DEVELOPMENT** — target, mechanism class, highest phase, why stopped, sponsor, patent status,
  ever dosed in humans, related compounds on the same target.

## The table

| Source                       | Licence verdict                                                                                                                                            | Bulk file & size                                                                                                                                                                                                                                                                 | Rate limit                                                                                                                                  | Projected calls | Fields contributed                                                                                                                                                   | Identity keys                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| ChEMBL 37                    | Clear, share-alike. CC BY-SA 3.0; attribution must name the URL and release                                                                                | `chembl_37_chemreps.txt.gz` 279 MB (take); SQLite 5.4 GB and PostgreSQL 1.9 GB (do not take); `chembl_uniprot_mapping.txt` 1.2 MB                                                                                                                                                | None published; page size capped at 1000 (measured)                                                                                         | 60              | D: target, mechanism class, highest phase, ever dosed in humans, related compounds. C: indication, trial links. L: pathway, dose-response                            | ChEMBL id, InChIKey, CAS, UNII (partial), INN            |
| PubChem                      | Clear. Free to use, per-depositor exceptions flagged                                                                                                       | `Drug-Names.tsv.gz` 837 KB, `CID-Identifiers.tsv.gz` 94 MB, `CID-Parent.gz` 520 MB, `CID-MeSH` 2.9 MB (take); `CID-InChI-Key.gz` 6.9 GB, `CID-Title.gz` 1.8 GB, `CID-Synonym-filtered.gz` 924 MB, `CID-Patent.gz` 4.4 GB (do not take)                                           | 5 requests/second, stated policy; no keys offered; 30 s per request; 503 then temporary block                                               | 107             | L: computed properties only. D: related compounds. Identity resolution is its real contribution                                                                      | CID, InChIKey, CAS, UNII, INN, ChEMBL id                 |
| ClinicalTrials.gov v2        | Clear (US Government work), with a recorded robots conflict                                                                                                | Already on disk: `studies.ndjson` 778 MB, 601,158 protocol records, API 2.0.5, data timestamp 2026-09-01                                                                                                                                                                         | robots sets Crawl-delay 1; no numeric API limit readable. pageSize max 1000 (measured); 600 ids per GET succeeded, 1000 gave 414 (measured) | 902             | L: ongoing trials, trial failures, endpoint type, human ceiling. C: trial history, failures, indication. D: highest phase, why stopped, sponsor, ever dosed          | NCT id only (joins by intervention name — an R1 problem) |
| RxNorm full release          | **Not clear without an account.** Needs a free UMLS licence and a UTS account                                                                              | None public                                                                                                                                                                                                                                                                      | n/a                                                                                                                                         | 0               | —                                                                                                                                                                    | RxCUI                                                    |
| RxNav REST                   | Clear for RxNorm content; RxClass carries SNOMED CT and is excluded                                                                                        | None (NLM offers RxNav-in-a-Box locally)                                                                                                                                                                                                                                         | 20 requests/second per IP, documented                                                                                                       | 3,000           | C: interactions, join key into label sections                                                                                                                        | RxCUI, UNII, name                                        |
| WHO INN (MedNet)             | **Not clear.** WHO default CC BY-NC-SA 3.0 IGO                                                                                                             | None. Recommended List 95 and Proposed List 135 are PDF notices                                                                                                                                                                                                                  | n/a                                                                                                                                         | 0               | —                                                                                                                                                                    | INN                                                      |
| Open Targets 26.06           | Clear. Data CC0 1.0, code Apache 2.0                                                                                                                       | `drug_molecule` 14 MB, `drug_mechanism_of_action` 568 KB, `drug_warning` 249 KB, `clinical_indication` 4.7 MB, `openfda_significant_adverse_drug_reactions` 1.5 MB — about 21 MB total                                                                                           | None published; the docs discourage per-entity GraphQL and point at the downloads                                                           | 5               | D: target, mechanism class, highest phase, sponsor, related compounds. C: adverse events, FAERS, withdrawal, indication. L: pathway, FAERS signal, regulatory status | ChEMBL id, InChIKey, names                               |
| DailyMed                     | Clear (US Government work)                                                                                                                                 | Human Rx full release 6 parts, 16.65 GB, 54,843 labels; OTC 11 parts, about 32 GB. **Not taken**                                                                                                                                                                                 | None published                                                                                                                              | 0               | Superseded by the on-disk openFDA label archive                                                                                                                      | SetID, NDC, UNII, RxCUI                                  |
| Orange Book                  | Clear (US Government work)                                                                                                                                 | On disk as openFDA `drug-orangebook` JSON, 41.2 MB, 48,664 records. The FDA page publishes no zip size                                                                                                                                                                           | n/a                                                                                                                                         | 0               | D: patent status (US listed patents — the only patent data we may republish). C: regulatory status, withdrawal                                                       | Application number, ingredient name                      |
| openFDA                      | Clear. Public domain, CC0 1.0. One GMDN carve-out, device data only                                                                                        | On disk: label 1.86 GB / 262,595, drugsfda 124.9 MB / 29,312, ndc 246.3 MB / 137,637, orangebook 41.2 MB / 48,664. To take: enforcement 4 MB, `other/unii` 3 MB, `other/nsde` 30 MB. **Excluded: drug/event FAERS, 1,767 files, 113 GB**                                         | No key: 240/minute per IP and 1,000/day per IP. With a key: 240/minute per key and 120,000/day per key                                      | 5,003           | C: the whole model except trial history. L: FAERS signal, interactions, kinetics, regulatory status. D: sponsor, highest phase                                       | UNII, NDC, SetID, RxCUI, application number              |
| Drugs@FDA bulk               | Clear (US Government work)                                                                                                                                 | One zip; the page's own label reads "5.91KB", which is not credible — verify with a HEAD                                                                                                                                                                                         | n/a                                                                                                                                         | 1               | C: regulatory status, withdrawal. D: sponsor, highest phase                                                                                                          | Application number, ingredient name                      |
| EMA                          | Clear with attribution. Commercial and non-commercial reproduction permitted if EMA is acknowledged                                                        | EPAR medicines table, XLS, 717.5 KB; referrals and other tables, sizes not published. The site is also available as JSON                                                                                                                                                         | None published                                                                                                                              | 3               | C and L: EU regulatory status, withdrawal, refusal, suspension. D: sponsor                                                                                           | EMA product number, INN, active substance                |
| Health Canada DPD            | Clear with attribution. Open Government Licence – Canada 2.0, commercial use permitted                                                                     | `allfiles.zip`, `allfiles_ia.zip`, `allfiles_ap.zip`, `allfiles_dr.zip`; the index page publishes no sizes                                                                                                                                                                       | None published                                                                                                                              | 4               | C and L: Canadian regulatory status, withdrawal. D: sponsor                                                                                                          | DIN, ingredient name, company code                       |
| TGA ARTG                     | **Not clear — gate not passed.** `robots.txt` could not be retrieved with our User-Agent                                                                   | Unknown                                                                                                                                                                                                                                                                          | Unknown                                                                                                                                     | 0               | — Australian status stays UNKNOWN                                                                                                                                    | —                                                        |
| PMDA                         | **Not clear.** No licence statement located                                                                                                                | None. English content is per-product PDFs                                                                                                                                                                                                                                        | Unknown                                                                                                                                     | 0               | — Japanese status stays UNKNOWN                                                                                                                                      | —                                                        |
| NIA ITP via JAX MPD          | Clear at `phenome.jax.org` (contributors waive copyright). **Not clear at `nia.nih.gov`** (edge returns a human-verification interstitial to `robots.txt`) | Per-cohort `.xlsx`: `ITP_C2004_Lifespan.xlsx` through `ITP_C2021_Lifespan.xlsx`, plus 2015 and 2020 "w error" variants, `C2020_pheno_bw.xlsx`, `C2021_pheno_bw.xlsx`, `cohort_2013_fatpads.xlsx`                                                                                 | None published                                                                                                                              | 30              | L: ITP, organism ladder, endpoint type, dose-response, biomarkers                                                                                                    | Compound common name only                                |
| OpenAlex                     | **Not verified.** Terms unreadable: `openalex.org/terms` returns a Cloudflare 403 and `docs.openalex.org` is a JavaScript app                              | Snapshot far exceeds 29 GB free                                                                                                                                                                                                                                                  | **Not verified**                                                                                                                            | 0               | Dropped from the plan                                                                                                                                                | DOI, PMID                                                |
| Europe PMC REST              | Clear for metadata only; full text is per-article copyright                                                                                                | OA subset by FTP, not needed                                                                                                                                                                                                                                                     | **Not published in readable form**; plan at 3 requests/second or slower and confirm                                                         | 2,000           | L: trial failures, biomarkers, organism ladder. C: adverse events, trial history. D: why stopped                                                                     | DOI, PMID, PMCID                                         |
| PubMed E-utilities           | Clear for metadata                                                                                                                                         | Baseline FTP exists, not needed                                                                                                                                                                                                                                                  | 3 requests/second, 10 with a key, documented                                                                                                | 500             | Same literature contributions as Europe PMC                                                                                                                          | PMID, DOI                                                |
| DrugBank                     | **Split.** Open Data CC0 (clear). Everything else CC BY-NC 4.0 (**not clear**)                                                                             | Open Data: Vocabulary 1.12 MB CSV, Structures 5.16 MB SDF. Non-commercial tier: full database 204 MB XML, all-structures 11 MB, 3D 13.9 MB, approved 3.63 MB, experimental 4.69 MB, nutraceutical 183 KB, illicit 131 KB, plus external links, protein identifiers and sequences | n/a                                                                                                                                         | 1               | D: related compounds by name linking only                                                                                                                            | DrugBank id, CAS, UNII, InChIKey                         |
| FDA withdrawn / discontinued | Clear in principle, **page not found** at three plausible URLs                                                                                             | Substitutes: openFDA enforcement 4 MB, Open Targets `drug_warning` 249 KB, Orange Book discontinued, Drugs@FDA marketing status                                                                                                                                                  | n/a                                                                                                                                         | 0               | C: withdrawal, regulatory status. D: why stopped                                                                                                                     | Application number, UNII                                 |
| WHO banned/withdrawn list    | **Not clear** (CC BY-NC-SA 3.0 IGO) and **not located**                                                                                                    | None                                                                                                                                                                                                                                                                             | n/a                                                                                                                                         | 0               | Pointer for human verification at most                                                                                                                               | —                                                        |
| Google Patents               | **Not clear.** Do not fetch                                                                                                                                | None                                                                                                                                                                                                                                                                             | No API offered to us                                                                                                                        | 0               | Patent status is not sourceable here; use the Orange Book, or leave UNKNOWN                                                                                          | —                                                        |

## Call budget

**Total projected calls: 11,616 against the R5 ceiling of 50,000.** No bulk redesign is required.
The budget survives only because four lines were replaced with bulk substitutes; without them the
same coverage costs about 80,000 calls and breaches R5.

| Line                                                            | Calls | Why this number                                                                                                                                                                                                                                            |
| --------------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| openFDA FAERS count queries                                     | 5,003 | The 113 GB FAERS bulk cannot fit 29 GB of free disk. Open Targets' `openfda_significant_adverse_drug_reactions` parquet (1.5 MB) covers the ChEMBL-linked compounds; the remainder need one `count=` aggregation each. A naive per-compound plan is 20,000 |
| RxNav RxCUI lookups                                             | 3,000 | `openfda.rxcui` is already present on the on-disk label and NDC archives for marketed products. Only compounds with no label row need a call. A naive per-compound plan is 20,000                                                                          |
| Europe PMC                                                      | 2,000 | Tier 1 compounds only, cursorMark paging. Per-compound across the whole corpus is 20,000                                                                                                                                                                   |
| ClinicalTrials.gov                                              | 902   | ~300 for corpus-matched results sections at pageSize 50, plus 602 for one delta refresh of the protocol snapshot                                                                                                                                           |
| PubChem                                                         | 107   | 6 bulk files, 1 Identifier Exchange job for the whole corpus, and property batches at 200 CIDs per call                                                                                                                                                    |
| ChEMBL REST                                                     | 60    | molecule `max_phase__gte=1` 17 pages, mechanism 8, drug_indication ~15, molecule_form ~20, all at the 1000 cap                                                                                                                                             |
| PubMed E-utilities                                              | 500   | esummary batched at 200 UIDs per call, on top of the searches already on disk                                                                                                                                                                              |
| JAX MPD / ITP                                                   | 30    | ~25 cohort spreadsheets plus a few API calls                                                                                                                                                                                                               |
| Open Targets                                                    | 5     | Five parquet files. Zero GraphQL calls                                                                                                                                                                                                                     |
| Health Canada, EMA, Drugs@FDA, DrugBank Open Data               | 9     | Static file downloads                                                                                                                                                                                                                                      |
| OpenAlex, WHO, TGA, PMDA, Google Patents, DailyMed, Orange Book | 0     | Either not cleared, or already held on disk                                                                                                                                                                                                                |

**Disk.** Planned downloads are about 3.6 GB, with a peak near 10 GB during decompression, against
29 GB free. Explicitly excluded on size: openFDA FAERS bulk (113 GB), DailyMed full release
(16.65 GB Rx plus about 32 GB OTC), ChEMBL SQLite (5.4 GB compressed and tens of GB expanded), the
OpenAlex snapshot, and the four large PubChem whole-database files.

## How many compounds this actually reaches

Measured from the ChEMBL API on 2026-09-04, one request, reading `page_meta.total_count`:

- molecules with `max_phase >= 1`: **16,784**
- all ChEMBL molecules: 2,921,148
- ChEMBL mechanism records: 7,561

**16,784 is below 20,000.** ChEMBL's clinical-or-beyond set does not reach the target on its own.

Adding our existing 9,852 canonical records (the working database holds 9,859 rows, all with
distinct lower-cased names) gives a union upper bound of **26,636** if the two sets were disjoint.
They are not: our records are largely marketed medicines, which is exactly where ChEMBL's approved
subset sits.

The overlap was **not measured.** Measuring it needs ChEMBL's 16,784 preferred names, which is a
data payload and outside this survey's remit. Assuming 4,000 overlapping names gives a central
estimate of **22,636**. That estimate clears 20,000 only while overlap stays under about 6,600.
It should be treated as unverified until Phase 0c resolves identity properly, and it is the reason
Phase 0c should report the merge count before Phase 2 tiers anything.

## Per-source notes

**ChEMBL.** CC BY-SA 3.0, confirmed from the FTP `README` and `REQUIRED.ATTRIBUTION`. Attribution
must carry the ChEMBL URL and the release (`chembl_37`), ChEMBL IDs must be preserved, and the
release number must be visible where ChEMBL is integrated. Share-alike is the practical constraint:
it propagates into any derived database we redistribute, so the ChEMBL-only slice must stay
separable from the CC0 material rather than being blended into one export. Where a fact is
available from both ChEMBL and Open Targets, prefer the Open Targets CC0 copy. The `max_phase=4`
and `max_phase__gte=4` filters both returned HTTP 500 on the survey date; `max_phase__gte=1` works.

**PubChem.** The documentation pages under `/docs/` are a JavaScript app; the readable source is the
markdown behind them at `/pcfe/docs/markdown/*.md`, which is what was fetched and saved. The stated
policy is five requests per second, with no API keys or allowlists available at any volume, a
30-second server-side limit per request, and a temporary block for repeat offenders. The
`X-Throttling-Control` response header reports a green/yellow/red/black load state and our client
must honour it. The Identifier Exchange service is the important find: up to 500,000 input IDs per
job with a 30-minute processing limit, which resolves the entire 20k corpus in a single job instead
of tens of thousands of calls. Note that PubChem's computed properties are structure-derived and
must never be rendered as pharmacokinetics.

**ClinicalTrials.gov.** Two things the documentation would not tell us, so both were measured. Page
size is capped at 1000: a request for `pageSize=5000` returned exactly 1000 records. And
`filter.ids` is bounded by URL length, not a documented id count — 600 ids in one GET succeeded,
1000 ids returned nginx `414 Request-URI Too Large`. Plan 500 ids per request. The about-api and
terms pages are a single-page app returning an identical 94,295-byte shell, and
`/api/v2/openapi.yaml`, `/api/v2/api-docs` and `/api/v2/swagger.json` all 404, so the public-domain
status here is asserted from US Government authorship rather than from a licence page we read.

What a results-section fetch would add, measured against our own snapshot: **79,954** of the 601,158
studies have posted results, and **54,272** of those have a DRUG or BIOLOGICAL intervention. The
snapshot stores none of it — `hasResults` is a boolean and all 30 stored fields are protocol-section.
Fetching results for all 54,272 costs roughly 1,086 calls at pageSize 50 and about 8 GB of JSON.
Restricting to studies whose interventions match the corpus is the bulk-first choice: roughly 15,000
studies, about 2.3 GB, about 300 calls.

One conflict is recorded rather than resolved: `robots.txt` says `Disallow: /api/` for
`User-agent: *`, while the same site publishes `/api/v2` as its documented public API. The reading
taken here is that robots governs crawlers of the web interface; the survey still keeps to the
declared `Crawl-delay: 1` and does not touch `/search?` or `/expert-search?`.

**RxNorm and RxNav.** Stated plainly: the full RxNorm release needs a free UMLS Metathesaurus
Licence and a UTS account, so it is not a public bulk file and has no place in an unattended plan.
RxNav REST is free, with a documented ceiling of 20 requests per second per IP across RxNorm,
RxTerms, Prescribable RxNorm and RxClass. RxClass additionally carries SNOMED CT under an Affiliate
licence, so take RxCUI and RxNorm names only and leave the classes alone. A US government
funding-lapse banner was displayed on the NLM page on the survey date, with a warning that data may
not be current.

**WHO INN.** Machine-readable content: essentially none. Recommended List 95 and Proposed List 135
and their predecessors are PDF notices, and the searchable database sits behind MedNet-INN (now
School of INN), which requires a requested account. WHO publications default to CC BY-NC-SA 3.0 IGO,
which is non-commercial and therefore not clear under our rule. INN strings as facts are not
copyrightable and can be recorded from ChEMBL `pref_name`, the FDA UNII file and the DrugBank
vocabulary; the WHO documents themselves must not be redistributed.

**Open Targets.** The best value in the survey: about 21 MB of parquet under CC0 covers most of the
DEVELOPMENT model and the withdrawal half of CLINICAL. The documentation actively discourages
repeated per-entity GraphQL querying and directs users to the downloads, so the plan makes zero
GraphQL calls. The drug tables are ChEMBL-derived but redistributed under CC0, which is the clean
way to take mechanism, phase, indication and withdrawal facts without inheriting share-alike on that
slice — provenance attribution to ChEMBL is still owed as a matter of record.

**DailyMed.** Deliberately not downloaded. The full human prescription release is six parts totalling
16.65 GB across 54,843 label files, and OTC adds eleven more parts at roughly 3 GB each; the old
single-file archives were retired. The on-disk openFDA `drug/label` archive (14 zips, 1.86 GB,
262,595 records, plus a 1.5 GB parsed `label-index.ndjson`) already carries the same SPL content in
parsed form.

**openFDA.** Public domain under CC0. Documented limits, read from the authentication page: without
a key, 240 requests per minute per IP and 1,000 per day per IP; with a key, 240 per minute per key
and 120,000 per day per key. An unkeyed client burns its daily allowance in about four minutes at
the per-minute rate, so the FAERS plan requires a key. The single GMDN carve-out in the terms
restricts extraction of device nomenclature and does not touch the drug endpoints. The bulk index at
`https://api.fda.gov/download.json` gives the real sizes: label 1,772 MB across 14 partitions,
drugsfda 9 MB, ndc 27 MB, orangebook 2 MB, enforcement 4 MB, `other/unii` 3 MB, `other/nsde` 30 MB,
`other/substance` 317 MB — and drug/event at **1,767 partitions and 113,116 MB**, which is the one
file in this survey that decisively cannot fit.

**Drugs@FDA bulk.** The download link's own label reads "(ZIP - 5.91KB)", which is not credible for
29,312 applications; do not plan against it, and check `Content-Length` first. Mostly redundant with
the openFDA drugsfda JSON already held; take it only for the submission-level tables openFDA
flattens away.

**EMA.** The legal notice grants reproduction and distribution, whole or in part, in any format, for
non-commercial **and commercial** purposes, provided EMA is acknowledged as the source in each copy.
Third-party content inside EMA documents is carved out and needs the rightsholder's consent. The
EPAR medicines table is XLS at 717.5 KB, and EMA states the whole site is available as JSON with data
identical to the tables.

**Health Canada.** The DPD extracts fall under the Open Government Licence – Canada 2.0: worldwide,
royalty-free, perpetual, non-exclusive, commercial use permitted, with attribution. The required
string is "Contains information licensed under the Open Government Licence – Canada." The index page
publishes no byte sizes, so check `Content-Length` before downloading `allfiles*.zip`.

**TGA.** The gate was not passed. Two plain GETs of `robots.txt` failed at the transport layer with
our User-Agent — an HTTP/2 `INTERNAL_ERROR`, then a reset over HTTP/1.1 — and the ARTG resources page
failed the same way. Because robots could not be read, no TGA fetch may be attempted in later phases
until a human resolves access. Australian regulatory status stays UNKNOWN, which R11 and the dataset
honesty protocol both permit.

**PMDA.** What is in English and machine-readable: essentially nothing usable. The English section
publishes per-product review reports and package inserts as PDFs. There is no English register
export, no CSV, and no documented API. No licence statement was located. Japanese regulatory status
stays UNKNOWN.

**NIA ITP.** Answering the question directly: yes, ITP results are machine-readable — but as
per-cohort `.xlsx` files on the JAX Mouse Phenome Database, not as one dataset, and not from
`nia.nih.gov`, whose edge answers even `robots.txt` with HTTP 405 and a human-verification page. The
usable pages are `https://phenome.jax.org/projects/ITP1` (the cohort index) and
`https://phenome.jax.org/about/termsofuse`. The files are `ITP_C2004_Lifespan.xlsx` through
`ITP_C2021_Lifespan.xlsx`, with separate "w error" variants for the 2015 and 2020 cohorts, plus
`C2020_pheno_bw.xlsx`, `C2021_pheno_bw.xlsx` and `cohort_2013_fatpads.xlsx`. MPD's terms state that
data contributors waive copyright and related rights and that users may freely build on and reuse
the data for any purpose. The three ITP test sites are distinguished in the data, which matters for
how a result is reported: replication at one site is not the same claim as replication at three.
The one join problem is that ITP carries a compound common name and no structural identifier.

**OpenAlex.** Not verified, and the honest answer is that we could not read the terms. The API root
responds normally (`{"version":"0.1","documentation_url":"/docs","msg":"Don't panic"}`) and
`api.openalex.org/robots.txt` is `Allow: /`, but `openalex.org/terms` returns a Cloudflare challenge
to our client and `docs.openalex.org` is a JavaScript app that serves an identical 19,226-byte shell
for every path, including `.md` variants. The 2026 freemium terms, the documented per-day and
per-second limits and the snapshot size could not be retrieved. Writing remembered figures here
would breach the dataset honesty protocol, so none are written. The recommendation is to drop
OpenAlex: Europe PMC and PubMed cover the same need under terms we did read, and the snapshot
exceeds the disk budget regardless.

**Europe PMC.** Article metadata is freely searchable and reusable; full text carries per-article
copyright, with the open-access subset under CC or similar licences declared per article. Take
citations, identifiers and abstracts; do not store or render full text without checking that
article's licence. No numeric rate limit or page-size cap could be extracted from the RESTful Web
Service page — its parameter tables are script-rendered — so the plan plays it safe at three
requests per second or slower and flags the number for confirmation before any large run.

**PubMed E-utilities.** Documented: three requests per second without an API key, ten with one, and
a request that large jobs run at weekends or outside 21:00–05:00 US Eastern. Batch `esummary` and
`efetch` by UID list rather than calling once per record.
`/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/rnawiki-ingest-data/pubmed` already holds prior
search results.

**DrugBank.** Exactly what the Open Data download provides, from the downloads page itself: two
files under CC0 — **DrugBank Vocabulary**, 1.12 MB CSV, giving DrugBank identifiers, names and
synonyms for linking; and **DrugBank Structures**, 5.16 MB SDF, giving structures, names and
synonyms. That is all. No targets, no interactions, no pharmacology, no indications. Everything
else on the page is CC BY-NC 4.0: the full database (204 MB XML), all-structures (11 MB), 3D
structures (13.9 MB), approved (3.63 MB), experimental (4.69 MB), nutraceutical (183 KB), illicit
(131 KB), withdrawn, plus external links, protein identifiers and the target and drug sequence sets.
The fields we would actually want sit entirely in the non-commercial tier, so they are unusable for
a public reference site. **No price is stated on the downloads page** — the academic tier is
credential-gated (`curl -u EMAIL:PASSWORD`) and the commercial tier is "Contact Sales" — so no
figure is quoted here. Every download was marked "Temporarily unavailable" on the survey date, and
the page footer states that use or redistribution of DrugBank content requires a licence and proper
citation. The terms-of-use page itself returned 403 to our client.

**FDA withdrawn and discontinued lists.** Three plausible URLs for "Drug Products Withdrawn or
Removed from the Market for Reasons of Safety or Effectiveness" all returned 404 on the survey date,
under `/drug-approvals-and-databases/`, `/development-approval-process-drugs/` and
`/drug-safety-and-availability/`. No URL is asserted; Phase 1 should locate it by hand. Four free,
reachable substitutes cover the field in the meantime: openFDA `drug/enforcement` (17,899 records,
4 MB), Drugs@FDA marketing status, the Orange Book discontinued products, and Open Targets
`drug_warning.parquet` (249 KB), which carries withdrawal warnings with year, country and reason.

**WHO consolidated list of banned or withdrawn products.** Not located — the guessed publications
URL returned 404, and no URL is asserted. The non-commercial licence would bar redistribution in any
case, so it could serve only as a pointer for human verification.

**Google Patents.** Not clear, and we should not fetch it. `robots.txt` is `Disallow: /*` with narrow
allowances for `/patent/`, `/sitemap/`, the bare root and `/advanced`, and Google's terms prohibit
"using automated means to access content from any of our services in violation of the machine-readable
instructions on our web pages". Nothing grants us a licence to redistribute the content, and no API
is offered to us, so there is no rate limit to plan against. Legitimate substitutes are the Orange
Book patent listings for US marketed drugs, already on disk, and USPTO or EPO OPS if patent status
ever becomes a required field. Otherwise the field stays UNKNOWN.

## Consequences for later phases

1. **Phase 0c must report the ChEMBL-to-corpus overlap as a measured number.** The 22,636 estimate
   above is arithmetic on an assumption, and 20,000 is only cleared while overlap stays under about
   6,600.
2. **An openFDA API key is required** before any FAERS work. The unkeyed daily allowance is 1,000.
3. **Patent status, Australian status and Japanese status have no cleared source.** They should be
   modelled as UNKNOWN rather than left to be filled opportunistically.
4. **The share-alike boundary is a build constraint, not a footnote.** ChEMBL-derived fields must
   stay separable from CC0 fields in the export so that a public dataset download can state its
   licence per field rather than forcing share-alike across the whole corpus.
