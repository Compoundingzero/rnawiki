# RNAwiki

**The open drug evidence audit layer.** Live at [rnawiki.com](https://rnawiki.com).

Every medicine gets one page that answers four questions in plain English: what it is, how it
actually works inside cells, what the research measured versus what people infer from it, and what
the raw chemical synthesis costs against what the pharmacy charges.

Anyone can edit. Every edit is checked by a deterministic engine before a human ever sees it.

---

## What makes it different

**The evidence audit.** A dossier does not just describe a drug. It separates what a trial
_measured_ from what is _inferred_ from it, records what _failed_, and notes where the field
_changed its mind_. A page with only good news is not an audit.

**Deterministic verification, not generative AI.** Every proposed edit runs through
`lib/rna-intelligence/` — three layers of published, reproducible science:

| Layer              | Checks                                                                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 · Sequence       | A/U/C/G alphabet enforcement, thymine transcription, triplet reading frame, start and stop codons, open reading frames, premature stops, exact molecular weight from composition, a real SMILES tokenizer with Hill-notation formulae |
| 2 · Thermodynamics | Zuker-style O(n³) folding over the published Turner 2004 nearest-neighbour parameters — real minimum free energy in kcal/mol and dot-bracket notation — plus Lipinski and Crippen descriptors for small molecules                     |
| 3 · Protocol       | Laboratory workflows as a directed acyclic graph: duplicate ids, dangling dependencies, cycles via Kahn's algorithm, and phase progression along every edge                                                                           |

Same input, same report, same verification hash. No model is involved, and none may be introduced.

**Instant rejection beats moderation.** An edit that fails the engine is blocked immediately with a
diagnostic, before any trust check. A steward cannot publish a structurally broken structure.

**The physician badge is earned.** Submitting credentials sets `pending`. A human steward approves.
Nothing in the application can write `verified` on a user's own behalf.

---

## The corpus

Two populations, and the difference is visible on every page.

**Ingested stubs — 10,000+ substances.** Every FDA-registered active moiety and NIH-listed
supplement ingredient, built from openFDA Drugs@FDA (29,270 applications), the NDC Directory
(137,198 products), 261,885 SPL labels, PubChem, and the NIH Dietary Supplement Label Database.
Real names, sponsors, approval years, brand names, indication text and chemical structures.

Ingestion authors **no narrative**. Verdicts, mechanisms, pricing and alternatives are empty on
every ingested row, and the loader refuses to overwrite a curated dossier. A field with no source
stays null and the page says so.

**Curated flagships.** Hand-researched dossiers in `scripts/seed-data/`, with mechanism carousels,
cost transparency, evidence-backed alternatives and cited audits. Every citation is a real,
checkable DOI, PMID, NCT number or regulatory URL, verified at research time.

---

## The data is open

Every medicine on the site is published as data in [`data/`](data/), regenerated from the live
database daily by [a scheduled job](.github/workflows/publish-dataset.yml). Newline-delimited JSON
plus a flat CSV, with a SHA-256 for every file in [`data/manifest.json`](data/manifest.json).

**CC BY-SA 4.0.** Take it, check it, re-run the sums, disagree, publish. A claim you cannot check
is not evidence, and that directory is what makes the rest of this checkable.

`data/` is a snapshot and is overwritten wholesale on every export, so pull requests against it are
closed unread. Every edit goes through the automatic check and, for most contributors, a human
reviewer — and the only place that happens is rnawiki.com. A second way in through GitHub would be
an unchecked one. To change what is in the dataset, [edit the page](https://rnawiki.com/browse).

Corrections to the pipeline itself are very welcome as pull requests. That is code, and it lives
outside `data/`.

Field-by-field notes: [`data/dictionary.md`](data/dictionary.md).

## Contributing

1. Sign in and edit any dossier.
2. The engine sweeps your structure and protocol as you type. A failure is a diagnostic, not a
   rejection letter — it names the rule and the observed value.
3. A passing edit is routed by trust tier. New contributors land in the
   [public review queue](https://rnawiki.com/review-queue); trusted editors publish directly.
4. Accepted edits earn tier. Every revision is immutable, timestamped and attributed to your
   profile and, if you supply one, your ORCID iD.

| Tier        | Accepted edits | Publishes                    |
| ----------- | -------------- | ---------------------------- |
| New         | 0              | via review queue             |
| Contributor | 3              | via review queue             |
| Trusted     | 15             | directly                     |
| Steward     | 60             | directly, and reviews others |

---

## Running it

```bash
cp .env.example .env        # DATABASE_URL, SESSION_SECRET (>= 32 chars)
npm install
npm run db:migrate
npm run ingest:download     # ~1.9 GB of public source data, resumable
npm run ingest              # build the corpus (--dry-run to preview)
npm run ingest:structures   # resolve chemical structures from PubChem, resumable
npm run db:seed             # the curated flagship dossiers
npm run dev
```

`npm run gate` runs typecheck, lint, unit tests, integration tests and the production build. Run it
before pushing, and don't weaken it to make a change pass.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript 5.7 strict · Tailwind v4 · Drizzle ORM on Postgres ·
iron-session · Vitest · Playwright. Deployed on Railway.

## Licence

Code AGPL-3.0. Data CC BY-SA 4.0 — see `LICENSE` and `LICENSE-DATA`.

**RNAwiki is a public evidence record, not medical advice.** Talk to a clinician before changing any
treatment.
