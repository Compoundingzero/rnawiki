# vercel.com/docs — Track A1 visual findings (recaptured 2026-09-04)

Vercel's product documentation. Two pages were captured: the docs index at
`https://vercel.com/docs` (a landing page built almost entirely from linked cards, 5,122 px tall at
1440 and 9,664 px tall at 375) and one article at `https://vercel.com/docs/deployments`
("Deploy and verify applications on Vercel", 7,561 px at 1440, 9,609 px at 375). Both render in
light mode in every capture. Twenty-three images were viewed: the two full-page shapes at each
viewport, first screens at both viewports on both pages, article tiles 01, 02, 03, 06, 08 and 09,
index tiles 01, 02 and 06 at desktop, index tiles 01, 04, 05 and 07 at mobile, and all six real
scrolled viewport captures (`content-1440-scroll-00/50/90`, `content-375-scroll-00/50/90`).

**Consent banner.** `bannerActions` records the same outcome on all four passes —
"left: only accept-type controls found in div", i.e. the decliner correctly refused to click an
accept-only control and left whatever it found standing. No banner, overlay or cookie strip is
visible in any of the twenty-three images viewed, so nothing in these captures should be read as
banner chrome. Recorded as a caveat, not as an obstruction.

**Tile caveat applied.** Tiles are slices of one full-page paint, so the sticky header and both
sticky rails appear only in the tile where they sat. `content-1440-tile-02` shows blank columns to
the left and right of the prose; that is the capture method, not the design. Every claim about
persistence below is taken from the `-scroll-` captures.

---

## 1. Visual hierarchy

**F1.** On both pages the hierarchy is a two-step drop with nothing in between: one very large
heading, then everything else at roughly one of two small sizes. On the index the h1 "Ship anything
with Vercel" is set at about 54 px over two lines and is the only large type on a 5,122 px page;
the section headings that follow ("What's new", "Build with AI", "Build your app", "Secure your
app", "Deploy and operate", "Guides and tutorials") are all the same modest size as each other, so
the page reads as one title and then six equal shelves. [capture: index-1440-tile-01.png,
index-1440-full.png, index-1440-tile-02.png]

**F2.** *(qualified on verification — measurements corrected.)* In the article the same drop is
steeper and the middle of the ladder is carried by space and weight rather than size. The h1 is
roughly 54 px; the h2 "Deployment Methods" is roughly twice body size (about 28–32 px, not 24 px);
the h3 "Git" and "Vercel Drop" are bold at close to body size (16 px), so an h3 and a bold lead-in
inside a list item look nearly identical. What separates the levels is the gap above them, but the
gap is smaller and the ratio flatter than first reported: measured on content-1440-tile-04,
"Accessing Deployments" has about 48 px of clear space above it and about 20 px below, and "Using
the Dashboard" about 44 px above and about 15 px below. That is roughly two to three times more
space above than below — not the 66 px / 12 px and "five times" of the first reading. The reader is
still told "new section" by the emptiness rather than by the letterform. [capture:
content-1440-tile-02.png, content-1440-tile-03.png, content-1440-tile-04.png]

**F3.** The article opens in two columns and then collapses to one. The h1 and the standfirst sit
in a narrow left block about 380 px wide (the h1 wraps to four lines), with a tabbed terminal card
to the right; below the button row the whole thing collapses into a single 824 px prose column that
runs the rest of the page. The narrow h1 block is a deliberate shape — the title is made to look
like a stack of short lines rather than one long line. [capture: content-1440-tile-01.png,
content-1440-scroll-00.png]

**F4.** *(qualified on verification — the button and chip counts were wrong.)* Colour does almost
no hierarchical work. Across every capture there are exactly two ink levels in running text —
near-black for prose and a lighter grey for standfirsts, captions, dates and rail labels — and green
appears only inside code. Emphasis is weight and space; nothing is coloured to mean "important".
Two corrections: each first screen carries **two** near-black filled buttons, not one — "Sign Up" in
the header plus the in-page primary ("Get started" on the index, "Deploy from the CLI" on the
article) — and there is more than one blue "Beta" chip: the index rail shows two ("eve", "Queues")
and the article rail one ("Deployment Policies"). [capture: content-1440-tile-01.png,
index-1440-tile-01.png, content-1440-tile-06.png, content-1440-scroll-00.png]

## 2. Where the eye lands first

**F5.** Desktop index: the eye lands on the content. "Ship anything with Vercel" is by a wide margin
the largest object on the first screen and sits at the optical centre-left; the search field, the
header links and the sign-up button are all at 14 px chrome scale and read as a frame. The search
field is the second thing seen, not the first — it is a bordered input at the top of the left rail
with a "⌘ K" chip inside its right end. [capture: index-1440-tile-01.png]

**F6.** Desktop article: the eye lands on the h1, and there is no visible search at all. The header
carries Docs / Build / Learn / Getting Started on the left and Ask AI / Log In / Sign Up on the
right; the rail's top slot is occupied by a back chevron and the section name "Deployments"; nothing
in the first screen is a search box or a magnifier. `searchAffordances` collected on this exact URL
records one control, `button Search Docs`, and `kbdTexts` records `⌘ K`, so a search entry point
exists in this page's DOM without being visible in the captured first screen — the keyboard route is
inferred, not seen. [capture: content-1440-scroll-00.png, content-1440-tile-01.png] (inferred:
searchAffordances, kbdTexts)

**F7.** *(qualified on verification — the h1 is smaller than claimed.)* Mobile: the eye lands on the
h1 on both pages, more decisively than at desktop, because the chrome shrinks to five marks — logo,
slash, "Docs", an ellipsis, and a hamburger. No search field is visible at 375 on either page. The
h1 is the largest object on the first screen but does not fill half of it: the article's four-line
h1 occupies about 212 px of an 812 px viewport (26%) and the index's two-line h1 about 110 px (14%).
[capture: index-375-tile-01.png, content-375-scroll-00.png]

**F8.** The one thing that competes at first glance is the terminal card. On the article's first
screen a tab strip ("Create a deployment / Verify a preview / Deploy to production") and a bordered
terminal block sit to the right of the h1 at similar visual weight to the standfirst; on the index
the same construction sits beside the h1. It is the only place on either page where two things ask
for the first look. [capture: content-1440-tile-01.png, index-1440-tile-01.png]

## 3. Information density

**F9.** *(qualified on verification — the gutter figure was wrong.)* At 1440 the article puts three
columns on screen at once — a 300 px section rail, an 824 px prose column and a 240 px "On this
page" rail. Those consume 1,364 px of 1,440, so the gutter between the prose and the right rail is
about 50 px, not 250: the prose column ends at x≈1137 and the rail begins at x≈1184. The density is
high in list count and low in words per screen: the first screen carries about forty discrete link
targets (21 in the left rail, 13 in the right, seven in the header) and only two sentences of prose.
[capture: content-1440-scroll-00.png]

**F10.** *(qualified on verification — "nothing else" is not true.)* The index is built almost
entirely from card grids: six labelled groups of three-up cards, each card an icon, a two-or-three
word title and a one-to-three line description in grey, all cards the same width and near enough the
same height within a row. The information is uniform by construction: no card is allowed to be more
important than another. It is not cards and nothing else, though — the same page also carries the
dated "What's new" hairline list (F11), a collapsed "Related Vercel documentation" strip, a pager
and a feedback pill. [capture: index-1440-full.png, index-1440-tile-02.png]

**F11.** The one table-shaped block on either page is "What's new", and it is built from a date
column and a content column separated by full-width hairlines — no cell borders, no zebra, no
header row. Four rows fill about 380 px. This is the site's answer to a list of dated records.
[capture: index-1440-tile-02.png]

**F12.** That dated list reflows honestly at 375: date on its own line above the title, summary
below and clamped to two lines with an ellipsis, hairline between entries. The row grows a little
but not without bound, and the date is never the thing that is dropped. [capture:
index-375-tile-04.png]

**F13.** *(qualified on verification — the screens are not bare titles.)* Mobile density is the weak
point. The 5,122 px desktop index becomes 9,664 px at 375 because the three-up grid becomes one
column of roughly 135–195 px cards; a whole screen holds four or five records. Each of those cards
still carries an icon, a title and a two-to-four line description, so the screens are not "four card
titles and nothing else" — they are simply four records deep. The article is 9,609 px. A reader at
375 scrolls nearly twice the desktop distance for the same content. [capture: index-375-full.png,
index-375-tile-05.png, index-375-tile-07.png, content-375-full.png]

## 4. Whitespace

**F14.** *(qualified on verification — same corrected measurements as F2.)* Space is spent almost
entirely on vertical separation above headings, and it is the main carrier of structure: about 45 px
above an h2 and 15–20 px below it, about 40 px above an h3 and about 25 px below. The effect is that
a 16 px bold h3 can sit directly above ordinary prose without shouting, because the gap has already
said "this is a new thing". [capture: content-1440-tile-02.png, content-1440-tile-04.png,
content-1440-tile-06.png]

**F15.** *(qualified on verification — list-item spacing corrected.)* Space is not spent inside
components. Cards have modest padding (about 22–24 px), the code blocks are tight to their content,
list items sit about 20 px apart (a 36 px pitch on 16 px text, measured on content-1440-tile-04, not
the 12 px first reported), and paragraphs run at 16/27 px with a single line's gap between them.
Nothing is padded to look generous. [capture: content-1440-tile-03.png, content-1440-tile-04.png,
index-1440-tile-02.png]

**F16.** *(qualified on verification — proportions corrected.)* A large share of the article's
whitespace is structural rather than expressive: the right rail's thirteen entries end around y=526
in an 836 px sticky column, leaving about 310 px unused at 0% and about 430 px at 90% — roughly half
the column empty below its last item, not 70% — and the ~50 px gutter between prose and rail is
dead. The page is not using that space to say anything; it is the cost of reserving a fixed column.
[capture: content-1440-scroll-00.png, content-1440-scroll-90.png]

**F17.** The end of the page is the largest single piece of whitespace on the site and it says
nothing. After the pager and the feedback control there is a hairline and then roughly 700 px of
plain background with no content in it at all — the same at the end of the index. [capture:
content-1440-tile-08.png, content-1440-tile-09.png, index-1440-tile-06.png]

## 5. Long scroll

**F18.** *(qualified on verification — persistence confirmed, "own scroll container" removed.)* At
1440 three things persist through the whole article: the 64 px header, the 300 px left section rail
and the 240 px right "On this page" rail. All three are present at 0%, 50% and 90%. What the
captures do **not** show is internal scrolling: between scroll-00 and scroll-50 both rails are
pixel-identical, and at scroll-90 the left rail's items sit about 36 px higher while the whole right
rail sits about 59 px higher, taking its "On this page" label up behind the header. That is a sticky
column reaching the end of its container, not a rail scrolling inside itself; `stickyOrFixed` records
position, top and height only, never overflow. [capture: content-1440-scroll-00.png,
content-1440-scroll-50.png, content-1440-scroll-90.png] (inferred: stickyOrFixed — an `aside` at
240 px sticky under the header and a `lg:sticky lg:top-(--header-height)` grid parent, eleven
sticky/fixed elements in all)

**F19.** The right rail tracks reading position with a vertical bar and darker text on the active
item: "Deployment Methods" is marked at 0%, "Resources Tab and Deploym…" at 50%. It is the only
progress signal on the page — there is no bar, no percentage, no stage indicator. [capture:
content-1440-scroll-00.png, content-1440-scroll-50.png] (inferred: scriptTokens.IntersectionObserver
= true)

**F20.** The rhythm breaks at the end. At 90% the visible content is the "Explore deployments" card
grid and the pager, but the rail still marks "Resources Tab and Deploym…" as active — the highlight
has not advanced through two intervening sections. Whatever drives it does not reach the last
screens of the page. [capture: content-1440-scroll-90.png]

**F21.** The rail also truncates rather than wraps: "Resources Tab and Deploym…" is cut with an
ellipsis at 240 px, so the longest entry is the one the reader can least identify. [capture:
content-1440-scroll-50.png]

**F22.** The end of the article is a pager and a feedback control, in that order: "Previous / Builds"
left, "Next / Environments" right, then a centred pill reading "Was this helpful?" with four faces.
Then nothing — no footer renders below the hairline on either page. [capture:
content-1440-tile-08.png, content-1440-scroll-90.png, index-1440-tile-06.png]

**F23.** At 375 nothing persists but the 64 px header. The contents control — a list icon in the top
row of the article, beside a copy button and a chevron — scrolls away with the page and is gone by
50%. A mobile reader of a 9,609 px article has no visible way back to the outline. [capture:
content-375-tile-01.png, content-375-scroll-50.png, content-375-scroll-90.png]

## 6. Imagery

**F24.** Most of what looks like imagery is 1 px line icons, one per card, at about 20 px. They
identify a card rather than explain anything — a globe for "Managing deployments", a clock-arrow for
"Rolling back a production deployment". Remove them and no meaning is lost. There are 125 inline SVG
marks on the article and no `<canvas>`. [capture: index-1440-tile-02.png,
content-1440-scroll-90.png, content-375-scroll-90.png]

**F25.** The only load-bearing images are product screenshots, and they are handled as figures: a
bordered, rounded frame at full column width with a grey caption centred beneath it — "Example of a
deployment resources page with a search applied." The screenshot shows a real interface with a
search term typed and a context menu open, i.e. it shows the exact state the surrounding prose
describes. This is the one place where a picture carries meaning. [capture:
content-1440-scroll-50.png]

**F26.** When an image has not loaded, the frame and the caption stay. In the full-page and tile
captures both screenshots are empty bordered rectangles roughly 420 px tall with their captions
intact underneath, because four of the seven images are lazy-loaded and never entered the viewport
during a full-page paint. The layout does not shift — but a caption is left describing something
the reader cannot see. [capture: content-1440-tile-06.png, content-1440-full.png] (contrast with
content-1440-scroll-50.png, where the same figure is fully rendered)

**F27.** Where there is no imagery at all — the whole of tiles 02 and 03, roughly 1,800 px of
continuous prose, lists and code — the page does not flinch or reach for a decorative break. Code
blocks do the visual work that images would otherwise do: a white card with a 1 px border, some with
a labelled header row (a prompt glyph and the word "terminal"), some bare. [capture:
content-1440-tile-02.png, content-1440-tile-03.png]

## 7. Defers or competes

**F28.** For the length of the article the design defers almost completely. No rules except
hairlines, no coloured callouts, no boxes around paragraphs, no illustration, two ink levels, one
measure. Tiles 02, 03 and 06 are close to unstyled reading. [capture: content-1440-tile-02.png,
content-1440-tile-03.png, content-1440-tile-06.png]

**F29.** It competes only at the top and only on behalf of the product. The first screen of both
pages carries a filled near-black primary button plus one or two outlined buttons, and a tabbed
runnable-looking terminal — marketing furniture sitting where a reference page would normally begin
its content. On the article this pushes the first sentence of actual prose to about 650 px down the
page. [capture: content-1440-tile-01.png, index-1440-tile-01.png]

**F30.** One place where the design works against its own content: in "What's new" the date, the
title *and* the summary all render underlined, so the block that carries the most information per
pixel on the index is also the noisiest thing on the page — visibly busier than the card grids above
and below it. [capture: index-1440-tile-02.png]

**F31.** *(qualified on verification — true at desktop only.)* At 1440 the header competes mildly
and permanently: "Ask AI", "Log In" and "Sign Up" hold the top-right corner of every screen at every
scroll depth, including 90% down a reference article. At 375 they are not present at any depth — the
header collapses to logo, slash, "Docs", an ellipsis and a hamburger — so content-375-scroll-90 is
cited here as the counter-case, not as support. [capture: content-1440-scroll-90.png,
content-375-scroll-90.png]

## 8. Absence handling

**F32.** *(qualified on verification — the second half is contradicted by its own capture.)* Nothing
on either page renders an empty section, a placeholder row, a dash, or a "not available" line; that
much holds everywhere. But absence is not always shortness. At 1440 the cards in a grid **row** are
stretched to a common height and the emptier card carries the slack as internal space:
"Managing deployments" (two-line description) and "Rolling back a production deployment" (one-line
description) are both 164 px tall in content-1440-scroll-90, the shorter one leaving a visible gap
between its title and its text, while the row below — holding only "Deploy from the CLI" — is 138 px.
The two cards the first reading named are not even in the same row. Shortness-by-content only holds
at 375, where cards are one per row: 145, 165, 188 and 147 px in content-375-scroll-90. [capture:
content-1440-scroll-90.png, content-375-scroll-90.png]

**F33.** The largest block of secondary material on the article ships collapsed to a single line.
At the foot of the page, above the pager, sits one bordered strip reading "▸ Related Vercel
documentation" and nothing else. The DOM heading outline collected on this URL shows what is behind
it — "Cross-link map: Deploying to Vercel (/docs/deployments)", "Semantically closest pages",
"This page links to (17)" and "Pages that link here (32)" — so a full inbound/outbound citation map
is present on the page and costs one closed line until asked for. No capture shows it open, so its
internal design cannot be judged from these images. [capture: content-1440-tile-08.png,
content-1440-scroll-90.png, index-1440-full.png] (inferred: domEvidence.headingOutline)

**F34.** The lazy-image case (F26) is the one place where absence is handled badly: an unloaded
figure leaves a large bordered void with a caption asserting what it would have shown. A page that
must never imply more than it shows cannot copy that shape. [capture: content-1440-tile-06.png]

## 9. Baseline / theme

**F35.** Every capture is light. `htmlAttributes.class` carries `light-theme`, the inline style sets
`color-scheme: light` and `background-color: rgb(250, 250, 250)`, and `prefersColorScheme.found` is
false across all nine stylesheets — so dark is applied by class, not by an OS media query. This is
consistent with the Phase 2 note and with the decided light default; the captures neither confirm
nor deny the dark ramp, since no dark capture exists. [capture: index-1440-tile-01.png,
content-1440-scroll-00.png] (inferred: htmlAttributes, prefersColorScheme)

**F36.** *(qualified on verification — the hover mechanism is not observable.)* Copy is a
first-class control at the top of the article: a "Copy page" button with a chevron is visible at
rest in the article's top row at both viewports, and the hero terminal card carries a visible copy
icon. The in-article code cards (content-1440-tile-03) carry none. `copyControls` records 25
controls including "Copy page" and "Copy to clipboard". A static capture cannot show whether the
missing per-block controls appear on hover, so no hover behaviour is asserted here. [capture:
content-1440-tile-01.png, content-1440-tile-03.png, content-375-tile-01.png] (inferred:
copyControls)

## 10. Added on verification

**V1 — two active-state grammars on one screen.** The left section rail marks the current *page*
with a filled grey pill ("Overview", unchanged at 0%, 50% and 90%); the right contents rail marks the
current *section* with a short bar at the left edge and darker text, and no fill ("Deployment
Methods" at 0%, "Resources Tab and Deploym…" at 50%). The two never read as the same kind of state,
which is why the page can carry two rails at once without either being mistaken for the other. For a
dossier this maps onto "which programme you are in" versus "which evidence node you are reading" and
should be copied as two distinct marks, not one. [capture: content-1440-scroll-00.png,
content-1440-scroll-50.png]

**V2 — the sibling rail says nothing about what a sibling is.** The left rail is a flat list of 21
pages, typographically identical from "Overview" to "Optimize Deployment Storage", with no counts, no
dates and exactly one badge type — a blue "Beta" chip on "Deployment Policies". Vercel can afford
that because every sibling is the same kind of page. RNAWiki's are not: a programme with a published
conclusion and one still at `UNKNOWN` would be indistinguishable in a rail borrowed at this fidelity.
A per-item state mark has to be designed in; it does not come with the pattern. [capture:
content-1440-scroll-00.png]

**V3 — one fixed measure, and no break-out rule for figures.** Everything in the article is bound to
the same 824 px column, the ~433 px product screenshots included. The consequence is visible inside
the frame: the first figure is an 824 × 433 px bordered rectangle in which the screenshot's own
interface text — file paths like `/_next/static/chunks/app/(chat)/page-b2dac70075beb3a0.js`, column
labels, byte sizes — renders at roughly 9–10 px. Nothing on either page breaks out of the measure, so
this reference says nothing about placing a wide evidence table, a forest plot or a mechanism
diagram; copy the measure without a break-out rule and those become unreadable the same way.
[capture: content-1440-tile-05.png, content-1440-scroll-50.png]

---

## For RNAWiki

### Borrow

**B1 — the hierarchy-by-space ladder, for the dossier reading column.** *(figures corrected on
verification.)* An h2 at roughly twice body size (~28–32 px against 16 px body), separated by ~45 px
above and ~15–20 px below, lets a technical sub-heading sit under plain prose without visual
escalation. That is exactly what a dossier needs when an expert block follows a lay sentence, and it
corroborates the Linear-as-secondary reasoning already in Phase 2 from a second site. [capture:
content-1440-tile-04.png, content-1440-tile-02.png]

**B2 — the dated hairline list, for source-change and review-history blocks.** A date column in grey
at chrome scale, the record's title and one summary line, full-width hairlines and no cell borders;
at 375 the date lifts above the title and the summary clamps to two lines. This is a better model
for "what changed on which source, when" than any card. [capture: index-1440-tile-02.png,
index-375-tile-04.png]

**B3 — the collapsed cross-link map, for the citation evolution map surface.** An entire
inbound/outbound link map costing one closed line at the foot of the page, below the content and
above the pager, is the correct default weight for a citation graph on an evidence page: available,
never competing, and never occupying reading space it has not earned. [capture:
content-1440-tile-08.png]

**B4 — the contents rail with a reading-position marker, for the dossier contents rail.** *("own
scroll container" removed on verification.)* A 240 px right rail, two indent levels, a left bar plus
darker text on the active entry, sticky beneath the header and present at every scroll depth.
Observed working across three real scrolled captures — which is more than the current Phase 2
proposal for that surface has. Do not borrow the internal-scroll-container claim: the rail is
pixel-identical at 0% and 50% and then shifts up near the page end. [capture:
content-1440-scroll-00.png, content-1440-scroll-50.png, content-1440-scroll-90.png]

**B5 — figures with captions that name the state shown.** "Example of a deployment resources page
with a search applied" describes exactly what is in the frame and claims nothing beyond it. That
caption discipline transfers directly to mechanism diagrams and trial figures. [capture:
content-1440-scroll-50.png]

**B6 — no placeholders, ever.** *(rewritten on verification; see F32.)* Nothing renders an empty
section, a placeholder row, a dash or a "not available" line — absent material is simply not drawn.
That much is the uniqueness constraint's "absent data renders NOTHING" already working on a rendered
page. What is **not** borrowable is "absence as shortness": at 1440 the grid stretches cards in a
row to a common height and the emptier card's slack reads as design. [capture:
content-1440-scroll-90.png, content-375-scroll-90.png]

**B7 — two distinct active marks on one screen.** A filled pill for "which page" in the sibling
rail, a bar for "which section" in the contents rail (V1). [capture: content-1440-scroll-00.png]

### Avoid

**A1 — a search field that exists on the index and vanishes on the article.** At 1440 the article's
first screen has no visible search entry point at all, and at 375 neither page does. For RNAWiki the
home search bar is frozen and primary; a docs pattern that lets search disappear once the reader is
inside a record is the opposite of what this corpus needs. [capture: content-1440-scroll-00.png,
content-375-scroll-00.png]

**A2 — the marketing block above the first sentence.** A filled primary button pair and a tabbed
terminal card push the article's first real prose about 650 px down. Nothing of this shape may sit
above or beside the home search bar, and nothing of this shape belongs at the top of a dossier.
[capture: content-1440-tile-01.png]

**A3 — a stale reading-position marker.** At 90% the rail still highlights a section two headings
behind the screen. A dossier rail that mis-states where the reader is in an evidence chain is worse
than no rail; if the marker cannot be trusted to the end of the page, ship the rail without one.
[capture: content-1440-scroll-90.png]

**A4 — truncating rail labels to an ellipsis.** "Resources Tab and Deploym…" — the entries most in
need of identification are the ones cut. Evidence-section names ("Population and outcome measures")
will collide with this at 240 px; wrap to two lines instead. [capture: content-1440-scroll-50.png]

**A5 — dropping the contents control at mobile.** A 9,609 px article at 375 keeps only a 64 px
header; the outline icon scrolls away and never returns. A dossier at 375 must keep a route back to
its sections. [capture: content-375-scroll-50.png, content-375-scroll-90.png]

**A6 — a reserved frame with a caption for an image that is not there.** [capture:
content-1440-tile-06.png]

**A7 — underlining every part of a dated row.** It makes the densest, most useful block the
noisiest. Underline the title only. [capture: index-1440-tile-02.png]

**A8 — ~700 px of empty page after the last content.** Measured: the article's closing hairline
falls at y≈6858 on a 7,561 px page. [capture: content-1440-tile-09.png, index-1440-tile-06.png]

**A9 — row-equalized card grids at desktop.** A card with less to say is stretched to its row-mate's
height and the slack reads as design rather than as absence (F32, V-note). [capture:
content-1440-scroll-90.png]

**A10 — a flat sibling rail with no per-item state mark**, where a published conclusion and an
`UNKNOWN` look identical (V2). [capture: content-1440-scroll-00.png]

**A11 — a single fixed measure with no break-out rule for figures.** At 824 px an embedded
screenshot's own text falls to ~9–10 px (V3). [capture: content-1440-tile-05.png]

### Phase 2 verdict — **weakens** the "global search overlay" assignment; argues for reassignment to the contents rail

Phase 2 names vercel.com/docs as the governing reference for the **global search overlay**,
"validated and subordinate to the home bar", on the strength of a `⌘ K` hint, an
`aria-label="Search Docs"` button and a mirrored grey ramp. The captures weaken that on two counts.
First, **no capture shows the overlay**. The palette is inferred from `kbdTexts` and
`searchAffordances` and cannot be judged visually at all from this set — a governing reference for a
surface should be a surface someone has looked at. Second, the visible entry point is **not
persistent**: it is a bordered field at the top of the index rail (index-1440-tile-01) and it is
absent from the article's first screen at 1440 and from both pages at 375. What can be borrowed with
confidence is one small thing — the `⌘ K` chip sitting quietly inside the right end of a search
field rather than beside it (index-1440-tile-01) — which is a detail, not a governing reference. The
Phase 2 measurement (the mirrored 17.9:1 ramp) is untouched by this; the *design* claim is what
weakens.

What these captures do support is the surface Phase 2 left **unassigned under the stopping rule**:
the **dossier contents rail and previews**. Vercel's right-hand rail is observed working at three
real scroll depths, with two indent levels, an active marker and a defined mobile fallback — more
rendered evidence than the proposed Stripe rail currently has in this study, and its two failure
modes (stale marker, ellipsis truncation) are both visible and therefore designable around.
Verification removed one word from that case: the rail is **not** shown to be its own scroll
container (it is pixel-identical at 0% and 50% and shifts up near the page end), so the reassignment
rests on stickiness and the active marker, not on internal scrolling. Recommendation: keep vercel.com/docs for the search-overlay *token* work, and put
it forward as a measured candidate for the contents rail — noting that hover previews remain
unobserved here too, so the stopping rule on previews still stands.

---

## Verification

Verified independently on 2026-09-03 against the captures in
`data/design-study/captures/vercel_com_docs/`. Nineteen images were looked at: index-1440-full,
-tile-01, -tile-02, -tile-06; content-1440-full, -tile-01, -tile-02, -tile-03, -tile-04, -tile-05,
-tile-06, -tile-08, -tile-09; content-1440-scroll-00/50/90; index-375-full, -tile-01, -tile-04,
-tile-05, -tile-07; content-375-tile-01; content-375-scroll-00/50/90.

**32 confirmed · 15 qualified · 0 refuted · 3 added.** No finding was removed. Nothing in the
captures was a banner read as design — no banner, overlay or cookie strip appears in any image, and
`bannerActions` is correctly treated as a caveat.

Qualified findings, one line each:

- **F2** — 66 px above / 12 px below and "five times" are wrong. Measured on content-1440-tile-04:
  ~45 px above an h2, ~15–20 px below, a ratio near 2.5:1; the h2 is nearer 30 px than 24 px.
- **F4** — two near-black filled buttons per first screen (header "Sign Up" plus the in-page
  primary), not one; and more than one blue "Beta" chip (two in the index rail, one in the article
  rail).
- **F7** — the h1 does not fill half the mobile first screen: ~212 px of 812 on the article, ~110 px
  on the index.
- **F9** — 300 + 824 + 240 = 1,364 of 1,440, so the gutter is ~50 px, not ~250 px.
- **F10** — "a card grid and nothing else" is not true; the index also carries the dated list, a
  collapsed Related-documentation strip, a pager and a feedback pill.
- **F13** — the mobile screens are not "four card titles and nothing else"; every card carries an
  icon, a title and a two-to-four line description. Card heights are ~135–195 px.
- **F14** — same corrected spacing as F2.
- **F15** — list items sit ~20 px apart (36 px pitch on 16 px text), not ~12 px.
- **F16** — the rail column is about half empty below its last entry, not ~70%, and the gutter is
  ~50 px.
- **F18** — persistence confirmed, but the rails are not shown to be their own scroll containers:
  they are pixel-identical at 0% and 50% and shift up at 90% (left ~36 px, right ~59 px, taking "On
  this page" behind the header) — sticky behaviour at the end of a container. `stickyOrFixed` records
  position, top and height, never overflow.
- **F31** — true at 1440 only; at 375 the header shows no Ask AI / Log In / Sign Up at any depth, so
  the mobile capture is a counter-case rather than support.
- **F32** — the cited capture shows the opposite at desktop: cards in a row are stretched to a common
  height ("Managing deployments" and "Rolling back a production deployment" both 164 px), and the two
  cards named are not in the same row. Shortness-by-content holds only at 375.
- **F36** — copy controls *are* visible at rest ("Copy page" at both viewports, a copy icon in the
  hero terminal); only the per-block controls are missing, and a static capture cannot show whether
  they are hover-revealed.
- **F37** — carried the F2 figures into a dossier spec; rewritten with the corrected ones.
- **F40 / B4** — "its own scroll container" removed, per F18.

Downstream corrections: **B1** now carries the measured ~45/15–20 px ladder; **B6** was rewritten
from "absence as shortness" to "no placeholders, ever"; **A8–A11** added; the Phase 2 argument for
reassigning this site to the dossier contents rail no longer rests on internal scrolling.

Added: **V1** (two active-state grammars on one screen), **V2** (flat sibling rail with no per-item
state mark), **V3** (one fixed 824 px measure and no break-out rule, which drops an embedded
screenshot's own text to ~9–10 px).
