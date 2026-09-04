# openhumans.org — Track A2 viewing notes (information design of community-sourced data)

Open Humans is a platform where individuals connect their own personal data — genomes, wearables,
continuous glucose data, microbiome results, GitHub commits — to studies and tools run by other
members and by named academics, and choose what to share. Two pages were captured:
`https://www.openhumans.org/` (index) and `https://www.openhumans.org/explore-share/` (content).
The content page is a directory of 20 project cards in a three-column layout at 1440 px and a single
column at 375 px; it is the closest thing on the site to a browse surface, and it carries the whole
weight of presenting community-run studies to a stranger. This is a health-data site, not a
longevity site — the projects are genomics, diabetes closed-loop data, microbiome, mobility and
blood pressure — but it is directly on our problem, because every record on it is
participant-contributed and none of it has been through anything a reader can see. A note on the
capture record before anything else: `bannerActions` says a banner was left standing on both content
passes because the detector found a `div.panel-body` whose only control was "Learn more". No consent
or cookie overlay is visible in `content-1440-scroll-00.png` or `content-375-scroll-00.png`; the
element that matched is a project card body. Nothing in these images should be read as an uncleared
banner.

## 1. Visual hierarchy

**F1.** On the home page the order is: the wordmark "Open Humans" at roughly 40 px, then the two-
line tagline at roughly 20 px, then a single outlined "Learn more" button, then a hand-drawn sketch
occupying the right half. Hierarchy is carried almost entirely by size and by centring inside a
half-width column — there is no colour change between the title and the tagline, both are the same
dark grey. Inside the hero band the one saturated element is the orange "Join now!" pill in the top-
right chrome, so the strongest colour there belongs to the navigation, not to the content. The claim
stops at the hero: the same 900 px first screen also carries the Featured projects row, with a
saturated purple "QF" square, two teal avatars and three orange "Learn more" buttons. [capture:
index-1440-tile-01.png, index-1440-full.png]

**F2.** On the content page there are exactly two levels above the cards: an h3 "Explore and share
your data" at roughly 26 px and one sentence of grey body text under it. Everything below is card.
The manifest records a single heading in the whole document (`headingOutline`, one `h3`), and that
matches what the eye sees — the 20 project names are styled like headings at roughly 20 px but they
are peers of one another, so the page is a flat list with no second level and no grouping.
[capture: content-1440-tile-01.png, content-1440-full.png]

**F3.** Inside a card the order is deliberate and consistent, and it is the best-designed thing on
the site: project name (20 px, dark), then person or team name (15 px, dark), then affiliation (13
px, light grey), then the member count with only the number in bold, then description at 14 px, then
a hairline rule, then the orange "Learn more" button. Four type levels in a 150-px-tall block, with
the numeral as the only bold thing, repeated identically across all 20 records. [capture:
content-1440-tile-01.png, content-375-tile-02.png]

## 2. Where the eye lands first

**F5.** At 375 px the hero stacks and the order improves: title, tagline, "Learn more", sketch. The
eye lands on the words. On the content page at both widths the eye lands correctly on the h3 and its
one explanatory sentence, then on the first card's logo — the strongest visual mark in the card is
the project avatar (about 85 px at 1440, about 50 px at 375), and it is the card's least informative
field: most avatars only restate the project name in type, though Transbiome and The Quantified
Heart do carry a topical picture.
[capture: index-375-tile-01.png, content-375-scroll-00.png, content-1440-tile-01.png]

## 3. Information density

**F6.** The first screen of the content page at 1440 px holds six complete project records — name,
person, affiliation, member count, description, action — inside 900 px, plus the beginning of three
more: rows one and two reach their "Learn more" button, row three is cut. That is still high density
and it is readable, because every card repeats the same six fields in the same order and the reader
learns the pattern once. The whole page is 2,264 px for 20 records; the same 20 records take
5,999 px at 375 px. [capture: content-1440-tile-01.png, content-1440-full.png, content-375-full.png]

**F7.** The density is bought at the cost of every list affordance. There is no result count ("20
projects" appears nowhere), no filter, no sort control, no search, no category, no pagination. There
is also no order a reader can follow. Member counts trend downward, but not strictly: column one
reads 1479, 465, 403, 286, 164, 70, 48 and column three reads 695, 485, 302, 262, 77, 62, yet the
top row reads 1479, 685, 695 and column two reads 685, 586, 260, 269, 92, 70, 31. At 375 px the same
records arrive as 1479, 685, 695, 465, 485, 586 — a different sequence again. So there is no exact
ranking being destroyed by the layout; there is an approximate one that neither the columns, the
rows nor the mobile stack express, and nothing on screen tells the reader that an order exists at
all. [capture: content-1440-full.png, content-1440-tile-02.png]

## 4. Whitespace

**F8.** Whitespace is spent on outer margin and on separation between cards, not on the reading. The
content column is about 1,160 px inside a 1,440 px viewport, so roughly 140 px is given away on each
side; card gutters are about 24 px horizontally and vertically. Inside a card the padding is about
16–20 px and the description sits at roughly 300 px measure, around 55 characters — much narrower
than any reading column in the Phase 2 table, which is right for a card and would be wrong for
prose. [capture: content-1440-tile-01.png]

**F9.** On the home page whitespace does real structural work: each section is preceded by a
full-width hairline rule and roughly 50 px of air above a centred grey section heading, and that
rule-plus-air pattern is the only grouping mechanism on the page. It says "a new kind of thing
starts here" three times — Featured projects, Recent activity, Recent news — and it says it clearly
enough that the reader never needs a box. [capture: index-1440-full.png, index-1440-tile-02.png]

## 5. Long scroll

**F10.** One thing persists and one thing only: a 54 px fixed navigation bar, present at the top
edge of `content-1440-scroll-50.png` and `content-1440-scroll-90.png` and of the mobile equivalents.
It carries the wordmark, four links, "Log in" and "Join now!". At 1440 px the current section keeps
a pale tinted box behind "Explore & share" throughout the scroll, and that highlight is the only
orientation cue on the entire page — no progress indicator, no contents rail, no sticky section
heading, no "card 14 of 20". At 375 px the links collapse into an unopened hamburger, so even that
cue is gone and the scrolled mobile page offers no orientation at all. [capture:
content-1440-scroll-50.png, content-1440-scroll-90.png, content-375-scroll-90.png]

**F11.** Rhythm loosens as the page runs. Because card height follows description length, the three
columns go out of phase: row one aligns exactly at y=155, then tops drift about 35 px by row two,
about 55 px by row four and about 110 px by row six, and no two card bottoms line up anywhere. The
page still reads as seven ragged rows rather than as three unrelated ribbons — the drift is visible
but the rows survive. At 375 px the single column removes the problem entirely and the scroll is
calm — the mobile view of this page is better than the desktop view. [capture:
content-1440-tile-02.png, content-1440-scroll-50.png, content-375-scroll-50.png]

**F12.** The end of the page is unresolved. Column three runs out about 220 px before columns one
and two — its last card, Galileo, ends near y=1963 in a 2,264 px page while columns one and two end
near 2141 and 2187 — leaving a large empty rectangle at the bottom right, and then the page simply
stops into a single centred line of pipe-separated footer links (three wrapped lines at 375 px) —
About | Blog | Chat | Member list | two social icons | Contact Us | Community Guidelines | Terms of
Use | Data Use Policy. There is no closing statement, no total, no next page, no invitation.
[capture: content-1440-tile-03.png, content-375-tile-08.png]

## 6. Imagery

**F13.** The home hero is a hand-drawn sketch in orange and purple that does carry meaning: it reads
"your data + you" at the bottom left, a person in the middle, and three arrows to the words explore,
donate, research. It is the site's model of itself in one picture and it survives the drop to 375 px
intact. It is also the only diagram on either page. [capture: index-1440-tile-01.png,
index-375-tile-01.png]

**F14.** On the content page each of the 20 cards carries one contributor-supplied avatar, and they
carry no data at all — a purple circle with wrapped text, a black square wordmark, a "QF" monogram,
a magnifying glass with microbes over trans-flag stripes, a striped photograph, an anatomical heart,
an outline circle reading "Galileo", and for "Mobility data of researchers" a small grey smudge that
resolves into nothing. The manifest's `imgCount` of 28 covers those 20 avatars plus the navbar
wordmark and the two footer social icons, not 28 avatars. It records zero `<svg>` and zero
`<canvas>` on the page: a site whose entire subject is personal data shows not one chart, not one
distribution, not one sample-size bar. The strongest visual element in each record is its least
informative field.
[capture: content-1440-tile-01.png, content-1440-tile-02.png, content-1440-tile-03.png]

## 7. Defers or competes

**F15.** The content page defers almost completely. Plain Bootstrap cards, one accent colour used
only on buttons and links, no shadows beyond a 1 px border, no motion cues, no hover art. That much
is in the captures. The 9.95 % text-to-HTML ratio (4,540 characters of text in 45,632 of markup) is
DOM measurement rather than a visual observation, and the Phase 1 comparison in the original note
was wrong: the highest Phase 1 figure on record is rnawiki.com at 3.76 %, not 8.5 %. The ranking
still holds — 9.95 % is the highest measured in this study — but it is a measured number, not
something the images show. [capture: content-1440-tile-01.png, content-1440-scroll-50.png]

**F16.** The home page competes in two small ways. The orange "Join now!" pill is the loudest thing
on the first screen and it is an account action, not content; and the sketch takes the entire right
half of the hero for a decorative-feeling drawing. The first screen does then offer three featured
projects below the hero rule, but the doorway into the full list of 20 is a single unemphasised nav
link, "Explore & share". [capture: index-1440-tile-01.png]

## 8. Information design of data-heavy, uncertain, community-sourced material

**F17. What kinds of data the content page shows.** Each of the 20 records is a *project*, not a
dataset and not a result: a name, one or more people, an affiliation, a participation count, two
sentences of self-description written by the project owner, and one link out. There is no outcome,
no finding, no result, no data preview, no file listing, no format, no licence, no identifier, no
version, no DOI, no start or end date field. A reader learns who is running something and how many
people joined it, and nothing whatsoever about what came out.
[capture: content-1440-tile-01.png, content-1440-tile-02.png]

**F18. The one quantitative field, and its unexplained split.** Every card carries a count with the
numeral in bold — "Connected by 1479 members", "Joined by 465 members". Two different verbs encode
two different relationships (data-source connection versus study participation) and the page never
says so; there is no legend, no tooltip, no key. It is the only number on the page, it is the only
bolded text on the page, and its meaning changes silently from card to card.
[capture: content-1440-tile-01.png, content-375-tile-02.png]

**F19. How evidence quality and uncertainty are signalled: they are not.** Across 20 records there
is not one verified mark, not one reviewed or approved badge, no peer-review status, no ethics-
approval line, no replication indicator, no confidence statement, no "self-reported" label, no
sample description, no data-quality note, no provenance chain. The only proxies for credibility are
the member count and the small grey affiliation line — New York University, ETH Zurich, Delft
University of Technology, UCSD Design Lab, Wellesley College & NYU, Open Humans Foundation, Center
for Research and Interdisciplinarity (CRI). That affiliation, the closest thing to a provenance
signal the design has, is set in the *smallest and lightest* type in the card, while the popularity
number is set in bold. The design amplifies how many people joined and mutes who is accountable. On
"Imputer" the same slot holds "github.com/arvkevi" — a code repository sits where an institution
sits, in identical styling, with nothing to mark the difference. [capture: content-1440-tile-01.png,
content-1440-scroll-50.png]

**F20. Community-run and institution-run work are drawn identically.** "OpenAPS Data Commons" (a DIY
closed-loop diabetes community), "Nightscout Data Commons" (the same, run by a foundation
committee), and "Data sharing and ethical oversight" (Prof. Dr. Effy Vayena, ETH Zurich) get the
same card, the same type scale, the same button and the same visual weight. Editorial and
user-contributed content are not distinguished anywhere on the page. Only reading the grey line
tells them apart. [capture: content-1440-tile-01.png, content-1440-scroll-50.png]

**F21. There is no time on this page.** No card shows when a project started, when it last collected
data, or whether it is still open. The single date anywhere in the 20 records is buried mid-sentence
in the Keating Memorial card — "during Feb to Jul 2020" — six years before the capture, and it is
prose, not a field. A reader cannot tell a live study from an abandoned one.
[capture: content-1440-scroll-50.png, content-1440-tile-01.png]

**F22. What a reader gets here that a trial registry cannot give them — and what it costs.** The
genuine gift is the *person*: every record names a human being who is accountable for it, in type
one step below the title, which no registry does. The home page adds the second gift, a live "Recent
activity" feed with real timestamps — "17 hours ago", "1 day ago" — showing individuals joining
named data sources. That is a liveness signal a registry structurally cannot produce. It is also
where the absence of quality signalling bites hardest: the freshest, most prominently timestamped
content on the home page is unmoderated account creation. Of the twelve entries visible at 1440 px,
only two are joins of a named data source; ten are new-account rows, and six of those carry
promotional-looking names — "Enterate Seguro", "Ofertas de Billetes Baratos", "Seguros Por Primera
Vez", "Enterate medicare", "Enterate Insurance" and "promiweltmagazine". Recency was designed in; a
filter for whether the recent thing is worth showing was not. [capture: index-1440-full.png,
index-1440-tile-02.png, index-375-full.png]

## 9. Absence handling

**F23. Missing fields render nothing, and that works.** "Genevieve Genome Report — Mad Ball" has no
affiliation line; the grey line is simply absent and the member count moves up. "Keeping Pace — Dr.
Rumi Chunara — New York University" has one. No placeholder, no dash, no "not available", no empty
row. Cards get structurally shorter when they know less, and the reader is never made to read a
blank. [capture: content-1440-tile-01.png]

**F24. Missing sections do not, and it is visible from across the room.** On the home page "Recent
news" is rendered as a full section — hairline rule, 50 px of air, centred 26 px heading — with
absolutely nothing beneath it, and then the footer. An empty container announcing itself is the
exact failure mode the RNAWiki uniqueness constraint forbids, and this page shows what it looks like
at both widths. [capture: index-1440-full.png, index-1440-tile-02.png, index-375-full.png]

**F25. A placeholder that was never replaced is indistinguishable from real content.** The "Gut
Instinct" card's description is the string "gut instinct" — the title in lower case, in the same
14 px body style as every real two-sentence description. The layout has no way to say "this field
was never filled in", so a nearly-empty record and a well-documented one look equally finished.
[capture: content-1440-scroll-50.png, content-1440-tile-02.png]

## 10. Baseline and inferred behaviour

**F26.** The page is light-only. `prefersColorScheme.found` is false across six stylesheets and the
`html` element carries no class, `style` or `data-theme` attribute; the measured body is
`rgb(255,255,255)` on `rgb(51,51,51)`. There is no theme toggle in the chrome in any capture.
*Inferred:* no dark mode exists. [capture: content-1440-scroll-00.png, index-1440-tile-01.png]

**F27.** No command palette and no copy controls. `kbdTexts` and `ariaKeyshortcuts` are both empty,
`copyControls.count` is 0, and `searchAffordances.count` is 0 — and no search field, keyboard hint
or copy button appears in any capture at either width. *Inferred:* there is no ⌘K palette and no
per-record copy affordance; navigation is by nav link and browser find only.
[capture: content-1440-tile-01.png, index-1440-tile-01.png]

**F28.** Two `modal fade` elements are registered as fixed with height 0 alongside the fixed navbar
(`stickyOrFixed`). *Inferred:* dialogs exist somewhere in the flow, most likely behind "Log in" or
"Join now!"; none is open in any capture, so nothing can be said about their design.
[capture: content-1440-scroll-00.png]

## 11. Added in verification

**V1. The fixed bar has no visible edge.** The 54 px navbar is opaque white with no bottom rule, no
shadow and no fade, so scrolled content is guillotined at an invisible line. In
`content-1440-scroll-90.png` the "Learn more" buttons at the top of columns two and three are sliced
horizontally with nothing marking the cut; the same happens to a card border at 375 px. A reader
cannot tell clipped content from finished content. If the dossier gets a sticky header, it needs a
visible edge. [capture: content-1440-scroll-90.png, content-375-scroll-90.png]

**V2. The mobile home page drops half the activity feed.** At 1440 px "Recent activity" is two
columns of six entries. At 375 px only the first six render and "Recent news" follows immediately —
the second column does not stack, it disappears. There is no count, no "show more" and no truncation
mark, so a mobile reader has no way to know that half the feed is missing. A responsive browse list
that silently sheds rows is worse than one that scrolls.
[capture: index-1440-tile-02.png, index-375-full.png]

**V3. Twenty identical "Learn more" links, ordered two different ways.** Every record ends in the
same unlabelled button, so the page presents twenty links whose text names no destination — unusable
out of context and unusable as a link list. Worse, the same card component orders itself differently
across surfaces: on the browse page the button sits below the description behind a hairline rule; on
the home page's featured cards it sits *above* the description, which is then set in a separate
bordered "About:" box. One component, two reading orders, two pages. A browse row should name what
it opens ("Open dossier for X"), and it should read the same way everywhere.
[capture: content-1440-full.png, index-1440-tile-01.png]

## For RNAWiki

**Borrow**

- **The card field order, for browse/filter.** Name → responsible person → affiliation → count →
  description → one action, four type levels inside 150 px, with only the numeral bold. It is
  scannable at six complete records per 1440x900 screen and a reader learns it once. Take the order;
  take the restraint. [capture: content-1440-tile-01.png]
- **Field-level absence with no placeholder, for browse/filter and the dossier reading column.** The
  affiliation line vanishes when there is none and the card gets shorter. This is our stated
  constraint already, rendered, and it looks correct rather than broken. [capture:
  content-1440-tile-01.png]
- **Deference has a measurable price, and it is low.** Plain markup, one accent colour, no
  decoration, and a 9.95 % text-to-HTML ratio — the highest measured in this study, against a Phase
  1 high of 3.76 % (rnawiki.com). That is DOM measurement, not something the captures show. Useful
  evidence for the structured data blocks surface, where the temptation is to add chrome. [capture:
  content-1440-scroll-50.png]
- **A single hand-drawn diagram that states the model, for the reference/definitions page only.**
  The hero sketch explains data → explore/donate/research in one image and survives 375 px. One such
  drawing, placed once, on the page whose job is to explain the model. Not on the home page: nothing
  goes beside or above the search bar. [capture: index-1440-tile-01.png, index-375-tile-01.png]

**Avoid**

- **A section heading with nothing under it.** "Recent news" on the home page, rule and heading and
  air and no content. [capture: index-1440-full.png]
- **A count as the only badge, and the loudest thing in the record.** Bolding "1479 members" while
  greying the institution teaches readers to rank by popularity. On a dossier card the bold slot
  belongs to the evidence tier and the model organism, and the count belongs in the same quiet grey
  as everything else uncertain. [capture: content-1440-tile-01.png]
- **Two labels that mean different things in identical styling with no key.** "Connected by" versus
  "Joined by". Our `CONFIRMED` / `MIXED` / `CONTRADICTED` / `NOT_MEASURED` / `UNKNOWN` distinction
  fails the same way if the five states differ only by a word in body type.
  [capture: content-1440-tile-01.png, content-375-tile-02.png]
- **A list with no stated order, dealt into ragged columns.** Member counts trend downward but
  neither the columns, the rows nor the 375 px stack express a ranking a reader can follow. If a
  browse surface is sorted, the sort must be readable in the reading direction and stated on screen;
  if it is not sorted, say so. [capture: content-1440-full.png, content-1440-tile-02.png]
- **A directory with no count, no filter, no sort and no search.** Twenty records is survivable;
  619 compounds is not. [capture: content-1440-full.png]
- **A community feed with no quality gate in the shop window.** Ten of the twelve timestamped home
  page entries are new-account rows and six read as spam. Any RNAWiki recent-activity element must be
  gated before it is shown, or not shown. [capture: index-1440-tile-02.png]
- **A placeholder that looks like content.** "gut instinct" as a description.
  [capture: content-1440-scroll-50.png]
- **A sticky bar with no visible bottom edge, and a multi-column list that drops rows instead of
  stacking them at 375 px.** [capture: content-1440-scroll-90.png, index-375-full.png]

**Phase 2 verdict — not named, and it should stay that way.** openhumans.org appears nowhere in the
Phase 2 table; it is an A2 community site, studied for information design rather than for a surface
assignment. Nothing seen here argues for giving it one. Where it touches the table is browse/filter,
currently governed by awwwards.com, and it touches it as a counter-example: awwwards was chosen
because it is a stated grid with no reading column, and Open Humans is what the same card idea looks
like *without* the grid discipline — ragged columns, an order no reading direction expresses, a
footer that arrives mid-air. That **strengthens** the awwwards assignment. Its one positive
contribution belongs to the structured data blocks surface, currently governed by stripe.com/docs,
and it is a caution rather than a pattern: Open Humans proves that a repeated six-field record is
learnable in one glance and that field-level absence looks right, and it proves in the same frame
that a record with no evidence marks, no dates and no provenance weight leaves a reader unable to
tell a live ETH Zurich study from an abandoned one-line placeholder. That is precisely the gap our
evidence-tier and model-organism marks exist to fill, and this site is the clearest measured picture
of what the page looks like without them.

**Longevity relevance.** Not a longevity site — the projects are genomics, closed-loop diabetes data,
microbiome, mobility and blood pressure — but squarely relevant to our problem, because every record
is participant-contributed health data presented without a review signal.

## Verification

Verified 2026-09-04 against the captures listed in the manifest: 19 findings confirmed, 13
qualified, 1 refuted, 3 added (V1–V3).

**Refuted**

- **F4 — removed.** Its distinctive assertion, that the 1440 px home page offers no content entry
  point on the first screen, is contradicted by its own cited capture: `index-1440-tile-01.png`
  shows the Featured projects row — three complete project cards with "Learn more" buttons — inside
  the first 900 px. The true parts of F4 survive elsewhere (no search field: F27; the eye pulled by
  the sketch and the orange pill: F1 and F16).

**Qualified**

- **F1** — the "only saturated element" claim holds for the hero band, not the first screen: three
  orange buttons and a saturated purple "QF" square sit above 900 px.
- **F2** — 20 project cards, not 22.
- **F5** — the avatar is about 85 px at 1440 and about 50 px at 375, not 90 px throughout, and
  "carries no information" was overstated: most avatars restate the name, two carry a picture.
- **F6** — six complete records in the first screen, not nine (rows one and two); three more begun.
  20 records on the page, not 22.
- **F7** — there is no exact member-count ranking to destroy. Columns one and three read downward,
  but the top row reads 1479, 685, 695, column two reads 260 before 269, and the 375 px order is
  different again. The lesson survives in weaker form: the list states no order at all.
- **F10** — the active-item highlight is a 1440 px cue only; at 375 px the nav collapses to a
  hamburger and no orientation cue survives.
- **F11** — "three unrelated ribbons" overstates it. Row one aligns exactly and tops drift about
  35–110 px thereafter, so the page reads as seven ragged rows.
- **F12** — column three stops about 220 px short, not 350 px; the footer is one line at 1440 px and
  three at 375 px.
- **F14** — 20 avatars, not 28 images-as-avatars: `imgCount` includes the navbar wordmark and two
  footer icons. The Transbiome mark is a magnifying glass with microbes over trans-flag stripes.
- **F15** — the 8.5 % Phase 1 baseline is not in the record; the highest Phase 1 ratio is 3.76 %
  (rnawiki.com), and the highest non-RNAWiki one is 2.98 % (smashingmagazine.com). The 9.95 % figure
  is DOM measurement, not a visual observation, and it does remain the highest measured here.
- **F16** — the home page does surface three featured projects on the first screen; the doorway to
  the full list of 20 is the unemphasised nav link.
- **F22** — twelve feed entries at 1440 px, not fourteen: ten are new-account rows and six carry
  promotional-looking names; only two are joins of a named data source.
- **F33** — restated for the corrected order, record count and feed numbers.

**Corrected inside evidence, claims unchanged (F3, F17, F19, F21, F29)**

The page carries 20 project cards, counted in `content-1440-full.png`: column one Genevieve, Keeping
Pace, Juno's, lineage, UbiQomix, GitHub Data Import, Transbiome; column two GenomiX, Imputer,
Nightscout, Quantified Flu, Gut Instinct, The Quantified Heart, Mobility data of researchers; column
three openSNP, OpenAPS, Keating, Data sharing and ethical oversight, nobism Ubiqum, Galileo. Every
"22" in those five findings was corrected to 20; F29's "nine records per screen" was corrected to
six. F19's "CRI" was expanded to the affiliation as printed on the Transbiome and Mobility cards.

**Upheld without change**

The banner note is correct: `content-1440-scroll-00.png` (byte-identical by sha256 to
`content-1440-tile-01.png`) and `content-375-scroll-00.png` show no consent or cookie overlay, and
the matched `div.panel-body` is a project card body. Separately, `content-375-tile-02.png` shows the
fixed navbar painted across the middle of a card; that is the tile artifact named in the manifest
caveats, not a page defect, and it was not read as one.
