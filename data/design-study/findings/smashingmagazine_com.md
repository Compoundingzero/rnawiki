# smashingmagazine.com — Track A1 visual findings

Smashing Magazine is a long-running web-design publication: a home page that is a dated river of
article summaries, and article pages that are single long essays by one named author. Two pages were
captured: the home page `https://www.smashingmagazine.com/` and one long article,
`https://www.smashingmagazine.com/2026/08/rethinking-data-visualisation-ux-approach-dashboards/`
(desktop 1440×900, mobile 375×812; the article is 15,700 px tall at desktop and 20,771 px at mobile,
past the 16,384 px rasterization cap, so the `-full` images stop early and the tiles continue). Phase 1
recorded this site as the strongest measured long-form column of the ten (700 px paragraph box, 82
characters per line, 20.4/33.5 px, 8.5 % text-to-HTML) and Phase 2 made it the governing reference for
the compound dossier reading column. One Phase 1 detail does not match what rendered: Phase 1 describes
the article background as a dark `linear-gradient(-45deg, rgb(22,44,53) …)` with near-white body text;
every article capture in this set renders black-on-white, and the manifest's `domEvidence` agrees
(`bodyBackgroundColor rgb(255,255,255)`, `bodyColor rgb(51,51,51)`). I judge only what rendered.

A note on banners before anything else: `bannerActions` records a consent banner in `div.col-12` left
standing on all four passes (the desktop home pass clicked "No, thanks." and the banner remained; the
other three passes offered only accept-type controls and were left alone). I did not find that banner in
any tile I opened — not the first screens, not the last tiles at either width. So it is recorded as
present but is not visible in the captures I judged, and nothing below reads it as design.

## 1. Visual hierarchy

**F1** *(qualified)*. The article page carries its **size ladder** on two axes only — one typeface switch
and one width change. The `h1` is set in a heavy geometric sans across the full 1,090 px of the
two-column shell; the running prose immediately below drops to a serif at roughly 690 px. Nothing else
on the first screen is large. The reader gets title, then a grey metadata plate, then prose, in that
order, with no third competing size. Colour is not absent from that screen, though — the byline and the
`QUICK SUMMARY` label are red and the read-time/share row sits on a grey tint — so "never on colour" was
wrong; colour marks small labels and never a level in the ladder. [capture: content-1440-tile-01.png, content-1440-scroll-00.png]

**F2.** Inside the prose the ladder is: serif section heading (bold, roughly 30 px, each followed by a
visible grey `#` character), then a smaller heavy-sans sub-heading, then serif body at the measured
20.4 px. The two-typeface alternation is doing the work that a size jump would normally do, so a
sub-heading can sit two levels down without becoming small. The collected outline records only h1–h3, so
I do not claim a tag for the sans sub-heading — only that it reads as one level below the serif heading.
[capture: content-1440-tile-02.png, content-1440-tile-11.png, content-1440-scroll-90.png]

**F3.** On the home page the ladder is size plus one colour. The lead story headline is roughly 54 px;
the second and third stories drop to about 34 px in the same face; author names are red, dates and
categories are small grey letterspaced capitals, and summaries are serif. Three stories in, the size
stops changing and every later card is identical — the hierarchy is only three deep and then flattens
into a list. [capture: index-1440-tile-01.png, index-1440-full.png, index-1440-tile-09.png]

**F4.** Emphasis inside running prose is bold-in-place, not a separate object: `decision`, `clear
direction`, `appropriate complexity` are bolded mid-sentence in the same serif at the same size. The page
never pulls a term out into a box to emphasise it. [capture: content-1440-tile-02.png,
content-1440-tile-05.png]

## 2. Where the eye lands first

**F5.** At 1440 the first fixation is chrome, not content, on both pages. A saturated red band fills the
top 105 px edge-to-edge and a second row of pink topic chips fills another 65 px below it; together they
own the top 170 px of the viewport at the highest colour contrast on the screen. The content region
below is black on white and quieter. The largest single object is the headline, but it is second.
[capture: index-1440-tile-01.png, content-1440-scroll-00.png]

**F6** *(qualified)*. At 375 the chrome wins more decisively, and the largest element in it is the search
field — but the field is not alone in the band. The red band is about 155 px and the search input is a
full-width white pill inside it, the only white object in a red field; the logo and a dark-red "Menu"
button sit **above** it in the same band, and a pink chip row follows immediately below. Against the
105 px desktop band the header does grow taller, while the fourteen-item desktop nav collapses into
"Menu" and the chip row drops to four chips — so it both grows and collapses. At mobile this site's first
screen still reads as a search box, and the article title is pushed below it.
[capture: index-375-tile-01.png, content-375-tile-01.png]

**F7.** The article's own first screen gives roughly a third of its width to material that is not the
article: a tilted author portrait, an "About the author" block and the start of an email-newsletter
panel sit in the right column beside the title and summary. The reader's first screen is title, summary,
and two solicitations. [capture: content-1440-tile-01.png, content-1440-scroll-00.png]

## 3. Information density

**F8** *(qualified)*. The article is thin per screen: at desktop one screen holds three to four paragraphs
and nothing else, with the right third empty white below the rail cards. The word count was understated —
content-1440-tile-02 carries four paragraphs and roughly 230 words in 900 px, content-1440-scroll-90 a
heading and three paragraphs at roughly 180 words, not the ~130 first claimed. The low density is
achieved by margin, not by short paragraphs — the paragraphs run five to seven lines. [capture: content-1440-tile-02.png,
content-1440-scroll-90.png]

**F9** *(qualified — scope)*. No table appears in **any capture opened**; eleven of the eighteen desktop
article tiles and most mobile tiles were never viewed, so this is "none in the captures judged", not
"none in the page". Structured comparison is done twice, both
times as an image: the Anscombe quartet as a 2×2 scatter grid, and an "A — Analyst view / B — Executive
view" side-by-side dashboard mock. The site's answer to tabular material is to draw it and caption it.
[capture: content-1440-tile-03.png, content-1440-scroll-50.png]

**F10.** Lists are rare and set as loose bullets with a red marker, bold lead-in term, colon, then
explanation in running weight — three items, each two to three lines, at full paragraph leading. The list
reads at the same density as prose rather than compressing. [capture: content-1440-tile-17.png]

**F11** *(qualified — order)*. The home page handles its list of stories by changing shape rather than
tightening, but the order first recorded was wrong. `index-1440-full` runs: a full-width river for the
newest three, then a **three-card coloured guides block**, then a two-column grid of shorter entries,
then a three-card "Smashing Family" block, then a **full-bleed blue workshops band** (missed entirely
first time), then a two-column community-links grid. Density rises down the page as the items get less
important. [capture: index-1440-full.png, index-1440-tile-09.png]

## 4. Whitespace

**F12** *(qualified — measure and scope)*. The largest single piece of whitespace on the article page is
structural: from the text edge at ~832 px to the shell edge at ~1,310 px — a ~283 px rail plus a ~190 px
gutter, about 480 px in all — blank from the end of the last rail card to the foot of the page
(tile-11 at 9,000 px, tile-17 at 14,400 px). Higher up the rail is full (tiles 02, 03, 05), so
"permanently empty" means below the last card. It is not used to say anything — it is what is left when a
two-column shell has nothing more to put in the second column. [capture: content-1440-tile-11.png, content-1440-tile-17.png]

**F13.** Inside the prose the spacing is asymmetric in the way Phase 2 wanted from Linear: roughly 90 px
of air above a section heading and about 25 px below it, so the heading binds forward to its own text
rather than floating between two blocks. Paragraph gaps are about 33 px against a 33.5 px line height —
exactly one blank line, no more. [capture: content-1440-tile-02.png, content-1440-tile-11.png]

**F14** *(qualified — not uniform)*. The **two dashboard figures** are given the most air on the page:
roughly 100 px above, a light grey plate behind, then a captioned gap of about 45 px before prose
resumes, with the plate set wider than the text — 132 px to 930 px, 798 px against the ~690 px paragraph
box on the same left edge (scroll-50, and the same treatment for the bar/radar figure at scroll-90). The
treatment is not universal: the Anscombe quartet at content-1440-tile-03 sits on plain white with its
artwork spanning roughly 267–822 px, **narrower** than the measure. So "figures are set wider than the
measure" holds for two of three. [capture: content-1440-scroll-50.png, content-1440-tile-03.png]

**F15.** The home page spends its whitespace between story blocks (roughly 60 px) and inside the coloured
guide cards (about 30 px of padding), and almost none in the left margin — the content column starts
about 105 px in and runs to about 1,240 px, so the home page is wide where the article is narrow.
[capture: index-1440-full.png, index-1440-tile-01.png]

## 5. Long scroll

**F16.** Nothing persists. At 50 % and at 90 % of a 15,700 px article there is no header, no rail, no
progress indicator, no back-to-top button and no sticky heading — the top edge of both captures is
running prose or a figure. The same holds at 375. This is the only site in the set whose reading
experience has zero persistent chrome, and it means the reader has no way back to navigation or search
without scrolling to the top. [capture: content-1440-scroll-50.png, content-1440-scroll-90.png,
content-375-scroll-50.png, content-375-scroll-90.png]

**F17** *(qualified)*. Two positioned elements are recorded but neither appears on screen:
`domEvidence.stickyOrFixed` gives `div.comment-form__sticky` (`position: sticky`, top 15,982 px) and
`div.back-to-top-wrapper` (`position: fixed`, top 17,031 px). Both offsets sit **past the 15,700 px
height of the desktop full-page capture**, so the DOM snapshot describes a taller document state than the
images do; "below the reading area" is the DOM's account, not something the captures show. What the
captures support is only that neither element is on screen at 0 %, 50 % or 90 %. [capture: content-1440-scroll-50.png, content-1440-scroll-90.png] (inferred —
`stickyOrFixed`)

**F18** *(qualified)*. The rhythm holds for long stretches and breaks in exactly two places, both commercial. First, an
in-column interruption: a small grey line reading "More after jump! Continue reading below ↓" above a
grey rule and roughly **165 px** of empty space, landing immediately before the heading "From Questions
To Dashboard"; at 375 the same label and rule reserve about **60 px** immediately before the sub-heading
"What Changed". Both breaks fall at a **section boundary**, not mid-argument as first claimed. Second,
the right rail's promo cards appear at irregular vertical intervals with no relationship to the prose
beside them. [capture: content-1440-tile-11.png, content-375-scroll-90.png, content-1440-tile-05.png,
content-1440-tile-03.png]

**F19** *(qualified)*. The end of the article is a short, quiet sequence: bullet summary, closing paragraph, an editor's
initials in small italic grey `(yk)`, an italic "Explore more on" line, and three green topic chips. There
is no next-article block, no author bio repeat and no share row at the end. After that the page turns
into an unfilled supporters region — a full-bleed grey rule, an italic line "Our friends and supporters.
You know, they help us pay the bills ↓", and about 250 px of white to the foot of the capture. That
ending is the **capture's**, not the document's: the outline records "— Comments 0" and "LEAVE A COMMENT"
and the sticky comment form sits at 15,982 px, below the 15,700 px capture. [capture: content-1440-tile-17.png,
content-1440-tile-18.png]

## 6. Imagery

**F20** *(qualified — labelling is not uniform)*. On the article, images carry the argument and are not decoration. All three figures I saw are
comparisons the prose depends on: four statistically identical datasets plotted differently; an
analyst-density dashboard against an executive-summary dashboard; a bar chart against a radar chart. Each
is labelled inside the image — `A —` / `B —` for the two dashboard figures, but Roman numerals `I`–`IV`
for the Anscombe quartet, which also sits on plain white rather than on a plate — and carries an italic serif caption
with a camera glyph and a "Large preview" link that states what the figure shows rather than repeating the
sentence above it. `imgCount` is 17 with 15 lazy. [capture: content-1440-tile-03.png,
content-1440-scroll-50.png, content-1440-scroll-90.png]

**F21** *(qualified)*. On the home page images do the opposite: every story leads with a tilted,
red-framed author portrait or cartoon that identifies a person and carries no information about the
article. The size is not constant — the lead cartoon is about 190 px, the second story's portrait about
120 px, the community-link portraits about 90 px and the grid thumbnails smaller again, so "about 130 px"
fits no block. Adjacent entries at tile-09 also differ in headline length, summary and blue in-text
links, so "the only visual difference is the face" overstates it; what repeats is the row shape led by
ornament. [capture:
index-1440-tile-01.png, index-1440-tile-09.png]

**F22.** *Removed — refuted. See Verification.*

## 7. Defers or competes

**F23** *(qualified)*. Between the commercial breaks the reading column defers about as completely as a
column can: one serif, one measure, black on white, no borders and no tints (tile-02, scroll-90). It is
not free of them, though. The same flow carries a tinted "Meet Smashing Workshops" panel with a green
gradient button at the full measure (tile-05), a red tilted pull-quote tile, blue in-prose links such as
"Francis Anscombe" (tile-03), grey figure plates and a camera glyph in every caption. The brand is
**mostly**, not entirely, spent in the top 170 px. [capture: content-1440-scroll-90.png,
content-1440-tile-02.png, content-1440-tile-05.png, content-1440-tile-03.png]

**F24** *(qualified — one promo is in-column)*. It competes at three identifiable moments. (a) The red pull-quote: a tilted red tile with a
white quote glyph, the sentence set large in the heavy sans, and a red Twitter bird appended to the
sentence itself — the design speaking over the author's paragraph and inviting a share inside it. (b) The
promos: a tinted "Meet Smashing Workshops" panel with a green "Jump to the workshops" button set at the
full ~690 px measure — **in the text flow, not the rail** (tile-05) — and, in the rail, a purple
video-course promo and a teal advertisement at higher saturation than anything in the article (tile-03,
not tile-11 as first cited). (c) The in-column jump break of F18. [capture: content-1440-tile-05.png,
content-1440-tile-03.png]

**F25** *(qualified — the numbers are recorded, not observed)*. No in-page navigation is offered anywhere
in the captures: no table of contents at either width at 0 %, 50 % or 90 %, and the grey `#` after each
heading is the only structural affordance visible. The two supporting numbers are not visual
observations — "15,700 px" is the desktop capture height and "13 headings" is `domEvidence.headingOutline`,
which counts "— Comments 0" and "LEAVE A COMMENT" while omitting visible sub-headings such as "Designing
The Mental Model Early" (scroll-90), so the visible heading count is higher. For the length of the page
this is still the design's clearest failure to serve the content. [capture: content-1440-scroll-00.png, content-1440-scroll-50.png, content-375-tile-01.png]

**F26.** No copy controls anywhere (`copyControls.count` 0), no keyboard-shortcut hint (`kbdTexts` and
`ariaKeyshortcuts` both empty), and no visible theme control in any capture — `htmlAttributes.dataTheme`
is null and the page renders light, though `prefersColorScheme` matched two sheets, so some dark rules
exist. `scriptTokens` reports `metaKey` and `keyCode` present in inline script, which is not evidence of
a command palette and I claim none. The one search affordance is the visible header input
(`searchAffordances`: `input Search articles...`). [capture: content-1440-scroll-00.png,
index-375-tile-01.png] (inferred, partly — `copyControls`, `kbdTexts`, `ariaKeyshortcuts`,
`prefersColorScheme`, `htmlAttributes`, `scriptTokens`, `searchAffordances`)

## 8. Absence handling

**F27** *(qualified — measures)*. When a slot has nothing to show, this site renders the container anyway
and labels it. The in-column break prints "More after jump! Continue reading below ↓" over a grey rule and
reserves about **165 px** of blank space at desktop and about **60 px** at 375 — not the 200 px first
claimed at either width — and at both widths the band falls at a section boundary. This is a placeholder
for absence, with copy attached. [capture: content-1440-tile-11.png,
content-375-scroll-90.png]

**F28.** A rail card rendered as an empty white box with a shadow, about 200 px tall, containing nothing
but its caption link "Live UX Training — Smart Interface Design Patterns with Vitaly Friedman". The
container, the border and the space survived; only the content did not. [capture:
content-1440-tile-05.png]

**F29** *(qualified)*. The supporters region at the foot of the article is a full-bleed grey rule, one
centred italic serif sentence pointing down, and then about 250 px of nothing. It is a **caption**, not a
heading — nothing there has heading weight, heading size or an entry in the collected outline — so the
page keeps the *label* of an empty section, not its heading.
[capture: content-1440-tile-18.png]

**F30** *(qualified — scope)*. In the prose itself the opposite discipline holds: in every section
opened there is no "not available" line, no empty section and no stub heading. Eleven desktop tiles were
never viewed, so this holds for the captures judged rather than for the whole article. The placeholder
behaviour that was seen is confined to commercial slots. [capture: content-1440-tile-17.png,
content-1440-scroll-90.png]

## 9. Verifier additions

**V1.** The article's "about this record" facts are collected into one light grey plate directly under
the title, held apart from both the prose and the rail: a plate roughly 700 × 90 px carrying read time,
three topic links and the share links, each with a small coloured glyph. At 375 the same plate stacks
into three rows and survives intact. For a dossier this is the shape for programme scope, review date and
source count — one skippable plate, not a row of chips competing with the conclusion. [capture:
content-1440-tile-01.png, content-375-tile-01.png]

**V2.** A red small-caps `QUICK SUMMARY` label opens an italic serif abstract at the full measure, before
any section — eight lines stating the whole argument once, closed by a rule before the body begins, and
unchanged at 375. A dossier needs exactly this slot: the plain-language conclusion of one programme,
stated before the evidence chain and visually marked as a summary rather than as a finding. [capture:
content-1440-tile-01.png, content-375-tile-01.png]

**V3.** The desktop right rail mixes editorial provenance with paid promotion in one column, so position
stops signalling which is which. Reading down the same ~283 px column: the author portrait and "About the
author" block, then an "Email Newsletter" capture form with a "Meow!" button, then a teal advertisement,
then a purple video-course promo, then two empty promo boxes. No rule, label or width change separates
the author's credentials from the advertisement. A dossier sidebar carrying sources, reviewers and
revision must not share a column with anything solicited — a reader who learns the column is promotional
stops reading the provenance in it. [capture: content-1440-tile-01.png, content-1440-tile-02.png,
content-1440-tile-03.png, content-1440-tile-05.png]

## For RNAWiki

**Borrow**

- **The measure and the type pairing, for the dossier reading column.** A ~690 px serif paragraph box at
  20.4/33.5 on white, with hierarchy carried by a typeface switch (sans heading / serif prose) and by
  asymmetric space (~90 px above a heading, ~25 px below) rather than by a colour or a box. A dossier can
  put a plain-language sentence and a technical sub-section in the same column without either shouting.
  What is borrowable is that deference *between* the commercial inserts — the flow itself is not
  colour-free (see F23). [capture: content-1440-tile-02.png, content-1440-tile-11.png]
- **Figures set slightly wider than the measure, with a caption that states what the figure shows.** The
  ~798 px figure plate against a ~690 px text box marks a change of object with no border and no label,
  and the caption ("A high-density path-exploration graph … versus a clean, aggregated executive
  overview") describes the comparison rather than repeating the sentence above. For a mechanism diagram
  or a trial-timeline graphic this is the right relationship between picture and prose — adopt it as a
  rule, since the site itself applies it to two of its three figures and leaves the third unplated and
  narrow. [capture: content-1440-scroll-50.png, content-1440-scroll-90.png, content-1440-tile-03.png]
- **The `QUICK SUMMARY` block.** A small red label opening an italic serif abstract at the full measure,
  above the first section, so the conclusion of one programme is stated once in plain language before the
  evidence chain — marked as a summary, not as a finding. [capture: content-1440-tile-01.png,
  content-375-tile-01.png]
- **The metadata plate.** Read time, topics and share links collected into one light grey plate between
  the title and the summary, holding record facts apart from the prose — the shape for programme scope,
  review date and source count. [capture: content-1440-tile-01.png, content-375-tile-01.png]
- **The end-of-article-body exit.** Initials, an italic "Explore more on" line, three topic chips, stop.
  No related-content block, no repeated bio. A dossier that ends by naming its own topics and stopping
  adds no repeated words to the uniqueness budget. This is how the *article* ends; the page continues into
  a supporters band and, below the capture, a comments section. [capture: content-1440-tile-17.png]

**Avoid**

- **Labelled empty containers.** "More after jump! Continue reading below ↓" over ~165 px of nothing at
  desktop and ~60 px at mobile, empty rail cards holding only their caption links, and a supporters line
  above ~250 px of blank space are three instances of exactly what the shared constraints forbid: absent
  data must render nothing at all, not a placeholder and not a "not recorded" line. [capture:
  content-1440-tile-11.png, content-1440-tile-05.png, content-1440-tile-18.png,
  content-375-scroll-90.png]
- **A very long page with no in-page navigation.** No contents at any scroll depth in any capture. (The
  15,700 px length is the capture height and the 13-heading count is `domEvidence`, which undercounts the
  visible sub-headings — the length is not in doubt, its provenance is.) A dossier is longer and more
  scanned than an essay; the contents rail must come from somewhere else. [capture:
  content-1440-scroll-50.png]
- **The pull-quote device.** A tilted coloured tile, an oversized restatement of a sentence, and a share
  bird inside the author's argument. On a medicine page an oversized restated sentence would read as a
  conclusion pulled out of its programme scope. [capture: content-1440-tile-05.png]
- **The full-bleed saturated header band as a home-page pattern.** At 1440 it takes the first fixation
  away from the content. RNAWiki's home page search bar is frozen and nothing may compete with it, so the
  desktop version of this header is not borrowable. [capture: index-1440-tile-01.png]
- **A portrait-led card shape as the repeating unit of a browse list.** Every home-page row spends its
  most prominent slot on ornament carrying no data about the entry. A browse list of compounds led by
  ornament rather than by data would work directly against the uniqueness metric. (Adjacent entries do
  differ in headline and summary, so the objection is to what leads the row, not to the rows being
  indistinguishable.) [capture: index-1440-tile-09.png]
- **A sidebar that mixes record provenance with solicitation.** The author bio, a newsletter form and two
  advertisements run down one column with nothing separating them, so position stops telling the reader
  which is editorial. A dossier sidebar carrying sources, reviewers and revision must not share a column
  with anything solicited. [capture: content-1440-tile-01.png, content-1440-tile-03.png]

**Phase 2 verdict — strengthens, with one boundary and one transfer.**

The assignment of smashingmagazine.com as governing reference for the *compound dossier reading column*
is **strengthened** by what rendered. The numbers said the column was the best measured; the captures
show that the column also behaves well under a very long scroll — the rhythm holds for thousands of
pixels and the two breaks in rhythm are both commercial inserts that RNAWiki has no equivalent of and
will not add. One clause of the original argument does not survive the captures: the prose *does* acquire
a card and a tint — a tinted workshops panel with a green button at the full measure, a red pull-quote
tile, blue in-prose links and grey figure plates (F23, F24) — so what is borrowable is the deference
between those inserts, not a monochrome rule. The typeface-and-space hierarchy is the mechanism Phase 2
credited to Linear as secondary, and Smashing demonstrates it at full essay length.

The boundary: this site contributes **nothing** to the *dossier contents rail and previews* surface, and
the captures make that stronger than "unassigned". There is no rail, no table of contents, no progress
indicator and no sticky anything on screen at any depth — the two positioned elements the DOM records sit
at offsets past the end of the 15,700 px captured document and appear in no image. Anyone tempted to read "Smashing governs the dossier" as
covering the rail should read F16 and F25 instead. Stripe remains the only measured candidate for that
surface and the stopping rule stands.

The transfer: the mobile first screen argues for assigning this site a second, smaller role on the **home
page** — mobile only, and only as corroboration of the frozen bar, narrower than first written. At 375 the
band grows taller than the desktop band while the fourteen-item nav collapses into a "Menu" button, and
the full-width white search field is the largest element in it. It is *not* alone: the logo and that Menu
button sit above it and a topic-chip row below it. So what corroborates is a search-first mobile first
screen, not an isolated field — the case for RNAWiki's frozen bar stands on the field's prominence, not
on this site putting nothing around it. [capture: index-375-tile-01.png, content-375-tile-01.png]

One record correction for the Phase 2 table: the justification row cites "contrast 11.5–12.6:1" from a
dark article background. The article captured here is black-on-white, and `domEvidence` reports
`rgb(255,255,255)` / `rgb(51,51,51)`. The light-default decision is unaffected, but the contrast figure
in that row should be re-measured against what renders before it is used as a token.

## Verification

Verified independently against the captures on 2026-09-03: **14 confirmed, 22 qualified, 2 refuted, 3
added**. Captures opened: `index-1440-full`, `index-1440-tile-01`, `index-1440-tile-09`,
`content-1440-tile-01/02/03/05/11/17/18`, `content-1440-scroll-00/50/90`, `index-375-full`,
`index-375-tile-01`, `content-375-tile-01`, `content-375-scroll-50`, `content-375-scroll-90`. No consent
banner appears in any of them, so nothing below reads a banner as design.

**Refuted — removed from the record**

- **F22** — the stretches between figures are not unbroken text. `content-1440-tile-05` and
  `content-1440-tile-11` both carry large pull-quotes, tile-05 also a tinted promo panel, and tile-11 a
  grey rule: "no decorative rules, filler quotes or section illustrations" is contradicted by the tiles
  cited alongside it.
- **F34** — the reading region below the first screen is not monochrome: a red pull-quote tile and Twitter
  bird and a green gradient button (tile-05), blue in-prose links (tile-03), full-colour figures
  (scroll-50) and green topic chips (tile-17). The "withhold all colour" borrow item rested on this and
  has been replaced.

**Qualified — claim rewritten above**

- **F1** — colour *is* used on the first screen (red byline, red `QUICK SUMMARY`, grey metadata plate);
  what is true is that colour never marks a level in the size ladder.
- **F6** — the mobile band is ~155 px, not 170, and the search field is not above everything: a logo and a
  "Menu" button sit above it in the same band, a chip row below. The header grows *and* collapses.
- **F8** — the density figure was roughly half the truth: ~230 words on tile-02 and ~180 on scroll-90, not
  ~130.
- **F9** — over-scoped: eleven desktop tiles were never opened, so "no table anywhere" becomes "no table
  in any capture judged".
- **F11** — the block order was wrong (the coloured guides block precedes the two-column grid) and the
  full-bleed blue workshops band was missed.
- **F12** — the empty region is ~480 px including its gutter, and the rail is full above the last card, so
  "permanently empty" applies below that card only.
- **F14** — the plate-and-overhang treatment covers two of three figures; the Anscombe figure is unplated
  and *narrower* than the measure.
- **F17** — the two DOM offsets (15,982 px, 17,031 px) exceed the 15,700 px captured document, so the
  snapshot describes a taller page state than the images; only "not on screen at 0/50/90 %" is shown.
- **F18** — both jump breaks fall at a section boundary, not mid-argument, and the reserved band is ~165 px
  desktop / ~60 px mobile.
- **F19** — "nothing further" is true of the capture, not the document: a comments section and a sticky
  comment form sit below 15,700 px.
- **F20** — the labelling is not uniform: `A —`/`B —` on the dashboard figures, Roman numerals on the
  Anscombe quartet, which is also unplated.
- **F21** — portrait sizes step down (~190 / ~120 / ~90 px and smaller), and adjacent entries differ in
  headline, summary and links, so "only difference is the face" overstates it.
- **F23** — the flow does carry a tinted card, a coloured tile, blue links, grey plates and caption icons;
  the brand is mostly, not entirely, withheld.
- **F24** — the workshops promo is *in the reading column* at full measure, not in the rail, and the rail
  promos are on tile-03, not tile-11.
- **F25** — "15,700 px" is the capture height and "13 headings" is `domEvidence.headingOutline` (which
  counts two comment headings and misses visible sub-headings); the visual claim is only "no contents in
  any capture".
- **F27** — the reserved band is ~165 px desktop and ~60 px mobile, not 200 px at either width.
- **F29** — the supporters label is an italic caption, not a heading.
- **F30** — over-scoped in the same way as F9; true of the sections opened.
- **F33** — the borrowed figure treatment is not the site's uniform practice; adopt it as a rule.
- **F35** — borrow the end of the *article body*; the page continues into a supporters band and a comments
  section.
- **F37** — same numbers-provenance problem as F25; the length and heading count are recorded values.
- **F38** — the browse-list objection is to ornament leading the row, not to adjacent entries being
  indistinguishable.

**Added** — V1 (metadata plate), V2 (`QUICK SUMMARY` abstract), V3 (rail mixes provenance with
promotion); see section 9.
