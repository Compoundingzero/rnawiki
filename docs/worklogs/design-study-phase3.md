# Design study — Phase 3 visual findings and the revised Phase 2 table (delivery 1, 2026-09-04)

The full, checked record behind delivery 1. Written by one synthesizer from the verified findings
files, then corrected in place by an independent checker whose record closes the file. The RESUME
block and the decisions live in `design-system.md`; this file is the evidence.

Written from the verified findings files in `data/design-study/findings/` only. Every claim carries a
finding id and a capture file. Nothing here was fetched; nothing was re-viewed. Where a number came
from a DOM probe or the Phase 1 measurer rather than from an image, the finding said so and this
draft repeats that.

Sites covered: six reference sites that rendered (stripe.com/docs, vercel.com/docs,
linear.app/method, smashingmagazine.com, pudding.cool, atlasobscura.com), our own baseline
(rnawiki.com), and the nine community sites (openhumans.org, biohackrxiv on osf.io,
wiki.biohack.me, Longevity Wiki, forum.quantifiedself.com, longecity.org, experiment.com,
zenodo.org — live record plus the first pass's tombstone — and sphere.diybio.org).

Four references were never seen: wikiwand.com (Cloudflare challenge did not clear in a real
Chrome; stopping rule fired) and quantamagazine.org, theverge.com and awwwards.com (terms forbid
saving a reproduction). Nothing in this draft describes them.

**How to read a citation.** "[site Fn: capture.png]" names the verified finding and the capture
file it rests on; the file is in `data/design-study/captures/<site>/`. Ids beginning F or V are in
that site's `findings[]` array. Ids beginning B or A are borrow/avoid items: for atlasobscura.com
and zenodo.org they are in `findings[]`; for biohackrxiv they are in that file's
`forRnawiki.borrow[].id` and `forRnawiki.avoid[].id` instead.

**LongeCity, stated plainly.** Its content capture is the site's 404 page for a guessed forum URL.
The live Supplements forum never answered two 60-second browser loads or a 90-second plain request
on 2026-09-04, so only its index page was observed and the first pass stands. Every LongeCity claim
below is about the index or the error page. Nothing here describes how a LongeCity thread or post
presents data, because that page was never served [longecity F25: content-1440-tile-01.png].

---

## Phase 3 — visual findings (A1: the references we could render)

### 1. Visual hierarchy

**Stripe** builds its guide index ladder from size and weight on one near-black ink — title,
subtitle, section heading — but the last step is not a size step at all: card titles are carried in
link blue at ordinary size [stripe F4: index-1440-full.png]. On the API reference the heading ladder
does no work: "Charges" and "The Charge object" render at the same size and weight, so a section and
the object it documents rank equally, and what separates one block from the next is a full-width
hairline and a shared left edge; both are, however, about twice the size of the bold monospace field
names [stripe F6: content-1440-full.png]. The real hierarchy is inside the row — bold monospace
name, small grey type on the same line, prose description below, all in a narrow size range
[stripe F7: content-1440-full.png]. Underneath the visible structure the outline is flat: eight `h1`
elements and no `h2` anywhere [stripe V3: content-1440-full.png].

**Vercel** is a two-step drop with no middle: one very large `h1` on a 5,122 px page and then
everything else at one of two small sizes [vercel F1: index-1440-tile-01.png]. Inside the article
the missing middle is supplied by space and weight — an `h2` at roughly twice body size with about
45 px of clear space above and 15–20 px below, and an `h3` bold at body size
[vercel F2: content-1440-tile-04.png]. Colour does almost no hierarchical work: standfirsts,
captions, dates and rail labels are all the same lighter grey
[vercel F4: content-1440-tile-01.png].

**Linear** separates headings from prose by weight and tone plus a modest size step — about 1.25×
body cap-height, semibold against regular — with a large band above each heading and a small one
below it [linear F1: content-1440-tile-01.png]. Its one hierarchy failure is instructive: at 1440 px
a group heading and a member heading are told apart only by the space above them, and entering the
page mid-scroll destroys the distinction [linear F2: content-1440-tile-02.png]. The same site fixes
it at 375 px, where the `h2` is about 30 percent taller than the `h3` beneath it
[linear V1: content-375-tile-01.png]. A serif face is used exactly twice on the whole site, both
times as a page-start marker [linear F3: content-1440-tile-01.png].

**Smashing** carries its ladder on two axes — a typeface switch and a width change — with colour
appearing only in small labels, never as a level [smashing F1: content-1440-tile-01.png]. Inside the
prose the ladder alternates typefaces rather than sizes: serif section heading, heavy-sans
sub-heading, serif body [smashing F2: content-1440-tile-02.png]. Emphasis is bold-in-place; no term
is ever pulled into a box [smashing F4: content-1440-tile-02.png]. The home page ladder is three
deep and then flattens into a uniform list [smashing F3: index-1440-tile-01.png].

**Pudding** builds four visible ranks in the story with no rules, no bold and no accent colour —
but not in one grey: the fourth rank, the chart's reading line, switches to a smaller sans in a
visibly lighter grey than the body [pudding F3: content-1440-tile-08.png]. The chart's title is
written as a claim and its reading instruction as a sentence, both set above the graphic, so the
picture ranks last even though it takes most of the height
[pudding F4: content-1440-tile-08.png].

**Atlas Obscura** builds a three-step content hierarchy from size and centring alone, with no colour
used to rank [atlas F1: content-1440-tile-01.png]. On the home page the top level is a photograph
and the orderly type ladder beside it loses [atlas F2: index-1440-tile-01.png]. Its one reusable
device is a 10–11 px letterspaced category kicker sitting tight above every card title, classifying
the item before the title is read [atlas F4: content-1440-scroll-50.png].

**What it means for RNAWiki.** Four of the six rendered references put the middle of their ladder in
space and weight rather than in size, and the two that rely on size alone are the two with the least
to organise. That is directly usable, because our own dossier has one heading rank below the title
and reaches for coloured boxes to invent more [rnawiki F43: content-1440-tile-01.png]. The rule to
take is Linear's, corrected by Linear itself: hierarchy by asymmetric space and tone, but carrying
the visible group/member size step that Linear only applies at 375 px to every width, because a
dossier reader arrives at an anchor as often as at the top [linear V1: content-375-tile-01.png].
Atlas's kicker is the one colour-free way observed to say "this is a mouse result" before the
sentence is read [atlas B3: index-1440-tile-03.png]. And Stripe's flat outline is the warning: the
structure a sighted reader sees in rules and rhythm must also exist in the document outline, because
our public pages are required to keep a logical heading order [stripe V3: content-1440-full.png].

### 2. Where the eye lands first

Three of the six land the eye on content and three on chrome.

**Content first.** Stripe's guide index puts the `h1` first; its search box is second but recedes
because it is one of three outlined pills in a pale header band
[stripe F8: index-1440-full.png]. On the API reference the eye goes to the `h1` and then straight to
the six-row endpoint list, while the twenty-link navigation tree reads as texture
[stripe F9: content-1440-full.png]. Vercel's index and article both put the `h1` first, with only a
tabbed terminal card competing beside it [vercel F5: index-1440-tile-01.png;
vercel F8: content-1440-tile-01.png]. Linear's index sends the eye to a large centred serif headline
with roughly 130 px of empty page above it [linear F5: index-1440-tile-01.png], and its chapter page
to the chapter title, with the breadcrumb above deliberately too quiet to catch first
[linear F6: content-1440-tile-01.png].

**Chrome first.** Smashing's first desktop fixation is a saturated red band filling the top ~105 px
edge to edge, with a pink chip row for another ~65 px — together the highest colour contrast on
screen while the content below is black on white [smashing F5: index-1440-tile-01.png]. Pudding's
index sends the eye to a centred wordmark; its "Find a story…" field is a hairline-outlined box
about 168 px wide, physically wider than any single sticker button but the quietest object on its
row [pudding F5: index-1440-tile-01.png]. Atlas's home page lands the eye on the Place of the Day
photograph — about 53 percent of viewport width and the only saturated colour on the screen — while
the search bar is a 456 px outlined pill with no fill [atlas F5: index-1440-tile-01.png].

**Mobile changes the answer.** Stripe's chrome shrinks to one thin row and content wins outright
[stripe F10: index-375-tile-01.png], and Vercel's header shrinks to five marks
[vercel F7: index-375-tile-01.png]. Smashing's red band actually grows to ~155 px at 375 px while
the fourteen-item nav collapses into a "Menu" button, and the search input becomes a full-width
white pill inside that band — the only white object in a red field, though a logo and the Menu
button sit above it and a chip row below [smashing F6: index-375-tile-01.png]. Atlas puts two filled
action pills above both its search bar and its article title, pushing the mobile content title to
about 40 percent down the screen [atlas F6: index-375-tile-01.png;
atlas F7: content-375-scroll-00.png]. Linear inverts at depth rather than at width: on a scrolled
mobile reading screen the sign-up pill is the highest-contrast object because nothing else is
filled, though on the index first screen the serif headline still outweighs it
[linear F7: content-375-scroll-50.png].

The findings are careful about what a still can prove. Atlas's original "the search bar is the
fourth thing seen" was cut in verification, because a still capture can show what dominates by area
and saturation but cannot establish reading order past the first landing
[atlas F5: index-1440-tile-01.png].

**What it means for RNAWiki.** The home search bar is frozen, and these captures are the argument
for why. Every site whose first fixation is chrome achieves it the same way: a saturated band, a
photograph, or a filled account button placed above or beside the field. Our rendered home page does
the opposite — the search bar is the only element on the first screen drawn with the saturated
accent blue, with every other bordered object either neutral grey or a much paler blue tint, and the
Feedback pill parked clear of it
[rnawiki F28: index-1440-tile-01.png]. That is the state to protect, not to improve.

### 3. Information density

**Stripe** is the densest legible page in the set: eight distinct groups on one 1440×900 screen —
about 24 nav links, a version selector, a paragraph, a helpfulness prompt, a two-tab switch, six
endpoint rows, two attribute rows and a JSON sample — and it stays readable because almost every
group is separated by a hairline or a change of column, with the code sample the one boxed exception
[stripe F12: content-1440-full.png]. Its lists are hairline-separated rows with no borders, no
zebra and no cell boxes, and one row shape is reused for two different kinds of content on one page
[stripe F13: content-1440-full.png]. Density rises with the reader's commitment: described cards at
the top, bare grouped link lists at the bottom [stripe F15: index-375-tile-04.png]. The warning
travels with it: visual density is not delivery density, and this page measures 0.83 percent visible
text to delivered HTML [stripe F16: content-1440-full.png].

**Vercel** puts three columns on screen at 1440 — a 300 px section rail, an 824 px prose column and
a 240 px contents rail — consuming 1,364 px of 1,440 and leaving about 50 px of gutter, with roughly
forty link targets against two sentences of prose on the first screen
[vercel F9: content-1440-scroll-00.png]. Its one table-shaped block is a date column plus a content
column separated by full-width hairlines, with no cell borders, no zebra and no header row
[vercel F11: index-1440-tile-02.png], and it reflows honestly at 375 px — date on its own line above
the title, summary clamped to two lines, and the date is never what gets dropped
[vercel F12: index-375-tile-04.png]. Mobile is the weak point: the 5,122 px desktop index becomes
9,664 px at 375 px, so a whole screen holds four or five records
[vercel F13: index-375-tile-05.png].

**Linear** is the sparsest: one repeating unit — one `h3` plus one paragraph — twenty times over,
with no lists, tables, callouts, quotes, code, rules or cards anywhere in the column
[linear F9: content-1440-tile-04.png]. Its only list is handled as label-value rows, eleven of them
in about 400 px with no borders, striping or column headers
[linear F10: index-1440-tile-02.png].

**Smashing** holds three to four paragraphs per desktop screen — about 230 words in one 900 px tile
— with the right third empty, so the low density is made by margin rather than by short paragraphs
[smashing F8: content-1440-tile-02.png]. No table appears in any capture opened; structured
comparison is drawn as an image and captioned [smashing F9: content-1440-tile-03.png]. Lists are set
at prose density: red marker, bold lead-in term, colon, explanation at full paragraph leading
[smashing F10: content-1440-tile-17.png].

**Pudding** splits: the index is the dense surface and holds density constant at three cards per row
with exactly five fields each and nothing else, for about 7.5 screens
[pudding F9: index-1440-tile-05.png]; the story's reading column is extremely low density — about 46
words in two paragraphs inside a ~650 px column — though the first screen as a whole carries about
90 words once the scattered margin words are counted [pudding F10: content-1440-tile-01.png]. Where
density arrives it is a chart, not a table: a unit chart of several thousand squares in five
part-of-speech columns [pudding F11: content-1440-scroll-90.png].

**Atlas** has a genuine long-form measure — about 646 px at 72–82 characters — wrapped around four
short paragraphs occupying about 700 px of a 4,673 px page
[atlas F9: content-1440-tile-02.png]. Recommendation and promotion take about 57 percent of the
desktop page's height and about 85 percent of the mobile page's, and the mobile page's exact
midpoint shows six video cards and no article text at all
[atlas F10: content-375-scroll-50.png]. Its two best dense regions are a destinations rail with a
thumbnail, kicker, name and a two-cell labelled stat table at a 169 px row pitch
[atlas F11: index-1440-tile-03.png], and a plain columned link table fitting 36 navigation targets
into about 310 px with no thumbnails [atlas F12: index-1440-tile-07.png; atlas B2: index-1440-tile-07.png].

**What it means for RNAWiki.** The measured lesson is that density is bought with separation, not
with tightness: Stripe fits eight groups on a screen using hairlines and column changes
[stripe F12: content-1440-full.png], and Atlas fits 36 targets into 310 px using a heading, a rule
and text links [atlas F12: index-1440-tile-07.png; atlas B2: index-1440-tile-07.png]. Both are the opposite of a card. Our dossier
currently carries about 65 words of medicine-specific text inside a card about 490 px tall
[rnawiki F10: content-1440-tile-01.png] and has no list and no table anywhere on the rendered page
[rnawiki F11: content-1440-tile-02.png]. The hairline row is the single most transferable thing in
the whole A1 pass, because it scales from six rows to sixty without changing weight
[stripe F39: content-1440-full.png]. The delivery warning must travel with it: Stripe's look sits on
a 0.83 percent text-to-HTML profile against a corpus figure that must rise
[stripe F51: content-1440-full.png].

### 4. Whitespace

All six spend space above a heading and withhold it below, so a gap reads as a section boundary
rather than as padding: Stripe [stripe F17: index-1440-full.png], Vercel at about 45 px above and
15–20 below [vercel F14: content-1440-tile-04.png], Linear as a large band above and a small gap
below [linear F12: content-1440-tile-01.png], Smashing at roughly 90 px above and about 25 below
against a 33.5 px line height [smashing F13: content-1440-tile-02.png], and Pudding at roughly three
and a half body line-heights above the `h2` and about one below
[pudding F13: content-1440-tile-08.png]. Atlas states the same rhythm at section level: loose before
a kicker, tight between kicker and heading [atlas F15: index-1440-tile-02.png].

Where they differ is what the *big* empty areas mean. Stripe leaves an asymmetric outer gutter empty
and stretches nothing to the viewport [stripe F19: index-1440-full.png]. Linear leaves just under
half the desktop screen as intentional margin with no rail, notes, figures or share controls in it
[linear F11: content-1440-tile-01.png]. Atlas spends more than half its width on empty margins to
hold an 80-character measure, and the findings call that its best decision
[atlas F14: content-1440-tile-01.png]. Against those, three sites have empty regions that say
nothing: Vercel's contents rail column is roughly half empty below its last item at every scroll
depth and its ~50 px gutter is dead [vercel F16: content-1440-scroll-90.png], and both its pages end
with a hairline and roughly 700 px of plain background
[vercel F17: content-1440-tile-09.png]; Smashing's right column below the last rail card is about
480 px of blank including its gutter [smashing F12: content-1440-tile-11.png]; and Atlas holds open
at least three hairline-bounded strips of about 110 px each, labelled ADVERTISEMENT, for roughly
330 px of reserved empty space that announces itself [atlas F16: index-1440-tile-02.png].

Pudding is the special case: its story's long blank bands cannot be read as composed whitespace at
all, because the same regions are the graphic stages that do not paint in a static full-page render
[pudding F14: content-1440-tile-02.png]. Its genuinely deliberate use of space is inverted — the
margins carry the data, with scattered grey words surrounding and overrunning the reading column
while the two-sentence centre block is the only area kept clear
[pudding F16: content-1440-tile-01.png] — and on its index, empty grid cells are treated as
placeable slots holding a staff note or the newsletter form rather than as gaps
[pudding F15: index-1440-tile-05.png].

**What it means for RNAWiki.** Two magnitudes of space doing two jobs is the pattern to copy —
tight inside a data row to say "these belong together", wide between sections to say "this has
ended" [stripe F18: content-1440-full.png]. The anti-pattern is ours already: our dossier spends
whitespace outside the content and withholds it inside, with about 130 px of margin each side of an
1,180 px article and roughly 150 px of empty ground before the footer
[rnawiki F14: content-1440-full.png], and it uses card whitespace to hide thin data — a full-width
card whose text ends near x=660 with its button pushed to x=1060, leaving about 400 px of nothing
between a paragraph and its own button [rnawiki F15: content-1440-tile-02.png]. Atlas's mobile
failure is the other boundary: 10 px prose margins at 375 px while the cards below keep their
gutters [atlas F17: content-375-tile-03.png].

### 5. Long scroll

**Stripe's long scroll was not observed and is not described.** All five `content-1440` files share
one sha256 and all five `content-375` files another, and the declared full-page heights equal the
viewport heights [stripe F1: content-1440-scroll-50.png]. Verification found the cause and it is
structural rather than a tooling slip: the Phase 1 measured record for the same URL shows the
article scrolling inside `<main>` rather than in the window, so scrolling the window moved nothing
[stripe V1: content-1440-full.png]. What the DOM does say is that the page is built to pin
per-section panels — eight `ApiSection-Aside` elements at position sticky — rather than one global
rail [stripe F22: content-1440-full.png]. The one real long capture in the set, the mobile guide
index at 3,911 px, shows a regular rhythm: heavy section heading then a stack of cards, four times,
before changing gear once [stripe F24: index-375-full.png], and it ends quietly with a helpfulness
question, five support links and locale controls — no newsletter, no promotional block, no repeated
navigation dump [stripe F25: index-375-tile-05.png].

**Vercel is the only reference where a contents rail was seen working.** At 1440 px three things
persist for the whole article — the 64 px header, the 300 px left section rail and the 240 px
contents rail — and near the page end both rails shift up rather than staying pinned, which is
ordinary sticky behaviour at the end of a container
[vercel F18: content-1440-scroll-90.png]. The rail tracks reading position with a left bar and
darker text on the active entry, and it is the page's only progress signal
[vercel F19: content-1440-scroll-50.png]. Both of its failure modes are visible and therefore
designable around: the marker lags two headings behind the visible content at 90 percent
[vercel F20: content-1440-scroll-90.png], and long entries truncate to an ellipsis at 240 px, so the
least identifiable label is the longest one
[vercel F21: content-1440-scroll-50.png]. At 375 px nothing persists but the header on a 9,609 px
article, and the contents control scrolls away and never returns
[vercel F23: content-375-scroll-50.png]. Two distinct active-state grammars sit on the same screen —
a filled grey pill for "which page you are in" in the sibling rail, a short left bar and darker text
for "which section you are reading" in the contents rail — which is why the page can carry two rails
without either being mistaken for the other [vercel V1: content-1440-scroll-00.png].

**Linear, Smashing and Pudding persist almost nothing.** Linear pins exactly one element through a
5,104 px scroll — the fixed header — and gives the reader no positional feedback of any kind
[linear F14: content-1440-scroll-50.png]; that header is translucent, and ghost text from the
paragraph beneath is legible inside the band at 50 and 90 percent depth
[linear F15: content-1440-scroll-90.png]. Smashing persists nothing at all at either width on a
15,700 px article: the top edge of all four scrolled viewport captures is running prose or a figure,
so the reader has no route back to navigation or search without scrolling to the top
[smashing F16: content-1440-scroll-50.png]. Pudding's single piece of persistent chrome is a small
"+ WORD LISTS" control at the right edge, and it is absent at 0 percent and present at 50 and 90 —
persistent through the body of the page but not offered at the top
[pudding F17: content-1440-scroll-50.png]; at 375 px the same control becomes a pill floating over
the text and hides list items beneath it [pudding V2: content-375-scroll-90.png].

**Atlas keeps the least that is still useful.** Desktop scroll replaces the full navigation with a
slim ~48 px strip carrying only the mark and the article title, identical at 50 and 90 percent, with
no rail and no progress indicator [atlas F18: content-1440-scroll-50.png]. Its cost is that three of
the strip's four share icons are brand-coloured filled tiles and are the most saturated pixels on
screen at both depths, on a page whose palette is otherwise brown, tan and white
[atlas F19: content-1440-scroll-90.png]. And the scope path does not survive: the breadcrumb naming
where the article sits appears once above the `h1` and the persistent strip carries the title
without the path [atlas V3: content-1440-tile-01.png]. On mobile nothing persists during a
15,358 px scroll [atlas F20: content-375-scroll-50.png].

**How each page ends.** Linear ends where the text ends: one forward link that states the
destination's ordinal before its name, then the footer, with no closing pitch or related grid
[linear F17: content-1440-tile-05.png; linear V3: content-1440-tile-05.png]. Vercel ends with a
pager, a feedback pill, a hairline and then nothing
[vercel F22: content-1440-tile-08.png]. Smashing's article body ends quietly — bullets, closing
paragraph, editor initials, an "Explore more on" line and three topic chips — and is then followed
by an unfilled supporters band; the DOM records a comments section below the captured page, so this
describes the capture [smashing F19: content-1440-tile-18.png]. Pudding lands in three stages marked
by ground colour: a Methods & Notes region on pale olive with collapsible blocks and numbered
footnotes carrying return arrows, then a white promotional band, then the footer
[pudding F21: content-1440-tile-37.png]; its index instead fades its final row of cards to
transparent under a LOAD MORE button, and the faded cards lose their titles entirely
[pudding F22: index-1440-tile-07.png]. Atlas ends with ten sponsored links under a heading identical
in size and weight to the editorial section above it
[atlas F22: content-1440-tile-04.png].

**What it means for RNAWiki.** Vercel's rail is the only rail in the A1 set that was watched
working, and it is the concrete candidate for the surface Phase 2 left unassigned — with its two
observed defects designed out (wrap rail labels to two lines instead of truncating; do not let the
marker go stale; keep a contents control at 375 px)
[vercel F40: content-1440-scroll-50.png; vercel F45: content-1440-scroll-50.png;
vercel F46: content-375-scroll-90.png]. Atlas's 48 px strip is the minimum viable orientation for a
long dossier, but the findings say plainly that it is not a contents rail and does not substitute
for one [atlas B4: content-1440-scroll-50.png]. Our own page has no long scroll to judge — the
dossier is two screens tall, 1,844 px at 1440 px — so the rail is a target rather than a repair
[rnawiki F18: content-1440-full.png].

### 6. Imagery

**Two references carry no imagery and lose nothing by it.** Stripe's API reference has `imgCount` 0
and its only meaning-bearing non-text element is the JSON sample, which restates the field list in
the form the reader will receive [stripe F26: content-1440-full.png]. Linear's chapter page has zero
images across 5,104 px desktop and 6,419 px mobile and substitutes nothing — no icons beside
headings, no rules, no numbered badges [linear F18: content-1440-tile-04.png].

**Two carry decorative imagery that costs them.** Stripe's one guide-index picture is a checkout
screenshot, illegible at its rendered size and cut off part-way down by the section rule that closes
its own section; the mobile page drops it entirely and is not worse
[stripe F27: index-1440-full.png; stripe F28: index-375-full.png]. Linear's single graphic is two
large dotted circles with a hatched overlap — unlabelled, no caption, no legend, no axis, no numbers
— and at 375 px it is cropped by the viewport with no loss of meaning
[linear F19: index-1440-full.png].

**Two make imagery load-bearing, and do it differently.** Smashing's figures are comparisons the
prose depends on, labelled inside the image (I–IV, "A –" / "B –") and captioned with what they show
rather than with a repeat of the sentence above
[smashing F20: content-1440-tile-03.png]; the treatment is not uniform, since two dashboard figures
sit on a grey plate 798 px wide against a ~690 px text box while the Anscombe figure is unplated and
narrower than the measure [smashing F14: content-1440-scroll-50.png]. Pudding goes further: the
graphics carry the quantities and the prose does not restate them — the text card gives example
words, one fraction and one percentage and never states the arc magnitudes it sits on top of
[pudding F23: content-1440-scroll-50.png]. Its transferable move is a single colour key taught once
in the sentence and reused in every graphic and legend
[pudding F24: content-1440-scroll-90.png], and on one chart it puts the provenance and the caveat in
the same frame, under the picture — though only on one, since the arc stage at 50 percent shows a
legend and no source line [pudding F25: content-1440-scroll-90.png].

**Vercel is the middle case and supplies both the discipline and the trap.** Its only load-bearing
images are product screenshots handled as figures — bordered rounded frame at column width, grey
caption centred beneath, naming the exact state shown and claiming nothing beyond it
[vercel F25: content-1440-scroll-50.png] — while everything that looks like imagery is a 1 px line
icon identifying rather than explaining [vercel F24: index-1440-tile-02.png]. The trap is that every
figure is bound to the same 824 px measure with no break-out rule, so an application screenshot is
scaled until its own interface text sits at roughly 9–10 px
[vercel V3: content-1440-tile-05.png].

**Atlas** has exactly one image that carries meaning — the interactive map, whose numbered cluster
pins are the article's evidence, placed between the claim and the prose that explains it
[atlas F23: content-1440-tile-01.png] — and one reusable mechanic: the card image box is the same
size and position whether the photograph has arrived or not, so nothing reflows
[atlas F25: content-1440-tile-03.png].

**What it means for RNAWiki.** Our medicine pages have no images at all, and the one genuinely
diagrammatic thing on them — "How the medicine is expected to work" — has no visual form on the
rendered page whatsoever [rnawiki F23: content-1440-full.png; rnawiki F24: content-1440-tile-02.png].
The A1 references say a reference page needs no pictures [stripe F45: content-1440-full.png], and
that when a picture is used it must carry a stated fact and a caption that names exactly what is in
the frame [vercel F41: content-1440-scroll-50.png; smashing F33: content-1440-scroll-50.png]. The
break-out rule Vercel lacks has to be designed in before a mechanism diagram or a trial figure is
placed inside a reading column [vercel V3: content-1440-tile-05.png].

### 7. Whether the design defers to content or competes with it

**Vercel and Linear defer hardest inside the reading surface and compete only at the top.** Vercel's
article is close to unstyled reading — hairlines only, no coloured callouts, no boxes around
paragraphs, two ink levels, one measure [vercel F28: content-1440-tile-02.png] — but a filled
near-black button, an outlined button and a tabbed terminal push the first prose sentence about
650 px down the page [vercel F29: content-1440-tile-01.png], and Ask AI, Log In and Sign Up hold the
top-right corner at every desktop scroll depth including 90 percent down a reference article
[vercel F31: content-1440-scroll-90.png]. Linear's reading page is one accent face used twice, a
short grey ladder, no borders except the end card, no tints, no images and half the screen empty
[linear F20: content-1440-scroll-50.png]; it competes in exactly two places — the ever-present
sign-up pill, which is the highest-contrast object on a scrolled mobile reading screen because
nothing else is filled, and an index whose eleven chapter links begin about 1,086 px down
[linear F21: content-375-scroll-50.png].

**Stripe defers in the prose column and competes in the chrome.** Nothing in the API page's prose
draws attention except the words; the exception is the code sample and the method words beside the
endpoint rows — green POST, blue GET and the multi-coloured JSON syntax are the only saturated
colour on screen
[stripe F29: content-1440-full.png]. The chrome competes in three places: a two-bar desktop header
taking roughly the top eighth of the screen, an "Ask AI" control placed beside search at equal
weight, and a fixed 48 px bottom bar [stripe F30: index-1440-full.png; stripe F23: content-1440-full.png]. Its quiet per-section
utility row is well judged once and becomes the page's most repeated text when it recurs at every
section — `copyControls` counts eight, all labelled "Copy for LLM"
[stripe F31: content-1440-full.png].

**Smashing and Pudding both compete, but Pudding does it only on the index.** Smashing's reading
column defers between its commercial breaks, but the flow is not free of cards, tints, icons or
coloured links: a tinted workshops panel with a green gradient button at the full measure, a tilted
red pull-quote tile with a Twitter bird appended to the sentence, blue in-prose links, grey figure
plates [smashing F23: content-1440-tile-05.png; smashing F24: content-1440-tile-05.png]. Its worst
structural decision is the right rail, which mixes editorial provenance with paid promotion in one
column — author portrait and "About the author", then a newsletter capture form, then a teal
advertisement, then a purple video-course promo, then two empty promo boxes, with nothing separating
them [smashing V3: content-1440-tile-03.png]. Pudding's index competes on purpose — hand-drawn
wordmark, sticker buttons, six drawn filter chips and a merch cell in the grid
[pudding F28: index-1440-tile-01.png] — while its story defers almost entirely, with headings and
captions sharing the body colour and one small edge control
[pudding F29: content-1440-tile-08.png]. The story competes only with itself, on length: a
33,581 px document carrying 18,131 characters with no contents list and no jump link at any depth
[pudding F30: content-1440-full.png]. Its measured weak point is contrast — grey serif rgb(87,87,87)
on cream rgb(255,255,241), 7.17:1 by the manifest's own colours, with the heading in the same grey
and the chart caption lighter still [pudding F31: content-1440-tile-08.png].

**Atlas's type system defers and its page composition does not.** Two families, no gradients, no
visible motion [atlas F26: content-1440-tile-01.png] — but four paragraphs of article are followed
by six separate asks, with a seventh already inside the byline row
[atlas F27: content-1440-full.png]. The disqualifying one for a health-evidence site is that
editorial and paid provenance are visually interchangeable: "BY ATLAS OBSCURA" and "SPONSORED BY
VISIT SUN VALLEY" occupy the same slot in the same 10 px letterspaced grey caps, with no rule, tint
or icon between them [atlas F28: index-1440-tile-03.png].

**What it means for RNAWiki.** The pattern across all six is that deference is a property of the
reading column and competition is a property of the chrome, and every site that hurt itself did so
by letting an account control, an assistant offer or a paid placement into the reading position.
Two of those failures map directly onto boundaries we already hold: a sidebar that carries record
provenance must never share a column with anything solicited, because a reader who learns the column
is promotional stops reading the provenance in it
[smashing V3: content-1440-tile-01.png]; and provenance signalled by one word in identical type is
not a provenance signal at all [atlas A3: index-1440-tile-03.png]. Our own failure is different in
kind and worse in a specific way: an interface control — the solid blue "See how we know" pill — is
the visual climax of our evidence page [rnawiki F27: content-1440-tile-02.png], and the strongest
colour signal on the page, an amber warning callout, is attached to its weakest prose
[rnawiki F40: content-1440-tile-01.png].

### Inferred behaviours

Every behaviour a finding marked `inferred`, with the DOM key that supports it. Nothing below was
seen happening; each is a reading of a DOM probe or a Phase 1 record, and the findings label them as
such.

**Reference sites (A1).**

- Stripe pins per-section panels rather than one global rail — eight `ApiSection-Aside` elements at
  position sticky, tops 139 to 11347.4 px, one per endpoint group [`stickyOrFixed`]
  [stripe F22: content-1440-full.png].
- Stripe's fixed 48 px "Developers" bar holds the bottom of both desktop pages; because the scroll
  captures did not scroll, that it *stays put while reading* is taken from the DOM, not seen
  [`stickyOrFixed`] [stripe F23: content-1440-full.png].
- Stripe's per-section utility row is the page's most repeated text — eight controls all labelled
  "Copy for LLM" [`copyControls`] [stripe F31: content-1440-full.png; stripe F46:
  content-1440-full.png].
- Stripe's API reference is theme-switchable and was captured light, contradicting the Phase 2
  light-only note [`prefersColorScheme`, `htmlAttributes`] [stripe F32: content-1440-full.png].
- Stripe's header search carries a `/` chip; whether it opens an inline dropdown or a full-screen
  palette is unobserved [`kbdTexts`, `ariaKeyshortcuts`, `searchAffordances`]
  [stripe F33: index-1440-full.png].
- Stripe collapses the rare behind an expander, and labels a stale record in place rather than
  removing it — both read from `headingOutline` ("More attributes Expand all", "Create a charge
  Deprecated"), neither visible in any capture [stripe F34: content-1440-full.png;
  stripe F35: content-1440-full.png].
- Stripe's article scrolls inside `<main>` rather than the window, which is why the scroll captures
  could not move; provenance is the Phase 1 measured record, explicitly not a visual observation
  [stripe V1: content-1440-full.png].
- Vercel's search is a palette behind a "Search Docs" button with a ⌘K hint; no capture shows the
  overlay [`kbdTexts`, `searchAffordances`] [vercel F5: index-1440-tile-01.png;
  vercel F6: content-1440-scroll-00.png].
- Vercel's three persisting columns and the end-of-container shift are read partly from position
  data; `stickyOrFixed` records position, top and height only, not overflow, so no internal scroll
  container is claimed [`stickyOrFixed`] [vercel F18: content-1440-scroll-90.png].
- Vercel's contents rail tracks reading position [`scriptTokens`]
  [vercel F19: content-1440-scroll-50.png].
- Vercel's collapsed "Related Vercel documentation" strip hides a full inbound/outbound citation map
  — "This page links to (17)", "Pages that link here (32)" — and no capture shows it open, so its
  internal design cannot be judged [`headingOutline`] [vercel F33: content-1440-tile-08.png].
- Vercel applies dark by class rather than by OS media query, so the captures neither confirm nor
  deny the mirrored ramp [`htmlAttributes`, `prefersColorScheme`]
  [vercel F35: content-1440-scroll-00.png].
- Vercel treats copy as a first-class control at the top of the article while in-article code cards
  show none at rest; a static capture cannot show hover, so no hover behaviour is claimed
  [`copyControls`] [vercel F36: content-1440-tile-03.png].
- Linear's fixed header is translucent [`stickyOrFixed`, `scriptTokens`]
  [linear F15: content-1440-scroll-90.png].
- Linear evidences no search field, palette, shortcut hint, copy button or theme control anywhere —
  but 45 of 83 stylesheets were unreadable and the 375 px hamburger is never opened, so this is an
  absence of recorded evidence rather than proof [`searchAffordances`, `copyControls`, `kbdTexts`,
  `ariaKeyshortcuts`, `scriptTokens`, `htmlAttributes`, `prefersColorScheme`]
  [linear F26: content-1440-scroll-00.png; linear F35: content-1440-scroll-00.png].
- Smashing's two positioned elements sit at 15,982 px and 17,031 px, past the end of the 15,700 px
  captured document, and appear in no image; what the captures support is only that neither is on
  screen at 0, 50 or 90 percent [`stickyOrFixed`] [smashing F17: content-1440-scroll-50.png].
- Smashing offers no in-page navigation in any capture; the page-length and heading-count figures
  behind that are recorded values, and the outline undercounts the visible sub-headings
  [`headingOutline`, `headingCount`] [smashing F25: content-1440-scroll-50.png;
  smashing F37: content-1440-scroll-50.png].
- Smashing has no copy control, no keyboard hint and no visible theme control; `scriptTokens`
  reports `metaKey` and `keyCode` in inline script, which is not evidence of a palette and none is
  claimed [`copyControls`, `kbdTexts`, `ariaKeyshortcuts`, `prefersColorScheme`, `htmlAttributes`,
  `scriptTokens`, `searchAffordances`] [smashing F26: content-1440-scroll-00.png].
- Pudding's edge control opens a panel — inferred from a fixed `aside.explorer` and
  `button.explorer-fab` [`stickyOrFixed`] [pudding F17: content-1440-scroll-50.png].
- Pudding's pinning is scroll-driven, but no library can be named because `scriptTokens` reports
  IntersectionObserver and scrollama as "unknown"; the manifest records six sticky/fixed stage
  elements at four document offsets, not five stages [`stickyOrFixed`, `scriptTokens`]
  [pudding F19: content-1440-scroll-50.png].
- Atlas supports keyboard panning and zooming on the map; no command palette is claimed anywhere
  [`kbdTexts`, `ariaKeyshortcuts`] [atlas F35: content-1440-tile-02.png].
- Atlas has exactly one copy control, presumably inside the SHARE menu; nothing so labelled is
  visible [`copyControls`] [atlas F36: content-1440-tile-01.png].
- Atlas's recorded fixed layer is almost entirely dormant — 20 of 23 entries measure height 0 — and
  the visible 48 px article bar cannot be matched to any of them [`stickyOrFixed`]
  [atlas F37: content-1440-scroll-50.png].
- Atlas is light-only; the dark bands are section grounds, not a theme
  [`prefersColorScheme`, `htmlAttributes`] [atlas F38: index-1440-tile-07.png]. Its search is a real
  inline input, not a palette [`searchAffordances`] [atlas F39: index-1440-tile-01.png].
- Atlas's recommendation-heavy shape is supported by `imgCount` 513, `imgLazyCount` 0 and
  `textToHtmlRatio` 0.0015, all declared as DOM values rather than observations
  [`imgCount`, `imgLazyCount`, `textToHtmlRatio`] [atlas A6: content-375-scroll-50.png].

**Our own baseline.**

- Two elements are position-fixed or sticky and persist through the whole scroll; the persistence
  itself is directly visible [`stickyOrFixed`] [rnawiki F34: content-1440-scroll-50.png].
- There is no command palette and no keyboard hint; the two passes disagree on `scriptTokens.metaKey`
  and neither supports a palette claim [`kbdTexts`, `ariaKeyshortcuts`, `scriptTokens`,
  `searchAffordances`] [rnawiki F35: content-1440-scroll-00.png].
- There is no theme toggle and no dark mode [`prefersColorScheme`, `htmlAttributes`]
  [rnawiki F36: index-1440-full.png].
- Copy controls are unresolved between the two passes and nothing is claimed about them — the
  capture manifest records 0 while the earlier measurer recorded two [`copyControls`]
  [rnawiki F37: content-1440-tile-01.png].

**Community sites (A2).**

- Open Humans is light-only with no theme control [`prefersColorScheme`, `htmlAttributes`]
  [openhumans F26: content-1440-scroll-00.png]; has no palette, shortcut hint, copy control or
  search field [`kbdTexts`, `ariaKeyshortcuts`, `copyControls`, `searchAffordances`]
  [openhumans F27: content-1440-tile-01.png]; and carries two dialogs that are never open in any
  capture, so nothing can be said about their design [`stickyOrFixed`]
  [openhumans F28: content-1440-scroll-00.png].
- BioHackrXiv's Help pill is genuinely fixed while the sidebar's stickiness cannot be tested, since
  the page never scrolls beneath it [`stickyOrFixed`] [biohackrxiv F18: content-1440-scroll-90.png].
  Nine further record headings exist in the DOM and appear in no capture at either viewport; the
  captures cannot show why [`headingOutline`] [biohackrxiv F19: content-1440-scroll-90.png]. The
  record appears to render a fixed field skeleton whether or not values exist, but the rendered
  result is not visible [`headingOutline`] [biohackrxiv F37: content-1440-tile-01.png]. No palette
  is claimed [`kbdTexts`, `ariaKeyshortcuts`, `searchAffordances`, `scriptTokens`]
  [biohackrxiv F38: content-1440-full.png]; no copy control exists, and applying that to the
  below-fold citation fields is itself an inference [`copyControls`]
  [biohackrxiv F39: content-1440-tile-01.png]; light-only [`prefersColorScheme`, `htmlAttributes`]
  [biohackrxiv F40: content-1440-full.png].
- wiki.biohack.me persists a fixed top bar, a four-icon right rail and a back-to-top control across
  its small mobile scroll [`stickyOrFixed`] [wiki.biohack.me F11: content-375-scroll-50.png]; it is
  light-only with no theme control and no keyboard or copy affordances, though key handling exists
  in script, so this is an absence of *visible* affordances rather than proof that no key does
  anything [`prefersColorScheme`, `htmlAttributes`, `kbdTexts`, `ariaKeyshortcuts`, `copyControls`]
  [wiki.biohack.me F29: content-1440-full.png].
- LongeCity's masthead and nav bar are persistent chrome rather than the top of the index document —
  painted part-way down the full-page capture at the height the viewport sat. No DOM evidence bears
  on this at all, because `domEvidence` was collected only on the content error page
  [no domEvidence key] [longecity F3: index-1440-full.png]. Its only theme control is a footer
  "Change Theme" link and the switch's own mechanism was never observed
  [`prefersColorScheme`, `htmlAttributes`] [longecity F17: index-1440-tile-04.png]. No keyboard
  affordance and no copy control is visible, and the single recorded copy control is a false
  positive whose label is a copyright string [`kbdTexts`, `ariaKeyshortcuts`, `scriptTokens`,
  `copyControls`] [longecity F18: index-1440-tile-01.png].
- Zenodo's first pass: the header is not sticky and the only fixed element on the content page is
  the consent banner, though 13 px of scroll is all the evidence the page allows
  [`stickyOrFixed`] [zenodo-first-pass F14: content-1440-scroll-90.png]. A persistent identifier
  resolves after withdrawal but carries no copy control [`copyControls`]
  [zenodo-first-pass F25: content-1440-tile-01.png; zenodo-first-pass F40: content-1440-tile-01.png].
  Light-only, with a text-to-HTML figure that cannot be used because the captured page was a
  tombstone [`prefersColorScheme`, `htmlAttributes`]
  [zenodo-first-pass F30: content-1440-tile-01.png].
- sphere.diybio.org's search field carries an autocomplete combobox role and the search is credited
  to a hosted index; no capture shows the field in use, so whether it drops a suggestion list or
  navigates to a results page is not observable [`searchAffordances`, `kbdTexts`,
  `ariaKeyshortcuts`] [sphere F9: index-1440-tile-01.png]. Its category icons are inferred to be
  FontAwesome injected as SVG [`htmlAttributes`, `svgCount`] [sphere F23: index-1440-tile-01.png].

**Claims dropped for lack of evidence.** Each of these was written by a viewer and removed or
withdrawn by the independent verifier; they are recorded here so no later phase revives them.

- Our own "one visible heading level" claim was refuted: the card's ~18–20 px bold lines are a real
  second rank, they simply belong to body text rather than to any heading element
  (rnawiki F5 removed) [rnawiki F1: content-1440-tile-01.png].
- Linear's density figure was refuted on its own cited capture — the tile holds five
  heading-plus-paragraph units and about 165 words, not two units and 60 words (linear F8 removed)
  [linear F30: content-1440-full.png].
- Smashing's "unbroken text between figures" and "the reading region is monochrome below the first
  screen" were both refuted by the captures they cited (smashing F22 and F34 removed)
  [smashing F23: content-1440-tile-05.png].
- Pudding's "the faded end-of-list cards are partly loaded" was removed as an inferred loading state
  with no DOM key; the capture shows a clean gradient mask (pudding F33 removed)
  [pudding F22: index-1440-tile-07.png].
- Atlas's "every other image decorates or baits" was refuted on two grounds — the load counts and
  the ratio were DOM numbers presented as visual observation, and the destination-rail and Read Next
  thumbnails do identify what they link to (atlas F24 removed) [atlas A6: content-375-full.png].
  Its "about 90 px is reserved above each label for an icon that is not there" was removed as an
  inferred cause with nothing visible [atlas F31: index-1440-tile-05.png], and the unlabelled
  ~245 px band above the header was removed from the advertising findings because a standing banner
  is exactly what would produce it [atlas F16: index-1440-tile-02.png].
- Stripe's "search is not a palette" was withdrawn: `searchAffordances.count` returned 0 for a page
  whose search input is plainly visible, so it is a failed probe, not an absence
  [stripe F33: index-1440-full.png].
- Vercel's "the contents rail is its own scroll container" was removed from both the finding and the
  borrow: the rail is pixel-identical at 0 and 50 percent and shifts up near the page end, which is
  sticky behaviour [vercel F18: content-1440-scroll-50.png].
- Open Humans's "the 1440 px home page offers no content entry point on the first screen" was
  refuted by its own capture, which shows three complete project cards inside the first 900 px
  (openhumans F4 removed) [openhumans F1: index-1440-tile-01.png].
- BioHackrXiv's "the author list is more tightly spaced than the field blocks" was refuted by
  measurement (biohackrxiv F16 removed) [biohackrxiv F4: content-1440-tile-01.png].
- The forum's "a loading strip and toast region" finding was refuted as DOM records that render in
  no capture (forum F18 removed), and its infinite-loading inference was withdrawn because
  `scriptTokens.IntersectionObserver` is not evidence of a loading behaviour
  [forum F17: content-1440-tile-03.png].
- Experiment's three-step first-screen hierarchy was refuted on its own capture, where the money is
  larger and heavier than the `h1` (experiment F1 removed) [experiment F6: content-1440-tile-01.png];
  and its timeline's "duration at a glance" was refuted in substance, since dot pitch is uniform
  while the intervals are 16, 19, 25 and 31 days [experiment F22: content-1440-tile-05.png].
- Zenodo's first-pass "on the list, absence renders nothing" was refuted because no row in any
  capture is missing a field, so the claim rests on a case the captures never show
  (zenodo-first-pass F28 removed) [zenodo-first-pass F27: content-1440-tile-01.png].
- sphere's "borrow mobile's absence behaviour" was refuted: nothing shows the page omitting a
  heading because its data was absent (sphere F48 removed) [sphere F40: content-375-scroll-90.png].
- wiki.biohack.me's outline-mismatch inference was withdrawn, because `headingOutline` stops at h3
  and DokuWiki builds its contents from the page's own headings
  [wiki.biohack.me F21: content-1440-tile-01.png].

### Absence handling across the references

**Stripe is structurally right and not observably tested.** No capture shows an empty field, a
placeholder or a "not available" line; every visible row is populated
[stripe F34: content-1440-full.png]. Structurally, no section is present-but-blank: absent content
produces a shorter page rather than a padded one — the guide index simply ends its card sections and
changes to link lists [stripe F36: index-375-full.png].

**Vercel renders no placeholder and still gets absence wrong twice.** Nothing renders an empty
section, placeholder row, dash or "not available" line, but absence is not always shortness: at
1440 px cards in the same grid row are stretched to a common height and the emptier card carries the
slack as internal space, while at 375 px heights do track content
[vercel F32: content-1440-scroll-90.png]. And when a lazy image has not loaded, the frame and the
caption stay, leaving a ~420 px bordered void with a caption asserting what the reader cannot see
[vercel F34: content-1440-tile-06.png].

**Linear demonstrates the rule but only in the trivial case.** An absent pager slot renders nothing
— no disabled control, no placeholder — and the layout closes over it, at both widths
[linear F22: content-1440-tile-05.png]. But nothing on either page is a container waiting for
content: no labelled fields, no metadata rows, no em-dash values, so a missing item has nowhere to
leave a visible mark [linear F23: content-1440-tile-04.png].

**Smashing is the anti-pattern, three times on one page.** An empty commercial slot is rendered
anyway, labelled, and given reserved space — "More after jump! Continue reading below" over a grey
rule with about 165 px of blank at desktop and about 60 px at mobile
[smashing F27: content-1440-tile-11.png]. A rail card renders as an empty bordered box containing
only its caption link [smashing F28: content-1440-tile-05.png]. And the page keeps a labelled but
unfilled supporters band at the foot of the article — an italic caption line above about 250 px of
white [smashing F29: content-1440-tile-18.png]. In the article sections actually opened, the prose
itself always has content: the placeholder behaviour is confined to commercial slots
[smashing F30: content-1440-tile-17.png].

**Pudding keeps the box and fills it with colour.** Below the fold, index cards whose thumbnail is
missing render as flat saturated blocks at the same aspect ratio, with title and question intact
beneath, so the grid rhythm never breaks — and nothing says "image unavailable"
[pudding F26: index-1440-tile-05.png; pudding F32: index-1440-tile-05.png]. No capture on either
page shows a "not available" line, a dash standing in for a missing value or a stub heading; absence
is silent rather than labelled, which the finding is careful to say is not the same as absent
[pudding F35: content-1440-tile-37.png].

**Atlas is the worst of the six and the most instructive.** A browse control renders with no results
and no message — heading, "View all Places" link and FEATURED / MOST RECENT pills, then about 80 px
of blank ground to the section's end, with no cards, no empty-state line and no spinner
[atlas F29: index-1440-tile-04.png]. Missing avatars render as six flat grey circles while every
adjacent text field stays complete [atlas F30: index-1440-tile-04.png]. A benefits grid leaves an
empty top-left cell rather than reflowing [atlas F31: index-1440-tile-05.png]. And the site's only
explicit "nothing here" line is spent on advertising, not on data
[atlas F32: index-1440-tile-02.png]. Its one good mechanic is the reserved image box that does not
reflow when the picture arrives [atlas B6: content-1440-tile-03.png].

**Net rule for RNAWiki.** The mandate already says absent data renders nothing. Two of the six
references do that and it looks correct; one does it and cannot demonstrate it; three break it and
each break is visible as damage. The refinement the captures add is that the rule has to bind
containers and rows, not only fields — a card stretched to a row-mate's height
[vercel F32: content-1440-scroll-90.png] and a labelled empty band
[smashing F36: content-1440-tile-11.png] are both "renders nothing" failures even though no
placeholder text was written.

### Our own baseline, seen the same way

Unsoftened, from `findings/rnawiki_com.json`. Sixteen images, 48 findings after verification (18
confirmed, 27 qualified and rewritten, 1 refuted and removed, 3 added).

**The home page is the stronger half, and every problem of substance is on the dossier**
[rnawiki F45: index-1440-tile-01.png]. The home page reads in three correct ranks achieved by size,
colour and position together — a 56 px headline with "10 seconds" set in blue, a 16 px grey subline,
then the search bar, the only element on the screen drawn with an accent-blue outline
[rnawiki F4: index-1440-tile-01.png]. It handles absence properly: "No published contributor changes
this week yet." at 16 px bold in a white card, with a 14 px grey line explaining exactly when the
list would change [rnawiki F29: index-1440-tile-02.png]. Its two defects are cosmetic and both at
375 px: the search placeholder truncates mid-phrase at "Search medicine, condition," where the blue
Search button begins [rnawiki F8: index-375-tile-01.png], and the "Popular:" chip row wraps leaving
a dangling separator dot [rnawiki F33: index-375-tile-01.png].

**The dossier's hierarchy is inverted.** There is one element with typographic authority — the
56 px `h1` — and exactly one further visible rank below it, and that rank is carried by body text
rather than by any heading [rnawiki F1: content-1440-tile-01.png]. The section heading is smaller
than the text it introduces: the `h2` "IN 10 SECONDS" renders at 12 px uppercase blue above 16 px
body, while the answer below it is larger and bold, so the label reads as a chip and the answer
reads as the heading [rnawiki F2: content-1440-tile-01.png]. Ranking on the first screen is
therefore done by coloured area, not by type: pale-blue card first, amber callout second, grey
hairlines third [rnawiki F3: content-1440-tile-01.png]. The type scale is the cause and not a
separate issue — 56/12/14 px over a 16 px body leaves no heading rank below the title, which is why
the page reaches for a coloured box; fixing the boxes without fixing the scale moves the problem
[rnawiki F43: content-1440-tile-01.png].

**What a reader meets first on our flagship dossier is a name, a container, and then a message
saying the answer is not written yet** [rnawiki F38: content-1440-scroll-00.png]. Under "What
studies found", in the largest bold body text on the page: "A study result is available, but it
still needs a short plain-language explanation." — an editorial backlog note rendered in the position
and weight reserved for the answer [rnawiki F30: content-1440-tile-01.png]. The amber callout
carries broken prose at the second-highest emphasis on the page: "the study, the study designed to
test whether metformin slows ageing, has been designed and publicised for a decade and has never
started." — lowercase opening, duplicated subject, warning-coloured container
[rnawiki F31: content-1440-tile-01.png]. The strongest colour signal on the page is attached to its
weakest prose, and its content is a non-event [rnawiki F40: content-1440-tile-01.png].

**The containers compete with what they contain.** A tinted, bordered, internally ruled card about
490×1180 px holds four sentences, and inside it an amber callout about 115×1095 px holds one
[rnawiki F26: content-1440-tile-01.png]. The card performs around thin data: roughly 68 words, of
which about 49 are medicine-specific, and a page with ten trials and a page with none would render
the same box [rnawiki F39: content-1440-tile-01.png]. An interface control is the visual climax of
the evidence page — the solid blue "See how we know" pill, centred on its own line, the most
prominent object below the `h1`, and not even unique in kind, since "Suggest a correction" uses the
same fill [rnawiki F27: content-1440-tile-02.png].

**Almost nothing is on the page.** There is no list and no table anywhere on the rendered dossier;
every list-shaped thing is behind a closed door — two collapsed disclosure rows and one blue jump
button [rnawiki F11: content-1440-tile-02.png]. The outline names six numbered reader questions and
27 `h3` elements; the only `h3` visible in any capture is "Found a name that is wrong?" at the foot
of the page. As delivered the page is a summary card, one blue button and two plus-signs
[rnawiki F41: content-1440-tile-02.png]. The mechanism — the one genuinely diagrammatic thing on a
medicine page — appears only in the heading outline and is not visible in any capture
[rnawiki F24: content-1440-tile-02.png]. There are no images, diagrams or charts on either page
[rnawiki F23: content-1440-full.png].

**Whitespace is spent outside the content and withheld inside it** — about 130 px of margin each
side of an 1,180 px article, 32–57 px between cards, and roughly 150 px of empty ground before the
footer band [rnawiki F14: content-1440-full.png] — and card whitespace is being used to hide thin
data rather than to organise it, with about 400 px of nothing between a paragraph and its own button
[rnawiki F15: content-1440-tile-02.png]. Two vertical voids of roughly 115 px each make the home
page's three sections read as separate pages stacked
[rnawiki F16: index-1440-full.png]. The one whitespace pattern that says something useful is the
blue card's internal hairlines, 1 px rules with about 30 px of clearance either side separating
question from answer from qualification; the even clearance is the part that would scale
[rnawiki F17: content-1440-tile-01.png].

**The reading column has no governing measure.** The widest card lines run about 700–740 px in the
capture — one line measures 738 px — while the contribution card wraps near 505 px; the 672 px /
93-character figure is a Phase 1 measurer number, not a visual observation. Either way the column
runs past the 68–86 character band the Phase 2 references converge on, hidden today only because
paragraphs are two lines long [rnawiki F13: content-1440-tile-01.png;
rnawiki F46: content-1440-scroll-50.png].

**There is no long scroll to judge; the dossier is two screens tall** — 1,844 px at 1440 px and
2,258 px at 375 px [rnawiki F18: content-1440-full.png]. A 65 px sticky header persists at every
depth and lets page text ghost through its blur
[rnawiki F19: content-1440-scroll-50.png]. Nothing else persists: no contents rail, no progress
indicator, no sticky section label, with the measurer recording `tocPresent` false
[rnawiki F21: content-1440-scroll-50.png]. The end of the page does nothing to carry the reader
onward — a three-link row at 14 px grey, then empty ground, then the shared footer; no next medicine,
no related programme, no suggested reading [rnawiki F22: content-1440-tile-02.png].

**The floating pill collides with content at both widths.** On desktop it sits at the right edge at
about y=854, crossing the evidence card's border on the first screen
[rnawiki F7: content-1440-scroll-00.png]; at 375 px it sits over the lower part of the blue card,
covering one of its internal hairlines, before any scrolling
[rnawiki F9: content-375-scroll-00.png]; at mobile 90 percent it covers the middle of the footer's
own text [rnawiki F20: content-375-scroll-90.png]; and at desktop 50 percent it sits directly on the
top-right corner of the solid blue "Suggest a correction" button — the control that starts a
correction [rnawiki V1: content-1440-scroll-50.png].

**Three interface inconsistencies.** At desktop "General research summary" sits at the far right of
the scope row, about 700 px of empty row from the text it qualifies, and reads as a stray control;
at 375 px the same label sits directly beneath the scope line and reads correctly, so it is a
desktop-only defect [rnawiki F32: content-1440-tile-01.png]. The same account control is labelled
"Sign in" at 1440 px and "Log in" at 375 px, on both pages
[rnawiki V2: index-375-tile-01.png]. And the dossier header search changes kind rather than size
between viewports: a full input at 1440 px, a bare unlabelled magnifier at 375 px — on a page that
offers no related medicines and no listing, so search is the only onward route
[rnawiki V3: content-375-scroll-00.png].

**What defers.** The chassis does: one accent blue, a near-white ground rgb(245,245,247), body text
rgb(29,29,31), system type, thin rules, and nothing on either page styled for effect
[rnawiki F25: content-1440-tile-01.png]. The 4 px spacing base at 90.6 percent adherence and the
7.26:1 body / 15.46:1 title contrast ratios are Phase 1 measurer figures carried over, not
observations from these images.

**And the corpus arithmetic is visible on the page.** About half the words on the dossier's first
screen are fixed copy that would repeat on all 9,852 pages, rising to roughly 60 percent once the
templated backlog sentence is counted as fixed — about 64 words of standing copy against about 68
words of medicine-specific text [rnawiki F42: content-1440-scroll-00.png]. The home page shows one
of 9,852 records, and the only routes into the corpus that need no typing are four named links and
one footer link [rnawiki F12: index-1440-full.png].

---

## Phase 3 — information design of the community sites (A2)

Nine sites, studied for how they present data-heavy, uncertain, community-sourced material. Four are
not longevity-relevant and say so in their own findings; that is stated below rather than worked
around.

### openhumans.org

The captured pages hold a home page and one browse page of twenty project records; there is no
dataset view and no result page [openhumans F2: content-1440-full.png]. Each record is exactly six
fields in a fixed order — name, responsible person, affiliation, participation count, an
owner-written description and one outbound action — and the card interior is the best-designed
element on the site: four type levels inside about 150 px, with only the numeral bold, repeated
identically twenty times at both widths [openhumans F3: content-1440-tile-01.png]. Six complete
records and the start of three more fit one 1440×900 screen precisely because every card repeats the
same fields in the same order [openhumans F6: content-1440-tile-01.png]. It signals evidence quality
visually not at all: across twenty records there is no verified, reviewed, approved, peer-status,
ethics, replication, confidence, self-reported or sample-size mark, and the closest thing to
provenance — the affiliation line carrying "ETH Zurich" or "New York University" — sits at 13 px
light grey while the participation count is the only bold text on the page
[openhumans F19: content-1440-tile-01.png]. Worse, the meaning of that bold number changes silently
between cards with no key: "Connected by 1479 members" and "Joined by 465 members" encode
data-source connection versus study participation in identical styling
[openhumans F18: content-1440-tile-01.png]. Contributed and institutional work are drawn
identically, and there is no editorial layer to separate: a DIY closed-loop community, a foundation
committee and an ETH Zurich ethics project share one card, one type scale and one button
[openhumans F20: content-1440-scroll-50.png]. What a reader gets that a registry cannot is a named
accountable person on every record and a timestamped liveness feed — and the feed shows the cost of
recency with no quality gate, since ten of the twelve visible entries are new-account rows and six
carry promotional-looking names [openhumans F22: index-1440-tile-02.png]. It is adjacent to our
domain rather than in it: personal-data projects, not compounds, doses or outcomes
[openhumans F17: content-1440-tile-02.png].

### biohackrxiv (osf.io)

The captured record page holds a breadcrumb carrying the identifier and version
(`Preprints / BioHackrXiv / 5psfj_v2`), a title, two unlabelled icon buttons, the full document as
an embedded 65-page PDF, and a metadata column of Authors, Abstract and Affiliated Institutions,
with nine further named fields recorded in the outline but visible in no capture
[biohackrxiv F28: content-1440-tile-01.png]. Its structure is a two-column record page whose
density is inherited from the deposited document rather than designed: the densest region on screen
is the PDF's own first page, showing roughly forty author names with superscript affiliation
numbers, while the site's own metadata column shows three blocks before the fold
[biohackrxiv F10: content-1440-tile-01.png; biohackrxiv F28: content-1440-tile-01.png]. Evidence quality is signalled by inventory rather than
by badge — no rating, score, tier, peer-review stamp, sample count, replication mark or confidence
indicator appears anywhere; instead a fixed list of named slots (Public Data, Public Preregistration,
Conflict Of Interest, License, Preprint DOI) would make quality legible by which slots are filled —
and that mechanism is placed where it cannot be seen, since no quality field appears in any capture
at either viewport [biohackrxiv F29: content-1440-tile-01.png;
biohackrxiv F30: content-375-scroll-50.png]. Contributed content is not distinguished from editorial
because there is no editorial layer: the site supplies breadcrumb, field names and a reader, and the
author supplies everything with meaning; the one visible difference is title-casing that reads as
automatic rather than as an editorial act [biohackrxiv F32: content-1440-tile-01.png]. Two author
states — blue link and plain dark text — sit in one comma-separated list with nothing explaining the
difference [biohackrxiv F31: content-1440-tile-01.png], and the comma-joined string visibly splits
one person into two names [biohackrxiv V1: content-1440-tile-01.png]. What a reader gets beyond a
registry is the document itself, immediately, in the page, plus a licence and a resolving
identifier; the cost is that the page's own text is 1.34 percent of what it delivers, and the
meaning sits inside a PDF the site cannot quote, excerpt or deep-link into
[biohackrxiv F33: content-1440-tile-01.png]. Not longevity-relevant, and it should be said plainly:
the venue publishes software written at biohackathons, and this record is a federated-learning
prototype for biobank infrastructure with no intervention, dose, organism, outcome measure or trial
[biohackrxiv F34: content-1440-full.png].

### wiki.biohack.me

The captured content page holds an `h1`, three bold group labels, four links and one provenance
line, with roughly the bottom third of its card blank
[wiki.biohack.me F6: content-1440-tile-01.png]. Its structure is a left topic rail plus a card, and
the rail groups by thin rules while ranking nothing inside a group: eight topic links at identical
weight, no counts, no icons, no indentation and — verification's most important correction — no
current-page marker of any kind, since the current topic "Biology" is still an ordinary blue link
[wiki.biohack.me F3: content-1440-tile-01.png]. Lists are bare vertical link stacks with no
per-row signal at all: nothing says whether a target is a long article or a stub
[wiki.biohack.me F7: content-1440-tile-01.png]. There is no visual signal of evidence quality or
uncertainty anywhere — no verified, reviewed or peer mark, no sample count, no replication note, no
self-reported flag, no confidence indicator and no literature citation on either page; the reader is
left with an author handle and a date [wiki.biohack.me F17: content-1440-tile-01.png]. The only
structured data on a content page is one provenance line — `biology.txt`, "Last modified: 2025/04/16
05:57", "by cyberlass" — with no fields, badges, counts, version, DOI or per-page licence
[wiki.biohack.me F16: content-1440-full.png]. User-contributed content is not distinguished from
editorial because there is no editorial layer, and the design does not imply otherwise
[wiki.biohack.me F18: index-1440-tile-01.png]. What a reader gets that a registry cannot is a
per-page author handle and modification date attached to prose, plus a topic taxonomy a registry has
no field for — provenance without evaluation
[wiki.biohack.me F19: content-1440-full.png]. **It is not longevity-relevant: it is a
body-modification, implant and cybernetics community wiki**, describing itself as a resource for
"grinders or cyborgs" doing "functional (sometimes extreme) body modification", and its one adjacent
entry, "DIY HRT", is a red link whose page does not exist
[wiki.biohack.me F15: index-1440-tile-01.png].

### Longevity Wiki (en.longevitywiki.org)

This is the closest content analogue in the whole study. The captured Rapamycin article holds
cross-organism results, human and dog trial sections, mechanism, regulatory approval, safety,
rapalogs, a one-item "See also" and 93 references, across 12,895 px
[longevity F16: content-1440-tile-15.png; longevity F9: content-1440-tile-11.png;
longevity F14: content-1440-scroll-50.png]. Its structure is a single full-width column with a
hairline rule under the `h1` and under every section `h2` and none under any `h3`, so depth is
marked by the rule rather than by a size step [longevity F1: content-1440-tile-04.png], and the
heading ladder is itself the evidence-strength signal: sections run non-human primates, dogs, mice,
flies, roundworms, yeast, with human trials as a separate later section, so a reader can see where
the human material sits without reading a sentence
[longevity F24: content-1440-tile-02.png]. Uncertainty is signalled entirely in sentences with no
visual mark of any kind — no badge, tier chip, confidence bar, peer-review mark, sample-size field,
replication count, provenance row, self-reported label or status pill anywhere — with hedges sitting
adjacent to claims at identical size, weight and colour ("Unpublished and preliminary data presented
by Dr Adam Salmon at the American Aging Association annual meeting"; "the data remains inconclusive
as the study was powered statistically for…") [longevity F25: content-1440-tile-09.png], and a yeast
paragraph and a 264-person human trial paragraph are identical in weight
[longevity F2: content-1440-tile-04.png]. Contributed content is not distinguished from editorial at
all: no byline, contributor count, edit count, revision indicator, talk marker, stub flag or
citation-needed flag in 12,895 px, with the footer's last-modified line the only authorship trace
[longevity F29: content-1440-tile-15.png]. What a reader gets that a registry cannot is
cross-organism synthesis with the limitations attached — the marmoset result labelled unpublished
conference data, the German mouse result carrying its methodological critique in the next sentence,
the 25-person pilot reporting no clinical effect alongside a within-group HbA1c and triglyceride
rise — delivered as undifferentiated prose
[longevity F31: content-1440-scroll-50.png]. It is squarely longevity-relevant. Its structural
failures are the ones we must not repeat: prose set to the container at 135–150 characters per line
[longevity F7: content-1440-tile-05.png], a genuinely good 31-entry three-level contents box
discarded within about 1,330 px and never seen again
[longevity F17: content-1440-tile-02.png], nothing persisting through the whole scroll
[longevity F14: content-1440-scroll-50.png], freshness only in the footer 12,895 px below a claim
that says a trial "is expected to conclude in 2023"
[longevity F30: content-1440-tile-06.png], a two-column reference list whose left column runs 1–47
and right column 48–93 down the same height [longevity F9: content-1440-tile-11.png], citation ink
varying three ways with no legend so that whether a source is reachable at all is carried by colour
[longevity F28: content-1440-tile-11.png], identifiers printed in at least four formats within one
list [longevity V1: content-1440-tile-14.png], and a dose-response cartoon asserting an "Optimum"
human dose with no units on either axis [longevity F19: content-1440-tile-06.png].

### forum.quantifiedself.com

The captured pages are the index and one listing of thirty topic rows. Each record is at most seven
fields on one line and a bit — title, category chip, free tags, participant avatars, reply count,
view count, last-activity date — and many rows show only four of them
[forum F25: content-1440-tile-02.png]. The list reads as a table with a real four-label header row
but has five visual columns, because the participant-avatar column carries no header, and it is
grouped by nothing: thirty rows in one flat run with no dividers or sections, reverse-chronological
only after the pinned first row [forum F8: index-1440-full.png]. It carries no evidence-quality
signal of any kind — no n, duration, device, protocol, outcome, verified or reviewed mark,
replication count, confidence, self-reported label, licence, DOI or version
[forum F26: content-1440-tile-02.png] — and the only quality-shaped marks are popularity proxies
rendered as a three-band heat scale, so the row with a bold 15.6k view count reads as the strongest
on the screen though nothing in it states who ran it, on how many people, for how long or with what
result [forum F27: index-1440-tile-01.png]. Contributed and editorial content are distinguished by
one mark only — a pin glyph plus a grey Meta chip — so a staff announcement and a stranger's health
claim carry identical visual weight [forum F29: index-1440-tile-01.png], and the list's single
prose slot is spent on that announcement while all twenty-nine other rows expose no preview text
[forum V2: index-1440-full.png]. What a reader gets here that a registry cannot is the mess and the
failure: "Been tracking liver health for 7 years, not sure what to do with it", "Trying to make
sense of my life with scattered data", plus open recruiting — none of which has a registry field
[forum F30: content-1440-scroll-90.png]. It is squarely longevity- and health-relevant: the visible
corpus is self-experimentation on the same compound classes we catalogue, including citizen-science
supplement trials [forum F24: index-1440-full.png]. Two of its mechanics are directly usable and one
is unique in the study: dates on every row without exception, relative under a week and absolute
past a year [forum F31: content-1440-scroll-90.png], and the full absence rule — a missing field
renders nothing and the row visibly collapses, while a measured zero prints "0"
[forum F33: content-1440-tile-02.png; forum F35: content-1440-scroll-90.png].

### longecity.org

**Scope limit first: the page that would have answered the core A2 question was never served.** The
content capture is the site's error page — "We could not find the forum you were attempting to view.
[#10333]" — so nothing here describes how a LongeCity thread or post presents data
[longecity F25: content-1440-tile-01.png], and the live Supplements forum never answered two 60 s
browser loads or a 90 s plain request on 2026-09-04. What the index holds is fourteen forum rows in
three panels, each row an icon, a forum name, comma-separated sub-forums and a newest-post cell of
avatar plus truncated title, author and date; no reply count, view count, rating or score appears
anywhere [longecity F8: index-1440-tile-01.png]. Its structure is bordered rows inside panels with
no table, no sortable column and no filter, grouped by editorial topic rather than by evidence
[longecity F10: index-1440-full.png]. It has no visual vocabulary at all for evidence quality or
uncertainty: across all fifteen images there is no verified mark, no reviewed or peer badge, no
sample count, no replication indicator, no provenance line, no self-reported label, no confidence
marker, no citation, no DOI, no claim-level identifier and no version — the nearest identifier
anywhere is the error page's `[#10333]`
[longecity F28: index-1440-tile-02.png]; the one badge slot that exists encodes access, not evidence
("Protected Forum", "Members only section", "Guests cannot vote")
[longecity F29: index-1440-tile-01.png]. Nothing distinguishes editorial from user-contributed
material, and the only block that *looks* editorial is an advertisement: a "Discover more" panel in
the house title-bar style whose rows are "Schedule Urgent Care" and "Try Science Kits"
[longecity F24: index-1440-tile-02.png; longecity F30: index-1440-tile-01.png]. What a reader gets
that a registry cannot is named people attached to regimens over years, a folk taxonomy of what
people actually take, a live measure of attention and self-reported preference data with a stated
denominator — all delivered with no marks that let a reader weigh it
[longecity F32: index-1440-tile-04.png]. It is longevity-relevant: its taxonomy is directly the
intervention space we cover — Supplements with Regimens, Resveratrol, C60Oil, NAD+ and Senolytics,
beside AgingResearch, Brain Health and Lifestyle [longecity F38: index-1440-full.png]. And it is the
study's cleanest example of the vendor problem: a "Cycloastragenol purity 98%" advertisement runs as
a row inside the panel listing the supplement forums, and a "telomerase activation supplements"
vendor is the site-wide footer sponsor [longecity F23: index-1440-tile-02.png].

### experiment.com

The captured project page holds a funding panel, an h1 that is itself the research question, chips,
a tab row with counts, About This Project, Ask the Scientists, Budget, Endorsed by, Project Timeline,
Meet the Team, Lab Notes and Additional Information, across 7,227 px
[experiment F2: content-1440-tile-04.png; experiment F6: content-1440-tile-01.png;
experiment F15: content-1440-scroll-50.png]. Structurally it is a single low-density column whose
right 40 percent is empty on most screens, with sections separated by a hairline rule plus about
150–170 px of clearance that is identical everywhere, so space says "a section ended" but never
"this matters more" [experiment F8: content-1440-tile-02.png;
experiment F12: content-1440-scroll-50.png]. Evidence quality is signalled by a person rather than
by method: "Endorsed by" is a rosette pictogram, one enthusiastic sentence and a portrait of a
professor at the same institution as the researcher, with no stated scope, independence or date
[experiment F28: content-1440-tile-04.png]. The facts that would signal quality — sample size,
recruitment platform, analysis method, review status — are present only inside paragraphs and never
surfaced as fields, so no two projects can be compared on them; ethics approval is the one exception
and appears as a dated timeline row rather than a comparable field
[experiment F29: content-1440-tile-03.png]. The metadata rows that do exist count engagement and
money, not evidence [experiment F30: content-1440-tile-07.png]. All content is user-contributed and
nothing marks it as such: personal motivation ending "Much love and thanks!" shares typeface, size,
colour and column with the methodology description
[experiment F31: content-1440-tile-06.png]. What a reader gets beyond a registry is stated reasoning
in the researcher's own words, a line-by-line budget justification, a named human with a career
history, a running log of work done and a public discussion channel with a count
[experiment F32: content-1440-tile-07.png]. It is not longevity-relevant: the captured project is a
communication-studies survey about news trust, and the home carousel shows mycology, amphibian
chytrid fungus, firefly genomics and a waterproofing project
[experiment F38: content-1440-tile-01.png]. Its two sharpest lessons are negative and both transfer:
the timeline gives a scheduled date the same standing as a completed one — a project at 52 percent
funded with 17 days left displays "Project fully funded" as a dated dot — and its dot pitch is
uniform while the real intervals are 16, 19, 25 and 31 days
[experiment F26: content-1440-tile-05.png; experiment F44: content-1440-tile-05.png]; and a figure
stated in prose contradicts the itemization printed beside it, in two columns that are never
row-aligned so the contradiction is never visible in one place
[experiment V1: content-1440-tile-03.png].

### zenodo.org

The live record page holds nine typed metadata blocks plus the artefact and a depositor-supplied
free-text description: identity, usage, version history, aggregator indexing, community membership,
identifier and publisher, licence, formatted citation, machine export and created/modified
timestamps, alongside a 5.0 kB zip with size, md5 checksum and a preview control
[zenodo F26: content-1440-tile-02.png]. Its structure is a reading column beside a rail of
single-topic grey panels using a bold-label-above-plain-value pattern with no colons and no table
rules [zenodo F10: content-1440-tile-02.png]. Evidence quality is not signalled anywhere, and four
marks that are easy to misread as quality signals sit exactly where a reader would look for one — a
green "Open" badge (access), "Indexed in OpenAIRE" (an aggregator harvested it), "Communities:
Dockstore" (a collection accepted it) and a Creative Commons badge (reuse terms)
[zenodo F27: content-1440-tile-01.png] — while the only quantity offered in the quality position is
usage, with "11K" and "4K" set larger than the `h1`
[zenodo F4: content-1440-tile-01.png]. Nothing distinguishes a machine deposit from a curated one,
and this record is plainly a machine deposit: a repository path as a title, 210 versions with three
deposited on one day, an organisation as creator, and a developer README containing local database
passwords as the description [zenodo F31: content-1440-tile-01.png]. What a reader gets that a
registry cannot is the artefact with a checksum, a version-bound identifier alongside an
all-versions one, a named licence, a formatted citation, a machine export and typed relations — and
no way to tell whether any of it is right
[zenodo F34: content-1440-scroll-90.png]. It is domain-neutral rather than longevity-focused, and
neither record reached across two passes is longevity evidence: this pass's is a bioinformatics
workflow release, the first pass's withdrawn record concerned health expenditure and under-five
mortality [zenodo F36: content-1440-tile-01.png]. Its strongest information design is versioning —
a version-specific DOI per revision, the current one filled pale blue and rendered as text rather
than as a link, an explicit "View all 210 versions", and a separate identifier stated in words to
cite every version at once [zenodo F29: content-1440-tile-01.png;
zenodo V2: content-1440-tile-01.png] — and its second strongest is the tombstone from the first
pass: a withdrawn record renders `h1` "Gone", one plain sentence, and six labelled facts (Reason for
removal, Removed by, Deletion Policy, Date of removal, Citation, Identifier), with the box ending
where its content ends [zenodo-first-pass F27: content-1440-tile-01.png]. The tombstone's two
weaknesses are recorded with it: no route back into the corpus from the page body, and an identifier
rendered as unlinked black body text with no copy control, unlike the live record page which has
both [zenodo B1: content-1440-tile-02.png; zenodo-first-pass V3: content-1440-tile-01.png].

### sphere.diybio.org

The captured pages hold a photographic carousel of lab entries, an eight-item "Browse by Collection"
grid, a map section and a newsletter block; both manifest URLs point at the home page, so there is
no entry detail view in this set [sphere F41: index-1440-tile-01.png]. An entry's visible record is
four fields — name, a type-and-place line in one fixed grammar, a one-sentence self-description and
one action button — and that fixed grammar is the site's best idea, making a column of entries
comparable at a glance [sphere F30: index-1440-tile-01.png]. No record-level metadata of any kind
appears: no date, version, contributor, licence, identifier, count, tag or source line
[sphere F31: index-1440-tile-01.png], and there are no verification marks anywhere — no verified
badge, reviewed-by line, moderator mark, confidence indicator, sample or replication count,
self-reported label or last-checked date [sphere F34: index-1440-tile-01.png]. Its single
uncertainty signal is the map legend, and it is half right: it gives uncertainty a recessive grey
and makes seeing the uncertain remainder an explicit opt-in with the default stated in plain words —
but it merges two different reasons a lab may be missing into one grey dot, one label and one
toggle, "Inactive / unknown labs", so a reader cannot separate them or filter for one without the
other [sphere F32: content-1440-tile-03.png]. That vocabulary is confined to one component and does
not render at all at 375 px [sphere F33: content-375-scroll-90.png]. Contributed and editorial text
are not typographically identical — editorial category definitions are small dark grey on white,
contributed descriptions are large white type over photographs — but neither carries any mark of who
wrote it, and the only provenance boundary marked is at corpus level
[sphere F35: index-1440-tile-01.png]. The publisher's own promotional panel sits inside the record
carousel at the same size and with the same treatment as the lab entries, and nothing labels it as
the publisher speaking [sphere F2: index-1440-tile-01.png]. What a reader gets that a registry
cannot is geography, openness with a time attached and an entry-specific next action — "Come visit
on OpenHackuarium night every Wednesday, from 7:30-10:30" — at the price of nothing being verified,
dated or graded [sphere F37: index-1440-tile-01.png]. **It is not longevity-relevant: it is a
directory of DIY-biology labs, projects, groups, events, startups, incubators and networks, and
nothing in any capture concerns ageing, lifespan, compounds, doses, model organisms or trial
evidence** [sphere F38: index-1440-full.png].

### Comparison table

| Site | Evidence-quality marks seen | Uncertainty marks seen | Provenance shown | Absence handling | Longevity-relevant |
| --- | --- | --- | --- | --- | --- |
| openhumans.org | None. No verified, reviewed, ethics, replication, confidence, self-reported or sample-size mark on any of 20 records [F19: content-1440-tile-01.png] | None. No status or time field at all; a live study and an abandoned one look identical [F21: content-1440-scroll-50.png] | Named person per record, plus affiliation — set at 13 px light grey while the participation count is the only bold text [F19: content-1440-tile-01.png] | Good at field level: an absent affiliation renders nothing and the card shortens [F23: content-1440-tile-01.png]. Bad at section level: "Recent news" is a full heading over nothing [F24: index-1440-full.png] | Adjacent, not in-domain: personal-data projects, no outcome/dose/organism [F17: content-1440-tile-02.png] |
| biohackrxiv (osf.io) | None visible. Quality signalled by inventory — which named slots are filled — but every such slot lies below the fold at both viewports [F29: content-1440-tile-01.png; F30: content-375-scroll-50.png] | None [F29: content-1440-tile-01.png] | Identifier + version in the breadcrumb at 1440 [F28: content-1440-full.png]; desktop only, gone at 375 [V2: content-375-tile-01.png]. Two unexplained author states [F31: content-1440-tile-01.png] | Not observable: every field that could be empty lies outside every capture [F35: content-375-scroll-50.png]. Overflow handled well — "See more" / "Read more" naming what they reveal [F36: content-1440-tile-01.png] | **No** — biohackathon software; this record is a federated-learning prototype with no intervention, dose, organism, outcome or trial [F34: content-1440-full.png] |
| wiki.biohack.me | None. No verified, reviewed or peer mark, no sample count, no replication note, no confidence indicator, no literature citation [F17: content-1440-tile-01.png] | None [F17: content-1440-tile-01.png] | One line below and outside the card: `biology.txt`, last-modified timestamp, contributor handle [F16: content-1440-full.png] | Existence-coded links — red dotted for a page that does not exist, blue solid for one that does, costing no extra row [F20: content-1440-tile-01.png]. No fields, so no field-level case [F21: content-1440-full.png] | **No** — implants, body modification and cybernetics; the one adjacent entry, "DIY HRT", is a red link [F15: index-1440-tile-01.png] |
| Longevity Wiki | None. No badge, tier chip, confidence bar, peer mark, sample-size field, replication count or status pill in 12,895 px [F25: content-1440-tile-09.png] | Sentences only. Hedges sit beside claims at identical size, weight and colour [F25: content-1440-scroll-50.png]. The evidence ladder is carried by the heading order instead [F24: content-1440-tile-02.png] | Identifiers as strings inside citation sentences, never as labelled fields; no per-claim provenance row [F26: content-1440-tile-09.png]. Reachability carried by ink colour alone [F28: content-1440-tile-11.png] | Renders nothing for what it does not have: no infobox with empty rows, no "Not available", no dash — sections exist only where material exists [F34: content-1440-tile-01.png] | **Yes** — the closest content analogue in the study [F24: content-1440-tile-02.png] |
| forum.quantifiedself.com | None. No n, duration, device, protocol, outcome, verified mark, replication count, confidence, self-reported label, licence, DOI or version [F26: content-1440-tile-02.png] | Dates only, and handled well — relative under a week, absolute past a year, on every row [F31: content-1440-scroll-90.png] | One pin glyph plus a grey Meta chip; a staff announcement and a stranger's health claim carry identical weight [F29: index-1440-tile-01.png] | The full rule, and the only site to state it completely: a missing field renders nothing and the row collapses [F33]; a measured zero prints "0" [F35: content-1440-scroll-90.png] | **Yes** — self-experimentation on the compound classes we catalogue, incl. citizen-science supplement trials [F24: index-1440-full.png] |
| longecity.org | None across all fifteen images: no verified, reviewed or peer badge, no sample count, no replication indicator, no provenance line, no confidence marker, no citation, no DOI, no version [F28: index-1440-tile-02.png] | Dates only, unframed: four of five Stacks entries are 2017–2019 styled exactly like the 2025 one [F27: index-1440-tile-02.png] | Author handle plus date on every community record, with no exceptions [F41: index-1440-tile-02.png] — and the badge slot that exists encodes access, not evidence [F29: index-1440-tile-01.png] | Best-in-study for a record that does not exist: a plain sentence, a small dimmed reference id outside the reading line, three concrete routes forward, inventing nothing [F34: content-1440-tile-01.png]. Worst for an empty field (grey silhouette placeholder) [F35] and an empty region (titled void) [F36: index-1440-tile-02.png] | **Yes** — Supplements/Regimens/Resveratrol/C60Oil/NAD+/Senolytics, AgingResearch, Brain Health [F38: index-1440-full.png] |
| experiment.com | A person, not a method: "Endorsed by" — a rosette, one sentence, a same-institution portrait, no scope, independence or date [F28: content-1440-tile-04.png] | None. Sample size, platform, analysis method and review status live in prose, never as fields [F29: content-1440-tile-03.png] | A named researcher with a career history and a running Lab Notes log [F32: content-1440-tile-07.png]; engagement and money counted, evidence not [F30: content-1440-tile-07.png] | No placeholder or "not available" line anywhere [F34: content-1440-tile-05.png] — but a collapsed list states no count of what it hides, and three of eight timeline events are hidden behind a control that never says so [F34: content-1440-tile-05.png] | **No** — the captured project is a communication-studies survey on news trust [F38: content-1440-tile-01.png] |
| zenodo.org | None. Four marks sit where a quality signal would go and none of them reports that anyone checked the work: "Open" (access), "Indexed in OpenAIRE" (harvested), "Communities: Dockstore" (accepted), CC BY (reuse) [F27: content-1440-tile-01.png] | None on the record. Usage is the only quantity in the quality position [F28: content-1440-tile-01.png] | Strong and typed: version-specific DOI + all-versions DOI [F29], typed relations "Is identical to" [F30: content-1440-tile-08.png], licence named in words beside its badge [F21: content-1440-tile-02.png], md5 checksum on the file row [F11: content-1440-scroll-90.png]. Automated origin unstated [F31: content-1440-tile-01.png] | Correct at field level — "Additional details" is simply shorter, no placeholder rows [F39: content-1440-tile-08.png]. Wrong at panel level — ~200 px of chrome and four disabled zero-count checkboxes to say "No citations found" [F40: content-1440-tile-08.png]. Wrong again at container level — a fixed ~585 px preview box for five rows [F41: content-1440-tile-07.png]. Best-in-study for a withdrawn record: the tombstone [first-pass F27: content-1440-tile-01.png] | **No** — domain-neutral; neither record reached across two passes is longevity evidence [F36: content-1440-tile-01.png] |
| sphere.diybio.org | None anywhere: no verified badge, reviewed-by line, moderator mark, confidence indicator, sample or replication count, self-reported label or last-checked date [F34: index-1440-tile-01.png] | One, in one component: a recessive grey dot and an opt-in checkbox with the default stated in plain words — but "Inactive / unknown" is merged into a single state [F32: content-1440-tile-03.png], and it does not render at 375 px [F33: content-375-scroll-90.png] | Site level only — CC0, Terms of Use, Contributor Terms, Code of Conduct, "Shared on GitHub" — set in the palest type on the page [F36: content-1440-tile-03.png]. No record-level provenance at all [F31: index-1440-tile-01.png] | Desktop: a heading over nothing, with a legend implying content that is not there [F39: content-1440-scroll-50.png]. Mobile: the section is absent — an observed end state, not demonstrated empty-state handling [F40: content-375-scroll-90.png] | **No** — a directory of DIY-biology labs, projects, groups and events; nothing on ageing, compounds, doses, organisms or trials [F38: index-1440-full.png] |

### What none of the nine does

Stated only from the findings.

1. **None shows an evidence-quality mark of any kind.** No peer-review stamp, review state, tier,
   verification tick, sample count, replication indicator, confidence marker or "self-reported"
   label appears on any of the nine
   [openhumans F19: content-1440-tile-01.png; biohackrxiv F29: content-1440-tile-01.png;
   wiki.biohack.me F17: content-1440-tile-01.png; longevity F25: content-1440-tile-09.png;
   forum F26: content-1440-tile-02.png; longecity F28: index-1440-tile-02.png;
   experiment F30: content-1440-tile-07.png; zenodo F27: content-1440-tile-01.png;
   sphere F34: index-1440-tile-01.png].
2. **None distinguishes contributed material from reviewed or editorial material.** Four have no
   editorial layer at all and say so; the others draw both in one treatment
   [openhumans F20: content-1440-scroll-50.png; wiki.biohack.me F18: index-1440-tile-01.png;
   longevity F29: content-1440-tile-15.png; forum F29: index-1440-tile-01.png;
   longecity F30: index-1440-tile-01.png; experiment F31: content-1440-tile-06.png;
   zenodo A10: content-1440-tile-01.png; sphere F35: index-1440-tile-01.png;
   biohackrxiv F32: content-1440-tile-01.png].
3. **None keeps a contents rail through a long page.** Longevity Wiki has a good 31-entry contents
   box and discards it within about 1,330 px [longevity F17: content-1440-tile-02.png]; Zenodo's
   rail is a metadata stack that dies at about 30 percent of a 46-heading page
   [zenodo F17: content-1440-scroll-50.png]; BioHackrXiv's rail is record-aware but carries
   application sections, never the record's own thirteen headings
   [biohackrxiv F13: content-1440-full.png]; wiki.biohack.me's contents panel is overlaid on the
   reading column and covers the rule under the `h1`
   [wiki.biohack.me F13: content-1440-tile-01.png]; the forum, Experiment, sphere and Longevity Wiki
   persist nothing at depth [forum F14: content-1440-scroll-50.png;
   experiment F15: content-1440-scroll-50.png; sphere F18: content-1440-scroll-50.png;
   longevity F14: content-1440-scroll-90.png]; Open Humans persists only a 54 px navbar
   [openhumans F10: content-1440-scroll-90.png].
4. **None offers a hover preview.** No community capture evidences one, so the Phase 2 stopping rule
   on previews is not resolved by any of them.
5. **None offers a browse surface with a stated result count, a sort control and facets.** Open
   Humans has no count, filter, sort, search or pagination and no readable order
   [openhumans F7: content-1440-full.png]; Zenodo has none between its heading and its "More" button
   [zenodo A8: index-1440-full.png; zenodo-first-pass V2: index-1440-full.png]; LongeCity has no
   column headers, sort controls or facets [longecity F10: index-1440-full.png]; sphere's browse
   grid carries no count, chevron or link colour at all [sphere V3: content-1440-tile-02.png]; and
   sphere never states the size of the corpus it indexes [sphere F13: index-1440-full.png].
6. **None attaches freshness or status to the claim.** Longevity Wiki puts it in the footer 12,895 px
   below a claim it contradicts [longevity F30: content-1440-tile-06.png]; LongeCity styles a
   2017 record exactly like a 2025 one [longecity F27: index-1440-tile-02.png]; sphere's records
   carry no date and no state [sphere F54: index-1440-tile-01.png]; Open Humans has no time
   dimension at all [openhumans F21: content-1440-scroll-50.png]; Experiment gives a scheduled date
   the same mark as a completed one [experiment F26: content-1440-tile-05.png]. Only the forum
   dates every row [forum F31: content-1440-scroll-90.png].
7. **None is dark by default and none offers a mirrored theme.** All nine render light in every
   capture [openhumans F26; biohackrxiv F40; wiki.biohack.me F29; longevity F49;
   forum F32; longecity F17; zenodo F42; sphere F42: index-1440-tile-01.png], and Experiment's
   captures are light throughout [experiment F37: content-1440-tile-01.png]. LongeCity has a footer
   "Change Theme" link whose mechanism was never observed
   [longecity F17: index-1440-tile-04.png].
8. **None keeps its search field on the mobile first screen** except the forum (an icon-only
   magnifier) [forum F32: index-1440-tile-01.png] and sphere (a full-width row, better than its own
   desktop placement) [sphere F8: index-375-tile-01.png]. Longevity Wiki, wiki.biohack.me, Zenodo
   and BioHackrXiv all drop or bury it [longevity F5: index-375-tile-01.png;
   wiki.biohack.me F5: index-375-tile-01.png; zenodo F7: index-375-tile-01.png;
   biohackrxiv F6: index-375-full.png].

### Patterns worth borrowing, each tied to a capture

- **The tombstone.** A withdrawn record keeps a stable URL and renders `h1` "Gone", one plain
  sentence, and six labelled rows — Reason for removal, Removed by, Deletion Policy, Date of
  removal, Citation, Identifier — with the box ending where its content ends
  [zenodo-first-pass F27: content-1440-tile-01.png; zenodo B1: content-1440-tile-02.png]. Add the
  two things Zenodo's own tombstone lacks: an in-body route back into the corpus, and a copy control
  on the identifier [zenodo B1: content-1440-tile-02.png].
- **The record-absent page.** For a record that never existed: one plain sentence naming what was
  not found, a small dimmed reference id set outside the reading line, and two or three concrete
  next actions, inventing nothing [longecity F40: content-1440-tile-01.png]. Distinct from the rule
  that an absent *field* renders nothing.
- **The full absence rule, including the printed zero.** A missing field renders nothing and the row
  collapses; a measured zero renders "0" — without which a collapsed row is ambiguous between "not
  measured" and "measured as none" [forum F36: content-1440-tile-02.png;
  forum F35: content-1440-scroll-90.png]. Corroborated at field level by Open Humans
  [openhumans F30: content-1440-tile-01.png], Longevity Wiki
  [longevity F39: content-1440-full.png] and Zenodo [zenodo F39: content-1440-tile-08.png].
- **The record card.** Name, responsible person, affiliation, count, description, one action — four
  type levels inside about 150 px with only the numeral bold, repeated identically so a reader
  learns the pattern once [openhumans F29: content-1440-tile-01.png].
- **Age on every row.** Relative under a week, absolute past a year, with no row omitting it, so a
  five-year-old record can be discounted before it is opened
  [forum F37: content-1440-scroll-90.png].
- **The badge triplet above a row title.** Three small badges in a fixed order before the title,
  each answering a different question, fingerprinting a text-only row and surviving the drop to
  375 px — for us: evidence tier, model-organism ladder position, and whether any human data exists,
  as markup rather than prose [zenodo B5: index-1440-tile-02.png;
  zenodo-first-pass F32: index-375-tile-02.png].
- **Version-specific identifier plus all-versions identifier.** Newest-first rows each carrying
  their own identifier and date, the current revision filled and *not linked*, an explicit "view all
  N versions", and a sentence naming the separate identifier that cites every version at once
  [zenodo B2: content-1440-tile-01.png; zenodo V2: content-1440-tile-01.png].
- **Typed relations instead of a bare link list.** "Is identical to" as a bold label above the URLs
  it governs — our dependency edges should be labelled the same way: supports, qualifies,
  contradicts, supersedes [zenodo B3: content-1440-tile-08.png].
- **The file row.** Name as a link, size in a column, md5 checksum as small grey sub-text with a
  help glyph, one action at the right of the same row, in about 175 px
  [zenodo B4: content-1440-scroll-90.png].
- **A copy control on each thing meant to be copied**, and only those: the DOI, the citation and the
  export each carry their own [zenodo B7: content-1440-tile-03.png].
- **Licence named in words with the badge beside it, never the badge alone**
  [zenodo B8: content-1440-tile-02.png] — and stated once site-wide in the footer, never repeated
  per page [wiki.biohack.me F24: content-1440-full.png].
- **Existence-coded links.** A named record with no published page looks different inline from one
  that has a page, with no extra row and no "not recorded" line — borrowed at a higher contrast than
  this site's red on near-white [wiki.biohack.me F22: content-1440-tile-01.png].
- **The model-organism heading ladder as the base-state evidence signal**, exposed through the
  contents list so the reader sees where the human material sits before reading a word — borrowing
  the ordering, not the flat styling that then gives a worm result and a human result identical
  weight [longevity F36: content-1440-tile-01.png].
- **The limitation kept adjacent to the claim it qualifies**, given the visual subordination the
  prose there withholds [longevity F37: content-1440-tile-09.png].
- **Figures that print their own source inside the image and expand their own acronyms in the
  caption** [longevity F38: content-1440-tile-09.png].
- **Grouped headed browse columns** — three headed columns of six links plus a "More" per group in
  one panel, stacking cleanly at 375 px [longevity F40: index-1440-full.png].
- **Plain-question headings answered in unadorned prose, with source links anchored on the exact
  claim phrase** rather than gathered into a bare list
  [experiment F41: content-1440-tile-02.png].
- **A value paired with its written justification** — adopted with the correction Experiment's own
  version needs, binding each value and its justification into one row
  [experiment F40: content-1440-tile-03.png; experiment V1: content-1440-tile-04.png].
- **Counts inside section-navigation labels** — "Lab Notes (2)", "Discussion (4)" — as markup, not
  prose; the pattern, not the placement [experiment F42: content-1440-tile-01.png].
- **Permission stated at the control rather than elsewhere**: "Guests cannot vote" printed on the
  disabled control, "Members only section" printed under the heading
  [longecity F42: index-1440-tile-01.png].
- **A count always carries its denominator on the same line**: "199 member(s) have cast votes", then
  "45 votes [22.61%]" per option [longecity F43: index-1440-tile-01.png].
- **Attribution as handle plus date on every community record, with no exceptions** — the floor, not
  the ceiling; we add review state on top [longecity F41: index-1440-tile-02.png].
- **A provenance line below and outside the reading card** — identifier, timestamp, contributor —
  keeping provenance separate from evaluation
  [wiki.biohack.me F23: content-1440-full.png].
- **The letter-disc fallback.** Where an identity has no image, render an identity token whose
  glyph, not its generated colour, carries the distinction — never a generic silhouette
  [forum F39: index-1440-tile-01.png].
- **The undecorated row.** One typeface, no cards, no fills, hairline rules, the title carrying all
  the weight — thirty rows stay readable at scanning speed
  [forum F38: content-1440-tile-02.png].
- **One fixed grammar for a result row's summary line**, generated as markup so it does not count as
  page prose [sphere F46: index-1440-tile-01.png].
- **Taxonomy defined on the page, one sentence per term, including a named residual and an
  admission that the scheme may change**: "Umbrella term for the rest of misfit entries. New
  collections may arise" [sphere F47: content-1440-tile-02.png].
- **A complete site-level provenance chain in the footer** — licence, contributor terms, code of
  conduct, and the repository the data lives in [sphere F49: content-1440-tile-03.png].
- **Only the honest half of the three-state legend**: a recessive grey for the uncertain state and an
  opt-in to see the uncertain remainder with the default stated in plain words. Explicitly *not* its
  merged state [sphere F45: content-1440-tile-03.png].
- **Truncation controls that name what they reveal**: "See more" on a long author list, "Read more"
  on a cut abstract — one step, in place [biohackrxiv B4: content-1440-tile-01.png].
- **Signal evidence quality by inventory rather than by badge** — name the questions a sceptical
  reader asks and let the answer be whether the slot is filled — adapted to our stricter rule, so
  the inventory becomes one labelled disclosure rather than thirteen empty headings
  [biohackrxiv B1: content-1440-tile-01.png].
- **Identity as a two-state, not a badge**: a resolvable identity renders as a link, a bare string as
  plain text — borrowed with the legend OSF omits, because an unexplained colour difference is not a
  signal [biohackrxiv B2: content-1440-tile-01.png].
- **Put the revision in the address**, and make it survive the mobile layout, which OSF's does not
  [biohackrxiv B3: content-1440-full.png].

### Anti-patterns, each tied to a capture

- **A commercial surface anywhere near evidence.** A "Cycloastragenol purity 98%" advertisement runs
  as a row inside the panel listing the supplement forums, and a telomerase-supplement vendor is the
  site-wide footer sponsor [longecity F44: index-1440-tile-02.png;
  longecity F23: index-1440-tile-02.png].
- **A non-editorial block wearing editorial chrome.** The "Discover more" ad unit uses the house
  title bar and chevron rows [longecity F45: index-1440-tile-02.png]; and the publisher's own
  promotional panel sits inside the record carousel, unlabelled
  [sphere F2: index-1440-tile-01.png].
- **One glyph for two unrelated exceptions.** The same speech-bubble mark stands on the members-only
  section and on both advertisements [longecity V1: index-1440-full.png].
- **A record whose fields are told apart only by which line is a link.** The Stacks widget inverts
  name and handle between entries [longecity V2: index-1440-tile-02.png].
- **A heading outline that does not match the visible page.** The error page's outline is led by
  "Google Sign in options" and "Ad Notice", neither visible, while its one visible sub-head is not a
  heading at all [longecity V3: content-1440-tile-01.png].
- **A popularity-weighted tag cloud as a browse mechanism**, mixing compounds, conditions and forum
  noise in one weight system with no quantity ever named
  [longecity F46: index-1440-tile-04.png].
- **Bold weight on a popularity number.** A 15.6k view count becomes the most authoritative-looking
  object in the list [forum F41: index-1440-tile-01.png]; "1479" is bolded while "ETH Zurich" sits
  at 13 px grey [openhumans F31: content-1440-tile-01.png]; "11K VIEWS / 4K DOWNLOADS" at ~34 px
  outranks the title, identifier, version and licence
  [zenodo A3: content-1440-tile-01.png]; money outweighs the `h1`
  [experiment F45: content-1440-tile-01.png].
- **Two different meanings carried only by a word in identical body type, with no key.** "Connected
  by" versus "Joined by" [openhumans F32: content-1440-tile-01.png].
- **Non-sticky column headers over a long numeric list.** Past the first screen every number in the
  table is unlabelled [forum F42: content-1440-scroll-50.png] — and the legend is set no darker and
  no heavier than the values it labels [forum V3: index-1440-tile-01.png].
- **A chip taxonomy where most chips share one colour.** Six of eight visible categories carry the
  same brown square, so a classifier that does not classify looks like one that does
  [forum F43: content-1440-scroll-90.png].
- **A promotional or announcement row in the first slot of the data list**, carrying the page's
  largest number [forum F44: index-1440-tile-01.png].
- **A section heading with nothing under it.** "Recent news" over the footer
  [openhumans F24: index-1440-full.png].
- **A placeholder that looks like finished content.** The "Gut Instinct" card's description is the
  string "gut instinct" [openhumans F25: content-1440-scroll-50.png].
- **A list with no stated or readable order dealt into ragged columns**, so neither the columns nor
  the mobile stack express the order the counts hint at
  [openhumans F33: content-1440-full.png].
- **A sticky bar with no visible bottom edge.** Scrolled content is guillotined at an invisible edge
  54 px down [openhumans V1: content-1440-scroll-90.png] — and a multi-column list that silently
  drops rows at 375 px instead of stacking them [openhumans V2: index-375-full.png].
- **Setting prose to the container.** 135–150 characters per line at 1440 px, sustained over
  12,895 px [longevity F43: content-1440-tile-05.png] — and a card that decides the measure instead
  of a measure being set [wiki.biohack.me V1: index-1440-full.png].
- **Losing all chrome on a long scroll.** At 12,895 px with `stickyOrFixed` empty, a reader at 50
  percent has no section label, no progress cue and no route back to search
  [longevity F42: content-1440-scroll-50.png]; the same at 7,227 px
  [experiment F52: content-1440-scroll-90.png] and on sphere
  [sphere F55: content-1440-scroll-90.png].
- **Freshness and status only in the footer** [longevity F44: content-1440-tile-15.png].
- **Two-column long reference lists whose numbering does not follow the eye** — left 1–47, right
  48–93, each running the full height [longevity F45: content-1440-tile-14.png].
- **Citation colour that varies without defined meaning**, so readers infer a quality distinction
  that is not intended [longevity F46: content-1440-tile-11.png] — and identifiers printed in four
  formats in one list with reachability carried only by link colour
  [longevity V1: content-1440-tile-14.png].
- **A source-reuse count rendered as an unlabelled superscript back-link cluster**, throwing away a
  signal the list already computed [longevity V3: content-1440-tile-11.png].
- **Related-content links stranded above a several-thousand-pixel source list**
  [longevity V2: content-1440-tile-15.png].
- **A dose-response cartoon with an unlabelled "Optimum"** — a graphic asserting what our editorial
  rule forbids the prose to say [longevity F41: content-1440-tile-06.png].
- **A floated image taking the lead position at mobile**, crushing the opening paragraph to between
  4 and 13 characters per line for eleven lines
  [longevity F48: content-375-tile-01.png].
- **A floating contents panel overlaid on the reading column**, covering the rule under the `h1`
  [wiki.biohack.me F25: content-1440-tile-01.png] — and a fixed tool rail that keeps its desktop
  position at 375 px and lies on top of the card border and the text
  [wiki.biohack.me V3: content-375-scroll-50.png].
- **Raw record identifiers as coloured badges in the main view**, plus unlabelled glyph clusters
  around thin content [wiki.biohack.me F27: content-1440-tile-01.png].
- **Collapsing the whole taxonomy, not just search, into one unlabelled bar at 375 px**, so a phone
  reader has no way to move sideways between topics
  [wiki.biohack.me V2: content-375-tile-01.png].
- **A rail that carries application sections instead of the record's own headings** — 300 px of dark
  navy, 21 percent of the desktop width, able to name only "Overview"
  [biohackrxiv A5: content-1440-full.png] — and a rail that dies at 30 percent of a 46-heading page
  [zenodo A4: content-1440-scroll-50.png].
- **A fixed help beacon over content**, covering the metadata card at 1440, the search field's corner
  on the mobile index and the viewer's toolbar on the mobile record
  [biohackrxiv A6: content-1440-full.png].
- **Unlabelled icon-only actions on a record** [biohackrxiv A7: content-375-tile-01.png].
- **Embedding the document instead of structuring it.** 1.34 percent visible text to delivered HTML,
  a shell around a 65-page file the site cannot quote or link into
  [biohackrxiv A4: content-1440-tile-01.png] — and at 375 px the embedded viewer is not even
  operable, its toolbar clipped and the remainder covered by the help pill
  [biohackrxiv V3: content-375-tile-01.png].
- **Importing a foreign document wholesale as the record body.** It supplies 19 of the 40 recorded
  headings, brings its own `h1`, and produced eight near-identical abstracts on one index page
  [zenodo A7: content-1440-scroll-50.png] — with two `h1` elements 90 px apart at almost the same
  size [zenodo F3: content-1440-tile-01.png].
- **A full panel of controls rendered where nothing was found.** About 200 px of collapsible header,
  four disabled zero-count checkboxes, a search field and a Search button, to say "No citations
  found" [zenodo A5: content-1440-tile-08.png] — on the same page whose field-level behaviour two
  sections earlier is correct.
- **A fixed-height container padded with white.** The file preview box keeps ~585 px for five rows
  [zenodo A6: content-1440-tile-07.png].
- **An aggregator or collection label standing in the provenance slot**
  [zenodo A9: content-1440-tile-01.png; zenodo-first-pass F39: index-1440-tile-03.png].
- **Leaving the automated origin of a record unstated** [zenodo A10: content-1440-tile-01.png].
- **Recency-only ordering with no count, sort or facets.** Eight of ten front-page records are one
  automated deposit run [zenodo A8: index-1440-full.png;
  zenodo-first-pass V1: index-1440-full.png].
- **A document wider than the viewport at 375 px.** Zenodo's pages measure 407 px and 382 px against
  a 375 px viewport, with a long API URL breaking mid-token across five lines
  [zenodo V1: content-375-tile-12.png] — and LongeCity's 879 px page in a 375 px viewport clips the
  entire rail and severs its error sentence mid-word
  [longecity F48: index-375-full.png].
- **Ranking a technical panel down by dropping its contrast instead of labelling it as a technical
  disclosure**, which reads as disabled and produces the weakest text on the page
  [zenodo V3: content-1440-tile-03.png].
- **A timeline that gives a scheduled date the same mark as a completed event, and whose spacing
  does not represent elapsed time** [experiment F44: content-1440-tile-05.png].
- **One flat heading weight across sections of unlike evidentiary status.** Budget, Endorsed by and
  Additional Information all at identical weight with identical grey pictograms
  [experiment F46: content-1440-tile-04.png].
- **Contributor prose set identically to reviewed content with no provenance mark**
  [experiment F47: content-1440-tile-06.png].
- **A trust mark whose scope, independence and date are undefined**
  [experiment F48: content-1440-tile-04.png].
- **Dropping provenance chips and section navigation at narrow widths**
  [experiment F49: content-375-tile-01.png].
- **Duplicated body text across two attributed records.** Two named endorsers from two organisations
  share one identical 28-word closing sentence — the positional-overlap failure our uniqueness
  constraint exists to prevent, on a live page [experiment F50: index-1440-tile-09.png].
- **Reusing one image across every record on a page** [experiment F51: content-1440-tile-07.png].
- **Stating the same claim twice, sourced in one place and unsourced in the other, with nothing
  marking which is canonical** [experiment V2: content-1440-tile-02.png].
- **Rendering a section heading above content that may not appear**, with a legend for a graphic that
  is not there [sphere F52: content-1440-scroll-50.png].
- **Setting the licence and provenance statement as the palest text on the page**
  [sphere F53: content-1440-tile-03.png].
- **A borderless, unfilled search field that reads as a label rather than a control**
  [sphere F51: index-1440-tile-01.png].
- **A browse row whose record name is not the link**, in a grid whose rows carry no link colour,
  count or chevron, where the only link-coloured text is the publisher's own
  [sphere V2: index-1440-tile-01.png; sphere V3: content-1440-tile-02.png].
- **A mobile first screen that shows the publisher's own panel and no record at all**
  [sphere V1: index-375-tile-01.png].
- **A flat heading outline where every record title is an `h1`**
  [sphere F5: index-1440-tile-01.png].
- **Letting a contribution or sign-up block be the only tinted, most-designed element on a page of
  evidence** [sphere F56: content-1440-tile-03.png].

---

## Phase 2 table — revised from visual findings

Same eight surface rows as Phase 2. "Governing (Phase 2)" is reproduced unchanged from
`docs/worklogs/design-system.md`. "Governing (revised)" changes only where a capture supports the
change. Four rules bind this table and are stated before it, because they constrain what may appear
in it:

1. **Wikiwand was never rendered and no substitute may be invented for it.** The contents-rail row
   names only what was directly observed, and the surface **remains unassigned pending Felix**.
2. **Awwwards and Quanta could not be captured** (their terms forbid it). Their rows keep the
   Phase 2 assignment marked **"measured, not seen"** and may add only observed secondaries.
3. **The home row is frozen.** The search bar's position, prominence and behaviour do not change.
   Every observed failure of a vanishing mobile search field is cited there as corroboration of the
   freeze, never as a proposal.
4. **Light default is decided and is not re-litigated here.** The only correction is that the
   Phase 2 dark-mode note lists Stripe among five light-only sites, and the capture shows a theme
   control on the reference page with `prefersColorScheme` found, while Phase 1 measured the same
   URL dark [stripe F32: content-1440-full.png].

A community site is named as a secondary only where a verified finding names a specific borrowable
component.

| Surface | Governing (Phase 2) | Governing (revised) | Secondary (revised) | Visual verdict | What the captures showed |
| --- | --- | --- | --- | --- | --- |
| **Home** | Apple subtraction; search bar frozen | Unchanged — Apple subtraction; **search bar frozen** | None. Nothing observed may sit above or beside the bar | **frozen** (rnawiki F4, F6, F28, F45) | Our rendered first screen already does the job: three ranks by size, colour and position, and the search bar is the only element drawn with the saturated accent blue while every other bordered object is neutral grey or a much paler blue tint [rnawiki F4: index-1440-tile-01.png; rnawiki F28: index-1440-tile-01.png]. Corroboration of the freeze, not proposals for it — four observed failures of a vanishing mobile search field: Longevity Wiki carries no search input anywhere on its 375 px home page [longevity F5: index-375-tile-01.png]; wiki.biohack.me drops the field from the mobile first screen entirely and takes the topic taxonomy with it [wiki.biohack.me F5: index-375-tile-01.png; wiki.biohack.me V2: content-375-tile-01.png]; Zenodo replaces it with a hamburger so the first mobile screen offers no visible way to search [zenodo A1: index-375-tile-01.png]; and Vercel's article page shows no search entry point at 1440 px and none at 375 px on either page [vercel F42: content-1440-scroll-00.png]. Two of our own defects sit on this surface and are cosmetic: the clipped 375 px placeholder [rnawiki F8: index-375-tile-01.png] and the dangling separator dot [rnawiki F33: index-375-tile-01.png] |
| **Browse / filter** | awwwards.com | awwwards.com — **measured, not seen** (terms forbid capture; the Phase 1 numbers stand and are not extended) | forum.quantifiedself.com, scoped strictly to row composition and absence handling (forum F36, F37, F38) — the only community site whose page *is* a filter surface for uncertain records. Observed components only: Atlas's plain columned link table [atlas B2: index-1440-tile-07.png], Zenodo's badge triplet [zenodo B5: index-1440-tile-02.png], Open Humans's record card [openhumans F29: content-1440-tile-01.png], Stripe's density gradient [stripe F44: index-375-tile-04.png], Linear's label-value rows with a monospaced right-aligned ordinal [linear V2: index-1440-tile-02.png] | **unobservable** for the governing reference; **strengthens** on the secondaries (forum F33, F35, F36, F37, F38; atlas F29, F12; zenodo A8, V1) | Atlas was dropped in Phase 2 on its text-to-HTML number, and looking at it strengthens the drop for three reasons a number could not give: at 375 px the article ends at about 15 percent of a 15,358 px scroll and the exact midpoint holds six video cards and no article text [atlas A6: content-375-scroll-50.png]; the one browse surface it renders is empty, with FEATURED / MOST RECENT pills over about 80 px of blank ground and no message [atlas F29: index-1440-tile-04.png]; and it makes editorial and paid provenance visually identical [atlas F28: index-1440-tile-03.png]. Two of its detail patterns survive under other governance (the labelled stat cell, the link table). The forum supplies what no measured reference does: the complete absence rule, missing field collapses and measured zero prints "0" [forum F35: content-1440-scroll-90.png] |
| **Compound dossier — reading column** | smashingmagazine.com; secondary linear.app/method | smashingmagazine.com (unchanged) | linear.app/method (unchanged) **with one correction**: carry the group/member size step Linear applies only at 375 px to every width [linear V1: content-375-tile-01.png]. Added as corroboration, not as a new governor: Vercel's measured hierarchy-by-space ladder [vercel F37: content-1440-tile-04.png]. Community components: Longevity Wiki's model-organism heading ladder [longevity F36: content-1440-tile-01.png] and limitation-adjacent-to-claim [longevity F37: content-1440-tile-09.png]; Experiment's plain-question headings with links anchored on the claim phrase [experiment F41: content-1440-tile-02.png]; Smashing's own QUICK SUMMARY slot [smashing V2: content-1440-tile-01.png] and metadata plate [smashing V1: content-1440-tile-01.png] | **strengthens** (smashing F2, F13, F16, F18, F23, F32, V1, V2; linear F1, F2, F12, V1; vercel F2, F14) | Smashing's column behaves well under a 15,700 px scroll: rhythm holds for thousands of pixels and the only breaks are commercial inserts we have no equivalent of [smashing F18: content-1440-tile-11.png]. The Phase 2 claim that its prose "never acquires a card or a tint" does not survive — the flow carries a tinted workshops panel with a green button at the full measure, a red pull-quote tile and blue in-prose links — so what is borrowable is the deference *between* those inserts [smashing F23: content-1440-tile-05.png]. Two numbers in the Phase 2 justification need re-measuring before use as tokens: the 11.5–12.6:1 contrast came from a dark article background, and the article rendered black on white with `bodyBackgroundColor` rgb(255,255,255) [smashing F31: content-1440-tile-01.png] |
| **Compound dossier — contents rail and previews** | **unassigned — stopping rule**; stripe.com/docs proposed for the rail only | **Still unassigned — the surface remains unassigned pending Felix.** Wikiwand was never rendered and no substitute is invented for it | Only what was directly observed is named here. Vercel's 240 px right rail was seen working at three real scroll depths, with two indent levels and a left-bar active marker [vercel F40: content-1440-scroll-50.png]. Stripe's rail is not a TOC generated from `h2` text — the page has no `h2` at all — it is a persistent site-wide tree with the current page's sections nested inside it, and what pins during scroll is eight per-section asides, not the rail [stripe F42: content-1440-full.png; stripe V3: content-1440-full.png]. Smashing has none [smashing F16: content-1440-scroll-50.png] | **unobservable** for hover previews (no capture in the whole study evidences one); **strengthens** the case that the surface needs resolving (vercel F18, F19, F20, F21, F23, V1; stripe F22, F42; longevity F17, F42; zenodo F17, A4; biohackrxiv F13, A5; wiki.biohack.me F13, F25) | Vercel's rail persists at 0, 50 and 90 percent and shifts up near the page end, which is ordinary sticky behaviour; the earlier "own scroll container" reading was removed in verification [vercel F18: content-1440-scroll-90.png]. Its two failure modes are visible and therefore designable around: the marker lags two headings behind at 90 percent [vercel F20: content-1440-scroll-90.png] and long labels truncate to an ellipsis at 240 px [vercel F21: content-1440-scroll-50.png]; at 375 px the contents control scrolls away and never returns on a 9,609 px article [vercel F23: content-375-scroll-50.png]. Two distinct active-state marks on one screen — a filled pill for "which page", a left bar for "which section" — is the mechanism that lets two rails coexist [vercel V1: content-1440-scroll-00.png]. The community sites supply four negative constraints for whatever eventually governs: a rail must carry the record's own headings, not the application's [biohackrxiv A5: content-1440-full.png]; it must serve the whole length of the page rather than dying at 30 percent [zenodo A4: content-1440-scroll-50.png]; it must have its own column and never overlay the reading card [wiki.biohack.me F25: content-1440-tile-01.png]; and the document must not scroll past the last content in either column [longecity F47: index-1440-full.png] |
| **Structured data blocks** | stripe.com/docs | stripe.com/docs (unchanged) — **but the stated mechanism is corrected**: the borrow is the hairline row, not the collapsible field-block count | Zenodo for absence-as-record — the tombstone content model [zenodo B1: content-1440-tile-02.png] — plus its typed relations [zenodo B3: content-1440-tile-08.png], file row [zenodo B4: content-1440-scroll-90.png], per-thing copy control [zenodo B7: content-1440-tile-03.png] and licence-in-words [zenodo B8: content-1440-tile-02.png]. forum.quantifiedself.com for the collapse-the-empty-row rule and the printed zero [forum F36: content-1440-tile-02.png]. Atlas's labelled stat cell [atlas B1: index-1440-tile-03.png]. Pudding's Methods & Notes apparatus region [pudding F21: content-1440-tile-37.png]. Experiment's value-with-justification pairing, with the row-binding correction [experiment F40: content-1440-tile-03.png] | **strengthens** (stripe F7, F12, F13, F39, F40, V2; zenodo F39, F40, F41, B1–B8; forum F33, F35; atlas B1) | The real mechanism is the hairline row with a three-step internal hierarchy and a coloured category word, reused identically for two different kinds of content on one page [stripe F39: content-1440-full.png]. The category is a short word with colour only reinforcing, so a CONFIRMED / MIXED / CONTRADICTED / NOT_MEASURED / UNKNOWN distinction survives greyscale [stripe F40: content-1440-full.png]. The refinement verification added: the page is not box-free — the one boxed element is the exact record, in a bordered panel with an all-caps header bar naming precisely what it contains [stripe V2: content-1440-full.png]. Zenodo shows the same site handling absence correctly at field level and badly at panel level on one page, which is the clearest available evidence that "absent data renders nothing" must bind containers and panels, not only fields [zenodo F39, F40: content-1440-tile-08.png] |
| **Citation evolution map** | pudding.cool | pudding.cool (unchanged), with the Phase 2 warning sharpened and one rule held *against* the reference | Vercel's collapsed cross-link map as the default weight — an entire link map costing one closed line below the content and above the pager [vercel F39: content-1440-tile-08.png]. Zenodo's version-specific plus all-versions identifier structure, with the current revision marked by removing its link [zenodo B2: content-1440-tile-01.png; zenodo V2: content-1440-tile-01.png] | **strengthens** the assignment, **overturns** one line of its justification (pudding F19, F20, F23, F24, F25, F30, V1; vercel F33, F39; zenodo B2, V2; experiment F26, F44; sphere F52) | The mechanism was seen working rather than inferred from a stylesheet: a pinned graphic stage with a bordered prose card riding over it [pudding F19: content-1440-scroll-50.png], one colour key taught in the sentence and reused in every mark [pudding F24: content-1440-scroll-90.png], and provenance and caveat under the chart [pudding F25: content-1440-scroll-90.png]. **Overturned:** the Phase 2 rule for this surface says the text carries every meaning and the graphic carries none, and that is *not* what Pudding does — at 50 and 90 percent the magnitudes live only in the graphic [pudding F23: content-1440-scroll-50.png], so we hold the rule against the reference rather than learn it from it. The static evidence is worse than the numbers implied: the graphic stages render blank outside a live scroll [pudding F20: content-1440-tile-02.png], so the same revision history must also be readable as a plain list. Three anti-patterns bind this surface: a scheduled date must not carry a completed event's mark, and spacing must represent elapsed time [experiment F44: content-1440-tile-05.png]; a heading must not be rendered above a graphic that may not appear [sphere F52: content-1440-scroll-50.png]; the caveat must not be the faintest line on the page [pudding V1: content-1440-tile-08.png] |
| **Global search overlay** | vercel.com/docs | vercel.com/docs retained as the only measured candidate, but **the overlay itself was never seen** and the row is downgraded to a target rather than a description | Stripe's `/` chip is the only alternative observed, and what it opens is unresolved: no overlay appears in any capture and the DOM probe returned nothing even on a page whose input is plainly visible [stripe F33: index-1440-full.png] | **weakens** (vercel F5, F6, F42; stripe F33; rnawiki F35) | No capture shows Vercel's palette at all — it is inferred from `kbdTexts` and `searchAffordances`, and a governing reference for a surface should be a surface someone has looked at [vercel F6: content-1440-scroll-00.png]. The visible entry point is not persistent: a bordered field at the top of the index rail, absent from the article's first screen at 1440 and from both pages at 375 [vercel F42: content-1440-scroll-00.png]. What survives with confidence is one detail — the ⌘K chip sitting inside the right end of the field rather than beside it [vercel F5: index-1440-tile-01.png] — which is not a governing reference. The Phase 1 mirrored-ramp contrast measurement (17.9:1) is untouched; only the design claim weakens. Our own header search is a plain always-present input with no `kbdTexts` and no `ariaKeyshortcuts`, so this row describes a target [rnawiki F35: content-1440-scroll-00.png] |
| **Reference / definitions page** | quantamagazine.org | quantamagazine.org — **measured, not seen** (terms forbid capture; the Phase 1 numbers stand and are not extended) | Observed secondaries only: Stripe's demonstration that a whole reference page with `imgCount` 0 loses nothing [stripe F45: content-1440-full.png]; Atlas's mobile footer accordion, five closed chevron rows where desktop shows an open five-column table [atlas B5: index-375-tile-15.png]; sphere's on-page taxonomy definitions including a named residual and an admission the scheme may change [sphere F47: content-1440-tile-02.png] and its complete footer provenance chain [sphere F49: content-1440-tile-03.png]; wiki.biohack.me's rule that licence and shared terms are stated once site-wide and never per page [wiki.biohack.me F24: content-1440-full.png]; Open Humans's single explanatory diagram, placed here and never near the home search bar [openhumans F13: index-1440-tile-01.png] | **unobservable** for the governing reference; **strengthens** on the secondaries (stripe F45; atlas B5; sphere F47, F49, F53; wiki.biohack.me F24; forum F45) | Quanta was never rendered, so nothing visual is added to or subtracted from its assignment. The observed secondaries all concern the same job: state a shared explanation once, in a place every other page can reach. Two anti-patterns bind the surface: the licence and provenance statement must not be the palest text on the page [sphere F53: content-1440-tile-03.png], and a list must never end with no route to the page that holds the shared explanations [forum F45: content-1440-tile-03.png] |

### Changes from Phase 2, one line each

1. **Home:** unchanged and frozen; four observed mobile-search failures are recorded as corroboration of the freeze, never as proposals [longevity F5; wiki.biohack.me F5; zenodo A1; vercel F42].
2. **Browse / filter:** awwwards stays governing but is now marked "measured, not seen"; Atlas's drop is strengthened by three visual reasons the number could not give [atlas A6, F29, F28].
3. **Browse / filter:** forum.quantifiedself.com added as a secondary, scoped strictly to row composition and absence handling and explicitly not to its chrome, emphasis, chips or scroll behaviour [forum F36, F37, F38].
4. **Reading column:** Smashing stays governing; the Phase 2 sentence that its prose "never acquires a card or a tint" is withdrawn [smashing F23].
5. **Reading column:** the Linear secondary is corrected — carry the group/member size step Linear applies only at 375 px to every width, because a dossier is entered at an anchor [linear V1].
6. **Reading column:** the Phase 2 contrast figures of 11.5–12.6:1 must be re-measured; the article rendered black on white, not on the dark gradient Phase 1 recorded [smashing F31].
7. **Contents rail:** still unassigned, pending Felix; Wikiwand was never rendered and no substitute is invented [worklog stopping rule; vercel F40; stripe F42].
8. **Contents rail:** Stripe's stated mechanism is corrected — the page has no `h2` at all, so the rail is not "a TOC generated from h2 text"; it is a site tree with the current page's sections nested, and what pins is eight per-section asides [stripe F42, F22, V3].
9. **Contents rail:** Vercel is recorded as the one rail in the study actually seen working at three scroll depths, with its two failure modes named [vercel F18, F20, F21, F23].
10. **Structured data blocks:** Stripe's justification is restated from a field-block count to the hairline row plus the one labelled box for the exact record [stripe F39, V2].
11. **Structured data blocks:** the Zenodo tombstone is added as the content model for a withdrawn, retracted or superseded programme, with the two fixes its own version needs [zenodo B1, F38].
12. **Structured data blocks:** the forum's collapse-the-empty-row rule and its printed zero are added, because a collapsed row is otherwise ambiguous between "not measured" and "measured as none" [forum F36, F35].
13. **Citation evolution map:** Pudding is strengthened, but the Phase 2 rule that the text carries every meaning is *not* what Pudding does and must be held against the reference [pudding F23].
14. **Citation evolution map:** the graphic stages render blank outside a live scroll, so the same history must also be readable as a plain list [pudding F20].
15. **Global search overlay:** Vercel weakens — the palette was never seen and the visible entry point is not persistent; the row becomes a target, not a description [vercel F6, F42].
16. **Reference / definitions:** Quanta stays governing, marked "measured, not seen"; five observed secondaries are added, all concerning stating a shared explanation once [stripe F45; atlas B5; sphere F47, F49; wiki.biohack.me F24].
17. **Dark mode note:** the Phase 2 sentence listing Stripe among five light-only sites is wrong — the reference page shows a theme control and `prefersColorScheme` found, and Phase 1 measured the same URL dark. The decided light default is unaffected [stripe F32].
18. **Our own baseline** contradicts nothing in the table and strengthens four rows; the uncomfortable finding is that our dossier measures 0.0007 text-to-HTML, below the 0.0015 of the site dropped for that number [rnawiki F46: content-1440-scroll-50.png; atlas A6: content-375-scroll-50.png].

### Open decisions for Felix

1. **Wikiwand — human visit, or leave the contents-rail surface unassigned.** The Cloudflare challenge did not clear in 30 s of an untouched, headful Chrome on a fresh profile; the challenge was never clicked, the terms remain unread and no capture is authorised. What would work is a human visit: if you open the Metformin article in your own browser and save the two screenshots by hand into `data/design-study/captures/wikiwand_com/`, the viewing step can run on them. Until then the surface stays unassigned and Vercel is the only rail anyone in this study has watched work [vercel F40: content-1440-scroll-50.png].
2. **Atlas Obscura — the judgement call, flagged.** Its terms limit use to "personal, noncommercial use", forbid copying "any part of the Service in any medium without … prior written authorization", and then expressly contemplate downloading or printing a copy of the Content for personal use; there is no anti-automation clause. Two private screenshots for a design study were treated as that personal-use copy and are never published. If you read the copying clause more strictly, `data/design-study/captures/atlasobscura_com` is deleted and the decision becomes link-only — which would remove the evidence behind atlas F28, F29, B1, B2, B3, B5 and B6 from this synthesis.
3. **Awwwards and Quanta are unobservable and their surfaces cannot be validated visually.** Awwwards governs browse/filter and Quanta governs reference/definitions, and each site's terms forbid what a capture requires — Awwwards reserves all rights and prohibits unauthorized reproduction; Quanta forbids storing or reproducing material and forbids systematic or automated collection. Both rows keep their Phase 1 measurements and are marked "measured, not seen". The decision is whether to accept two surfaces governed by numbers alone, or to reassign them to references that were seen.
4. **The gate's own robots breach, for Track B4.** The legal gate's after-the-fact audit found its API probes were on paths those hosts' robots files disallow: `api.osf.io/robots.txt` is `User-agent: * / Disallow: /` (three requests) and `zenodo.org/robots.txt` has `Disallow: /api` (three requests). Both are the public REST APIs the mandate names for B4's linkage design and both publish developer documentation inviting programmatic use, but the robots files say what they say. No further request went to either API in this track. How B4 reconciles the documented API terms with the robots files is a question for you before any linkage is built.

---

## Uniqueness and metric notes for A4

Recorded, not computed. Every figure below is either a finding or a number already in
`data/design-study/rnawiki_com.json` or the RESUME block.

### Fixed copy

About **half the words on the dossier's first screen are fixed copy that would repeat on all 9,852
pages**, rising to roughly **60 percent** once the templated backlog sentence is counted as fixed.
Counted from the capture: standing copy runs to roughly 64 words — "The same medicine can have
different answers…", "Research covered on this page", "General research summary", "IN 10 SECONDS",
"What is it for?", "What studies found", "What this result does not show", "This combines research on
different uses and groups…", plus the header and the pill. Medicine-specific text runs to roughly 68
words — the name, the trade name, one approval sentence, one indication phrase, one 13-word answer
and one 23-word callout. The backlog sentence is itself template copy on every unfinished page, and
"Small chemical medicine. Approved in the United States (FDA)." repeats across every approved small
molecule [rnawiki F42: content-1440-scroll-00.png].

Two further fixed-copy observations bear on the metric. The "In 10 seconds" card performs around
thin data: roughly 490×1180 px of tinted, bordered, internally ruled container holding about 68
words, of which roughly 49 are medicine-specific — **a page with ten trials and a page with none
would render the same box** [rnawiki F39: content-1440-tile-01.png]. And the page's most prominent
object below the `h1` is an interface control, not content [rnawiki F27: content-1440-tile-02.png].

### Empty sections

The home page handles absence correctly and is the model: it states the absence in normal body
weight and adds one grey line giving the rule that would change it — "No published contributor
changes this week yet." [rnawiki F29: index-1440-tile-02.png]. The dossier does not: it renders an
**editorial backlog note in the position and weight reserved for the answer** — "A study result is
available, but it still needs a short plain-language explanation." in the largest bold body text on
the page [rnawiki F30: content-1440-tile-01.png] — and spends warning colour on a grammatically
broken sentence whose content is a non-event [rnawiki F31: content-1440-tile-01.png].

The community and reference passes agree on the rule and extend it: absence must bind containers and
panels, not only fields. Zenodo handles field-level absence correctly and panel-level absence badly
on one page [zenodo F39, F40: content-1440-tile-08.png]; Vercel renders no placeholder but stretches
an emptier card to its row-mate's height so the slack reads as design
[vercel F32: content-1440-scroll-90.png]; Smashing keeps three labelled empty containers
[smashing F36: content-1440-tile-11.png]; and the forum supplies the missing half of our own rule —
a measured zero must print "0", or a collapsed row is ambiguous between "not measured" and "measured
as none" [forum F35: content-1440-scroll-90.png].

### Page shape

**There is no long scroll to judge: the dossier is two screens tall** — full-page height 1,844 px at
1440 px and 2,258 px at 375 px, with the 50 and 90 percent captures sitting at scrollY 472 and 850
on the same short page [rnawiki F18: content-1440-full.png]. The measurer records
`docScrollHeightPx` 1843 and `screensOfScroll` 2.05 for `/d/metformin`.

**Nothing enumerable is on the page.** There is no list and no table anywhere on the rendered
dossier; every list-shaped thing is behind a closed door — two collapsed disclosure rows and one
solid blue jump button [rnawiki F11: content-1440-tile-02.png]. The outline names six numbered
reader questions and 27 `h3` elements; the only `h3` visible in any capture is "Found a name that is
wrong?" at the foot of the page, so **as delivered the page is a summary card, one blue button and
two plus-signs** [rnawiki F41: content-1440-tile-02.png]. The measurer's landmark counts for the
same page are `h1` 1, `h2` 6, `h3` 27, with 455 `details` elements, 0 tables, 0 figures, 0 images
and 0 canvases.

**The reading column has no governing measure.** In the capture the widest card lines run about
700–740 px (one line measures 738 px) while the contribution card wraps near 505 px; the 672 px /
93-character figure is a Phase 1 measurer number, not a visual observation. On either reading the
column runs past the 68–86 character band the Phase 2 references converge on
[rnawiki F13: content-1440-tile-01.png; rnawiki F46: content-1440-scroll-50.png]. The measurer records the reading column as
`containerWidthPx` 768 with `paragraphContentWidthPx` 672, `charactersPerLine` 93, 16 px / 28 px
(ratio 1.75), body contrast 7.26:1.

**The end of the page does nothing to carry the reader onward** — a three-link row at 14 px grey,
then empty ground, then the shared footer; no next medicine, no related programme, no suggested
reading [rnawiki F22: content-1440-tile-02.png]. Section order therefore cannot yet do the work the
uniqueness constraint asks of it, because there are no visible sections to order.

### Visible-text share — the two definitions, and which is which

The RESUME block records **two definitions and they differ by two orders of magnitude. A4 must state
which one it reports, and must report the crawl figure for comparability.**

1. **The crawl definition — 8.3 percent.** "Visible text 8.3% of delivered HTML" comes from the
   overlap diagnosis's crawl of **server-delivered HTML**. This is the corpus-wide figure the
   mandate says must rise, and it is the number every comparison in Phase 1 and Phase 2 was made
   against.
2. **The live-measurer definition — 0.07 percent.** The live measurer's `innerText / outerHTML` on
   the **hydrated Metformin dossier** reads 0.0007: **1,970 visible characters** inside
   **2,816,103 characters (2.8 MB) of markup, of which 1.77 MB is the inline RSC payload**, and
   **collapsed sections are not in `innerText` at all**. The measurer's page record gives
   `visibleTextChars` 1,970 and `textToHtmlRatio` 0.0007 for `https://rnawiki.com/d/metformin`, and
   `visibleTextChars` 1,316 with `textToHtmlRatio` 0.0376 for the home page.

The findings are consistent with both and careful never to conflate them. Our own baseline records
the 0.0006–0.0007 ratio as a manifest `domEvidence` figure carried over from the measurer pass, not
as an observation from the images [rnawiki F10: content-1440-tile-01.png], and states the
uncomfortable comparison directly: **our dossier measures 0.0007, below the 0.0015 of
atlasobscura.com, the site Phase 2 dropped for exactly that number**
[rnawiki F46: content-1440-scroll-50.png; atlas A6: content-375-scroll-50.png].

**Comparable ratios recorded across the study, all DOM measurements rather than visual
observations.** Highest to lowest: experiment.com content page 0.1215
[experiment F8: content-1440-full.png]; openhumans.org content page 0.0995 — the highest recorded in
this study, against a Phase 1 highest of 0.0376 for rnawiki.com and a highest non-RNAWiki Phase 1
value of 0.0298 for smashingmagazine.com [openhumans F15: content-1440-scroll-50.png]; zenodo.org
record page 0.0548 [zenodo F37: content-1440-full.png]; sphere.diybio.org 0.0222
[sphere F43: index-1440-full.png]; wiki.biohack.me 0.0141
[wiki.biohack.me F6: content-1440-tile-01.png]; biohackrxiv 0.0134
[biohackrxiv F33: content-1440-tile-01.png]; linear.app/method 0.0119, itself a Phase 1 DOM figure
and not a visual observation [linear F30: content-1440-full.png]; stripe.com/docs 0.0083
[stripe F16: content-1440-full.png]; atlasobscura.com 0.0015
[atlas A6: content-375-scroll-50.png]. Zenodo's first-pass 0.0172 is unusable in either direction
because it was measured on a 1,102-character tombstone
[zenodo-first-pass F30: content-1440-tile-01.png].

Three cautions travel with those numbers and belong in A4's copy. Visual density is not delivery
density: Stripe's look sits on 0.83 percent
[stripe F16: content-1440-full.png]. Deference is cheap: Open Humans's plain markup and single
accent colour produce the highest ratio in the study
[openhumans F15: content-1440-scroll-50.png]. And a high ratio is not by itself a design: the two
highest-ratio pages in the study are also two of the thinnest
[experiment F8: content-1440-full.png; openhumans F17: content-1440-tile-02.png].

### The other uniqueness metric

The mandate's second reported figure is the **share of page words appearing on more than 90 percent
of other pages, target near zero**. This synthesis does not compute it. What the findings supply
towards it is the observed fixed-copy share on our own first screen — about half, rising to roughly
60 percent [rnawiki F42: content-1440-scroll-00.png] — and one live example of the failure it is
meant to catch: two named endorsers from two different organisations sharing one identical 28-word
closing sentence on a public page [experiment F50: index-1440-tile-09.png]. Two structural rules
from the captures reduce it directly: repeated scaffolding belongs in markup rather than prose, which
is what the badge triplet [zenodo B5: index-1440-tile-02.png] and the fixed summary-line grammar
[sphere F46: index-1440-tile-01.png] both do; and per-section repeated chrome — eight identical
"Copy for LLM" controls and a helpfulness prompt under every section — is the concrete way a page
acquires words that appear on more than 90 percent of other pages
[stripe F46: content-1440-full.png].

---

## Checker's record

An independent pass over every citation in this draft: 727 finding references were resolved against
`data/design-study/findings/*.json` and each named capture against that site's
`captures/<dir>/manifest.json`. Eighteen images were opened and read. Corrections were made in place
above; nothing was added that the findings do not carry.

### Corrections made

Eighteen citation instances failed a source check. Each is listed with what it rested on and what it
now rests on.

1. **"Three references were never seen" → "Four".** The sentence then lists wikiwand.com,
   quantamagazine.org, theverge.com and awwwards.com. `legal-gate-confirmations.json` records four
   separate non-capture decisions (wikiwand blocked, the other three link-only). Framing text, not a
   citation.
2. **Home first screen, "every other bordered object in neutral grey".** Contradicted by the cited
   image. Rewritten to "either neutral grey or a much paler blue tint", in both the Phase 3 passage
   and the Phase 2 Home row. Rested on `rnawiki F4` / `rnawiki F28`, whose own evidence lines call
   the featured card neutral grey; measured on `index-1440-tile-01.png`, the search-bar border is
   rgb(0,113,227) while the featured card is rgb(150,195,242) and the "RNA-silencing medicine" chip
   rgb(215,233,252). The substantive point — the bar owns the saturated accent — survives, so the
   sentence was qualified rather than deleted. The freeze itself is untouched.
3. **Stripe's saturated colour "inside the tinted code panel".** Contradicted by
   `content-1440-full.png`: the green POST rgb(33,112,5) and blue GET rgb(4,90,208) sit in the
   endpoint rows on white, outside the panel. Corrected to match `stripe F29`'s own evidence line,
   which names POST, GET and the JSON colouring together.
4. **`linear F30: content-1440-tile-02.png`.** F30's captures are `content-1440-full.png` and
   `content-1440-scroll-50.png`; tile-02 belongs to the verification note that refuted F8. Capture
   corrected to `content-1440-full.png`.
5. **`zenodo F38: content-1440-tile-02.png`, twice.** F38's three captures all sit under
   `zenodo_org-first-pass/`; tile-02 is a live-record capture. Citing it there attributed the
   tombstone's weaknesses to Zenodo's normal record page. Replaced with `zenodo B1`, whose captures
   include `content-1440-tile-02.png` and whose evidence states both weaknesses and the live page's
   copy control.
6. **The joined `F29, F30` citation on `content-1440-tile-01.png` in the A2 table's biohackrxiv row.** F30's captures are
   `content-375-scroll-50.png` and `content-1440-scroll-90.png`. Split so that F29 keeps
   `content-1440-tile-01.png` and F30 is cited on `content-375-scroll-50.png`.
7. **BioHackrXiv "four fields before the fold" → "three blocks".** `biohackrxiv F10`'s evidence says
   four; `biohackrxiv F28`'s says "the three visible metadata blocks", and
   `content-1440-tile-01.png` shows three: Authors, Abstract, Affiliated Institutions. Corrected and
   F28 added to the citation.
8. **Atlas "about 310 px", twice.** `atlas F12` says about 300 px; the 310 px figure is
   `atlas B2`'s. B2 added to both citations.
9. **Stripe "a fixed 48 px bottom bar".** `stripe F30` says only "a fixed bottom bar"; the 48 px
   measurement is `stripe F23`'s. F23 added.
10. **"the 68–86 character band", twice.** `rnawiki F13` does not carry that band; `rnawiki F46`
    does ("on either reading the column runs past the 68-86 band"). F46 added to both.
11. **Longevity Wiki "93 references, across 12,895 px".** `longevity F16` carries neither figure —
    93 is `longevity F9`'s, 12,895 px is `longevity F14`'s. Both added.
12. **Experiment "across 7,227 px" and the first-screen inventory.** `experiment F2` covers the h2
    section list only; the funding panel, the question-as-h1 and the counted tab row are
    `experiment F6`'s and the 7,227 px height is `experiment F15`'s. Both added.
13. **LongeCity "Cycloastragenol purity 98%" in the anti-pattern list.** `longecity F44` does not
    name the product; `longecity F23` does. F23 added.
14. **"an order of magnitude worse than atlasobscura.com", twice.** Two defects: `rnawiki F46`
    carries no text-to-HTML comparison, and the arithmetic is wrong — 0.0007 against Atlas's 0.0015
    is roughly twice as bad, not ten times. Rewritten to "below the 0.0015 of atlasobscura.com",
    with `atlas A6` (which records the 0.0015) added to both citations.

### Images opened

Eighteen captures across sixteen sites, read against the sentences that cite them.

1. `rnawiki_com/index-1440-tile-01.png` — **confirms** the 56 px headline with "10 seconds" in blue,
   the 16 px grey subline, the search bar carrying the saturated accent outline, the Feedback pill
   parked clear at lower right, and "9,852 medicine records". **Contradicts** "every other bordered
   object in neutral grey" (correction 2).
2. `rnawiki_com/content-1440-tile-01.png` — **confirms** the 12 px uppercase blue "IN 10 SECONDS"
   above 16 px body with the bold answer larger than its own heading; the backlog sentence "A study
   result is available, but it still needs a short plain-language explanation." set in the largest
   bold body text; the amber callout's lowercase, duplicated-subject sentence; "General research
   summary" stranded at the far right of the scope row; and the floating pill crossing the card
   border at about y=854.
3. `vercel_com_docs/content-1440-scroll-50.png` — **confirms** the contents rail tracking position
   with a left bar and darker ink, the ellipsis truncation ("Resources Tab and Deploym…"), the two
   distinct active-state grammars (filled grey pill in the sibling rail, left bar in the contents
   rail), the bordered figure with a centred grey caption naming the exact state shown, the
   three-column layout, and Ask AI / Log In / Sign Up holding the top-right corner at depth.
4. `linear_app_method/content-375-tile-01.png` — **confirms** the 375 px group/member size step:
   the `h2` "Principles" is visibly taller than the `h3` "Build for the creators" beneath it. Also
   confirms the serif page-start marker.
5. `smashingmagazine_com/index-1440-tile-01.png` — **confirms** the saturated red band across the
   top ~105 px, the pink chip row for a further ~65 px, and black-on-white content below.
6. `atlasobscura_com/index-1440-tile-01.png` — **confirms** the Place of the Day photograph at
   about 52 percent of viewport width as the only saturated colour, and the 456 px unfilled outlined
   search pill. Also shows the unlabelled ~245 px band above the header that verification correctly
   removed from the advertising findings.
7. `zenodo_org-first-pass/content-1440-tile-01.png` — **confirms** the tombstone exactly: `h1`
   "Gone", one plain sentence, and six labelled rows (Reason for removal, Removed by, Deletion
   Policy, Date of removal, Citation, Identifier), the box ending where its content ends, the DOI
   rendered as unlinked black text, and the full marketing header standing above it.
8. `longecity_org/content-1440-tile-01.png` — **confirms** the error page: "Sorry, we couldn't find
   that!", "We could not find the forum you were attempting to view.", the dimmed right-aligned
   `[#10333]`, three concrete routes forward, the footer "Change Theme" link, and the
   "crackaging.com - telomerase activation supplements" site-wide sponsor.
9. `openhumans_org/content-1440-tile-01.png` — **confirms** six complete records and the start of
   three more in one 1440×900 screen; the four-level card with only the numeral bold; "1479" bold
   against "New York University" in small light grey; "Connected by" and "Joined by" in identical
   type; and an absent affiliation rendering nothing while the card shortens.
10. `forum_quantifiedself_com/content-1440-tile-02.png` — **confirms** rows of at most seven fields
    with many showing four, the bold 15.6k view count dominating the screen, a missing category
    chip collapsing the row, reply counts printing "0", a date on every row, the undecorated
    hairline construction, unlabelled numeric columns past the header, and the citizen-science
    supplement-trial topics.
11. `longevity_wiki/content-1440-tile-11.png` — **confirms** the two-column reference list running
    left 1–47 and right 48–93 down the same height, citation ink varying three ways with no legend,
    and the unlabelled superscript back-link clusters ("11.0 11.1", "13.0 13.1 13.2").
12. `experiment_com/content-1440-tile-05.png` — **confirms** "Project fully funded" carrying a
    completed event's dot, a uniform dot pitch against intervals of 16, 19, 25 and 31 days, a "Show
    more events" control stating no count, and the empty right column.
13. `sphere_diybio_org/content-1440-tile-03.png` — **confirms** the map legend's recessive grey dot,
    the opt-in checkbox with the default in plain words, the merged "Inactive / unknown labs" state,
    the heading over a graphic that is not there, the newsletter block as the only tinted element,
    and the footer provenance chain set in the palest type on the page.
14. `biohackrxiv/content-1440-tile-01.png` — **confirms** the breadcrumb identifier and version,
    the two unlabelled icon buttons, the 65-page embedded PDF, the two unexplained author states,
    the comma-joined string splitting "Kumar Koushik Telaprolu" into two names, the "See more" /
    "Read more" controls, and the fixed Help beacon over the metadata card. **Contradicts** "four
    fields before the fold" (correction 7).
15. `stripe_com_docs/content-1440-full.png` — **confirms** "Charges" and "The Charge object" at the
    same size and weight and about twice the field-name size; the hairline rows with no zebra or
    cell boxes; exactly eight distinct groups on the first screen; the boxed exact record under a
    "THE CHARGE OBJECT" header bar; the `/` chip on the header search; the theme control with the
    page captured light; and the fixed "Developers" bar. **Contradicts** the placement of the
    saturated method words (correction 3).
16. `pudding_cool/index-1440-tile-01.png` — **confirms** the centred hand-drawn wordmark, the
    "Find a story…" field at about 168 px as the quietest object on its row, the sticker buttons and
    exactly six drawn filter chips, and three cards per row with exactly five fields each.
17. `wiki_biohack_me/content-1440-tile-01.png` — **confirms** verification's correction that the
    current topic "Biology" is still an ordinary blue link with no current-page marker; eight topic
    links at identical weight; the card holding one `h1`, three bold labels and four links with the
    bottom third blank; existence-coded links (red dotted "Neuro" and "DIY HRT", blue solid
    otherwise); the contents panel overlaid on the reading column covering the rule under the `h1`;
    the `biology.txt` / 2025-04-16 05:57 / cyberlass provenance line; the raw `[[ biology ]]` badge;
    and the licence stated once in the footer.
18. `zenodo_org/content-1440-tile-01.png` — **confirms** "11K VIEWS / 4K DOWNLOADS" set larger than
    the `h1`; the versions panel newest-first with a DOI and date per row, the current revision
    filled pale blue and not linked, "View all 210 versions", and the cite-all-versions DOI stated
    in words; three versions deposited on one day; a repository path as title and an organisation as
    creator; the "Open" badge and the Dockstore community banner; and two `h1` elements about 90 px
    apart at almost the same size.

### Rule breaches found

- **One.** `zenodo F38` was cited on `content-1440-tile-02.png`, a capture of the live Zenodo record
  page, for the tombstone's two weaknesses. F38 rests entirely on `zenodo_org-first-pass/` captures,
  so the citation attributed a first-pass tombstone observation to the site's normal record page.
  Fixed in both places (correction 5).

Checked and clear:

- **Wikiwand.** No substitute reference is invented anywhere. The contents-rail surface is stated as
  unassigned in the rule list, in the table row, in the changes list and in the open decisions.
- **Awwwards and Quanta.** Both are marked "measured, not seen" in the rules, in their table rows
  and in the changes list; only observed secondaries are added under them. Nothing visual is
  attributed to either.
- **The home search bar.** Every mention is a freeze or a corroboration of the freeze. No sentence
  in the draft proposes altering its position, prominence or behaviour.
- **Light default.** Stated as decided and not re-litigated; the only movement is the correction
  that Stripe's reference page shows a theme control, which the draft itself marks as not affecting
  the default.
- **Promotional vocabulary.** None present.
- **Refuted findings.** Every id removed in verification — atlas F24, biohackrxiv F16, experiment F1,
  forum F18, linear F8, openhumans F4, pudding F33, rnawiki F5, smashing F22 and F34, sphere F48,
  zenodo-first-pass F28 — is absent from its findings file and appears in this draft only inside the
  "Claims dropped for lack of evidence" list, never as support for a sentence.
- **Protocol or dose language.** None. The one dose-shaped passage, Longevity Wiki's unlabelled
  "Optimum" dose-response cartoon, is stated as an anti-pattern our editorial rule forbids.
- **The A2 table.** All nine rows were read cell by cell against the findings they cite; apart from
  correction 6 every cell is carried by its cited claim.

### Two figures that rest on the capture state note rather than on a finding

Recorded so a later phase does not mistake them for visual findings. The draft's LongeCity framing —
that the content capture is the 404 served for a guessed `/forum/forum/3-supplements/` URL, and that
the live Supplements forum timed out twice at 60 s and gave no response to a 90 s plain request on
2026-09-04 — is not in `findings/longecity_org.json`, whose findings say only "error page". It is
recorded verbatim in `data/design-study/state.json`'s `captureNote` for the site, and
`capture-run-4.log` shows the 60 s timeout on the `/6-supplements/` retry. The wording is left
standing because that record supports it; `longecity F25` supports only the error-page half.

The Phase 1 measurer figures the draft already labels as such — 0.0007 and 0.0376 for our own pages,
the 17.9:1 mirrored-ramp contrast, the 672 px / 93-character column — were checked against
`data/design-study/rnawiki_com.json` and are as recorded. `longecity_org` and
`longecity_org-first-pass` were confirmed byte-identical in both findings and captures, so the
draft's "the first pass stands" is exact.
