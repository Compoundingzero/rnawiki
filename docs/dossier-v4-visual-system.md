# Dossier v4 — visual system

`lib/dossier-v4/compass.css`, imported from `app/layout.tsx`. A stylesheet that is not imported
there never reaches the plain document: `documentStylesheetHrefs()` reads only the layout entry of
the build manifest.

## What stays

RNAWiki's identity: a light neutral ground, dark text, one restrained blue, wide margins, almost no
decoration, and a serif for headings. The home page is untouched.

## What changes

|                   | Dossier v3                                           | Dossier v4                                                                |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------------------------------- |
| Canvas            | one 44 rem column                                    | up to 84 rem, with a standing rail                                        |
| Navigator         | a horizontal link list under the header              | a left rail grouped by truth lane, chips on a phone                       |
| First screen      | medicine name, supervision line, nine question cards | one display sentence, why people take it, the strongest result, the limit |
| Section form      | one card shape repeated                              | hero, matrix, stair, path, spine, bands, ladder, receipt                  |
| Registry metadata | in the first screen                                  | at the foot, in a labelled technical disclosure                           |

## Tokens

The compass aliases the corpus ramp for ink and surface, and overrides four values.

| Token             | Value     | Why not the corpus value                                         |
| ----------------- | --------- | ---------------------------------------------------------------- |
| `--dv4-ink-muted` | `#55555a` | `--corpus-ink-2` measures 4.48:1 on this page's ground at 13 px  |
| `--dv4-ink-faint` | `#64646a` | `--corpus-ink-3` measures about 3.5:1 at the same size           |
| `--dv4-accent`    | `#0063c8` | `--corpus-accent` measures 4.31:1 for normal text on this ground |
| `--dv4-caution`   | `#6f571a` | `--corpus-supervision` measures 4.49:1                           |

Together those four failed axe across 47 nodes on the creatine page. The site-wide tokens are left
alone: changing them would move the home page, which this rebuild may not redesign.

One hue per truth lane, used for a rule, a border or an eyebrow bar, and never as the only signal.

## Layout rules that are load-bearing

- Every grid track is `minmax(0, 1fr)`. A bare `1fr` takes its minimum from content min-content
  width, and the navigator's nowrap chip row forced the document to 2128 px at a 320 px viewport.
- The hero is one column until 64 rem. A 12-track grid with a 1.75 rem gap has a minimum width of
  eleven gaps, 308 px, whatever the tracks collapse to.
- The goal matrix is a table at width and re-laid as stacked rows below 55 rem, with each cell
  restoring its own column name from `data-column`. It never scrolls sideways.
- State badges wrap. The longest label measures 322 px on one line.
- Every link in the reader layer is padded to at least 24 px in both directions.

## Accessibility

Semantic heading order from one `h1`. One `<main>`, inherited from the document shell. Native
`<details>` for every disclosure, so the page works with scripting off and the keyboard works
without any code of ours. Visible focus. A text equivalent beside every diagram, which is why the
diagrams are `aria-hidden`: the list next to them says the same thing. Nothing animates on load,
and `prefers-reduced-motion` drops every duration.

## Screenshots

`scripts/dossier-v4/capture.ts` captures 1440x1200, 390x844 and 320x800, runs axe at each width and
audits the reader layer separately from the technical disclosure.

```bash
PORT=3100 DOSSIER_V4_SLUGS=creatine-monohydrate,semaglutide,metformin,inclisiran npm run start
npx tsx scripts/dossier-v4/capture.ts --base http://localhost:3100 --label after \
  --slugs creatine-monohydrate,semaglutide,metformin,inclisiran --out data/dossier-v4/benchmark
```
