# biohackrxiv (osf.io) — Track A2 viewing notes

BioHackrXiv is a preprint provider hosted inside the Open Science Framework: authors deposit papers
produced at biohackathons, and OSF supplies the surrounding record page — the identifier, the author
list, the licence slot and the document reader. Two pages were captured. The index is the provider
landing page, `https://osf.io/preprints/biohackrxiv`: a search field, a run of policy links and a
grid of subject tiles. The content page is one record, `https://osf.io/preprints/biohackrxiv/5psfj_v2`
— "Towards Federated Learning Across Biobanks: Prototype Software From The 2026 Carnegie Mellon
University–NVIDIA Hackathon", selected through the OSF API as the most recently published public
record; the API states its licence as CC-BY 4.0.

Three facts about the capture set must be stated first, because they bound every judgement below.
**One:** `content-1440-tile-02.png` does not exist. There is exactly one tile per pass on both pages
at both viewports, so the deep tiles and footer tiles asked for cannot be read and nothing here
describes them. **Two:** every capture is exactly one viewport tall (1440×900, 375×812), including
the files named `-full`. **Three:** `content-1440-full.png`, `content-1440-tile-01.png`,
`content-1440-scroll-00.png`, `content-1440-scroll-50.png` and `content-1440-scroll-90.png` are one
identical file by sha256 (`0a1d2436…`), and at mobile `content-375-full.png` with all three
`content-375-scroll-*` files are likewise one file (`0b38ae94…`). The manifest records `scrollY: 0`
for the captures taken at scroll fractions 0.5 and 0.9. The window did not move. That is the bound
on everything here: nothing below the first fold of either page can be described, and the images
cannot tell us whether the record's remaining fields sit in an independently scrolling pane or simply
below a scroll that was never performed. Everything below is read from the one screen the capture
holds.

A consent banner is standing in every image of every pass. `bannerActions` records the same line four
times: "left: no permitted refusal control in div.footer-links". The pale-yellow cookie notice at the
top of each capture is therefore an artefact of a refusal that could not be given, not a design
choice by OSF about what belongs first. It is excluded from the judgements about intent below, but it
is *not* excluded from the judgements about what a reader's eye actually meets, because a reader who
has not yet clicked "Accept cookies" meets exactly this.

## 1. Visual hierarchy

**F1.** *(qualified in verification.)* On the index the reading order is set by fill weight, not by
type size. First the four solid black rectangles of the subject grid and the solid black "Add A
Preprint" button, which are the only 100%-black filled areas on the page; second the "BioHackrXiv"
heading, which despite being the largest type on the screen is a navy word on white and loses to any
of the black blocks. Type size is the weaker signal. The pale-yellow band above them is the standing
cookie notice recorded in `bannerActions` and is excluded from the order. [capture: index-1440-full.png, index-1440-tile-01.png]

**F2.** The record page has a clean two-level hierarchy for about 300px and then hands over to
someone else's chrome. The title is unambiguously first — bold navy, two lines, running about 970px
across a pale-blue band with nothing else in it. Second is the boundary between the two columns below
it. Third is the grey PDF toolbar ("Page: 1 of 65", zoom controls, "Automatic Zoom"), which is the
browser's built-in viewer furniture and reads as a third-party object dropped into the page.
[capture: content-1440-full.png, content-1440-tile-01.png]

**F3.** Weight is spent in the wrong place in the index policy row. "About | Hackathon preprints |
Submission guidelines | Moderation process | Journal policies | FAQ" are six identical blue links at
identical size, and the bold treatment on that band goes to "Powered by OSF Preprints" — a platform
credit. The one link that tells a reader how much vetting a record received, "Moderation process", is
given no more weight than "FAQ". [capture: index-1440-full.png]

**F4.** The record page uses a real, quiet hierarchy inside the right-hand metadata column: h3 labels
("Authors", "Abstract", "Affiliated Institutions") in bold navy at roughly body size, values beneath
them in normal weight, one field per block. The distinction is carried by weight and a small vertical
gap, not by rules, boxes or colour. This is the most disciplined typography on either page.
[capture: content-1440-tile-01.png]

## 2. Where the eye lands first

**F5.** *(qualified in verification.)* At 1440 on the index the eye lands on the black "Add A
Preprint" button, then on the black subject tiles at the bottom edge. The search field — a full-width
outlined box with a grey placeholder, "Search Preprint…" — is a low-contrast object sitting between
two higher-contrast ones and is third among the page's own objects. The first two are chrome; the
search field is the content action. The yellow notice above them is the standing banner and is
excluded. [capture: index-1440-full.png]

**F6.** At 375 the ordering is worse, and here it is a layout decision rather than a banner artefact.
The full-width black "Add A Preprint" button is placed above the tagline, above the policy links and
above the search field. The search field is pushed to the very bottom edge of the 812px screen and its
top-right corner is physically overlapped by the fixed blue "Help" pill, which covers roughly the
right quarter of the field's top edge rather than half the field. On the first mobile screen, the
primary way in (search) is the least visible thing and the deposit action is the most visible.
*(Qualified in verification: the extent of the overlap was overstated.)*
[capture: index-375-full.png, index-375-tile-01.png]

**F7.** On the record page the eye does land on the content: after the notice, the title is the first
real object, and it is the right one. That is the site's best single moment. Immediately after it the
eye is pulled to the grey PDF toolbar rather than to the metadata column, because the toolbar is a
dense band of controls against the column's plain text. [capture: content-1440-full.png,
content-1440-scroll-00.png]

**F8.** At 375 on the record page the title is unambiguously first and takes five lines, and the two
unlabelled blue icon buttons beneath it (a download arrow and a share glyph) are second. Nothing on
the mobile first screen names what those buttons do. [capture: content-375-tile-01.png,
content-375-scroll-50.png]

## 3. Information density

**F9.** The index first screen is very thin: across 1440×900 it carries a heading, a logo, a
one-sentence tagline, six policy links, one search field, one bold prompt ("Show an example") and
four subject tiles — about eight distinct pieces of information in a full desktop screen, with a
300px dark sidebar beside them carrying nine more navigation items that are about OSF rather than
about preprints. [capture: index-1440-full.png]

**F10.** The record page is dense in exactly one place and thin everywhere else. The dense place is
not the site's own layout: it is the first page of the embedded PDF, which carries a block of roughly
forty author names with superscript affiliation numbers and small green ORCID dots. The site's own
contribution — the right-hand column — shows four fields before the fold. The page inherits its
density from the document instead of designing it. [capture: content-1440-tile-01.png]

**F11.** Lists get two treatments and neither is a table. Policy links are a pipe-separated inline
run that wraps to three ragged lines at 375. Subjects are a two-column grid of solid black tiles with
white centred labels. There is no table, no column-aligned field/value list and no sortable list in
any capture. The one field/value structure on the site is the vertical metadata stack, and it is
stacked, not tabulated. [capture: index-1440-full.png, index-375-full.png, content-1440-tile-01.png]

**F12.** Overflow is handled by truncation with a named control rather than by a scroll: the author
list ends at eleven names and offers a grey "See more" pill; the abstract is cut after two lines with
an ellipsis and a blue "Read more". Both controls say what they reveal. This is a reasonable pattern
and it is the only progressive disclosure visible in the capture set. [capture: content-1440-tile-01.png]

## 4. Whitespace

**F13.** *(qualified in verification — the original claim that the sidebar carries nothing about the
record is wrong.)* The largest single expenditure of space on the record page is the 300px dark navy
sidebar — about 21% of a 1440 screen. It is record-aware: on the record page the Preprints branch is
expanded to Discover → Preprint details → **Overview**, with Overview highlighted. What it carries is
nothing *from* the record: no title, and none of the record's thirteen headings. The record's own
reading area is what remains of the width. [capture: content-1440-full.png, index-1440-full.png]

**F14.** *(qualified in verification: ~115px, not 180px.)* The second largest is the pale-blue title
band on the record page: the title's second line ends near y=320 and the band ends near y=435, so
about 115px of band sits below the title, holding only two small icon buttons pushed to the right
edge. The space is
generous and says "this title matters", which is correct, but it is spent above the content and not
between the fields, so it buys emphasis rather than grouping. [capture: content-1440-full.png,
content-1440-scroll-00.png]

**F15.** *(qualified in verification.)* On the index a band of roughly 120px of nothing sits between
"Show an example" (y≈557) and "Browse By Subjects" (y≈675). It is the only gap on the page that is
empty across the full column width, which is what makes it read as a gap rather than as a section
break — but it is not unique in size: the h1-to-tagline band above it is ≈100px, filled only by the
wordmark to its right.
[capture: index-1440-full.png]

## 5. Long scroll

**F17.** There is no long scroll to judge, at either viewport, and that is the finding. All three
desktop viewport captures taken at scroll fractions 0, 0.5 and 0.9 are one byte-identical file, and
the manifest records `scrollY: 0` for all three; the mobile set behaves the same way. The window does
not move. [capture: content-1440-scroll-00.png, content-1440-scroll-50.png,
content-1440-scroll-90.png, content-375-scroll-50.png]

**F18.** What persists therefore persists by construction rather than by stickiness: the dark
sidebar, the consent notice and the blue "Help" pill are in every frame because the page never
scrolls beneath them. I cannot demonstrate that the sidebar is a sticky rail; the captures cannot
test it. The Help pill is genuinely fixed — `stickyOrFixed` lists a `FabButtonFrame` at `top: 800,
height: 60`, which matches the pill's position in the desktop frames, and a `ContainerGradient` at
`top: 500, height: 400` for the panel it opens. (Inferred; domEvidence key `stickyOrFixed`.)
[capture: content-1440-scroll-90.png, index-1440-full.png]

**F19.** The record's own outline never appears. `headingOutline` lists thirteen headings — after
"Affiliated Institutions" come "Public Data", "Public Preregistration", "Conflict Of Interest",
"Supplemental Materials", "Preprint DOI", "License", "Subjects", "Tags" and "Citation" — and not one
of them is visible in any capture at either viewport. Why is not observable: the images cannot
distinguish an inner scrolling pane the window never reaches from a window scroll that never
happened. There is one cue that more exists — the metadata card is sliced by the bottom edge
mid-logo — and no other. This is where the rhythm breaks: not part-way down a long page, but at the
first fold. *(Qualified in verification: the inner-pane mechanism and the "no visual cue" claim both
went past the captures.)* (Inferred that these fields exist below the fold rather than not at all;
domEvidence key `headingOutline`.) [capture: content-1440-scroll-90.png, content-375-scroll-50.png]

**F20.** *(qualified in verification.)* There is no end of the page to describe. No footer, no
next/previous record and no related records appear in any capture. Routes out do exist and sit at the
top or the side: the desktop breadcrumb `Preprints / BioHackrXiv / 5psfj_v2` does link back to the
provider, and the sidebar carries Preprints → Discover. [capture: content-1440-full.png, content-375-tile-01.png]

## 6. Imagery

**F21.** `imgCount` is 3 and `canvasCount` is 0 on the record page, and what the images do is mostly
branding. The BioHackrXiv wordmark — an angular black line drawing — appears large and centred on the
index, again as a small chip beside the record title, and a third time inside the PDF's own first
page. Seeing the same mark twice within 300px of the record title is repetition, not information.
[capture: index-1440-full.png, content-1440-tile-01.png]

**F22.** One image is used as a data value: the "Affiliated Institutions" field renders the Carnegie
Mellon University logo as a tile rather than as text. A logo is faster to recognise than a name and
slower to read against a list; here it is also cut off by the fold, so it delivers neither.
[capture: content-1440-tile-01.png]

**F23.** *(qualified in verification: the mark cannot be identified at capture scale.)* A small green
dot follows each author name in the PDF's own cover block, and it belongs to the PDF, not to the
site. The site's own author list, three inches to the right, has no equivalent. The dot is a few
pixels across and no wordmark inside it is readable, so it should not be reported as an ORCID mark —
only as a per-author mark the document carries and the record page does not repeat. [capture: content-1440-tile-01.png]

**F24.** There are no diagrams, charts or figures of the site's own making on either page, and the
layout does not collapse without them — it simply leaves the pale-blue band empty (F14). Nothing here
demonstrates a fallback for a record with no image, because both pages are logo-only in the first
place. [capture: index-1440-full.png, content-1440-full.png]

## 7. Defers or competes

**F25.** *(qualified in verification: the consent notice is a banner artefact and is not counted.)*
The record itself defers; the platform around it competes. The title, the metadata column and the
field labels are quiet, unornamented and correctly ordered. Around them sit two pieces of furniture
that carry nothing of this record: a 300px dark navy sidebar of application navigation, and a fixed
circular "Help" pill. Their combined visual weight exceeds the record's. [capture: content-1440-full.png, content-1440-scroll-50.png]

**F26.** *(qualified in verification: at 1440 it is the card, not the logo.)* The competition becomes
physical, not just visual. The Help pill covers the lower right of the metadata card beside
"Affiliated Institutions" at 1440 — the Carnegie Mellon logo itself sits further left, at the card's
leading edge — overlaps the search field's top-right corner on the mobile index, and covers part of
the embedded viewer's toolbar on the mobile record. A control that covers content on all three
screens captured is not deferring in any sense. [capture: content-1440-full.png, index-375-full.png,
content-375-tile-01.png]

**F27.** *(qualified in verification: the measurement and "directly above" were both wrong.)* The
heaviest competition on the index is the browse grid. Four solid black rectangles are the
highest-contrast objects on a page whose primary action is the search field — which sits about 215px
higher, with "Show an example" and the "Browse By Subjects" heading between them. The subject filter
out-shouts the search. [capture: index-1440-full.png]

## 8. Information design of data-heavy, uncertain, community-sourced material

**F28.** What the record page shows, in the order it shows it: a breadcrumb carrying the record
identifier and version together (`Preprints / BioHackrXiv / 5psfj_v2`); the title; a download control
and a share control as unlabelled icons; the full document embedded as a 65-page PDF; and a metadata
column of "Authors", "Abstract" and "Affiliated Institutions". Below the fold, per `headingOutline`,
the fields continue: "Public Data", "Public Preregistration", "Conflict Of Interest", "Supplemental
Materials", "Preprint DOI", "License", "Subjects", "Tags", "Citation". [capture: content-1440-full.png,
content-1440-tile-01.png]

**F29.** **The site signals evidence quality by inventory, not by badge, and this is the one idea
here worth taking.** There is no star rating, no score, no tier, no peer-review stamp, no
"self-reported" flag, no sample count, no replication mark and no confidence indicator in any capture
at either viewport. Instead the record has a fixed list of named slots, and the slot names are the
questions a sceptical reader would ask: did the authors release the data, did they preregister, did
they declare a conflict, what licence applies, what is the identifier. A reader learns the quality of
a record by seeing which of those slots is filled. That is a more honest mechanism than a badge,
because it cannot be inflated — but it works only if the reader can see the slots, and the slots below
"Affiliated Institutions" are named only in `headingOutline`: their rendered state was never seen.
*(Qualified in verification: scope narrowed from "anywhere" to "in any capture".)* [capture:
content-1440-tile-01.png]

**F30.** *(qualified in verification: the inner-pane mechanism is not observable.)* The mechanism is
then placed where it cannot be seen. Not one quality field is visible in any capture at either
viewport (F17, F19). At 375 not
even "Authors" or "Abstract" are reachable in the captured frames. A reader arriving at this record
sees a title, a logo and a PDF, and nothing at all about whether the work was moderated, what its
licence is or whether data exists. The evidence design is real and it is invisible.
[capture: content-375-scroll-50.png, content-1440-scroll-90.png]

**F31.** One genuine, unexplained provenance signal is visible: author names render in two states.
"James Mu", "Aditya Kumar Karna", "Kumar Koushik", "Telaprolu", "Jeff Winchell", "Jasmine Baker" and
"Espen Hagen" are blue links; "Tyler Jay Yang", "Caiwei Maggie Zhang", "Md Enamul Hoq" and "Kyulin
Kim" are plain dark text, inside one comma-separated list. What the two states mean — plausibly a
claimed, resolvable account against a string typed into a form — is stated nowhere on the page and
cannot be verified from the captures. A two-state identity mark of that kind is worth a great deal on
community-deposited material and costs one colour; here nothing tells the reader it means anything at
all. *(Qualified in verification: the meaning was asserted, not observed.)* [capture:
content-1440-tile-01.png]

**F32.** User-contributed content is not distinguished from editorial, because there is effectively no
editorial layer to distinguish it from. The record is a container: the site supplies the breadcrumb,
the field names and the reader, and the author supplies everything with meaning in it, including the
title, the abstract, the affiliations and the 65 pages. The one visible difference between the
site's text and the author's is capitalisation — the site renders the title in Title Case ("…Prototype
Software From The 2026…") where the PDF's own cover sets it in sentence case ("…Prototype Software
from the 2026…"). *(Qualified in verification: that reads as automatic title-casing, not an editorial
act. Stored string or CSS `text-transform` cannot be told apart here, and either would capitalise a
unit or a gene symbol the same way.)*
[capture: content-1440-tile-01.png]

**F33.** What a reader gets here that a trial registry cannot give them: the document itself,
immediately, in the page, at page 1 of 65, alongside a licence that states what may be done with it
and a DOI that will resolve later. A registry gives structured fields and no text. The trade is
stated plainly by one number in `domEvidence`: `textToHtmlRatio` is 0.0134 — 2,797 characters of
visible text inside 208KB of delivered HTML. The meaning of this page is locked inside a PDF that the
site cannot quote, excerpt or deep-link into, and that only the embedded viewer's own find control can
search. You gain the document and lose everything a structured record is for. *(Qualified in
verification: "cannot search" was wrong — the viewer's toolbar carries a magnifier.)* [capture: content-1440-tile-01.png]

**F34.** Not longevity-relevant, and it should be said plainly rather than stretched to fit. The
venue publishes software written at biohackathons; the record captured is a federated-learning
prototype for biobank infrastructure. There is no intervention, no dose, no organism, no outcome
measure and no trial here. BiohackrXiv is not a source of longevity evidence and should not be
treated as one. It is useful to this study only as an information-design reference for how a platform
frames a record it did not write. [capture: content-1440-full.png, index-1440-full.png]

## 9. Absence handling

**F35.** Absence handling cannot be observed in this capture set, and I will not describe it. Every
field that could plausibly be empty on a hackathon preprint — "Public Data", "Public
Preregistration", "Conflict Of Interest", "Supplemental Materials" — lies outside every capture at
both viewports (F19). Nothing here shows whether OSF renders an empty heading, a placeholder, a "not
available" line or nothing at all. [capture: content-1440-scroll-90.png, content-375-scroll-50.png]

**F36.** What can be observed is the opposite case — the page's handling of *too much*, which is
consistent and well done: eleven author names then a grey "See more"; two lines of abstract then an
ellipsis and a blue "Read more". Both controls name what they reveal rather than saying "more".
[capture: content-1440-tile-01.png]

**F37.** One inference about absence is safe enough to record with its evidence. `headingOutline`
returns all thirteen headings for this record, including "Public Preregistration" and "Supplemental
Materials", which a hackathon software preprint is unlikely to have filled. That points to a fixed
field skeleton rendered whether or not a value exists — the design our own uniqueness constraint
forbids, since an empty heading is repeated markup that appears on every record and adds no
per-record words. Marked inferred; the captures do not show the rendered result. (Inferred;
domEvidence key `headingOutline`.) [capture: content-1440-tile-01.png]

## 10. Baseline observations from domEvidence

**F38.** No command palette and no keyboard shortcut is advertised: `kbdTexts` is empty and
`ariaKeyshortcuts` is empty, so there is no `⌘K` or `/` hint anywhere. `searchAffordances` finds
exactly one on the record page — the sidebar's "Search OSF" — so the record page carries no
site-level or provider-level search of its own. *(Qualified in verification: it does not follow that
there is "no way to search within the record". The embedded viewer's magnifier is visible in its
toolbar and `searchAffordances` does not see inside it.)* `scriptTokens` reports `metaKey` and `keyCode`
true, so key handling exists in the bundles, but with no advertised hint I make no claim about a
palette. (Inferred; domEvidence keys `kbdTexts`, `ariaKeyshortcuts`, `searchAffordances`,
`scriptTokens`.) [capture: content-1440-full.png]

**F39.** No copy control exists anywhere on the record page: `copyControls.count` is 0. The DOI, the
licence and the citation block — the three fields whose entire purpose is to be copied — have no copy
affordance. Against Stripe's per-block copy button on the structured-data surface, this is the
measured contrast. (Inferred that this applies to the below-fold citation fields; domEvidence key
`copyControls`.) [capture: content-1440-tile-01.png]

**F40.** Light-only, which agrees with our decided default: `prefersColorScheme.found` is false across
59 stylesheets with 0 matched and 0 unreadable, and `htmlAttributes` returns null for `class`,
`dataTheme` and `style`. There is no theme toggle and no dark variant. Every capture is light.
(Inferred; domEvidence keys `prefersColorScheme`, `htmlAttributes`.) [capture: index-1440-full.png,
content-1440-full.png]

## 11. Added in verification

**V1.** The "Authors" field is a comma-joined string rather than a list of items, and it visibly
splits one person into two. The metadata column reads "James Mu, Aditya Kumar Karna, **Kumar Koushik,
Telaprolu**, Jeff Winchell, …" while the PDF author block at the same eye level prints one author,
"Kumar Koushik Telaprolu", with a single affiliation superscript. The same delimiter separates people
and, here, parts of one person's name, so a reader cannot count the authors from the field the site
renders. For our dossier this is the argument for rendering contributor, reviewer and trial-site lists
as delimited items with their own markup, never as a joined string.
[capture: content-1440-tile-01.png]

**V2.** The revision identifier is desktop-only. At 1440 the breadcrumb carries `Preprints /
BioHackrXiv / 5psfj_v2` — the borrowable pattern in B3. At 375 the entire breadcrumb row and the Sign
in button are replaced by a hamburger, so the mobile record's first screen names no version at all and
shows no route back to the provider. A revision that lives only in the desktop breadcrumb is not
addressable in the way B3 claims. [capture: content-1440-full.png, content-375-tile-01.png]

**V3.** At 375 the embedded viewer — the only copy of the record's substance — is not operable. Its
toolbar shows a sidebar toggle, up/down chevrons, the page box "1 of 65" and a minus, then is clipped
by the container's right edge with an unlabelled × as the last visible glyph; the fixed Help pill sits
over that end of the toolbar. The document text beneath renders at roughly 5px. A reader on a phone
can neither page, zoom nor read the record.
[capture: content-375-tile-01.png, content-375-scroll-50.png]

## For RNAWiki

### Borrow

**B1 — the field inventory as the uncertainty signal, adapted.** Take the idea behind F29: name the
questions a sceptical reader asks (is there human data, was it preregistered, who declared a
conflict, what licence, what identifier) and let the answer be whether the slot is filled, rather than
minting a badge or a score. **Surface: structured data blocks** (Stripe governing). Adapt it against
our own constraint, which is stricter than OSF's: absent data must render nothing, so we borrow the
inventory as *one* labelled disclosure that states which slots this compound has and which it does
not — a single line of markup per record, not thirteen empty headings. That inversion is the whole
adaptation. [capture: content-1440-tile-01.png]

**B2 — identity as a two-state, not a badge.** F31's linked-versus-plain author name is the cheapest
honest provenance mark in the study: a resolvable identity renders as a link, a bare string renders as
text, and no ornament is added. **Surface: dossier reading column**, for source authorship and
contributor attribution. Borrow it *with* the legend OSF omits — the meaning of OSF's two states is
stated nowhere on the page and could not be verified from the captures, which is exactly why the
legend is the borrowable part. [capture: content-1440-tile-01.png]

**B3 — the revision in the address.** The breadcrumb reads `Preprints / BioHackrXiv / 5psfj_v2`: the
version travels with the identifier and is visible in the path, so a reader can tell which revision
they are on without opening a history panel. **Surface: citation evolution map.** Our published
programme revisions should be addressable and named the same way in the visible path — and should
survive the mobile layout, which OSF's does not: at 375 the breadcrumb is replaced by a hamburger and
the revision id appears nowhere on the record's first screen (V2).
[capture: content-1440-full.png, content-375-tile-01.png]

**B4 — truncation controls that name what they reveal.** "See more" on a list of forty authors,
"Read more" on a cut abstract (F12, F36). **Surface: dossier reading column and progressive
disclosure (A3).** The pattern is unremarkable and it is correct; both controls are one step, in
place, and say what is behind them. [capture: content-1440-tile-01.png]

### Avoid

**A1 — anything placed in front of the search bar.** On the mobile index the black "Add A Preprint"
button is above the tagline and above the search field, which lands at the bottom edge of the screen
overlapped by a fixed Help pill (F6). **Surface: home — frozen.** This is the precise failure the
freeze exists to prevent, and it is worth recording as the concrete example: a deposit action that
outranks the search field on the first screen. [capture: index-375-full.png, index-375-tile-01.png]

**A2 — a browse grid heavier than the thing it sits under.** Four 100%-black tiles are the highest
contrast on the index and pull the eye straight past the search field (F1, F27). **Surface:
browse/filter** (awwwards governing). Our filter chrome must sit at or below the weight of the
records it filters. [capture: index-1440-full.png]

**A3 — a record page whose window never moves and whose evidence fields stay below the first fold.**
Three scroll captures at 0, 0.5 and 0.9 returning one identical file, with every quality field
unreachable at either viewport (F17, F19, F30); whether an inner pane holds the scroll is not
observable from the images. **Surface: dossier reading column.** The dossier must scroll as one
document; no separate scroll region may hold anything a reader needs to judge the evidence.
[capture: content-1440-scroll-50.png, content-1440-scroll-90.png, content-375-scroll-50.png]

**A4 — embedding the document instead of structuring it.** `textToHtmlRatio` 0.0134 with the meaning
sealed in a 65-page PDF (F33). **Surface: dossier reading column.** Our corpus sits at 8.3% and the
constraint says it must rise. At 1.34% OSF is well above Atlas Obscura's rejected 0.17%, but it fails
the same test for a different reason: not markup wrapped around nothing, but a shell wrapped around a
file the page cannot read. [capture: content-1440-tile-01.png]

**A5 — a rail that carries application sections rather than the record's own headings.** 300px of
dark navy, 21% of the desktop width. It *is* record-aware — the Preprints branch expands to Discover →
Preprint details → Overview, with Overview highlighted — but "Overview" is the only section it can
name, so the record's own thirteen headings appear in no rail anywhere (F13, F19). **Surface: dossier
contents rail and previews.** [capture: content-1440-full.png]

**A6 — a fixed help beacon over content.** It covers the lower right of the metadata card at desktop,
the search field's top-right corner on the mobile index and part of the viewer toolbar on the mobile
record (F26). **Surface: all.**
[capture: index-375-full.png, content-375-tile-01.png, content-1440-full.png]

**A7 — unlabelled icon-only actions on a record.** The download and share glyphs are the second thing
seen on the mobile record and nothing names them (F8). **Surface: dossier reading column.**
[capture: content-375-tile-01.png]

**A8 — an embedded document viewer as a record's only substance at 375.** The viewer toolbar is
clipped by its card and the fixed Help pill covers what remains, so the reader can neither page nor
zoom the one copy of the content (V3). **Surface: dossier reading column.** Dossier evidence must be
page text at 375, not a document reader. [capture: content-375-tile-01.png]

### Phase 2 verdict

**Not named.** biohackrxiv is an A2 community site and holds no surface in the Phase 2 table; the
table's assignments are drawn from the original ten. Nothing seen here argues for giving it one.

Its single transferable idea — the named-field inventory of F29 — belongs to the **structured data
blocks** surface, and Stripe already governs that surface with a stronger measured version of the
same idea: 61 collapsible field blocks with a per-block copy button, against OSF's `copyControls`
count of 0 (F39). Adding OSF as a secondary influence there would add nothing Stripe does not do
better, and would import a fixed empty-field skeleton (F37) that our uniqueness constraint forbids.

It does contribute to one open item without filling it. The **dossier contents rail and previews**
surface is unassigned under the stopping rule, with Stripe proposed for the rail alone. BiohackrXiv is
the negative case that sharpens the requirement: it has a persistent left rail on a record page, and
because the rail carries application sections — Preprints → Discover → Preprint details → Overview —
rather than the record's own thirteen headings, a reader gets a permanent navigation column that
names only where they are in the application, never what they are reading (F19, A5). That
**strengthens the existing stopping rule** — it confirms that a rail generated from the document's own
headings, as Stripe's is from `h2` text, is the requirement and not merely one option. It supplies no
observed hover-preview reference, so that part of the rule stands unchanged.

**Verdict: not-named; strengthens the contents-rail stopping rule; no surface assignment earned.**

### Banner standing

The OSF cookie notice is present in all four capture passes (index-1440, index-375, content-1440,
content-375). `bannerActions` records that no permitted refusal control existed in `div.footer-links`
— the available controls were Terms of Use, Privacy Policy, Status, API and TOP Guidelines — so
consent was correctly not given and the banner stands. It occupies the top ~150px of the desktop
content column and ~200px of the mobile screen in every image and must not be read as OSF's judgement
about what belongs first on the page.

## Verification

Verified independently on 2026-09-04 against the capture set: index-1440-full (= index-1440-tile-01
by sha256), index-375-full (= index-375-tile-01), content-1440-full (= content-1440-tile-01 =
content-1440-scroll-00 = -50 = -90), content-375-tile-01 and content-375-scroll-50 (= content-375-full
= -scroll-00 = -scroll-90). `content-1440-tile-02.png` is absent from the capture directory, which
confirms the viewer's missing-capture note. **21 confirmed, 18 qualified, 1 refuted, 3 added.**

**Refuted and removed**

- **F16** — the capture shows the opposite. Author-list line spacing is ≈24px (names at y≈506, 531,
  552, 577, 600) while the gaps *between* field blocks are larger: ≈36px from the "See more" pill to
  "Abstract" and ≈47px from "Read more" to "Affiliated Institutions". The metadata column is not
  tighter between fields than within them.

**Qualified and rewritten**

- **F13** — the most important correction: the record page's sidebar is not "nothing about the record
  being read". It expands to Preprints → Discover → Preprint details with a highlighted "Overview".
  The defect is narrower: record-aware, but carrying nothing from the record's own content.
- **F1** — the pale-yellow band leading the reading order is the left-standing cookie notice recorded
  in `bannerActions`, a capture artefact, not OSF's ordering decision.
- **F5** — same banner exclusion; the search field is third among the page's own objects, not fourth.
- **F6** — "half-covered by the Help pill" overstates it; the pill covers roughly the right quarter of
  the search field's top edge.
- **F14** — the band below the title measures ≈115px (title ends y≈320, band ends y≈435), not 180px,
  and the icon buttons sit inside it.
- **F15** — the gap measures ≈118px and the h1-to-tagline band above is ≈100px, so "nothing else is
  spaced that way" is overstated; full-width emptiness, not size, is what distinguishes it.
- **F19** — the "inner scrolling pane the window scroll never reaches" is a mechanism the images
  cannot show, and there *is* a cue that more exists: the metadata card is sliced mid-logo.
- **F20** — self-contradictory as written; the breadcrumb it names as the only exit does link back to
  BioHackrXiv, and the sidebar carries Preprints → Discover.
- **F23** — the green dot is a few pixels across and cannot be identified as an ORCID mark at capture
  scale.
- **F25** — the standing consent notice cannot be counted as one of the competing pieces of
  furniture; two remain.
- **F26** — at 1440 the Help pill overlaps the metadata card's lower right, not the Carnegie Mellon
  logo, which sits at the card's leading edge.
- **F27** — the tiles begin ≈215px below the search field, not ≈170px, and "directly above" is wrong:
  "Show an example" and the "Browse By Subjects" heading sit between.
- **F29** — scope narrowed from "anywhere" to "in any capture"; the inventory below "Affiliated
  Institutions" is named only in `headingOutline` and its rendered state was never seen.
- **F30** — same inner-pane overreach as F19; the observable part is kept.
- **F31** — the two colour states are visible; the meaning attributed to them is not observable and is
  stated nowhere on the page.
- **F32** — the Title Case difference is real, but calling it "the one visible editorial act"
  attributes judgement to what reads as automatic capitalisation.
- **F33** — "a PDF the page cannot search" is contradicted by the viewer's own magnifier control; the
  accurate loss is that the site cannot quote, excerpt or deep-link the text.
- **F38** — "the record page offers no way to search within the record" fails against the same visible
  find control; `searchAffordances` does not see inside the embedded viewer.

**Added**

V1 (comma-joined author string splits one person into two names), V2 (the revision identifier is
desktop-only), V3 (the embedded viewer is not operable at 375). A8 was added to *Avoid* from V3, and
A3, A5, A6, B2 and B3 were rewritten so the recommendations match the corrected findings.
