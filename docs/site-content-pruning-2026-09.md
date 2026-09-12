# Site content pruning, September 2026

What was taken off the public site alongside the community-review work, why, and what a reader who
wanted it gets instead. One row per changed route or footer item.

The test of whether something belongs on a public page used here: does it help a real reader
finish something? A page that restates a rule the evidence surface already states in context, or a
control in the furniture of every page that nobody came for, fails that test even when every
sentence on it is true.

---

## Routes

### `/editorial-policy` — **removed and redirected**

|                         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Previous purpose        | Six numbered policies: programme scope, exact saved sources, people judging meaning, unknown staying unknown, corrections preserving history, and analytics requiring a visitor choice.                                                                                                                                                                                                                                                                                      |
| Why it was noise        | Five of the six restated rules the evidence surface already states where they apply. A medicine page marks every sentence with its origin, keeps `UNKNOWN` distinct from `NOT_MEASURED`, and shows its correction history; a separate page asserting that this happens is a promise where the product already shows the behaviour. It also had no unique task: a reader arrived, read six paragraphs and left.                                                               |
| The sixth policy        | The analytics paragraph was the only prose on the entire site saying what is measured, what is excluded and that the choice can be changed. That is a privacy disclosure, and it moved to `/privacy` rather than being deleted.                                                                                                                                                                                                                                              |
| Action                  | Route deleted. The review content was expanded — not copied — into `/how-it-works#review-and-corrections`, which now explains sources, evidence states, member proposals, the three-member rule, the qualified-reviewer requirements, the automatic checks, corrections and version history.                                                                                                                                                                                 |
| Redirect                | `next.config.mjs` → `{ source: '/editorial-policy', destination: '/how-it-works#review-and-corrections', permanent: true }`. Verified: `308` with the fragment in the `Location` header.                                                                                                                                                                                                                                                                                     |
| User-facing replacement | `/how-it-works#review-and-corrections` and `/privacy`.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| SEO effect              | The URL is in the live sitemap and in `data/revamp/baseline/sitemaps/pages.xml`, so it is indexed. A permanent redirect passes its signals to a section that answers the same question rather than returning 404. Removed from `lib/corpus/sitemap.ts`, `app/llms.txt/route.ts`, `app/definitions/page.tsx` and `lib/public-datasets.ts` (both the `correctionHref` literal type and the `CORRECTION_HREF` constant, so every dataset manifest now points at the live page). |
| Legal / privacy check   | Passed only because the analytics disclosure moved. Deleting the route without `/privacy` would have removed the site's sole statement of what analytics collects.                                                                                                                                                                                                                                                                                                           |

### `/privacy` — **added**

|                 |                                                                                                                                                                                                                                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Why             | The right to change or withdraw the analytics choice had to survive the removal of the footer control, and the control needed somewhere with the explanation beside it.                                                                                                                                          |
| What it carries | What Google Analytics is allowed to see and what is excluded; that nothing loads before consent; that Global Privacy Control and Do Not Track are honoured without asking; that withdrawing expires the analytics cookies immediately; the control itself; and what an account records when someone contributes. |
| Indexing        | Self-canonical, indexable, in the sitemap at a low priority.                                                                                                                                                                                                                                                     |

---

## Footer

Both implementations — `components/SiteFooter.tsx` for React pages and
`components/document/DocumentFooter.tsx` for every plain-HTML document route, which includes all
10,250 medicine pages — now render one shared list, `lib/site-footer-links.ts`. They had already
drifted: the document footer carried a seventh item the React one did not, and a script appended an
eighth to it at runtime depending on whether analytics was configured.

### Before

Browse all medicines · Compare by target, class or pathway · Public datasets · How this works ·
Editorial policy · Review queue · _(document only)_ Sign in on the front page ·
_(appended by script)_ Analytics choices

### After

Browse medicines · Compare · How RNAWiki works · Review and improve · Privacy

| Item                                | Action                                  | Why                                                                                                                                        | Replacement                                                                                             |
| ----------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Editorial policy                    | Removed                                 | See above.                                                                                                                                 | `/how-it-works#review-and-corrections`, reached from the footer's own "How RNAWiki works"               |
| Analytics choices                   | Removed                                 | A consent control in the furniture of every page, with no explanation of what the choice covered.                                          | `/privacy`, which carries the same control and says what it does                                        |
| Sign in on the front page           | Removed                                 | A link to the home page describing what to do once you got there. Never present on the React footer, so the two footers disagreed.         | The header's account control, on every React page                                                       |
| Public datasets                     | Removed from the footer, route retained | Serves researchers, not the primary reader at the foot of every page.                                                                      | Linked from `/how-it-works#review-and-corrections` and reachable from a medicine page's technical layer |
| Browse all medicines                | Kept, renamed to "Browse medicines"     |                                                                                                                                            |                                                                                                         |
| Compare by target, class or pathway | Kept, renamed to "Compare"              | The long label described the mechanism rather than the task. `docs/specs/hubs.md` §3 requires `/h` to stay reachable from site navigation. |                                                                                                         |
| How this works                      | Kept, renamed to "How RNAWiki works"    |                                                                                                                                            |                                                                                                         |
| Review queue                        | Kept, renamed to "Review and improve"   | "Queue" named an internal artefact. The page is now where a member suggests wording as well as where work waits.                           |                                                                                                         |
| Privacy                             | Added                                   |                                                                                                                                            |                                                                                                         |

Every footer link now has a 44-pixel target in both implementations, which neither had before.

The trust lines are unchanged and each remains true: "RNAWiki.com · Public medicine evidence",
"No advertising · Free to read", and the not-medical-advice sentence.

---

## The preliminary-review banner

Not a route, but the largest single piece of removed public content: a bordered block roughly 160
pixels tall at the top of 10,247 of 10,250 medicine pages.

|                  |                                                                                                                                                                                                                                                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Previous purpose | Telling a reader that nothing on the page had been signed off.                                                                                                                                                                                                                                                                    |
| Why it was noise | It repeated, once per page, what every sentence on the page already says for itself — each statement is marked as a reviewed conclusion, an approved answer, a source-linked record, a quotation, a count or an absence. It took the first screen, pushed the answer down, and made an honestly source-linked record look broken. |
| Action           | Removed for the `preliminary` and `limited` states. Still rendered for `correction_hold` and `pipeline_failure`, which are the page saying something is wrong with itself. A limited record keeps its one explanatory sentence as ordinary quiet text beside the review control.                                                  |
| Replacement      | A small control reading "Review or improve · 0/3", linking to the review work for that page.                                                                                                                                                                                                                                      |
| Internal state   | Unchanged. `publication.bannerRequired`, `publication.indexable` and `mayShowConclusions` still mean what they meant, and the corpus validation still reads them. Only the presentation moved.                                                                                                                                    |

The repeated forty-word provenance paragraph under each statement became a short line
("✎ Source-linked record"), with the full explanation one click away in the disclosure that already
held the sources.

---

## Candidates considered and kept

| Route                                                                                           | Decision                        | Reason                                                                                  |
| ----------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------- |
| `/how-it-works`                                                                                 | Retain                          | It is the one page that explains the method, and it now carries the review section too. |
| `/datasets`, `/datasets/[dataset]`                                                              | Retain, demoted from the footer | A real researcher task with a licence and an export path.                               |
| `/definitions`                                                                                  | Retain                          | Explains terms the evidence surface uses; linked from dossier pages.                    |
| `/review-queue` and its sub-queues                                                              | Retain                          | Working surfaces with an audience and a task.                                           |
| `/browse`, `/h`, `/goals`, `/c`, `/t`, `/u/[handle]`                                            | Retain                          | Navigation and discovery a reader uses.                                                 |
| `/llms.txt`, `/robots.txt`, `/sitemap.xml`, `/sitemaps/[name]`, `/healthz`, `/indexnow-key.txt` | Retain                          | Operational; not reader-facing prose.                                                   |
| `/legacy-record/[slug]`                                                                         | Retain                          | The forwarding target the medicine route needs for records the corpus does not hold.    |

---

## The check that keeps this

`scripts/quality/slop-scan.mjs` gained two patterns: the `/editorial-policy` route string anywhere
in `app`, `components` or `lib`, and the removed footer labels in the three files that define or
render the footer.

It gained two and not five. The first draft also matched the banner sentence, the repeated
provenance paragraph and the phrase "peer reviewed", and each of those flagged correct code: the
banner label is still the internal name of a publication state, the provenance sentence moved into
a disclosure rather than disappearing, and a peer-reviewed publication is a real source type
RNAWiki cites. Those three are checked where they can be checked honestly — in a browser, against
what a reader actually sees, in `tests/e2e/dossier-v4-community-review.spec.ts`.

`tests/unit/site-footer.test.ts` pins the link set, asserts both footers render from the shared
list, and asserts the redirect and the replacement content exist.
`tests/e2e/site-footer.spec.ts` checks both footers in a browser, follows every link, and confirms
the old URL still lands somewhere useful.
