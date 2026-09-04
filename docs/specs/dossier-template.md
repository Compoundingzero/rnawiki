# Dossier template (Phase 4) — Wikiwand's question structure, Vercel's rail, Stripe's rows

**Status:** designed 2026-09-04 (Fable) from the verified findings (`data/design-study/findings/
wikiwand.json` B1–B14 and V1–V8; `vercel_com_docs.json`; `stripe_com_docs.json`), the disclosure
spec, the question-derivation rules and the closed decisions. Built by Opus as React components
under `components/dossier/` with Tailwind v4 tokens; no production styling is touched until Gate 2
passes on the seven samples.

## Page types (four) and the stub

| Type               | Model                                            | Body                                                                                                                                       |
| ------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Longevity dossier  | LONGEVITY                                        | question blocks from the derivation rules; the organism ladder is always the second block when present                                     |
| Clinical dossier   | CLINICAL                                         | question blocks; the withdrawn block leads when withdrawn                                                                                  |
| Withdrawn arc      | any model with `withdrawn:true` (Tier 1 by rule) | a dated arc first (approval → signal → withdrawal decision → jurisdictions → what replaced it, each row sourced), then the ordinary blocks |
| Development record | DEVELOPMENT                                      | question blocks (highest phase, why stopped, ever dosed, same-target lineage as markup)                                                    |
| Stub               | any tier with < 3 present fields                 | identity rows + relations + the sentence "This record holds {n} fields" as markup; no questions; noindex                                   |

## Column and shell

- One reading column, **44 rem max (≈ 704 px)**, centred; the measure the Phase 2 references
  converge on (68–86 characters). Wikiwand's 344 px is too narrow for our density (borrow B1/limit).
- Serif for question headings and the h1; system sans for body, rows and chrome. Heading ≈ 1.3×
  body (B14); body 17/28 px; leading 1.65.
- Colour budget on the reading surface (B14): one accent (the badge and the block-boundary glyph),
  body links underlined in the body colour, never blue; the ladder's filled rungs use the accent at
  two tints; the supervision block uses the neutral warning tint from the existing system and no
  red. Light default; dark on the mirrored ramp (tokens `--ink-0…-4`, `--surface-0…-2` mirrored).
- Alternating full-bleed bands only outside the reading column (header band, related band, footer).
- A `~` glyph, centred, between major regions (header → questions → related), never between blocks.

## Header (above the first question, nothing else)

h1 display name (INN) · synonyms line as markup (`<dl>` of kinds, collapsed after three) · the
source/date line: register glyph + register name + last-verified date, **one date format site-wide
(ISO `2026-09-04`)** (B7, V6) · the identity badge triplet as markup, corpus-wide (amended 2026-09-04): evidence tier (from the
registry: human randomised trial / human trial / no human trial recorded, or the LONGEVITY ladder's
kind where present) · top organism rung (the ladder's top rung for LONGEVITY pages; "human" when a
registry trial exists for other models; omitted when nothing is recorded — never "none") · human data
yes/no. The loader writes `top_rung`, `human_data` and `evidence_tier` columns so every model carries
the same triplet. **No lede, no summary card, no key-facts panel, no
promotional strip** (B10, V4). The supervision statement, when suppressed, is the first question
block, not a banner.

## Question block anatomy (B1–B6, B9–B11)

```
[Qn]  Serif question heading? (compound clause — em-dash dispute clause when the data holds one)
      ────────────────────────────── 1 px hairline, the width of the measure
      Paragraph 1: answers in sentence one by restating the question's terms; at most ONE bold
      span, a value inside a sentence; ends with the provenance anchor for the sourced value.
      Paragraph 2: the qualification (organism, N, duration, what was not measured); anchored when
      it states a sourced value, otherwise marked "interpretation" as markup, unanchored.
      ▸ Show the evidence          ← native <details>, one step, no reload (disclosure spec)
```

- Badge: 22 px rounded square, accent fill, white `Qn`, in the left margin 10 px clear of the
  text, **sticky for the life of its block** (B3). Numbering restarts per page.
- Exactly two paragraphs (B2); a third paragraph is a second question (the derivation rules split).
- Provenance anchor: a literal source, never a section of the same page (V5): rendered as
  `[source-glyph] Register/Study id · date` inline at the paragraph end, linking the immutable
  source snapshot (existing `evidence_sources`/`source_snapshots`) and carrying `data-source-date`
  and `data-verified` (B8, R9).
- Uncertainty in ordinary words in the body (B11): UNKNOWN / NOT_MEASURED / MIXED / CONTRADICTED
  are the sentence, not a chip.
- Revealed rows (disclosure spec) use **Stripe's hairline row**: bold label, small grey monospace
  identifier on the same line, value beneath; no borders, no zebra; the one boxed element per page
  is the exact record (identifiers panel) with an all-caps header bar naming it.
- Images (mechanism diagram, trial figure when any): left-aligned to the measure, narrower than the
  measure, italic grey caption centred on the image (B12), caption names exactly what is in the
  frame; never full-bleed inside the column; a break-out rule is not needed at 704 px.

## Contents rail (Vercel, decided)

240 px right rail at ≥ 1024 px, sticky below the 64 px header, listing every question heading
(two indent levels: block, then revealed group); active marker = 2 px left bar + darker ink;
**labels wrap to two lines, never truncate**; the marker is driven by the block whose top crossed
the header line (no lag); at < 1024 px a "Contents" `<details>` sits under the header and returns
as a sticky control at the top after scrolling past it (the Vercel failure designed out). The rail
is markup: it never contributes words to the page's prose measurement.

## Relations and related content (R10)

Relations (`ester-of`, `prodrug-of`, `stereoisomer-of`, `biosimilar-of`, `contains`, `same-target`)
render as a labelled row list under the identifiers panel, never as sentences. Related content
(same target lineage, the ITP reference page, the definitions page) is a two-column card band
after the questions (B13): title, source + date, two preview questions with their own badges. The
page ends in provenance, not conversion (V3): source list (every anchor's source once), revision
history line, licence line as markup, then the shared footer.

## Home page

The search bar is frozen. Around it, the page adopts the tokens above (serif headline, sans
subline, one accent) and replaces the featured card with two markup blocks that need no prose:
the organism-ladder legend as a small diagram (the site's visual signature) and a facet strip from
the browse spec (class · pathway · evidence tier · regulatory status). Nothing sits above or beside
the bar.

## ITP values on the dossier and on /itp

A dose renders only as the source prints it with its unit (the JAX legend's "30 ppm"); a bare
workbook number never renders. Arms are named by the workbook's own arm label.

## Measurable checks for Gate 2 (per sample)

heading order h1 → h2 (questions) → h3 (revealed groups); contrast ≥ 7:1 body, ≥ 4.5:1 grey rows;
keyboard: every `<details>`, rail link and anchor reachable, visible focus ring; 320 px: no
horizontal overflow, badge in-flow (not in a margin) below 480 px; the two text-to-HTML figures
(crawl: server HTML → text; live: innerText/outerHTML) and the RSC payload size before/after —
reducing the inline payload (streaming the revealed rows from the same HTML, no duplicated JSON) is
in scope.
