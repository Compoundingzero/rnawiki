# Recorded background data

The `medicine-background/v1` layer fills the dossier sections the wireframe shows but the corpus
could not honestly support: how a medicine works, its chemical identity, the enzymes and
transporters that handle it, what its source warns about, which groups the source does and does
not answer for, the reactions reported most often, pharmacokinetics, studied escalation schedules,
product variants, recorded price context, the systemic body map, main-study eligibility and exact
results, and registry identifiers. It lives in `drugs.recorded_background` (migration 0016).

The corpus has two tiers, and they are never presented as the same thing:

- **Curated** (155 medicines) — hand-authored TypeScript batches under
  `scripts/seed-data/background/`, where a person selected and checked each value.
- **Extracted** (3,274 medicines) — `extracted-background.generated.ts`, produced by the
  deterministic parser in `lib/background/label-extraction.ts`. Nobody has checked these, and the
  dossier says so on the page.

Records also arrive from sources that reach rows the label pipeline structurally cannot: the
substance registry, the NIH supplement label database, a compound database, the CMS pricing file and
NCBI Taxonomy. Curated always wins on a shared slug, and a module that corroborates rather than
replaces judgement — cross-source consensus, supplement market counts, archive presence, acquisition
cost, biological identity — may attach to a curated record. `ALL_RECORDED_BACKGROUND` is the merged
corpus; the merge and its precedence are pinned by `tests/unit/background-corpus-merge.test.ts`.

The merged corpus covers **9,853 of 9,857 rows**. The four registries the corpus reads at runtime are
version-controlled, because three of them were once gitignored and the deployed site served a third
of the records this repository could produce while every local check passed.

## Why this dataset is hard to reproduce

The values themselves are public. The discipline around them is the product:

1. **Fetched, never remembered.** Authoring starts from artifacts pulled by
   `scripts/background/fetch-medicine-sources.ts` (openFDA label sections, PubChem, RxNorm) plus
   per-record ClinicalTrials.gov and PubMed fetches. Every numeric value stores the exact fetched
   excerpt that contains it, and Group I of RNA Intelligence verifies number-in-excerpt
   mechanically. A number that was typed from memory cannot pass validation.
2. **Context is part of the value.** Every measurement names who and what it was measured in.
   A bare number fails validation.
3. **Disagreement is data.** Each value carries a concordance state — label-only, corroborated by
   literature, or discrepant with both readings recorded. Publishing the disagreement is the
   honesty competitors skip.
4. **Derived sentences are arithmetic, not prose.** Steady-state notes and cross-currency
   normalizations are produced by the functions in `lib/background/derivations.ts` and re-computed
   by the engine; a mismatch fails validation.
5. **The body map cannot lie.** Authors record region codes from the fixed vocabulary in
   `lib/background/anatomy-regions.ts`; drawing coordinates belong to the vocabulary, so no
   position is ever guessed from free text.

## Boundaries

- These modules are medicine-wide **background**, never a reviewed programme conclusion. Every
  rendered row repeats that frame.
- Amounts and schedules are recorded exactly as the label or trial protocol states them, as
  research context. Group I rejects advice- and commerce-shaped phrasing outright.
- A module a source does not support is absent. A medicine with only registry identifiers is a
  complete, honest entry.
- Excerpts stay under 400 characters: enough to verify a value, never a reproduction of the
  source document.

## Engine

`runBackgroundIntelligence` (`lib/rna-intelligence/background-rules.ts`, version
`rna-intelligence/background-2.4.0`) checks structure only: envelope version, source-identifier
shapes per kind, ISO dates, excerpt length, number-in-excerpt, measurement context, plausibility
ranges by value type, contiguous schedule steps, controlled vocabularies (jurisdictions,
currencies, price types, anatomy regions), derivation equality, concordance/alternate pairing,
registry-identifier shapes, and the forbidden-guidance scan.

Version 1.1.0 adds the checks the quoted modules need. A `RecordedStatement` must match its source
excerpt character for character — that equality is what lets a mechanism sentence or a boxed
warning carry the label's own "patients should be monitored" without the forbidden-guidance scan
rejecting the source's voice as though it were ours. The scan still applies in full to every field
RNAWiki writes in its own voice. Named mechanism targets, interaction counterparties and
adverse-reaction terms must each appear in the recorded excerpt, extending to words the guarantee
that already covered numbers.

Every code has a focused executable case in
`tests/unit/rna-intelligence/background-rule-coverage.test.ts`. People judge meaning; this group
never does.

## Commands

- `npm run check:medicine-content` — validate every envelope (part of `npm run gate`).
- `npm run apply:background` — validate, then write envelopes onto their medicine rows by slug.
  Touches only `recorded_background`; re-running is always safe; unknown slugs are skipped, never
  created. Run it against production after a deploy that adds batches:
  `DATABASE_URL=<production url> npm run apply:background`.
- `npx tsx scripts/background/fetch-medicine-sources.ts <outDir> <slug[:query]> …` — fetch
  authoring artifacts.

## Keeping it current — durable source assertions

`npm run verify:background` is the bounded, database-backed freshness command. It derives bindings
from every excerpt-bearing `BackgroundSource` in the current `drugs.recorded_background` envelopes,
selects the least recently attempted source identities and checks at most 25 of them with four
concurrent requests and a 20-minute runtime bound. The limits can be changed within the guarded
ranges with `--limit`, `--concurrency` and `--max-runtime-minutes`. No model sits anywhere in this
loop.

One source can support many fields. The fetch identity is therefore the canonical, kind-namespaced
`sourceKey`, while each supported assertion receives its own content-addressed binding. The binding
contains the medicine slug, exact field and source paths, source identity, label, optional locator,
recorded retrieval date and excerpt, plus a digest of the complete assertion and the complete
recorded-background envelope. A changed value, excerpt, path or source produces a different binding;
a historical check cannot transfer to it.

Migration 0019 makes the history durable and append-only:

- `background_source_bindings` records the exact source-to-field relationship and its explicit
  reader-question intent. An unknown path is stored without an intent and cannot mark a question
  stale.
- `background_source_fetches` records every attempt as `SUCCEEDED`, `UNREACHABLE`, `UNSUPPORTED` or
  `FAILED`. A successful attempt points to an immutable, content-addressed `source_snapshot`.
- `background_assertion_checks` exists only for a successful fetch of the exact bound source. Its
  result is `CURRENT`, `NUMBERS_CURRENT` or `DRIFTED`.

`CURRENT` means the normalized current text still contains the recorded excerpt.
`NUMBERS_CURRENT` means formatting or sentence order changed, but every number in the recorded
excerpt remains present by numeric value: 800 cannot match inside 5,800. `DRIFTED` means neither
check holds. JSON APIs are parsed first so comparison uses decoded text values rather than escaped
response bytes. The fetched body is used only in-process; the database keeps its SHA-256 content
hash, source locator and non-secret response metadata rather than a second full source copy.

Network, HTTP and timeout failures are `UNREACHABLE`; an absent adapter is `UNSUPPORTED`; malformed,
empty or unreadable successful responses are `FAILED`. None is source drift, none creates an
assertion check and none creates or clears a stale question. A later successful `CURRENT` or
`NUMBERS_CURRENT` check clears an earlier drift for the same exact binding. A changed envelope starts
unknown until its new binding has a successful check.

Confirmed `DRIFTED` checks create deterministic `SOURCE_DRIFT` candidates in the existing candidate
memory. They do not rewrite a medicine value, choose another source, resolve a disagreement or move
a publication pointer. The public dossier marks only the explicitly mapped question stale, and only
when the latest successful check for a binding matching the current envelope is `DRIFTED`. A person
must inspect the candidate and author any correction through the normal reviewed workflow.

The private Railway worker runs this loop together with the bounded ClinicalTrials.gov monitor. Its
exact service configuration, retry semantics and deployment checks are in
[`deployment.md`](deployment.md); the two independent freshness contracts are in
[`evidence-freshness.md`](evidence-freshness.md).

## The companion dataset: computed molecular properties

`molecular-properties/v1` (`lib/background/molecular-properties.ts`) holds PubChem's computed
descriptors — formula, weight, XLogP lipophilicity, hydrogen-bond counts, polar surface area,
rotatable bonds, complexity, SMILES, InChIKey — for every recorded medicine that carries a PubChem
CID in its `registryIdentifiers`.

Nothing in it is authored. `npm run build:molecular` fetches each record by the CID the verified
background layer already holds and regenerates
`scripts/seed-data/background/molecular-properties.generated.ts` wholesale, so refreshing is
re-running the script and `git diff` is the change report. There is no wording to structure and no
judgement to make, which is why this dataset needs no engine of its own: a test asserts it can
never introduce an identifier the verified corpus does not hold.

It exists for the chemist's and biotech researcher's view — chemical space, property distributions,
and an arithmetic rule-of-five summary that always reports its four components and never a verdict
on a molecule. Antibodies and peptides without a computed PubChem record are simply absent rather
than approximated.

## Extraction at corpus scale

Hand-authoring reached 155 medicines. Extraction reaches thousands because it inverts the usual
order: the parser finds a value inside a sentence and stores _that sentence_ as the excerpt, so the
number-in-excerpt guarantee holds by construction, with no model in the loop and nothing to
hallucinate.

The pipeline is two steps:

1. `scripts/background/index-openfda-labels.py <archiveDir> <out.ndjson> [medicineRows.json]` —
   reduces openFDA's bulk label archive (14 partitions, ~262k labels, one download from
   <https://api.fda.gov/download.json>) to the sections the extractors read. It runs in Python
   because a decompressed partition exceeds the longest string a Node process can hold. Passing the
   medicine list filters to labels the corpus can reach, which is what makes the wider section set
   affordable.
2. `npx tsx scripts/background/build-extracted-background.ts <index.ndjson>` — matches medicines to
   labels by generic, brand and substance name, extracts, and writes the generated file.

Two boundaries are absolute: a curated record is never overwritten, and every extracted envelope
must pass Group I before it is written. An extraction that produced something structurally wrong is
dropped, not published.

What the parser refuses is as load-bearing as what it records, and each refusal is pinned by a test
in `tests/unit/label-extraction.test.ts`:

- A **free fraction is never recorded as protein binding.** Losartan's label states "free fractions
  of 1.3%" for a medicine that is 98.7% bound; capturing it would invert the value. The parser skips
  rather than doing arithmetic the label did not print.
- A **per-kilogram volume keeps its unit.** "0.14 L/kg" is never stored as "0.14 L".
- A **sentence with two candidate quantities is skipped.** Two numbers in one sentence is exactly
  the ambiguity the parser will not resolve on its own.
- A **half-life stated in days gets no invented hour figure.** It is recorded for display and stays
  off every numeric axis.
- An **implausible magnitude is dropped**, because a 900% bioavailability means the pattern matched
  the wrong quantity.
- An **interaction role is attached only when one sentence states exactly one role.** Interaction
  prose routinely names two at once, and deciding which attaches to which counterparty is judgement
  the parser does not have.
- **Per-event adverse-reaction percentages are never parsed out of label tables.** Only the
  threshold and list a source prints in a single sentence are recorded, because pairing a number to
  an event across table text would put a wrong frequency on a real harm.

## The attribution guarantee

The excerpt guarantee proves a sentence was printed. It cannot prove the sentence was **about this
medicine**, and that turned out to matter enormously. A multi-ingredient document — an allergenic
extract naming ninety-one pollens, a homeopathic combination naming gold among thirty-five other
things — prints sentences that belong to none of its substances individually. One such document was
supplying the same mechanism, safety and identity to ninety-one different pollen records.

A substance-specific module may therefore only be recorded from a document declaring exactly one
active substance, enforced by `I_ATTRIBUTION_TOO_BROAD` rather than by the pipeline alone. Shared-UNII
collisions fell from 832 groups over 3,964 slugs to 28 over 56, and every one that remains is a
genuine synonym.

Substance identity is resolved only from labels naming a single substance, and cites the label that
established it. An earlier attempt paired openFDA's `substance_name` and `unii` arrays positionally,
on the evidence that they are the same length. They are not aligned: checked against single-substance
labels, 15% of pairings disagreed, and one combination label paired guaifenesin and phenylephrine
each with the other's identifier. Identity also keeps the salt words that content matching strips,
because barium sulfate and barium acetate are not the same substance.

**How the count is taken.** `declaredSubstanceCount` reads `substance_name`, the archive's own list
of active substances, and not the union of that with `generic_name`. The union counted a second
spelling as a second substance — `ALCOHOL` beside `ETHANOL`, `MINOXIDIL` beside
`MINOXIDIL TOPICAL SOLUTION`, `donanemab` beside `donanemab-azbt` — and marked 9,410 labels, one in
eight, as combinations that do not exist. Refusal is the safe direction to err in and it was still
an error: those medicines lost their mechanism, pharmacokinetics and chemical identity, and
donanemab's record stated that no published label describes it on its own when its only label
describes nothing else. A genuine combination is unaffected, because
`AMOXICILLIN AND CLAVULANATE POTASSIUM` lists two substances in `substance_name` and still counts as
two.

## Archive presence: the rows extraction cannot read

Extraction reads prose and keeps only labels that have some, which is right for extraction and wrong
as a measure of what is knowable. Roughly half this corpus is botanicals, homeopathic preparations,
allergenic extracts and animal-derived materials whose labels carry no clinical pharmacology
whatsoever, so they scored zero and their rows came out blank. Sampling forty blank rows against the
archive found twenty of them named on published labels: the information was there and nothing was
counting it.

`labelPresence` records how many published labels name a substance as an active ingredient, how many
of those name it and nothing else, the product types and routes those labels state, and the set ids
behind every count. It is a fact about the archive. It is not a claim about the substance, and a
label existing there is not approval — unapproved and homeopathic products are published alongside
approved medicines, and the row says so.

`singleSubstanceLabelCount` is what makes a thin record legible. A substance that appears only ever
alongside thirty others has no source about it alone, which is exactly why its other sections are
empty, and the record says that outright instead of showing a page of absences.

Counts are transcribed rather than extracted: the archive returns structured fields with no sentence
behind them, so there is no excerpt to quote and the identifiers stand in its place.
`I_LABEL_PRESENCE_COUNT_UNCHECKABLE` refuses a count with no identifier behind it, and
`I_LABEL_PRESENCE_SINGLE_EXCEEDS_TOTAL` refuses a subset larger than its set.

The unfiltered stream this reads is produced by the same indexer, via `--presence=<file>`, because
the filtered stream drops precisely the labels it needs.

## Numbers a label printed, whole

Elacestrant's label reads "the estimated apparent volume of distribution is 5,800 L". RNAWiki
recorded 800 L. Every quantity pattern matched `\d+(?:\.\d+)?`, which cannot cross a thousands
separator and so began matching after one, and the engine's excerpt check passed it because "800" is
a substring of "5800". The molecular-weight pattern failed the other way: its
`\d{1,3}(?:,\d{3})*` branch matches happily with no comma groups at all, so an unseparated
"1355.38" yielded 135 and vitamin B12 was recorded as weighing 135 g/mol.

**107 records carried a number an order of magnitude wrong, each under a correct sentence that
appeared to prove it.** Three changes, at both ends:

- One `PRINTED_NUMBER` definition, used by every quantity pattern. The separated branch requires at
  least one comma group, so it cannot half-match an unseparated number.
- The engine compares displayed numbers to excerpt numbers **by value**, not by substring. "800" no
  longer matches inside "5,800"; "0.5" still matches "0.50".
- `normalizeForMatch` strips separators from a whole separated number rather than from any comma
  followed by three digits. The loose form corrupted comma-delimited data: on a pricing row ending
  ",43386028001,221.72208" it deleted the field separator and glued a product code onto the price.

Two plausibility floors were wrong rather than protective. Volume of distribution was floored at
0.1 L/kg; alirocumab's label states 0.04 to 0.05 and imiglucerase's 0.09 to 0.15, because antibodies
stay in plasma. The molecular-formula shape had no room for a hydrate separator, so bosutinib's
"C 26 H 29 Cl 2 N 5 O 3 .2H 2 O" de-spaced into "O3.2H2O" where "3.2" reads as a decimal.

## Choosing which label describes a substance

Extraction ranked candidate labels by how many readable sections each carried, so on a tie the first
one won. "Actaea Spicata Root" had one label declaring five substances and one declaring one, both
scoring 1, and the five-substance one arrived first — and since every substance-specific module is
refused on a multi-substance source, the record came out empty with the right label sitting in the
index beside it. **987 rows held a label naming them alone and carried no substance content.**

A document about one substance now wins over a richer document about several: the attribution rule
applied at selection rather than only at validation.

The other half of those 987 was a length floor. Forty characters kept section headings out of
statements, and a homeopathic label states a use in fewer — "INDICATIONS Late growth, fracture
consolidation." is a whole published section, 35 characters once the heading comes off. Lowering the
floor everywhere was worse than leaving it: "See Boxed WARNING." and "Pregnancy Category C." became
statements, and "First, wet your skin." and "SHAKE WELL BEFORE USE." arrived under what the label
says the medicine is for, which would make RNAWiki the thing telling a reader to do it. The short
floor is a property of the call, granted only to recorded uses, with named guards for directions,
frequencies, carton text, split headings and fragments closing a bracket they never opened.

## Cost, from the file that surveys it

`costContext` was in the model from the start and no source filled it, because most published prices
are list prices nobody pays. NADAC is what CMS observes retail pharmacies actually paying to buy a
product, published weekly in the public domain — one CSV, no API, nothing to rate-limit.

What the module refuses is as much of the design as what it records. No monthly cost, because that
needs a dose and choosing one is a medical judgement. No mixing of pricing units, because averaging
per-each with per-millilitre produces a number meaning nothing. Only the most recent weekly
snapshot, because a range spanning two weeks never existed on any one day. The excerpt is the
pricing file's own rows for the two products that set the range, verbatim, so a reader sees which
products those are; a composed sentence would not be a quotation.

## What organism a row is

A large part of this corpus is not a molecule. NCBI Taxonomy states the accepted scientific name,
the rank, the ranked lineage and the other names an organism is known by — facts about biological
nomenclature, nothing about medicine. One public-domain bulk file, checksum-verified, rebuilt daily.
`images.dmp` carries its own per-row licence and is not read.

The difficulty is collisions, and they are not spread evenly:

- A name is matched only where it resolves to **exactly one taxon**; 43 ambiguous names refused.
- A trailing part word is separated and recorded on its own, so "Curcuma Longa Leaf" is the leaf of
  a plant rather than being the plant.
- A genus match is refused where a compound database already resolved the same name, or where a
  person curated the row as a medicine.
- **A bare one-word row matched to a genus is admitted only for plants, fungi, bacteria, archaea and
  algae.** Checked against all 245 such matches, every wrong one sat in the animals or protists:
  _Lithium_ and _Trachea_ are genera of moths, _Manna_ and _Galanga_ arthropods, _Palmyra_ a worm,
  _Castor_ the beaver, _Ammonia_ a foraminiferan. The 223 inside plants and fungi were right without
  exception. The rule refuses six correct rows along with the seven wrong ones, and that trade is
  the right way round: a page missing a lineage is a smaller failure than a page saying lithium is a
  moth.

### When two sources name different organisms

A second source now reaches the same rows by a different route: the substance registry carries a
taxonomy cross-reference on the record the row was _identified_ as, while the match above works from
the row's _name_. Thirty-one rows ended up with two identifiers. That disagreement is not one thing:

- **Retired** (12 rows) — the cross-reference is no longer a live node. Hepatitis C virus is 11103
  in older records and 3052230 since the virus was renamed _Orthohepacivirus hominis_. Same
  organism, stale pointer.
- **A rank apart** (11 rows) — one sits above the other. The _Euphorbia_ genus above _Euphorbia
  hirta_; _Zea mays_ above _Zea mays_ subsp. _mays_. Different precision, not disagreement.
- **Genuinely different organisms** (12 rows) — two organisms in different parts of the tree that
  share a name. Cowslip is _Primula veris_ in England and _Caltha palustris_, a different family,
  in American usage. Lungwort is _Pulmonaria officinalis_, a flowering plant, or _Lobaria
  pulmonaria_, a **lichen**. Mugwort is _Artemisia vulgaris_ or _Artemisia douglasiana_.

The first two keep the recorded organism — it carries the lineage a reader sees — and drop the
pointer, because a link that resolves to a different page than the organism beside it is worse than
no link. The third drops the organism and keeps the pointer: it was matched from a name, a second
identity-based source contradicts it, and the honest position is that this corpus does not know
which plant the row means.

`scripts/background/reconcile-organism-identity.ts` decides this and **must run after**
`build-source-material.ts`, which regenerates the cross-references it prunes.

This is deliberately not an engine rule. Telling a retired node from a different plant needs NCBI's
node and merge tables; the engine is deterministic, self-contained code that has no access to them
and must not acquire it. A rule that called all thirty-one a contradiction would be wrong about
nineteen, and a rule may not be wrong in the direction of accusation. The engine checks only what an
identifier can settle on its own: two _substance_ identifiers that differ name two different
substances, because the registry issues one per substance and there is no hierarchy to be at
different heights of.

### Identity before name

Where a product's own label declared which registered substance a row is, that identifier now
selects the registry record and the row's name is not consulted. A name match is an inference from a
string; a label is the product stating what is in it. They disagreed on **158 rows**. "Aconite" is
the case to remember: the label declares _Aconitum napellus_, the plant, while the row's name matches
a different registered substance called ACONITE. Both registry entries are real, so nothing was
malformed and no per-module check could see it — the material of one substance was simply sitting on
a page that meant another. Resolving by identity also reached **416 rows** whose declared substance
no name in the registry matched.

## A header line was a medicine

`data/drugs` held a row with slug `header` and name `Header`: a CSV header line ingested as if it
were a substance, 24 fields with every content field empty, served at /d/header. Eight independent
sources were asked about it — the label archive, the product directory, the application register,
the substance registry, the taxonomy, the supplement vocabulary, the compound database, the pricing
file — and none recognised it. That unanimous silence is what identified it, not a guess about the
word.

The same scan flagged `Date`, and `Date` stayed: the supplement database files it as Date Palm and
FDA's registry resolves it to _Phoenix dactylifera_. A rule that rejected spreadsheet-shaped words
would have deleted a real botanical. Coverage answered a question a word list could not.

The cause was that `PUBLIC_PLACEHOLDER_MEDICINE_SLUGS` — the guard that exists to catch exactly this
— listed `unnamed` and `tbd` but not `header`. It now covers words that describe a table rather than
a substance, every one checked against the live corpus first, and
`tests/unit/ingestion-artifacts.test.ts` fails if any corpus row would be rejected by it.

Three further rows were truncated ingredient names rather than substances. Two were completed on
evidence and the original spelling kept as an alias, so the completion is recorded rather than
substituted: `Butyloctyl` → **Butyloctyl Salicylate**, the only one of five registry candidates with
a marketed product, and `Diethylamino Hydroxybenzoyl Hexyl` → **Diethylamino Hydroxybenzoyl Hexyl
Benzoate**, the only real completion in the registry. Both matched a marketed product immediately
afterwards, which is the check that they were right.

`Ethylhexyl` was left alone. Its 69 registry candidates are led by Ethylhexyl Salicylate at 40
marketed products and Ethylhexyl Methoxycinnamate at 36 — two common UV filters, four products
apart. There is no likeliest completion there, and putting one substance's data on a page that may
mean the other is the mis-attribution this record model exists to prevent.

## Bulk before polling, always

Two rate-limit incidents against the supplement label database had one cause, and it was never
concurrency. It was the shape of the work: one keyword search per corpus row, 9,772 of them, most
asking about names the database has never heard of. A run lock stopped a second copy and left that
untouched.

The database publishes its own vocabulary. `/v9/ingredient-groups?method=by_letter` returns every
ingredient group starting with a letter, with its category and every label spelling — **27 requests
for 6,467 groups and 78,788 spellings**, against 9,772 searches for the same information, most of it
negative. Names the database does not hold are never asked about at all.

And the reason none of it was visible:

> **The refusal arrives as HTTP 200 with an error object in the body, not as 429.**

Code checking `response.status === 429` saw a successful response containing an empty result,
recorded "this ingredient has no marketed labels", and carried on. The circuit breaker never
tripped because nothing ever looked like a failure. Runs appeared to progress while recording
nothing, and names cached as answered had never been asked.

The rule this produced, applied to every source since: **a bulk download beats an API, and where a
source has one the API route is deleted rather than kept as a fallback.** Everything added in this
pass is a bulk file — the product directory, the application register, the substance registry, the
taxonomy, the pricing file. None of them can rate-limit anyone.

## What the record now holds beyond the label

| Module                 | Source                 | Rows  | What it answers                                                  |
| ---------------------- | ---------------------- | ----- | ---------------------------------------------------------------- |
| `productListing`       | openFDA NDC directory  | 5,996 | What is on the market, how it got there, its forms               |
| `supplementIngredient` | DSLD vocabulary        | 3,887 | How the supplement database files and classifies it              |
| `sourceMaterial`       | FDA substance registry | 5,644 | Chemical, protein or organism — and which part of which organism |
| `biologicalIdentity`   | NCBI Taxonomy          | 3,013 | What organism it is and where classification places it           |
| `regulatoryApproval`   | Drugs@FDA              | 2,505 | When a product containing it was first approved                  |
| `costContext`          | CMS NADAC              | 626   | What a pharmacy pays to buy it                                   |

Two of those carry a gate worth naming. `pharmacologicClassesAsRecorded` is read only from products
declaring one active ingredient, because the directory attaches a combination's classes to the
combination — a glyburide-and-metformin tablet carries both "Sulfonylurea" and "Biguanide", and
reading either off it would file glyburide as a biguanide. And a recorded plant part must name the
organism it is a part of: "leaf" alone states half a fact and invites a reader to supply the rest.

## Sources considered and not used

Investigated against this corpus's actual gaps, with their licences read rather than assumed:

- **Kew Medicinal Plant Names Services** holds plant part alongside 283,636 herbal and common names,
  has no published licence, blocks `ClaudeBot` in `robots.txt`, and reserves rights under EU DSM
  Article 4. Unlicensed and copyrighted is worse than a stated restrictive licence, because there is
  nothing to comply with. **Routed around rather than negotiated:** FDA's substance registry carries
  the plant part, the parent organism and the material class as a US Government work, and carries it
  better, because it is the registry the labels themselves are keyed to. 2,142 rows now hold a part
  the registry states rather than one inferred from a name.
- **DailyMed** carries SPLs that openFDA's endpoint drops — 75 of 90 allergenic SPLs — and is the
  only source of structured homeopathic potency. Its licence is contested: data.gov states ODbL 1.0
  for this service, NLM's policy states public domain with a carve-out for content submitted by
  companies, and an SPL is authored by a labeler. Not resolvable from published documentation, so it
  is not ingested.
- **ChEBI** ships a CC BY 4.0 licence file whose neighbouring README says CC BY-SA. Not ingested
  until EBI answers which governs.
- **PubChem sections sourced from DrugBank (CC BY-NC), T3DB, KNApSAcK and NPASS** are dropped at
  parse time rather than filtered later.

A first investigation lost six of seventeen agents to structured-output retry failures, leaving
GBIF, ChEMBL, Wikidata/ATC, MeSH and USDA FoodData uninvestigated. The cause was the schema: eleven
fields, several long free text, asked of agents that had just spent a hundred tool calls on
research. Re-run with plain-text reports against a strict template — text cannot fail validation —
**all twenty-five agents completed.** That investigation produced the bulk routes above, and its
remaining recommendations (EMA, Health Canada, WHO Essential Medicines, ATC via NLM) are the next
tranche rather than open questions.

## Every stored module reaches a reader

A module that is stored, validated and never rendered does not exist for a reader. `supplementMarket`
was recorded for hundreds of medicines, passed the engine on every one, and reached no page: the view
model had no projection for it. `sourceConsensus` — the strongest thing this corpus can say about a
value, that fifty-nine labels agree on it — was invisible the same way, as were `composition` and
`recordedUses`. Every test asked whether a module was correct; none asked whether it was reachable.

`tests/unit/background-modules-reach-the-page.test.ts` reads the envelope's own field list out of the
type declaration and fails if a field has no projection or no section, so the next module added is
caught by the check that caught these.

The four registries the corpus reads at runtime are version-controlled for the same reason. Three of
them were gitignored, so the deployed corpus was assembled without them and held a third of the
records this repository can produce while every local check passed on a machine that happened to have
the files. `tests/unit/corpus-registries-ship-with-the-code.test.ts` fails if one goes missing.

## Polarity: what a label denies

Roughly three quarters of the role-bearing sentences in this corpus are negative findings —
"abacavir does not inhibit human CYP3A4, CYP2D6, or CYP2C9" is a real result from a real study. A
parser that matched the verb and ignored the negation recorded every one of them as the opposite of
what the label said, and 2,028 signals were inverted this way before it was caught.

Roles now carry `polarity`, so a denial survives as a denial: 700 asserted, 1,511 negated, and 2,015
counterparties recorded with no role at all because the sentence both asserts and denies and which
negation scopes which name is not something a parser can decide. `I_INTERACTION_POLARITY_MISSING`
makes a role without polarity a validation failure, because a role recorded from "does not inhibit"
and shown as "inhibits" states the opposite of its own source.

Roles are also read only from descriptive sections. 21 CFR 201.57(c)(8) makes Section 7 the place
for clinically significant interactions and the instructions for preventing them; a role taken from
there is inferred from regulated advice rather than stated as a property.

## Diagram projections

`lib/background/diagram-projections.ts` turns the corpus into typed, renderer-agnostic views.
Three rules keep a drawn chart as honest as the record behind it: a point exists only when the
underlying value carries a machine-readable number, code or ordered step; every point carries the
source that was fetched for it, so a tooltip can show the exact excerpt; and a record missing the
typed field is absent from the projection rather than estimated onto it, with coverage reported
so a chart can state how much of the corpus it draws.

| Projection               | What it draws                                                                                | Anchored on                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `durationOfActionScale`  | Every recorded half-life on one logarithmic hour axis, with deterministic bands              | `pharmacokinetics.halfLife.numeric`                                                 |
| `bodyRegionAtlas`        | The corpus inverted into body regions — which medicines act where, and what each source says | `anatomyTargets[].regionCode` + vocabulary coordinates                              |
| `exposureTimeline`       | One medicine's peak, half-life and derived steady-state marks on an hour axis                | numeric half-life, with `derived` flagged per marker                                |
| `titrationLadder`        | The recorded escalation schedule as ordered rungs                                            | `titration.steps`                                                                   |
| `completenessMatrix`     | Which modules each record actually holds, and corpus-wide shares                             | module presence                                                                     |
| `sourceComposition`      | The dataset's provenance profile by source kind                                              | every recorded `source`                                                             |
| `metabolicPathwayIndex`  | Which recorded medicines each named enzyme appears in, inverted for a network view           | enzyme names inside the verified excerpt of `pharmacokinetics.metabolismAsRecorded` |
| `handlingNetwork`        | A bipartite network of medicines and the enzymes or transporters a source named for them     | `interactionSignals[]`                                                              |
| `evidenceGapMatrix`      | How often the corpus answers, declines to answer, or says nothing for each group             | `populationStatements[]` and their absence                                          |
| `sharedReactionIndex`    | Reactions more than one medicine records as most common, each on its own printed threshold   | `commonAdverseReactions.eventsAsRecorded`                                           |
| `sizePersistenceScatter` | Molecular weight against half-life, every point checkable against two quoted sentences       | `molecularIdentity.molecularWeight.numeric` + `pharmacokinetics.halfLife.numeric`   |

The pathway index reports strictly what labels name. Sharing a metabolic route is a recorded fact
about metabolism, never a statement about interactions, safety, or what anyone should do — an
enzyme is indexed only when its name appears in the fetched excerpt, so the token is one a source
actually printed rather than a summary's paraphrase.

The comparative projections are what a normalized corpus makes possible and a per-medicine scrape
does not: one schema, one unit, one controlled anatomy vocabulary across every record. A medicine
whose half-life was published only in days never appears on the hour axis, because the dataset
does not convert a value its source did not state.

## Authoring a new batch

Fetch artifacts, structure only what they support, store the excerpt beside every number, compute
derivations by calling the derivation functions, and keep `npm run check:medicine-content` at
zero findings. The authoring rules header in `scripts/seed-data/background/index.ts` is the
contract; independent re-verification against the live sources belongs in review, not in the
author's own run.

The `evidenceGapMatrix` is the projection a reader cannot get anywhere else. Any medicine site will
show what a label says about children; none of them show how much of the corpus never addresses the
question at all. Silence and a stated negative are counted separately and never merge into one bar,
because "the source says effectiveness was not established" and "the source says nothing" are
different facts about the evidence.
