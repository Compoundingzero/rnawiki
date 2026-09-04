# stripe.com/docs — Track A1 visual findings (recaptured 2026-09-04)

Stripe's developer documentation. Two pages were captured: a product guide index,
https://docs.stripe.com/payments (files `index-*`), and a content-heavy API reference page,
https://docs.stripe.com/api/charges (files `content-*`), each at 1440x900 and 375x812. Both are
reference material for people who have to find one exact fact — an endpoint, a field name, a type —
inside a large, uniform corpus, which is the closest working analogue in this study to a dossier
made of structured evidence rows. Everything below comes from the images in
`data/design-study/captures/stripe_com_docs/` plus the manifest's `domEvidence`. Nothing was
fetched.

## 0. Capture integrity and banners

**F1.** The `content-*` scroll captures did not scroll. `content-1440-full`, `-tile-01`,
`-scroll-00`, `-scroll-50` and `-scroll-90` are one identical file (sha256 `838be048…`, all
1440x900); the five `content-375` files are likewise one identical file (`c08c8fa1…`, 375x812). The
declared "full page" heights equal the viewport heights, so the API reference page was captured as a
single first screen at both widths. I therefore have **no visual evidence of this site's long
scroll on the content page** and say so rather than describing one. The only genuinely long capture
in the set is `index-375-full.png` at 375x3911. [capture: content-1440-scroll-50.png,
content-1440-scroll-90.png, content-375-scroll-90.png, index-375-full.png]

**F2.** `index-1440-full.png` is also byte-identical to `index-1440-tile-01.png` at 1440x900 — the
desktop guide index was captured as a first screen only, not a full page. Desktop below-fold
behaviour on the guide page is unobserved. [capture: index-1440-full.png, index-1440-tile-01.png]

**F3.** No consent banner obscures any capture. `bannerActions` records "banner stands in the
captures" for three passes, but the controls it lists as the ones it found (Overview, Accept a
payment, Copy for LLM, Introduction, Authentication…) are ordinary page navigation links, and
`domEvidence.stickyOrFixed` records `.CookieBanner` at `height: 0`. The entries are a decliner that
found no refusal control, not a visible overlay. Nothing in these images should be discounted as
banner. [capture: index-1440-full.png, content-1440-full.png]

## 1. Visual hierarchy

**F4.** *(qualified in verification.)* On the guide index the order is: page title, then subtitle,
then section heading, then card titles. The first three steps are done with size and weight on one
near-black ink: "Payments" is roughly double the body size and heavy, the subtitle sits directly
under it at about 20 px in the same dark ink but regular weight, and "Get started" / "Payment
options" are heavy again at an intermediate size. The last step is not: card titles ("Accept online
payments", "Create a subscription") are carried in link blue at ordinary size, not by a further
size or weight step. [capture: index-1440-full.png, index-375-tile-01.png]

**F5.** *(qualified in verification.)* In the **guide index's** content column blue means "link",
and there a reader can scan for blue and get a list of where they can go next ("Find your use case",
"Accept online payments", "Create a subscription"). On the **API reference** blue is no longer
reserved: it also marks `GET` method words beside green `POST`, the "Yes" / "No" helpfulness
controls, and string and null tokens inside the JSON panel. The scan-for-blue habit works on the
guide page only. [capture: index-1440-full.png, index-375-tile-02.png, content-1440-full.png]

**F6.** *(qualified in verification.)* On the API reference the heading ladder does no work:
"Charges" and "The Charge object" render at the same size and weight, so a section and the object it
documents rank equally, and what separates one endpoint from the next is a full-width horizontal
hairline and a consistent left edge, not a bigger heading. They are, however, clearly larger than
the field names — roughly twice the size of the bold monospace `id` and `amount` — not "only
slightly larger". `domEvidence.headingOutline` confirms the page skips h2 entirely (h1 → h3), so the
structure is expressed by rules and rhythm rather than by a heading ladder; see V3 for why that is
not borrowable. [capture: content-1440-full.png]

**F7.** Inside a data row the hierarchy is three steps in a small range: field name in bold
monospace, type in small grey roman on the same line (`id  string`, `amount  integer`), description
in ordinary prose on the next line. HTTP methods use a fourth device — a short coloured word
(`POST` green, `GET` blue) in monospace directly before the grey path. Colour here carries a
category, not emphasis. [capture: content-1440-full.png, content-375-tile-01.png]

## 2. Where the eye lands first

**F8.** *(qualified in verification.)* Desktop guide index: the eye lands on the H1 "Payments",
which is content. The centred search field with its `/` key chip is second — but not because it is
the only control of its kind: it is one of three outlined pills in the top bar, beside "Ask AI" and
an outlined "Sign in" button. It loses to the H1 because the header band is pale and low-contrast
while the H1 sits at the top-left of a large white field. Third glance goes to the product
screenshot on the right. [capture: index-1440-full.png]

**F9.** Desktop API reference: the eye lands on "Charges" and then immediately jumps right to the
six-row endpoint list, because those rows are the only bold black text repeated six times in a
column. The left navigation tree, despite holding roughly twenty visible links, reads as texture
rather than as a destination — it is one size smaller, one grey lighter, and unboxed.
[capture: content-1440-full.png]

**F10.** Mobile, both pages: content wins outright. The guide index gives chrome a single thin row
(hamburger, "Payments", "Create account or Sign in") and then a large H1; the API page gives chrome
one grey band with a small all-caps "CHARGES" breadcrumb and three icons, then the H1. At 375 px
Stripe spends almost nothing on chrome before the first real word.
[capture: index-375-tile-01.png, content-375-tile-01.png]

**F11.** The mobile guide index shows **no search field at all** on the first screen — search is
behind the hamburger. The mobile API page shows only a magnifier icon. The persistent centred search
box is a desktop-only affordance here. [capture: index-375-tile-01.png, content-375-tile-01.png]

## 3. Information density

**F12.** *(qualified in verification.)* The first desktop screen of the API reference carries:
about twenty-four navigation links, a version selector and four header links, a three-sentence
paragraph, a helpfulness prompt, a two-tab switch, six endpoint rows each with method and path, two
attribute rows, and a JSON sample of about ten visible lines. That is dense, and it is legible
because *almost* every one of those groups is separated from its neighbours by a hairline or by a
change of column. The claim that nothing is a box is wrong on this very capture: the JSON sits in a
bordered, tinted panel headed "THE CHARGE OBJECT", and the current rail item "Charges" sits on a
pale fill. The real rule is hairlines everywhere **except the exact record** — see V2.
[capture: content-1440-full.png]

**F13.** Lists and tables are built as hairline-separated rows with no borders, no zebra striping and
no cell padding boxes. The endpoint list and the attribute list use the identical construction at
different content — title line, secondary line, 1 px rule — so a reader learns one row shape and
reuses it. The only affordance added to a row is a right-hand chevron.
[capture: content-1440-full.png, content-375-tile-01.png]

**F14.** *(qualified in verification.)* The guide index groups by a different device: cards. Each
card is a link title, one sentence, and sometimes one small pill ("No code required"); cards sit
two-up at desktop and stack one-up at mobile. Heights are *equalised within a desktop row* — "Accept
online payments" and "Create a subscription" are the same height side by side at 1440 — and left
unequal only in the mobile stack, where "Dynamic payment methods" runs taller because of its pill.
[capture: index-1440-full.png, index-375-tile-02.png]

**F15.** *(qualified in verification.)* Deep in the mobile index the site switches to its densest
form: "More guides" is **five** sub-headed lists of bare blue links — "Payment interfaces", "Manage
payments", "Payment methods", "API basics", "Start developing" — four to a group, with no
descriptions at all. Density rises as the reader's commitment rises: descriptions at the top, naked
links at the bottom. [capture: index-375-tile-04.png, index-375-full.png]

**F16.** The visual density is not delivery density. `domEvidence` records
`textToHtmlRatio: 0.0083` and `innerTextLength: 18516` against `outerHtmlLength: 2222467` — 0.83 %
visible text — against RNAWiki's current 8.3 %, which the mandate requires to rise. The row
construction is worth borrowing; the payload behind it is not.
[capture: content-1440-full.png]

## 4. Whitespace

**F17.** Space is spent above section headings, not below them. On the guide index the rule under the
utility row is followed by a wide gap before "Get started", while the paragraph under that heading
starts close to it — so the gap reads as a boundary between sections rather than as padding around a
heading. The same gap-then-tight pattern repeats at "Payment options".
[capture: index-1440-full.png, index-375-tile-02.png]

**F18.** Inside a data row, space is the smallest quantity on the page: name and type sit on one
line, the description one line below, and the next field arrives after a hairline and a modest gap.
The API page uses space to say "these belong together"; the guide page uses it to say "this section
has ended". Two jobs, two magnitudes. [capture: content-1440-full.png, index-1440-full.png]

**F19.** Margins are asymmetric and unapologetic. The left rail is flush to the window edge with a
small inset; the content column starts a comfortable distance right of the rail's divider; at 1440
the card grid stops well short of the right edge, leaving a wide empty gutter that the page does not
try to fill. Nothing is stretched to the viewport. [capture: index-1440-full.png]

**F20.** *(qualified in verification.)* At 375 px the outer margin is a single narrow gutter and
every heading, paragraph, card border and link list shares one left edge down all 3911 px. There is
exactly one second edge: the padding inside a card, which sets card text about 20 px further in.
[capture: index-375-full.png, index-375-tile-03.png]

## 5. Long scroll

**F21.** I cannot describe this site's long scroll from the content captures: see F1, all five
`content-1440` files and all five `content-375` files are single identical first screens. Any claim
about what persists on the API page during scroll would be invented.
[capture: content-1440-scroll-00.png, content-1440-scroll-50.png, content-1440-scroll-90.png]

**F22.** *Inferred.* The page is built to pin per-section panels rather than one global rail:
`domEvidence.stickyOrFixed` lists eight `ApiSection-Aside` elements with `position: sticky`, at tops
139, 638, 4389.6, 6812.6, 8075.6, 8964.6, 9902 and 11347.4 and heights 374 or 764 — one per endpoint
section, matching the eight h1/h3 endpoint groups in `headingOutline`. The static capture shows what
such an aside contains at the top of the page: the endpoint list, then the JSON sample.
[capture: content-1440-full.png] (inferred; domEvidenceKeys: stickyOrFixed)

**F23.** *Inferred.* Two further fixed elements sit at the bottom of the viewport
(`stickyOrFixed` entries at top 852 height 48, and top 899 height 1). The visible counterpart is the
grey "Developers" bar with a terminal icon spanning the full width of the last 48 px of both desktop
captures, with a scroll-to-top circle at its right end. *(Qualified in verification: it holds the
bottom of both **desktop** pages; neither mobile capture shows such a bar, and because the scroll
captures did not scroll, that it stays put while reading is taken from the DOM, not seen.)*
[capture: index-1440-full.png, content-1440-full.png, index-375-full.png, content-375-tile-01.png]
(inferred; domEvidenceKeys: stickyOrFixed)

**F24.** *(qualified in verification.)* The one long capture that exists holds its rhythm well.
`index-375-full.png` is 3911 px tall and repeats a single unit — heavy section heading, then stacked
cards — four times ("Payment options", "Payment methods", "Beyond payments", "Platforms and
marketplaces"), then changes gear once for "More guides". The pitch is *regular* rather than even:
section length follows card count (2, 3, 3, 3), and a fifth heading, "Get started", uses prose and a
link instead of cards. [capture: index-375-full.png]

**F25.** The end of the page is quiet and useful: a "Was this page helpful? Yes / No" pair, a rule,
then five one-line support links each with a small icon, a "Powered by Markdoc" credit, and the
locale controls. No newsletter, no promotional block, no repeated navigation dump.
[capture: index-375-tile-05.png]

**V1.** *(added in verification.)* The reason the content-page scroll captures are identical is
structural, not a tooling slip: at desktop width the article scrolls **inside `<main>`**, not in the
window, so scrolling the window moves nothing. Both desktop pages declare a "full page" height of
exactly 900 px while the same guide page at 375 px captures 3911 px. Provenance for the mechanism is
the Phase 1 measured record for the same URL (`data/design-study/stripe_com_docs.json`,
`measured.desktop.chrome`): `documentScrolls: false`, `scrollOwner: "main (clientHeight 844,
scrollHeight 12459, overflow-y auto)"`, with the left navigation scrolling in its own 280 px pane —
a Phase 1 measurement, explicitly not something visible in an image. **For RNAWiki:** an inner scroll
container silently defeats window-scroll tooling, and with it screenshotting, scroll restoration and
deep-link positioning on a long dossier. [capture: content-1440-scroll-50.png, content-1440-full.png,
index-1440-full.png, index-375-full.png]

## 6. Imagery

**F26.** The API reference page contains no pictures at all: `domEvidence.imgCount` is 0 and the
capture confirms it. Its only non-text elements are icons and the coloured JSON sample — and the
sample is not decoration, it is the same information as the field list in the form the reader will
actually receive. The page loses nothing by having no images.
[capture: content-1440-full.png]

**F27.** *(qualified in verification.)* The guide index uses exactly one picture, a product
screenshot of a checkout page beside "Get started". It is doing very little work — its own text is
illegible at this size, and it is cut off part-way down by the full-width rule that closes the
section. It is **not** cropped by the viewport: its right edge sits inside the 1440 px frame. Compare
the four card sections below it, which carry no imagery and are more useful.
[capture: index-1440-full.png]

**F28.** The mobile guide page drops that image entirely and is not worse for it: 3911 px of page
with zero pictures, structured only by headings, cards, pills and links.
[capture: index-375-full.png]

## 7. Defers or competes

**F29.** *(qualified in verification.)* In the **prose** column, the design defers. One ink, one
accent, hairlines, system fonts (the rendering is the system UI stack), no shadows, no gradients, no
illustration. The code panel is the exception: inside its tinted box sit green and blue method words
and multi-coloured JSON syntax — the only saturated colour on the screen. Nothing else on the API
page draws attention to itself except the words. [capture: content-1440-full.png]

**F30.** In the chrome, it competes in three specific places. (a) The desktop header stacks two full
bars — wordmark, centred search, "Ask AI", account links; then six product tabs — before any content,
taking roughly the top eighth of the screen. (b) The "Ask AI" control sits beside search with a
sparkle glyph, an assistant offer placed at the same level as finding the page. (c) The fixed
"Developers" bar holds the bottom of every screen. [capture: index-1440-full.png,
content-1440-full.png]

**F31.** The per-section utility row is a borderline case that lands on the right side. "Ask about
this page | Copy for LLM | View as Markdown | Install tools" is set in small grey text separated by
thin vertical rules, directly under the H1 and above a full-width divider. It is present without
being loud — but it repeats at every section on the API page ("Ask about this section | Copy for LLM
| View as Markdown" appears at both "Charges" and "The Charge object"), and
`domEvidence.copyControls` counts eight such controls on one page, all labelled "Copy for LLM".
Repeated often enough, quiet chrome becomes noise. [capture: content-1440-full.png,
index-1440-full.png] (partly inferred; domEvidenceKeys: copyControls)

**F32.** *Inferred.* The API reference has a theme toggle: a sun/switch control sits at the top-left
of the reference sidebar in the capture, and `domEvidence.prefersColorScheme` reports `found: true`
with one matched sheet, while `htmlAttributes.dataTheme` is null and `bodyBackgroundColor` computes
to `rgb(244, 247, 250)` — light. This matters because the Phase 2 dark-mode note lists Stripe among
the light-only sites, and the Phase 1 browser pass measured this same page dark
(`rgb(20, 23, 29)`). The page is theme-switchable and was captured light. [capture:
content-1440-full.png] (inferred; domEvidenceKeys: prefersColorScheme, htmlAttributes)

**F33.** *(qualified in verification.)* The header search is an input carrying a `/` key chip
(`domEvidence.kbdTexts: ["/"]`; `ariaKeyshortcuts` empty). Whether pressing `/` opens an inline
dropdown or a full-screen palette is **unobserved**: no overlay appears in any capture, and
`searchAffordances.count` is 0 for a page whose "Find anything /" input is plainly visible in
`content-1440-full.png` — a failed probe, not an absence, and it cannot be used to rule a palette
out. [capture: index-1440-full.png, content-1440-full.png] (inferred; domEvidenceKeys: kbdTexts,
ariaKeyshortcuts, searchAffordances)

## 8. Absence handling

**F34.** *(qualified in verification.)* Nothing in these captures shows an empty field, a
placeholder or a "not available" line — every row visible is populated. That the page instead
**collapses the rare** is read from the manifest, not seen: `headingOutline` records "More
attributes  Expand all" and "More parameters  Expand all" under six separate endpoint sections, but
no expander control appears in either first-screen capture. On that reading it is a disclosure
pattern, not an absence pattern. [capture: content-1440-full.png] (partly inferred; domEvidenceKeys:
headingOutline)

**F35.** Where a record is stale rather than missing, the site labels it in place instead of removing
it: `headingOutline` carries "Create a charge  Deprecated". The capture's endpoint list shows
"Create a charge / POST /v1/charges" without a visible tag at that size, so I record this as
manifest evidence, not as something I saw. [capture: content-1440-full.png]

**F36.** The one thing the captures do show about emptiness is structural: no section on either page
is present-but-blank. The guide index simply ends its card sections and changes to link lists; the
API page simply ends one endpoint block and rules a line. Absent content produces a shorter page,
not a padded one — which matches RNAWiki's own uniqueness constraint.
[capture: index-375-full.png, content-1440-full.png]

## 9. Mobile and overflow

**F37.** Two rows are clipped at 375 px. The utility row under the H1 reads "Copy for LLM | View as
Markdown | Install to" with the last item cut at the right edge, and the tab strip reads "Most
popular  Online  In-person  Subs" with the fourth tab cut. Both are presumably horizontally
scrollable, but at rest the page shows truncated words at the viewport edge.
[capture: index-375-tile-01.png, index-375-full.png]

**F38.** The mobile API page handles the same problem better: it collapses the whole navigation into
one all-caps breadcrumb with a chevron ("CHARGES ⌄") and three icons, and every content row below —
endpoint name, method, path, chevron — fits the width without truncation.
[capture: content-375-tile-01.png]

## For RNAWiki

### Borrow

**B1 — Structured data blocks: the hairline row.** Field name in bold, type in small grey on the
same line, one sentence of description below, 1 px rule, next field. No boxes, no zebra, no cell
padding. It scales from six rows to sixty without changing weight, and it is the single most
transferable thing on this site. [capture: content-1440-full.png, content-375-tile-01.png]

**B2 — Structured data blocks: a category chip that is a word, not a colour.** `POST` and `GET` are
short coloured monospace words, so the category survives greyscale and colour-blindness. RNAWiki's
`CONFIRMED` / `MIXED` / `CONTRADICTED` / `NOT_MEASURED` / `UNKNOWN` distinction — which boundary 6
requires to stay distinct — should be set exactly this way: the word carries it, colour only
reinforces. [capture: content-1440-full.png]

**B3 — Dossier reading column: the paired panel.** Prose on the left, the exact record on the right,
in the same vertical band, so the claim and the thing it is made of are read together. For a
programme dossier that is the claim sentence beside the exact saved source snapshot.
[capture: content-1440-full.png]

**B4 — Contents rail: the current page's sections nested inside the site tree.** One rail, not two:
group labels in small grey capitals, hairline dividers between groups, chevrons on expandable
entries, current item highlighted with a pale fill, and secondary controls (locale, here) parked at
the rail's bottom edge rather than in the header. [capture: index-1440-full.png,
content-1440-full.png]

**B5 — Dossier reading column: the quiet utility row.** A single line of small grey actions under the
H1, separated by thin vertical rules and closed by a full-width divider, is a place to put export,
citation and technical-disclosure controls without them competing with the heading. Use it once per
page, not once per section (see A3). [capture: index-1440-full.png]

**B6 — Browse/filter: description-then-bare-link density gradient.** Cards with one-sentence
descriptions at the top of a browse page, bare grouped link lists at the bottom, heights unforced.
[capture: index-375-tile-02.png, index-375-tile-04.png]

**B7 — Reference/definitions page: skip the picture.** A whole reference page with `imgCount: 0` that
loses nothing proves a definitions page needs no imagery. [capture: content-1440-full.png]

**V2 — Dossier reading column: the labelled record panel.** *(added in verification.)* The one boxed
element on the API page is the exact record, and it is labelled: the JSON sample sits in a bordered
panel with a small all-caps header bar reading "THE CHARGE OBJECT", naming precisely what the panel
contains. Nothing else on that screen is boxed except the pale fill under the current rail item. That
is the pairing to borrow for a saved source snapshot beside a claim — hairlines everywhere, one
bordered and labelled panel for the verbatim thing. [capture: content-1440-full.png]

### Avoid

**A1 — Repeated per-section chrome.** Eight "Copy for LLM" controls and a "Was this section helpful?
Yes / No" under every section is chrome that becomes the page's most repeated text. Under RNAWiki's
uniqueness rule (repeated elements are markup, never prose), a per-section helpfulness prompt and a
per-section action bar are exactly the words that would appear on more than 90 % of pages.
[capture: content-1440-full.png]

**A2 — Truncated rows at small widths.** The clipped utility row and clipped tab strip at 375 px
would fail RNAWiki's "no horizontal overflow at 320 px" rule outright.
[capture: index-375-tile-01.png]

**A3 — A fixed bottom bar.** The "Developers" bar plus scroll-to-top circle spends the bottom 48 px
of every screen on both pages for a control most readers will never use.
[capture: index-1440-full.png, content-1440-full.png]

**A4 — A decorative product screenshot.** *(qualified in verification.)* Illegible at its rendered
size and cut off mid-content by the section rule — not, as first written, cropped by the viewport
edge. The advice stands; the mechanism was wrong. [capture: index-1440-full.png]

**A5 — A second search, and an assistant beside it.** Stripe's persistent centred header search plus
an "Ask AI" control is precisely the arrangement the frozen home bar forbids: nothing may sit above
or beside the home search bar, and an assistant offer at equal weight would compete with it. Borrow
Stripe's rail and rows; do not borrow its header. [capture: index-1440-full.png]

**V3 — Do not copy the flat heading ladder.** *(added in verification.)* Every endpoint block on the
reference page is an `h1` — `headingOutline` lists eight of them and no `h2` at all, dropping
straight to `h3` for "Attributes", "Parameters" and "Returns". The structure a sighted reader sees in
the rules and rhythm is not in the document outline. RNAWiki's public pages are required to keep a
logical heading order, so what transfers is the row construction (B1), not the heading structure
beneath it. [capture: content-1440-full.png]

**A6 — 0.83 % text-to-HTML.** Whatever is borrowed must be built in plain markup, not by importing
this delivery profile. [capture: content-1440-full.png]

### Phase 2 verdict

Stripe holds two rows in the Phase 2 table: **structured data blocks** (governing, "validated") and
**dossier contents rail and previews** (proposed secondary, rail only, recorded as the item awaiting
a decision). It is also named in the global-search row as the only measured alternative to Vercel's
palette.

**Structured data blocks — strengthened, and by the right evidence.** The row's justification was
numeric (61 collapsible field blocks, a per-block copy button, chrome scale versus prose scale).
`content-1440-full.png` shows what those numbers look like, and it is better than the numbers
suggested: the mechanism is not the collapsibility, it is the hairline row with a three-step internal
hierarchy and a coloured category word, repeated identically for two different kinds of content
(endpoints and attributes) on the same page. Keep the assignment; restate the justification as the
row construction rather than the block count.

**Contents rail — the assignment survives, but its stated mechanism is wrong and must be corrected.**
The Phase 2 row describes "a TOC generated from `h2` text". On the governing reference page there are
no `h2` elements at all (`headingOutline` runs h1 → h3, and the Phase 1 browser pass recorded "no
rendered non-empty h2 exists"). What `content-1440-full.png` actually shows is a persistent
site-wide tree with the current page's sections nested inside it, and what pins during scroll is not
that rail but eight per-section right-hand asides (F22, inferred from `stickyOrFixed`). So: Stripe
remains the only measured reference for a persistent rail, and B4 above is a real borrow — but the
rail it offers is a navigation tree with the page folded into it, not a page-local table of contents,
and the row should say so before anyone builds to it. Hover previews remain unobserved here, as the
row already states.

**Dark mode — one recorded fact is contradicted.** The Phase 2 dark-mode note lists Stripe among five
light-only sites. F32 shows a theme control on the reference page, `prefersColorScheme.found: true`,
and the Phase 1 browser pass measured this same URL dark. The light-default decision is frozen and
this does not reopen it; the sentence describing Stripe as light-only should be corrected.

**No new surface claimed.** Nothing seen argues for giving Stripe the home page (A5 forbids it), the
browse surface (its cards are weaker than its rows), the citation map (no graphic behaviour was
observed) or the search overlay (F33: a `/` launcher, no palette).

**Verdict: strengthens** — the governing assignment is confirmed on visual evidence, with a required
correction to the contents-rail row's stated mechanism and to the dark-mode note.

## Verification

Independently verified on 2026-09-03 (18:44 UTC) by re-opening the captures. The nine images the viewer opened
were opened again, and sha256 was recomputed over all eighteen files in the directory: the viewer's
duplicate map is exact, so the eleven images required for verification are all covered
(`index-1440-tile-01` = `index-1440-full`; `content-1440-tile-01` / `-scroll-00` / `-scroll-50` /
`-scroll-90` = `content-1440-full`; `content-375-scroll-50` = `content-375-tile-01`).

**36 confirmed, 15 qualified, 0 refuted, 3 added.** Nothing was removed: no claim in the set was
invented or read off a capture that does not exist, so none met the bar for refutation. Fifteen
claims went further than their cited capture supports and were rewritten in place, each marked
*(qualified in verification)* above.

| id | why it was qualified |
| --- | --- |
| F4 | Card titles are blue links at ordinary size, so the last step of the ladder is not size-and-weight on one ink. |
| F5 | "No blue is decorative" is false on its own cited capture: `GET`, the Yes/No controls and JSON tokens are blue. |
| F6 | The two H1s are roughly twice the size of the field names, not "only slightly larger". |
| F8 | The search field is not the only outlined control — "Ask AI" and "Sign in" are outlined pills in the same bar. |
| F12 | "Never by a box or a colour panel" is contradicted by the bordered, tinted JSON panel and the pale-filled rail item; counts were also off (24 nav links, 3 sentences, ~10 JSON lines). |
| F14 | Desktop cards in a row *are* equalised; unequal heights are a mobile-stack observation only. |
| F15 | "More guides" is five sub-headed lists, not four — the finding itself named five. |
| F20 | Card padding is a second indent level, so "no second indent level anywhere" is wrong. |
| F23 | The fixed bar holds the bottom of the two **desktop** pages; no such bar exists in either mobile capture, and its persistence during scroll is DOM evidence, not seen. |
| F24 | The pitch is regular, not even: section length follows card count (2, 3, 3, 3), and "Get started" uses prose, not cards. |
| F27 | The screenshot is cut off by the section rule, not cropped by the viewport's right edge; "repeats the paragraph" overstates an illustration. |
| F29 | The code panel breaks "one ink, one accent" with green/blue method words and multi-coloured JSON syntax. |
| F33 | `searchAffordances.count: 0` on a page whose search input is visible is a failed probe, not evidence that no palette exists. |
| F34 | The expanders are read from `headingOutline`; no expander control is visible in any capture. |
| A4 | Same correction as F27 — wrong mechanism, right advice. |

Metadata defects found and left as filed, except where a rewrite touched them: F6 and F26 name
`domEvidenceKeys: stickyOrFixed` where they mean `headingOutline` and `imgCount`; F16, F35 and F51
quote `domEvidence` fields with an empty `domEvidenceKeys` array. F32 was checked against the Phase 1
record and stands — `measured.desktop` records this same URL at `rgb(20, 23, 29)` with the note "The
reference page is dark by default at this viewport, not a user preference", against a light capture
with a visible theme control here.

**Most important correction:** the page is not box-free. Hairlines everywhere **except the exact
record**, which gets a bordered, labelled panel — a better rule than the one first written, and now
recorded as V2.
