# sphere.diybio.org — Track A2 viewer findings (information design of a community-sourced directory)

DIYbiosphere is a community-maintained directory of do-it-yourself biology initiatives — community
labs, projects, groups, events, startups, incubators, networks — edited through GitHub pull requests
and published as a static site. The capture manifest lists the same URL for both passes
(`index` = `https://sphere.diybio.org/`, `content` = `https://sphere.diybio.org/`), and the file
digests confirm it: `index-1440-full.png` and `content-1440-full.png` share one sha256, as do
`index-1440-tile-01.png` / `content-1440-tile-01.png` and `index-375-tile-01.png` /
`content-375-tile-01.png`. So there is **one page in this capture set, the home page**, at two
viewports plus three real scrolled views per viewport. No record page, no browse listing, no filter
result and no entry detail view was captured. Everything below is about that home page, and where a
judgement would need a record page I say so rather than guess. `bannerActions` records "no consent
UI found" for all four passes, so nothing in these images is a cookie banner overlapping the design.
One capture behaviour must be stated up front because it shapes half the findings: the
"Community Labs by Location" map did not paint in the desktop capture — the heading is there and the
region below it is blank white for roughly a full viewport, with only the map legend box surviving
at the bottom left.

## 1. Visual hierarchy

**F1.** First in the hierarchy is a full-bleed photographic carousel occupying rows 65–465 of a
900 px viewport — about 45% of the first screen. It wins on size, on being the only photography on
the page, and on colour: white or near-black display type set directly over lab photographs, each
slide ending in a saturated button. Nothing else on the page uses a photograph.
[capture: index-1440-tile-01.png, content-1440-scroll-00.png]

**F2.** The carousel puts the *site's own pitch* on equal footing with the directory's records. The
centre slide reads "DIYbiosphere / An open source project to connect DIYbio initiatives worldwide"
with a green ADD YOUR ENTRY button, and it sits in the same slot, at the same size, as
"Hackuarium — Lab at UniverCite in Renens, Switzerland" and "SoundBio Lab — Lab in Seattle, United
States". A reader scanning the first screen cannot tell from the design which of those five panels
is the publisher talking about itself, because nothing labels it. Two indirect cues do separate it:
it carries no type-and-place line, and it repeats the site name already in the logo.
[capture: index-1440-tile-01.png, index-1440-full.png]

**F3.** Second is "Browse by Collection" — a centred heading in the same monospaced face as
everything else, set about 130 px below the carousel, over an eight-item, two-column grid. The
section heading itself *is* promoted by type scale: at roughly 26 px it is visibly larger than
anything beneath it. What has no size jump is one level down, inside the grid: the category name is
small, uppercase and bold, its description regular weight at the same size, so name and definition
are separated by capitalisation and weight only, with a blue outline icon per row as the scan
anchor.
[capture: index-1440-tile-01.png, content-1440-tile-02.png]

**F4.** Third is the newsletter block, and it is the only element on the page given a colour-filled
container (pale blue, full content width, rounded). It therefore reads as more important than the
map section above it, which has no container of its own — its legend is a small bordered, faintly
filled box, component chrome rather than a section container. The visual ranking the page actually delivers
is: carousel, categories, newsletter, map — which inverts what the headings say the page is about.
[capture: content-1440-tile-03.png, index-1440-full.png]

**F5.** The carousel's heading structure is flat and does not match the visual hierarchy. The
`headingOutline` sample holds 40 entries against a recorded `headingCount` of 44, and every one of
those 40 is carousel content: a slide title as `h1` (15 of them), `h3` for its location line, `h3`
again for its description. The site name "DIYbiosphere" is one `h1` among many, so a screen-reader
outline of the first screen is a flat list of lab names rather than a page structure. Four headings
fall outside the sample, and they are almost certainly the three visible section headings; their
level is not recorded, so nothing here supports a claim that the page contains no `h2` at all.
[capture: index-1440-tile-01.png; domEvidence headingOutline, headingCount]

## 2. Where the eye lands first

**F6.** Desktop: on the green ADD YOUR ENTRY button, dead centre of the carousel at roughly x=718,
y=381 in a 1440×900 view. It is the only saturated green on the page; every other control is the
site's blue. Green against a desaturated grey photograph, centred, with the largest button padding
on screen — the eye goes there before it goes to the site name or the search field. That is chrome
(a call to contribute), not content.
[capture: content-1440-scroll-00.png, index-1440-tile-01.png]

**F7.** The desktop search field loses this contest badly. "Search DIYbio initiatives" sits in the
header as grey placeholder text on white with no border and no fill, carrying only a small magnifier
glyph at its right edge — visually it is a label, not a field. Its type is actually set *larger* than
the nav items on either side; what it loses on is contrast and the absence of any bounding shape.
For a directory whose whole purpose is lookup, search is the least prominent interactive thing on
the first screen.
[capture: index-1440-tile-01.png, content-1440-scroll-00.png]

**F8.** Mobile: the eye lands on the same green button. But mobile fixes the search problem
partially — the header wraps to two rows and search gets its own full-width row directly beneath the
logo, above the hero, with a magnifier icon at the right edge. It is still borderless grey
placeholder text, but it now owns a full row and appears before any content. Mobile gives search a
better position than desktop does.
[capture: index-375-tile-01.png, index-375-full.png]

**F9.** Inferred, and narrowly: the search field carries an autocomplete combobox role and the
site's search is credited to a hosted index. No capture shows the field in use, so whether it drops
a suggestion list or navigates to a results page is not observable here. The manifest records `searchAffordances.count` 5 with a descriptor
`input[role=combobox] Search DIYbio initiatives`, and the footer credits "Search by Algolia". No
keyboard-shortcut hint exists — `kbdTexts` and `ariaKeyshortcuts` are both empty — so there is no
evidence of a ⌘K palette here and I make no such claim.
[capture: index-1440-tile-01.png, content-1440-tile-03.png; domEvidence searchAffordances,
kbdTexts, ariaKeyshortcuts]

## 3. Information density

**F10.** The desktop first screen carries one carousel row (five panels, three of them clipped by the
viewport edges) plus the first two rows of the eight-item category grid — LABS, STARTUPS, PROJECTS,
INCUBATORS. In record terms that is *four* entries visible at once plus the publisher's own panel,
each reduced to four fields. Compared with any list view, this is very low density for a directory.
[capture: index-1440-tile-01.png]

**F11.** The carousel clips its outer panels mid-word — "…pace / …rooklyn, / States" on the left and
"BioHac… / Lab in / Ecua…" on the right, with a "Learn…" button sliced in half. The clipping is
presumably meant to signal that the row scrolls, but the cost is that two of the five visible
records are unreadable as records.
[capture: index-1440-tile-01.png, content-1440-scroll-00.png]

**F12.** Grouping is by kind, and the eight kinds are defined in plain sentences on the page itself:
LABS "Dedicated physical spaces, static or mobile, with materials and equipment", OTHERS "Umbrella
term for the rest of misfit entries. New collections may arise". Defining the taxonomy inline,
including admitting a residual category and that the taxonomy may change, is honest and unusually
direct.
[capture: index-1440-tile-01.png, content-1440-tile-02.png]

**F13.** There is no list and no table anywhere in these captures, and no count anywhere. Not one
category row says how many labs or projects it contains; the page never states the size of the
corpus it indexes. A reader leaves the home page not knowing whether the directory holds 40 entries
or 4,000.
[capture: index-1440-full.png, content-1440-tile-02.png, index-375-full.png]

**F14.** Mobile density collapses rather than reflows. The two-column category grid becomes one
column with the icon centred *above* a left-aligned name and description, and each item consumes
roughly 200 px of a 812 px viewport. Four categories per screen at desktop becomes about three at
mobile with far more space per item — the same eight items stretch across roughly 1,900 px of
scroll.
[capture: index-375-full.png, content-375-scroll-50.png]

## 4. Whitespace

**F15.** Whitespace is spent mostly between sections, not inside them: roughly 130 px between the
bottom of the carousel and "Browse by Collection" (about 70 px from the previous/next controls), and
a comparable band above the newsletter card. Within
the category grid, spacing between an icon and its text is tight and consistent, so the grid reads as
one block rather than eight.
[capture: index-1440-tile-01.png, content-1440-tile-02.png]

**F16.** The single largest area of white on the page is not designed whitespace — it is the failed
map. "Community Labs by Location" sits at about y=1200 of the 2,638 px full-page capture and nothing
paints below it until the legend box at about y=1860: roughly 760 px of blank, about 29% of the
page's height. That reads as about 570 px of white inside tile-02, continuing about 190 px into
tile-03, where the legend box floats alone at the top left. Whatever the
cause (tiles not loading in the capture environment; `canvasCount` is 1, consistent with a canvas map
that initialised but painted nothing), what the page *shows* here is emptiness under a promise.
[capture: content-1440-tile-02.png, content-1440-scroll-50.png, content-1440-tile-03.png]

**F17.** At mobile the same region is not blank — it is gone. There is no "Community Labs by
Location" heading and no legend anywhere between the last category (OTHERS) and the newsletter card;
the gap there is an ordinary section margin of a few hundred pixels. Whatever the mechanism, mobile
demonstrates the better behaviour of the two: no heading for content that will not appear.
[capture: content-375-scroll-90.png, index-375-full.png]

## 5. Long scroll

**F18.** Nothing persists. `stickyOrFixedCount` is 0 and the scrolled captures confirm it: at 50%
the header — logo, BROWSE, search, ABOUT, CONTRIBUTE, NEWSLETTER — is entirely gone, and at 90% it is
still gone. No sticky header, no contents rail, no progress indicator, no back-to-top control, no
stage markers. Once past the first screen, the reader has no navigation and no search without
scrolling back to the top.
[capture: content-1440-scroll-50.png, content-1440-scroll-90.png; domEvidence stickyOrFixed,
stickyOrFixedCount]

**F19.** Rhythm holds for exactly one section. Carousel → categories is a clean two-beat structure;
then the empty map region occupies a full viewport with nothing in it and the rhythm is simply
absent for one screen. The 50% scroll position — the middle of the page, where a reader is most
committed — is a viewport containing four category items in two rows across its top 215 px, the
heading at y=330, and roughly 570 px of nothing below it.
[capture: content-1440-scroll-50.png]

**F20.** The end of the page is a three-stage wind-down: the tinted newsletter card, then a row of
infrastructure credits (Deployed on Netlify / Shared on GitHub / Search by Algolia / Supported by
DIYbio) rendered at a notably large scale in mid grey, then a small legal row (Terms of Use,
Contributor Terms, Code of Conduct, FAQ, GitHub and Twitter marks) and the CC0 badge with the
sentence "Except where otherwise noted, content on this site is dedicated to the public domain".
That licence sentence is the palest text on the page — lighter than the vendor logos above it.
[capture: content-1440-tile-03.png, index-375-tile-05.png, content-375-scroll-90.png]

## 6. Imagery

**F21.** Photographs appear in exactly one place — as backgrounds inside carousel slides — and they
carry no information. They are desaturated and dimmed to let type sit on top, and they are
interchangeable: a bench, a workshop, a pipetting hand. They tell you a place is a real physical lab
with people in it, which is genuinely something a text field cannot do, but no photograph here
communicates a specific fact about the entry it belongs to.
[capture: index-1440-tile-01.png, content-1440-scroll-00.png]

**F22.** Type over photograph costs legibility on at least one slide, and the worst of it is the
title, not the body. The centre DIYbiosphere panel sets "DIYbiosphere" in white with a drop shadow
directly over a *light* grey petri-dish photograph — the weakest contrast on the first screen at
both viewports. The near-black line beneath it, "An open source project to connect DIYbio
initiatives worldwide", holds better, though its strokes still break up against the dish outlines.
The white-on-dark slides beside it (Hackuarium, SoundBio) read considerably better than either.
[capture: index-1440-tile-01.png]

**F23.** The category icons — flask, rocket, briefcase, leaf, people, share-nodes, calendar,
umbrella — are decoration, not data. They are all one blue, all one weight, and each simply restates
its label. They do useful work as scan anchors in the two-column desktop grid; at mobile, centred
above their labels with the text left-aligned beneath, they break the alignment of the column and
add height without adding meaning. Inferred: these are FontAwesome glyphs injected as SVG, from
`htmlAttributes.class` = `fontawesome-i2svg-active fontawesome-i2svg-complete` and `svgCount` 77.
[capture: index-1440-tile-01.png, index-375-full.png, content-375-scroll-50.png; domEvidence
htmlAttributes, svgCount]

**F24.** The one graphic on the page that would have carried real meaning — a world map of community
labs, the single best argument this site has for existing — is the one that is not there in the
capture. What survives is its legend. A page whose meaningful graphic fails degrades to a heading
and a floating key.
[capture: content-1440-tile-03.png, content-1440-scroll-50.png]

**F25.** The largest, most confident imagery at the end of the page is other companies' logos —
Netlify, GitHub, Algolia, DIYbio — set larger than the legal links beneath them and larger than most
body text on the page.
[capture: content-1440-tile-03.png, index-375-tile-05.png]

## 7. Defers or competes

**F26.** Competes, in one place, decisively: the carousel. It is the largest thing on the page, it
holds the publisher's own promotional panel among the records, it clips its neighbours, it carries
its own previous/next controls, and it repeats its slides in the DOM for looping — seven panels per
loop (six labs plus the publisher's), 15 `h1`s inside the first 40 headings, and a recorded
`headingCount` of 44, which allows about two and a bit copies rather than three. The first screen is
about the mechanism of browsing rather than about anything browsed.
[capture: index-1440-tile-01.png, content-1440-scroll-00.png; domEvidence headingOutline]

**F27.** Competes, quietly: the newsletter is the only colour-filled, contained, visually promoted
block on the entire page — every record and category row sits on bare white, and the only other
bounded element anywhere is the small map legend. In a directory, the sign-up form ends up looking
more designed than any record.
[capture: content-1440-tile-03.png]

**F28.** Defers, and well: the category grid and the footer legal row. Both are plain text at plain
weight with no container, no shadow, no accent bar. The map legend does the most careful work on the
page, but it is not undecorated: two dots, two labels, a rule and a checkbox inside a bordered,
faintly filled, rounded box — small and quiet, yet the second most contained element on the page
after the newsletter card.
[capture: content-1440-tile-03.png, content-1440-tile-02.png]

**F29.** The monospaced face used for headings and body throughout is the page's one stylistic
gesture, and it is neutral enough not to compete: it reads as a plain-text, community-edited record
rather than as a magazine.
[capture: index-1440-tile-01.png, content-1440-tile-02.png]

## 8. Information design of data-heavy, uncertain, community-sourced material

**F30. What data it shows.** From the carousel panels, an entry's visible record shape is four
fields: a **name** ("Genspace", "Hackuarium", "BioHack UIO"); a **type-and-place line** in a
consistent grammar — "Lab in Brooklyn, United States", "Lab at UniverCite in Renens, Switzerland",
"Lab in Quito, Ecuador"; a **one-sentence self-description**; and **one action** ("Take a Class",
"Join our Open Meetups", "Learn…"). The type-and-place line is the strongest information-design
decision on the page: one grammar, two facts (kind, location), reused identically across entries, so
it is comparable at a glance.
[capture: index-1440-tile-01.png, content-1440-scroll-00.png; domEvidence headingOutline]

**F31. What metadata it does not show.** In these captures there is no date of any kind — no added,
updated or last-verified stamp. No version, no revision id, no contributor name or handle on a
record, no per-record licence, no identifier (no DOI, ROR, ORCID, registry number), no count of
anything, no tags or badges on an entry, no "sources" line. The only dated thing on the page is the
promise of a monthly newsletter.
[capture: index-1440-tile-01.png, content-1440-tile-02.png, content-1440-tile-03.png]

**F32. The one uncertainty signal on the page, and it is half right.** The map legend has a blue dot
for "Active labs", a *single* grey dot for "Inactive / unknown labs", a horizontal rule, and an
unchecked checkbox "Show inactive/unknown labs too". Two things are right about it. It gives
uncertainty a colour that recedes rather than alarms (grey, not red). And it makes the default an
honest one: by default the map shows only what is believed active, and seeing the uncertain
remainder is an explicit opt-in with a plainly worded label. That is a directory admitting that a
community-maintained list decays, and putting the admission in the interface rather than in an about
page. But it does **not** hold two states apart, as a first reading suggests. *Inactive* (known
closed) and *unknown* (never established, or never checked) share one dot, one label and one toggle;
a reader can neither tell them apart on the map nor filter for one without the other. Only the slash
in the label records that there are two.
[capture: content-1440-tile-03.png, content-1440-scroll-90.png]

**F33. That signal is confined to one component.** Nothing else on the page is graded. The carousel
entries carry no activity state at all — a reader cannot tell from a slide whether that lab still
exists. The category rows carry none. So the site has exactly one uncertainty vocabulary, it lives
inside the legend of a map, and at mobile it is not present at all.
[capture: index-1440-tile-01.png, content-375-scroll-90.png, index-375-full.png]

**F34. No verification marks of any kind.** There is no verified badge, no reviewed-by line, no peer
or moderator mark, no confidence indicator, no replication or sample count, no "self-reported"
label, no last-checked date — not on a slide, a category row, the legend or the footer. What the
captures show is the page's silence about who wrote each description; they do not show who did, so
"self-reported" is a reasonable guess about this site and not a finding from these images.
[capture: index-1440-tile-01.png, content-1440-tile-02.png]

**F35. The only provenance boundary the page marks is at corpus level, not record level.** The
category definitions ("Umbrella term for the rest of misfit entries") are editorial; the lab
descriptions are contributed. They are not typographically identical — the definitions are small
dark-grey type on white, the descriptions large white type over photographs — but neither carries
any mark of *who wrote it*, which is the part that matters. The one moment the page marks the
boundary is the DIYbiosphere carousel panel saying
"To contribute all you need is a GitHub account!" — which tells a reader the *whole corpus* is
contributed, in place of telling them anything about a *particular record*.
[capture: index-1440-tile-01.png, content-1440-tile-02.png]

**F36. Provenance is stated at site level, not record level.** The footer chain — "Shared on GitHub",
"Deployed on Netlify", "Search by Algolia", "Supported by DIYbio", the CC0 badge, and links to Terms
of Use, Contributor Terms and Code of Conduct — tells a reader how the whole dataset is governed,
licensed and edited. That is real provenance information and it is more than most community sites
offer. But it is one statement about ten thousand facts, set in the palest grey on the page, at the
very bottom. Nothing carries provenance down to the individual entry.
[capture: content-1440-tile-03.png, index-375-tile-05.png]

**F37. What a reader gets here that a registry cannot give them.** Three things, all visible on the
first screen: **geography** (a map of where these places physically are — intended, if not rendered
here); **openness** (a specific, human invitation with a time attached — "Come visit on
OpenHackuarium night every Wednesday, from 7:30–10:30"; "hands-on STEAM workshops and open lab access
for ages 12 through adult"); and **a next action** that is entry-specific rather than generic
("Join our Open Meetups", "Take a Class"). A trial registry can tell you a site exists and give you a
contact field; it cannot tell you that you can walk in on a Wednesday evening. The price is that none
of it is verified, dated or graded.
[capture: index-1440-tile-01.png, content-1440-scroll-00.png]

**F38. Longevity relevance: none.** This is a directory of community biology labs, makerspaces,
courses and meetups. Nothing in any capture concerns ageing, lifespan, healthspan, compounds, doses,
model organisms or trial evidence. It should be read as a study of how a volunteer-maintained
directory presents uncertain, self-reported organisational records — not as a longevity source.
[capture: index-1440-full.png, index-1440-tile-01.png, content-1440-tile-02.png]

## 9. Absence handling

**F39.** Desktop renders the heading and then nothing. "Community Labs by Location" sits centred with
about a full viewport of blank white beneath it, and the legend box — "Active labs / Inactive /
unknown labs / Show inactive/unknown labs too" — floating alone at the left with no map behind it.
There is no message, no placeholder, no "map unavailable", no fallback list of locations. A reader
who cannot see the map is told nothing about why, and the legend actively implies a map is there.
[capture: content-1440-tile-02.png, content-1440-scroll-50.png, content-1440-tile-03.png]

**F40.** At mobile the region is absent rather than blank: no heading, no legend, no gap beyond an
ordinary section margin between the last category and the newsletter card, at every mobile scroll
position and in the full-page capture. But the captures show an end state, not a behaviour. The
desktop blank is a graphic that failed to paint; the mobile absence holds at all times and is
consistent with a plain breakpoint rule. Nothing here shows the page omitting a heading *because*
its data was missing, so this is a difference between viewports, not one design's two branches.
[capture: content-375-scroll-90.png, index-375-full.png]

**F41.** No field-level absence handling can be assessed from these captures, because no record page
was captured. Every carousel entry happens to have all four of its fields filled, so nothing here
shows what the site does with a lab that has no description or no action link. I will not guess.
[capture: index-1440-tile-01.png]

## 10. Baseline and rendering notes

**F42.** Light only, and plainly so: `bodyBackgroundColor` is `rgb(255,255,255)`, `bodyColor` is
`rgba(0,0,0,0.87)`, `htmlAttributes.dataTheme` is null, and `prefersColorScheme.found` is false —
though 4 of 8 stylesheets were unreadable, so "light-only" is a fair reading rather than a proof.
There is no theme control visible in the header or footer.
[capture: index-1440-tile-01.png, content-1440-tile-03.png; domEvidence bodyBackgroundColor,
prefersColorScheme, htmlAttributes]

**F43.** `textToHtmlRatio` is 0.0222 — 2.2% visible text to delivered HTML, against the 8.3%
recorded elsewhere in this study for RNAWiki. Both the ratio and the weight behind it are DOM
measurements rather than anything a capture shows: 19 images, 77 SVGs, and a carousel of seven
panels present about twice over (`headingCount` 44 against a 40-entry sample). What the captures do
show is the visible content those 179 KB deliver — one carousel, eight category rows, a failed map
and a form.
[capture: index-1440-full.png, index-1440-tile-01.png; domEvidence textToHtmlRatio,
outerHtmlLength, innerTextLength, imgCount, svgCount, headingCount]

**F44.** No consent or cookie banner appears in any capture — `bannerActions` records "no consent UI
found" for all four passes — so nothing in these images should be read as an overlay hiding design.
[capture: index-1440-full.png, index-375-full.png]

## 11. Added in verification

**V1.** At 375 px the carousel shows exactly one panel, and it is the publisher's own promotional
slide. The mobile first screen is a logo/BROWSE/hamburger row, a full-width search row, and the
DIYbiosphere panel with its green ADD YOUR ENTRY button — **no record at all**. The full-page mobile
capture shows the carousel never presenting more than one panel, so the previous/next arrows are the
only route from the first screen to an entry. A browse surface whose mobile first screen contains
zero rows of the thing being browsed is worth naming as an anti-pattern in its own right.
[capture: index-375-tile-01.png, index-375-full.png]

**V2.** No entry name is presented as a link, and the only link-coloured text inside the carousel
belongs to the publisher. Entry titles — "Hackuarium", "SoundBio Lab", "BioHac…" — render as plain
white display type with no underline, no colour change and no chevron, while "GitHub account!" on
the publisher panel is set in the site's blue. Each record's single button reads "Take a Class",
"Join our Open Meetups" or "Learn…": an action *at* the initiative, not a way into its record. For a
browse row on RNAWiki the record name itself must be the link into the dossier.
[capture: index-1440-tile-01.png, index-375-tile-01.png]

**V3.** The eight "Browse by Collection" rows carry no visible interactive affordance at all — no
link colour, no underline, no chevron, no count, no button. LABS, PROJECTS, GROUPS, EVENTS,
STARTUPS, INCUBATORS, NETWORKS and OTHERS are plain black uppercase names over plain grey
definitions with a blue icon beside them; blue marks links and buttons everywhere else on this page
("GitHub account!", Subscribe, "Powered by Buttondown.") but not here. The section the page names as
its browse mechanism reads as a glossary, and a reader is told neither that a collection can be
opened nor how many entries it holds. Pairs with F13: no affordance and no count.
[capture: index-1440-tile-01.png, content-1440-tile-02.png, content-375-scroll-50.png]

## For RNAWiki

### Borrow

**B1 — half of the legend, for browse/filter.** Borrow two things: a recessive grey for the
uncertain state rather than a warning colour, and an uncertain remainder shown by explicit opt-in
with the default stated in plain words ("Show inactive/unknown labs too", unchecked). Do **not**
borrow the state model. "Inactive / unknown labs" is one dot behind one toggle, which merges two
different kinds of not-known — precisely what boundary 6 of the project briefing forbids, since
`UNKNOWN`, `NOT_MEASURED`, `CONTRADICTED`, `MIXED` and `CONFIRMED` must stay distinct in
reader-facing copy. RNAWiki needs a separate mark *and* a separate filter per state, with this site's
opt-in mechanism wrapped around them. Applies to the **browse/filter** surface, and the same
vocabulary should then be reused on the **structured data blocks** so one word means one thing in
both places.
[capture: content-1440-tile-03.png, content-1440-scroll-90.png]

**B2 — one grammar for the type-and-place line, for browse/filter result rows.** "Lab in Brooklyn,
United States" / "Lab at UniverCite in Renens, Switzerland" is the same sentence pattern every time,
carrying kind and location, so a column of them is scannable and comparable. RNAWiki's equivalent —
kind of programme, population, phase — should get one fixed grammar reused verbatim across rows.
Note the tension with the uniqueness constraint: a repeated grammar like this must be generated
markup and must not count as page prose.
[capture: index-1440-tile-01.png]

**B3 — define the taxonomy on the page, for the reference/definitions surface.** Eight categories,
each with a one-line definition, including an honest residual ("Umbrella term for the rest of misfit
entries. New collections may arise"). Naming the leftover bucket and admitting the scheme may change
is exactly the tone the definitions page needs.
[capture: index-1440-tile-01.png, content-1440-tile-02.png]

**B4 — mobile's map omission, cited narrowly.** At 375 the section that has nothing to show is
simply not there — no heading, no placeholder, no gap. Worth citing when someone proposes an
empty-state box, but as an observed end state only. The original form of this item claimed the site
had implemented "absent data renders NOTHING"; that reading was refuted in verification (see below)
and the corresponding finding, F48, has been removed from the JSON.
[capture: content-375-scroll-90.png, index-375-full.png]

**B5 — site-level provenance in the footer, for the reference/definitions surface.** A visible chain
of licence, contributor terms, code of conduct and the repository the data lives in. Borrow the
completeness. Do not borrow the contrast (see A4).
[capture: content-1440-tile-03.png, index-375-tile-05.png]

### Avoid

**A1 — a hero carousel anywhere near the home search bar.** The home search bar is frozen and nothing
may compete with it. Here, a 400 px photographic carousel with a saturated green button takes the eye
before a borderless grey search field does, on both viewports. This is the clearest possible
demonstration of the failure the constraint exists to prevent; it is an anti-pattern to cite, not a
borrow.
[capture: index-1440-tile-01.png, content-1440-scroll-00.png, index-375-tile-01.png]

**A2 — a borderless, unfilled search field.** Even leaving the carousel aside, "Search DIYbio
initiatives" as grey placeholder text with no border and no fill is weaker than the nav links beside
it. RNAWiki's bar must stay a field that looks like a field.
[capture: index-1440-tile-01.png]

**A3 — a heading above content that may not render.** "Community Labs by Location" over a viewport
of white, with a legend for a map that is not there. If a dossier's mechanism diagram, timeline or
citation map has nothing to draw, the heading must not render either. This is the concrete failure
case for the **citation evolution map** surface, whose stated rule is that the text carries the
meaning and the graphic carries none — this page shows what happens when a graphic is load-bearing
and fails.
[capture: content-1440-tile-02.png, content-1440-scroll-50.png]

**A4 — the licence line as the palest text on the page.** "Except where otherwise noted, content on
this site is dedicated to the public domain" is set lighter than the vendor logos above it. For
RNAWiki, provenance and licence statements are part of the evidence, not fine print, and the public
copy rules require adequate contrast.
[capture: content-1440-tile-03.png, index-375-tile-05.png]

**A5 — records with no date and no state.** Not one entry here carries a last-checked date or an
activity state; the only staleness signal in the whole design lives in a map legend. For a dossier
this would be disqualifying — a claim without its source date and verdict state is not a record.
[capture: index-1440-tile-01.png, content-1440-tile-02.png]

**A6 — nothing persistent through a long scroll.** Zero sticky or fixed elements: past the first
screen there is no header, no search, no contents. The **dossier contents rail** is the Phase 2 item
still waiting on a decision, and this site is evidence for the rail, not against it — at 50% and 90%
scroll the reader here is stranded.
[capture: content-1440-scroll-50.png, content-1440-scroll-90.png]

**A7 — the sign-up card as the most designed block on the page.** The newsletter is the only tinted
container; contribution controls on RNAWiki belong on dossier and review pages and must not out-rank
evidence visually.
[capture: content-1440-tile-03.png]

### Phase 2 verdict

**not-named.** sphere.diybio.org appears nowhere in the Phase 2 table — that table assigns Apple
subtraction (home), awwwards.com (browse/filter), smashingmagazine.com with linear.app/method
(dossier reading column), unassigned with stripe.com/docs proposed (contents rail), stripe.com/docs
(structured data blocks), pudding.cool (citation map), vercel.com/docs (global search overlay) and
quantamagazine.org (reference/definitions). This is an A2 community site studied for information
design, not a Phase 1 measured reference, so there is no assignment here to strengthen or overturn.

It should not be given a surface. Three reasons, each from a capture: it fails the one number the
table treats as disqualifying — 2.2% text-to-HTML. That is better than atlasobscura.com's 0.17%, but
it is still a quarter of the 8.3% RNAWiki must improve on, and atlasobscura.com was dropped from the
table for exactly this measure (F43); its typographic system is a single monospaced face at near-uniform weight with no
measurable reading column, since no capture contains a paragraph of running prose (F3, F12); and its
first screen is the precise inverse of the frozen-search-bar constraint (A1).

What it argues for is narrower than first read, and partly cautionary. Its legend is the one place
on the page that puts an uncertainty state into the interface at all, and its **opt-in mechanism** —
default to what is believed current, offer the uncertain remainder behind a plainly worded checkbox —
is genuinely transferable to **browse/filter**. Its **state model is not**: one grey dot and one
toggle cover both "inactive" and "unknown" (F32). Recommendation: keep awwwards.com governing
browse/filter, and record sphere.diybio.org's legend as a *partial* component precedent — borrow the
recessive grey, the opt-in and the plainly stated default, and record the merged state as the
anti-pattern in the same entry — with no claim on the surface's typography, spacing or layout.

---

Numbering note: the borrow items B1–B5 above are recorded as F45–F49 in
`sphere_diybio_org.json`, and the avoid items A1–A7 as F50–F56, one to one — except F48, which
verification refuted and removed, leaving B4 above as a narrowed note with no matching finding id.
The JSON's `forRnawiki.avoid` list carries three further items — the flat heading outline, drawn
from F5, and two drawn from the verifier additions V2/V3 and V1. The JSON is the machine-readable
record; this file is the argument.

---

## Verification

Independent capture-only re-read: **35 confirmed, 20 qualified, 1 refuted, 3 added.** All cited
captures were opened, including the byte-identical pairs confirmed by `shasum` (`index-1440-tile-01`
= `content-1440-tile-01` = `content-1440-scroll-00`; `index-375-tile-01` = `content-375-tile-01` =
`content-375-scroll-00`; `index-1440-full` = `content-1440-full`).

**Refuted, removed from the JSON**

- **F48** (borrow B4) — claimed mobile implements "absent data renders NOTHING". The captures show a
  desktop graphic that failed to paint and a mobile section missing at every scroll position, which
  is consistent with a breakpoint rule; nothing shows the page omitting a heading *because* data was
  absent. The observable half survives as F17 and the rewritten F40, and B4 above is narrowed.

**Qualified, rewritten**

- **F2** — the publisher panel does differ from a record (no type-and-place line, repeats the site
  name), so "a reader cannot tell" was overstated; what is true is that nothing labels it.
- **F3** — "Browse by Collection" *is* set at a larger type scale; the missing size difference is
  between a category name and its own description.
- **F4** — the map legend is a bordered, faintly filled box, so "no container, no border and no
  fill" was wrong; the newsletter is the only *colour-filled* container.
- **F5** — `headingOutline` holds 40 of a recorded 44 headings, so the three visible section
  headings are outside the sample and no page-wide "no `h2`" claim is supportable.
- **F7** — the search placeholder is set *larger* than the nav items, not smaller, and a magnifier
  glyph does sit in the field; the finding survives on contrast and the absence of a bounding shape.
- **F9** — `role=combobox` and the Algolia credit are real, but "rather than a form navigating to a
  results page" is not observable in any capture.
- **F10** — four record panels plus one publisher panel, and four category items in *two* rows, not
  five entries and four category rows.
- **F15** — the gap from the carousel *controls* to the heading measures about 70 px; ~130 px is
  carousel bottom to heading.
- **F16** — the blank inside tile-02 is about 570 px, not 900; restated as the measurable total,
  about 760 px of the 2,638 px page.
- **F19** — four category items in two rows across the top 215 px, about 570 px blank below.
- **F22** — the weakest contrast is the white "DIYbiosphere" title over the pale photograph, not the
  dark body line beneath it.
- **F26** — `headingCount` 44 against a 40-entry sample supports about two and a bit loop copies,
  and seven panels per loop (six labs plus the publisher), not six slides tripled.
- **F27** — "every record, category and legend sits on bare white" is wrong for the legend; the
  claim survives as the newsletter being the only colour-filled container.
- **F28** — the legend is the second most *contained* element on the page, not the least decorated.
- **F32** — *the most important correction.* The legend does not keep "inactive" and "unknown"
  distinct: one grey dot, one label and one checkbox cover both, so a reader can neither tell them
  apart nor filter for one without the other. The viewer read it as refusing to collapse two kinds
  of not-known; `content-1440-tile-03.png` shows the opposite.
- **F34** — "every description is in substance self-reported" is not visible in any capture; the
  observable fact is that nothing on screen says who wrote them.
- **F35** — editorial and contributed text are not typographically identical (small dark grey on
  white versus large white over photographs); what is true is that neither carries a provenance mark.
- **F40** — the mobile omission is an observed end state, not demonstrated absence handling.
- **F43** — the ratio and the DOM repetition are measurements, not things a capture shows, and the
  8.3% RNAWiki comparator is a figure recorded elsewhere in this study rather than observed here.
- **F45** (borrow B1) — rested on the F32 misreading. Rewritten to borrow the recessive grey, the
  opt-in and the plainly worded default only, and to name the merged state as the half boundary 6
  forbids. The Phase 2 verdict paragraph and `forRnawiki.borrow[0]` were rewritten to match.

**Added** — V1, V2 and V3 above, all three bearing on the browse/filter surface.
