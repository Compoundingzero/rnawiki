# RNAWiki

**A public record of medicine evidence.** Live at [rnawiki.com](https://rnawiki.com).

Each medicine page starts with identity and regulatory information. Where programme-based evidence has
been reviewed, it also separates development programmes by indication, population, dose, trial,
and outcome. A conclusion about one programme is never presented as a conclusion about the whole
medicine.

Signed-in contributors can propose changes. Automated checks run before evidence-changing work is
sent for human review.

---

## What makes it different

**One conclusion, one defined use.** A medicine can be studied for several conditions, doses and
groups of people, with different results. A reviewed conclusion therefore belongs to one
development programme. It does not silently become a conclusion about every use of the medicine.

**Fixed checks, not generated medical text.** RNA Intelligence is ordinary, versioned software. It
checks stored structures, sources, dates, units, trial links, evidence support and conclusion scope.
Within one engine version, the same stored input and reference date produce the same findings and
SHA-256 digest. It does not use a language model, write medicine facts or decide whether a treatment
works.

The complete evidence checks run when a programme conclusion is prepared and again inside its
publication transaction. Smaller workflows use smaller checks suited to their job: the contribution
form checks the submitted field and source, the ClinicalTrials.gov monitor checks registry changes,
and ingestion checks recorded chemical or sequence structure where applicable. A passing check
means the record is internally complete enough for a person to assess. It is not proof of benefit or
safety.

**Publication is tied to the reviewed version.** A programme conclusion can become public only when
its complete stored evidence record passes the checks and two eligible people independently review that
exact locked version. Both may approve it. If they disagree, a different qualified steward must
make and explain the final decision. Changing that record makes the earlier decisions unusable.
Contributor rank does not bypass this gate.

**One account, attributed work.** RNAWiki has one signup and sign-in path. Every signed-in account
can post community notes and submit the sourced changes supported by a medicine page. The server
derives the author from the authenticated account instead of accepting an author from the request.
Notes remain separate from evidence; edit drafts remain private until submission and never publish
themselves. Trust standing and scientific-review qualifications are additional permissions on the
same account, not separate account types.

---

## The corpus

Two populations, and the difference is visible on every page.

**Ingested records.** The corpus contains thousands of medicine and substance records assembled
from openFDA Drugs@FDA, the NDC Directory, SPL labels, PubChem and the NIH Dietary Supplement Label
Database. The live count and the number moved to programme-based evidence are shown on
[How this works](https://rnawiki.com/how-it-works).

Ingestion authors **no narrative**. Verdicts, mechanisms, pricing and alternatives are empty on
every ingested row, and the loader refuses to overwrite a curated dossier. A field with no source
stays null and the page says so.

**Older curated dossiers.** Some records contain hand-written medicine-wide summaries from the
earlier data model. They remain visibly separate during the move to programme-based evidence. A DOI,
PMID, NCT number or regulatory URL is an identifier readers can inspect; its presence is not itself
proof that the surrounding statement is correct.

---

## The data is open

[`data/`](data/) contains a dated public snapshot regenerated from the authoritative database by
[a scheduled job](.github/workflows/publish-dataset.yml). The checked-in files are a repaired legacy
snapshot, so they may not match every current site record or field and still use the earlier
medicine-wide NDJSON and CSV shape. The revised exporter is set to add normalized programme and
current-publication bindings on its next successful run; check the manifest date, limitations and
CSV header before relying on those fields.

In that next-export shape, the saved-source ids cover verdict claims, evidence-step claims, study
interpretability claims, mechanism and timeline claims, and scoped trial registrations. Every
generated file has a SHA-256 in
[`data/manifest.json`](data/manifest.json).

**CC BY-SA 4.0.** Source identifiers, bindings and digests in a snapshot can help readers trace the
stored record. They do not establish that every statement is correct or fully sourced.

`data/` is not a live mirror. Read `generatedAt` in the manifest before using it. The database is
the authoritative source, and this directory is overwritten wholesale on every successful export.
To change what is in the next snapshot,
[propose the change on the site](https://rnawiki.com/browse).

Corrections to the pipeline itself are very welcome as pull requests. That is code, and it lives
outside `data/`.

Field-by-field notes: [`data/dictionary.md`](data/dictionary.md).

## Contributing

1. Create or sign in to the same RNAWiki account used for community notes. On a programme-based
   dossier, choose **Suggest a correction** or **Challenge this conclusion**.
2. Add the exact field, proposed value, source and explanation. The server checks the submission
   against the current stored programme, attributes it to the signed-in account and saves a locked
   copy for review.
3. Two eligible people review that same copy independently. If they disagree, an independent
   steward records a final decision and explains it.
4. An accepted proposal is accepted for implementation; it does not silently rewrite a public
   medical conclusion. Evidence-changing publication still requires the separate programme
   conclusion gate described above.

An older record without an identified programme accepts only a sourced correction to its medicine
name or trade name. Every such correction waits for a different trusted person; no contributor rank
publishes it automatically. Evidence, studies, mechanisms, safety, effectiveness and conclusions
must use the programme-scoped workflow. The
[public review queue](https://rnawiki.com/review-queue) clearly distinguishes these workflows.

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

`npm run gate` runs typecheck, lint, the public-copy check, formatting and migration checks, unit and
disposable-database integration tests, the production build, and Playwright browser journeys. Run
it before pushing, and don't weaken it to make a change pass.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript 5.7 strict · Tailwind v4 · Drizzle ORM on Postgres ·
iron-session · Vitest · Playwright. Deployed on Railway.

## Licence

Code AGPL-3.0. Data CC BY-SA 4.0 — see `LICENSE` and `LICENSE-DATA`.

**RNAWiki is a public evidence record, not medical advice.** Talk to a clinician before changing any
treatment.
