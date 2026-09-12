# Dossier information architecture (v3)

**Status:** implemented 2026-09-10 behind the `DOSSIER_V3_SLUGS` flag for the four gold pages.
Code: `lib/dossier-v3/` (taxonomy, fields, goals, view model, loader, document),
`components/dossier/v3/` (page, sections, labels), `lib/dossier-v3/dossier-v3.css`.

## The three readers, one page

| Reader (time)         | What the page gives them                                                                                                         | Where                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Café worker (10 s)    | what kind of thing, why people use it, best-supported result, most important problem and serious concern, supervision, certainty | Decision Card (`#in-ten-seconds`) |
| New biohacker (2 min) | goal lens, human vs biomarker vs registered-only, who was studied, size, interactions, what to measure, what is unknown          | `#does-it-work` … `#unknowns`     |
| Expert (20 min)       | identity, registration, every stored block, identifiers, relations, sources, index gate, corrections, versions                   | `#deep-evidence`, `#what-changed` |

One continuous, scroll-based page. No tab bars. A compact sticky navigator (eleven links) under the
site header; the existing island script marks the active section because every section carries
`data-corpus-block`. Progressive disclosure is native `<details>`: simple sentence first, "More
detail", then "Technical version", then the deep layer. The goal lens is a set of radio inputs
filtered by CSS `:has()`; without `:has()` every panel shows; no script is required.

## Sections, in order, and what feeds each

1. **In 10 seconds** — `decisionCardFrom`: nine `FieldValue`s each with a completion state, a
   sentence, a basis and sources; the evidence-status label from the strongest reviewed effect
   claim; an analogy only when a reviewed claim carries one with its "where this breaks".
2. **Pick your goal** — `buildGoalLenses`: goals named by reviewed claims (basis `reviewed`) and
   goals whose registry conditions match the fixed keyword table (basis `registered`, labelled
   "registered studies only").
3. **Does it work?** — reviewed effect claims as Evidence Result Cards, grouped by goal, each with
   the outcome letter, evidence class and claim strength; the role-aware registry summary; six
   dimensions read separately; the truth pattern.
4. **How it works** — reviewed `mechanism_stage` claims in order, each with evidence origin; the
   visible boundary where support stops; "What this does not prove".
5. **Safety** — reviewed safety claims and label statements, each with its source layer; the
   spontaneous-report framing above the mention counts; under-represented groups; long-term
   uncertainty.
6. **Interactions** — corpus interaction lines mapped to the seven categories, the absence line,
   the not-safe sentence; the stack checker's categories explained; a note that stack inputs stay
   on the device.
7. **For someone like me?** — populations from reviewed claims; conditions named in registered
   studies; the cannot-determine sentence.
8. **What to measure** — clinician questions for supervised medicines; the structured observation
   plan for eligible low-risk substances; never an amount.
9. **Alternatives** — hub memberships as a comparison set; the not-comparable explanation.
10. **What we still do not know** — `unknownsFrom`: missing populations, long-term data, no
    reviewed conclusion, surrogate-only, conflicting, missing interactions, formulation,
    mechanism, unposted results, claims exceeding evidence.
11. **Deep evidence** — the existing corpus blocks (embedded one heading level down),
    registration, identifiers, relations, hubs, synonyms, sources, the index-quality gate, the
    class glossary.
12. **What changed** — the corrections ledger and superseded/retracted claims, each saying whether
    it altered a public conclusion.
13. **One check before you go** — a single teach-back with supported / not supported answers.

## Data flow

```
corpus_pages + page_* tables ──loadCorpusDossier──▶ CorpusDossier ─┐
reviewed_claims (reviewed only render) ─────────────────────────────┤
dossier_field_states ───────────────────────────────────────────────┤
page_registry_role_aggregates (trial roles) ────────────────────────┼─▶ buildDossierV3 ─▶ DossierV3ViewModel ─▶ DossierV3Page ─▶ static HTML
entity_corrections (ledger) ────────────────────────────────────────┤
page_fields (label warnings, contraindications, report terms) ──────┤
drugs + inventory_resolutions (identity class, legacy indication) ──┘
```

The components never read a table. The view model never reads a table. A pipeline value reaches a
reader only through the view model, which labels it by what it is.

## Flag and rollback

`DOSSIER_V3_SLUGS` = comma list of slugs, prefixes ending in `*`, or `*`/`all`. Unset it and the
next request serves the corpus document; nothing else changes. The route handler decides per
request (`app/d/[slug]/route.ts`). Migration `0034` is additive; rollback SQL is in the audit.

## Design

Light default (`#F5F5F7` ground, `#1D1D1F` ink, `#0071E3` accent), serif headings, 44 rem measure
— the identity the live site has. A calm dark mirror follows `prefers-color-scheme` for the v3
surface only, guarded by `:root:not([data-theme='light'])`, and the explicit `data-theme='dark'`
ramp still wins. Evidence labels are words plus a glyph. Focus rings are 3 px accent. Reduced motion
disables smooth scrolling. No horizontal overflow at 320 px (checked in the browser test).

## Acceptance tests

`tests/e2e/dossier-v3-journey.spec.ts`: café-worker, new-biohacker, expert, structure (one main,
sticky navigator, keyboard disclosures, 320 px, axe WCAG 2.2 AA), goal lens is a filter.
`tests/unit/dossier-v3-view-model.test.ts`: the truth rules on the model.
`scripts/dossier-v3/capture.ts`: screenshots, axe, copy audit, page facts, before/after.
