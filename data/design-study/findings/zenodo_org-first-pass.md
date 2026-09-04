# zenodo.org — Track A2 viewer findings

Zenodo is CERN's general-purpose research repository: anyone with an account deposits files, gets a
DOI, and the deposit appears in a public list of records. Two pages were captured. The index,
`https://zenodo.org/` (3,563 px tall at 1440, 6,650 px at 375), is a promoted-community band above a
reverse-chronological list of recent uploads with a right rail. The content page,
`https://zenodo.org/records/22273492`, was selected through the REST API as the most recent open
record matching "longevity" — but by capture time the record had been withdrawn, so what was
rendered is Zenodo's **tombstone page** (`<h1>` reads "Gone", document title "Tombstone | Zenodo"),
914 px tall at 1440 and 1,608 px at 375. That is a limitation to state up front: **no live Zenodo
record page was seen in this pass**, so nothing below describes the normal record layout — its
files table, licence block, versions panel or citation exports. What the tombstone shows is,
however, the single most useful thing on this site for RNAWiki, and it is judged as such. A cookie
banner ("Accept all cookies" / "Accept only essential cookies") was declined-but-left-standing in
all four passes and is fixed over the lower part of every image; it is not part of the design.

## 1. Visual hierarchy

**F1.** On the index the reading order is chrome first, content third. A saturated blue gradient
band runs the full width at the top carrying a large white wordmark, a white search field, two text
links, and an orange "Sign up" button; below it a pale blue-grey band running from about y=75 to
y=390 — roughly 315 px tall, not 390 — carries "Featured communities" and a single carousel slide;
only then, at roughly y=446, does "Recent uploads" begin. The hierarchy is achieved by colour saturation and band backgrounds, not by type
size — "Featured communities" and "Recent uploads" are set at the same weight and roughly the same
size (a light-weight ~30 px face), so the two sections read as equal in rank even though one holds
one promoted item and the other holds the corpus. [capture: index-1440-tile-01.png,
index-1440-full.png]

**F2.** Inside a record row the hierarchy is clean and does its job in five visible steps: a row of three
small badges (blue date+version, grey record type, green access state), then a blue semibold title
that is the only link-coloured text of its size, then a grey author line with ORCID marks, then a
black abstract snippet, then two grey micro-lines (upload date, community). Rank is carried mainly by
colour and by the badge/title/prose sequence rather than by large size jumps, but weight and size do
part of the work too: the title is bold, link-blue and about four pixels larger than the abstract. [capture: index-1440-tile-02.png, index-1440-tile-03.png]

**F3.** On the tombstone the hierarchy is deliberately flat and short: a single centred `h1`
("Gone") with a lightning-bolt glyph, one centred sentence of explanation, then one bordered
light-grey box of six bold-label / plain-value pairs. No section headings, no tabs, no rail. The
whole page is one statement plus one record of fact. [capture: content-1440-tile-01.png]

## 2. Where the eye lands first

**F4.** Desktop index: the eye lands on chrome. The white wordmark on the dark blue left edge is
the highest-contrast object on screen, and the orange "Sign up" button is the only warm colour in
the viewport and pulls to the far right; the search field sits between them but is a white box on a
mid-blue field with grey placeholder, so it reads third. The first actual record title is at about
y=537 of a 900 px screen — the top 60% of the first screen is brand, promotion and a single
community carousel. [capture: index-1440-tile-01.png]

**F5.** Mobile index: the eye lands on the wordmark and then on the EU flag image, and **the search
field is gone entirely** — the 375 px header collapses to wordmark plus a hamburger. The first
screen at mobile contains no way to search that is visible, and no record at all; "Recent uploads"
is only just breaking the bottom edge, partly under the cookie banner. This is content losing to
chrome twice over. [capture: index-375-tile-01.png, index-375-full.png]

**F6.** Content page, both widths: "Gone" is the largest type in the content column — centred,
black on white, about 30 px below the header band (not the ~90 px of clearance first claimed) — and
within the content column the page has one thing to say and says it first. But it is not what the
eye meets first on the screen. The tombstone retains the index header unchanged, so the oversized
white wordmark and the orange "Sign up" button are still the highest-contrast and only warm objects
in the viewport, above a page whose entire message is that the record is gone. [capture:
content-1440-tile-01.png, content-375-tile-01.png]

## 3. Information density

**F7.** The index list runs about 3.3 records per 900 px desktop screen (a ~275 px badge-row to
badge-row pitch) and about 2.0 per 812 px mobile screen (a ~400 px pitch). Each record carries ten
discrete pieces on one row — eleven if date and version are counted apart: date+version, resource
type, access state, title, up to three authors each with an ORCID mark, a three-line abstract
snippet, an upload date, a community link, a view count and a download count. Rows are separated by a hairline
rule with roughly 40 px of clearance either side; there is no card, no border, no shadow — grouping
is done by the rule and by the badge row that opens each record. [capture: index-1440-tile-02.png,
index-1440-tile-03.png]

**F8.** There is no table anywhere in the captures, and no thumbnail on any row. The list is
handled as pure text plus coloured badges, which is why it stays legible at high density; at 375 px
the same ten fields reflow into a taller stack without dropping anything except line width.
[capture: index-375-tile-02.png]

**F9.** The right rail carries only two boxed items — a bulleted "Why use Zenodo?" panel and a
newsletter subscription form — and both end at roughly y=1,272 of a 3,563 px page. Below that the
right third of the page is empty for about 1,900 px while the record list continues on the left; the
remaining ~370 px to the page foot is footer, not dead column.
The rail is not a navigation or filtering device; it is a promotion slot that runs out. [capture:
index-1440-full.png, index-1440-tile-03.png]

## 4. Whitespace

**F10.** Space is spent unevenly and the spending states a priority. The featured-communities band
gives roughly 315 px of vertical space to one flag, one title, one button and one sentence; the
record rows give a three-author, three-line-abstract record about 200 px in a 275 px pitch. The most generous
whitespace on the page surrounds the least information. [capture: index-1440-tile-01.png]

**F11.** Inside a record, spacing is tight and consistent: measured on index-1440-tile-03, badge
row to title about 20 px, title to author line about 7 px, author line to abstract about 25 px,
abstract to the grey micro-lines about 20 px (the first pass understated all four). Whitespace is used between records, not inside them, so each record reads as one block — a
good and cheap grouping mechanism that needs no card. [capture: index-1440-tile-02.png]

**F12.** On the tombstone, whitespace does the work of gravity: about 30 px above "Gone", the
explanation sentence held to a narrow centred measure, then the fact box inset to roughly half the
page width with ~20 px internal padding and ~10 px between field rows, and then roughly 100 px of
empty white below the box before the footer. The emptiness is not a layout accident; it says there
is nothing more. [capture: content-1440-tile-01.png, content-1440-scroll-90.png]

## 5. Long scroll

**F13.** The content page cannot be scrolled in any meaningful sense — it is 914 px against a 900 px
viewport. The scroll captures confirm it: `content-1440-scroll-50.png` was taken at scrollY 7 and
`content-1440-scroll-90.png` at scrollY 13, and the three views are nearly identical. Any judgement
about what Zenodo persists during a long read is therefore untestable from this pass and is not
made. [capture: content-1440-scroll-00.png, content-1440-scroll-50.png, content-1440-scroll-90.png]

**F14.** Nothing on the content page is sticky, including the header. The only element recorded as
fixed is the cookie banner div, and it is what sits over the footer in every image. The header can
in fact be judged, weakly: under the 13 px of scroll the page allows,
`content-1440-scroll-90.png` shows the whole header shifted up and clipped at the top edge, so it
scrolls with the page rather than pinning. No progress bar, no sticky rail, no back-to-top control
appears in any capture. [capture: content-1440-scroll-90.png;
domEvidence: stickyOrFixed]

**F15.** The index scroll behaviour could not be captured (index has tiles only, and tiles are
slices of a single full-page shot). What the tiles do show is that the header does not repeat down
the page and the rail stops early, so after the first screen the reader has a bare list with no
persistent orientation. The page ends with a single centred "More" button — pagination by explicit
action, not infinite scroll — followed by a five-column blue footer and a darker bottom strip
carrying "Powered by CERN Data Centre & InvenioRDM" and four policy links. The rhythm of the list
holds all the way down: the same badge-title-authors-abstract-meta pattern repeats without variation
for ten records — `index-1440-full.png` shows ten, not the twelve first counted. [capture:
index-1440-tile-04.png, index-1440-full.png]

## 6. Imagery

**F16.** The site is almost imageless and does not suffer for it. Four images in total on the
content page, no SVG and no canvas. The index uses exactly one content image — the EU flag in the
carousel — plus three institutional logos in the footer (CERN, OpenAIRE, EU). No record row has a
thumbnail, preview or file-type icon larger than a 14 px glyph. [capture: index-1440-full.png,
index-1440-tile-04.png; domEvidence: imgCount, svgCount, canvasCount]

**F17.** Where imagery is absent, coloured badges take over the scanning job: the blue/grey/green
badge triplet gives every row a visual fingerprint at a glance, so a list of ten text-only
records is still scannable. The lightning bolt beside "Gone" is a state marker rather than an
ornament — but it is not the only other graphic in the study, as first claimed: ORCID iD circles,
the padlock inside the "Open" badge, the eye and download glyphs, the carousel arrows, the search
magnifier and the three footer logos all appear in the same captures. [capture:
index-1440-tile-03.png, content-1440-tile-01.png]

## 7. Defers or competes

**F18.** The record list defers, completely — no cards, no shadows, no thumbnails, no hover
theatre, one type family, three colours of badge. That restraint is the site's best quality.
[capture: index-1440-tile-03.png]

**F19.** The chrome competes, in three specific moments. (a) The saturated blue gradient header with
an orange "Sign up" is the loudest thing on any screen and it never carries content. (b) The
featured-community band takes the position and the space that the first records should have. (c) The
right rail's first item is a marketing list ("Why use Zenodo? Safe / Trusted / Citeable / No waiting
time…") and its second is a newsletter form — the two most valuable slots beside the corpus are
spent on promoting the platform. [capture: index-1440-tile-01.png, index-1440-tile-02.png]

## 8. Information design of data-heavy, uncertain, community-sourced material

**F20.** Zenodo is domain-neutral rather than off-topic: it is a plausible deposit venue for
longevity datasets and preprints, and the corpus is searchable by keyword. But the most recent open record
matching "longevity" is about health expenditure, income inequality and under-five mortality in
Sub-Saharan Africa — no longevity-biology content appears in anything visible. Where the keyword
actually matched cannot be seen, because the record is withdrawn and only its citation survives; the
first pass's "the keyword matched a word, not a field" was inference, not observation. The visible
fact is warning enough about keyword-selected corpora. [capture: content-1440-tile-01.png]

**F21.** The per-record structure on the list is a badge triplet plus a metadata stack. Date and
version live together in one blue badge ("January 29, 2025 (v1)"); resource type is a neutral grey
badge ("Dataset", "Presentation"); access state is a green badge with a padlock glyph ("Open").
Authors carry individual ORCID marks — a green iD circle after each name — which is a provenance
signal attached to the person rather than to the data. Community membership appears as a small
"Part of VALSOUNDS" link. Views and downloads appear as an eye glyph and a download glyph with a
number. [capture: index-1440-tile-02.png, index-1440-tile-03.png]

**F22.** **Evidence quality is not signalled.** Across the ten records there is no peer-review
mark, no review status, no sample count, no replication or reuse indicator, no confidence or
completeness mark, and no "self-reported" or "not reviewed" label. Everything on the list is
user-contributed and nothing says so. Three marks sit where a reader might look for quality and none
of them supplies it: the ORCID iD (attests identity, not work), the green "Open" badge (attests
access, not merit), and — the one the first pass missed — the "Part of VALSOUNDS" line, which is
present on every row and is curation-adjacent, but names a collection rather than reporting that
anyone reviewed the deposit. [capture: index-1440-tile-02.png, index-1440-tile-03.png,
index-1440-tile-04.png]

**F23.** The numbers on offer are usage, not evidence, and they are close to empty: across the
visible rows the view count reads 0 on every record and downloads read 0, 1, 2, 4, 6 and 11. A
count rendered in the position where a quality signal would sit, reading zero, is worse than no
count — it invites a reader to treat attention as standing. [capture: index-1440-tile-02.png,
index-1440-tile-04.png]

**F24.** Version is the only evolution signal, and it is inconsistent: the same badge slot renders
"(v1)" on some rows and "(V1)" on others. There is no diff, no supersession link and no "newer
version exists" mark anywhere in the captures. [capture: index-1440-tile-04.png,
index-1440-tile-03.png]

**F25.** What a reader gets here that a trial registry cannot give: the deposited artefact itself
and a persistent identifier bound to a specific version. The tombstone makes the point sharply —
the files are gone, but the DOI `10.5281/zenodo.22273492` and the full citation string are still
rendered as labelled fields, so a citation made before withdrawal still resolves to a page that
explains itself. A registry can tell you a study existed; this tells you what was deposited, under
what identifier, and what happened to it. Note that no copy control exists for that identifier or
citation — a reader must select the text by hand — and the DOI URL renders in body-text black rather
than as a link. [capture: content-1440-tile-01.png; domEvidence:
copyControls]

**F26.** Licence is not shown on the list row. The manifest records the selected record as CC-BY
4.0, but nothing in any index capture displays a licence for any record; the green "Open" badge is
the only rights-adjacent mark, and open access is not the same fact as a reuse licence. [capture:
index-1440-tile-02.png, index-1440-tile-03.png]

## 9. Absence handling

**F27.** This is the site's strongest single idea. A removed record does not 404 and does not go
blank. It renders a stable page that names the absence ("Gone"), explains it in one plain sentence
("The record you are trying to access was removed from Zenodo. The metadata of the record is kept
for archival purposes."), and then gives six labelled facts about the absence itself: **Reason for
removal** (Retraction/Withdrawal of a record), **Removed by** (Owner), **Deletion Policy** (record
owners can delete within 30 days of publishing), **Date of removal** (September 3, 2026),
**Citation** (full author-date string with the DOI URL), **Identifier** (10.5281/zenodo.22273492).
The absence is treated as a record with its own fields rather than as an error. [capture:
content-1440-tile-01.png, content-375-tile-01.png]

**F29.** The tombstone box does not stretch to fill the viewport. It ends where its content ends,
leaving about 100 px of white and then the footer — the page is short because the record is short.
[capture: content-1440-full.png, content-1440-scroll-90.png]

**V3 (added by verification).** The tombstone is a dead end. Above "Gone" the header is unchanged
from the index — wordmark, search field, Communities, My dashboard, Log in and an orange "Sign up".
Below it the fact box gives its six rows and stops: no link to the depositor or the community, no
"other versions of this record", no search-for-related, no contact route. The DOI URL renders in the
same black body colour as the surrounding text rather than as a link. For a withdrawn RNAWiki
programme the six labelled rows are the right content model, but the page must also carry the way
back into the corpus. [capture: content-1440-tile-01.png, content-375-tile-01.png]

## 10. Added by verification — browse surface

**V1 (added by verification).** A purely recency-sorted browse list collapses into one depositor's
batch. Nine of the ten front-page records read "Part of VALSOUNDS", and eight of those carry the
identical three-author set (Vanhamme, Vincent; Sluyts, Yannick; Fraikin, Miara); only the first
record (PLATO) and the last (Kügle, Karl) differ. Titles differ by a few words — "Soundscape
parameter set — reconstructed chambre du roi" against "… salle du roi". For RNAWiki: a most-recent
ordering on the browse surface will present one contributor's upload run as if it were the state of
the field. Order or group by programme, not by deposit time alone. [capture: index-1440-full.png,
index-1440-tile-03.png]

**V2 (added by verification).** The browse surface offers no result count, no sort control and no
facets. Between the "Recent uploads" heading and the "More" button there is no toolbar, no "showing
N of M", no sort selector and no filter column — the right rail holds marketing and a newsletter
form instead. A reader cannot tell how deep the list goes or reorder it without leaving the page.
RNAWiki's browse surface should state the count and put sort and filters where that rail sits.
[capture: index-1440-full.png, index-1440-tile-04.png]

## For RNAWiki

### Borrow

**B1 — the tombstone, for structured data blocks and for stopped programmes.** When an RNAWiki
programme is withdrawn, retracted or superseded, keep the URL alive and render a short page of
labelled facts about the withdrawal: reason (the registry's or sponsor's words, nothing beyond
them), who withdrew it, the date, the governing policy, the citation, the identifier. Zenodo proves
this can be six rows and one sentence. It maps directly onto the existing editorial rule that a
stopped trial gets the registry's reason and nothing else, and onto the `CONTRADICTED` /
`NOT_MEASURED` distinctions the boundaries require. [capture: content-1440-tile-01.png]

**B2 — the badge triplet above a result title, for browse/filter.** Three small badges in a fixed
order before the title, each answering a different question, is a cheap and genuinely scannable way
to fingerprint a row. RNAWiki's three would be evidence tier, model-organism ladder position, and
whether any human data exists — the newcomer base state from A3, rendered as markup rather than
prose so it does not count against the uniqueness metric. Awwwards governs the filter surface; this
is a component borrow inside it, not a reassignment. [capture: index-1440-tile-02.png,
index-375-tile-02.png]

**B3 — text-only rows, no thumbnails, for browse/filter.** Ten dense records with no imagery and
no cards, still scannable at 1440 and at 375, because colour is spent on three badges and nothing
else. [capture: index-1440-tile-03.png, index-375-tile-02.png]

**B4 — a per-person provenance mark that costs one glyph, for the dossier reading column.** The
ORCID iD sits after each author name at ~14 px and says "this person is identified" without a
sentence. RNAWiki's equivalent is a reviewer-identity mark on a published conclusion. It must be
labelled the first time it appears, per the copy rules. [capture: index-1440-tile-02.png]

**B5 — space between records, not inside them.** A hairline rule plus ~40 px clearance groups a
ten-field record with no border and no card. [capture: index-1440-tile-02.png]

### Avoid

**A1 — a header search that disappears at mobile.** At 375 px Zenodo's search field is replaced by
a hamburger, so the first mobile screen offers no visible way to search. RNAWiki's home search bar
is frozen and must remain the single primary action at 375 px and at 320 px. This is the sharpest
negative lesson from the site. [capture: index-375-tile-01.png]

**A2 — spending the first screen above the list on one promoted item.** The featured-communities
band takes ~315 px, about a third of the first desktop screen, for one flag and one sentence — and
at 375 px it takes the whole first screen. Nothing may
sit above or beside RNAWiki's search bar; a promoted-item band of this kind is exactly the proposal
to discard. [capture: index-1440-tile-01.png]

**A3 — a rail spent on promotion, and a rail that runs out.** "Why use Zenodo?" and a newsletter
form occupy the rail position where a contents rail belongs, and both stop at ~y=1,272 leaving
~1,900 px of dead right column beside the continuing list. RNAWiki's contents rail must carry navigation for the whole length
of the page it serves, or not exist. (That surface is still unassigned under the Phase 2 stopping
rule; Zenodo does not fill the gap.) [capture: index-1440-tile-02.png, index-1440-full.png]

**A4 — usage counts in a quality position.** Views and downloads next to a record read as standing
and measure attention; here nearly every one reads 0. RNAWiki should show no view or download count
beside evidence. [capture: index-1440-tile-02.png, index-1440-tile-04.png]

**A5 — a collection label standing in for a review label.** Every record on Zenodo is
self-deposited and nothing on screen says so; an ORCID mark, an access badge and a "Part of
<community>" line occupy the slot a reader scans for provenance, and none of the three reports that
anyone checked the work. RNAWiki must keep contributed and reviewed material visibly distinct, and
must not let a programme or collection name imply review. [capture: index-1440-tile-03.png]

**A6 — inconsistent version casing, and a version with no supersession link.** "(v1)" and "(V1)" in
the same badge slot; no "newer version exists" pointer anywhere. RNAWiki's citation evolution map
and its `programme_current_publications` pointer both depend on version being rendered exactly and
linked. [capture: index-1440-tile-04.png, index-1440-tile-03.png]

**A7 — no copy control on an identifier meant to be copied.** The DOI and the citation string are
plain text with no copy affordance, and the DOI is not even hyperlinked. Stripe governs structured data blocks and its per-block copy
button is the right model. [capture: content-1440-tile-01.png; domEvidence: copyControls]

### Phase 2 verdict

**not-named.** Zenodo does not appear in the Phase 2 table and this pass does not argue for giving
it a governing assignment. It is light-only (no `prefers-color-scheme` rule across seven sheets),
which is consistent with the decided light default but is not evidence for it; its measured
text-to-HTML on the captured page is 1.72%, but that number is taken from a tombstone with 1,102
characters of text and is not a fair reading of the site, so it cannot be used for or against
anything.

What Zenodo does earn is one component decision inside an already-assigned surface: **the tombstone
belongs in the structured-data-blocks spec that Stripe governs**, as the shape RNAWiki uses for a
withdrawn, retracted or superseded programme. That strengthens rather than disturbs the Stripe
assignment — Stripe supplies the block mechanics (labelled field rows, the chrome type scale, a copy
control), Zenodo supplies the content model for absence. Its badge triplet is a second component
borrow inside the awwwards-governed browse surface. Neither changes a governing reference. The
contents-rail gap stays open: Zenodo has no rail worth the name, so the stopping rule stands.

## Verification

Independently verified against the captures on 2026-09-04: 23 confirmed, 16 qualified, 1 refuted, 3
added (V1–V3). Every finding below was changed; the rest stand as written.

- **F28 — refuted and removed.** "On the list, absence renders nothing" rests on a case no capture
  shows: every one of the ten rows carries all ten fields, so no row is missing anything for the
  page to render as blank. Zenodo's list-level absence behaviour is unobserved in this pass. The
  honest limit the finding also stated — every tombstone field has a value, so empty-field behaviour
  there cannot be judged — is preserved in this note.
- **F1 — qualified.** The featured-communities band is ~315 px (y≈75 to y≈390), not ~390 px, and
  "Recent uploads" begins at y≈446, not y≈430.
- **F2 — qualified.** Five visible bands, not four, and weight plus ~4 px of size share the work
  with colour and sequence.
- **F6 — qualified.** The largest correction of the pass. "Gone" has ~30 px of clearance, not ~90,
  and it is not the only large type in the viewport: the retained header's white wordmark and orange
  "Sign up" are larger, higher-contrast and the only warm colour on a page whose sole message is
  that the record is gone.
- **F7 — qualified.** ~3.3 records per 900 px desktop screen and ~2.0 per 812 px mobile screen, not
  3.5 and 1.7; ten fields per row, not nine.
- **F9 — qualified.** The rail ends at y≈1,272 and ~1,900 px of right column runs empty beside live
  content, not ~2,300 px; the balance is footer.
- **F10 — qualified.** Band is ~315 px, not ~390 px.
- **F11 — qualified.** The four internal gaps were all understated; measured they are ~20 / 7 / 25 /
  20 px. The pattern the finding draws from them holds.
- **F14 — qualified, and strengthened.** The header is not merely untested: at scrollY 13 it is
  clipped at the top edge, so it scrolls with the page and is non-sticky at that depth.
- **F15 — qualified.** Ten records on the front page, not twelve.
- **F17 — qualified.** The lightning bolt is not the only other graphic in the study; ORCID circles,
  the "Open" padlock, eye and download glyphs, carousel arrows, the search magnifier and the footer
  logos all appear in the cited captures.
- **F20 — qualified.** With the record withdrawn, where the "longevity" keyword matched cannot be
  seen, so "the keyword matched a word, not a field" was inference and has been cut back to the
  visible fact.
- **F22 — qualified.** Ten records, not twelve, and "nothing on screen says so" was overstated: the
  "Part of <community>" line is on every row and is curation-adjacent, which is the actual hazard.
- **F33 (JSON borrow finding) — qualified.** Ten ten-field records, not twelve nine-field ones.
- **F36 — qualified.** ~315 px and ~35% of the first desktop screen, not ~390 px and 60%; the 60%
  figure describes the distance to the first record title (y≈537), which includes the header and the
  "Recent uploads" heading. At 375 px the band does take the entire first screen.
- **F37 — qualified.** ~1,900 px of dead right column, not ~2,300 px.
- **F39 — qualified.** Rewritten from "unlabelled corpus" to the sharper hazard: a collection label
  sitting in the provenance slot and reading as a review label.

The Phase 2 verdict is unchanged at **not-named**. Nothing verified here bears on a governing
assignment, and the 1.72% text-to-HTML figure remains unusable because it was measured on a
1,102-character tombstone.
