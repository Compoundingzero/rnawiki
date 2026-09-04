# atlasobscura.com — Track A1 visual findings (recaptured 2026-09-04)

Atlas Obscura is a travel-and-curiosity publisher built around a user-contributed catalogue of
places. Two pages were captured: the home page (`https://www.atlasobscura.com/`) and a long
content page, "All 32,223 Places on One Map"
(`https://www.atlasobscura.com/articles/all-places-in-the-atlas-on-one-map`), each at 1440x900 and
375x812, with three real scrolled viewport views on the content page at each width. This is the
recaptured pass; any earlier findings file for this site described captures made by a defective
banner-decliner run and has been overwritten, not reused. `bannerActions` in the manifest records
that on all four passes the decliner found no permitted refusal control and left a banner standing.
**No consent banner content is visible in any image I viewed.** The hairline-bounded strips labelled
"ADVERTISEMENT" are the site's own reserved advertising slots and are judged as design. *Verifier
correction:* the **unlabelled** empty band at the top of every capture (~245 px desktop, ~50–70 px
mobile) is **not** judged as design — an unpopulated container of unknown identity is exactly what a
standing banner would produce, and it has been removed from F16 and A9.

One capture caveat that changes how two sections must be read: the tile pass and the scroll pass on
the content page were taken at different moments. `content-1440-tile-03` shows the "Keep Exploring"
cards as flat grey rectangles; `content-1440-scroll-50` shows the same four cards with photographs
in boxes of exactly the same size and position. The grey is unloaded imagery, not a design choice —
but the fact that the box does not resize when the photograph arrives is a design choice, and it is
the one I report.

## 1. Visual hierarchy

**F1.** On the content page the hierarchy is: title, then subtitle, then the map, then the reading
column — and it is built almost entirely from size and centring, not colour. "All 32,223 Places on
One Map" sits at roughly 56 px in a heavy geometric sans; the subtitle "The definitive map of the
world's extraordinary sights." is about 26 px in the same family at normal weight; the byline drops
to about 13 px in letterspaced small caps. Three steps, each roughly half the last, all in the same
near-black brown on white, all centred on the same axis. Nothing is coloured to compete.
[capture: content-1440-tile-01, content-1440-scroll-00]

**F2.** The home page uses the opposite mechanism for its top level: the headline "The World's
Hidden Wonders" is set at about 42 px on two lines in the left half, while the right half is a
photograph roughly 755 x 500 px. The photograph wins the first read by area and contrast, not by
type. The type hierarchy above the search bar is orderly — 13 px letterspaced kicker "THE DEFINITIVE
GUIDE TO", 42 px headline, 17 px serif standfirst — but all of it is losing to the image beside it.
[capture: index-1440-tile-01, index-1440-full]

**F3.** Section headings across the home page use one repeated device: a small letterspaced kicker
above ("EDITOR'S PICKS", "ATLAS OBSCURA COMMUNITY", "HIDDEN WONDERS", "BOOKS AND BOX SETS") and a
large two-tone heading below where the last word turns tan against near-black ("Begin Your
*Journey*", "Featured *Members*", "Explore the *Atlas*", "Complete Your *Bookshelf*"). It is
consistent enough that you can navigate the page by it, and it is the only place colour is used to
carry rank. [capture: index-1440-tile-02, index-1440-tile-04, index-1440-tile-07]

**F4.** The third level of the hierarchy is the card kicker: a 10–11 px letterspaced category word in
near-black sits directly above every card title — "ABANDONED", "CAVES", "RUINS", "POLAND", "SPAIN",
"VIDEO". It is the smallest type on the page but it is the first thing that classifies the item, and
because it is uppercase and tight against the title it reads before the title does.
[capture: content-1440-scroll-50, index-1440-tile-03, content-375-scroll-50]

## 2. Where the eye lands first

**F5.** Desktop home: the eye lands on the "Place of the Day" photograph on the right, not on the
headline and not on the search bar. The photograph occupies about 53 % of the viewport width and
carries the only saturated colour on the screen; the search bar is a 456 px white pill with a thin
grey outline, sitting low in the left column with no fill and no colour. The search bar is content,
not chrome, and it reads as subordinate to both the photograph and the headline. *(Qualified: the
original "fourth thing seen" is removed — a still capture can show what dominates, not a reading
order past the first landing.)* [capture: index-1440-tile-01]

**F6.** Mobile home: two dark-filled pill buttons, "Places near me" and "Random place", sit
immediately under the header and **above** the headline and the search bar. They are the only filled
shapes on the first screen and the eye goes to them first. The search bar itself lands about 465 px
down an 812 px screen. Atlas has put two secondary actions above its primary one.
[capture: index-375-tile-01]

**F7.** Mobile content page: about 40 % of the first screen is spent before the article begins — an
empty band of roughly 66 px at the very top, a 62 px header, a 74 px row of the same two action
pills, then the breadcrumb. The title "All 32,223 Places on One Map" starts around y=330 of 812. The
eye lands on the "Places near me" pill, which has nothing to do with the article being opened.
[capture: content-375-scroll-00, content-375-tile-01]

**F8.** Desktop content page: the eye lands on the title, and this is the screen where the design
comes closest to stepping back — a hairline breadcrumb above, the h1, subtitle and byline, a share
row below. *(Qualified: it is not bare. The share row also carries a dark-brown filled "ADD ATLAS
OBSCURA AS A PREFERRED SOURCE ON GOOGLE" button with a full-colour Google glyph, and the map's
saturated cyan begins at about y=700 and fills the bottom 200 px of the 900 px viewport.)*
[capture: content-1440-scroll-00]

## 3. Information density

**F9.** The reading column on the content page is about 646 px wide (text runs x≈387 to x≈1033 in a
1440 px viewport), set in a serif at roughly 19–20 px with generous leading, about 78–82 characters
per line. That is a genuine long-form measure and it is the densest-in-a-good-way thing on the site.
But the article is only **four** short paragraphs — the drop-cap opener, "The possibilities are
vast…", "Start exploring…" and "Hungry for more?…" — and the prose block occupies about 700 px of a
4,673 px page (45 % of the width, 15 % of the height). *(Qualified: paragraph count and the vague
"a fifth of the page" corrected.)*
[capture: content-1440-tile-02, content-1440-tile-03, content-1440-full]

**F10.** Everything below the article is card grid — tag pills, "Keep Exploring" 4-up card row, an
advertisement strip, a membership block, a 5x2 grid of sponsored links, footer. *(Qualified on the
key number: the split is not 80/20 and it is not uniform.)* On **desktop** the article's last line
sits at about y=2,010 of a 4,673 px page, so the article ends at about **43 %** of the scroll and
recommendation and promotion is about **57 %** of the height. On **mobile** it is far worse:
`content-375-full` is 15,358 px tall and the article's last line sits at about y=2,325 — about
**15 %** — leaving roughly 85 % as a two-column card grid running for eleven screens.
`content-375-scroll-50`, the exact midpoint of the page, shows six video cards and not one word of
the article; that evidence is unaffected and stands.
[capture: content-1440-full, content-1440-tile-03, content-375-full, content-375-scroll-50]

**F11.** The one genuinely well-handled dense list is the "Destinations From Across the Atlas" rail on
the home page. Each row is a 116 px square thumbnail, a country kicker, a city name, and then a
two-cell stat table: "PLACES" over "47", "STORIES" over "3", each cell boxed by hairlines, label in
10 px letterspaced grey caps and number in bold below. Rows are separated by a full-width hairline.
Hairlines fall at y=88, 257, 426 and 595, so the row pitch is 169 px and four rows occupy about
**675 px** *(qualified: corrected from 570 px)*. Every number is unambiguous about what it counts.
[capture: index-1440-tile-03]

**F12.** The second good density pattern is the "Top Countries / Top Cities" link table: two blocks
side by side on a pale blue-grey ground, each with a tan heading over a hairline rule, then plain
text links in columns — 2 columns of 6 for countries, 4 columns of 6 for cities. Thirty-six
navigation targets in about 300 px of height, no thumbnails, no counts, no cards. This is the only
place on the site where browsing is offered as **plain text links rather than image cards**, and it
is the most efficient screen region of either page. *(Qualified: "the only list" was too strong —
the destinations rail in F11 is also a list, just a thumbnail-led one.)*
[capture: index-1440-tile-07]

**F13.** The "Featured Members" row shows a compact stat pair worth noting separately from its broken
imagery: under each handle, "**107** places added" and "**556** places been to" — the number bold,
the label regular, both on one line, two lines per person. Six people fit across 1,310 px legibly.
[capture: index-1440-tile-04]

## 4. Whitespace

**F14.** Whitespace on the content page is spent on the reading column margins and on the space
around the title — roughly 390 px of empty left margin and 400 px of empty right margin flanking the
prose, and about 120 px of clear air between the breadcrumb and the h1. The page is willing to leave
more than half its width empty to hold an 80-character measure. That is the site's best decision.
[capture: content-1440-tile-01, content-1440-tile-02]

**F15.** Between home-page sections the gap is large and consistent — roughly 90–120 px of white
before a kicker, about 30 px between kicker and heading, about 60 px between heading and the first
card. The kicker/heading pair is tight and the section gap is loose, so the rhythm reads as
"heading belongs to what follows". [capture: index-1440-tile-02, index-1440-tile-04]

**F16.** Whitespace is also spent on nothing. **At least three** hairline-bounded strips labelled
"ADVERTISEMENT" reserve about 110 px each on the desktop home page — at about y=1,280–1,390
(`index-1440-tile-02`), y=2,450–2,565 (`index-1440-tile-03`) and y=4,170–4,280
(`index-1440-tile-05`), with a fourth visible in `index-1440-full` — roughly **330 px** of vertical
space held open for content that did not arrive. It is whitespace that says "something will be sold
here", which is a different statement from the margins in F14. *(Qualified twice: three strips, not
two; and the unlabelled ~245 px band above the header is **removed** — `bannerActions` records a
banner left standing on all four passes, so an empty container of unknown identity is exactly what
would appear there and it cannot be attributed to the site's design.)*
[capture: index-1440-tile-02, index-1440-tile-03, index-1440-tile-05, index-1440-full]

**F17.** At 375 px the article's side margins collapse to about 10 px — the prose runs almost edge to
edge. The generosity that produced a 646 px column on desktop does not survive the breakpoint; on
mobile the text has less breathing room than the cards below it, which keep about 12 px gutters and
internal padding. [capture: content-375-tile-03, content-375-scroll-50]

## 5. Long scroll

**F18.** On desktop the full navigation bar is replaced during scroll by a slim persistent strip about
48 px tall: the logo mark, the article title "All Places in the Atlas on One Map" in about 16 px
bold, and four social icons at the right. It is present identically at 50 % and at 90 % depth. It
tells you where you are, which is useful, and it is the only persistent chrome — there is no contents
rail, no progress indicator, no section markers. [capture: content-1440-scroll-50,
content-1440-scroll-90]

**F19.** **Three** of those four icons are filled tiles in their brands' own colours — Facebook
blue, Twitter blue, Reddit orange — against a white bar, on a page whose chrome palette is otherwise
near-black brown, tan and white. *(Qualified: the fourth, the mail glyph, is a plain dark outline and
is not brand-coloured.)* At both 50 % and 90 % scroll those three tiles are the most saturated pixels
on the screen. Persistent chrome is the loudest thing in a long scroll here. [capture:
content-1440-scroll-50, content-1440-scroll-90]

**F20.** On mobile nothing persists. `content-375-scroll-50` and `content-375-scroll-90` both show
card content flush to the top edge with no header, no title, no share bar. Eleven screens into a
15,358 px page there is no indication of what page you are on. [capture: content-375-scroll-50,
content-375-scroll-90]

**F21.** The rhythm breaks in one specific place: the newsletter sign-up block is dropped **inside**
the reading column, after the first paragraph, as a grey-filled panel about 650 px wide with its own
heading, tan sub-line, input and black Subscribe button. The reader has had one paragraph before
being interrupted, and the interruption uses the same width as the prose so it reads as part of the
article. The same block appears in the same position on mobile. [capture: content-1440-tile-02,
content-375-tile-03]

**F22.** The end of the desktop content page is a 5x2 grid of ten sponsored links under the heading
"From Around the Web", set in the same size, weight and alignment as "Keep Exploring" above it, and
sharing the same photo-over-title-over-source *shape*. *(Qualified: they are not styled alike. The
Taboola cards use **serif** titles with the advertiser in small caps below and "Learn More" / "Click
Here" / "Read More" buttons; the Keep Exploring cards use bold **sans** titles with a category kicker
above and no button. They are distinguishable — they are simply not disclosed.)* The only explicit
disclosure is "Sponsored Links by Taboola" in small grey serif at the grid's top-right. Then a dark
footer, then a thin cream strip reading "Questions or Feedback? Contact Us".
[capture: content-1440-scroll-90, content-1440-tile-04, content-1440-full, index-1440-tile-10]

## 6. Imagery

**F23.** The map is the only image on either page that carries meaning rather than mood. It is a
full-bleed 1440 px-wide interactive map with dark-green numbered cluster pins — "2863", "1204",
"1097", "497" — and the numbers are the content: the article's claim is "32,223 places" and the map
is how you verify the distribution. It sits directly under the title and above the prose, and the
prose then explains it. This is the correct relationship. [capture: content-1440-tile-01,
content-1440-tile-02]

**F24 — REFUTED and removed.** See the Verification section. Its verifiable half (`content-375-full`
is a near-continuous photographic column) is retained in the corrected A6, which now declares its
domEvidence keys.

**F25.** When an image does not arrive, the box stays. Compare `content-1440-tile-03` (four flat grey
rectangles under "Keep Exploring") with `content-1440-scroll-50` (four photographs in rectangles of
identical size and position). The layout does not shift. Likewise the "Read Next" card renders its
thumbnail as a grey rectangle of the exact final size in the tile pass and as a photograph of a fish
in the scroll pass. Reserving the box is a real and good property; the grey itself is a capture
artefact and should not be reported as a design decision. [capture: content-1440-tile-03,
content-1440-scroll-50]

## 7. Defers or competes

**F26.** The **type system** defers. Two families, one geometric sans for headings and chrome and one
serif for prose; no gradients, no motion visible in any capture. Read purely as a type system this is
restrained, publisher-grade design. *(Qualified: "three colours" describes the chrome only. Outside
that palette sit every card photograph, the map's saturated cyan and green, the full-colour Google
glyph in the byline row, the tan/brown filled buttons, and a soft drop shadow on the Read Next card
in `content-1440-tile-03`.)* [capture: content-1440-tile-01, content-1440-tile-03,
index-1440-tile-02]

**F27.** The page composition competes, and it competes with itself rather than with the reader. On
the content page the design steps back for exactly one screen (F8) and then spends the next four
thousand pixels selling: a newsletter panel inside the prose (F21), a "Read Next" card, a "Become an
Atlas Obscura Member" block with a filled tan button, a Taboola grid, an app download, a footer
newsletter form. Six separate asks after **four** paragraphs of article *(qualified: paragraph count
corrected)* — and a seventh, the filled "ADD ATLAS OBSCURA AS A PREFERRED SOURCE ON GOOGLE" button,
is already in the byline row above the map. [capture: content-1440-full,
content-1440-scroll-50, content-1440-scroll-90]

**F28.** The sharpest instance of competing is provenance labelling. In the home page's right rail,
"BY ATLAS OBSCURA" and "SPONSORED BY VISIT SUN VALLEY" occupy the same slot under the headline, in
the same 10 px letterspaced grey caps, at the same width, with no rule, tint or icon separating
them. The design has made an editorial item and a paid placement visually interchangeable, and the
only difference is one word the reader must actually read. [capture: index-1440-tile-03]

## 8. Absence handling

**F29.** The strongest absence finding: on the home page, under the heading "Explore the Atlas" and
its two filter pills "FEATURED" and "MOST RECENT", there is nothing. About **80 px** of empty white
sits between the pills and the section's end at the ground change; the next section's first text is a
further 165 px down inside its own top padding. *(Qualified: the original ~200 px conflated the two.)*
No cards, no empty-state message, no "no results", no spinner. A browse control is shown with no
result set and no explanation of why. [capture: index-1440-tile-04, index-1440-full]

**F30.** The "Featured Members" row renders six flat grey circles where avatars belong, but every
adjacent text field is complete — handle, "107 places added", "556 places been to". The page keeps
the record and loses the picture, which is the right priority, but it draws six empty circles rather
than dropping the avatar slot. [capture: index-1440-tile-04]

**F31.** The "Member Only Trip Ideas" grid has an empty cell: five benefit items in a three-column
grid, with the first row occupying columns two and three and the top-left cell blank. About 180 px of
blank sits between the first row's description and the second row's label. The grid does not reflow
to close the gap. *(Qualified: "roughly 90 px reserved above each label where an icon belongs" is an
inferred cause with nothing visible in the capture and no domEvidence key; removed.)*
[capture: index-1440-tile-05]

**F32.** Advertising absence is labelled and reserved. Where nothing loads, the site prints
"ADVERTISEMENT" in 10 px grey centred in a hairline-bounded band of about 120 px and holds the space.
This is the one case on the site of an explicit "nothing here" line, and it is spent on the ads, not
on the data. [capture: index-1440-tile-02, index-1440-tile-03, content-1440-full]

**F33.** A broken image falls back to its alt text: in the mobile footer of the *content* page the
Google Play badge renders as a broken-image glyph followed by the blue words "Get it on Google Play"
overlapping the App Store badge beside it. The fallback is honest but unstyled and it damages the
layout. *(Qualified: the same badge loads correctly in `index-375-tile-15`, so this is a capture-time
load failure — exactly the artefact the viewer correctly excluded at F25 — not a design decision.
Only the fallback's styling is reportable.)* [capture: content-375-tile-19, index-375-tile-15]

**F34.** The mobile footer collapses five link groups — PLACES, EDITORIAL, TRIPS, COMMUNITY, COMPANY —
into five closed accordion rows with chevrons, each about 59 px tall with a hairline between. The
desktop version of the same content is a five-column open table. That is the site's only observed
progressive-disclosure control, and it is applied to navigation rather than to evidence.
[capture: index-375-tile-15, content-375-tile-19, content-1440-full]

## 9. Inferred behaviour

**F35.** Inferred: the map supports keyboard panning and zooming. Not visible in any capture; the
domEvidence `kbdTexts` array contains exactly the arrow glyphs, "+", "-", "Home", "End", "Page Up"
and "Page Down", and `content-1440-tile-02` shows a "Keyboard shortcuts" control in the map's bottom
bar. `ariaKeyshortcuts` is empty, so no command palette is claimed. [capture: content-1440-tile-02]

**F36.** Inferred: one copy control exists on the content page, labelled "Copy Link" (domEvidence
`copyControls` count 1). It is not visible in any capture — presumably inside the "SHARE" menu in the
row under the byline. There is no per-block or per-field copy affordance anywhere.
[capture: content-1440-tile-01]

**F37.** Inferred: the recorded fixed layer is almost entirely dormant. Of 23 `stickyOrFixed`
elements, 20 measure height 0 at rest (AdBlockModal, lightbox-modal, subscription-ask-modal, onetrust
panels, and the single `position: sticky` entry). *(Qualified: "the visible strip is the only one that
paints" does not hold. Because the one sticky entry is recorded at height 0, the painting 48 px bar
of F18 cannot be matched to any recorded element; and of the three non-zero entries — a
`grecaptcha-badge` at 60 px, a `nolt-modal` at the full 900 px viewport height, and its 32 px close
button — none paints in any capture.)* [capture: content-1440-scroll-50]

**F38.** Inferred: light-only. domEvidence `prefersColorScheme.found` is false across 54 stylesheets
(5 unreadable), `htmlAttributes.dataTheme` is null and there is no theme control in any capture. The
dark sections on the home page are section grounds, not a dark theme.
[capture: index-1440-tile-07, index-1440-full]

**F39.** Inferred: search is a real input, not a palette. domEvidence `searchAffordances` lists
`input "Search destinations and more…"` and `button "Search"`; the visible bar reads "Search the
Atlas" with a magnifier at its right edge, and there is no keyboard hint chip.
[capture: index-1440-tile-01, index-375-tile-01]

## 10. Added by verification

**V1 — one count, three numbers, no date.** The page states its central figure three different ways
and dates none of them: the h1 reads "All 32,223 Places on One Map"; the opening paragraph reads
"There are now more than 32,100 incredible hidden wonders listed in the Atlas"; and the map renders a
third set of figures as cluster totals (2863, 1204, 1097, 497, 158…). No "as of" date appears
anywhere on the page. For an RNAWiki dossier that states counted facts — trials, sources, claims,
reviewers — the number must be derived once from the published record and carry the date it was
computed, or the page contradicts itself in public and the reader cannot tell which figure is
current. [capture: content-1440-tile-01, content-1440-tile-02]

**V2 — a counted browse idiom and an uncounted one, on the same site.** Below the article sit
fourteen identical outlined pills — LIST, INVENTIONS, MEMENTO MORI, MAPS, GHOST TOWNS, CATACOMBS AND
CRYPTS, NATURAL WONDERS, COLLECTIONS, MONUMENTS, ABANDONED, NATURE, ARCHITECTURAL ODDITIES, ANIMALS,
ARCHITECTURE — all one weight, in no visible order, carrying no counts, wrapping over four rows. Two
thousand pixels of home page away, the destinations rail gives every entry "PLACES 74 / STORIES 2" in
hairline-boxed cells (B1). Atlas has both idioms and gives the counted one to marketing and the
uncounted one to the article. RNAWiki's indication and tag chips should carry the count in the rail's
cell, so a chip leading to two programmes is visibly not a chip leading to forty, and an empty facet
is visible before it is clicked. [capture: content-1440-tile-03, index-1440-tile-03]

**V3 — the scope path does not survive the scroll.** The only thing on the content page that says
*where this article sits* is the breadcrumb — "HOME > STORIES > FEATURE > ALL PLACES IN THE ATLAS ON
ONE MAP" in about 11 px letterspaced grey caps at y=362, directly above the h1. The 48 px persistent
strip that replaces the navigation on scroll (F18, B4) carries the mark and the title only; ten
screens down, nothing says which section the page belongs to. On RNAWiki a reviewed conclusion
belongs inside **one** programme scope — indication, population, dose, trial set — so that scope line
must travel with the title in the persistent strip, not appear once above it and disappear.
[capture: content-1440-tile-01, content-1440-scroll-50]

## For RNAWiki

### Borrow

**B1 — the stat cell, for structured data blocks.** The "PLACES 47 / STORIES 3" pattern from the
destinations rail: a 10 px letterspaced grey label above a bold numeral, each pair boxed by
hairlines, rows separated by a full-width rule. This is exactly the shape a programme's counted facts
need — trials, sources, reviewers — and it stays legible at four rows per 675 px (169 px row pitch,
qualified from 570 px). It reads as a table
without being one, so a programme with three counted fields and a programme with six produce visibly
different blocks rather than one padded template. [capture: index-1440-tile-03]
*Surface: structured data blocks (currently governed by stripe.com/docs). This is a detail borrow
inside Stripe's governance, not a challenge to it.*

**B2 — the plain link table, for browse/filter.** "Top Countries / Top Cities": a coloured heading
over a hairline rule, then plain text links in columns, no thumbnails, no cards, no counts. Thirty-six
targets in about 310 px. For a 619-compound corpus this is the honest way to show a facet list, and
it is the only region of either Atlas page that would raise a text-to-HTML ratio rather than sink it.
[capture: index-1440-tile-07]
*Surface: browse/filter (currently governed by awwwards.com). Corroborates awwwards' "state the
layout in the grid, not in a reading column" rather than displacing it.*

**B3 — the classifying kicker.** A 10–11 px letterspaced category word sitting tight above every
title, everywhere, at every level. On RNAWiki this is where the model organism or evidence tier can
live so it is read before the claim, in the same breath, at a weight that cannot be mistaken for the
claim itself. [capture: content-1440-scroll-50, index-1440-tile-03]
*Surface: dossier reading column (governed by smashingmagazine.com) and browse/filter.*

**B4 — the scroll strip that names the page.** A 48 px bar carrying only the mark and the current
page title, replacing the full navigation on scroll. Cheap, and it answers "what am I reading" eleven
screens down. Take the mechanism; leave the coloured social icons (see A2).
[capture: content-1440-scroll-50, content-1440-scroll-90]
*Surface: dossier contents rail — the currently unassigned item. This is not a contents rail and does
not substitute for one; it is the minimum a long page owes the reader, and Atlas cannot supply the
rail because it has none.*

**B5 — the mobile footer accordion.** Five closed rows with chevrons at 375 px where desktop shows an
open five-column table. A defensible pattern for collapsing repeated navigation markup on small
screens without deleting it. [capture: index-375-tile-15]
*Surface: reference/definitions page (governed by quantamagazine.org), mobile only.*

**B6 — the reserved image box.** The card's image box is the same size and position whether the
photograph has arrived or not, so nothing reflows. [capture: content-1440-tile-03,
content-1440-scroll-50] *Surface: any card grid.*

### Avoid

**A1 — a photograph beside the search bar.** The desktop home page proves the failure mode our
frozen constraint exists to prevent: a 754 x 500 px image in the right half carries the only
saturated colour on screen and takes the first read, while the search field is a 456 px outlined pill
with no fill. *(Qualified: "the search field is fourth" removed — see F5.)* Nothing of this
composition is borrowable. [capture: index-1440-tile-01]
*Surface: home — the search bar is frozen. This is the anti-pattern, not a candidate.*

**A2 — action pills above the primary action.** At 375 px, "Places near me" and "Random place" sit
above the headline and the search bar as the only filled shapes on the screen. The same row appears
above the article title on the content page, pushing content to 40 % down the first screen. Under our
constraint nothing sits above the search bar; this is the concrete thing that rule forbids.
[capture: index-375-tile-01, content-375-scroll-00]
*Surface: home; also the dossier reading column at mobile.*

**A3 — provenance signalled by one word in identical type.** "BY ATLAS OBSCURA" and "SPONSORED BY
VISIT SUN VALLEY" in the same slot, size, colour and letterspacing. For a health-evidence site this
is disqualifying: a source's nature must be carried by position, rule or tint, not only by a word the
reader has to notice. [capture: index-1440-tile-03]
*Surface: dossier reading column; structured data blocks; citation evolution map.*

**A4 — the empty filter region.** A browse heading and two filter pills with no results, no message
and no explanation, leaving about 80 px of blank ground *(qualified from ~200 px)*. Our uniqueness constraint says absent data
renders nothing — that means the control should not render either, or it must say what it found. What
Atlas does is the worst of both: the control renders and the absence is silent.
[capture: index-1440-tile-04]
*Surface: browse/filter.*

**A5 — a form inside the reading column after one paragraph.** The newsletter panel at prose width,
in prose position, one paragraph in. On a dossier this position belongs to evidence, not to an ask.
[capture: content-1440-tile-02, content-375-tile-03]
*Surface: dossier reading column.*

**A6 — recommendation grids as the bulk of the page.** The article ends at about y=2,010 of a
4,673 px desktop page (**43 %**, qualified from 20 %) and at about y=2,325 of a 15,358 px mobile page
(**15 %**), so recommendation and promotion is about 57 % of the desktop height and about 85 % of the
mobile height. `content-375-scroll-50` is the proof at mobile: the exact midpoint of a page titled
"All 32,223 Places on One Map" contains six video thumbnails and no article text. The accompanying
figures — `imgCount` 513, `imgLazyCount` 0, `textToHtmlRatio` 0.0015 — are **domEvidence, not visual
observations**, and are now declared as such; our corpus at 8.3 % has to move the other way.
[capture: content-375-scroll-50, content-375-full, content-1440-full]
*Surface: all of them.*

**A7 — coloured chrome as the loudest thing in a long scroll.** Three brand-coloured filled share
tiles plus a plain dark mail glyph in the persistent bar *(qualified: not four brand-coloured)*, on a page whose palette is otherwise brown, tan and white. If our sticky strip
carries icons they take the text colour. [capture: content-1440-scroll-90]
*Surface: dossier contents rail.*

**A8 — 10 px side margins for prose at 375 px.** Edge-to-edge body text on mobile while the cards
below it keep their gutters. [capture: content-375-tile-03]
*Surface: dossier reading column.*

**A9 — labelled empty ad space as a layout element.** At least three labelled "ADVERTISEMENT" strips
of about 110 px each on the desktop home page — roughly 330 px of held-open blank. *(Qualified: the
245 px unlabelled band above the header is excluded — `bannerActions` records a banner left standing
on all four passes, so that band cannot be read as design.)*
[capture: index-1440-tile-02, index-1440-tile-03, index-1440-tile-05]
*Surface: all of them.*

### Phase 2 verdict

Phase 2 names atlasobscura.com in exactly one row — browse/filter, marked "**half overturned**: Atlas
Obscura dropped" — and drops it on the number 0.17 % text-to-HTML against a corpus target that must
rise from 8.3 %. **Looking at it strengthens that decision, and adds three reasons the number could
not give.** First, the visible form of that ratio is not merely "lots of markup": at 375 px the
article ends at about 15 % of a 15,358 px scroll and the midpoint of the mobile page contains no
article text at all (F10, A6). *Verification corrected the desktop half — the article there ends at
about 43 %, not 20 % — so the imbalance is a mobile finding, not a uniform one, and F24 was refuted
and removed.* Second, the one browse surface Atlas actually renders — "Explore
the Atlas" with its FEATURED / MOST RECENT pills — renders empty, with no message (F29, A4). A site
that cannot show its own filter results cannot govern our filter surface. Third, and worst for a
health-evidence site, Atlas makes editorial and paid provenance visually identical (F28, A3); that is
a governing-reference-level defect, not a detail.

**It does not earn a surface, and it should not be assigned to one it does not currently hold.** But
the drop should not be total: two specific patterns survive as detail borrows under other sites'
governance — the labelled stat cell for structured data blocks (B1, under Stripe) and the plain
columned link table for browse (B2, under awwwards). Both are the same idea, and it is the idea Atlas
is worst at overall: **say it in text in a table, not in a photograph in a card.** Where Atlas does
that it is the most efficient thing in the study; everywhere else it is the least. Recorded verdict:
**strengthens** the Phase 2 drop.

## Verification

Independent verification pass, 2026-09-04. All eight required desktop captures and all three required
mobile captures were viewed directly, plus every capture cited by a finding that was not already in
that set: `index-1440-tile-02`, `-tile-05`, `-tile-07`, `-tile-10`, `index-375-full`,
`index-375-tile-15`, `content-1440-tile-04`, `content-1440-tile-05`, `content-375-tile-03`,
`content-375-tile-19`, `content-375-scroll-90` and `content-375-full`.

**Result: 32 confirmed, 21 qualified, 1 refuted, 3 added.**

### Refuted (removed from the record)

- **F24** — "Every other image decorates or baits, and the volume of eagerly loaded imagery is the
  visible form of the site's 0.0015 text-to-HTML ratio." Two grounds. The image counts and the ratio
  are domEvidence numbers presented as a visual observation, with `inferred: false` and no
  `domEvidenceKeys`; and "every other image" is contradicted by the destinations-rail thumbnails and
  the Read Next thumbnail, which identify what they link to rather than decorate. The verifiable half
  survives in the corrected A6.

### Qualified (claim rewritten; one line each on why)

- **F5** — "the search bar is the fourth thing seen" is a reading order no still capture establishes;
  reduced to what dominates.
- **F8** — the first screen is not white everywhere else: a filled Google promo button sits in the
  share row and the saturated map fills its bottom 200 px.
- **F9** — the article is four paragraphs, not five, and "a fifth of the page" needed a unit.
- **F10** — the 80/20 split is a mobile fact only; on desktop the article ends at 43 % and the
  promotion below it is about 57 % of the height.
- **F11** — the destinations rail's row pitch is 169 px, so four rows occupy about 675 px, not 570.
- **F12** — the destinations rail is also a list, so this is the only *thumbnail-free* browse region,
  not the only list.
- **F16** — there are at least three labelled ADVERTISEMENT strips, not two; and the unlabelled
  245 px band cannot be attributed to design when `bannerActions` records a banner left standing.
- **F19** — three of the four share icons are brand-coloured; the mail glyph is a plain dark outline.
- **F22** — the sponsored cards are *not* styled like the editorial cards: serif titles, advertiser
  below, CTA buttons. They are distinguishable; they are simply not disclosed.
- **F26** — "three colours" describes the chrome only; photography, the map, the Google glyph and a
  drop shadow on the Read Next card all sit outside it.
- **F27** — four paragraphs, not five; and a seventh ask sits in the byline row.
- **F29** — about 80 px of blank under the pills, not 200; the original figure absorbed the next
  section's top padding.
- **F31** — "reserves 90 px for a missing icon" is an inferred cause with nothing visible; the empty
  top-left cell it also reports is exact.
- **F33** — the same badge loads correctly in `index-375-tile-15`, so this is a capture-time failure,
  not a design decision — the artefact test the viewer applied correctly at F25.
- **F37** — the painting 48 px bar cannot be matched to any recorded element (the one sticky entry is
  height 0), and the one full-viewport-height entry paints nothing.
- **B1** — carries F11's corrected row pitch.
- **A1** — carries F5's removed ordinal.
- **A4** — carries F29's corrected 80 px.
- **A6** — carries F10's corrected desktop proportion, and now declares its domEvidence keys.
- **A7** — carries F19's corrected icon count.
- **A9** — carries F16's exclusion of the unlabelled band.

### Added

- **V1** — one count stated three ways on one page, undated.
- **V2** — fourteen uncounted category pills against the rail's counted stat cells.
- **V3** — the scope path does not survive the scroll.

### Confirmed exactly, worth naming

F28 is the site's most consequential finding for RNAWiki and it verified precisely: "BY ATLAS
OBSCURA" and "SPONSORED BY VISIT SUN VALLEY" occupy the same slot in the same 10 px letterspaced grey
caps in `index-1440-tile-03`. F25 verified rigorously in page coordinates — the Keep Exploring boxes
sit at y=690 in `content-1440-tile-03` (scrollY 1800) and y=603 in `content-1440-scroll-50`
(scrollY 1887), the same page position to the pixel. F12's thirty-six targets in about 300 px, F13,
F30, F32, F34 and the four declared-inferred baseline findings F35/F36/F38/F39 all hold as written.
