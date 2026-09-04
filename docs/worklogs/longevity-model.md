# Longevity data model — running log

Track B of the biohacker pivot: a longevity data model over the BROAD corpus of **803 compounds**
(decided by Felix 2026-09-03 — do not re-derive). The shared constraints, editorial rules, legal
gate, stopping rules and delivery order are recorded in full in `docs/worklogs/design-system.md`
under "Mandate — Track A resumed at Phase 3" and bind this track equally. Corpus derivation and
what it misses are in `docs/worklogs/biohacker-pivot.md`.

<!-- RESUME BLOCK — keep at the top, rewrite after every batch -->

## RESUME

**Next step: nothing until Felix's go.** Delivery 1 (Track A visual findings and the revised
Phase 2 table) was made on 2026-09-04 and Track A is stopped; see `design-system.md`. B1 (the 20
unreachable compounds) starts only on Felix's go, and its legal gate runs for every source it will
touch before the first request. One gate finding already binds this track: `api.osf.io/robots.txt`
is `Disallow: /` and `zenodo.org/robots.txt` has `Disallow: /api`, both public REST APIs the mandate
names for B4; Felix decides how B4 reconciles the documented API terms with the robots files. Before B1 fetches anything, the
legal gate (robots.txt and terms, recorded here) must run for every source it will touch.

**Machine state:** `data/longevity/state.json` schema 2 (phase, per-phase cursor, counts,
`completed[]`, `batches[]` with file + sha256 + record count, its own legal-gate record,
decisions); `data/longevity/raw/` (fetched payloads, one file per batch, gitignored). Helpers in
`scripts/longevity/state.ts` (`mutate`, `recordBatch`, `markCompleted`, `phaseDone` — a completed
phase prints "already done" and changes nothing) and `scripts/longevity/status.ts`. Rewrite
`state.json` after every batch through those helpers only; `--force` redoes one deliberately.

```bash
cd "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/RNAwiki-corpus-completion"
npx tsx scripts/longevity/status.ts
```

| Phase | What it does | State |
| --- | --- | --- |
| B1 | Chase the 20 unreachable compounds through PubChem/ChEMBL, DrugBank open data, EMA/Health Canada/TGA/PMDA, WHO INN, the NIA ITP record, Examine.com's citations (not prose), Europe PMC/PubMed, Google Patents, ClinicalTrials.gov by synonym/salt/ester/code/sponsor — logging every attempt; exclude only after all fail, saying which avenues were tried | ⛔ waits on delivery 1 stop |
| B2 | The 13-field longevity model for all 803: hallmark of aging (cited, never inferred); model-organism ladder (yeast → C. elegans → Drosophila → mouse → rat → dog → NHP → human, with evidence kind per rung); NIA ITP as a first-class field (tested; outcome; sex-specific effects; dose; age at start; published result); lifespan vs healthspan vs biomarker vs surrogate per piece of evidence; human evidence ceiling (longest duration, largest N, any aging endpoint at all); epigenetic clock effects naming the clock; dose-response shape, flagging hormetic/U-shaped; pathway (mTOR, AMPK, sirtuin, senolytic, autophagy, NAD+, IGF-1) as stated; kinetics incl. whether the oral form reaches the concentration the positive study used; interactions incl. fasting, caloric restriction, exercise; trial failures with registry reason; biomarkers measured verbatim as a controlled vocabulary; regulatory divergence by jurisdiction. Report the 13-of-13 distribution honestly | ⛔ waits on delivery 2 stop |
| B3 | Study nine community sites (openhumans.org, biohackrxiv via OSF, wiki.biohack.me, Longevity Wiki — verify canonical URL, forum.quantifiedself.com, longecity.org, experiment.com, zenodo.org, sphere.diybio.org): data held, structure, API, licence, terms, what readers get there that a registry cannot give; which are longevity-relevant. Answer in writing what rnawiki holds that none has, and what they hold that rnawiki cannot get | ⛔ |
| B4 | The connective layer, design only: controlled biomarker ontology from B2 field 12; self-experiment submission schema (compound, dose, route, duration, measure, method, baseline, post, concurrent compounds, declared confounders — structured, never ratings or testimonials); per-compound divergence view (trials vs self-experimenters); linkage design for Zenodo DOIs and BioHackrXiv preprints. No submissions section on any page until there is traffic; needs a named clinician or pharmacist reviewer before publication — also the strongest E-E-A-T signal available | ⛔ |
| B5 | Overlap measure with proper controls (other-page and own-text filler, never scrambled tokens): positional and lexical with distributions, pages above target and what they share, the two uniqueness metrics | ⛔ |

<!-- END RESUME BLOCK -->

## Legal and ethical gate — record of what each source permits

Nothing fetched yet. Entries are added here before the first request to each source.
