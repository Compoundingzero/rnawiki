# pudding.cool — Track A1 visual findings

The Pudding is a publication of one-off data essays. Two pages were captured: the story index at
`https://pudding.cool/` and one story, `https://pudding.cool/2026/07/essential-words` ("How the
Words We Teach English Language Learners Changed"), at 1440x900 and 375x812, with three real
scrolled viewport views on the story. The two pages do not look like the same site: the index is a
three-column card grid in a heavy display face with sticker-style controls on white; the story is a
single centred serif column, grey on cream, with no navigation over it at all. The story is 33,581 px
tall at desktop and 36,047 px at mobile, so both `-full` images stop at the 16,384 px raster cap and
are useful only for shape. Four `bannerActions` entries record a `div.about` block "left standing"
because it exposed no permitted refusal control; the controls named (Our Team, Our Resources, Pitch
a Story, Brand Partnerships, Privacy Policy) are exactly the links in the site footer visible at the
foot of both pages, so what was flagged is the ordinary footer, not a consent overlay sitting over
the design.

## 1. Visual hierarchy

**F1.** On the index the first rank of the masthead is the publication's own name. The wordmark is a
large hand-drawn logotype, horizontally centred, and it is the biggest and blackest *typographic*
object on the screen; the tagline that explains what the site is ("A digital publication that…
explains ideas with visual essays") is set at roughly a seventh of its height and pushed to the far
left margin. It is not the largest object on the screen — each of the three card thumbnails below it
(about 395x385 px against the wordmark's 215x75 px) covers more area. Identity outranks explanation
by weight and by centre position. [capture: index-1440-tile-01.png, index-1440-full.png]

**F2.** Second rank on the index is the card thumbnail, third the story title, fourth the one-line
question under it. The title is a heavy slab serif at about twice the body size and sits immediately
under the image with no gap of its own; the description is a lighter sans in a mid grey. The
identifier chip (`#224`) and the date sit above the image in small monospace and are the weakest
thing in the card even though they are physically first. Rank is carried by weight and face change,
not by position. [capture: index-1440-tile-01.png, index-1440-tile-05.png]

**F3.** The story inverts this — but not quite in one face and one grey. `THE EXPANDING WORLD` (h2)
is separated from the paragraph above by a gap about three and a half lines deep and is set in
letter-spaced capitals; the chart title below it ("The New List Devotes More Space to Abstract
Concepts…") is the same serif in the same grey, in sentence case at a smaller size. The fourth rank,
the chart's explanatory line ("Each band is one of 21 semantic categories, sized and sorted by its
share of each list."), changes both face and colour: a smaller sans in a visibly lighter grey. Three
of the four ranks are separated by size and space alone, with no rule, no bold and no accent colour;
the fourth is not. [capture: content-1440-tile-08.png]

**F4.** The chart's title and its one-line explanation are typeset as prose and sit above the
graphic, so the ranking reads: what this chart claims, then how to read it, then the picture. The
picture is last in the hierarchy even though it occupies most of the height.
[capture: content-1440-tile-08.png, content-1440-scroll-50.png]

## 2. Where the eye lands first

**F5.** Desktop index, first screen: the eye lands on the centred wordmark. That is chrome, not
content. The search box ("Find a story…") is a hairline-outlined field about 168 px wide — roughly an
eighth of the 1440 px screen, about 15% counting its magnifier icon, not a fifth — with the six
filter chips to its right; the first story card begins about a third of the way down (y≈310 of 900).
The field is in fact wider than any single sticker button (ABOUT, SUBSCRIBE, MORE are about 81x30 px
each), but it is the quietest thing on its row: grey placeholder in a thin outline, against
black-outlined drawn artwork. [capture: index-1440-tile-01.png]

**F6.** Mobile index, first screen: the wordmark again, now top-left and occupying about a tenth of
the viewport height, then the centred tagline, then the search field paired with an "All" select.
Content (the first card image) starts roughly 45% down the screen. The chrome-before-content
ordering is stronger at mobile than at desktop. [capture: index-375-tile-01.png]

**F7.** Story, desktop first screen: the eye lands on two short centred sentences in the middle of
the screen, surrounded by about forty greyed words scattered across the full width. That is content
— the scattered words are the dataset, and the sentences tell you so ("Look through the words
scattered around this page. Every one of them is among the most commonly used words in the English
language."). The only chrome on the screen is the wordmark at the top edge.
[capture: content-1440-scroll-00.png, content-1440-tile-01.png]

**F8.** Story, mobile first screen: the wordmark takes the top, the scattered words compress into
three narrow columns, and the two sentences fall to the lower half. The same idea survives the
narrowing but the eye now meets the wordmark first, as on the index.
[capture: content-375-tile-01.png]

## 3. Information density

**F9.** The index is the dense surface: three cards per row at desktop, and each card carries
exactly five fields — number chip, month and year, image, title, one-sentence question. No author,
no tags, no read time, no counts. The list is long (the page runs about 7.5 screens) but the density
per card never changes down its whole length. [capture: index-1440-full.png, index-1440-tile-05.png]

**F10.** The story's *column* is the least dense in this study by a wide margin — but the screen is
not. The first desktop screen carries two paragraphs of about 46 words inside a column measuring
roughly 650 px (x≈395–1046) on a 1440 px viewport; around and above them sit about 44 scattered
single words, so roughly 90 words are actually on screen. Screens 2 and 3 of the desktop tiles are
entirely empty cream. [capture: content-1440-tile-01.png, content-1440-tile-02.png]

**F11.** Where density does arrive, it is a chart, not a table. At 90% scroll the desktop screen
holds a unit chart of several thousand small squares grouped into five part-of-speech columns, two
rows (1953 list, 2023 list), a three-item legend, and a two-line note under it. No captured screen
on either page contains a table. [capture: content-1440-scroll-90.png]

**F12.** The one list-shaped block captured is at mobile: three columns of adverbs, every one of
them highlighted in the same magenta, about 75 items on one screen. It is a list rendered as a
coloured field rather than as rows — the reader is meant to see the size of the set before reading
any member of it. [capture: content-375-scroll-90.png]

## 4. Whitespace

**F13.** Space is spent above section headings and withheld below them. Measured in the capture, the
paragraph above `THE EXPANDING WORLD` ends at y≈88 and the heading sits at y≈203, with the following
paragraph starting about 30 px beneath it against a body line-height of about 31 px — roughly three
and a half line-heights above, one below. The heading is glued to what it introduces and cut off from
what precedes it. (The Phase 1 `margin-top: 80px` / `margin-bottom: 20px` figures are not part of
these captures and are not relied on here.) [capture: content-1440-tile-08.png]

**F14.** The story's page shape is mostly long blank bands between short text blocks — a full desktop
tile of uninterrupted cream between the opening sentences and the title card, and several such voids
in the `-full` image. Those bands cannot be read as composition, or as designed whitespace at all:
they are the same regions as the graphic stages that do not draw in a static full-page render (F20),
so what the tiles show is un-rendered picture. The honest statement is that the page's shape is
unreadable from a static capture, not that its whitespace is runway.
[capture: content-1440-tile-02.png, content-1440-full.png, content-1440-tile-06.png]

**F15.** On the index, whitespace is a fixed grid gutter, and empty grid cells are treated as
placeable slots rather than as gaps: one cell holds a staff member's "Some of my favorite projects"
note with a photograph, another holds the newsletter sign-up form. The grid absorbs non-story
content instead of interrupting the list with a full-width band.
[capture: index-1440-full.png, index-1440-tile-05.png]

**F16.** Margin whitespace carries meaning on the story's opening — but the words are not confined to
the margins. They surround the reading column on both sides *and* run in a band across the full
width above it: `LEGAL`, `CHEMICAL`, `CONSTITUTE`, `RANGE`, `FEAR`, `GENDER` and `COUNTY` all sit
inside the column's horizontal span. What is kept clear is the block holding the two sentences, not
the column. The data field wraps the reading block; the reading block stays clean.
[capture: content-1440-tile-01.png]

## 5. The long scroll

**F17.** Almost nothing persists. There is no sticky site header, no progress bar, no contents rail,
and no in-page navigation on the story at any of the three scroll depths. The one piece of persistent
chrome is a small control at the right edge — a "+" with the vertical label `WORD LISTS` — and it is
**not** offered on the first screen: it is absent at 0% and present at 50% and 90%. That it is a
persistent control rather than page content is supported by the DOM record of a `position: fixed`
`aside.explorer` (1440x900 at top 0) and a `button.explorer-fab` alongside it; that it opens a panel
is **inferred** [domEvidence: stickyOrFixed]. [capture: content-1440-scroll-00.png,
content-1440-scroll-50.png, content-1440-scroll-90.png]

**F18.** The same control survives the narrow viewport but changes form: at mobile it is a pill
reading `+ WORD LISTS` pinned to the top-right corner rather than a vertical rail label.
[capture: content-375-scroll-90.png]

**F19.** The rhythm seen at both widths is: a graphic pins to the viewport, and a bordered cream card
of prose slides up over it. The card is not laid out *around* the graphic. At 50% it covers the
chart's legend — the line reads `REMAINED (IN…` on one side and `…ED TO 2023 LIST` on the other — and
part of the 1953-side word labels; at 375 px the arcs are clipped at both edges and the legend is
hidden altogether, so the colour key and the colour-coded sentence are never on screen together. The
DOM records six `position: sticky`/`fixed` stage elements at four document offsets (4 px, 6,946 px,
12,722 px, 22,056 px) — four stages, not five. That the pinning is driven by scroll position is
**inferred**; `scriptTokens` reports `IntersectionObserver` and `scrollama` as "unknown", so no
library can be named. [capture: content-1440-scroll-50.png, content-375-scroll-50.png]

**F20.** The graphic regions do not draw in a static full-page render: they are blank cream in the
tiled captures and fully drawn in the real scrolled viewport views. What that establishes is that
this page has no static fallback for its numbers — headings and captions with nothing beneath them.
It does not establish what a reader who simply does not scroll would see: the manifest states that
the tiles are slices of one full-page capture in which Chromium paints sticky elements where they
sat, so the blanks are a property of that render. [capture: content-1440-tile-02.png,
content-1440-tile-06.png, content-1440-tile-08.png, content-1440-scroll-90.png]

**F21.** The end of the story is a three-part landing. First a `Methods & Notes` region on a
different ground colour — pale olive against the cream — carrying collapsible blocks ("What are the
limitations?", "Footnotes", each with a `−` toggle) and five numbered footnotes with return arrows
back into the text. Then the ground turns white for a promotional line ("We've published 214 awesome
stories such as…" with three story links). Then the footer. The change of ground colour is what
tells you the argument has ended and the apparatus has begun.
[capture: content-1440-tile-37.png, content-1440-tile-38.png]

**F22.** The index's long scroll ends differently: the final row of cards fades to transparent under
a black `LOAD MORE STORIES` button, and the faded cards lose their titles entirely. The end of the
list is drawn as an incompleteness rather than as a boundary. [capture: index-1440-tile-07.png]

## 6. Imagery

**F23.** On the story the graphics carry the quantities and the prose does not restate them. The
concentric-arc diagram at 50% shows how much of each semantic level was removed or added through the
angular extent of its orange and magenta segments — the rings read as roughly equal in thickness, so
thickness is not the encoding — while the text card over it names example words and gives one
fraction and one percentage ("nearly a quarter… and 39%") and never the shape. The unit chart at 90%
shows the noun/adjective/adverb/verb split by area. Remove the graphics and the claims lose their
evidence. [capture: content-1440-scroll-50.png, content-1440-scroll-90.png]

**F24.** Colour is a shared key across text and graphic, and this is the strongest single device on
the page. Orange means "in the 1953 list, removed"; magenta means "added to the 2023 list". The same
two colours highlight the words inline inside the running prose ("*Humble, loyalty, fellowship*"
orange, "*community, identity, ethnic*" magenta), colour the arcs, and appear again in the unit
chart's legend at 90%. The reader learns the key once from the sentence and can then read any later
graphic without a caption. [capture: content-1440-scroll-50.png, content-1440-scroll-90.png,
content-375-scroll-50.png]

**F25.** The one chart captured with a source note carries its legend, its provenance and its caveat
in the same frame. Under the unit chart, in small centred type: "The 2023 list contains more words
overall (2,809 vs. 2,284). All changes mentioned in the text reflect each category's share of its
list, not raw counts. Data source: NLTK (Natural Language Toolkit), with manual correction of
mislabeled words." The limitation and the provenance sit with the picture, not in a footnote at the
bottom of the page. This does not hold for *every* chart, as originally claimed: the arc stage at 50%
shows a legend and no source or caveat line at all.
[capture: content-1440-scroll-90.png, content-1440-scroll-50.png]

**F26.** Where there are no images the site does not fall back to grey. Below the fold on the index,
card after card renders as a flat saturated block of a single colour, holding the same aspect box the
thumbnail would hold, with title and question intact beneath it. The grid rhythm is unbroken; only
the picture is missing. *Why* it is missing cannot be told from these captures: this manifest's DOM
sample was collected on the story page (`imgCount` 2, `imgLazyCount` 0) and holds no lazy-loading
evidence for the index, so the Phase 1 "27 of 59 `<img>` elements with `loading=lazy`" figure is not
checkable here and is dropped. The visible result stands on its own — the slot keeps its size and its
colour. [capture: index-1440-tile-05.png, index-1440-full.png]

**F27.** One card in that run shows a play triangle on a purple block, so a video story is marked by
an overlay on the same slot rather than by a different card shape.
[capture: index-1440-tile-05.png]

## 7. Defers or competes

**F28.** The index competes, deliberately. The wordmark, the three sticker buttons and the six
icon-and-label filter chips are all hand-drawn artwork with outlines and shadows, and the merch
promotion is given a whole card slot in the grid. It is not a floating tab overlapping the grid:
`index-1440-tile-06` shows `SHOP OUR SWAG` inside an ordinary third-column cell headed "If you like
our stories, you'll love our merch" with a T-shirt illustration, and tile-07 catches only the bottom
edge of that cell. The reader meets the publication's personality before any story.
[capture: index-1440-tile-01.png, index-1440-tile-06.png, index-1440-tile-07.png]

**F29.** The story defers almost entirely. There is no header over it, one typeface, one grey, no
accent colour except the two data colours, and the only persistent control is a small "+" label at
the screen edge. The design's only visible opinion is the cream ground.
[capture: content-1440-scroll-00.png, content-1440-tile-08.png]

**F30.** The one place the story competes with itself is length. The manifest records a 33,581 px
desktop document — about 37 screens — carrying 18,131 characters of text, so the scroll distance is
an authored effect rather than a consequence of the content. No contents list and no jump link
appears in any of the three scroll captures, so the only route to the conclusion is continuous
scrolling. (The screen count and character count are manifest `domEvidence` figures, not pixel
observations.) [capture: content-1440-full.png, content-1440-scroll-00.png,
content-1440-scroll-50.png, content-1440-scroll-90.png]

**F31.** The prose's contrast is the site's weakest point for a reference reader: grey serif
`rgb(87, 87, 87)` on cream `rgb(255, 255, 241)`, which recomputes to 7.17:1 directly from this
manifest's own recorded colours [domEvidence: bodyColor, bodyBackgroundColor]. The headings share
that same grey and gain rank only from size, and the chart caption is lighter still. Whether this is
the lowest body contrast of the ten study sites cannot be checked from this site's captures and is
not claimed here. [capture: content-1440-tile-08.png, content-1440-tile-01.png]

## 8. Absence handling

**F32.** A missing thumbnail is handled by keeping the box and filling it with colour, not by
collapsing the card or writing a label — see F26. Nothing on the index says "image unavailable".
[capture: index-1440-tile-05.png]

**F34.** The apparatus is built from disclosure blocks rather than plain sections: the `Footnotes` and
`What are the limitations?` blocks in the Methods region each carry a toggle at the right of their
rule, so a heading can stand as an index of what the apparatus holds. Both are captured **open**,
each showing a `−`, so the closed state and the `+` affordance are not observed here — only the
mechanism is. [capture: content-1440-tile-37.png]

**F35.** No capture on either page shows a "not available" line, a dash standing in for a missing
value, or a stub heading. But absence is *silent*, not handled: the index's colour blocks stand where
thumbnails are missing (F26) and the story's graphic regions are blank in the static render (F20),
with nothing on screen saying so. The structure follows what there is to show; it does not say when
something is not there. [capture: content-1440-full.png, content-1440-tile-37.png,
content-1440-tile-08.png, index-1440-tile-05.png]

## Baseline notes

**F36.** The page renders light. `bodyBackgroundColor` is `rgb(255, 255, 241)` — a warm cream, not
white — and `prefersColorScheme.found` is false on the story's two readable sheets, so no dark
variant was observed on this page [domEvidence: prefersColorScheme, htmlAttributes]. The Phase 2
line describing Pudding's `prefers-color-scheme` dark comes from the index's stylesheets, and the
index in this capture also rendered light. [capture: content-1440-tile-08.png, index-1440-tile-01.png]

**F37.** No command palette and no copy control were found: `kbdTexts` and `ariaKeyshortcuts` are
empty and `copyControls.count` is 0 on the story [domEvidence: kbdTexts, ariaKeyshortcuts,
copyControls]. `searchAffordances.count` is 0 there too — but that evidence was collected on the
story page only, and the index visibly carries a "Find a story…" input at both viewports, so the
site does have search. [capture: index-1440-tile-01.png, index-375-tile-01.png]

**F38.** Four `bannerActions` entries record a `div.about` left standing. The footer visible at the
foot of the story is that block: Patreon and newsletter blurbs, then "ABOUT US" and "FOLLOW US" link
lists naming exactly the five controls the manifest lists. It is the site's footer and should be read
as design, not as an overlay obscuring the page. [capture: content-1440-tile-38.png]

## Added in verification

**V1.** The lightest and smallest type on the story is the type that qualifies the data. The chart's
reading instruction ("Each band is one of 21 semantic categories…") is a small sans in a lighter grey
than the body serif above it, and the source-and-caveat line under the unit chart — denominators
(2,809 vs. 2,284), the share-not-counts caveat, the NLTK source — is the smallest type on the screen,
centred and lighter again. For a reference record this ordering is backwards: the caveat must not be
the faintest line on the page. [capture: content-1440-tile-08.png, content-1440-scroll-90.png]

**V2.** The persistent edge control overlaps content instead of reserving space for itself. At
1440 px the `+ WORD LISTS` rail sits in an empty right margin and costs nothing; at 375 px the same
control becomes a bordered pill floating over the top-right of the three-column adverb list and
obscures the first item of the right-hand column. A dossier contents rail borrowed from this must
reserve a gutter at narrow widths rather than float over the record.
[capture: content-375-scroll-90.png, content-1440-scroll-90.png]

**V3.** The index's filter vocabulary is not the same at both widths. At 1440 px six labelled icon
chips sit beside the search field — OUR FAVES, POPULAR, UPDATING, YOUR INPUT, VIDEO, AUDIO. At 375 px
they collapse into a single bordered select labelled `All` next to the same search field, and no
category name is visible anywhere on the first mobile screen. A reader at mobile cannot see what the
list can be filtered by without opening the control.
[capture: index-1440-tile-01.png, index-375-tile-01.png]

## For RNAWiki

### Borrow

- **One colour key, taught once in the prose, reused in every graphic** (F24) — for the *citation
  evolution map*. If a colour means "source added at this revision" and another means "source
  withdrawn", introduce them by highlighting the words in the sentence that first names them, then
  never re-legend them. [capture: content-1440-scroll-50.png, content-1440-scroll-90.png]
- **The caveat travels with the chart** (F25) — for the *citation evolution map* and *structured
  data blocks*. The unit chart's note gives the denominators, states that the text speaks in shares
  not counts, and names the data source, all under the picture in small type. That is the exact shape
  of the line RNAWiki needs under any evidence graphic so a source is never read as proving more than
  it says. Borrow the placement, not the treatment: it is observed on one chart only, and it is set
  smaller and lighter than the body (V1). [capture: content-1440-scroll-90.png]
- **Chart title as a claim, plus a one-line reading instruction, both above the graphic** (F4) — for
  *structured data blocks*. The reader gets what the block asserts and how to read it before meeting
  the marks. [capture: content-1440-tile-08.png]
- **Hierarchy from space alone, in one face and one colour** (F3, F13) — for the *dossier reading
  column*, corroborating the Linear secondary already assigned there. Four visible ranks with no
  rule, no bold and no accent colour; the 4:1 ratio of space above a heading to space below it does
  all of it. [capture: content-1440-tile-08.png]
- **A terminal apparatus region on its own ground colour** (F21, F34) — for the *dossier reading
  column* and *structured data blocks*. Methods, limitations and numbered footnotes with return
  arrows, on a different background from the argument, collapsible so their headings stay as an index
  of what exists. This is a direct fit for RNAWiki's technical disclosure rule.
  [capture: content-1440-tile-37.png]
- **A fixed, single-purpose side control instead of a chrome bar** (F17, F18) — for the *dossier
  contents rail*, cautiously. One labelled affordance at the screen edge costs almost nothing at
  1440 px. Two cautions from the captures: it is absent on the first screen, so a reader never sees it
  until they are already scrolling, and at 375 px the pill floats over the text and hides part of it
  (V2). [capture: content-1440-scroll-50.png, content-375-scroll-90.png]
- **Fixed-field cards with no optional slots** (F9) — for *browse/filter*. Five fields, identical on
  every card, so a card that has less does not look broken. [capture: index-1440-tile-05.png]

### Avoid

- **The index's chrome-first first screen** (F5, F6). The wordmark is the largest and most central
  object and the search field is smaller than the decorative sticker buttons beside it. Applied to
  RNAWiki's home this would breach the frozen search bar directly — do not borrow the index's masthead
  proportions, its centred logotype, or its habit of putting filter chips level with the search field.
  [capture: index-1440-tile-01.png, index-375-tile-01.png]
- **A page whose meaning only exists during scroll** (F20, F30). The graphic regions have no static
  render at all; a 33,581 px document carries 18,131 characters; there is no contents list and no jump
  link at any depth, so the conclusion is reachable only by scrolling the whole way. A medicine dossier
  read by someone deciding something cannot be built this way.
  [capture: content-1440-tile-02.png, content-1440-tile-06.png, content-1440-full.png]
- **Grey text on cream at 7.17:1** (F31), with the caption and caveat lines lighter still (V1). The
  ratio recomputes from the manifest's own colours; the capture shows the same lightening applied to
  the lines that qualify the data. Take the cream ground if it helps, never the grey.
  [capture: content-1440-tile-08.png]
- **A fade-out at the end of a list** (F22). Untitled cards fading to nothing under a `LOAD MORE
  STORIES` button read as broken data on a reference site, whatever they mean on a magazine index.
  RNAWiki's rule is that absent data renders nothing; a fade renders something and says nothing.
  [capture: index-1440-tile-07.png]
- **Filter categories that vanish at mobile** (V3). Six named chips at 1440 px become one `All`
  select at 375 px. Browse/filter must name what it filters by at both widths.
  [capture: index-375-tile-01.png]
- **Two visual systems for one site** (F28 vs F29). The index and the story share no typeface and no
  ground. RNAWiki's home, browse and dossier must read as one record.
  [capture: index-1440-tile-01.png, content-1440-tile-08.png]

### Phase 2 verdict

**Strengthens** the assignment of pudding.cool to the **citation evolution map**, and sharpens the
warning attached to it.

Strengthened, because the mechanism the surface needs was observed working rather than inferred from
a stylesheet: a pinned graphic stage with a bordered prose card riding over it, a colour key
introduced in the sentence and reused in the marks, and a provenance-and-caveat line living under
the chart (F19, F24, F25). Sharpened on two points. First, Phase 2's own rule for this surface — "the
text carries every meaning and the graphic carries none" — is *not* what this site does: at 50% and
90% the magnitudes live only in the graphic and the prose gives two percentages and some examples
(F23). RNAWiki must therefore hold the rule against the reference, not learn it from the reference,
and state every quantity in text as well. Second, the static evidence is worse than the numbers
suggested: the graphic stages render blank outside a live scroll (F20), so a citation map built this
way has no readable fallback. Assign Pudding to the map for the pinned-stage-and-card mechanism and
the colour key, and require that the same revision history is also readable as a plain list.

It also argues for one addition it does not currently hold: the `Methods & Notes` region — different
ground colour, collapsible limitations and footnotes, numbered notes with return arrows (F21, F34) —
is a better observed model for RNAWiki's *technical disclosure* than anything else captured here, and
should be recorded as a **secondary influence on structured data blocks**, with stripe.com/docs still
governing. Nothing seen argues for moving Pudding onto home, browse/filter, global search or the
reference/definitions page; on home it argues actively against itself (F5).


## Verification

Independently checked against the eight desktop and three mobile captures named in the brief, plus
`index-1440-tile-06`, `content-1440-tile-06`, `content-1440-tile-37`, `content-1440-tile-38`,
`content-1440-scroll-90`, `content-375-scroll-50` and `content-375-scroll-90`. 19 findings confirmed,
18 qualified, 1 refuted and removed, 3 added (V1–V3).

**Refuted and removed**

- **F33** — its distinguishing claim, that the faded end-of-list cards are "partly loaded", is an
  inferred loading state with no `domEvidence` key; the capture shows a clean linear gradient mask,
  and the visible fact is already carried by F22.

**Qualified and rewritten**

- **F1** — the wordmark is the largest *typographic* object, not the largest object on screen; each
  card thumbnail below it covers more area.
- **F3** — "one typeface and one grey" does not hold: the fourth rank, the chart's reading line,
  changes to a sans in a lighter grey, as the viewer's own evidence line said.
- **F5** — the search field is about an eighth of the screen, not a fifth, and it is physically wider
  than any single sticker button; what makes it recede is weight, not size.
- **F10** — under 60 words is true of the column, not of the screen: about 44 scattered words bring
  the first screen to roughly 90.
- **F13** — the ratio is visible and holds (about 3.5 line-heights above, 1 below), but the Phase 1
  `margin-top: 80px` / `margin-bottom: 20px` figures are not in these captures and were dropped.
- **F14** — the blank bands are the un-rendered graphic stages of F20, so they cannot also be counted
  as designed whitespace or scroll runway.
- **F16** — the scattered words are not confined outside the column; several sit inside its horizontal
  span in a band above the text block.
- **F17** — the edge control is not constant: it is absent at 0% and appears only at 50% and 90%.
- **F19** — the prose card covers the chart's legend and part of its arc labels at both widths, and
  the DOM records six sticky/fixed stage elements at four offsets, not five stages.
- **F20** — the blanks establish the absence of a static fallback; they do not establish what a
  non-scrolling reader sees, because the manifest says the tiles are slices of one full-page render.
- **F23** — the arcs encode removed/added share by angular extent, not by thickness, and the card
  gives one fraction and one percentage.
- **F25** — "every chart" is one chart: the arc stage at 50% carries a legend and no source or caveat
  line.
- **F26** — the Phase 1 "27 of 59 lazy `<img>`" figure is not in this manifest, whose DOM sample was
  taken on the story page (`imgCount` 2, `imgLazyCount` 0); the visible slot-keeps-its-box behaviour
  stands on its own.
- **F28** — `SHOP OUR SWAG` is an in-grid merch cell (`index-1440-tile-06`), not a floating tab
  overlapping the grid.
- **F30** — "a reader cannot reach a conclusion" overstates it: there is no jump link, so the
  conclusion is reachable only by continuous scrolling. The 37-screen and 18,000-character figures are
  manifest `domEvidence`, not pixel observations.
- **F31** — 7.17:1 recomputes exactly from the manifest's `bodyColor` and `bodyBackgroundColor` and is
  kept; "the lowest body contrast of the ten sites" is not checkable from this site and was dropped.
- **F34** — both disclosure blocks are captured open, so the collapsed state and the `+` affordance
  are inferred; only the mechanism is observed.
- **F35** — no *labelled* absence appears, but blank regions and untitled colour blocks do; absence
  here is silent rather than handled.
