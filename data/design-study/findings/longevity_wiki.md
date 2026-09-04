# Longevity Wiki — Track A2 visual findings (recaptured 2026-09-04)

Longevity Wiki (`en.longevitywiki.org`) is a public MediaWiki whose subject is exactly ours: named
compounds, animal and human evidence for healthspan and lifespan, written and edited by a community
rather than by a registry. Two pages were captured: the main page
`https://en.longevitywiki.org/wiki/Longevity_Wiki` (index) and the Rapamycin article
`https://en.longevitywiki.org/wiki/Rapamycin` (content), each at 1440x900 and 375x812. The article
is very tall — 12,895 px at desktop and 31,729 px at mobile, so the mobile `-full` image is
truncated at the 16,384 px rasterizer cap and the mobile tiles between 12 and 38 were not taken.
The site is squarely longevity-relevant; it is the closest content analogue in the whole study.
**Banner note:** `bannerActions` records that the capture tool found no permitted refusal control in
`#footer-places` on all four passes and left standing whatever it found. Looking at the images, no
cookie or consent overlay is visible in any capture; the only band that could be mistaken for one is
the pale-green "Tools" strip above the licence line, which is ordinary MediaWiki footer chrome
[capture: index-1440-full.png, content-1440-tile-15.png]. Nothing in these captures should be read
as a consent banner.

## 1. Visual hierarchy

**F1.** On the article the order is: the green masthead band, then `h1` "Rapamycin" as by far the
largest type on the page, then the boxed molecular image on the right, then body prose. Hierarchy is
made almost entirely by type size plus one device — a full-width hairline rule sits under the `h1`
and under every *section* `h2`, and is absent under every `h3`. "Effects on age-related diseases",
"Mechanism", "Human clinical trials", "Dog clinical trials", "Regulatory approval", "Safety",
"Rapalogs", "See also" and "References" carry the rule; "Cancer", "Heart Disease", "Alzheimer's",
"Dose response", "PEARL study" and the two Mechanism sub-headings directly under them do not. The
one exception is the Contents heading — an `h2` in the recorded outline — which sits inside a
bordered box and carries no rule. That single rule is what tells you the depth you are at, because
the size step from `h2` to `h3` is small.
[capture: content-1440-tile-01.png, content-1440-tile-04.png, content-1440-tile-06.png]

**F2.** Colour carries no hierarchy inside the prose. Body text and headings share one near-black
ink, links are one blue, and the only other colour on a content screen is the green masthead — two
ink values in running prose, not three. (The reference list adds a third, red-brown; see F28.)
There is no second-level grey, no tinted callout, no coloured rule. Everything that is not a heading is the same weight, which is
why a section on yeast and a section on a 264-person human trial read at identical importance until
you read the words. [capture: content-1440-tile-04.png, content-1440-tile-09.png]

**F3.** On the home page the hierarchy is logo → tagline → search field → green nav bar → `h1` →
intro paragraph. The logo block is roughly 100 px tall and centred on a pale-green field; the search
field is centred directly beneath it at about 497 px wide. The `h1` "Longevity Wiki" then repeats
the logo wordmark about 250 px lower — with the tagline, the search field and the green nav in
between — which spends a whole hierarchy step restating the site name.
[capture: index-1440-full.png, index-1440-tile-01.png]

## 2. Where the eye lands first

**F4.** Desktop home: the logo mark, not the search field, is the highest-contrast object on the
first screen. The pale-green band is the only large colour area on the screen and the black
dot-cluster logo sits in the middle of it; the search field below is a plain grey-bordered white
rectangle with a grey placeholder and a small grey magnifier, so it does not compete for the first
fixation. The primary action is styled as the quietest thing in the band. (Ordinal gaze order is not
observable in a still capture and is not claimed.)
[capture: index-1440-tile-01.png]

**F5.** Mobile home: the search field is gone entirely from the first screen. The green nav
collapses to a hamburger and the pale-green band keeps the logo and tagline but drops the input. On
a 375 px screen the first screen is a logo, a seven-word tagline, a hamburger, the `h1` and a
paragraph — the site's primary action is not on it. [capture: index-375-tile-01.png,
index-375-full.png]

**F6.** Desktop article: the green masthead is the only colour field, about 56 px tall, and it now
*does* contain a search input on the right at about 500 px wide. Below it the `h1` "Rapamycin", at
roughly 40 px near-black bold, is the highest-contrast object in the white content area; the boxed
ball-and-stick molecule is a light-grey render inside a hairline border, floated right and
top-aligned *level with* the lead sentence rather than above it. It is the only non-text object on
the first screen, but it does not outrank the heading. (Gaze order is not observable in a still
capture.) [capture: content-1440-tile-01.png]

## 3. Information density

**F7.** The article's first desktop screen carries about 150 words of prose, one image with caption,
and the top third of a 31-line contents box. That is comfortable. The problem is measure, not
volume: paragraphs run the full container, roughly 1,035 px, which is about 135–150 characters per
line at desktop. The Phase 1 cluster across the reference sites is 68–86 characters. Lines this long
are what makes the reader lose the return sweep on a page this tall.
[capture: content-1440-tile-01.png, content-1440-tile-05.png, content-1440-scroll-50.png]

**F8.** There are no data tables anywhere in the captured article. Everything quantitative is inside
running prose — "extends median lifespan by 15% in the common marmoset", "delivered orally at
1 mg/kg/day", "randomized 264 older adults", "4.7, 14, or 42 ppm", "25 older adults aged 70–95",
"(within-group p=0.03) and a 40% rise in triglyceride levels (within-group p=0.05)". A reader
cannot compare two studies without reading both paragraphs end to end.
[capture: content-1440-tile-02.png, content-1440-tile-05.png, content-1440-tile-09.png,
content-1440-scroll-50.png]

**F9.** Lists are handled two ways and one of them fails. The home page groups article links into
three headed columns — Fundamentals, Drugs, 'Longevity genes' — six bullets each plus a "More" link,
inside one grey panel. That is a clean, honest browse block. The 93-item reference list, by
contrast, is set in two columns where the left column runs 1–47 down the *entire* 3,000 px height of
the list and the right column runs 48–93 down the same height. To read reference 48 after 47 you
scroll back up thousands of pixels. [capture: index-1440-full.png, content-1440-tile-11.png,
content-1440-tile-14.png]

**F10.** On mobile the same reference list is a single column running 1–93. It is still on entry 74
at scrollY 27,825 and does not finish until about 31,300 px, so it occupies at least the last
3,500 px of the 31,729 px page and, at the observed spacing, several thousand more. Mobile tiles 13
to 38 were never captured, so where the list *starts* at 375 px is not observable and no
share-of-page figure is asserted.
[capture: content-375-scroll-90.png, content-375-tile-39.png]

## 4. Whitespace

**F11.** Whitespace is spent on outer margins and on paragraph gaps, not on the reading measure. The
left margin is about 198 px at 1440 and the right about 197 px, but that gutter is used to make the
container wide rather than to narrow the text. Space above an `h2` is only modestly larger than
above an `h3` — about 58 px against about 46 px measured on tile 04, and part of that difference is
the `h2`'s larger type — so the rule and the type size, not the spacing, are what mark depth.
[capture: content-1440-tile-04.png, content-1440-tile-06.png]

**F12.** The home page uses a large empty band around the three icons — microscope, open-access
padlock, lightbulb — with about 200 px of vertical air and a one-or-two-word label under each. That
band occupies roughly a fifth of the first desktop screen and says only "Science based / Open access
/ Understandable", three claims with no evidence attached. This is whitespace spent on assertion.
[capture: index-1440-tile-01.png, index-1440-full.png]

**F13.** Cards are used sparingly and correctly: a grey panel for the browse columns, a light-grey
bordered box for Contents, a bordered box with an inset caption strip for each figure, and a thin
bordered strip for Categories. Card padding is modest (roughly 12–16 px) so the boxes read as
containers, not as features. [capture: index-1440-full.png, content-1440-tile-01.png,
content-1440-tile-06.png, content-1440-tile-15.png]

## 5. Long scroll

**F14.** Nothing persists. At scroll fraction 0.50 of a 12,895 px article the top of the viewport is
mid-sentence in the Safety section: no header, no rail, no progress indicator, no breadcrumb, no
section label. At 0.90 the viewport is entirely reference entries, again with no chrome. The
`domEvidence` key `stickyOrFixed` is an empty array and `stickyOrFixedCount` is 0, so this is
confirmed rather than inferred. [capture: content-1440-scroll-50.png, content-1440-scroll-90.png,
content-375-scroll-50.png, content-375-scroll-90.png]

**F15.** Because the masthead is not sticky and is only about 56 px tall, the search field that
exists on the article at desktop leaves the viewport within roughly 60 px of scrolling — not after
900 px, as first read. The site has a search affordance (`searchAffordances`: `div[role=search]`,
`input Search Longevity Wiki`) and then puts it behind up to 12,895 px of scroll-back. [capture: content-1440-tile-01.png, content-1440-scroll-50.png]

**F16.** Rhythm holds for the body — heading, rule, two to four paragraphs, heading — for about
8,260 px, and then breaks completely at the reference list, which changes to a two-column grid with
a different type size, different leading and a numbering order that does not follow the eye. There
*is* one onward step, but it is stranded: the `h2` "See also" at about 8,160 px carries a single
bullet, "Isomyosamine (MYMD-1®)", and is immediately buried under roughly 4,400 px of references.
The end of the page is a Categories strip ("Drugs | Main list | Fundamentals"), the pale-green Tools
bar, the last-modified line, the CC BY-SA mark, a "Powered by MediaWiki" badge and four social
icons. At the point a reader actually arrives, there is no "next article", no related-compound row,
no return-to-top. [capture: content-1440-tile-11.png,
content-1440-tile-14.png, content-1440-tile-15.png]

**F17.** The contents box is the only navigation for the article and it is inline, sitting in the
first screen and then scrolling away permanently by about 1,330 px. It is thorough — 31 visible
entries, three levels, numbered 1 to 10 with 21 sub-entries down to 1.3.1/1.3.2 — and it is exactly
the thing that should have been kept on screen. (The figure 27 in the first reading was the recorded
`headingCount`, which counts the `h1` and the Contents heading itself and omits Cancer, Heart
Disease, Alzheimer's and the Dog-trials Heart disease sub-heading. It is a DOM number, not a count
of what is on screen.) [capture: content-1440-tile-01.png, content-1440-tile-02.png]

## 6. Imagery

**F18.** Six images on the article (`imgCount` 6, `imgLazyCount` 2), no `<svg>` and no `<canvas>`
(`svgCount` 0, `canvasCount` 0), so every graphic is a raster file. Two of them carry real meaning:
the reproduced multi-panel bar chart of laboratory-confirmed respiratory infections, which prints
its own source citation *inside* the image ("Mannick, J. B., … The Lancet Healthy Longevity. 2(5),
e250–e262") and whose caption expands the axis panels and the acronym ("RTI = respiratory tract
infection"). That is a figure doing evidential work.
[capture: content-1440-tile-09.png, content-375-scroll-50.png]

**F19.** One image does harm. Beside the PEARL study section sits a hand-drawn sketch plotting "Net
benefits" against "Rapamycin dose", with a red segment labelled "shorter health- and life-span
(diseases including cancer)" rising to a green point labelled "Optimum" and a blue segment falling
away to "Side effects". No axis has units or numbers. It is a qualitative cartoon that visually
asserts an optimal human dose exists and where it lies. On a page a reader may act on, this is the
single most dangerous element captured. [capture: content-1440-tile-06.png]

**F20.** The opening molecular structure is decoration in evidential terms — it tells the reader
nothing about the evidence — but it is honest decoration, correctly captioned "The chemical
structure of rapamycin." At 1440 it is floated right and top-aligned *level with* the lead sentence
rather than ahead of it, and it is the only non-text object on the first screen. At 375 px, where
the box keeps its ~220 px desktop width inside a 375 px viewport, it does take the lead position
outright and breaks the layout (see F32). [capture: content-1440-tile-01.png,
content-375-tile-01.png]

**F21.** The longest image-free run is about 2,260 px, not the 5,000 px first read, and it is not
where it was first placed. Mechanism opens at about 3,888 px and is followed within about 1,000 px
by the PEARL sketch inside Human clinical trials. The genuinely unbroken stretch runs from the
bottom of that sketch (about 5,212 px) to the top of the RTI chart (about 7,470 px), covering Dog
clinical trials, Regulatory approval, Safety and the opening of Rapalogs: full-measure near-black
text with only headings and rules to segment it, and nothing stepping in to carry structure. [capture: content-1440-tile-05.png, content-1440-tile-07.png,
content-1440-scroll-50.png]

## 7. Defers or competes

**F22.** The article page defers almost completely. There are no share widgets, no related-content
interruptions, no newsletter prompt, no sponsor slot, no floating buttons anywhere in 12,895 px. The
only non-content elements are the masthead, the Categories strip and the footer. Whatever else is
wrong with it, this page never performs in front of its material.
[capture: content-1440-full.png, content-1440-scroll-50.png, content-1440-scroll-90.png]

**F23.** The home page competes with itself in one place: the icon triptych (F12) and the `h1` that
restates the logo (F3) together push "Get a taste of our content…" and the actual article columns
to the fold at 1440 — the grey panel starts at about 888 px against a 900 px viewport — and to
roughly 1,280 px at 375, more than one and a half 812 px screens down. The most useful thing on the page — a
grouped list of what the wiki actually contains — is the last thing reached.
[capture: index-1440-full.png, index-375-full.png]

## 8. Information design of uncertain, community-sourced material — the core question

**F24.** What it shows: prose sections organised by *model organism*, in descending order of
relevance to humans — Non-human primates, Dogs, Mice (with Rapidly aging mice models / Middle-aged
mice beneath), Flies, Roundworms, Yeast — followed by Effects on age-related diseases, Mechanism,
Human clinical trials, Dog clinical trials, Regulatory approval, Safety, Rapalogs, See also,
References. **The heading ladder is itself the evidence-strength signal.** A reader who never reads
a sentence can see from the contents box that the human material is section 4 and the yeast material
is section 1.6. This is the one genuinely transferable information-design idea on the site.
[capture: content-1440-tile-01.png, content-1440-tile-02.png, content-1440-tile-04.png]

**F25.** How uncertainty is signalled: **entirely in sentences, with no visual mark of any kind.**
The captures contain no badge, no tier chip, no confidence bar, no "peer reviewed" mark, no sample-
size field, no replication count, no provenance row, no "self-reported" label and no status pill.
What the prose does carry, and carries well, is hedging placed adjacent to the claim: "Unpublished
and preliminary data presented by Dr Adam Salmon at the American Aging Association annual meeting
(June, 2024)"; "There is preliminary evidence"; "the data remains inconclusive as the study was
powered statistically for a reduction in clinically symptomatic respiratory tract infections, and
not laboratory-confirmed RTIs"; "This was a small study with a low dose of rapamycin, dosed over a
short duration of 8 weeks"; "A further analysis of the paper by Johnson et al. pointed to several
important limitations… lack of dose-response profiling…; studying only the male sex…". Every one of
those qualifications is set in the same size, weight and colour as the claim it qualifies, so it is
invisible to a scanner and only reaches a reader who reads. [capture: content-1440-tile-02.png,
content-1440-tile-04.png, content-1440-tile-09.png, content-1440-scroll-50.png]

**F26.** Identifiers do appear, but only inside citation text and never as a field. In the reference
list you find PMIDs ("PMID: 25719621"), DOIs rendered as full links ("DOI:
10.1097/CAD.0000000000000207", "https://doi.org/10.3390/molecules27165295"), PMC ids ("PMC6934974"),
journal, volume, issue and page. NCT numbers appear twice: in the reference list as ClinicalTrials.gov
URLs, and once inline in the body ("ClinicalTrials.gov Identifier: NCT04584710, NCT04409327"). None
of these is a labelled, addressable field; they are strings inside sentences. There is no per-claim
provenance row. [capture: content-1440-tile-09.png, content-1440-tile-11.png,
content-1440-tile-14.png, content-375-scroll-90.png]

**F27.** The reference list is visibly un-deduplicated. Entry 10 and entry 65 are the same
ClinicalTrials.gov PEARL record ("…Full Text View — ClinicalTrials.gov. Clinicaltrials.gov. (2021).
Retrieved 27 May 2021, from https://clinicaltrials.gov/ct2/show/NCT04488601"). Entry 12 and entry 63
are the same Selvarani/Mohammed/Richardson 2020 GeroScience paper. Entries 39 and 41 are the same
Miller et al. 2014 *Aging Cell* paper. A community list with no identity key behind it accumulates
duplicates, and the design does nothing to reveal or absorb that.
[capture: content-1440-tile-11.png, content-1440-tile-14.png]

**F28.** Citation ink varies **three** ways in one list, with no legend. Some entries are plain
near-black with no hyperlink anywhere (entries 1, 12, 14, 15, 18, 63 — entry 3 even prints its DOI
as unlinked text); some render blue (6, 10, 11, 13, 16, 17, 64, 65); some render red-brown (5, 40,
46, 62, 66). Blue against red-brown is most likely ordinary visited-link styling. The black-versus-
coloured split is the more serious one: it is the difference between a citation you can follow and
one you cannot, and it is carried by ink alone. A reader scanning for meaning will read all of it as
a quality distinction.
[capture: content-1440-tile-11.png, content-1440-tile-14.png]

**F29.** User-contributed content is **not distinguished from editorial at all.** There is no byline,
no contributor count, no edit count, no revision indicator, no talk-page marker, no stub or
"needs citation" flag anywhere in 12,895 px. The only trace of the wiki's authorship model is the
footer line "This page was last modified on 19 June 2024, at 16:21" and the CC BY-SA licence mark
beside it. The licence is therefore the *only* metadata field the design actually presents as a
field. [capture: content-1440-tile-15.png, content-375-tile-39.png]

**F30.** That footer date is the whole freshness story, and it fails. The article says the PEARL
study "is expected to conclude in 2023"; the page was last modified in June 2024; the capture was
taken in September 2026. A reader has to travel 12,895 px to the footer to learn that the page is
two years old, and nothing near the claim marks it as possibly superseded.
[capture: content-1440-tile-06.png, content-1440-tile-15.png]

**F31.** What a reader gets here that a trial registry cannot give them: the *cross-organism
synthesis with its limitations attached*. A registry can tell you NCT04488601 exists, its arms and
its status. It cannot tell you that the marmoset result is unpublished conference data, that the
German C57BL/6J result was challenged for lacking dose-response profiling and using only males, that
one 25-person pilot found no clinical effect but a within-group HbA1c and triglyceride rise, and that
these belong on one ladder from yeast to humans. The synthesis is real value. The captures show it
delivered as undifferentiated prose, which is why it is hard to trust at a glance.
[capture: content-1440-tile-02.png, content-1440-tile-04.png, content-1440-scroll-50.png]

**F32.** Mobile breaks the article's opening. At 375 px the molecular-structure box stays at its
desktop width — about 220 px of a 375 px viewport — and floats right, squeezing the lead paragraph
into a column of between 4 and 13 characters, about 10 on average: "Rapamycin, / also known by /
its brand / name / Rapamune®, / is a / compound / used to / prevent the / rejection / of organ",
eleven lines before the text clears the image. The most
important sentence on the page is the least readable thing on a phone.
[capture: content-375-tile-01.png]

**F33.** The reproduced bar chart at 375 px is scaled down until its axis labels are near-unreadable
and it runs to the viewport edge; the panel headers "Phase 2b / Phase 3 / Phase 2b plus Phase 3"
survive but the category labels do not. A figure that was carrying evidence at desktop stops
carrying it at mobile. [capture: content-375-scroll-50.png, content-1440-tile-09.png]

## 9. Absence handling

**F34.** The page renders **nothing** for what it does not have, and this is its best structural
behaviour. There is no infobox with empty rows, no "Not available", no "—", no greyed placeholder
anywhere in the captured article. Sections exist only because there is material for them: there is a
"Non-human primates" section because one marmoset result exists, a "Dog clinical trials" section
because TRIAD exists, and there is no "Cats" section, no "Pharmacokinetics" section and no "Drug
interactions" section. The contents box therefore shows the shape of the evidence, and a compound
with less evidence would produce a visibly shorter list (31 lines here, not the 27 first recorded —
see F17). This matches the RNAWiki constraint
"absent data renders NOTHING" exactly. [capture: content-1440-tile-01.png,
content-1440-tile-02.png, content-1440-full.png]

**F35.** The failure case is not absence but staleness, which the design has no mark for at all. A
claim whose data has expired ("expected to conclude in 2023") looks identical to a current one; the
page can say nothing between "we have this" and "we have nothing".
[capture: content-1440-tile-06.png, content-1440-tile-15.png]

## 10. For RNAWiki

### Borrow

**F36. Headings as the evidence ladder — dossier reading column.** Order the dossier's sections by
model organism from human downward, and let the contents list expose that order, exactly as sections
1.1–1.6 do here. A reader sees "human trials: section 4, worms: section 1.5" before reading a word,
which is the cheapest possible way to keep the constraint that "a worm result and a human result
never appear in the same visual weight". Borrow the ordering; do **not** borrow the flat styling
that gives them identical weight once you are in them. [capture: content-1440-tile-01.png,
content-1440-tile-02.png]

**F37. Limitations attached to the claim, not relegated — dossier reading column and structured
data blocks.** The Johnson-et-al. critique sits in the same paragraph as the result it qualifies,
and the RTI figure's underpowering sits in the sentence that reports it. Keep that adjacency and
give it the weight the prose here withholds: the Linear grey ladder already assigned as the
secondary reference for this surface is the mechanism for showing a qualification as subordinate but
visible. [capture: content-1440-tile-04.png, content-1440-tile-09.png]

**F38. A figure that carries its own citation and expands its own acronyms — structured data
blocks.** The RTI chart prints its source inside the image and its caption defines "RTI" on first
use. That is the pattern for any RNAWiki figure. [capture: content-1440-tile-09.png]

**F39. Render nothing for absent fields — every surface.** F34 is a working demonstration of the
constraint at 12,895 px, and it is the reason the page's shape is informative. [capture:
content-1440-tile-01.png, content-1440-full.png]

**F40. Grouped, headed browse columns — browse/filter.** The home page's three headed columns of six
links plus "More" is a defensible browse block: it says what the corpus contains without a filter UI.
It is a weaker version of what awwwards governs, but its restraint at 375 px (columns stack, order
preserved, no reflow damage) is worth noting. [capture: index-1440-full.png, index-375-full.png]

### Avoid

**F41. Never ship the PEARL dose cartoon or anything like it — dossier reading column.** An unlabelled
axis with a green "Optimum" point is a dose recommendation drawn as a diagram. RNAWiki's editorial
constraint forbids exactly this; a graphic must not assert what the prose is not permitted to say.
[capture: content-1440-tile-06.png]

**F42. Do not let the page lose all chrome on a long scroll — dossier contents rail.** At 12,895 px
with `stickyOrFixed` empty, the reader at 50% has no idea which section they are in and no way back
to search. This is the strongest visual argument in the study for resolving the currently unassigned
contents-rail item. [capture: content-1440-scroll-50.png, content-1440-scroll-90.png]

**F43. Do not set prose to the container — dossier reading column.** 135–150 characters per line at
1440 is roughly double the 68–86 character cluster the Phase 2 references converge on. This site is
the counterexample that justifies the 560–736 px column. [capture: content-1440-tile-05.png,
content-1440-scroll-50.png]

**F44. Do not put freshness only in the footer — dossier reading column and structured data blocks.**
"Last modified 19 June 2024" 12,895 px below a claim that a trial would end in 2023 is not a
freshness signal. Date and status belong beside the claim. [capture: content-1440-tile-06.png,
content-1440-tile-15.png]

**F45. Do not two-column a long reference list — dossier reading column.** Left column 1–47 running
the full height and right column 48–93 running the same height makes sequential reading impossible.
[capture: content-1440-tile-11.png, content-1440-tile-14.png]

**F46. Do not let citation colour vary without meaning — citation evolution map.** Red-brown and
blue entries side by side in a list of sources will be read as a quality distinction whether or not
one is intended. On the citation surface, colour must be defined or absent.
[capture: content-1440-tile-11.png, content-1440-tile-14.png]

**F47. Do not drop the search field at mobile, and do not spend the first screen on self-description
— home (search bar frozen).** At 375 px the home page has no search input at all, and at 1440 the
icon triptych and a restated `h1` push the real content below the fold. Both are the failure the
frozen-search-bar rule exists to prevent. Nothing here is a candidate for placement above or beside
the RNAWiki search bar. [capture: index-375-tile-01.png, index-1440-tile-01.png]

**F48. Do not let an image take the lead position at mobile — dossier reading column.** The floated
structure box keeps its ~220 px desktop width inside a 375 px viewport and crushes the opening
paragraph to between 4 and 13 characters per line, about 10 on average, for eleven lines.
[capture: content-375-tile-01.png]

### Phase 2 verdict

**Not named.** Longevity Wiki appears nowhere in the Phase 2 table; that table's governing
references are awwwards, smashing, linear, stripe, pudding, vercel and quanta, with home held by
constraint. Nothing seen here argues for giving it a surface: it has no reading column, no rail, no
data block, no search overlay and no citation graphic, so it has no mechanism to govern with. Its
value to Track A is as the closest *content* analogue and as a set of confirmed failure modes.

On that basis it **strengthens** three existing assignments and one open item:

- It strengthens the Smashing/Linear assignment for the dossier reading column by being the
  counterexample — 135–150 characters per line over 12,895 px is what the 560–736 px column exists
  to prevent (F43).
- It strengthens the case for resolving the **unassigned contents rail** in Stripe's favour: this
  page has a genuinely good 31-entry, three-level contents list and throws it away within about
  1,330 px (F17, F42). That item is currently waiting on a decision; this is direct visual evidence for
  deciding it.
- It strengthens the Stripe assignment for structured data blocks by showing what happens without
  them: every number in the article — enrolment, dose, ppm, p-values, duration, PMIDs, DOIs, NCT ids
  — lives inside a sentence and cannot be compared, filtered or dated (F8, F26).
- It strengthens the frozen home search bar by failing it twice (F5, F47).

It also supplies one thing no measured reference does, and that is not a surface assignment but a
**content-structure rule for A3**: the model-organism heading ladder as the base-state evidence
signal (F24, F36). Recommend recording it in the disclosure spec rather than in the Phase 2 table.

## 11. Added on verification

**V1. Identifiers in four formats, reachability carried by colour — structured data blocks.** Within
one reference list, entry 8 reads "PMID: 37142830 PMC10330278 DOI: 10.1038/s43587-023-00416-y";
entry 88 reads "PMID: 38041783 DOI: 10.1007/s11357-023-01011-0"; entry 93 reads "PMID 35914953
doi:10.1093/gerona/glac142"; entries 81 and 87 give a bare "https://doi.org/…" with no label at all.
Separately, entries 1–4 print their URL as unlinked plain text while entry 5 is a hyperlink across
the whole citation, so whether a source can actually be followed is signalled only by ink colour
(F28). For RNAWiki this is the concrete argument for identifiers as typed, labelled fields with one
rendering and an explicit resolvable / not-resolvable state.
[capture: content-1440-tile-10.png, content-1440-tile-14.png, content-1440-scroll-90.png]

**V2. Related content stranded above the source list — dossier reading column.** The `h2` "See also"
sits at about 8,160 px and carries exactly one bullet, "Isomyosamine (MYMD-1®)". The References
heading follows about 100 px later and the two-column list runs to about 12,690 px. The page does
have an onward step; it is simply unreachable, because a reader who scrolls to the end of a dossier
passes it thousands of pixels earlier. Related programmes and successor pointers belong beside the
conclusion, not behind the source list.
[capture: content-1440-tile-10.png, content-1440-tile-15.png]

**V3. A source-reuse count thrown away by its own styling — citation evolution map.** The list
already computes how many claims lean on each source and renders it as superscript back-links:
entry 11 carries "11.0 11.1", entry 13 "13.0 13.1 13.2", entries 40–43 two or three each, entry 92
"92.0 92.1 92.2 92.3". That count is exactly the dependency signal RNAWiki records as explicit
edges — how many claims rest on one source snapshot — but here it is set as ~10 px pale-blue
superscript with no label, so it reads as noise. Name the field instead of leaving it a cluster.
[capture: content-1440-tile-11.png, content-1440-tile-14.png, content-375-tile-39.png]

## Verification

Independently re-read on 2026-09-04 against the captures, without fetching anything. Twenty-two
images were opened: all eight required desktop views, the three required mobile views, and every
further capture a finding cites (`content-1440-tile-05/07/09/10/11/14/15`, `content-375-tile-39`,
`content-375-scroll-90`, `index-375-full`). `content-1440-scroll-00.png` and
`content-375-scroll-00.png` were not opened separately: their sha256 values are identical to
`content-1440-tile-01.png` and `content-375-tile-01.png`, which were read.

**32 confirmed · 18 qualified · 0 refuted · 3 added.** Nothing was refuted outright — every
qualified finding had a true core, and what failed was a number, a distance, a count, or a gaze
ordinal that a still capture cannot show. The banner note is upheld: no cookie or consent overlay is
visible in any image read.

Qualified findings, one line each:

- **F1** — the rule is under every *section* `h2`, but the Contents heading is an `h2` in the
  recorded outline and carries no rule; claim narrowed.
- **F2** — headings share the body's near-black ink, so running prose has two ink values, not three;
  the reference list supplies a third, red-brown.
- **F3** — the `h1` does restate the wordmark, but about 250 px below it, not 150.
- **F4** — the descriptive half is accurate; "the search bar is the third thing seen" is a gaze
  ordinal a still capture cannot show, and was replaced with the contrast observation.
- **F6** — the `h1` at ~40 px near-black, not the light-grey molecule, is the highest-contrast object
  in the content area, and the figure is top-aligned level with the lead sentence, not ahead of it.
- **F10** — "roughly half the 31,729 px page" extrapolates across mobile tiles 13–38, which were
  never captured; restated to the bound the captures actually support.
- **F11** — the outer-margin observation stands; "space above an `h2` is roughly double" does not
  (about 58 px against about 46 px, part of it the larger type).
- **F15** — understated the failure: the masthead is only ~56 px tall, so the search field leaves the
  viewport almost immediately, not after 900 px.
- **F16** — the reference list starts at about 8,260 px, not 9,000, and a one-item "See also" list
  does exist above it; the end of the page still offers nothing.
- **F17** — the box holds 31 visible entries. "27" was the recorded `headingCount`, a DOM number that
  counts the `h1` and the Contents heading and omits four sub-headings.
- **F20** — the figure is top-aligned level with the lead sentence at 1440; it takes the lead
  position only at 375 px.
- **F21** — the most important correction. The image-free stretch is about 2,260 px, not 5,000, and
  it does not cover Mechanism: a figure sits about 1,000 px into Mechanism's own run.
- **F23** — at 375 px the browse columns start at roughly 1,280 px, not 900; at 1440 the ~888 px
  figure is confirmed.
- **F28** — the ink varies three ways, not two; plain-black entries are citations with no link at
  all, which makes colour the only signal of whether a source can be followed.
- **F32** — eleven lines confirmed, but the crushed measure runs 4 to 13 characters, about 10 on
  average, not "roughly 15"; the transcribed line breaks were also corrected.
- **F34** — claim stands; the trailing "27-entry contents box" corrected to 31.
- **F48** — carried the same "roughly 15 characters" figure as F32; corrected the same way.
- **F50** — the copy-control and keyboard-hint half stands, but the affordance list was too short: a
  Contribute disclosure caret, an account glyph, the 375 px hamburger, a footer Tools disclosure and
  a per-figure enlarge glyph are all visible.

The Phase 2 verdict of **not named** is upheld. Both numbers its contents-rail argument leans on
were corrected — 31 entries, discarded within about 1,330 px — and both corrections strengthen that
argument rather than weaken it.
