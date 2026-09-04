# zenodo.org — Track A2 viewer findings (live record page, recaptured 2026-09-04)

Zenodo is CERN's general-purpose research repository: anyone with an account (or an automated
integration acting for them) deposits files, gets a DOI, and the deposit appears in a public
reverse-chronological list. Two pages were captured. The index, `https://zenodo.org/`, is 3,818 px
tall at 1440 and 6,852 px at 375: a blue header band, a promoted-community band, then "Recent
uploads" as a text list with a right rail. The content page is
`https://zenodo.org/records/22285985` — a live software record, 7,309 px tall at 1440 and 12,970 px
at 375, titled `github.com/DataBiosphere/terra-scientific-pipelines-service/ReshapeReferencePanel`,
version 8.0.7, deposited under the Dockstore community. The manifest notes it was chosen off the
front page by the orchestrator because `/search` and `/api` are disallowed by robots.txt, so topic
relevance could not be selected for.

**Relationship to the first pass.** An earlier pass (captures preserved under
`data/design-study/captures/zenodo_org-first-pass/`, findings under
`data/design-study/findings/zenodo_org-first-pass.md`) landed on a record that had been withdrawn
between selection and capture, so it rendered Zenodo's **tombstone** page (`h1` "Gone") rather than
a record. That was a limitation but it produced the single most useful idea on the site, and it is
carried forward here as F38/B1 with its capture paths pointing at the `-first-pass` directory. The
tombstone is Zenodo's *absence* page. It is not what a Zenodo record normally looks like, and
nothing in the first-pass write-up describes the layout judged below.

A cookie banner ("Accept all cookies" / "Accept only essential cookies") was declined-but-left-standing
in all four passes and is fixed over the lower part of every image (`bannerActions`; `stickyOrFixed`
records it as the page's only fixed element). It is not part of the design.

## 1. Visual hierarchy

**F1.** On the index the reading order is still chrome first, promotion second, corpus third, and it
is achieved by band colour rather than type size. A saturated blue gradient band runs 0–75 px
carrying a large white wordmark, a white search field, two text links and an orange "Sign up"
button; a pale blue-grey band from y≈75 to y≈390 carries "Featured communities" and one carousel
slide (an EU flag, a title, a "Browse" button, one sentence); "Recent uploads" only begins at
y≈447 and the first record title sits at y≈538. "Featured communities" and "Recent uploads" are set
in the same light face at the same size, so one promoted item and the whole corpus read as equal in
rank. [capture: index-1440-tile-01.png, index-1440-full.png]

**F2.** An index row has a five-step hierarchy that works: a badge triplet (blue date-plus-version,
grey resource type, green access state with a padlock), then a bold link-blue title, then a grey
creator line, then black abstract text, then three grey micro-lines (upload date, "Part of
<community>", "N more versions exist for this record") with view and download counts pushed to the
right edge of the same band. Rank is carried by colour and sequence, with weight and about four
pixels of size doing the rest. [capture: index-1440-tile-02.png, index-1440-full.png]

**F3.** On the record page the hierarchy has a real collision at the top: the record title (`h1`, a
two-line repository path at ~31 px, y≈248–310) is immediately followed by the deposited README's own
`h1` — "Terra Scientific Pipelines Service" at ~28 px, y≈396 — so two page-level titles sit 90 px
apart at almost the same size. The `headingOutline` confirms two `h1` tags on one page. The record's
identity and the deposited document's identity are not visually separated. [capture:
content-1440-tile-01.png; domEvidence: headingOutline]

**F4.** The largest type on the whole record page is not the title and not any evidence-bearing
field: it is "11K" and "4K" — the view and download counts, ~34 px numerals in the first rail box at
y≈248–275, sitting above the word VIEWS and DOWNLOADS in small caps. A usage statistic outranks the
title, the DOI, the licence and the version. [capture: content-1440-tile-01.png,
content-1440-scroll-00.png]

## 2. Where the eye lands first

**F5.** Desktop record page: the eye lands on the metrics box. It is right-aligned into the
reader's second fixation zone and it holds the biggest glyphs on screen — "11K" and "4K" at about
28 px of digit height against an `h1` cap height of about 21 px. It is *not* the only boxed grey
object in the top viewport: the Versions panel begins at y≈386 in the same rail, and the Dockstore
breadcrumb is a full-width grey band above both. The metrics box wins on type size alone, which is
enough. The title beside it is a long path string broken at an existing hyphen, in ordinary weight —
legible but low-salience by comparison. That is chrome winning over content, and the chrome in
question measures attention rather than evidence. [capture: content-1440-tile-01.png,
content-1440-scroll-00.png]

**F6.** Desktop index: the eye lands on the white wordmark against the dark blue left edge, then on
the orange "Sign up" button, the only warm colour in the viewport. The search field sits between
them as a white box on mid-blue with grey placeholder text and reads third. [capture:
index-1440-tile-01.png]

**F7.** Mobile index: the header collapses to wordmark plus a hamburger and **the search field is
gone from the first screen entirely**. The whole 812 px first screen is the wordmark, "Featured
communities", an EU flag, a title, a "Browse" button and one sentence; "Recent uploads" is a clipped
line at the very bottom edge, partly under the cookie banner. No record and no visible way to search
on the first mobile screen. [capture: index-375-tile-01.png, index-375-full.png]

**F8.** Mobile record page is better than its desktop counterpart on this one point: the rail is
dropped to the foot of the document, so the first screen is the published date, the version, the two
badges, the title and the creator, and the description begins immediately. Content wins at 375 px
and loses at 1440 px — the reverse of the usual pattern. [capture: content-375-tile-01.png,
content-1440-tile-01.png]

## 3. Information density

**F9.** The record page splits into a wide reading column (x≈109–935, so ~826 px) and a fixed
metadata rail (x≈977–1331, ~354 px). The first desktop screen carries roughly fifteen discrete
facts: published date, version, resource type, access state, title, creator, view count, download
count, a "Show more details" disclosure, and the first five rows of the Versions panel — each row
carrying a version number, its own DOI and its own date — plus "View all 210 versions". The reading
column, meanwhile, has already started the deposited document's Overview. There is no record-level
summary or abstract distinct from the deposited file's own text. [capture: content-1440-tile-01.png]

**F10.** The rail is a stack of small labelled panels, one topic each, each in a light grey box with
a plain heading: metrics, Versions, External resources ("Indexed in" → OpenAIRE), Communities
(Dockstore), Details (DOI, Resource type, Publisher), Rights (License), Citation, Export, Technical
metadata (Created, Modified). Inside a panel the pattern is a bold label above a plain value, which
is easy to scan and never uses a colon or a table rule. [capture: content-1440-tile-02.png,
content-1440-tile-03.png]

**F11.** The only true table on either page is the Files table: a `Name` / `Size` header row, a
"Download all" button in the header, one file row with the filename as a link, its size, a "Preview"
and a "Download" button, and the md5 checksum as small grey sub-text under the name with a help
glyph. It is the densest and most useful block on the page and it occupies about 175 px. [capture:
content-1440-scroll-90.png, content-1440-tile-08.png]

**F12.** The index list runs a badge-row-to-badge-row pitch of about 297 px, so roughly three
records per 900 px desktop screen, with eleven fields on each row. Rows are separated by a hairline
rule with roughly 40 px of clearance either side — no card, no border, no shadow, no thumbnail.
[capture: index-1440-tile-02.png, index-1440-full.png]

## 4. Whitespace

**F13.** The worst use of space on the record page is the file preview box: a bordered container
about 585 px tall (y≈5,605–6,190) holding a blue filename bar and five rows of directory tree that
end about 300 px short of the bottom border. The box is sized for a general case, not for this
record's five entries, and the empty half of it says nothing. [capture: content-1440-tile-07.png,
content-1440-scroll-90.png]

**F14.** The larger waste is the right column. The rail's last panel (Technical metadata) ends at
y≈2,205 of a 7,309 px page, and the full-width footer begins at y≈6,985. Between them, about
4,800 px of the right third is blank while the description, the files and the additional details
continue on the left. `content-1440-scroll-50.png` is the proof: a 1440 px viewport with text in the
left 58% and nothing at all in the right 42%. [capture: content-1440-scroll-50.png,
content-1440-full.png]

**F15.** Where whitespace is spent well, it is spent between things rather than inside them: index
records are grouped by a rule plus ~40 px of clearance and need no card; rail panels are grouped by
a light grey fill with ~16 px gaps between boxes and ~20 px of internal padding. Both are cheap
grouping mechanisms that survive the drop to 375 px unchanged. [capture: index-1440-tile-02.png,
content-1440-tile-02.png, content-375-scroll-90.png]

## 5. Long scroll

**F16.** Nothing persists. The record page is 7,309 px at desktop and 12,970 px at mobile, and at
50% and 90% scroll there is no header, no rail, no progress indicator, no breadcrumb and no
*persistent* back-to-top control on screen — only body text, at both widths. The page's one
back-to-top is the static "Jump up" button at the very end (F19), which is unreachable while
scrolling. The one element the page holds fixed is the cookie banner. [capture:
content-1440-scroll-50.png, content-1440-scroll-90.png, content-375-scroll-50.png,
content-1440-tile-08.png; domEvidence: stickyOrFixed]

**F17.** The page carries 46 headings (`headingCount` 46; the recorded `headingOutline` holds the
first 40 of them) and offers no contents navigation of any kind. The rail could have held one — it is
exactly where Stripe puts its generated TOC — and instead it holds nine metadata panels that stop at
30% of the page height. A reader 5,000 px into an imported README has no map and no way back except
the scrollbar. [capture: content-1440-scroll-50.png, content-1440-full.png; domEvidence:
headingOutline, stickyOrFixed]

**F18.** Rhythm holds down the long middle, but the site is not the one holding it. The reading
column is a deposited README from y≈396 to y≈5,570 — about 5,200 px of a 7,309 px page — rendered
with Zenodo's default heading, paragraph, list and inline-code styles, so its rhythm is GitHub's
document structure passed through unchanged. Zenodo's own rhythm — panels, boxes, badges — is in the
rail (top ≈2,200 px, right column only) and in the last ≈1,700 px of the reading column: the file
preview box from y≈5,605, the Files table, "Additional details" and the Citations panel. [capture:
content-1440-scroll-50.png, content-1440-tile-03.png, content-1440-full.png]

**F19.** The end of the record page is well handled and is the one moment the design re-asserts
itself: the Files table, then an "Additional details" heading with a hairline rule, then the
Citations panel, then a single centred "Jump up" button at y≈6,961, then a five-column blue footer
and a darker strip reading "Powered by CERN Data Centre & InvenioRDM" with four policy links. The
index ends the same way but with a centred "More" button — explicit pagination, not infinite scroll.
[capture: content-1440-tile-08.png, index-1440-full.png]

## 6. Imagery

**F20.** The site is close to imageless and does not suffer for it: nine images on the record page,
zero SVG, zero canvas. All nine are marks rather than pictures — the Dockstore container logo in the
breadcrumb band, the OpenAIRE mark, the Creative Commons BY badge, the CERN / OpenAIRE / EU logos in
the footer. No record has a thumbnail, and no chart or diagram appears anywhere. [capture:
content-1440-tile-01.png, content-1440-tile-02.png, content-1440-tile-08.png; domEvidence: imgCount,
svgCount, canvasCount]

**F21.** The one image doing real work is the CC BY badge in the Rights panel, and it works because
it sits beside the licence spelled out in words — "Creative Commons Attribution 4.0 International" —
rather than replacing them. The badge is recognition; the sentence is the fact. [capture:
content-1440-tile-02.png]

**F22.** Where a diagram would help, the page links out instead: under "Architecture" the record
offers "Architecture Doc" and "Architecture Diagram" as two blue links and embeds neither. The
structure of the deposited thing is described but never shown. [capture: content-1440-tile-01.png]

**F23.** With no imagery, colour does the scanning work, and across the index row and the reading
column it is rationed to four uses: link blue,
badge blue for date-and-version, grey for resource type, green for access state — plus a pink
monospace fill for inline code inside the imported description, which is the only wide colour field
in the reading column and is not Zenodo's decision. The four-use count is scoped to those two
zones: the header adds an orange "Sign up" button and the index rail a filled blue "Subscribe"
button, as F25 records. [capture: index-1440-tile-02.png, content-1440-scroll-50.png]

## 7. Defers or competes

**F24.** The reading column defers almost completely: one type family, black on white, no cards, no
shadows, no hover theatre, generous measure. Nothing in it competes with the deposited text.
[capture: content-1440-scroll-50.png, content-1440-tile-02.png]

**F25.** The chrome competes at four identifiable moments. (a) The blue header with an orange "Sign
up" is the loudest object on every screen and never carries content. (b) The metrics box puts a
usage number in the largest type on a record page (F4). (c) On the index, the featured-communities
band takes the top ~315 px of desktop and the whole first screen of mobile for one promoted item.
(d) The index rail's two slots beside the corpus are a "Why use Zenodo?" marketing list and a
newsletter signup form with an email field and a Subscribe button. [capture: index-1440-tile-01.png,
index-1440-tile-02.png, content-1440-tile-01.png]

## 8. Information design of data-heavy, uncertain, community-sourced material

**F26.** What the content page actually shows is registry metadata, not findings. Nine typed blocks:
identity (title, creator, published date, version), usage (views, downloads), version history,
aggregator indexing, community membership, identifier and publisher, licence, formatted citation,
machine export, and creation/modification timestamps. Alongside them are the deposited artefact
(a 5.0 kB zip, its size, its md5 checksum, a preview control) and a free-text description that is
whatever the depositor uploaded. [capture: content-1440-tile-01.png, content-1440-tile-02.png,
content-1440-tile-03.png, content-1440-scroll-90.png]

**F27. Evidence quality is not signalled anywhere on this page.** There is no peer-review mark, no
review state, no verification tick, no sample count, no replication or reuse indicator, no
confidence, no completeness bar, and no "self-deposited" or "not reviewed" label. Four marks sit
where a reader scans for quality and none of them supplies it: the green **Open** badge (access, not
merit), **Indexed in OpenAIRE** (an aggregator harvested it, not that anyone read it), **Communities:
Dockstore** (a collection accepted it), and the **Creative Commons** badge (reuse terms, not
standing). Every one of the four is a genuine fact and every one of the four is easy to misread as a
quality mark. [capture: content-1440-tile-01.png, content-1440-tile-02.png]

**F28.** The one quantity offered in the quality position is usage, and on the record page it is
loud: 11K views and 4K downloads set larger than the `h1`, above a "Show more details" disclosure.
On the index the pair appears on every row, but it is not uniformly large — it runs over two orders
of magnitude (717/122, 796/192, 199/63, 10655/3611, 9849/3463, 10312/3577, 330/114, 5405/2206,
313/105, 11296/3921). A reader who wants to know whether a deposit is any good is given the number
of times it was fetched. [capture: content-1440-tile-01.png, index-1440-tile-02.png,
index-1440-full.png]

**F29.** Versioning is the strongest information design on the site and the thing a trial registry
does not do. The Versions panel lists five versions newest-first, each with its own DOI and its own
date (8.0.7 / 10.5281/zenodo.22285985 / Sep 3 2026; 8.0.6 / …22209548 / Aug 31; three more at Aug
27), highlights the version being read with a pale blue fill, offers "View all 210 versions", and
then explains in prose that a separate DOI — 10.5281/zenodo.14278234 — cites *all* versions at once.
Version-specific identifier and concept identifier are both present and are distinguished in words.
[capture: content-1440-tile-01.png]

**F30.** Relationships between records are typed, not merely linked. Under "Additional details" the
"Related works" row is headed **"Is identical to"** and lists three URLs each tagged "(URL)". The
relation is named; the reader is told what kind of link this is rather than being handed a bare
list. [capture: content-1440-tile-08.png, content-1440-scroll-90.png]

**F31.** User-contributed content is not distinguished from anything, because everything here is
user-contributed — and this record shows why that matters. It is plainly a machine deposit: the
title is a repository path, there are 210 versions, the creator is an organisation ("Terra
Scientific Services") with a generic person glyph and no ORCID mark, three versions were deposited
on a single day, and the description is a developer README complete with database passwords,
`./gradlew` commands and pre-commit hook instructions. Nothing on the page says "deposited
automatically by an integration". A reader must infer it from the shape of the content. [capture:
content-1440-tile-01.png, content-1440-tile-03.png, content-1440-scroll-50.png]

**F32.** The index makes the same problem structural. Eight of the ten front-page records are
auto-deposited releases of the same repository, and their abstract snippets are **the same paragraph
of text**, differing only in the title's last path segment — and, on the SubsetVcfByBedFile row, one
word's capitalisation ("or teaspoons" where the others read "or Teaspoons"), so near-identical
rather than word for word (VcfdistEvaluation,
UpdateVcfDictionaryHeader, SubsetVcfByBedFile, StdPopSim, SplitMultiallelicsBcf, SplitMultiallelics,
ReshapeReferencePanelSVImputation, ReshapeReferencePanel). Recency ordering with no grouping and no
deduplication presents one depositor's automated run as the state of the corpus. [capture:
index-1440-full.png, index-1440-tile-02.png]

**F33.** Licence is on the record page and absent from the index rows. The Rights panel names CC BY
4.0 with its badge; no index row shows a licence for any record, and the green "Open" badge is the
only rights-adjacent mark there. Open access and reuse terms are two different facts and only one of
them reaches the list. [capture: content-1440-tile-02.png, index-1440-tile-02.png]

**F34.** What a reader gets here that a trial registry cannot give them: the artefact itself with a
checksum, a persistent identifier bound to one exact version alongside one that spans all versions, a
named reuse licence, a pre-formatted citation with a style selector, a machine export in a chosen
format, and typed relations to other records. A registry can tell you a study exists; this tells you
what was deposited, under which identifier, at which version, under what terms, and how to fetch and
verify the bytes. What it cannot tell you is whether any of it is right. [capture:
content-1440-tile-02.png, content-1440-tile-03.png, content-1440-scroll-90.png]

**F35.** Copy affordances are present on the live record and are attached to the three things meant
to be copied — the DOI badge, the formatted citation, and the export payload — each an icon button
at the right edge of its panel. `copyControls` records exactly three, labelled "Copy to clipboard".
The Citation panel additionally carries a "Style" dropdown reading APA, and the Export panel a
format dropdown reading JSON beside an "Export" button. [capture: content-1440-tile-02.png,
content-1440-tile-03.png; domEvidence: copyControls]

**F36.** Zenodo is domain-neutral, not longevity-focused, and the two records reached across two
passes make the point: a withdrawn record on health expenditure and under-five mortality, and a
genomics pipeline release for reshaping an imputation reference panel. Neither is longevity
evidence. Zenodo is a plausible deposit venue for longevity datasets and preprints, but nothing seen
in either pass is longevity-relevant content, and a recency-ordered front page surfaces automated
software deposits rather than research findings. [capture: content-1440-tile-01.png,
index-1440-full.png]

**F37.** The measured text-to-HTML ratio on this record page is 5.48% — 13,232 characters of visible
text inside 241,678 characters of markup — and this is a page whose reading column is a very long
imported document. RNAWiki's corpus sits at 8.3% and must improve, so Zenodo is not a model for that
number. [capture: content-1440-full.png; domEvidence: textToHtmlRatio]

## 9. Absence handling

**F38 (carried forward from the first pass).** Zenodo's answer to a removed record is its best
single idea and the reason the first pass is preserved rather than discarded. A withdrawn record
does not 404 and does not go blank: it renders a stable page with `h1` "Gone", one plain sentence
("The record you are trying to access was removed from Zenodo. The metadata of the record is kept
for archival purposes."), and a bordered box of six labelled facts about the absence itself —
Reason for removal, Removed by, Deletion Policy, Date of removal, Citation, Identifier. The absence
is treated as a record with its own fields rather than as an error, and the box ends where its
content ends, leaving ~110 px of white before the footer. Two weaknesses carried forward with it.
First, the *body* of the page offers no onward route into the corpus — no search box, no related
records, no "browse Zenodo" link — although the ordinary header (search field, Communities, My
dashboard) and the ordinary footer are both present, so it is not a dead end in the strict sense.
Second, the identifier on it is rendered in body-text black with no link and no copy control (the
live record page has both, so this is a gap on the tombstone specifically). [capture:
zenodo_org-first-pass/content-1440-tile-01.png, zenodo_org-first-pass/content-375-tile-01.png,
zenodo_org-first-pass/content-1440-scroll-90.png]

**F39.** On the live record page absence is handled two contradictory ways, and the contrast is
instructive. At field level it renders **nothing**: "Additional details" contains only "Related
works" — there is no subject, keyword, funding, language, conference or publication-detail row, and
no placeholder standing in for them. The section is simply shorter. [capture:
content-1440-tile-08.png]

**F40.** At panel level it renders **the whole apparatus of an answer it does not have**. The
Citations panel appears in full at y≈6,703: a collapsible header with a help glyph, a "Show only:"
row of four greyed-out checkboxes reading "Literature (0)", "Dataset (0)", "Software (0)",
"Unknown (0)", an active "Citations To This Version" checkbox, a "Search for citation …" field and a
Search button — and then, in italics, "No citations found". About 200 px of chrome to report zero.
The one thing it does get right is the distinction it draws without saying so: the zero counts show
the lookup ran and returned nothing, which is a different fact from never having looked. [capture:
content-1440-tile-08.png; domEvidence: searchAffordances]

**F41.** A third kind of absence is handled worst: a container that outlives its content. The file
preview box keeps its ~585 px height with five rows in it (F13), so roughly 300 px of bordered white
sits under the last directory row. Empty structure is drawn where nothing exists. [capture:
content-1440-tile-07.png]

## 10. Baseline notes

**F42.** The site is light-only. `prefersColorScheme` found no `prefers-color-scheme` rule across
seven stylesheets, `htmlAttributes.dataTheme` is null, and the body computes to black on white. No
theme toggle is visible in any capture and none is claimed. This is consistent with RNAWiki's
decided light default but is not evidence for it. [capture: content-1440-tile-01.png; domEvidence:
prefersColorScheme, htmlAttributes]

**F43.** No command palette or keyboard shortcut is claimed: `kbdTexts` and `ariaKeyshortcuts` are
both empty, and although `scriptTokens` reports `metaKey` and `keyCode` present in inline script,
that is not evidence of a palette. The three search affordances recorded are the header field, its
button, and the citation search inside the Citations panel — all visible in captures. [capture:
index-1440-tile-01.png, content-1440-tile-08.png; domEvidence: kbdTexts, ariaKeyshortcuts,
scriptTokens, searchAffordances]

## 11. Verifier additions

Three findings the viewing pass did not record, each tied to a capture.

**V1 — both pages overflow horizontally at 375 px.** The full-page captures record the document
width, and at the 375 px viewport `index-375-full.png` is 407 px wide and `content-375-full.png` is
382 px wide, while both 1440 px full-page captures are exactly 1440 px. A mobile reader can scroll
these pages sideways. The record page shows the cause: in `content-375-tile-12.png` a dockstore.org
API URL under "Is identical to" breaks mid-token across five lines and the zip filename in the Files
block runs to the container edge. RNAWiki's public rule is no horizontal overflow at 320 px, and its
browse rows will carry exactly this shape of content — long programme identifiers, DOIs, registry
NCT strings. Those need explicit wrapping rules, not a wider document. [capture: index-375-full.png,
content-375-full.png, content-375-tile-12.png]

**V2 — the current revision is marked by removing its link, not by adding a badge.** In the Versions
panel "Version 8.0.7" is dark body text on a pale blue fill, while "Version 8.0.6", "8.0.5", "8.0.4"
and "8.0.3" are blue links; every row carries its own DOI beneath in the same small grey. Two
signals — the fill and the *absence* of a link — say "you are here" without a word of copy or an
extra mark, and they make the current revision the one row a reader cannot click. For RNAWiki's
revision history this is the cheap version of the same job: the currently published revision reads
as text, superseded revisions read as links. [capture: content-1440-tile-01.png]

**V3 — a technical panel ranked down by contrast rather than by label.** "Technical metadata" is the
ninth and last rail panel. Its heading is grey on the same pale grey fill the other eight use, and
its two values ("Created September 3, 2026", "Modified September 3, 2026") are smaller and greyer
still, where "Export", "Citation", "Rights" and "Details" above it all carry black headings. The
same treatment survives at 375 px. The instinct is right — machine-facing fields ranked below
reader-facing ones — but executing it as a contrast drop makes the panel read as disabled and leaves
it the weakest text on the page. RNAWiki's rule asks for the opposite mechanic: record ids and
digests belong in an explicitly labelled technical disclosure at full contrast, not in a faded
panel. [capture: content-1440-tile-03.png, content-375-tile-15.png]

## For RNAWiki

### Borrow

**B1 — the tombstone content model, for structured data blocks (carried forward).** When an RNAWiki
programme is withdrawn, retracted or superseded, keep the URL alive and render a short page of
labelled facts about the withdrawal: reason in the registry's or sponsor's own words, who withdrew
it, the date, the governing policy, the citation, the identifier. Six rows and one sentence is
enough. This maps onto the editorial rule that a stopped trial gets the registry's reason and
nothing beyond it. Add the two things Zenodo's version lacks: an in-body route back into the corpus
(its ordinary header search and Communities link do remain, but nothing in the page body offers
one), and a copy control on the identifier. [capture:
zenodo_org-first-pass/content-1440-tile-01.png, content-1440-tile-02.png]

**V2 (verifier) — mark the current revision by removing its link, for the dossier revision
history.** The published revision reads as plain text on a tinted row; superseded revisions read as
links. No badge, no "current" label, nothing to translate. [capture: content-1440-tile-01.png]

**B2 — version-specific identifier plus an all-versions identifier, for the citation evolution
map.** The Versions panel is a data model, not a graphic: newest-first rows, each carrying its own
identifier and its own date, the current one filled pale blue, an explicit "View all N versions",
and a sentence naming the separate identifier that cites every version at once. RNAWiki's
`programme_current_publications` pointer and its revision history need exactly this shape — a
reader must be able to see which revision they are reading, that others exist, and how to cite the
programme rather than one revision. pudding.cool still governs the map's presentation; this is the
underlying record structure it presents. [capture: content-1440-tile-01.png]

**B3 — typed relations rather than a link list, for structured data blocks.** "Is identical to"
above three URLs says what the relationship is. RNAWiki's dependency edges and source relations
should be labelled the same way — supports, qualifies, contradicts, supersedes — never a bare
"Related" list, which is the same discipline the copy rules already impose on source citations.
[capture: content-1440-tile-08.png]

**B4 — the file row: name, size, checksum, one action, for structured data blocks.** If RNAWiki ever
offers a download or an export, this is the shape: filename as link, size in a column, md5 as small
grey sub-text with a help glyph, and the action buttons at the right of the same row. It fits in
~175 px and answers "what is it, how big, is it intact, how do I get it". [capture:
content-1440-scroll-90.png]

**B5 — the badge triplet above a row title, for browse/filter.** Three small badges in a fixed order
before the title, each answering a different question, fingerprints a text-only row at a glance and
survives the drop to 375 px. RNAWiki's three would be evidence tier, model-organism ladder position,
and whether any human data exists — as markup, not prose, so it does not count against the
uniqueness metric. awwwards.com still governs the filter surface; this is a component inside it.
[capture: index-1440-tile-02.png, index-375-full.png]

**B6 — "we looked and found none" as a distinct state, for structured data blocks.** The zero counts
on the Citations panel report that the lookup ran and returned nothing. That is precisely RNAWiki's
`UNKNOWN` / `NOT_MEASURED` distinction, and it is the one thing worth taking from that panel.
Borrow the distinction; do not borrow the panel (see A5). [capture: content-1440-tile-08.png]

**B7 — a copy control on each thing meant to be copied, for structured data blocks.** The DOI, the
citation and the export each have their own copy button at the right edge of their own panel, and
the citation has a style selector beside it. This corroborates the Stripe per-block copy button
already governing this surface. [capture: content-1440-tile-02.png, content-1440-tile-03.png;
domEvidence: copyControls]

**B8 — a licence named in words with the badge beside it, for structured data blocks.** "Creative
Commons Attribution 4.0 International" spelled out, badge alongside. Never the badge alone — that is
also what the copy rule about explaining terms on first appearance requires. [capture:
content-1440-tile-02.png]

### Avoid

**A1 — a header search that disappears at mobile (home; the frozen search bar).** At 375 px Zenodo's
search field is replaced by a hamburger and the first mobile screen offers no visible way to search.
RNAWiki's home search bar must remain the single primary action at 375 px and at 320 px. This is the
sharpest negative lesson on the site and it survives the recapture unchanged. [capture:
index-375-tile-01.png]

**A2 — a promoted band above the corpus (home; browse/filter).** ~315 px of the first desktop screen
and the entire first mobile screen for one flag, one title, one button and one sentence. Nothing may
sit above or beside RNAWiki's search bar; this is exactly the proposal to discard. [capture:
index-1440-tile-01.png, index-375-tile-01.png]

**A3 — usage counts as the largest type on a record page (dossier reading column).** "11K VIEWS /
4K DOWNLOADS" outranks the title, the identifier, the version and the licence. Attention is not
evidence. RNAWiki should show no view or download count beside a conclusion, and certainly not in
the position and size Zenodo gives it. [capture: content-1440-tile-01.png, content-1440-scroll-00.png]

**A4 — a rail that dies at 30% of the page with no contents navigation (dossier contents rail).**
Nine metadata panels end at y≈2,205 of 7,309 px, leaving ~4,800 px of empty right column between the
rail and the footer, on a page whose `headingCount` is 46, with no map and no back-to-top until the
"Jump up" button at the very end. Either the rail carries navigation for the whole length of the
page it serves, or it does not exist. [capture: content-1440-scroll-50.png, content-1440-full.png]

**A5 — a full panel of controls where nothing was found (structured data blocks).** ~200 px of
collapsible header, four disabled zero-count checkboxes, a search field and a Search button, to say
"No citations found". RNAWiki's rule is that absent data renders nothing, and Zenodo's own
field-level behaviour two sections earlier — a shorter "Additional details" with no placeholder rows
— is the better model, on the same page. [capture: content-1440-tile-08.png]

**A6 — a fixed-height container padded with white (structured data blocks).** The file preview box
keeps ~585 px for five rows. A block should be as tall as its content. [capture:
content-1440-tile-07.png]

**A7 — importing a foreign document wholesale as the record body (dossier reading column).** The
description is a developer README that brings its own `h1`, its own code blocks, about half the
page's headings (19 of the 40 recorded in `headingOutline`, against 21 from Zenodo's own chrome;
`headingCount` is 46, so 6 more are unrecorded), and — on the index — one paragraph that becomes the
near-identical abstract on eight consecutive rows. For RNAWiki this is a direct hit on the uniqueness constraint: positional overlap
must stay at or below 0.20, and pasted source text is how that number goes bad. Programme prose must
be authored into RNAWiki's own structure, with source text quoted in bounded, attributed excerpts.
[capture: content-1440-scroll-50.png, index-1440-tile-02.png, index-1440-full.png]

**A8 — recency-only ordering on a browse surface (browse/filter).** Eight of ten front-page records
are one automated deposit run. Order or group by programme, and state a count; the front page offers
no result count, no sort control and no facets, and the rail position where they belong holds
marketing and a newsletter form. [capture: index-1440-full.png, index-1440-tile-02.png]

**A9 — an aggregator or collection label standing in the provenance slot (dossier reading column).**
"Indexed in OpenAIRE", "Communities: Dockstore", the green "Open" badge and a CC BY badge together
occupy the region a reader scans for standing, and none of them reports that anyone checked the
work. RNAWiki must keep contributed and reviewed material visibly distinct and must never let a
programme, community or index name imply review. [capture: content-1440-tile-01.png,
content-1440-tile-02.png]

**A10 — leaving the automated origin of a record unstated (dossier reading column).** A machine
deposit and a hand-curated one look identical here. RNAWiki already separates ingestion facts from
reviewed conclusions in storage; the page must say which it is showing, in ordinary language, on the
record itself. [capture: content-1440-tile-01.png, content-1440-tile-03.png]

**V1 (verifier) — a document wider than the viewport at 375 px (browse/filter; dossier reading
column).** Zenodo's pages are 407 px and 382 px wide against a 375 px viewport. RNAWiki's rows and
dossiers carry long identifiers, DOIs and NCT strings; they must wrap. [capture:
index-375-full.png, content-375-full.png]

**V3 (verifier) — ranking a technical panel down by dropping its contrast (structured data
blocks).** "Technical metadata" is grey-on-grey where the eight panels above it are black-on-grey.
Rank it down with an explicit "technical detail" label at full contrast instead. [capture:
content-1440-tile-03.png, content-375-tile-15.png]

### Phase 2 verdict

**not-named**, and this pass does not argue for giving Zenodo a governing assignment. It appears
nowhere in the Phase 2 table, it is light-only (no `prefers-color-scheme` rule across seven sheets),
and its 5.48% text-to-HTML is below the 8.3% RNAWiki must improve on, so it cannot govern a reading
surface.

What the live record page changes relative to the first pass is the strength of the evidence, not
the verdict, and it changes it in three specific ways:

1. **It strengthens stripe.com/docs on structured data blocks, mostly by negative example.** Zenodo
   has the right *content* for those blocks — labelled field pairs, per-block copy controls, a named
   licence, a checksum, typed relations — and gets the *mechanics* wrong in the two places Stripe
   gets them right: a rail that stops at 30% of the page (A4) and a panel that renders full chrome
   for an empty result (A5). Stripe supplies the block mechanics; Zenodo supplies content models —
   the tombstone for absence (B1) and the metadata field set (B3, B4, B7, B8).
2. **It adds a record-structure component under pudding.cool's citation evolution map** (B2): the
   version-specific identifier alongside an all-versions identifier, with the current revision
   marked. That is a data model, not a graphic, so it does not disturb pudding's presentation
   assignment.
3. **It confirms the contents-rail stopping rule should stay open.** The rail here is not a contents
   rail at all — it is a metadata stack that ends long before the content does. Zenodo does not fill
   the gap left by wikiwand.com, and nothing seen argues for assigning it to a surface it does not
   currently hold.

The one thing to record as an argument about RNAWiki's own rules rather than about a surface: F39
and F40 show the same site handling absence correctly at field level and badly at panel level on one
page. That is the clearest available evidence that "absent data renders nothing" is the right rule
and needs to apply to containers and panels, not only to fields.


## Verification

An independent pass re-read the captures on 2026-09-04: `index-1440-full`, `index-1440-tile-01/02`,
`index-375-full`, `index-375-tile-01`, `content-1440-full`, `content-1440-tile-01/02/03/07/08`,
`content-1440-scroll-50/90`, `content-375-full`, `content-375-tile-01/12/15`,
`content-375-scroll-50/90`, and `zenodo_org-first-pass/content-1440-tile-01`.
`content-1440-scroll-00.png` was not opened separately: the manifest records it with the same
sha256 as `content-1440-tile-01.png`, so it is the same image.

**49 confirmed, 12 qualified, 0 refuted, 3 added.** Nothing was removed. The cookie banner was
correctly excluded from the design throughout, and no finding rested on an inferred behaviour
without a `domEvidence` key.

Qualified findings, and why:

- **F5** — the metrics box is *not* the only boxed grey object in the first viewport: the Versions
  panel starts at y≈386 in the same rail and the Dockstore breadcrumb is a grey band above both. The
  box wins on type size alone, which is enough for the claim.
- **F14** — the empty right column was sized to the page bottom (~5,100 px). The full-width footer
  starts at y≈6,985, so the blank column is ~4,800 px.
- **F16** — "no back-to-top" contradicted F19 and F17 on the same page. Rewritten as no *persistent*
  back-to-top; the static "Jump up" button at the end exists.
- **F17** — `headingOutline` was cited as listing 46 headings. The array holds 40; `headingCount` is
  46. The claim is unaffected.
- **F18** — the geometry was wrong in both directions. The imported README starts at y≈396, not at
  y≈2,200, and runs ~5,200 px; Zenodo's own boxes occupy the last ~1,700 px of the reading column,
  not the last ~700 px.
- **F23** — the four-colour ration holds for the index row and the reading column only. The header's
  orange "Sign up" and the index rail's filled blue "Subscribe" are two more, as F25 itself records.
- **F28** — the five counts quoted were the largest five of ten. The pair is on every row, but it
  runs from 199/63 to 11296/3921, so "large on every row" overstates it.
- **F32** — the eight repeated abstracts are not identical word for word: the SubsetVcfByBedFile row
  reads "or teaspoons" where the others read "or Teaspoons". Near-identical is accurate.
- **F38** — the tombstone was called a dead end with no route back into the corpus. Its ordinary
  header (search field, Communities, My dashboard) and footer are both present; what is missing is
  any route in the page *body*. The identifier gap — black text, no link, no copy control — is
  confirmed as written.
- **A4** — same ~5,100 px → ~4,800 px correction as F14, and the 46-heading figure is `headingCount`,
  not the outline length.
- **A7** — the most important correction of the pass. The imported README was credited with "forty of
  the page's forty-six headings". Of the 40 entries in `headingOutline`, 19 come from the README and
  21 from Zenodo's own chrome. The avoid stands; the size of the takeover was roughly doubled.
- **B1** — carries F38's route-back correction: an *in-body* route is what the tombstone lacks.

Added: **V1** (horizontal overflow at 375 px), **V2** (current revision marked by removing its
link), **V3** (technical panel ranked down by contrast). V1 rests on capture geometry rather than a
DOM key — the full-page captures at 375 px are 407 px and 382 px wide against a 375 px viewport,
while both 1440 px full-page captures are exactly 1440 px.
