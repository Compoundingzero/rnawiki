# wiki.biohack.me (HumanAug Wiki) — Track A2 viewing notes

HumanAug Wiki is a small DokuWiki-based community wiki for the human augmentation / "grinder"
community — implants, body modification and adjacent topics — running the Bootstrap3 template, light
only. Two pages were captured: the start page `https://wiki.biohack.me/` and the topic page
`https://wiki.biohack.me/doku.php?id=biology`. The manifest records that the originally chosen
article (`index.php?title=Magnets`) redirects to the start page and that the wiki serves no MediaWiki
API, so the content page is the first article link found on an already-fetched page. No consent or
cookie banner was found in any of the four passes (`bannerActions`), so nothing in these images is a
banner sitting over the design. One file named in the viewing order does not exist:
**content-1440-tile-02.png is missing**, because the desktop content page is exactly one viewport
tall — `content-1440-full.png`, `content-1440-tile-01.png` and all three `content-1440-scroll-*`
files share one sha256 in the manifest, and viewing `content-1440-scroll-90.png` confirms it is the
same unscrolled screen. Everything below is from the images; the DOM record is used only where a
behaviour is inferred.

## 1. Visual hierarchy

**F1.** The page-level hierarchy is carried almost entirely by size and position, with no help from
colour and none from spacing. On the content page "Biology" is roughly 26 px dark grey over a
full-width horizontal rule; nothing else in the reading area is larger. "Genes", "Body" and
"Gender & Sex" below it are visibly larger and heavier than the links they head — about 18 px
semi-bold against 15 px links — so the earlier reading of "close to body size" understates the type
step. What flattens them is the spacing: "Genes" (y=215), "Body" (245), "Neuro" (275), "Cell and
Tissue Culture" (305), "Gender & Sex" (336) and "DIY HRT" (365) sit on an even 30 px pitch, label and
link alike, so nothing separates a group from its members and the labels read as bold rows in a list.
[capture: content-1440-tile-01.png, content-1440-full.png]

**F2.** The strongest colour on either desktop first screen is not content. The green "Register"
button in the fixed top bar is the only saturated fill on the page, and the blue `[[ biology ]]` /
`[[ start ]]` badge sitting above the content card is the second. Both are chrome. The h1 wins on
size; the chrome wins on colour. [capture: index-1440-tile-01.png, content-1440-tile-01.png]

**F3.** Grouping in the left rail is done with thin horizontal rules, and **two** rules — not three —
cut the list into three blocks: Home / "Biohacking - Human Augmentation"; the eight topic links plus
"About the Wiki"; and "Contributing". The rail does not colour-code the current page. The two plain
dark entries ("Biohacking - Human Augmentation", "About the Wiki") are the same two on both pages
captured, and on `content-1440-full.png` the page you are actually on, "Biology", is still an
ordinary blue link — so dark text marks a non-link label, not location. There are no counts, no icons
and no indentation either, so all eight topic links carry identical weight: the rail states a taxonomy,
ranks nothing inside it, and gives no "you are here" signal at all. [capture: index-1440-tile-01.png,
content-1440-tile-01.png]

## 2. Where the eye lands first

**F4.** At 1440 the only saturated colour on the first screen is above the article, not in it. The h1
is the largest type but sits at roughly y=165, below a full-width fixed 51.5 px bar and below a blue
identifier badge pinned to the right edge. Only the green Register is a filled button — Log In is an
outlined white one — so "the only two filled buttons" overstated it, and a still image cannot settle
whether the eye truly reaches a small green button before a 36 px headline. What it does show is
account chrome competing with the title rather than deferring to it. [capture:
index-1440-tile-01.png, content-1440-tile-01.png]

**F5.** At 375 the eye lands on the content, and the reason is subtraction rather than design: the
top bar collapses to a logo and a hamburger, the search box disappears entirely, and the wrapped
three-line "Human Augmentation Wiki" h1 becomes by far the heaviest thing on screen. The mobile first
screen is better ordered than the desktop one, at the cost of losing search from the first screen
altogether. [capture: index-375-tile-01.png, content-375-tile-01.png]

## 3. Information density

**F6.** The content page is close to empty. One screen at 1440 holds an h1, three bold labels, four
links and a metadata line — the DOM record for this page gives 611 characters of visible text against
43,481 characters of markup, a 1.41 % text-to-HTML ratio. In the image the last text sits at y=365
inside a card running from y=100 to y=511, so roughly the bottom **third** of the card is blank —
about 135 px of 411, not "roughly the lower half". Why the card holds that height (a minimum height
was suggested) is not visible in the capture. [capture: content-1440-full.png,
content-1440-tile-01.png]

**F7.** The site's only list handling is a bare vertical stack of links with bold labels acting as
group headers. There is no table, no column, no count, no date per item, no description per item. A
reader cannot tell from `content-1440-tile-01.png` whether "Cell and Tissue Culture" is a long
article or a stub — the list carries no per-row signal at all. [capture: content-1440-tile-01.png,
content-375-tile-01.png]

## 4. Whitespace

**F8.** Whitespace here is leftover, not spent. The left rail ends at y=418 and roughly 180 px of
empty column follows before the footer rule near y=600 — the earlier figure of 470 px counted straight
through the footer to the bottom edge of the capture. Inside the card the last text is at y=365
against a card bottom at y=511. No interval anywhere on the page is larger than the uniform 30 px row
gap, so nothing is separated deliberately while two large voids say nothing. [capture:
content-1440-full.png, index-1440-full.png]

**F9.** Where whitespace is used deliberately, it is inside the card: consistent padding around the
content, a rule under the h1, and generous line spacing in the index paragraphs, which read
comfortably at both widths. The mobile rendering is the better use of the same rule — a single
padded card, one column, paragraphs separated by a clear interval. [capture: index-375-tile-01.png,
index-1440-tile-01.png]

## 5. Long scroll

**F10.** There is no long scroll to judge on this site. The desktop content page fits in one 900 px
viewport, and the manifest's scroll captures at 0, 50 and 90 % are byte-identical to the full-page
image; `content-1440-scroll-90.png` shows the unscrolled top of the page. At 375 the content page is
911 px against an 812 px viewport, so the maximum scroll is 99 px (`scrollY` 50 and 89 in the
manifest). Any claim about rhythm over distance would be invented. [capture:
content-1440-scroll-90.png, content-1440-full.png]

**F11.** What does persist is visible in the small mobile scroll. The top bar stays fixed and the
breadcrumb strip slides under it; the four-icon vertical rail on the right stays in place; and a
small back-to-top control appears at the bottom-right corner once the page has moved. The DOM record
lists four fixed elements — `nav.navbar-fixed-top` at 51.5 px, `div.tools.panel.affix-top` at top
150, a hidden modal and `a.back-to-top` — which matches what the scrolled views show (inferred, from
`stickyOrFixed`). The end of the page is a site footer: logo, rule, Creative Commons badges and the
licence sentence on the left, five technology badges on the right. [capture:
content-375-scroll-50.png, content-375-scroll-90.png, index-375-tile-02.png]

## 6. Imagery

**F12.** There is no meaningful imagery anywhere in these captures. Every picture is an emblem: the
site avatar in the bar and footer, the four Creative Commons glyphs, five technology badges, small
globe markers before external links, and the icon glyphs in the two tool clusters. The DOM record
counts 12 images, 40 SVGs and 0 canvases on the content page, and none of them is a diagram, a photo
or a data graphic. On a page about biology this is the whole answer to "what happens when there are
none": the page does not attempt an illustration and does not leave a gap where one would go.
[capture: content-1440-tile-01.png, index-1440-full.png]

## 7. Defers or competes

**F13.** The chrome physically sits on the content. The table-of-contents panel is an absolutely
positioned white box overlaid on the top-right of the content card; at 1440 it covers the right
portion of the rule under the h1 and floats above the reading area rather than beside it. Directly
outside it, a second four-icon rail overlaps the card's right border. Two pieces of navigation are
drawn on top of the article. [capture: content-1440-tile-01.png, index-1440-tile-01.png]

**F14.** Counting the first screen properly: wordmark, search field, search button, wrench dropdown,
Register and Log In in the top bar; five unlabelled glyphs above the h1 (share, feed, mail, print,
link); the table-of-contents toggle; and four unlabelled glyphs in the fixed right rail — **sixteen**
interactive controls outside the left navigation, around a body of three labels and four links. The
earlier count of thirteen both omitted the search field, search button, wordmark and TOC toggle and
counted the `[[ biology ]]` badge, which is a label and not a control. The design does not perform,
but it does not step back either; it surrounds a nearly empty article with tools. [capture:
content-1440-tile-01.png, content-1440-full.png]

## 8. Information design of data-heavy, uncertain, community-sourced material

**F15. Say it plainly: this site is not longevity-relevant.** The index describes itself as a
resource for "grinders or cyborgs" doing "functional (sometimes extreme) body modification", and the
navigation is Biology / Lifestyle & Chemical / Tech - Wearables & Implants / Skills & Education /
Projects / In the Media / People / Resources. The single adjacent entry in the whole capture set is
"DIY HRT" on the biology page, and it is a red link — the article does not exist. Nothing here is a
compound record, a dose, a study or an outcome. [capture: index-1440-tile-01.png,
content-1440-tile-01.png]

**F16. The only structured data on the content page is provenance, and it is one line.** Below the
card, in small grey type: a document icon and the source file name `biology.txt`, a calendar icon and
"Last modified: 2025/04/16 05:57", then "by cyberlass". That is the complete record — file
identifier, timestamp, author handle. There are no fields, no metadata rows, no badges, no counts, no
version number, no DOI or other identifier, and no licence statement at page level (the licence is
stated once site-wide in the footer). [capture: content-1440-full.png, content-375-scroll-90.png]

**F17. There is no visual signal of evidence quality or uncertainty anywhere in these captures.** No
verified, reviewed or peer mark; no sample count; no replication note; no "self-reported" flag; no
confidence indicator; no citation to a source of any kind on either page. The two literature-shaped
links present on the index go to the community's own Code of Ethics and Code of Conduct, and both are
marked only as external by a small globe glyph. A reader has the author handle and the date, and from
those must infer everything else. [capture: content-1440-tile-01.png, index-1440-tile-01.png]

**F18. User-contributed content is not distinguished from editorial because there is no editorial
layer to distinguish it from.** The index says so in prose — "This wiki is a resource for
biohackers" — and "Contributing" closes the left rail. The account controls are Register (filled
green) and Log In (outlined white), and they are not on "every screen": at 375 both are hidden behind
the hamburger. Everything is contributed; the design's honest position is that it never implies
otherwise. [capture: index-1440-tile-01.png, index-1440-full.png, index-375-tile-01.png]

**F19. What a reader gets here that a trial registry cannot: a per-page author handle and a
modification date attached to prose a registry would never carry, plus a topic taxonomy that names
categories a registry has no field for.** That is the whole of it in these captures. It is a real
thing — a registry cannot tell you who wrote a sentence and when — but it is provenance without
evaluation, and on the biology page the sentences it would attach to do not exist. [capture:
content-1440-full.png, index-1440-tile-01.png]

## 9. Absence handling

**F20. Absence of a linked record is coded in the link itself, and this is the site's one good
information-design move.** On the biology page "Neuro" and "DIY HRT" are red with a dotted underline
while "Cell and Tissue Culture" and "External Link" are blue and solid. The red form is the standard
DokuWiki mark for a link whose target page does not exist. A reader can tell, in the flow of the
list and with no extra row, which topics are written and which are only named. It survives at 375
unchanged. [capture: content-1440-tile-01.png, content-375-tile-01.png]

**F21. Absence of a field renders nothing at all — because there are no fields.** No placeholder, no
"not available" line, no empty section appears anywhere in the four passes. The content page carries
no metadata block whatever beyond the one last-modified line, so there is no empty-state behaviour to
observe. The related claim that the reader's outline and the declared outline disagree is withdrawn:
`headingOutline` in the DOM record stops at `h3`, and DokuWiki generates the visible table of contents
from the page's own headings, so its four entries are evidence that deeper headings exist rather than
evidence of a mismatch. [capture: content-1440-tile-01.png, content-1440-full.png]

## 10. Baseline

**F29.** The site is light-only. Every capture is light on a near-white ground; the DOM record finds
no `prefers-color-scheme` rule across six readable sheets, no `data-theme` attribute, no `kbd` text,
no `aria-keyshortcuts` and zero copy controls, and there is no visible theme control. Key handling
does exist in script (`scriptTokens` records `metaKey` and `keyCode` as true), so this is an absence
of visible affordances rather than proof that no key does anything. No palette, palette-toggle or
command-palette behaviour can be claimed from this site (inferred, from `prefersColorScheme`,
`htmlAttributes`, `kbdTexts`, `ariaKeyshortcuts`, `copyControls`). [capture: index-1440-full.png,
content-1440-full.png]

## For RNAWiki

### Borrow

**F22.** Existence-coded links: a reference to a record that does not yet exist should look different
from one that does, inline, with no extra markup and no extra row. RNAWiki's version is a compound or
programme named in dossier prose that has no published page yet — distinguishable at a glance without
a "not recorded" line, which the uniqueness constraint forbids anyway. Surface: **dossier reading
column**. Use a form other than red-on-white; the red here is low contrast against the near-white
card. [capture: content-1440-tile-01.png, content-375-tile-01.png]

**F23.** The provenance line placed *below and outside* the reading card, in small grey type: record
identifier, timestamp, contributor. It does not interrupt the prose, it is the same shape on every
page, and it answers "who and when" without pretending to answer "how good". RNAWiki's dossier and
structured data blocks need exactly that separation between provenance and evaluation — with the
evaluation this site never supplies. Surface: **dossier reading column**, **structured data blocks**.
[capture: content-1440-full.png, content-375-scroll-90.png]

**F24.** Licence and terms stated once, site-wide, in the footer, never repeated per page. That is
the same rule as "repeated elements are markup, never prose; shared explanatory sentences live on ONE
linked page", and this site follows it without exception across both pages captured. Surface:
**reference / definitions page** (as the single home for shared statements). [capture:
index-1440-full.png, content-1440-full.png]

### Avoid

**F25.** The floating table-of-contents panel overlaid on the content column. It covers the rule
under the h1 at 1440 and sits above the text rather than beside it, and a second unlabelled icon rail
straddles the card's right border. Surface: **dossier contents rail and previews** — this is a
concrete argument for the rail living in its own column with its own space, as Stripe's does, rather
than as an overlay. [capture: content-1440-tile-01.png, index-1440-tile-01.png]

**F26.** A saturated account button as the only strong colour on the first screen. Surface: **home —
search bar frozen**. Nothing may out-weigh the search bar, and colour is a weight; the green Register
here beats the h1 on colour on every screen it appears. [capture: index-1440-tile-01.png]

**F27.** The raw page identifier badge `[[ biology ]]` in the main view. RNAWiki's copy rules put raw
enums, digests and record ids in a labelled technical disclosure; this puts the wiki's internal page
id in a coloured badge at the top of the reading area, where it reads as a status chip and is not
one. Surface: **dossier reading column**. Related: nine unlabelled glyphs across two clusters on a
611-character page. [capture: content-1440-tile-01.png, content-375-tile-01.png]

**F28.** Dropping search entirely at 375 behind a hamburger. The desktop bar has a visible search
input (`form[role=search]`, `input Search`, 2 affordances in the DOM record) and the mobile bar has
none. RNAWiki's search bar is frozen and must survive the narrow viewport. Also avoid the thin-content
shape itself: a page that is a bare list of links with no prose, no per-row signal and 1.41 %
text-to-HTML is the failure mode the corpus is trying to climb out of, not a model. Surface: **home**,
**browse / filter**. [capture: index-375-tile-01.png, index-1440-tile-01.png, content-1440-full.png]

### Phase 2 verdict

**Not named.** wiki.biohack.me does not appear in the Phase 2 table, and nothing seen here argues for
giving it a surface: it has no reading column to measure against Smashing, no filter grid to set
against Awwwards, no data block to set against Stripe, and no evidence-quality vocabulary at all. Its
usefulness to Phase 2 is negative and specific, and it lands on the one row currently marked
**unassigned — stopping rule**: the *dossier contents rail and previews*. This site is a worked
example of the failure mode that row must avoid — a contents panel that floats over the article
instead of occupying a column, plus a second unlabelled rail overlapping the same edge. That
**strengthens the proposed Stripe rail** (in-flow, generated from headings, one real hinge) without
supplying a new candidate, and it says nothing about hover previews, which are still unobserved. One
pattern is worth carrying regardless of surface: existence-coded links (F20/F22). [capture:
content-1440-tile-01.png, content-1440-full.png]

## Verifier additions

**V1. The reading column has no measure.** At 1440 the index prose runs the full width of the card:
"This wiki is a resource for biohackers…" occupies one line from x=301 to x=1370, roughly 150
characters. At 375 the identical sentence wraps to four short lines inside the same padding. This is
the concrete reason F9's "works better at 375" holds — the mobile column is narrow by accident of
viewport, not by a set measure. RNAWiki's **dossier reading column** should set an explicit maximum
text width instead of letting the card decide it. [capture: index-1440-full.png,
index-375-tile-01.png]

**V2. At 375 the whole browse surface leaves the first screen, not just search.** The mobile bar holds
only avatar, wordmark and hamburger; below the blue identifier badge sits a single grey strip reading
"Biohacking - Human Augmentation" with a list glyph, and that strip is all that remains of the
eleven-link rail visible at 1440. F5 and F28 record the lost search box; the lost taxonomy is the
larger half of the same subtraction. Surface: **browse / filter** — at the narrow viewport this design
leaves no way to move sideways between topics. [capture: index-375-tile-01.png,
content-375-tile-01.png]

**V3. The floating tool rail never adapts, while the contents panel beside it does.** At 375 the table
of contents collapses to a small toggle button and stops covering anything, but the four-icon tool
panel keeps its desktop position: it lies on top of the card's right border, about 16 px from the
viewport edge, over the text, in every mobile capture. It is genuinely fixed — its icons hold
y=227/254/281/307 across `content-375-scroll-00`, `-50` and `-90` while the text slides under them
(DOM: `div.tools.panel`, position fixed, top 150). This strengthens F25: give a contents or tools rail
its own column, and treat a control that only fits once collapsed as one that never earned the overlay.
Surface: **dossier contents rail and previews**. [capture: content-375-tile-01.png,
content-375-scroll-50.png, content-1440-full.png]

## Verification

Independent pass, 2026-09-04. All nine distinct capture files were opened and their sha256 values
recomputed on disk; the manifest's five-way identity for the desktop content captures is correct, so
F10 stands and `content-1440-tile-02.png` is genuinely absent. **21 confirmed, 8 qualified, 0 refuted,
3 added.** Nothing was refuted outright; every qualified finding kept a core the images do show.

- **F1 — qualified.** The sub-labels are one clear size and weight step above the links, not "close to
  body size"; what actually flattens them is the uniform 30 px row pitch, which the rewrite now names.
- **F3 — qualified, and the most important correction.** There are two rules, not three, and plain dark
  text does not mark the current page: the same two entries are dark on both pages, while the current
  topic "Biology" stays an ordinary blue link. The rail carries no current-page state to borrow.
- **F4 — qualified.** Only Register is a filled button; Log In is outlined. Where the eye lands cannot
  be settled from a still, so the claim was narrowed to what the capture shows — the only saturated
  colour sits above the h1.
- **F6 — qualified.** Roughly the bottom third of the card is blank (≈135 px of 411), not the lower
  half, and the minimum-height explanation is not visible in the image.
- **F8 — qualified.** The blank column below the rail is about 180 px before the footer rule; the 470 px
  figure counted through the footer to the bottom of the capture.
- **F14 — qualified.** Sixteen controls, not thirteen: the count omitted the search field, search
  button, wordmark and TOC toggle, and counted the `[[ biology ]]` badge, which is a label.
- **F18 — qualified.** Register and Log In are not "the two filled buttons on every screen" — one is
  outlined, and at 375 both are behind the hamburger.
- **F21 — qualified.** The outline-mismatch inference is withdrawn: `headingOutline` stops at `h3` and
  the table of contents is generated from the page's own headings, so four TOC entries evidence deeper
  headings rather than a contradiction.
- **F29 — confirmed, with a note.** `scriptTokens` shows `metaKey` and `keyCode` true, so the finding
  records an absence of visible affordances, not an absence of key handling. F29 had no section in
  these notes and one was added above so the JSON and the Markdown agree.
