# linear.app/method — Track A1 viewing notes (recaptured 2026-09-04)

Linear's "Method" is a short book about how the company builds software, published as a chapter
index plus a set of chapter pages inside the main marketing site. Two pages were captured:
`https://linear.app/method` (the index — a title, a three-line standfirst, one decorative graphic
and an eleven-row chapter list) and `https://linear.app/method/introduction` (the first chapter —
one 736 px-shell reading column holding a serif title and twenty heading-plus-paragraph
sections under two group headings, and nothing else). Both ship dark: the manifest records `htmlAttributes.dataTheme = "dark"`
with `prefersColorScheme.found = false`, so every observation below is of a dark ground and none of
it transfers to RNAWiki's decided light default without being re-derived. This viewing replaces an
earlier pass whose captures were taken after a banner-decliner clicked ordinary page controls; the
files in this directory dated 3 Sep 23:12 (`index-1440-tile-04/05/06`, `index-375-tile-05` through
`-09`) are from that bad pass, are not listed in the recapture manifest, and were not viewed.

## 1. Visual hierarchy

**F1.** *(qualified in verification — see below.)* On the chapter page the reading order is
title → group label → section heading → prose, and only the first step is done mainly with size.
"Principles & Practices" is a large serif set against a page that is otherwise entirely sans; below
it "Principles" and every "Build for the creators" run at roughly 1.25× the body cap-height — a real
but modest step. What leads the separation is weight and tone — headings sit near-white and semibold,
prose sits regular in a softer grey — together with a large gap above each heading against a small
gap below it, which binds the heading to its own paragraph rather than to the one before. [capture: content-1440-tile-01.png, content-1440-tile-02.png]

**F2.** *(qualified in verification — the collapse is desktop-only.)* At 1440 the two heading levels
are distinguished almost entirely by the space in front of them, not by type. "Principles" (a group
of eight) and "Build for the creators" (a member of that group) are the same weight, and the member
heading is if anything a hair larger; the group heading is announced only by a larger empty band
above it. That hierarchy is fragile: in content-1440-tile-02.png, viewed without the top of the
page, there is no visible cue telling you which of the headings on screen is a group and which is a
member. At 375 px the site does not have this problem — content-375-tile-01.png shows "Principles"
about 30 percent taller than "Build for the creators" — so the narrow layout supplies the
differentiator the wide one omits. [capture: content-1440-tile-01.png, content-1440-tile-02.png,
content-375-tile-01.png]

**F3.** The one genuinely loud element on either page is the serif face, used exactly twice — the
index headline and the chapter title — and nowhere else. Because it appears only at the top of a
page, the serif functions as a position marker: seeing it means you are at the start of something.
[capture: index-1440-tile-01.png, content-1440-tile-01.png]

**F4.** The index builds a third hierarchy out of alignment rather than type. Each row is a title on
the left and a monospaced decimal number on the right, with dotted rules *between* groups — two rules
for three groups, none under the final one; the
group labels ("INTRODUCTION", "DIRECTION", "BUILDING") are small, uppercase and brighter than the
row titles beneath them. Nothing in the list is bold, boxed or coloured, yet the three groups and
their ordering read instantly. [capture: index-1440-tile-02.png, index-1440-tile-03.png]

## 2. Where the eye lands first

**F5.** Desktop index: the eye lands on "Practices for building" — a very large centred serif
headline with roughly 130 px of empty page above the kicker and the nearest other element more than
100 px below. That is content, not chrome. [capture: index-1440-tile-01.png]

**F6.** Desktop chapter page: the eye lands on "Principles & Practices". The header occupies the top
73 px, then roughly 70 px of nothing, then a two-line breadcrumb in a dim grey, then the title. The
breadcrumb is deliberately too quiet to catch first. Again content, not chrome. [capture:
content-1440-tile-01.png, content-1440-scroll-00.png]

**F7.** *(qualified in verification — overstated on the index.)* At 375 px the "Sign up" pill is a
solid light shape on a black ground — the only filled element anywhere — sitting top-right next to
"Log in" and a hamburger, all three crowded into a 375 px row, and `content-375-scroll-50.png` shows
it present the whole time in real scrolled use. On a scrolled chapter screen, where nothing else is
filled or serif, it is therefore the highest-contrast object on the page. It does *not* win on the
index first screen: in `index-375-tile-01.png` the pill is about 66 × 30 px against a two-line serif
headline several times its area at the same near-white tone, and the headline clearly lands first.
[capture: index-375-tile-01.png, content-375-scroll-50.png, content-375-tile-01.png]

## 3. Information density

**F8.** *(refuted in verification and removed. Its claim of "roughly 60 words per screen" and "two
heading-plus-paragraph units per 900 px screen" is contradicted by the capture it cited:
`content-1440-tile-02.png` holds five such units and about 165 words. The corrected density figure is
carried in A1 below.)*

**F9.** *(count corrected in verification.)* There is exactly one repeating unit on the chapter
page: one `h3` and one paragraph, **twenty** times, under two `h2` group headings, with no
exceptions. No lists, no tables, no callouts, no pull quotes, no code, no rules
between sections, no cards. Section length varies only by paragraph length (two lines to seven), and
that variation is the page's only shape. This is what makes the page calm and it is also its
limitation: the format has no way to hold anything that is not a sentence. [capture:
content-1440-full.png, content-1440-tile-04.png, content-1440-scroll-50.png]

**F10.** The only list on either page is the index's chapter list, and it is handled as a
label-value row rather than a table: title left, ordinal right, dotted separator between groups,
no borders, no zebra striping, no column headers. Eleven rows in three groups occupy about 400 px.
It reads as a table of contents without being drawn as a table. [capture: index-1440-tile-02.png,
index-1440-tile-03.png, index-375-full.png]

## 4. Whitespace

**F11.** The largest spend is horizontal margin. At 1440 the reading column runs roughly x=376 to
x=1064 — about 688 px of text centred in a 1440 px viewport, leaving roughly 376 px empty on each
side. Just under half the screen is intentionally blank. Nothing is placed in that space: no rail,
no notes, no figures, no share controls. The margin's only job is to say that there is nothing else
to look at. [capture: content-1440-tile-01.png, content-1440-scroll-50.png]

**F12.** Vertical whitespace is spent asymmetrically around headings — a large band above, a small
one below — which is what carries the hierarchy described in F1/F2 (Phase 1 measured heading
`margin-top: 56px` against a 20 px prose block spacing, and the captures show that ratio). It is not
spent inside anything: there are no cards, no padded boxes, no tinted panels on the reading page, so
none of the whitespace is decorative container padding. [capture: content-1440-tile-01.png,
content-1440-tile-04.png]

**F13.** *(scoped in verification.)* The index spends whitespace as pause rather than as margin.
Between the standfirst and the graphic, and again between the graphic and the chapter list, there
are bands of several hundred pixels of pure empty ground. That holds for the first roughly 1,620 px
of the 2,701 px page; below the hairline the footer link grid occupies the remaining roughly 1,080 px
and is the densest block on the page. [capture: index-1440-full.png, index-1440-tile-02.png]

## 5. Long scroll

**F14.** Exactly one thing persists: the fixed 73 px header. The manifest lists three fixed elements
(`domEvidence.stickyOrFixed`) — that header, a skip link at top 72 px, and a zero-height
`viewportPosition` div — and nothing else. Across a 5,104 px page there is no contents rail, no
progress indicator, no current-section marker, no back-to-top and no sticky heading. The reader gets
no positional feedback of any kind after leaving the breadcrumb. [capture: content-1440-scroll-00.png,
content-1440-scroll-50.png, content-1440-scroll-90.png]

**F15.** The header is translucent, and at depth it shows. In `content-1440-scroll-90.png` faint
ghost text from the paragraph underneath is visible inside the header band to the left of the logo;
the same smear appears in `content-1440-scroll-50.png`. Compared with `content-1440-scroll-00.png`,
where the band sits over empty ground, the header also carries a visible bottom hairline once the
page has scrolled. That the background and hairline change on scroll is *inferred* — no script
token was captured (`domEvidence.scriptTokens` are all "unknown") — but the fixed header itself is
measured (`domEvidence.stickyOrFixed`). The visible consequence is not good: reading matter passes
under a semi-transparent strip. [capture: content-1440-scroll-90.png, content-1440-scroll-50.png,
content-1440-scroll-00.png]

**F16.** Rhythm holds unbroken for the whole page because every unit is identical, and the single
break is at the end: a small bordered card, right-aligned inside the column, reading "2.1 ›" over
"Set the product direction". It is the only bordered box on the page and the only right-aligned
element in the reading column, so it registers as a stop. *(Citation corrected in verification: the
card is in `content-1440-tile-05.png`, not tile-06.)* [capture: content-1440-tile-05.png,
content-1440-scroll-90.png]

**F17.** *(counts corrected in verification.)* The page ends with the next-chapter card
(`content-1440-tile-05.png`), a wide empty band, then a footer of roughly three dozen links — 33 in
five heading columns plus four legal links, alongside a logo column — on a hairline-separated, very
slightly lighter ground, collapsing to two columns at 375 px. There is no closing call to action, no
related-reading grid, no newsletter block and no author or date line. The end of the page is the end
of the text. [capture: content-1440-tile-05.png, content-1440-tile-06.png, index-1440-tile-03.png,
content-375-scroll-90.png]

## 6. Imagery

**F18.** The chapter page has no imagery at all — the manifest records `domEvidence.imgCount` 0 —
across 5,104 px at desktop and 6,419 px at mobile. Nothing is substituted for it: no icons beside
headings, no rules, no numbered badges. The page handles "no pictures" by simply not having any and
not compensating. [capture: content-1440-full.png, content-1440-tile-02.png, content-1440-tile-04.png]

**F19.** The one graphic in the whole capture set is on the index: two large overlapping circles
drawn as dotted outlines with a hatched lens where they cross, set on the empty band below the
standfirst. It is unlabelled, has no caption, no legend, no axis and no numbers, and it does not
recur on the chapter page. It carries no information — it is a mood mark occupying a screen of empty
page. At 375 px it is cropped by the viewport, which confirms it means nothing: losing part of it
loses nothing. [capture: index-1440-full.png, index-1440-tile-02.png, index-375-full.png]

## 7. Defers or competes

**F20.** *(qualified in verification — "two type sizes" is wrong.)* On the reading page the design
defers almost completely. At least four type sizes but a narrow range of them (serif `h1`, `h2`,
`h3`, body) plus a smaller breadcrumb and card ordinal, one accent face used twice, four greys, no
borders except the one end card, no background tints, no images, half the screen empty. Everything visible on `content-1440-scroll-50.png` is either a heading or a sentence.
[capture: content-1440-scroll-50.png, content-1440-tile-04.png]

**F21.** *(qualified in verification.)* It competes in two places. First, the always-present "Sign
up" pill described in F7 — the highest-contrast object on every *scrolled reading* screen of a
document that is not selling anything, though it does not out-contrast either page's headline.
Second, the index's opening screen, where a 128 px serif
headline and a decorative diagram consume the first two screens before the eleven chapter links —
the actual purpose of the page — appear more than 1,000 px down. [capture: index-1440-full.png,
index-375-tile-01.png, content-375-scroll-50.png]

## 8. Absence handling

**F22.** The clearest absence in the set is the pagination at the end of the first chapter. It shows
a "next" card only; the "previous" slot — this being chapter 1.1 — renders nothing at all. There is
no greyed-out control, no "start of book" placeholder and no empty box holding the space. The card
is simply pushed to the right of the column where a two-slot pager would put it. The same is true at
375 px. *(Citation corrected in verification: `content-1440-tile-05.png`, not tile-06.)* [capture:
content-1440-tile-05.png, content-1440-scroll-90.png, content-375-scroll-90.png]

**F23.** More broadly, nothing on either page is a container waiting for content. There are no
labelled fields, no metadata rows and no "—" values, so a missing thing has nowhere to leave a mark.
This is worth stating precisely because it means the site cannot be used as a reference for how to
show absence in a structured record: it shows only the trivial case, where absence is expressed by
the element not being drawn. [capture: content-1440-full.png, content-1440-tile-04.png]

## 9. Capture integrity, and behaviours that could *not* be evidenced

**F24.** No consent banner is visible in any capture I viewed — not in `index-1440-full.png`,
`index-375-full.png`, nor in any of the four `-scroll-` viewport captures. The manifest's
`bannerActions` records "banner stands in the captures" for all four passes, but the element it names
(`footer.Jmh1Wq_footer`, controls "Intake, Plan, AI, Build, Pricing, Security") is the ordinary site
footer, which is plainly visible as the Product/Features/Company/Resources/Connect link grid at the
foot of both pages. The decliner appears to have matched the site footer rather than a consent
dialog, correctly refused to click any of its links, and recorded that as a standing banner. Nothing
in these images should be discounted as banner overlay. [capture: index-1440-full.png,
content-1440-tile-06.png, index-1440-tile-03.png]

**F25.** The fixed header is painted at capture-time position in the sliced tiles, exactly as the
manifest caveat warns: it appears at the top of `content-1440-tile-01.png` and is absent from
`content-1440-tile-02.png` and `content-375-tile-01.png`, where the top of the mobile chapter page
therefore shows an unexplained empty band. Header persistence was judged only from the `-scroll-`
captures. [capture: content-1440-tile-02.png, content-375-tile-01.png, content-1440-scroll-50.png]

**F26.** Three behaviours often attributed to this site cannot be claimed from this capture set. The
manifest's DOM evidence for the chapter page records `searchAffordances.count` 0, `copyControls.count`
0, `kbdTexts` empty and `ariaKeyshortcuts` empty — so there is no evidence here of a search field, a
command palette, a keyboard-shortcut hint or a copy button, and none is visible in any capture.
`scriptTokens` are all "unknown", so no scroll-driven behaviour can be attributed either; the only
scroll behaviour I claim (F15) is the header's persistence, which is measured via
`stickyOrFixed`. A theme control is *inferred* only, and the verification weakens even that:
`htmlAttributes.dataTheme = "dark"` with `prefersColorScheme.found = false` is recorded, but 45 of
83 stylesheets were unreadable and the 375 px hamburger is never opened in any capture, so the
absence of a reader theme choice is unrecorded rather than proven. No toggle is legible in any
capture. [capture: content-1440-scroll-00.png,
content-1440-tile-06.png]

## For RNAWiki

### Borrow

**B1 — Hierarchy by space and by a grey ladder, for the dossier reading column.** Give a section
heading a large gap above and a small gap below, and separate heading from prose by tone rather than
by size. On a dossier this lets a technical block ("Trials", "Sources", "Review history") sit under
plain prose without shouting, which is exactly what Phase 2 named Linear for. Two conditions: it
must be re-derived on a light ground, since everything I saw is a dark-ground ladder
(`htmlAttributes.dataTheme = "dark"`); and it needs the group/member size step that Linear applies
only at 375 px (V1) carried to every width, because F2 shows the desktop distinction disappears when
you land mid-page — a dossier reader arriving from a search result or an anchor link lands mid-page
constantly. [capture: content-1440-tile-01.png, content-1440-tile-02.png, content-375-tile-01.png]

**B2 — Absence renders nothing, and the layout closes over it.** The end-of-chapter pager draws only
the slot it has and moves; no disabled control, no placeholder. This is the corpus rule already
written down, demonstrated. Apply it to the dossier: a compound with no human data shows no human-
data heading, and the section below simply moves up. [capture: content-1440-tile-05.png,
content-375-scroll-90.png]

**B3 — A contents index as label-value rows, for the browse surface and for the dossier's contents
list.** Title left, ordinal or count right in a monospaced face so the numbers align as a column
(V2), a small bright uppercase group label, dotted rules between groups, nothing boxed. Eleven items
read at a glance without a table being drawn, and the same rows hold their shape at 375 px with no
horizontal overflow and no collapse to stacked cards. This is a good pattern for a compound's
section list or for an evidence-tier grouping. [capture: index-1440-tile-02.png, index-375-full.png]

**B4 — End the page when the text ends.** No related grid, no closing pitch, one forward link — and
that link names the destination's ordinal before its title (V3). For a dossier, one "next programme"
or "back to compound" link, carrying where it sits as well as what it is called, and the footer is
enough. [capture: content-1440-tile-05.png]

### Avoid

**A1 — The density.** A measured **roughly 165 words per 900 px screen** — about 950 words of
visible text over a 5,104 px page. (`innerTextLength` 5,873 and `textToHtmlRatio` 0.0119 are Phase 1
DOM figures, and the 8.3% corpus target they are compared against is a Phase 1 corpus figure; neither
is visible in a capture.) Borrow the spacing *ratios*, not the absolute emptiness; a dossier screen
should carry several times this much. [capture: content-1440-full.png,
content-1440-scroll-50.png]

**A2 — The single repeating unit.** Twenty identical heading-plus-paragraph blocks is the exact
page shape our uniqueness constraint forbids: every page would look the same and the shared
structural words would dominate. RNAWiki's page shape must be produced by which data exists, not by
a fixed rhythm. This is the strongest lesson from the site and it is a negative one. [capture:
content-1440-full.png, content-1440-tile-04.png]

**A3 — The translucent fixed header over reading matter.** Ghost text under the header band at
scroll depth (F15) is a legibility cost with no benefit. If RNAWiki keeps a header on a dossier, make
it opaque. [capture: content-1440-scroll-90.png]

**A4 — The decorative diagram.** An unlabelled graphic occupying a full screen, croppable without
loss, is the opposite of what our citation-evolution map and mechanism stages must be: every graphic
on a medicine page has to carry a stated fact. [capture: index-1440-full.png, index-375-full.png]

**A5 — A commercial control as the brightest object on a scrolled reading screen** — which is where
the pill actually wins, not on either page's first screen. Nothing on an RNAWiki dossier should out-contrast the text; and on the home page this
is doubly disqualifying, since the search bar is frozen as the single primary action and nothing may
sit above or beside it. [capture: index-375-tile-01.png, content-375-scroll-50.png]

**A6 — Dark by default.** `prefersColorScheme.found` is false and the page ships `data-theme="dark"`;
no reader choice is *recorded*, though 45 of 83 unreadable stylesheets mean the captures cannot prove
none exists. Light default is decided here independently. [capture: content-1440-scroll-00.png]

## 10. Added in verification

**V1.** The mobile layout fixes the desktop hierarchy defect. At 375 px the group heading is given a
visible size step over its member headings: on `content-375-tile-01.png` the `h2` "Principles" is
about 30 percent taller than the `h3` "Build for the creators" directly below it, where on
`content-1440-tile-01.png` the same pair is the same size and the member heading is if anything a
hair larger. The narrow column forced the differentiator the wide one leaves to whitespace. For an
RNAWiki dossier, whose reader arrives at an anchor as often as at the top, the 375 px treatment is
the one to copy at every width. [capture: content-375-tile-01.png, content-1440-tile-01.png]

**V2.** The ordinal column is set in a monospaced face and right-aligned, so a numeric column reads
as a column with no rule, no header and no fill. On `index-1440-tile-02.png` the decimals 1.1 and
2.1–2.4 sit flush right with digits and points aligning down the page against proportional sans
titles on the left; on `index-375-full.png` the same rows keep title-left / ordinal-right in a 375 px
viewport with no horizontal overflow and no collapse to stacked cards. This is the treatment for a
browse row carrying a count, a year or a programme number, and for a dossier section index.
[capture: index-1440-tile-02.png, index-375-full.png]

**V3.** The forward link states the destination's *position* before its name. The bordered card
carries a small dim "2.1" with a chevron on its first line and the destination title, brighter, on
the second, at both widths. The reader learns where the link sits in the whole before learning what
it is called — the same information a dossier cross-link to a sibling programme needs to carry, and
something a bare "Next" cannot. [capture: content-1440-tile-05.png, content-375-scroll-90.png]

### Phase 2 verdict

Phase 2 names linear.app/method once: **secondary influence on "Compound dossier — reading column"**,
governed by smashingmagazine.com, on the argument that hierarchy is carried by space and a four-step
grey ladder rather than by size, and that the 688–736 px column corroborates the measure.

**Verdict: strengthens, with one narrowing and one addition.**

*Strengthens.* Every part of the stated justification is visible. The heading-to-prose relationship
really is space plus tone rather than size (F1, F12); the column really is a fixed, centred measure
with vast unused margin (F11); and the effect on a long page is a reading surface where nothing
except a heading or a sentence is on screen (F20). For the specific job Phase 2 assigned it — letting
a revealed expert block sit under plain prose without shouting — this is the right reference and the
captures support it.

*Narrowing.* The site cannot inform anything structured. It has no table, no list, no field, no
label-value pair and no image on the reading page (F9, F18, F23), so its influence must stop at the
prose rhythm of the dossier's reading column and must not extend to the structured data blocks
(Stripe governs those, correctly) or to how a dossier shows evidence tiers, doses or trial rows. And
F2 is a genuine defect for our use at desktop: the group/member distinction collapses mid-page,
which a dossier cannot afford — with the fix visible in the same site, since at 375 px Linear gives
the group heading a real size step (V1).

*Addition, and a closure.* The index page (`/method`) is a better contents pattern than anything
Phase 2 currently has for a contents list (F4, F10, V2), and it is worth considering for the
**browse/filter** surface's grouped-list treatment and for the dossier's section index. But it does
**not** resolve the unassigned "contents rail and previews" item: the manifest shows only three fixed
elements and no rail (F14), Phase 1 recorded no `position: sticky` anywhere and no table of contents
in either page's markup, and no hover preview is evidenced. Linear's contents list is a static block
at the top of an index page, not a persistent rail. The stopping rule on that surface stands.

*Not named for, and should not be given:* the **global search overlay**. The chapter page's DOM
evidence records zero search affordances, zero copy controls and no keyboard-shortcut text (F26), so
this capture set gives no support for a palette here. Vercel keeps that surface.

## Verification

Independent verification, 2026-09-04, from the captures alone: **16 confirmed, 18 qualified,
1 refuted, 3 added.** Refuted and qualified findings, one line each.

- **F8 — refuted, removed.** Claimed roughly 60 words and two heading-plus-paragraph units per 900 px
  screen; its own cited capture `content-1440-tile-02.png` holds five units and about 165 words.
- **F1 — qualified.** Headings are not size-neutral: about 1.25× body cap-height and semibold against
  regular, so weight and tone lead but a real size step is present.
- **F2 — qualified, materially.** The group/member collapse is 1440-only; `content-375-tile-01.png`
  shows Linear itself adding a ~30% size step at mobile.
- **F4 — qualified.** Dotted rules separate groups rather than closing each — two rules for three
  groups, none under the final group.
- **F7 — qualified.** The pill wins on scrolled reading screens, not on the index first screen, where
  the serif headline plainly lands first (`index-375-tile-01.png`).
- **F9 — qualified.** Twenty `h3` sections, not twenty-two; the viewer counted the two `h2` group
  headings as sections.
- **F13 — qualified.** "Most of the page is empty" holds above the hairline only; the footer occupies
  roughly the bottom 1,080 px of 2,701 px and is the page's densest block.
- **F16 — qualified.** Citation wrong: the end-of-chapter card is in `content-1440-tile-05.png`, not
  tile-06, which shows only empty band, hairline and footer.
- **F17 — qualified.** Citation as F16, and the footer is roughly 33 links in five heading columns
  plus a logo column, not "42 links" in six columns.
- **F20 — qualified.** "Two type sizes" is wrong; the reading page carries at least four plus a
  smaller breadcrumb and card ordinal. The deference conclusion is unaffected.
- **F21 — qualified.** The pill is the highest-contrast object on scrolled reading screens only, not
  on "every screen".
- **F22 — qualified.** Citation corrected to `content-1440-tile-05.png`.
- **F26 — qualified.** With 45 of 83 stylesheets unreadable and the mobile menu never opened, the
  absence of a reader theme choice is unrecorded rather than proven.
- **F27 — qualified.** The borrow instruction changes from "add a differentiator Linear lacks" to
  "carry Linear's own 375 px size step to every width".
- **F28 — qualified.** Citation corrected to `content-1440-tile-05.png`.
- **F30 — qualified.** The 0.0119 ratio is a Phase 1 DOM figure and the 8.3% target a Phase 1 corpus
  figure; neither is a visual observation, and both are now labelled.
- **F31 — qualified.** Twenty repeating blocks, not twenty-two.
- **F34 — qualified.** Scoped to scrolled reading screens; the pill does not outweigh the index
  headline at 375 px.
- **F35 — qualified.** Same stylesheet-readability caveat as F26.

Checked and left standing: **F3** (the italicised "n-week" on `content-1440-tile-03.png` is italic
*sans*, so the serif really is used exactly twice), **F5, F6, F10, F11, F12, F14, F18, F19, F23,
F25, F29, F32, F33**, and **F15** (ghost text is legible inside the header band at scroll-50 and
scroll-90 and absent at scroll-00). **F24** is confirmed independently: no banner or overlay appears
in any capture examined, and `footer.Jmh1Wq_footer` is plainly the site footer — nothing in this set
should be discounted as banner overlay.
