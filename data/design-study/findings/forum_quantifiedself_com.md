# forum.quantifiedself.com — Track A2 viewer findings

The Quantified Self Forum is a Discourse installation where people who measure themselves post
project logs, self-experiments, tool questions and recruiting calls. Two URLs were captured:
`https://forum.quantifiedself.com/` (index) and `https://forum.quantifiedself.com/latest`
(content). They render the same page — the manifest records identical sha256 for
`index-1440-full.png` / `content-1440-full.png`, for the three 1440 tiles, for
`content-1440-scroll-00.png` / `index-1440-tile-01.png`, and for the whole 375 set. There is no
separate "content page" to study: the topic list is the site's content surface, and a thread page
was not captured. Everything below is from the topic list at 1440x900 and 375x812. Images opened:
`index-1440-full.png`, `index-1440-tile-01.png`, `content-1440-tile-02.png`,
`content-1440-tile-03.png`, `content-1440-scroll-50.png`, `content-1440-scroll-90.png`,
`index-375-full.png`, `index-375-tile-01.png`, `content-375-scroll-50.png`,
`content-375-scroll-90.png`, `content-375-tile-05.png`. The required
`content-1440-full.png`, `content-1440-tile-01.png`, `content-1440-scroll-00.png` and
`content-375-tile-01.png` are byte-identical duplicates of files in that list and were read through
their duplicates.

**Banner note.** `bannerActions` records a refusal failure on all four passes, but the controls it
names are ordinary page content: on desktop the table header ("Replies, Views, Activity") and the
pinned topic row ("Welcome to the new QS Forum!", "Meta"), and on mobile a topic link ("Tracking
ferritin after blood donations"). No consent or cookie overlay is visible in any capture. Nothing in
these images should be discounted as a standing banner — the detector caught the page, not a banner.

## 1. Visual hierarchy

**F1.** *(qualified)* The topic title is the only element given strength, and most of the rest is
deliberately demoted. Title sits at roughly 17 px near-black; the category chip, tag list and date
are all 12–13 px grey. The counts are the exception: same small size, but rendered in three
different states by magnitude (see F3), so they are not uniformly demoted. The order read is title,
then the right-hand number, then the date. Hierarchy is carried by colour and weight, not size.
[capture: index-1440-tile-01, content-1440-tile-02]

**F2.** The page's only heading is invisible. `domEvidence.headingOutline` records one `h1`, "All
latest topics", and `headingCount` is 1 — but no such text appears in any capture. What sits at the
top of the list visually is "Latest", a selected tab in a control row. The document outline and the
visual outline disagree completely: a sighted reader sees a filter, a screen reader hears a heading,
and there is no second level anywhere in a 2,586 px page. [capture: index-1440-tile-01,
index-1440-full]

**F3.** *(qualified)* Emphasis is spent on the popularity columns — both of them, on a three-band
heat scale rather than the two-state rule first described. Small values are grey (50, 69, 78, 86,
147); larger ones in *either* column render slate-blue (48, 76, 19, 28, 21 replies; 2.5k, 4.1k, 2.3k
views); bold near-black is reserved for the two largest view counts only, 18.9k and 15.6k. 3.3k is a
high view count and is *not* bold. The single strongest typographic mark inside the data list is
still a measure of attention. [capture: index-1440-tile-01, content-1440-scroll-90]

## 2. Where the eye lands first

**F4.** *(qualified)* Desktop: the eye lands on the chrome. The navy "Sign Up" and "Log In" buttons
at top right are the highest-contrast filled shapes on the first screen and the only filled shapes
that are not avatars; the list carries no fill or accent of its own. They are not literally the only
*saturated* fills — the letter-disc avatars include a strong green R and a peach A on the same
screen. The content list does not begin to compete until the second or third row. [capture:
index-1440-tile-01, content-1440-scroll-00 — identical bytes to index-1440-tile-01]

**F5.** *(qualified)* Mobile: the same, and more pronounced. At 375 the navy "Log In" pill is the
single darkest object above the fold. It does not sit near the centre — it spans roughly x=185 to
x=267, its centre right of the 187 px midpoint, immediately left of the search and menu icons — and
there is no "Sign Up" button at this width. The list beneath is text and one small round avatar per
row. Chrome wins on both viewports. [capture: index-375-tile-01, index-375-full]

**F6.** The second landing is also not a record. The first row of the list is a pinned announcement,
"Welcome to the new QS Forum!", whose excerpt is a sign-up pitch ("New users Sign up/Log In to enjoy
an ad-free forum experience"). The top row of the evidence list is marketing, and it carries the
page's largest view count. [capture: index-1440-tile-01, index-375-tile-01]

## 3. Information density

**F7.** *(qualified)* About nine topic rows fit a 900 px desktop screen — eight complete plus one
cut — and about seven fit 812 px on mobile, six complete plus one cut. Row height is data-driven,
not a fixed rhythm, but the spread is narrower than first stated: measured on the 1440×900 tile, a
one-line title with no metadata line runs about **70 px** (rules at roughly y=278 and y=350 around
"Remember The Email-Inbox Project by Mark Wilson?"), and a two-line title with a chip and three tags
about **82 px**, not 55 and 90. The list still breathes according to what each record holds.
[capture: index-1440-tile-01, content-1440-tile-02, content-1440-tile-03, content-375-tile-01]

**F8.** *(qualified)* The list reads as a table with a real four-label header row — Topic, Replies,
Views, Activity — but it has **five** visual columns: the participant-avatar cluster between the
title and the counts carries no header at all. It is grouped by nothing. Thirty rows run in one flat
sequence with no date dividers, no category grouping, no sections and no landmarks; the run is
reverse-chronological only after row one, because the pinned announcement is dated Apr 2021 and sits
out of sequence at the head. [capture: index-1440-full, content-1440-tile-02]

**F9.** Mobile deletes a column and unlabels the rest. The Views column is gone entirely; what
survives is one bare number at the top right of each row (replies) and a date at the bottom right,
with no column header anywhere on the viewport. A reader who arrives on mobile has no way to learn
that "28" means replies. [capture: index-375-tile-01, content-375-scroll-90]

## 4. Whitespace

**F10.** Almost all the whitespace is in the outer margins. The content well is roughly 1,090 px
inside a 1,440 px viewport, leaving about 175 px empty on each side, and the site spends none of
that on the record itself. [capture: index-1440-tile-01, content-1440-tile-02]

**F11.** Inside a row the spacing is tight and purposeful — 4 to 6 px between a title and its
category line, hairline rules between rows, no cards, no borders, no fills. The space says "this is
one continuous list", not "these are separate objects". That reading is correct and the restraint
is the best thing about the page. [capture: content-1440-tile-02]

**F12.** *(qualified)* The one place whitespace is wasted is the middle of each row, and the gap is
wider than first measured — roughly **450 to 550 px**, not 200 to 400. "Omega-3 & Me" ends near
x=312 while its avatar cluster starts near x=864; "What is inside an oura ring" ends near x=404 with
avatars from x=865. The eye has to jump a long empty band to connect a record to its own counts,
which makes the point stronger rather than weaker. [capture: index-1440-tile-01,
content-1440-scroll-90]

## 5. Long scroll

**F13.** *(qualified)* Exactly one thing persists: a 64 px sticky header, identical at 0 %, 50 % and
90 % scroll *within* each width. Its contents are **not** identical *across* widths. Desktop carries
logo, Sign Up, Log In, a search icon and a hamburger; mobile carries logo, Log In, search and
hamburger, with no Sign Up at all (content-375-scroll-50, content-375-scroll-90).
`domEvidence.stickyOrFixed` confirms `div.drop-down-mode.d-header-wrap`, position sticky, top 0,
height 64. [capture: content-1440-scroll-00, content-1440-scroll-50, content-1440-scroll-90,
content-375-scroll-50, content-375-scroll-90]

**F14.** The column header row is not sticky, and this is the clearest information-design failure in
the captures. By 50 % scroll every number on screen is unlabelled — twelve rows of counts with the
legend gone. At 90 % it is worse. The page presents two numeric columns for 2,586 px and explains
them for the first 900. [capture: content-1440-scroll-50, content-1440-scroll-90]

**F15.** The filter row scrolls away with it. "categories", "tags", "Latest", "Hot", "Categories" are
visible only at the top, so at depth a reader cannot see or change what they are looking at without
returning to the top of the page. [capture: content-1440-scroll-50, index-1440-tile-01]

**F16.** Rhythm holds perfectly and that is both the strength and the cost. The row cadence is
unbroken across the entire page — no ads, no inserted panels, no promoted blocks after the pinned
row. There is also no landmark of any kind to navigate by, so the scroll is uniform and
featureless. [capture: index-1440-full, content-1440-full — identical bytes]

**F17.** *(qualified)* The page ends in nothing. After the last row and its hairline the document
stops — no footer, no pagination, no "load more" control, no links out to categories, guidelines or
an about page. Mobile does the same. Two corrections: the trailing white is about **110 px** at 1440
and about **100 px** of a 196 px final tile at 375, not "roughly 200 px" and not "almost entirely
blank"; and the infinite-loading inference is **withdrawn** — `scriptTokens.IntersectionObserver` is
not evidence of a loading behaviour, and nothing about loading can be seen. What can be seen is that
no content appears past the thirtieth row. [capture: content-1440-tile-03, content-375-tile-05]

## 6. Imagery

**F19.** *(qualified)* Not one chart, diagram, screenshot, plot or figure appears anywhere in
2,586 px. Every image visible in the captures is a participant avatar — with one exception the
original claim missed, the QS wordmark in the header, which is an image and is not an avatar. The
figure of 86 comes from `domEvidence.imgCount` and cannot be checked against a capture, so "all 86
are avatars" is a DOM inference, not a visual observation. The visible point stands: on a site whose
entire subject is personal data and its visualisation — topics literally titled "Collating and
Visualising data via APIs and BI tools" and "Open-source tool to backup and visualize your long term
Garmin data" — the index shows no data at all. [capture: index-1440-full, content-1440-tile-02]

**F20.** *(qualified)* At **desktop** the avatars carry real information, which is the surprise. The
cluster width shows at a glance how many distinct people are in a thread — five for "Sharing my odd
collection of custom-built, self-quantification software", one for "Apple Health XML data with
XSLT" — a crude participation signal doing work no number in the row does. Mobile throws it away:
at 375 every row shows exactly one leading avatar whatever its desktop cluster width, so the claim
holds only at 1440. [capture: index-1440-tile-01, content-1440-scroll-90, content-375-tile-01]

**F21.** *(qualified)* Where a person has no avatar image the page renders a coloured letter disc —
A, R, C, T, M, F, O, P — rather than a blank space or a generic silhouette. The absent image is
replaced by an identity token that still distinguishes one person from another, but it is the
**letter** that does the distinguishing, not the colour: the colours repeat (R and C both render on
the same green, and an olive R sits beside a near-identical gold M on "Research participants
wanted"). "Each on a different background colour" does not hold. [capture: index-1440-tile-01,
index-375-tile-01]

## 7. Defers or competes

**F22.** *(qualified)* For almost its whole length the design defers, and defers hard. One typeface,
near-black on white, hairline rules, no cards, no shadows, no fills. "No accent colour inside the
list" is not quite right: besides the small category square there is a fourth ink — the slate-blue
used on larger reply and view figures (48, 76, 19, 28, 2.5k, 4.1k) — and it is spent entirely on
popularity. Discourse's default chrome otherwise gets out of the way of the titles. [capture:
content-1440-tile-02, content-1440-scroll-90]

**F23.** It competes at exactly two moments, both about accounts rather than content: the navy Sign
Up / Log In pair that forms the visual peak of the first screen (F4, F5), and the pinned
announcement row that takes the top slot of the data list to ask for a sign-up (F6). Everything
between them is honest. [capture: index-1440-tile-01, index-375-tile-01]

## 8. Information design of data-heavy, uncertain, community-sourced material

**F24.** This site is squarely longevity- and health-relevant; it does not have to be forced to fit.
Visible in the captures: tracking ferritin after blood donations, tracking blood sugar, "Omega-3 &
Me", "Been tracking liver health for 7 years", brain fog and gut bacteria, "Farming My Microbiome",
allostatic load in the sauna, cognitive fitness tracking, "'Citizen Science' trials for supplements
and other non-RX interventions", and "What supps would you test first in a 'citizen science' trial
of n=50+?". This is self-experimentation on the same compound classes RNAWiki catalogues.
[capture: index-1440-full, content-1440-tile-02, content-1440-scroll-90]

**F25.** *(qualified)* The record shape is **at most** seven fields on one line and a bit: title,
category chip (a coloured square plus a name), free-text tags, participant avatars, reply count,
view count, last-activity date. Many rows show only four of them — "Remember The Email-Inbox Project
by Mark Wilson?" carries title, avatars, counts and date and nothing else. One row does show an
eighth and ninth element: the pinned announcement adds an excerpt and a pin glyph, so "no row shows
an eighth" was true only of the single capture cited. [capture: content-1440-tile-02,
index-1440-tile-01]

**F26.** What it does not show, anywhere in either viewport, is every field that would let a reader
judge the evidence. There is no author of record, no n, no sample size, no duration, no measurement
device, no protocol, no outcome, no verified or reviewed mark, no peer or staff status beyond the
one pin, no replication count, no confidence, no "self-reported" label, no licence, no DOI or other
identifier, and no version. The list carries no evidence-quality signal of any kind. [capture:
index-1440-full, content-1440-tile-02, content-1440-scroll-90]

**F27.** The only quality-shaped marks available are popularity proxies — reply count, view count,
avatar count — and the design gives typographic weight to the weakest of the three. "Tracking blood
sugar" at a bold 15.6k reads as the most authoritative row on the page purely because the number is
bold and large; the row itself may be one person's n=1 log. A reader scanning this list is sorting
by attention while feeling like they are sorting by quality. [capture: index-1440-tile-01,
content-1440-scroll-90]

**F28.** *(qualified)* The category chip is the only structural classifier and it is doing quality work it was
never designed for, badly. The categories visible are Self Experimentation, Project Logs, Research &
Media, Apps & Tools, QS newcomers, Quantified Self, Diet Nutrition and Weight, and Meta — but only
Project Logs gets a distinct blue square and only Meta a grey one; the rest all share the same
brown — **six** categories sharing one colour, not the five the JSON record originally counted. So
the chip colour separates almost nothing, and a reader cannot distinguish an n=1 project log from a
research announcement or a tool question by colour at scanning speed. [capture: index-1440-tile-01,
content-1440-scroll-90]

**F29.** User-contributed and editorial content are distinguished by exactly one mark: a small pin
glyph plus the grey "Meta" chip on the welcome row. Nothing else on the page separates a staff post
from a stranger's health claim. "Been tracking liver health for 7 years, not sure what to do with
it" and the forum's own official announcement are set in the same face, size, weight and colour.
[capture: index-1440-tile-01, content-1440-scroll-90]

**F30.** What a reader gets here that a trial registry cannot give them is the mess and the failure.
The visible titles include "Been tracking liver health for 7 years, not sure what to do with it",
"Trying to make sense of my life with scattered data", "Building an app to enhance self-regulation.
Do these 3 assumptions kill my product?" and "How do you keep track of everything and learn what
works? So many options and communities". A registry records intent, structure and status; this
records what actually happened to people who tried, including the ones who measured for years and
got nothing usable. Recruiting also happens in the open here — "Research participants wanted: Period
App Users". None of that has a registry field. [capture: content-1440-tile-02,
content-1440-scroll-90]

**F31.** Dates are the one uncertainty-adjacent signal the design handles well. Every row carries its
last activity — "7d" under a week, then Jan 8, Feb 26, Mar 2, and Dec 2025, Nov 2025, Apr 2021 once
past the year boundary. Relative when recent, absolute when old, on every row without exception, so
a reader can discount a five-year-old thread without opening it. [capture: content-1440-tile-02,
content-1440-scroll-90]

**F32.** *(qualified)* No theme choice and no keyboard palette.
`domEvidence.prefersColorScheme.found` is false across 29 stylesheets and `htmlAttributes.dataTheme`
is null — the site is light-only, with no toggle observed. The visible search affordance is an
**icon-only magnifier with no on-screen text**; `button Search` in `domEvidence.searchAffordances`
is its accessible name, so "a single labelled button" read a DOM value as if it were design.
`kbdTexts` and `ariaKeyshortcuts` are both empty, so there is no evidence of a command palette here
and no shortcut hint is claimed. [capture: index-1440-tile-01, content-1440-scroll-50]

**V1.** *(verifier addition)* Mobile drops **two** of the seven fields, not one. The view count
disappears (F9) and the participant cluster collapses to a single avatar, so both of the signals a
desktop reader uses to gauge how much a record has been looked at, and by how many people, are gone
at 375 px. "Sharing my odd collection of custom-built, self-quantification software" shows five
avatars, 48 replies and 3.3k views at 1440; at 375 the same row shows one avatar, a bare 48 and a
date. RNAWiki's browse has to decide which evidence fields survive at 320–375 px rather than letting
the layout choose for it. [capture: index-1440-tile-01, content-375-tile-01, content-375-scroll-90]

**V2.** *(verifier addition)* Exactly one row in the list carries an excerpt, and it is the
promotional one. "Welcome to the new QS Forum!" is the only row with body text beneath its title;
the other twenty-nine expose title, chip, tags, counts and a date and nothing more, at either width.
So the list gives a reader no way to learn anything about a record without opening it, and the
single slot the design reserves for prose is spent on a sign-up pitch. This is the sharper form of
F6: the cost is not only that marketing takes the top slot, it is that the one preview affordance in
the whole schema is used for marketing. [capture: index-1440-full, index-375-full]

**V3.** *(verifier addition)* The column legend is set no darker and no heavier than the values it
labels. "Topic / Replies / Views / Activity" render in the same small grey as the Activity dates
beneath them, and lighter than the counts in the two columns they name — the legend has less visual
authority than any value in its own column. Read with F14, the page states what its numbers mean
exactly once, faintly, on the first screen only. [capture: index-1440-tile-01]

## 9. Absence handling

**F33.** An empty field renders nothing and the row collapses around it. "Remember The Email-Inbox
Project by Mark Wilson?" and "Do you use Obsidian/RemNote/Roam/Notion to track your notes?" carry no
metadata line whatsoever — no chip, no tags, no "uncategorised", no placeholder, no greyed dash. The
row is simply shorter than its neighbours. [capture: content-1440-tile-02, index-1440-tile-01]

**F34.** Partial absence collapses the same way. "The Human Kernel: A Control Systems Model for
Business/Work Performance" shows a bare tag, "tools", with no category chip in front of it — the
chip is dropped and the tag closes up into the space rather than leaving a gap where the chip would
have been. [capture: content-1440-tile-02, content-1440-scroll-90]

**F35.** But a measured zero is printed. "Apple Health XML data with XSLT" shows "0" replies, as do
"Trying to make sense of my life with scattered data" and five other rows. So the design draws
precisely the distinction RNAWiki needs between a value that was measured and came out empty, and a
field that was never populated: zero prints, missing vanishes. It is the same rule stated in the
uniqueness constraint, observed working on a real list. [capture: content-1440-tile-02,
content-1440-scroll-90]

## For RNAWiki

### Borrow

**B1 — structured data blocks, and browse/filter.** The absence rule confirmed in the wild: a
missing field renders nothing and the row collapses; a measured zero renders "0". RNAWiki's
uniqueness constraint already requires the first half. This site shows the second half is what keeps
it honest — without it, a collapsed row is ambiguous between "not measured" and "measured as none",
which is the exact distinction boundary 6 exists to protect. [capture: content-1440-tile-02,
content-1440-scroll-90]

**B2 — browse/filter.** Age on every row, relative under a week and absolute past a year, never
omitted. Cheap to build and it is the only signal on this page that lets a reader discount a record
before opening it. [capture: content-1440-scroll-90]

**B3 — browse/filter, and the dossier reading column.** The restraint of the row: one typeface, no
cards, no fills, hairline rules, the title carrying all the weight. Thirty rows with zero decoration
stay readable at scanning speed, which is what a 619-compound browse needs. [capture:
content-1440-tile-02]

**B4 — structured data blocks.** The letter-disc fallback. Where an identity has no image, render an
identity token that still distinguishes one entity from another, never a generic silhouette. Borrow
the glyph, not the colour: on this page the disc colours repeat and do not key to identity (F21).
Applies wherever an RNAWiki source, registry or reviewer has no mark of its own. [capture:
index-1440-tile-01]

### Avoid

**A1 — home (frozen search bar), and browse/filter.** The navy Sign Up / Log In pair as the visual
peak of the first screen. On both viewports the account chrome beats the content. RNAWiki's home
search bar is the single primary action and nothing may compete with it; a filled dark account
button beside it is not a borrow and would be discarded under the frozen constraint. [capture:
index-1440-tile-01, index-375-tile-01]

**A2 — structured data blocks, and browse/filter.** Bold weight on a popularity number. RNAWiki must
never give a view count, a contribution count or any attention proxy more typographic weight than an
evidence-tier mark or a model-organism label. This page makes 15.6k the most authoritative-looking
object in the list. [capture: index-1440-tile-01, content-1440-scroll-90]

**A3 — browse/filter.** Non-sticky column headers over a long numeric list. If an RNAWiki browse
table carries counts, either the legend persists through the scroll or every number carries its own
unit. Thirty rows of unlabelled figures is the failure at scroll-50 here. [capture:
content-1440-scroll-50, content-1440-scroll-90]

**A4 — browse/filter.** A chip taxonomy where most chips share one colour. If RNAWiki marks evidence
tier or organism with a coloured chip, the levels must be separable at a glance or the chip should
be text only — a classifier that does not classify is worse than none, because it looks like it
does. [capture: content-1440-scroll-90, index-1440-tile-01]

**A5 — home, and browse/filter.** A promotional or announcement row occupying the first slot of the
data list. The pinned sign-up pitch sits where the first record belongs and carries the page's
largest number. [capture: index-1440-tile-01]

**A6 — browse/filter, and the reference/definitions page.** A page that ends in nothing. No footer,
no pagination, no route onward on either viewport. RNAWiki puts its shared explanatory sentences on
one linked definitions page, so every list must be able to reach it; ending in white space makes
that page unreachable from the surface that most needs it. [capture: content-1440-tile-03,
content-375-tile-05]

**A7 — browse/filter at 320–375 px.** Dropping a column on mobile without relabelling what survives.
At 375 the Views column disappears and the remaining number keeps no label anywhere on screen.
[capture: index-375-tile-01, content-375-scroll-90]

**A8 — browse/filter at 320–375 px.** Letting the viewport decide which fields survive. This page
silently drops the view count *and* the participant cluster at 375 (V1). RNAWiki should name the
fields that must survive a narrow width — and drop the rest deliberately. [capture:
content-375-tile-01, content-375-scroll-90]

**A9 — home, and browse/filter.** Spending the list's only prose slot on an announcement while every
record shows title-only (V2). If a browse row can carry one summary line, it belongs to the record.
[capture: index-1440-full]

**A10 — browse/filter.** A column legend set no darker and no heavier than the values it labels
(V3). A legend that reads as quieter than its own data will not be read at all. [capture:
index-1440-tile-01]

### Phase 2 verdict

**not-named.** forum.quantifiedself.com holds no row in the Phase 2 table; that table's governing
references are Apple, awwwards.com, smashingmagazine.com, linear.app/method, stripe.com/docs,
pudding.cool, vercel.com/docs and quantamagazine.org, with theverge.com and atlasobscura.com
explicitly unassigned. This is an A2 community site studied for information design, so nothing here
can strengthen or overturn an existing assignment.

It does, however, argue for a surface it does not currently hold. Browse/filter is governed by
awwwards.com with no secondary, justified as the only measured site with no reading column — a
filter description across a 1,336 px grid. That is a filter surface for images. RNAWiki's browse is a
filter surface for uncertain records carrying counts, dates, tier marks and absent fields, and this
page is exactly that while awwwards is not. Recommend adding forum.quantifiedself.com as
**browse/filter secondary, scoped strictly to row composition and absence handling** — B1, B2 and B3
above — and explicitly not to its chrome, its emphasis choices, its chip palette or its scroll
behaviour, all of which are listed under Avoid. Nothing here bears on the dossier reading column
(the widest text block on the page is a two-line title; there is no reading column to measure), the
contents rail, the citation evolution map, or the global search overlay — `kbdTexts` and
`ariaKeyshortcuts` are empty, so this site offers the palette pattern no support and it stays with
vercel.com/docs.

## Verification

Independently verified on 2026-09-04 against the eleven required captures plus `content-1440-tile-03`
and `content-375-tile-05`. **29 confirmed, 16 qualified, 1 refuted, 3 added (V1–V3).** Byte-identical
duplicates were read through the file the manifest lists first. Nothing was struck silently; every
qualified finding above is marked *(qualified)* in place and rewritten there.

**Refuted**

- **F18** — removed. A 3 px loading strip and a toast region, both at height 0, are DOM records that
  render in no capture. The cited capture shows neither, so the finding contains no visual
  observation about this design.

**Qualified**

- **F1** — the counts are not demoted with the chip, tags and date; they carry three weights.
- **F3** — the emphasis is a three-band heat scale across *both* count columns, not a bold/grey split
  on views; 3.3k is a high count and is not bold.
- **F4** — the navy buttons are the highest-contrast non-avatar fills, not the only saturated ones;
  saturated letter discs sit on the same screen.
- **F5** — the mobile Log In pill sits in the right half of the header, not near its centre, and there
  is no Sign Up button at 375.
- **F7** — measured rows run about 70 px and 82 px, not 55 px and 90 px; nine desktop rows means eight
  complete plus one cut.
- **F8** — five visual columns carry four labels; the avatar column has no header, and the pinned
  Apr 2021 row breaks the reverse-chronological run at its head.
- **F12** — the mid-row gap measures roughly 450–550 px, not 200–400 px.
- **F13** — the sticky header is identical within each width but not across them; mobile has no
  Sign Up.
- **F17** — the infinite-loading inference is withdrawn, and the trailing white measures about 110 px
  desktop and about 100 px mobile.
- **F19** — `imgCount: 86` cannot be checked against a capture, and the header wordmark is an image
  that is not an avatar; the "no chart or figure anywhere" observation stands.
- **F20** — the participation signal exists at desktop only; mobile shows one avatar per row.
- **F21** — the glyph distinguishes, not the colour; disc colours repeat.
- **F22** — there *is* an accent inside the list: slate-blue on larger counts, a fourth ink spent on
  popularity.
- **F25** — seven fields is the maximum, not the shape of every row; the pinned row adds an eighth and
  ninth element.
- **F28** — six categories share the brown square, not five; the evidence line already named six.
- **F32** — the search control is an icon-only magnifier; `button Search` is its accessible name, not
  a visible label.

**Unchanged**

The banner handling is upheld: no consent or cookie overlay is visible in any capture at either
width, and `bannerActions` named ordinary page content. The Phase 2 verdict and the browse/filter
secondary recommendation stand; V1–V3 fall inside the same narrow scope of row composition, field
survival and legend legibility.
