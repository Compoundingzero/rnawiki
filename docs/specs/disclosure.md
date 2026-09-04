# Progressive disclosure (Phase 4) — one page, newcomer to expert

**Status:** designed 2026-09-04 (Fable), on the real field models. Verifiable on a rendered page.

## Base state (what a newcomer sees without doing anything)

Plain language only. Every item below is a question block in the Wikiwand pattern (badge, serif
question, hairline, at most two short paragraphs, provenance anchor per paragraph) and appears
**only if its data is present**:

1. **Does any human data exist?** — from field 5: "Yes: the largest human trial enrolled {N} and the
   longest ran {duration}" or "No human study is recorded". Never a placeholder.
2. **Where on the organism ladder?** — field 2 rendered as a horizontal ladder of the eight rungs;
   rungs with evidence filled and named ("mouse: lifespan"), rungs without evidence drawn empty
   (this is markup, so an empty rung is not prose and not a "not recorded" line).
3. **What dose was studied?** — field 9/registry dose text verbatim, prefixed by the organism and
   route: "In mice: 14 ppm in chow from 9 months (ITP)". Never a suggestion.
4. **Did trials stop?** — seed 3 count and the registry reasons.
5. **Could one person measure it?** — seed 2, **only** outside suppression; otherwise absent.
6. **Supervision statement** — suppressed compounds only: the regulator's classification, as fact.

## Revealed layer (one step, no reload)

One control per block, "Show the evidence", implemented as a native `<details>` whose summary is the
plain-language line; opening it reveals the technical rows beneath the same question. Keyboard
operable, no script required, the URL fragment addresses the block. Contents by block:

- per-trial outcome measures with enrolment, phase, status, NCT id, primary endpoint, completion
  date (fields 5, 11, 14);
- kinetics rows (field 9: half-life, Tmax, metabolism, bioavailability with units and source);
- interaction rows (field 10) and the stack graph rows (seed 5);
- ITP cohort table (field 3: dose, age at start, sex, outcome verbatim, publication);
- citation graph and provenance timeline (seed 8) with DOIs/PMIDs as links;
- registry identifiers (UNII, ChEMBL, CID, CAS, RxCUI) in a labelled technical disclosure;
- FAERS counts (field 15) with the spontaneous-reports label as markup.

Technical vocabulary only inside the revealed layer. Each revealed row carries its source date and
last-verified date (R9) as attributes rendered in a small grey line, once per row group.

## What is never on the page

A placeholder for an absent field; a section heading with nothing under it; a protocol, dose
suggestion, or "safe/effective" phrasing; a related-compound sentence (relations are markup); a
vendor, retailer or affiliate link.
