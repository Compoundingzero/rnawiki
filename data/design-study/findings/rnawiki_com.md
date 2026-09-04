# rnawiki.com — Track A / A1 visual findings (baseline, our own site)

RNAWiki is the public medicine-evidence record this study is being run for, judged here with the
same eyes as the nine reference sites. Two pages were captured on 2026-09-03: the home page
`https://rnawiki.com/` and one dossier, `https://rnawiki.com/d/metformin`, each at 1440×900 and
375×812, with real scrolled viewport views at 0 %, 50 % and 90 % of the dossier. Sixteen images were
viewed: `index-1440-full.png`, `index-1440-tile-01.png`, `index-1440-tile-02.png`,
`index-375-full.png`, `index-375-tile-01.png`, `content-1440-full.png`, `content-1440-tile-01.png`,
`content-1440-tile-02.png`, `content-1440-scroll-00.png`, `content-1440-scroll-50.png`,
`content-1440-scroll-90.png`, `content-375-full.png`, `content-375-tile-01.png`,
`content-375-scroll-00.png`, `content-375-scroll-50.png`, `content-375-scroll-90.png`. Numbers
quoted are from the measurer pass in `data/design-study/rnawiki_com.json` and from
`domEvidence` in the capture manifest; everything else is what the images show.

**Banner note.** `bannerActions` records a banner left standing on `index-375`, `content-1440` and
`content-375`, and a banner still visible after a refusal click on `index-1440`. No consent or
cookie banner is visible in any of the sixteen images. The control list the manifest records for
that element — Browse all medicines, Public datasets, How this works, Editorial policy, Review
queue, Analytics choices — is exactly the footer link row seen in `index-1440-full.png` and
`content-1440-full.png`, so the detector appears to have matched the footer, not a banner. Nothing
in these captures should be discounted as banner overlay. The one genuine overlay in every capture
is the site's own floating pill ("Feedback" on the home page, "Sections & feedback" on the dossier),
which is design, not a banner.

## 1. Visual hierarchy

F1. On the dossier one element has typographic authority: the h1 "Metformin" at 56 px, weight 700,
letter-spacing −2.52 px. Below it exactly one further rank is visible, and it is not a heading — the
card's "What studies found" and "A study result is available…" lines sit at roughly 18–20 px bold,
above the 16 px body. Every heading element on the page renders at or below body size, so rank below
the title is handed over to boxes, tint and rules.
[capture: content-1440-tile-01.png, content-1440-scroll-00.png]

F2. The section heading is smaller than the text it introduces. "IN 10 SECONDS" is an h2 at 12 px,
uppercase, 1.44 px tracking, blue `rgb(10,102,216)`; the sentence beneath it is 16 px, and the
"What studies found" answer below that is larger still and bold. Read as an image, the label looks
like a chip and the answer sentence looks like the heading. The rank the markup declares and the
rank the eye reads are opposite. [capture: content-1440-tile-01.png, content-375-tile-01.png]

F3. Because type does almost nothing, the ranking on the dossier's first screen is done by colour
areas: pale-blue card first, amber callout second, grey rules third. Two coloured containers, no
heading scale in between. [capture: content-1440-tile-01.png, content-1440-scroll-00.png]

F4. The home page hierarchy, by contrast, is clean and reads in three ranks in the intended order:
56 px headline with the phrase "10 seconds" in blue, then a 16 px grey line of what the site shows,
then the search bar — the only element on the screen drawn with an accent-blue outline. Other
bordered objects do sit on that first screen (the "Sign in" pill, the "Public evidence" chip, the FDA
chip, the featured card), all in neutral grey. Size, colour and position agree.
[capture: index-1440-tile-01.png]

## 2. Where the eye lands first

F6. Desktop home: the eye lands on "Understand any drug in 10 seconds.", pulled to the blue
"10 seconds", then drops straight to the search bar, the only accent-blue outlined object on the
screen. That is the content and the intended primary action, in order, with no chrome competing; the
Feedback pill is parked low-right and clear of it. [capture: index-1440-tile-01.png]

F7. Desktop dossier: the eye lands on "Metformin" — correct — then on the large pale-blue card. The
white floating "Sections & feedback" pill sits at the right edge at about y=854, crossing the blue
card's border. Whether it ranks third is not something a still can settle — the amber callout is the
stronger colour signal (F3) — but what the capture does show is a piece of navigation chrome sitting
on top of the evidence card. [capture: content-1440-scroll-00.png, content-1440-tile-01.png]

F8. Mobile home: the eye lands on the headline, then on the search bar — but the bar's placeholder
is cut off mid-word by the Search button ("Search medicine, condition, ⌐"), so the first interactive
thing a mobile reader sees is visibly clipped. [capture: index-375-tile-01.png, index-375-full.png]

F9. Mobile dossier: "Metformin" at 36 px lands first, with the trade name and the regulatory line
filling the top ~230 px. Then the blue card. The floating pill lands here too, sitting over the lower
part of the card and covering one of its internal hairlines on the very first screen.
[capture: content-375-scroll-00.png]

## 3. Information density

F10. The dossier's first desktop screen carries roughly 65 words of medicine-specific text — a
13-word scope sentence, a 13-word backlog sentence, a 23-word callout, a 9-word indication phrase and
an 8-word regulatory line — inside a card about 490 px tall. The whole page's visible text is 1,784
characters against 2.8 MB of delivered HTML, a ratio of 0.0006; both figures come from the manifest's
`domEvidence`, not from the images. [capture: content-1440-tile-01.png, content-1440-full.png]

F11. There is no list and no table anywhere in the captured dossier. Everything list-shaped — trials,
studies, sources, mechanism stages, alternatives — is behind closed doors, but they are not three
matching rows: "More about this medicine" (title plus subtitle) and "Add a community note" (one line)
are disclosure rows with a plus glyph, while "See how we know" is a solid blue button with a down
arrow. The page as delivered is a summary, one button and two plus-signs.
[capture: content-1440-tile-02.png, content-1440-scroll-90.png]

F12. Home page density: one featured medicine card, one empty-state card, one collapsed explainer.
The line "9,852 medicine records" appears in 12 px grey under the featured card and is the only place
the corpus size is stated. Two routes into the corpus need no typing — the four "Popular:" links and
"Browse all medicines" in the footer — but no listing, facet or index appears on the page itself.
[capture: index-1440-full.png, index-1440-tile-02.png]

F13. The reading column has no single governing measure. In the capture the widest card lines run
about 700–740 px ("This combines research on different uses and groups…" is one 738 px line) while
the contribution card wraps near 505 px. The 672 px / 93-characters figure quoted for this page is a
Phase 1 measurer number rather than something the images show; on either reading the card lines run
past the 68–86 character band the Phase 2 references sit in. On the dossier this rarely bites because
paragraphs are two lines long; it would bite immediately on a page with real evidence prose.
[capture: content-1440-tile-01.png]

## 4. Whitespace

F14. Whitespace is spent almost entirely on the outside. Desktop margins are about 130 px each side
of an 1180 px article and the gaps between the card stack run 32–57 px; below the last link row the
dossier leaves roughly 150 px of empty ground before the footer band — `content-1440-scroll-90.png`
puts the link row at y≈701 and the footer edge at y≈855. The "4 px covers 90.6 % of computed
spacing" figure is from the Phase 1 measurer, not from these images. The page is generous where
nothing is happening and plain where the reading is. [capture: content-1440-full.png,
content-1440-tile-02.png, content-1440-scroll-90.png]

F15. Whitespace is also being used to hide thin data. The "Found a name that is wrong?" card is about
1180 px wide; its text column ends near x=660 and the "Suggest a correction" button is pushed to
x=1060–1285, leaving roughly 400 px of nothing between a paragraph and its own button. The right half
of the card is empty apart from that button, which is sized for content that is not there.
[capture: content-1440-tile-02.png, content-1440-scroll-90.png]

F16. On the home page a roughly 115 px void sits between the "Popular:" chips and the "FEATURED
MEDICINE" label, and a second void of about the same size between the "9,852 medicine records" line
and "PUBLISHED THIS WEEK". The two are close to equal rather than one being larger. Both read as "the
page ended", so the featured card and the contributors block feel like separate pages stacked rather
than sections of one. [capture: index-1440-full.png]

F17. The one place whitespace says something useful: the blue card's internal 1 px rules split
"What is it for?" from "What studies found" from the footnote, each with about 30 px of clearance
either side. The rules themselves fall roughly 100 px and 165 px apart, so the interval tracks
content length rather than a fixed rhythm; the even clearance, not the interval, is the pattern worth
keeping. [capture: content-1440-tile-01.png]

## 5. Long scroll

F18. There is no long scroll to judge. The dossier is 1,844 px tall at 1440 wide — two screens — and
2,258 px at 375. The 50 % and 90 % scroll captures are 472 px and 850 px down the same short page.
Whatever the page does with a long scroll is untested, because no medicine page currently produces
one. [capture: content-1440-full.png, content-1440-scroll-50.png, content-1440-scroll-90.png]

F19. What persists is a 65 px sticky header carrying the wordmark, a search input and "Sign in",
present identically at 0 %, 50 % and 90 %. At 50 % and 90 % the page text ghosts faintly through its
`backdrop-blur-xl` behind the wordmark — legible enough to notice as smudge, not as text.
[capture: content-1440-scroll-50.png, content-1440-scroll-90.png]

F20. The floating "Sections & feedback" pill is fixed and persists at every depth and both
viewports. At mobile 90 % it sits on top of the footer and covers the middle of "RNAWiki.com •
Public medicine evidence", leaving "Publ…" visible. A persistent control obscuring the site's own
footer text is a defect, not a layer. [capture: content-375-scroll-90.png, content-375-scroll-50.png]

F21. Nothing else persists: no contents rail, no reading-progress indicator, no sticky section
label. The measurer records `tocPresent: false` with the reason "no visible element 80–480 px wide
holding three or more in-page links". The Stripe-style rail the Phase 2 table proposes has no
counterpart here today. [capture: content-1440-scroll-50.png, content-1440-scroll-90.png]

F22. The end of the page does nothing. A three-link row (Browse all medicines / Review queue / How
this works) at 14 px grey, then empty ground, then the shared footer. There is no next medicine, no
related programme, no "what to read now". The reader is returned to the site, not carried onward.
[capture: content-1440-tile-02.png, content-375-scroll-90.png]

## 6. Imagery

F23. There are no images. `imgCount` is 0 and `canvasCount` is 0 on the dossier, and no photograph,
molecular figure, chart or diagram appears in any of the sixteen captures. About ten SVG glyphs are
actually visible — the search magnifier, the "See how we know" down-arrow, the card arrows, the
pencil on "Suggest a correction", the circle-minus on the scope row, the "+" on each disclosure row.
The `svgCount` of 529 is a DOM count that includes nodes inside the closed disclosures and cannot be
characterised from the captures. [capture: content-1440-full.png, index-1440-full.png]

F24. This is defensible for a record that must not invent, and nothing decorative is being faked. But
it means the mechanism — the one thing on a medicine page that is genuinely diagrammatic — has no
visual form on the rendered page at all. "How the medicine is expected to work" appears only in the
heading outline, where it sits under the h2 "What this research summary covers", i.e. behind the "See
how we know" door rather than inside "More about this medicine". The absence is honest and it is also
the largest unused surface on the page. [capture: content-1440-tile-02.png]

## 7. Defers or competes

F25. The chassis defers well. One accent blue, a near-white ground (`rgb(245,245,247)`), body text at
`rgb(29,29,31)`, system type, thin rules. Nothing on either page is styled for effect. The 4 px
spacing base at 90.6 % adherence and the 7.26:1 body / 15.46:1 title contrast ratios are Phase 1
measurer figures carried over, not observations from these images. [capture: index-1440-tile-01.png,
content-1440-tile-01.png]

F26. But on the dossier the containers compete with what they contain. The blue card occupies about
490 × 1180 px to hold four sentences; inside it the amber callout occupies about 115 × 1095 px to
hold one. Two coloured, bordered, rounded containers are doing the work of emphasis for text that
would carry itself. The frame is larger than the thing framed. [capture: content-1440-tile-01.png,
content-375-scroll-50.png]

F27. The most prominent object on the dossier below the h1 is the solid blue "See how we know" pill,
centred on its own line with a subtitle underneath. An interface control is the visual climax of an
evidence page. It is not unique in kind: "Suggest a correction" lower down uses the same solid blue
fill. [capture: content-1440-tile-02.png, content-1440-scroll-50.png]

F28. The home page does not compete. Nothing sits above or beside the search bar; it is the only
accent-blue outlined element on the first screen, with every other bordered object (Sign in pill,
chips, featured card) in neutral grey; the "Feedback" pill is parked low-right and clear of it. The
frozen constraint is visibly honoured in the rendered page. [capture: index-1440-tile-01.png,
index-375-tile-01.png]

## 8. Absence handling

F29. The home page handles absence properly. "No published contributor changes this week yet." sits
in a white card at 16 px bold with a 14 px grey line explaining exactly when the list would change.
It states the absence, gives the rule, and does not pretend. This is the best absence treatment
observed on either page. [capture: index-1440-tile-02.png, index-375-full.png]

F30. The dossier does not. Under "What studies found" — the largest, boldest body text on the page —
it says "A study result is available, but it still needs a short plain-language explanation." That
is an editorial backlog note, rendered in the position and weight reserved for the answer. A reader
who came for what studies found is shown the work queue instead, at maximum emphasis.
[capture: content-1440-tile-01.png, content-375-tile-01.png, content-375-scroll-00.png]

F31. The amber "What this result does not show" callout carries broken prose: "the study, the study
designed to test whether metformin slows ageing, has been designed and publicised for a decade and
has never started." It opens lowercase and repeats its subject — a sentence assembled from fragments
rather than written. It is also the second-most emphasised block on the page.
[capture: content-1440-tile-01.png, content-1440-scroll-50.png, content-375-scroll-50.png]

F32. At 1440 px "General research summary" appears at 14 px grey with a circle-minus glyph pinned
near x=1140–1310, while the scope text it qualifies ends near x=458 — about 700 px of empty row
between them, which makes it read as a stray control rather than a qualification of "Type 2 diabetes,
and blood sugar that is too high". This is desktop-only: at 375 px the same label sits directly
beneath the scope line and reads correctly. [capture: content-1440-tile-01.png,
content-375-tile-01.png]

F33. At 375 px the search placeholder is clipped by the Search button, and the "Popular:" chip row
wraps with a dangling separator dot at the end of the first line. Both are small, both are on the
first screen of the site's most important page. [capture: index-375-tile-01.png, index-375-full.png]

## 9. Inferred behaviour, and what the evidence does not support

F34. Inferred: a sticky header and one fixed bottom-anchored element persist through scroll. Marked
inferred only in mechanism; the persistence itself is directly visible. Evidence: `stickyOrFixed` —
`header.sticky.top-0.z-40` at 65 px, and `div.pointer-events-none.fixed.inset-x-0.bottom-0` at 44 px.
[capture: content-1440-scroll-50.png, content-1440-scroll-90.png] *(inferred; domEvidence key:
stickyOrFixed)*

F35. No ⌘K command palette. `kbdTexts` is empty and `ariaKeyshortcuts` is empty, and no keyboard
hint appears anywhere in the header in any capture. `scriptTokens.metaKey` is true on the dossier,
but the separate measurer pass found no `metaKey` reference in 1.77 M characters of inline script and
15 external scripts were never fetched, so the two passes disagree and neither supports a palette
claim. What the captures show is a plain always-present input, matching `searchAffordances`
("input Search by medicine, condition, gene, or", "button Search medicines").
[capture: content-1440-scroll-00.png, index-1440-tile-01.png] *(inferred-negative; domEvidence keys:
kbdTexts, ariaKeyshortcuts, scriptTokens, searchAffordances)*

F36. No theme toggle and no dark mode. `prefersColorScheme.found` is false across the one readable
stylesheet, `htmlAttributes.dataTheme` is null, and no control labelled theme or appearance exists.
Light default is not a decision the page has to defend — it is currently the only mode.
[capture: index-1440-full.png] *(inferred; domEvidence keys: prefersColorScheme, htmlAttributes)*

F37. Copy controls are unresolved and should not be claimed. The capture manifest records
`copyControls.count: 0` on the dossier; the earlier measurer pass recorded two copy/clipboard
controls. No copy affordance is visible in any of the sixteen images, so nothing is asserted.
[capture: content-1440-tile-01.png, content-1440-tile-02.png] *(inferred; domEvidence key:
copyControls)*

## 10. Honest baseline verdict

F38. **What a reader sees first is a name, then a container, then a queue message.** On
`content-1440-scroll-00.png` the sequence is "Metformin" (56 px), the pale-blue card, and then — as
the largest body text on the page — "A study result is available, but it still needs a short
plain-language explanation." The floating chrome pill sits lower still, at about y=854, so it is met
after the answer slot rather than before it. The single most emphasised sentence on our flagship
dossier tells the reader that the answer has not been written yet.
[capture: content-1440-scroll-00.png, content-1440-tile-01.png]

F39. **The "In 10 seconds" card performs around thin data.** It is roughly 490 × 1180 px of tinted,
bordered, internally ruled container holding "Used or studied for type 2 diabetes, and blood sugar
that is too high", one backlog sentence, one broken amber callout and a 19-word standing disclaimer.
Strip the container and there are about 68 words, of which roughly 49 are medicine-specific. The
card's weight is set by the layout, not by the evidence in it; a page with ten trials and a page with
none would render the same box. [capture: content-1440-tile-01.png, content-375-tile-01.png]

F40. **The coloured callouts do not defer.** Amber on cream with a left rule is the visual grammar of
a warning, and it is being spent on a sentence that is grammatically broken and whose content is a
non-event ("has never started"). The strongest colour signal on the page is attached to the weakest
prose on the page. [capture: content-1440-tile-01.png, content-1440-scroll-50.png]

F41. **The sectioned questions are not on the page at all.** The outline names six numbered reader
questions and 27 h3s. The only h3 that appears in any capture is "Found a name that is wrong?" at the
foot of the page; the six numbered questions and the other 25 h3s are inside "See how we know" and
"More about this medicine", both closed. What we describe as a structured evidence page is, as
delivered, a summary card, one blue button and two plus-signs. [capture: content-1440-tile-02.png,
content-1440-scroll-90.png]

F42. **About half the first screen is fixed copy that would repeat on all 9,852 pages.** By count of
what is visible on `content-1440-scroll-00.png`, standing copy runs to roughly 64 words: "The same
medicine can have different answers for different uses and groups of people", "Research covered on
this page", "General research summary", "IN 10 SECONDS", "What is it for?", "What studies found",
"What this result does not show", "This combines research on different uses and groups. It is
background, not a reviewed answer for one specific use.", plus the header and the pill. Against that,
roughly 68 words are medicine-specific: "Metformin", "Glucophage", "Small chemical medicine. Approved
in the United States (FDA).", "Type 2 diabetes, and blood sugar that is too high", one 13-word answer
sentence and one 23-word callout. Counting the templated backlog sentence as standing copy — which it
is, on every unfinished page — pushes the fixed share to about 60 %, and the approval line is itself
template copy shared by every approved small molecule. Around half to sixty per cent, then, not
two-thirds; the uniqueness constraint is still failing in the rendered page, not just in the metric.
[capture: content-1440-scroll-00.png, content-1440-tile-01.png]

F43. **The heading sizes flatten the hierarchy.** 56 / 12 / 14 px over a 16 px body leaves no heading
rank at all below the title. The one place the page does step up — the ~18 px bold "What studies
found" line inside the card — is body text, not a heading, which is exactly why the 12 px label above
it reads as a chip. There is no way for the page to say "this section matters more than that one", so
the only lever left is a coloured box — which is why the page has coloured boxes. The type scale is
the cause and the containers are the symptom; fixing the containers without fixing the scale will
just move the problem. [capture: content-1440-tile-01.png, content-1440-tile-02.png,
content-375-tile-01.png]

F44. **Mobile makes the thinness plainer, not worse.** At 375 px the h1 drops to 36 px and the same
content occupies 2,258 px. The first screen carries the name, the trade name, the regulatory line,
the scope row and the whole "In 10 seconds" answer down to "explanation."; the amber callout and the
disclaimer arrive on screen two and the page ends there. It is honest and it is nearly empty. The one
mobile defect is the fixed pill, which covers the card's lower hairline at 0 %, the "Found a name
that is wrong?" heading at 50 % and footer text at 90 %. [capture: content-375-scroll-00.png,
content-375-full.png, content-375-scroll-50.png, content-375-scroll-90.png]

F45. **The home page is the stronger half of the baseline and should not be touched.** Three ranks,
one action, an honest empty state, nothing above or beside the search bar. Every problem of substance
is on the dossier; the two home-page defects in this pass are both cosmetic and both at 375 px — the
clipped search placeholder (F8) and the dangling separator dot in the "Popular:" row (F33).
[capture: index-1440-tile-01.png, index-1440-tile-02.png]

## Phase 2 bearing

F46. This pass **strengthens** four rows of the Phase 2 table and overturns none. *Compound dossier —
reading column (Smashing)*: the widest card lines measure about 700–740 px in the capture — the
93-character figure is a Phase 1 measurer number rather than an image observation — and either
reading puts the column past the 68–86 band; our 56/12/14 px scale is the concrete failure Linear's
space-not-size hierarchy was chosen to fix. *Compound dossier — contents rail (unassigned)*:
`tocPresent: false` and the total absence of any persistent rail in the 50 % and 90 % captures
confirm the gap is real, not hypothetical. *Structured data blocks (Stripe)*: we have no structured
block on the rendered page at all — two collapsed rows and one blue button stand where 61 field
blocks stand on the reference. *Global search overlay (Vercel)*: the header input is present and
plain at 1440 px, with no keyboard hint visible, so that row remains an unimplemented target rather
than a description of us. *Home (Apple subtraction, frozen)*: validated visually — the rendered first
screen already has nothing competing with the bar. [capture: content-1440-scroll-50.png,
content-1440-tile-02.png, index-1440-tile-01.png]

## Verifier additions

V1. The fixed "Sections & feedback" pill collides with the page's one contribution action at desktop
too, not only at mobile. In `content-1440-scroll-50.png` the pill sits directly on the top-right
corner of the solid blue "Suggest a correction" button; in `content-375-scroll-50.png` the same pill
covers the h3 "Found a name that is wrong?" mid-word. A persistent overlay that lands on the control
which starts a correction is a defect at every viewport, not a mobile-only one.
[capture: content-1440-scroll-50.png, content-375-scroll-50.png]

V2. The same account control is labelled two different ways across viewports: the header pill reads
"Sign in" at 1440 px and "Log in" at 375 px, on both the home page and the dossier. One control, two
names, inside a single capture set. [capture: index-1440-tile-01.png, index-375-tile-01.png,
content-1440-tile-01.png, content-375-scroll-00.png]

V3. The header search changes kind, not size, between viewports. At 1440 px the dossier header
carries a full input reading "Search medicines, conditions, trials…"; at 375 px it collapses to a
bare magnifier glyph with no label and no visible indication that it opens a search. The dossier
offers no related medicines and no listing, so search is its only onward route into a corpus of
9,852 records — and at mobile that route is one unlabelled glyph. The home page also uses a different
placeholder ("Search medicine, condition, gene, or protein…") from the dossier header, so the same
field states its own scope two ways. [capture: content-1440-scroll-00.png, content-375-scroll-00.png,
index-1440-tile-01.png]

## Verification

Verified 2026-09-04 by an independent pass over the same sixteen images. 18 findings confirmed, 27
qualified and rewritten, 1 refuted and removed, 3 added (V1–V3). The single most important
correction: the dossier does have a second visible typographic rank — the card's ~18–20 px bold
"What studies found" and "A study result is available…" lines — but it belongs to body text rather
than to any heading element, which is why the 12 px label above it reads as a chip. F1, F5 and F43
all rested on "one visible level".

**Refuted and removed**

- **F5** — "33 headings and one visible heading level". The captures show three visible heading
  sizes (h1 56 px, h2 12 px, the one rendered h3 at ~17 px bold), and the example given — that "More
  about this medicine" and "Found a name that is wrong?" are indistinguishable in weight from the
  prose beside them — is contradicted by `content-1440-tile-02.png`, where both read clearly bolder
  and darker. The 33-heading and 27-h3 counts it carried survive inside F41.

**Qualified and rewritten**

- **F1** — a second visible rank exists (the ~18–20 px bold card lines); the true claim is that no
  *heading* holds it.
- **F4, F6, F28** — "the only outlined element on the first screen" is false; the Sign in pill, the
  "Public evidence" chip, the FDA chip and the featured card all carry borders. Rewritten to "the
  only accent-blue outlined element", which is both true and the point.
- **F7** — the pill's overlap of the card border is visible; its rank as "third-strongest object" is
  not, and F3 already ranks the amber callout above it.
- **F9** — the pill overlap is confirmed; "holds the top third alone" is not, since the trade name
  and regulatory line share that band.
- **F10, F39, F42** — word counts recounted from the captures: about 65 medicine-specific words on
  the first desktop screen, about 68 words inside the card, and about half rather than two-thirds of
  first-screen words as fixed scaffolding.
- **F11, F41** — there are two plus-rows, not three; "See how we know" is a solid blue button with a
  down arrow. F41 additionally overstated "none is visible": one h3 is.
- **F12** — "no way to see more without typing" is refuted by the four "Popular:" links and the
  footer's "Browse all medicines"; the density point survives without that clause.
- **F13, F46** — 93 characters per line is a Phase 1 measurer number, not an image observation; the
  captures show card lines of about 700–740 px against a 505 px wrap in the contribution card.
- **F14** — the empty ground before the footer measures roughly 150 px, not 250 px; the 4 px/90.6 %
  figure is re-attributed to the measurer.
- **F15** — the right half of the card is not entirely empty; it holds the button, pushed to the far
  edge.
- **F16** — the two home-page voids are close to equal (~115 px each), not one larger than the other.
- **F17** — the hairlines are not evenly spaced (~100 px and ~165 px apart); the even quantity is the
  ~30 px clearance either side.
- **F23** — `svgCount` 529 is a DOM count including nodes inside closed disclosures; only about ten
  glyphs are visible, so "every SVG" cannot be characterised from the captures.
- **F24** — the mechanism heading sits under "What this research summary covers" in the outline, so
  behind "See how we know", not inside "More about this medicine".
- **F25** — the contrast ratios and spacing adherence are Phase 1 measurer figures, re-attributed;
  the visual restraint claim stands.
- **F27** — "Suggest a correction" uses the same solid blue fill, so "See how we know" is the most
  prominent such control, not the only one.
- **F32** — desktop-only. The mobile capture it cited shows the label sitting correctly beneath the
  scope line.
- **F38** — reading order corrected: the backlog sentence is met before the floating pill, not after.
- **F43** — same correction as F1: the flattening is that no heading occupies the second rank the
  card's body text already holds.
- **F44** — the whole "In 10 seconds" answer is on the first mobile screen, not the second.
- **F45** — "every real problem is on the dossier" is contradicted by F8 and F33 in this same pass;
  restated as every problem *of substance*, with the two cosmetic home-page defects named.

**Not discounted.** The `bannerActions` false positive was already correctly identified by the
viewer; no finding reads a consent banner as design, and nothing was set aside on banner grounds.
