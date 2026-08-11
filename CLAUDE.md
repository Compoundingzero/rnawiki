# RNAwiki — project briefing

**Owner:** Felix. **Live:** https://rnawiki.com. **Constraint: no camera / no video, ever.**
Free, no paywall, Singapore-targeted (`en_SG`).

> This file was rewritten on 2026-07-28. The previous version described a Next.js 15 + TypeScript +
> Tailwind v4 + MDX + Fuse.js stack, a `/supplement/[slug]` route and a "build order" — **none of
> which was ever built.** If you are reading an older copy of this file anywhere, discard it.

---

## What this actually is

A "wants-first" health/performance wiki and protocol engine. A reader names a **problem** or a
**goal** and gets the movement, the Singapore food, and the evidence-ranked compounds that address
its root cause — with supplements broken down to compounds → pathways → molecular targets.

Explicit competitive target: match or beat Examine.com's coverage, but free and visual where
Examine is paywalled and prose.

**Scale:** ~800 indexed URLs — 170 compound pages, 103 molecular-target pages, 52 protocol pages
(41 problems), 45 `/learn` courses, 16 pathway, 17 muscle, 16 goal, ~107–404 `/compare` (the count
depends on the generator gates), plus indexes.

## The stack — what it really is

**Vanilla JS. No framework, no bundler, no TypeScript, no Tailwind.** Two npm dependencies:
`pg` and `@resvg/resvg-js`. That is the whole dependency tree, and it is a feature — keep it.

```
build/parse.js       reads content/*.md + data/*.json  -> writes site/data.js
build/prerender.js   reads site/data.js               -> writes the static HTML for every route
site/app.js          ~6,600 lines, the whole SPA in one IIFE
site/styles.css      the whole stylesheet
server.js            ~1,800 lines, plain node:http. No express.
db.js                Postgres schema, applied on boot (idempotent DDL)
data/*.json          the content sidecars (see below)
content/*.md         upstream markdown source, read by parse.js at build time
```

**Deploy:** merge to `main` → Railway. The Railway service is named **`RNAwiki`**
(capital R-N-A) — `railway variable list --service RNAwiki`.
**`site/` is ephemeral** — a fresh container, no volume. Everything under `site/` is regenerated
at boot by `prestart`.

**The build is a hard deploy gate.** `prestart` runs parse, prerender, anatomy-asset copy and
precompression with `&&`; a failure stops the deploy. `.github/workflows/release-gates.yml` repeats
the full build, containment, Studio safety, privacy, safety-query and rendered-browser checks before
merge. Do not weaken either gate to make a deploy pass.

**Database:** Railway Postgres. Use `DATABASE_PUBLIC_URL`, not the internal one, from your machine.
Query it by writing a script in the repo root (where `pg` is installed) and running
`railway run --service Postgres node ./x.js`. **Postgres has no PITR.** The only backup is the
GitHub Action in `.github/workflows/`, which pushes to the **private** repo
`Compoundingzero/rnawiki-backups`. Never point it back at this repo — this one is public.

## The two-document rule — internalise this before making any claim

**`curl` returns the PRERENDERED document. A headless browser returns the HYDRATED one. They are
different documents and both are broken in places.**

- Any claim about *what a user sees* needs Chrome
  (`puppeteer-core`, `executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`).
- Any claim about *what Google or an answer engine sees* needs `curl`.
- **~90% of traffic never runs JavaScript**, and there are only ~20 JS-executing sessions/day.
  So rank every defect by **which document it lives in**. A defect in the prerendered document
  outranks a prettier one in the SPA, almost always.
- Do not assume the prerendered document is the degraded twin. On compound resolution it was the
  *more correct* one.

## Rules that are not negotiable

1. **No brand recommendations.** Never name a commercial product or supplement brand as something
   to buy. Independent certification standards (NSF, USP, Informed Sport, IFOS) are fine, framed as
   "look for third-party testing". Naming a drug to identify it — "semaglutide (Ozempic/Wegovy)" —
   is identification, not a buy-rec, and is fine.
2. **Human evidence gets the stars.** Animal-only data is capped at ⭐⭐ and must say "animal".
   *Fixed and gated (2026-07-30).* `parse.js` splits the evidence runs by label, caps animal-only at
   2, and sets `animalOnly`. `assertHumanEvidenceStars()` fails the build if any animal-only compound
   exceeds 2 stars **or** carries a badge that does not say "animal" — verified by reintroducing the
   original bug, which the gate catches (Acarbose and Fisetin at 3). Rapamycin now renders 3 stars
   with `animalOnly=false`, because it does have human data; the 5 stars were the bug.
   **Do not re-report this as live without running `node build/parse.js` first.**
3. **Every molecular claim links to an official source** — NCBI Gene, PubChem, PMC, FDA.
4. **Harm-reduction framing for non-approved compounds.** Document risks plainly, never encourage.
5. **Not medical advice**, on every page — and a real escalation path, not just a disclaimer.
6. **A badge is not a supply classification.** 🟢 means "approved by a regulator", NOT "buy it off
   a shelf". Conflating those is what put "available over the counter — Guardian, Watsons" on
   prescription-only medicines.
7. **Singapore regulatory exposure is real.** The operative regime is the **Medicines Act 1975
   s.51 + the Medicines (Medical Advertisements) Regulations** — wider than the HPA 2007 route,
   5× the penalty, with a prior-permit requirement and **no educational exemption**. Do not
   advertise a prescription-only medicine to the public.
8. **Verify before asserting.** Across five rounds of audit, agent findings that did not reproduce
   appeared in *every single round*. Re-run the check yourself before acting on it. Cite
   `file:line` or a live URL, and label findings verified / inferred / could-not-check.

## The build gates — a fix without a gate is a fix that gets rediscovered

`parse.js` and `prerender.js` refuse to build on: unbound evidence claims · dose calculators with no
machine-readable cap · a protocol prescribing a movement its own page contraindicates · animal-only
compounds above 2 stars or with a badge that does not say "animal" · compounds missing from the goal
taxonomy · a page naming a prescription/controlled substance without stating its status · a
restricted compound rendering self-dosing instructions · JSON-LD missing `@context` · **a link to a
route no page serves, or a page published with nothing linking to it** (`assertLinkGraph`).

Every one exists because that exact defect shipped. **Prove a new gate by reintroducing the original
bug** — `assertLinkGraph`'s first version passed that test wrongly, because it trusted "a file of
that name exists" and `site/` is never wiped between builds. The user-facing list is `/methodology`.

**Adding a prerendered page needs an SPA answer too.** Without one, a crawler gets the page and a
reader with JavaScript gets `notFound()`. Use the `KEEP` sentinel in `app.js`'s `route()` plus
`data-native` on the inbound links (see `/methodology`), or give the route a real renderer.

## Environment gotchas that will otherwise waste hours

- **`grep` here is ugrep** and treats `site/app.js` and the large JSON as binary.
  **Always `/usr/bin/grep -a`.**
- After editing a sidecar in `data/`, run `node build/parse.js` to regenerate `site/data.js`.
- `sso.agc.gov.sg` and `hsa.gov.sg` **work** with `curl -A '<Chrome UA>'`. It is *headless Chrome*
  that gets a 403 there — the reverse of the usual pattern.
- `examine.com`, `jospt.org` and `nice.org.uk` genuinely block. Europe PMC, PubMed eutils, openFDA,
  PubChem and NCBI Gene all work with no key.
- `node --check` will not catch a deleted function that still has callers. **Boot the server**
  (`PORT=8099 node server.js`) and hit a few routes before you push.

## Where the content lives

| file | holds |
|---|---|
| `data/compound_learn.json` | 157 compound learn layers — hooks, mechSteps, myths, evidence, refs |
| `data/bio_learn.json` | bioavailability / contraindications / access for all 170 entries (incl. 13 multi-compound bundles) |
| `data/cause_learn.json` | **224 causes, 995 chain steps, 858 fixes** — the real claim corpus |
| `data/clinical_graph.json` | **216 asserted (compound × root_cause) pairs**, the protocol graph |
| `data/learn_expand.json` | the 45 `/learn` courses (~308k words) |
| `data/target_learn.json` | the 103 `/target` pages |
| `data/protocol_plan.json` | per-problem plan, including the `reassess` clinician-escalation text |
| `data/keystones.json` | 53 keystone habits — the least-hedged object in the corpus, renders as "⭐ START HERE" |
| `content/*.md` | 3,312 lines of upstream source read by `parse.js` — upstream of the stars, badges and categories |

## Current state of the work

The authoritative repository-local state is
[`docs/PRODUCTION_REVAMP_STATE.md`](docs/PRODUCTION_REVAMP_STATE.md). Read it before changing the
navigation, Find, Today, protocols, consent, public profiles, community, sharing or Studio safety.
External Downloads documents are historical context, not the source of truth for shipped code.

The current product spine is **Find → possible reasons → first action → Today → optional full
protocol**. The writing remains valuable; the active work is making its sequence obvious while
keeping safety, evidence and privacy fail-closed.
