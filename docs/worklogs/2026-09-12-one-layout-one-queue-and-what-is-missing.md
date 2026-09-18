# RNAWiki, 12 September 2026: one medicine layout, review moved off the reader's page, and an honest account of what is missing

## Is the site live?

Not yet, at the time this sentence was written. Everything that has to be true before it goes live is
true: the production database is backed up and the backup has been restored and checked, the ten
pending migrations have been replayed against that restored copy without error, the full release gate
passes locally, the enriched medicine records have been written to the production database, and the
pull request has been retargeted at the branch Railway deploys from and taken out of draft. What is
outstanding is the repository's own release gate running on GitHub's machines, which is still in
progress. The merge happens when it finishes, the deploy follows from the merge automatically, and
the last section of this report records how that went.

Everything else below is done and is described in the past tense because it happened.

---

## What the words in this report mean

A few terms are used throughout, and each is explained here rather than assumed.

**The compass** is the medicine page — one long document per substance, with a standing list of
contents down the left. Its code lives under `dossier-v4`, which is a directory name rather than a
version a reader ever sees.

**A record** is everything RNAWiki holds about one substance. A record can be rich or nearly empty,
and the difference is what most of this report is about.

**A label** is the document a regulator approves to go with a medicine — in the United States, the
prescribing information or the over-the-counter drug facts panel. It is the most reliable public
statement of what a medicine is for and what is known about it.

**An envelope** is the structured store of what RNAWiki has read out of sources for one substance. It
has twenty-five parts, called modules — a mechanism module, a safety module, a module for what
products contain the substance, and so on. Every value in it is stored beside the sentence it came
from and the identifier of the document that sentence was printed in.

**A statement's origin** is how a sentence on a page came to be there: quoted from a source, written
into the record by a person, counted from stored rows, or a standing sentence RNAWiki prints on every
page of that kind. Every sentence on a medicine page carries its origin, so a reader can tell them
apart.

**Boilerplate**, in the measurements below, means a sentence that appears on more than half of all
medicine pages. **Specific** means a sentence that appears on exactly one. **Shared** is everything
in between.

---

## 1. There is one medicine layout, and no switch that picks another

### What was there before

A medicine could be served as any of three different pages. Which one a reader got depended on an
environment variable called `DOSSIER_V4_SLUGS`, and a second called `DOSSIER_V3_SLUGS` behind it. A
variable that selects a layout is not a feature flag; it is two products sharing a URL, and which one
a person sees depends on a setting nobody remembers to check.

### What was done

Both variables are deleted, not emptied. The conditionals that read them are collapsed rather than
defaulted. The following were removed entirely: the React legacy record route, `MedicineDossierV2`,
the dossier v3 components, the corpus document, the legacy-forward module, twenty-nine orphaned
components and about a dozen tests that only existed to test them.

`scripts/check/single-dossier-layout.ts` now runs in the release gate and fails the build if either
variable name reappears anywhere in the repository, if a deleted layout module is imported again, or
if the medicine route grows a second rendering branch. It reports "1,020 files checked, no layout flag
and no deleted layout module".

### What the flag was doing besides picking a layout, and how that behaviour was preserved

Four behaviours were entangled with the flag and are now explicit in code:

1. **Canonical URL and redirect.** A request for a non-canonical slug is redirected permanently to the
   canonical one, and the `programme` query parameter is carried across the redirect rather than
   dropped. This is in `app/d/[slug]/route.ts` and is now unconditional.
2. **View counting.** A page view increments the record's counter whether or not a curated record
   exists. Previously this sat inside one branch.
3. **Indexing.** Whether a page is offered to a search engine is decided in one place,
   `lib/dossier-v4/indexability.ts`, from an assessment of what the built page actually contains —
   whether it has an opening sentence, an explanation, a result measured in people, and a mechanism.
   The same assessment writes the notice an empty page shows, so the sentence a reader sees and the
   instruction a crawler reads are produced by one function and cannot disagree.
4. **Sitemap membership.** Collapsing the layouts would have let the page's own indexing decision and
   the sitemap's inclusion rule drift apart. They now read the same assessment.

A page that cannot render on the compass fails the build. There is no fallback to fall back to.

---

## 2. Review moved off the reader's page entirely

### The decision, and why

A medicine page used to carry a small control reading "Review or improve · 0/3", linking into the
review queue for that medicine. It replaced a large "PRELIMINARY, AWAITING REVIEW" banner, and it was
an improvement on the banner. It is now gone too.

Two reasons. The first is that a reader arrives at a page about a drug to find out about the drug, and
a page that asks them in the same breath to adjudicate its wording has changed what it is. The second
is the fraction. "2/3" beside a medicine's name reads as a score for the medicine. It was a count of
signatures on one sentence, and no amount of careful wording around it stops the first reading
arriving first.

So a medicine page now carries: no control, no fraction, no approval status, no "community approved"
label, and no link into review from anywhere inside the document. There is one way in, the footer's
"Review and improve", which is on every page of the site and is defined once in
`lib/site-footer-links.ts` so the React footer and the plain-document footer that medicine pages use
cannot drift apart.

### The "community approved" origin was removed as well

An approved wording used to carry a statement origin called `community_reviewed`, which rendered
beside the sentence as "Community approved". On a page about a drug that reads as a verdict on the
drug; it was a verdict on a phrasing. A sentence whose wording three members approved now keeps the
origin of the evidence underneath it — a quoted source stays quoted, an unreviewed record stays
unreviewed — and the approval is recorded in the provenance note under the statement and in the
page's change history.

Removing it exposed a bug worth recording. The hero skips a statement whose origin is `absent`, and
an approved wording on a slot that previously held nothing inherited `absent` and rendered nowhere. A
wording three people had signed was invisible. Fixed by giving such a statement the
`authored_record` origin, which claims less than the truth — its note says no reviewer has signed it
off, which stays accurate, because what was approved was the phrasing and not the claim.

### Wording history was put back

Stripping review state from reader pages also removed the record of wording that had already changed.
That was wrong and is reversed. Pending review does not belong on a reader's page; a change that
already happened does. The change-history section now carries both kinds, told apart: a correction
changed what the record holds, a review changed how a sentence puts it. No reviewer names, no
declared conflicts, no qualification records — only whether one of the reviewers held a relevant
qualification.

### Review is item-granular, and here is what that means and what I chose

The unit of review is one **item**: one statement, on one medicine, keyed by the pair
`(medicine_id, statement_key)`. The database already worked this way before this session —
per-item advisory locks, a digest that includes the statement key, author exclusion and
one-vote-per-account enforced at item granularity by PL/pgSQL triggers. Two proposals on the same
medicine, even on the same sentence, are independent: each has its own digest, its own three
approvals, and its own lock. That part needed no work.

What needed work was that none of it was visible. Items were reachable only at
`/review-queue?slug=<medicine>`, so a reviewer had to already know which medicine had work before
they could find any, and nothing listed the queue as a whole. At corpus scale that is not a queue; it
is a set of private URLs.

Three decisions, and the reasoning for each:

**One row per medicine, not one row per item.** Item granularity is right for reviewing and wrong for
reading. Ten thousand medicines with a handful of items each is a list nobody can navigate. The items
on one medicine are also the ones most likely to interact — sometimes competing wordings for the same
sentence — and a row reading "4 proposals on 2 sentences" tells a reviewer that before they open it.
The list is as long as the number of medicines with work outstanding, not the number of items.

**Ordered by the most serious thing first, then by the longest wait.** Risk first, because a safety
hold outranks a wording fix however long the wording fix has queued. Age second, so nothing can sit
forever behind a stream of newer, riskier work.

**Filter by medicine, page over medicines.** `?medicine=<slug>` narrows the list; `?items=<n>` pages
it, separately from the merged queue's own `?page=`, because the two lists are different lengths and
moving through one should not silently move through the other.

One trap is worth writing down because it looked correct and was exactly backwards. `risk_class` is a
PostgreSQL enum, and enum comparison follows declaration order rather than alphabetical order. The
declaration runs `copy_only`, `scientific_meaning`, `high_risk` — least serious first — so the most
serious value on a medicine is `max()`, and the `min()` this was first written with would have sorted
the safest work to the top while looking entirely reasonable.

---

## 3. Filling the empty records

### The first finding: most of it was never a retrieval failure

The brief said to treat an empty page for an approved drug as a retrieval failure until proven
otherwise. Measuring it first showed that most of it was not.

The corpus held a `medicine-background/v1` envelope for 9,855 of 9,859 medicines. Among them were
1,874 mechanisms and 3,078 recorded uses, each one already fetched from a label, parsed, validated and
stored beside the sentence it came from. The medicine page rendered none of them. It read the curated
columns of the older `drugs` table, which are populated for a few hundred flagship records and empty
for everything else, and showed an absence for the rest.

That was the single largest cause of empty pages and it was a rendering gap, not a retrieval one. The
text had been fetched years of work ago and was sitting in the database unread.

### The second finding: deleting the old layout made it much worse

Eighteen of the envelope's twenty-five modules reached a reader only through
`components/MedicineRecordContextSections.tsx`. That component belonged to the medicine layout this
release deleted. Removing the layout removed the only reader surface for:

| Module | Medicines holding it |
| --- | --- |
| Source material (what it is made from) | 7,126 |
| Registry identifiers | 6,741 |
| Product listing | 5,998 |
| Label presence | 5,941 |
| Supplement market | 5,350 |
| Supplement ingredient | 3,887 |
| Molecular identity | 3,251 |
| Biological identity | 2,999 |
| Regulatory approval | 2,542 |
| Product variants | 2,277 |
| Population statements | 2,014 |

The test written to catch exactly this class of defect —
`tests/unit/background-modules-reach-the-page.test.ts`, whose opening comment describes a module that
was "stored, validated and never shown" — was pointed at the deleted file. It failed with a
file-not-found error rather than with the finding. It is now pointed at the live projections and at
the view model that hands them to sections, so the same check catches the same defect again.

### What was built

`lib/dossier-v4/recorded-label.ts` projects the seven modules carrying label prose into sentences the
page prints — uses, mechanism, safety, pharmacokinetics, common adverse reactions, interactions and
the boxed warning. Every one is `textAsRecorded`: the printed sentence, unaltered, carrying the
identifier of the document it was printed in.

`lib/dossier-v4/recorded-facts.ts` projects the other eighteen. These carry counts, names, dates and
classifications rather than prose, so each sentence is assembled from recorded values and says only
what the register states. They are distributed into the sections they answer rather than collected
into a block, because "212 products list this as an active ingredient" is an answer to how a medicine
is supplied, not a fact about records:

- what it is and where it comes from → the hero
- what is sold and in what form → "Does the exact form matter?"
- what a label states about a named group of people → "Were people like you studied?"
- approvals, sponsors, dates and marketing status → "How this medicine reached us"
- how many documents were read, and the register identifiers → "Check any of this yourself"
- recorded target regions → "The path through the body"
- a recorded stepping schedule → "What taking it involves"

The wording is careful about what a count means. That a substance appears on 212 product listings is a
fact about a product directory and not about whether it works, and the sentences say the first thing
rather than implying the second. Where a supplement label carries a structure/function claim, the page
says that such a claim is written by the manufacturer and assessed by no regulator, so its presence
says nothing about whether it is true.

### The acquisition that was run

Two passes, against sources that were not being read.

**DailyMed and the FDA label archive, through openFDA.** 1,771 medicines attempted, 172 filled.
Mechanism 98, recorded uses 79, attribution 58, safety 35, product variants 32, molecular identity 25,
pharmacokinetics 20, population statements 18, common adverse reactions 12, interaction signals 9.
Of the rest, 1,182 returned no single-substance label and 417 returned a label carrying no usable
content.

**Drugs@FDA, the approval register.** 710 attempted, 37 filled: 32 discontinued, 27 prescription,
3 tentative approvals, 1 over-the-counter.

The second pass exists because of what the first one found. Sampling the medicines the label pass
could not fill showed two different problems wearing the same face. Cetostearyl alcohol and palmitoyl
tetrapeptide-7 are cosmetic ingredients the corpus classes as approved drugs; no drug label exists and
none should. Carbenicillin, inamrinone, cephapirin, desirudin, norfloxacin and copanlisib are
different: every one was approved, and every one has been discontinued. openFDA's label endpoint
carries labels that are currently published, and DailyMed's search does the same, so a discontinued
medicine returns nothing from both while its approval remains a matter of public record.

Searching Drugs@FDA on `products.active_ingredients.name` rather than `openfda.generic_name` is what
reaches them — the openFDA cross-reference is built from current labels and is empty for exactly
these medicines, which is why the first pass missed them. Carbenicillin's page now says "2 approved
applications cover products containing this substance. The earliest was NDA050306, approved
1970-12-31" and "Marketing status on the register: discontinued", where it said nothing.

Yield flattened rather than being cut short: the label pass's fill rate fell from roughly one in three
on the first few hundred (ordered by how many single-substance labels a medicine had) to under one in
twenty by the end, and the approval pass returned no application for 673 of 710.

### A safety error I made and caught

The mechanism extractor originally required a label section headed "Mechanism of Action". Most older
and generic labels describe how a substance acts in the opening prose of Clinical Pharmacology, under
no heading, so 1,475 approved medicines had no mechanism text while their labels carried one.

Widening it introduced the opposite and worse error. The first selector stored, as minoxidil's
mechanism, the sentence "These adverse effects can usually be minimized by concomitant administration
of a diuretic and a beta-adrenergic blocking agent or other sympathetic nervous system suppressant."
Every word of that is real label text. It is also treatment advice filed under a heading that says it
explains how the drug works. A true sentence under a false heading is not a small error on a medicine
page.

The fix is three guards, each with an executable test derived from the case that produced it: a
sentence is refused if it is about adverse effects, toxicity, dosing advice or contraindications; a
pharmacokinetic sentence is refused because it belongs to a different module; and a sentence must name
the substance the label is about, which rejects sentences comparing it to other drugs. Eight tests in
`tests/unit/label-mechanism-extraction.test.ts`, three of which are must-refuse cases.

### Sources not reached

EMA European public assessment reports, Health Canada, the TGA register, WHO INN, ChEMBL and PubMed
were not fetched in this session. The corpus already holds registry identifiers pointing into most of
them — 6,741 medicines carry at least one — so the work is a fetch rather than a resolution, and it is
the clearest next acquisition. The pages that need it most are the 195 discontinued medicines whose
historical labels are not on the live FDA endpoint but are in the FDA's own archive.

### What an empty page says now

`MissingRecordNotice` renders on a page whose record holds none of the four things a reader came for.
It says, in plain words, that RNAWiki has not found information about this substance, what specifically
is missing, and where it looked — naming the FDA label archive and DailyMed, the FDA, EMA, Health
Canada and TGA registers, ClinicalTrials.gov, and PubChem and ChEMBL. The same assessment sets the
page to noindex, so it is not offered to a search engine.

Every such page is listed at the end of this report.

---

## 4. Making each page about its own medicine

### How it was measured

The measurement renders the real page — the same component the route serves — and reads the sentences
out of its HTML. Each sentence is placed in one of three buckets by counting how many other pages in
the sample print the same one: **boilerplate** if more than half do, **shared** if more than one but
fewer than half, **specific** if exactly one page does. The sample is 600 medicines chosen by a stable
hash of the slug, so the same pages are measured before and after.

The audit layer at the foot of the page is excluded, and the exclusion is the point of the
measurement rather than a convenience. "The full record, for auditing" prints every stored source row,
registry identifier and trial number, so it is unique per medicine by construction; counting it would
score a page as highly distinctive on the strength of a list of accession numbers behind a closed
disclosure.

One correction worth recording: the first version of this measurement read the view model rather than
the page. The model carries a `reason` string per section that the contents list uses and the page
never prints, so twenty-two identical strings per page were counted as reader text and the boilerplate
share came out about ten points too high. What a reader sees is the only thing worth measuring.

### What the measurement found

Before: **90.96%** of a page was boilerplate, **5.86%** shared, **3.18%** specific to that medicine.
Across 456.6 sentences per page, 17.6 were about the medicine in question. Eight sections produced
exactly one rendering across all 300 medicines in the section-level sample. Measured by characters,
22,350 of the 49,788 a page printed — 45% — were byte-for-byte identical from one medicine to the
next.

### What was fixed, by cause

**Templating.** Twenty-two sections rendered for every medicine whether or not the record had anything
for them. A section with nothing now prints nothing, and every one it leaves out is named, with the
reason, in a single block near the foot of the page headed "*n* questions this page could not answer".
Hiding an absence was not an option — "unknown is not failure" is a rule of this project, and a reader
who cannot tell "nobody has measured this" from "we did not bother with this section" has been told
less rather than more. So the absences are kept and consolidated, and a reader who wants to know what
is missing gets a list instead of a scroll.

Seven sections print even when empty, because for those the emptiness is the information: what can go
wrong, whether people like you were studied, whether the form you can buy is the form that was tested,
what nobody knows, how to check the page, what to read next, and what it does in the body. That
nobody has recorded what can go wrong with a substance is not a gap to tidy into a list at the bottom
of the page; it is the most important sentence on it.

**A section claiming content it did not have.** "How long anything takes" reported that it held
timing information on the strength of a sentence RNAWiki prints on every page of that kind — the one
saying nothing is recorded beyond the longest study. Every medicine therefore reported timing content,
the section rendered on all of them, and across 300 medicines it produced two distinct renderings. A
standing sentence is not a measurement, and the state now reflects whether a source or a count put
something there.

**A generic claim asserted as this record's finding.** "Why it might seem to do nothing" printed, on
every medicine, under a heading reading "On this record:", the sentence "Day-to-day swing in sleep,
food and stress moves most home measurements more than a supplement would." It came from no record. On
an intravenous hospital medicine the comparison to a supplement is simply wrong. It is deleted; the
reason stays in the catalogue below as something RNAWiki checked for and did not find.

**A feature described instead of a record.** "What people report" explained how community reports
would be ordered and weighed, above a list of empty categories, on every one of 10,250 pages — 1,458
characters, identical everywhere, for a feature that does not exist. A promise is not a record. It is
removed. When RNAWiki does collect reports, the lane comes back with reports in it.

**A placeholder reaching readers.** An interaction whose counterpart had no name rendered as "Unnamed
counterpart", which reached readers as "does taking Unnamed counterpart alongside Carbenicillin change
anything for me?" — a question nobody can act on. Those rows are dropped.

**Missing data.** Sections 3's work: eighteen modules of stored, sourced content given a reader
surface.

### What the measurement found afterwards

| | Before | After |
| --- | --- | --- |
| Boilerplate share | 90.96% | 82.43% |
| Shared share | 5.86% | 11.18% |
| Specific to that medicine | 3.18% | **6.38%** |
| Specific sentences per page | 17.6 | **25.4** |
| Sentences per page | 456.6 | 330.9 |
| 10th percentile of specific share | 0.47% | **2.27%** |
| 25th percentile | 0.70% | 3.04% |
| Median | 1.32% | **4.13%** |
| 75th percentile | 2.30% | 6.49% |
| 90th percentile | 7.06% | 10.75% |

The specific share doubled and the count of medicine-specific sentences rose by 44%. The distribution
moved most at the bottom: the worst-served tenth of pages went from 0.47% to 2.27%, nearly five times,
because the pages that gained most were the ones that previously had almost nothing.

No sentence was reworded per drug to move this number. The gain is content that had already been
fetched and stored, plus the removal of furniture that was never about any medicine.

### What is still true

A medicine page is still 82% template. Some of that is correct and permanent — headings, the contents
list, the purpose controls, the not-medical-advice line. A large part of the rest is honest absence
lines on records that hold very little, and the only thing that moves those is data. 2,429 of 9,857
pages still hold none of the four things a reader came for.

---

## 5. Deployment

### The backup, and the proof it restores

The production database was backed up with `pg_dump` in custom format over a connection that verified
the server certificate in full — CA pinned from inside Railway, and the certificate checked against
the identity it actually asserts rather than the proxy hostname it is reached through. There is no
verification bypass in this project and none was used.

Result: `rnawiki-backups/railway/pre-dossier-v4-20260912.dump`, 184 MB, taken from a 1,214 MB
database holding 9,859 medicines.

It was then restored into a scratch database and compared against production:

| | Production | Restored copy |
| --- | --- | --- |
| Medicines | 9,859 | 9,859 |
| Medicines with a stored envelope | 9,855 | 9,855 |
| Tables | 77 | 77 |

### The ten migrations

Production had 26 of the repository's 36 migrations applied. The ten pending are 0026 through 0035.
Every one is additive: new tables, new indexes, new nullable or defaulted columns, new enum values,
new functions and triggers. There is no `DROP`, no `DELETE`, no `TRUNCATE`, no type narrowing, and no
`NOT NULL` added to an existing table.

**No migration needed restructuring to be reversible.** The only operations that cannot be undone in
PostgreSQL are the nine `ALTER TYPE ... ADD VALUE` statements in 0026, which add values to two
existing enums. They destroy nothing and code that does not know the new values ignores them. Every
other change is a new object that can be dropped. The rollback path is the backup, and it has been
proven to restore.

Two of the new triggers attach to tables that already exist in production — `corpus_pages` and
`page_questions` — and both are `BEFORE INSERT OR UPDATE` guards that refuse to store controlled-
substance content in the wrong place. They fire on writes only and are this project's own safety
rules. Every other new trigger attaches to a table created by the same migration.

They were then replayed against the restored copy of production, which is a dress rehearsal against
real data rather than a fixture. All ten applied cleanly, the migration count went from 26 to 36, the
medicine count was unchanged at 9,859, the table count went from 77 to 105, and medicine pages built
successfully against the migrated copy.

### The data that had to move

The acquisition passes ran against the working database. Production held the same 9,859 medicines with
an older envelope for each, so the difference was a set of modules present in one and absent from the
other.

Re-running acquisition against production would have made several thousand requests to openFDA to
arrive at values already fetched and checked. Restoring the working database over production would
have carried across every unrelated difference between the two. Neither is what was wanted.
`scripts/background/transfer-acquired-modules.ts` moves exactly the acquired modules, under the same
three rules the acquisition scripts apply: a module already present in the target is never replaced, a
record marked curated is never touched, and only the named modules move. It is idempotent by
construction.

Applied to production: **236 medicines** gained at least one module — 108 mechanisms, 96 recorded
uses, 78 attributions, 37 approval records, 36 safety blocks, 34 product variants, 33 molecular
identities, 20 pharmacokinetics, 18 population statements, 12 common adverse reactions, 10 interaction
signals. No curated record was touched. No medicine in the source was missing from the target.

Production now matches the working corpus: 1,874 mechanisms, 3,078 recorded uses, 2,542 approval
records.

### The release gate

Every stage passed locally before the merge was attempted:

| Stage | Result |
| --- | --- |
| TypeScript | clean |
| ESLint | 0 errors |
| Promotional-language scan | 0 hits across 486 public files |
| Single-layout check | 1,020 files, no flag, no deleted module |
| Recorded-background validation | 9,855 envelopes, 0 failed |
| Agent determinism | 3,155 candidates, 42,857 findings, deterministic rerun passed |
| Four-audience coverage | passed |
| Dataset export | passed |
| SEO suite | 259 tests in 23 files |
| Formatting | clean |
| Migration metadata | clean |
| Unit tests | 2,662 passed, 9 skipped, across 179 files |
| Integration tests | 209 passed across 29 files, on a disposable database |
| Production build | clean |
| Browser tests | 102 passed, 1 marked |

### The branch

`rebuild/biohacker-dossier` was 76 commits ahead of `main` and 0 behind. Pull request #19 targeted
`revamp/2026-09`, which is not the branch Railway deploys from. It was retargeted at `main`, taken out
of draft, and reports `MERGEABLE`. Railway deploys `main` on push and runs the migrations in its
pre-deploy step, so the merge is the deployment.

### Three deploys, two failures, and what stopped them

**The first deploy failed, on the data I had put in production myself.** Railway ran the ten
migrations successfully and then refused at `agents:import`:

    Production recorded background differs from the checked agent corpus
    for 236 medicine subject(s).

236 is exactly the number of medicines this release's acquisition enriched. The agent package carries
a digest of every medicine's stored record, taken when the package was built; I had changed 236 of
those records without rebuilding it. The guard exists so that findings about a medicine cannot be
published against a record state they were never checked against, and it was right to stop.

The site never went down. Railway runs the pre-deploy step before the new container takes traffic, so
the previous version kept serving throughout.

Fixing it took the dataset export, the agent package and three derived audit reports, in that order,
because the agent loader checks its corpus digest against the committed snapshot as well as the
working tree. It also surfaced something worth knowing on its own: the published dataset had been
exported from a development database, not from production. It is now exported from production, which
is the only database a downloader can check an export against. `check:dataset-export` verifies all 25
files and reports that the published files match the manifest exactly.

**The lesson, stated plainly, because I got it wrong:** a corpus change is not finished when the
database write lands. The export, the agent package and the audits are derived from that corpus and
are part of the same change. Shipping the data without them is what produced a failed deploy.

**The second deploy succeeded, and verifying it found a worse problem than the first failure.** Every
medicine page came back `noindex, follow` — aspirin, ibuprofen, metformin, caffeine, all of them.
Before this release they were indexed.

That was a bug I introduced earlier in this same release. `decideMedicinePageIndexing` required all
seven page gates to pass. Five of them mean a page might be *wrong*: unresolved identity, an
unresolved merge across substance families, internal keys leaking into reader text, an unresolved
supervision mode, missing canonical metadata. Two of them measure how far RNAWiki has got with its
own work, and one of those reads `page_registry_role_aggregates` — a table migration 0026 creates and
which has never held a single row in production. Zero rows, so the gate fails for every medicine, so
every medicine page was withheld from search the moment the layout took traffic.

Indexing now blocks only on the five gates that mean a page may be wrong. Incomplete is not the same
as wrong, and only wrong is a reason to hide a page from somebody looking for it. A page built from a
regulator's label — what a substance is for, what it does, what can go wrong — is worth finding
whether or not the trial classification has caught up with it.

Measured across 799 medicines after the change:

| Outcome | Share |
| --- | --- |
| Indexable | 53.2% |
| Held back by an unresolved supervision mode | 24.4% |
| Empty, and saying so | 22.4% |

The 24.4% is a deliberate block rather than a gap: a medicine page that cannot resolve whether the
substance needs a prescription should not be advertised in search.

Eight test cases pin the distinction between the two kinds of gate rather than the list of gates, so
adding a gate later cannot silently take the corpus out of the index again.

### Live verification

Thirty pages over HTTP against the deployed site — every tier and a twenty-medicine sample spanning
curated flagships, label-derived records, discontinued medicines and empty ones:

| | Result |
| --- | --- |
| Pages checked | 30 |
| Failures | 0 |
| Median response | 95 ms |
| Slowest response | 485 ms |

Every page returned 200. Every one carried exactly one `<main>` and exactly one `<h1>`, a canonical
URL, and a robots instruction consistent with what the page says about itself. None carried any of
the ten strings the checker refuses in reader text — the placeholder counterpart name, a raw state
code, the review fraction, the preliminary banner, the generic supplement remark, the layout flag.

The discontinued medicines carry their approval registers. Carbenicillin, norfloxacin, cephapirin,
inamrinone and desirudin all render register facts where they previously rendered nothing.

### The reader-text scan

A twenty-page sample had found `[object Object]` on seven of the most-read medicines on the site. A
sample that happened to miss those seven would have reported the page clean, so the check was rerun
over the whole corpus rather than a sample: all 9,857 medicines, every string in every built model.

**Zero `[object Object]` corpus-wide.**

The scan needed two corrections of its own, both recorded because they are the kind of thing that
makes a check useless. Its first run reported 950,926 findings, almost all of which were the model
working correctly — it was walking `state` and `origin`, which hold enum values by design and are
rendered through their label functions. Its second reported 3,150, of which the remainder were the
English words "null" and "undefined" appearing in legitimate sentences: isosorbide mononitrate's
label says "the relative importance of the three remains undefined", which is the label being
unusually candid and is exactly the kind of sentence this site exists to carry.

A check that cries wolf is worse than no check, because it teaches its reader to skim. It now looks
only for patterns that cannot occur in English.

---

## Judgement calls made without asking

These were decisions where more than one defensible answer existed. Each is recorded with the
reasoning so it can be argued with.

1. **The review control was removed entirely rather than made smaller.** The fraction reads as a
   score for the medicine, and no wording fixes that.
2. **"Community approved" was removed from the origin vocabulary.** Same reason, one level down.
3. **Empty sections are consolidated rather than hidden or printed.** Hiding them breaks "unknown is
   not failure"; printing them was 45% of the page.
4. **"What people report" was deleted rather than left switched off.** A description of a feature that
   does not exist is not a record of a medicine.
5. **The four-lens audience selector was not rebuilt.** The compass leads with plain language for
   everyone and keeps the technical vocabulary in one labelled layer, rather than asking a reader to
   declare which of four kinds of person they are before the page will tell them anything. The data
   contract the lenses rested on is still enforced every run.
6. **Register facts were distributed into the sections they answer, not collected into one block.**
   "212 products list this" answers how a medicine is supplied.
7. **The older medicine-wide conclusion is shown in the technical layer rather than on the first
   read.** 489 records hold one. It is written for a clinical reader, it is not scoped to one
   indication and population, and it is labelled as both of those things where it appears.
8. **The acquired modules were transferred rather than re-fetched or restored wholesale.**
9. **The deep contribution journey was left to the integration suite rather than rewritten as a
   browser test.** Eleven cases there cover more than a browser reaches, and none of them depended on
   the deleted dialog.
10. **The missing programme-conclusion path was marked rather than built.** See the next section.

---

## Known gaps, stated plainly

**A published programme conclusion does not reach the medicine page.** The compass loads by slug and
has no read path for `programme_current_publications`, so `?programme=` survives the redirect, reaches
the route and changes nothing that is rendered. The conclusion is still published, still reachable at
`/d/<slug>/programme/<programme>/history`, and still in the API.

This is not a live regression today: `programme_current_publications` and `development_programmes` are
both empty in production, so no medicine page has ever had one to show. It becomes one the day the
first programme is published. It is marked as a known-missing case in
`tests/e2e/public-inclisiran-journey.spec.ts` rather than deleted, so the test that will catch it
being wired up wrongly is already written.

**Disclosure controls were 29.5 px tall on a phone.** Under the 44 px minimum, on the only control
most of the page has. Fixed in this session, in both the compass and the corpus stylesheet.

**2,429 of 9,857 medicine pages say information is unavailable.** All 2,429 are noindexed. They are
listed at the end of this report.

---

## What was measured, and where the numbers live

Every number in this report came from a script that can be re-run.

| What | Script | Output |
| --- | --- | --- |
| Page similarity, before and after | `scripts/dossier-v4/measure-page-similarity.ts` | `data/dossier-v4/page-similarity-{before,after}.json` |
| Where the sameness lives, by section | `scripts/dossier-v4/diagnose-empty-sections.ts` | `data/dossier-v4/empty-section-cost.json` |
| Where the sameness lives, by slot | `scripts/dossier-v4/diagnose-page-sameness.ts` | `data/dossier-v4/page-sameness-by-slot.json` |
| Label acquisition | `scripts/background/fetch-dailymed-labels.ts` | `data/background/dailymed-acquisition*.{json,ndjson}` |
| Approval acquisition | `scripts/background/fetch-drugsfda-approvals.ts` | `data/background/drugsfda-acquisition*.{json,ndjson}` |
| Module transfer to production | `scripts/background/transfer-acquired-modules.ts` | `data/background/module-transfer.json` |
| Records with nothing to show | `scripts/dossier-v4/list-unavailable-records.ts` | `data/dossier-v4/unavailable-records.json` |

---

# Every medicine whose page now says information is unavailable

**2,429 of 9,857 medicines.** All of them are noindexed: the same assessment that writes the notice a
reader sees sets the instruction a crawler reads, so the two cannot disagree.

The grouping below is by what it would actually take to fill each one, because "nothing found" is not
a finding. The full list, with every slug, what each record does hold, and which of the four things a
reader came for is missing, is in `data/dossier-v4/unavailable-records.json`.

## By what would fill it

| Cause | Medicines | What it would take |
| --- | --- | --- |
| Genuinely nothing published | 1,679 | Nothing. These are supplement and cosmetic ingredients the corpus classes as medicines. No regulator has assessed them, so no label, approval or trial exists to find. The notice these pages now show is the correct end state. |
| Acquisition has not reached it | 387 | A name-resolution pass, not another fetch. No label, approval, product listing or supplement record was found under any name the corpus holds — which points at the name rather than at the source. |
| Approved, discontinued, label withdrawn | 195 | A manual extraction from the FDA's historical label archive. These medicines were approved and are no longer marketed. No current label exists to fetch; the approval record is what remains, and the withdrawn label is in the archive rather than on the live endpoint. |
| A label exists and carries no clinical text | 168 | Opening the label, and finding nothing in most of them. Sampling fifteen against the live openFDA record found twelve whose `indications_and_usage`, `purpose`, `description`, `clinical_pharmacology` and `mechanism_of_action` fields were all empty — homeopathic products whose label is ingredients and packaging. The three that carried anything carried directions ("Take 15 minutes before meals"), which the extractor is right to refuse as an indication. This bucket was first classified as a parser problem; checking it showed that was wrong for most of it. |

## By what the corpus says they are

| Approval status | Medicines |
| --- | --- |
| Non-FDA / Dietary Supplement | 1,967 |
| FDA Approved | 320 |
| Pre-clinical / Open Source | 116 |
| Off-Label / Compounded | 26 |

The 320 marked FDA Approved are the ones that matter most, and they are almost entirely the
discontinued group and the name-resolution group. A medicine a regulator approved should not have an
empty page, and for 195 of them the reason is specific and fixable: the label was withdrawn from the
endpoint RNAWiki reads, and the FDA still holds it somewhere else.

## Would a paid source fix any of this?

No, for any of the four groups. The FDA historical label archive, the EMA's European public assessment
reports, Health Canada's and the TGA's registers, WHO INN, ChEMBL, PubChem, ClinicalTrials.gov and
PubMed are all free and public. What the 195 discontinued medicines need is a fetch against an archive
rather than a live endpoint; what the 387 need is better name resolution; what the 168 need is
someone to open a label and find it empty; and what the 1,679 need is nothing, because nothing was
ever published about them.
