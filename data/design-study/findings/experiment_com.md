# experiment.com — Track A2 viewing notes (information design of a community science site)

Experiment is a crowdfunding platform for individual research projects: a researcher posts a
proposal, people pledge money against a dollar goal and a deadline, and the researcher posts
"Lab Notes" as the work proceeds. Two pages were captured (manifest
`data/design-study/captures/experiment_com/manifest.json`): the home page
`https://experiment.com/` and one project page,
`https://experiment.com/projects/algorithms-and-news-trust-why-independents-may-be-left-behind`,
each at 1440x900 and 375x812 with full-page, tiled and three real scrolled views. The manifest notes
that no API-documentation URL was discoverable, so the content page is a project record chosen as
the first project anchor on `https://experiment.com/discover`. The site is **not longevity-relevant**
in subject matter — the captured project is a communication-studies survey about news trust, and the
home carousel shows mycology, amphibian disease and firefly genomics
(`index-1440-tile-01.png`). It is relevant to us only as an information-design case: a community
platform that publishes *proposed*, unfinished, self-reported research to a lay audience.

Two capture caveats apply throughout. Tiles are slices of one full-page paint, so persistent chrome
is judged only from the `-scroll-00/50/90` files. The manifest's `bannerActions` records a consent
banner "left standing" on all four passes, but the controls it lists are ordinary navigation and
footer links (ABOUT, How It Works, FAQ, Terms, Privacy Policy, Cookie Policy) and **no consent
overlay is visible in any capture I viewed** — I read those entries as the detector matching the
footer, not as an obscuring banner. Separately, the manifest's own capture list for `index-375`
jumps from `tile-12` to `tile-17`: tiles 13–16 were never captured, so roughly 3,250 px of the
14,536 px mobile home page is unseen and I describe nothing from it.

## 1. Visual hierarchy

(The viewer's F1, a three-step reading of the project page's first screen, was refuted in
verification and removed; F6 now carries that screen. See Verification.)

**F2.** Below the fold the hierarchy flattens badly. Every section heading — About This Project, Ask
the Scientists, Budget, Endorsed by, Project Timeline, Meet the Team, Lab Notes, Additional
Information — is rendered at the same size, the same weight and the same colour. Most carry a small
grey pictogram to the left, each a different glyph (question mark, pie chart, rosette, flag,
document); About This Project carries none. A reader gets no cue that "Budget" (hard numbers) and
"Additional Information" (personal motivation) are different kinds of content, or which sections
carry evidence. The DOM outline lists them all as `h2` — and lists the eight timeline event labels as
`h2` too, although those render smaller and lighter than body prose (V3).
[capture: content-1440-tile-02.png, content-1440-tile-04.png, content-1440-tile-05.png,
content-1440-tile-07.png]

**F3.** The home page runs a different and weaker hierarchy: a large serif headline over a dark
photographic starfield, then a repeating three-part unit — small teal all-caps eyebrow, serif
section headline, grey subtitle — used at least four times down the page (HELPING MAKE IDEAS REAL
SINCE 2010 / THE EXPERIMENT PROMISE / POWERFUL TOOLS TO HELP YOU GROW / WHAT OUR COMMUNITY SAYS).
Because the unit never varies, the page reads as one long tier rather than a hierarchy.
[capture: index-1440-full.png, index-1440-tile-02.png, index-1440-tile-09.png]

## 2. Where the eye lands first

**F4.** Desktop home: the eye lands on the headline "Fund curiosity & fuel scientific discovery",
because it is white serif at display size centred on a near-black field with nothing else competing.
The search field sits in the header at the same height as the wordmark, small and grey-on-dark, and
carries far less visual weight than the headline and the two centred buttons — where exactly it falls
in a reader's order is not something a still capture can settle. This is chrome-first only in the
sense that the primary act on this page is a slogan and a pair of buttons, not the content: the
actual projects are pushed to a horizontally scrolling carousel below the fold.
[capture: index-1440-tile-01.png]

**F5.** Mobile home: the header collapses to a hamburger and the wordmark, and **the search field
disappears entirely from the first screen**. The eye lands on the headline again, then on the green
`Start a project` button. A reader arriving on a phone cannot search without opening a menu.
[capture: index-375-tile-01.png]

**F6.** Desktop project page: the title and the money compete, and the money wins. `$2,320` is set
larger and heavier than any word of the h1, at the top of the right column above a teal progress bar
and the `52% Funded / $4,520 Goal / 17 Days Left` row. The h1 is itself the research question, and
the first screen ends at the `Overview | Methods | Lab Notes (2) | Discussion (4)` row, so no
methodological prose appears on it at all. [capture: content-1440-tile-01.png,
content-1440-scroll-00.png]

**F7.** Mobile project page: the order is forced by stacking — hero image, a full-bleed teal progress
bar under it, then the title, then a compressed metric row (`$2,320 pledged | 52% funded | 17 days
left`), then the button. The image lands first and it carries no information about the study; the
progress bar is the first *data* the reader meets. [capture: content-375-tile-01.png,
content-375-scroll-00.png]

## 3. Information density

**F8.** The project page is very low density for its length. It is 7,227 px tall at 1440 px wide, and
the manifest's own DOM sample records 8,395 characters of visible text against 69,067 characters of
markup (a 0.1215 text-to-HTML ratio). The whole right half of the reading area below the funding
panel is empty on nearly every screen — the prose column ends around x=870 and nothing occupies
x=870–1440 for the About, goals, Endorsed by, Lab Notes or Additional Information sections.
[capture: content-1440-full.png, content-1440-tile-02.png, content-1440-tile-03.png,
content-1440-tile-07.png]

**F9.** The one dense screen is Budget, and it is the most structured block on the page — but the
structure is looser than it looks. The left column carries a prose justification per line item
("Participant Rewards ($3,000): Compensation for 1,000 U.S. adults completing a 9-minute survey…")
and the right column carries the items as a colour-keyed legend with right-aligned amounts ($3,000 /
$1,000 / $320 / $200) beside a donut. No table rules are used. But the two columns are not
row-aligned and their item labels differ — the legend's four rows and the prose's four paragraphs
neither match in wording nor sit on the same lines, which is how the inconsistency in V1 survives.
[capture: content-1440-tile-03.png, content-1440-tile-04.png, content-375-tile-06.png]

**F10.** Lists are handled as cards, not rows, and the cards are thin. Two Lab Notes take a band of
their own to carry a title, a date and three counts each; the Project Backers band carries one row of
cartoon avatars — twelve of them, beneath a heading row that reads `13 Backers`. Where a table would
have been dense and scannable, the design spends a band. [capture: content-1440-tile-07.png,
content-1440-tile-08.png]

**F11.** The home page's summary statistics are the hardest thing on it to read: the band reading
"1,400 Projects Funded", "49%…", "25,000 Labnotes" is laid over the dark starfield photograph at a
contrast so low the digits barely resolve in the capture. It is not the page's only numeric element —
the grant carousel further down sets `$59,130 Funding Awarded` and `$51,470 Funding Awarded` legibly
in white over photographs — so the low contrast is a choice made for the summary band alone.
[capture: index-1440-tile-02.png, index-1440-tile-08.png, index-1440-full.png]

## 4. Whitespace

**F12.** Whitespace is spent almost entirely on vertical separation between sections and on an unused
right margin, not on the reading column. The break between sections is a hairline rule plus roughly
150–170 px of space — about a sixth of a 900 px viewport, not the third of a screen it feels like —
and it recurs at the same size after About This Project, after the Budget prose, after the
endorsement and after Additional Information. Because every gap is identical, the whitespace says "a
section ended" but never "this section matters more". [capture: content-1440-tile-02.png,
content-1440-tile-04.png, content-1440-scroll-50.png, content-1440-scroll-90.png]

**F13.** Inside blocks the spacing is tight and well judged: the endorsement quote sits 8–10 px from
its thin teal left rule, the endorser's name/role/institution stack on three lines with no gaps, and
the timeline's date and label sit as a tight pair with generous space between pairs. The small scale
is competent; the large scale is undifferentiated. [capture: content-1440-scroll-50.png,
content-1440-tile-05.png]

**F14.** Section identity is carried by background tint rather than by space where it matters most:
"Meet the Team" sits on a light grey band that runs the full page width, and that band — not the
gap — is what tells you a new kind of content started. It is the only such band in the body.
[capture: content-1440-tile-05.png, content-1440-tile-06.png]

## 5. Long scroll

**F15.** **Nothing persists.** At 50% and 90% scroll depth the header, the wordmark, the search
field, the funding panel and the `Back This Project` button are all gone; the viewport shows bare
content on white. The DOM evidence agrees: of four `stickyOrFixed` elements, two are zero-height
divs, one is the reCAPTCHA badge and one is a 1 px iframe — there is no sticky header, no sticky
funding rail, no progress indicator and no contents rail. On a 7,227 px page the reader loses both
the primary action and their sense of position. [capture: content-1440-scroll-50.png,
content-1440-scroll-90.png, content-375-scroll-50.png, content-375-scroll-90.png]

**F16.** There *is* a section navigation — `Overview | Methods | Lab Notes (2) | Discussion (4)`
under the hero, with counts in the labels — but it scrolls away with everything else and **it is
absent entirely at 375 px**, where the page goes straight from "How does this work?" to "About This
Project". The one wayfinding device on the page is desktop-only and non-persistent.
[capture: content-1440-tile-01.png, content-375-tile-01.png]

**F17.** Rhythm holds for the first two-thirds — heading, prose, gap, hairline rule, repeat — and
breaks at Meet the Team, where the layout jumps to a three-column arrangement (photo, credentials,
long first-person biography) that appears nowhere else, and again at Lab Notes, which introduces
cards. [capture: content-1440-tile-05.png, content-1440-tile-06.png, content-1440-tile-07.png]

**F18.** The end of the page is a sales close, not a summary: a dark slate band headed SEE YOUR
SCIENTIFIC IMPACT with a `Fund This Project` button and a mock academic paper with a teal "YOUR NAME
HERE" arrow pointing at the author line, then a four-column dark footer. The last thing a reader is
told about a study is what their name would look like on it. [capture: content-1440-tile-08.png]

**F19.** The mobile page ends differently again: the home page's final band is a photograph with
"Learn more by reading about our mission" over it, then a dark footer whose DISCOVER / START / ABOUT
groups are collapsed to headings with no visible links, above a newsletter field. Column groups that
carry real navigation on desktop are reduced to labels on mobile. [capture: index-375-tile-18.png]

## 6. Imagery

**F20.** Images on the project page decorate; they do not carry meaning. The hero is a stock
illustration of a donkey and an elephant flanking a flag — a topic mood image that states nothing the
title does not. Worse, **both Lab Note cards use that same hero image as their thumbnail**, so the
one place where images could distinguish two updates renders them identical.
[capture: content-1440-tile-01.png, content-1440-tile-07.png]

**F21.** The only graphic that carries data in the body of the record is the budget donut — the
funding panel's progress bar aside — and it is largely redundant with the legend beside it: four
amounts already right-aligned and summed in prose. It is legible and honest, but it adds little the
numbers do not say. At 375 px the legend and the prose justifications separate onto different
screens, so an amount and its reason no longer sit together. [capture: content-1440-tile-01.png,
content-1440-tile-04.png, content-375-tile-05.png, content-375-tile-06.png]

**F22.** The timeline communicates sequence clearly — a vertical rule with dots, date in small bold
caps, event label in grey beneath, and a `Show more events` button on the last dot — but it does not
communicate duration. The dots sit at a uniform pitch although the intervals between the dates are
16, 19, 25 and 31 days, so the diagram encodes order only. Its worse failure is described in F26.
[capture: content-1440-tile-05.png, content-1440-scroll-50.png]

**F23.** Faces are everywhere and they are load-bearing for trust rather than for information: the
researcher's portrait, the endorser's portrait, twelve cartoon backer avatars, two executive
directors' headshots on the home page. Where there is no photograph the design substitutes a
generated cartoon face rather than leaving the slot empty. [capture: content-1440-tile-08.png,
index-1440-tile-09.png]

## 7. Defers or competes

**F24.** It competes, and consistently in one direction: toward the pledge. `$2,320` outweighs the
title; the teal `Back This Project` button is the largest saturated element above the fold — the
small `Psychology` and `Social Science` chips are saturated too, but they are chips — and it is
repeated at the foot of the page; the funding panel takes the entire right column at the reader's
strongest position. The single clearest statement of what the study asks — "Does perceived
algorithmic relevance explain the trust gap between independents and partisans?" — is in ordinary
body text below all of it. [capture: content-1440-tile-01.png, content-1440-tile-02.png,
content-1440-tile-08.png]

**F25.** Where it does defer, it defers well. "Ask the Scientists" is set as three plain questions in
plain heading text with the researcher's own prose beneath and inline teal links anchored on the
exact claim phrase rather than gathered into a bare source list ("28%, a historic low", "45% of
Americans now identify as independents", "algorithmic systems optimized for engagement rather than
journalistic norms"). Where those links actually go cannot be checked from a capture; the anchoring
is the transferable part. No pull quotes, no callout boxes, no graphic treatment — the argument is
allowed to be text. That section is the strongest reading experience on the site.
[capture: content-1440-tile-02.png, content-1440-tile-03.png]

## 8. Information design of data-heavy, uncertain, community-sourced material

**F26.** **The single most important finding: the timeline gives a scheduled date the same standing
as a completed one.** Today is 2026-09-04; the page shows AUG 05 2026 IRB Approval, AUG 21 2026
Project Launched, SEP 09 2026 Project fully funded, OCT 04 2026 Data Collection Complete, NOV 04 2026
Data Analysis Complete — all with the same date typography, the same grey label and a filled dot. The
dots do differ, but only by a decorative green-to-teal gradient down the rule (the collapsed trailing
dot is grey), which tracks position on the line rather than status. Meanwhile the funding panel on
the same page says 52% funded with 17 days left, so "Project fully funded" on 09 September is a
projection, not a fact. Nothing in the visual language separates *has happened* from *is scheduled to
happen*. A reader who scrolls to the timeline and not the header will read a forecast as a record.
[capture: content-1440-tile-05.png, content-1440-scroll-50.png, content-1440-tile-01.png]

**F27.** The badge vocabulary is thin and mixes categories without distinguishing them. Four chips sit
under the hero: `Liberty University` and `Omaha, Nebraska` as grey outlines, `Psychology` and `Social
Science` as filled pink and blue. Institution, geography and discipline are given equal visual
standing; none of them is an evidence signal. **And the whole chip row is dropped at 375 px** — the
institutional affiliation, the one provenance marker on the page, does not exist on a phone.
[capture: content-1440-tile-01.png, content-375-tile-01.png]

**F28.** Evidence quality is signalled by *people*, not by method. "Endorsed by" carries one sentence
— "I am really excited for the research in this project" — attributed to a named professor at the
same institution as the researcher, with a portrait. There is no marker for what the endorsement
covers, no statement of independence, no reviewer count, no date, and no indication that "endorsed"
means anything more specific than a colleague pressing a button. The heading uses a small rosette
pictogram that reads as an award. [capture: content-1440-tile-04.png, content-1440-scroll-50.png]

**F29.** Methodological facts that *would* signal quality exist but are buried in prose rather than
surfaced as fields. "A national survey of 1,000 adults and structural equation modeling", "1,000 U.S.
adults completing a 9-minute survey", "quota sample size is required for structural equation modeling
with latent constructs", "recruitment through Prolific", "must be formally defended before a
university committee" — sample size, recruitment platform, analysis method and review status are all
present in the text and none is a structured field, a badge or a metadata row. The one exception is
ethics approval, which appears as a dated timeline row ("AUG 05 2026 IRB Approval") — a date and a
label, but still not a field a reader could compare across projects.
[capture: content-1440-tile-02.png, content-1440-tile-03.png, content-1440-tile-04.png,
content-1440-tile-05.png]

**F30.** The metadata rows that *do* exist count engagement and money, not evidence. Each Lab Note
card carries three icon+number pairs — comments, likes, views (1/1/10 and 0/2/15) — and the Project
Backers band carries `13 Backers | 52% Funded | $2,320 Total Donations | $178.46 Average Donation`
set in the same numeric style as the funding panel. Popularity and money are the only quantities the
design elevates to a metric row. There is no sample count, no replication marker, no confidence
statement, no version or revision indicator, no DOI or registry identifier, and no licence anywhere
in the captures. [capture: content-1440-tile-07.png, content-1440-tile-08.png,
content-1440-scroll-90.png]

**F31.** Everything on the page is user-contributed and **nothing marks it as such.** The proposal
prose, the budget justification, the timeline, the biography and the "Additional Information" section
are all the researcher's own writing, and the last of these is openly personal — "As a doctoral
candidate, I chose this topic because I noticed a pattern…", "Much love and thanks!" — yet it is set
in the same typeface, size, colour and column as the research argument, under an equally weighted
`h2`. There is no editorial voice, no platform annotation, no "self-reported" label, no verification
mark of any kind. The only third-party voice, the endorsement, is visually weaker than the
researcher's own biography. [capture: content-1440-tile-06.png, content-1440-tile-07.png,
content-1440-scroll-90.png]

**F32.** What a reader gets here that a trial registry cannot give them: the researcher's stated
reasoning in their own words, a line-by-line justification of what the money buys, a named human with
a face and a career history, a running log of what has actually been done (Lab Notes: "Survey draft
completed", "IRB approved! Moving forward!"), and a public discussion channel with a count on the
tab. That is genuine — a registry entry has none of it. What is lost in exchange is the ability to
tell a plan from a result, which the registry's status field does give you.
[capture: content-1440-tile-06.png, content-1440-tile-07.png, content-1440-tile-01.png]

**F33.** The home page shows the failure mode of community testimony rendered as design: the two
organisation quotes under "Trusted by community-led science innovators", attributed to two different
named executive directors at two different organisations, end with the *same* 28-word sentence,
word for word — "Experiment brings a unique mix, supporting innovative, and even outsider science,
providing access to a great network beyond the typical gatekeepers, and they truly combine rigor with
fun." Two attributed voices, one text. [capture: index-1440-tile-09.png]

## 9. Absence handling

**F34.** No placeholder or "not available" line appears anywhere on the page. The endorsement block
shows one endorser with no "1 of N" or "no other endorsements" line; the timeline's collapsed tail is
a `Show more events` button on a grey dot rather than a stated count of hidden events — the DOM
outline lists eight timeline events against five rendered, so three are hidden behind a control that
never says so. (The blank right column is not an empty state; it is the layout consequence described
in F36.) This matches RNAWiki's own rule that absent data renders nothing.
[capture: content-1440-tile-04.png, content-1440-tile-05.png]

**F35.** The exception, and it is the wrong one: where a *person* has no photograph, the design fills
the gap with a generated cartoon face rather than omitting the avatar. And the row does not hold to
its own count — twelve coloured cartoon heads, several clearly generated, sit under a heading reading
`13 Backers`. The page will leave a data field empty but will not leave a face empty.
[capture: content-1440-tile-08.png, content-1440-scroll-90.png]

**F36.** The one genuinely empty-looking region is not an empty state but a layout consequence: on
the About, goals, Lab Notes and Additional Information screens the right 40% of the viewport is
white because the funding panel has ended and nothing replaced it. It reads as a missing rail rather
than as deliberate margin. [capture: content-1440-scroll-90.png, content-1440-tile-07.png]

## 10. For RNAWiki

### Borrow

**B1. The budget block's pairing of a value with its written justification, for *structured data
blocks* — with one correction.** Narrative justification in the reading column on the left; the same
items as a compact colour-keyed list with right-aligned values on the right; no table rules; one
total stated in the prose. That is the shape a per-trial or per-source data block needs. But bind
each value and its justification into one row: Experiment's two columns are unaligned and use
different item labels, which is exactly why a prose figure can contradict the itemization beside it
with nothing catching it (V1). It is a *secondary* pattern only: stripe.com/docs governs that surface
and its chrome-scale type and per-block copy control stay. [capture: content-1440-tile-03.png,
content-1440-tile-04.png]

**B2. The plain-question heading pattern, for the *dossier reading column*.** "What is the context of
this research?", "What is the significance of this project?", "What are the goals of the project?" —
ordinary questions as headings, answered in unadorned prose with source links anchored on the exact
claim phrase rather than gathered into a bare source list. No callouts, no pull quotes. This is the
one place the site defers to content and it is directly transferable to our five evidence questions.
[capture: content-1440-tile-02.png, content-1440-tile-03.png]

**B3. Counts inside section-navigation labels, for the *dossier contents rail*.** `Lab Notes (2)`,
`Discussion (4)` tell a reader how much is behind a link before they spend a scroll on it. Cheap,
honest, and it is markup rather than prose so it costs nothing against the uniqueness target. Borrow
the label-with-count; do **not** borrow the placement, which scrolls away and vanishes at 375 px.
[capture: content-1440-tile-01.png, content-375-tile-01.png]

**B4. A page can carry no placeholder lines at all and not look broken.** No "no data" or "not
available" line appears anywhere in the captures. Whether the page also omits whole sections for lack
of data cannot be seen from a capture, so only the first half of this is a borrow — but the first
half is the part we needed confirmed at page scale. [capture: content-1440-tile-03.png,
content-1440-tile-05.png]

### Avoid

**A1. A timeline that does not distinguish a completed event from a scheduled one — and one whose
spacing does not represent elapsed time.** This is the strongest negative lesson on the site and it
maps straight onto our mechanism stages and trial timelines. If RNAWiki draws a timeline, a past
event and a planned event must differ in the mark itself, a projected date must be labelled as
projected, and the spacing must either encode the interval or not pretend to. On this page a study
that is 52% funded displays "Project fully funded" as a dated dot differing from "Project Launched"
only by a step in a decorative gradient, and the five dots are evenly spaced although the intervals
are 16, 19, 25 and 31 days. [capture: content-1440-tile-05.png, content-1440-tile-01.png]

**A2. Money, popularity or engagement as the heaviest element on an evidence page.** `$2,320` beats
the h1; comment/like/view counts are the only metadata row on a record. Nothing on a dossier may
outweigh the conclusion and its scope, and no engagement count belongs in a metadata row at all —
this also runs into the recognition-is-leaderboard-only rule already recorded for this project.
[capture: content-1440-tile-01.png, content-1440-tile-07.png]

**A3. A single flat heading weight for sections of unlike kind.** Budget, Endorsed by and Additional
Information all sit at identical `h2` weight, so a reader cannot tell an evidence section from a
personal note. Our sections differ in evidentiary status and must differ visually.
[capture: content-1440-tile-04.png, content-1440-tile-07.png]

**A4. Contributor prose set identically to editorial or reviewed content, with no provenance mark.**
The researcher's first-person motivation and the study's methodology share one typographic
treatment. RNAWiki must keep contributed, staged and published text visibly distinct.
[capture: content-1440-tile-06.png, content-1440-tile-07.png]

**A5. A trust mark whose scope is undefined.** A rosette pictogram, one enthusiastic sentence and a
same-institution portrait is presented as "Endorsed by". If we show a reviewer, show what exact
claim and digest they signed. [capture: content-1440-tile-04.png, content-1440-scroll-50.png]

**A6. Dropping provenance chips and section navigation at 375 px.** Institution, location and the
Overview/Methods tab bar all disappear on mobile. Our 320 px requirement is stricter than this and
provenance is not decoration to be shed. [capture: content-375-tile-01.png,
content-1440-tile-01.png]

**A7. Duplicated body text across two attributed records.** Two named endorsers, one identical
28-word sentence. This is precisely the positional-overlap failure our uniqueness constraint exists
to prevent, and it is visible on a live public page. [capture: index-1440-tile-09.png]

**A8. Reusing one image across every record on a page.** Both Lab Notes carry the same hero
thumbnail, which makes two distinct updates look like one duplicate. If we have no distinct image,
show none. [capture: content-1440-tile-07.png]

**A9. Nothing sticky on a 7,000 px page.** No header, no rail, no progress. Our dossier contents rail
exists to solve exactly this, and this page is the counter-example that justifies it.
[capture: content-1440-scroll-50.png, content-1440-scroll-90.png]

**A10. Anything that would sit above or beside the home search bar.** Experiment's home puts a
display headline and two buttons above the fold and demotes the search field into the header, then
removes it entirely at 375 px. That is the opposite of our frozen home. Nothing from this site's home
page is a borrow. [capture: index-1440-tile-01.png, index-375-tile-01.png]

### Phase 2 verdict

**not-named — and it should stay unassigned as a governing reference.** experiment.com is an A2
community site and appears nowhere in the Phase 2 table, which is correct: its measured text density
(0.1215 text-to-HTML in the manifest's own DOM sample, against a corpus already at 8.3% that must
rise) disqualifies it on the same ground that dropped atlasobscura.com, and its home page is
structurally incompatible with the frozen search bar (F4, F5). It does not weaken any existing
assignment.

It makes one positive argument for a surface it does not hold: the **structured data blocks** row
currently lists stripe.com/docs as governing with no secondary, and the Budget block (B1) is a
measured, rendered example of the one thing Stripe's field blocks do not show — a value and its
justification aligned on the same row. That is worth recording as a candidate secondary influence
for that surface, subject to Felix's decision; it does not change the governing reference.

It also supplies the clearest **negative constraint** yet observed for the citation-evolution-map and
dossier-timeline work: F26. A timeline that gives a projection the same mark as a record is the
specific failure our "UNKNOWN is not failure" boundary exists to prevent, and it is worth carrying
into Phase 3 as a named anti-pattern rather than as a reference.

## 11. Added in verification

**V1.** In the Budget block a figure stated in prose contradicts the itemization printed beside it,
and nothing in the layout catches it. The prose reads "Experiment Fees ($320): Covers Experiment's 8%
platform fee **and payment processing**", while the legend on the same screen itemizes `Experiment
platform fee (8%) $320` and `Payment processing (estimated 5%) $200` as two separate lines — and the
stated total, $4,520, equals 3,000 + 1,000 + 320 + 200, so the sentence understates by $200. The two
columns are not row-aligned, so the number and the sentence describing it never appear side by side
and the disagreement is invisible until you add them up. This is the failure mode a value-and-reason
block has to design against, and it is the reason B1 carries a row-binding correction.
[capture: content-1440-tile-03.png, content-1440-tile-04.png, content-375-tile-06.png]

**V2.** The same claims are stated twice at different provenance, with nothing marking which is
canonical. "About This Project" opens "Trust in U.S. news media has dropped to 28%, while 45% of
Americans now identify as independents" and names the 1,000-adult survey — with no links at all. The
first "Ask the Scientists" answer restates the same two figures with inline source links on "28%, a
historic low" and "45% of Americans now identify as independents". Identical body type, identical
heading weight, one sourced and one not. For a dossier this is the exact shape to avoid: a summary
that repeats a claim without carrying the claim's citation, so a reader who stops at the summary sees
an unsourced number they have no way to recognise as sourced elsewhere.
[capture: content-1440-tile-02.png]

**V3.** Every timeline event label is marked up as an `h2` — level with Budget and Meet the Team —
but rendered smaller and lighter than body prose, so the semantic level and the visual level point in
opposite directions. The DOM outline lists IRB Approval, Project Launched, Project fully funded, Data
Collection Complete, Data Analysis Complete, Results Chapter Finalized, Successful Dissertation
Defense and Study ready for publication as `h2`; on screen each is small grey text beside a dot, and
three of the eight are not rendered at all. A screen-reader outline of this page is eight sections
that a sighted reader sees as caption text. Our own rule requires logical heading order on public
pages, and a dossier timeline is where that rule is easiest to break.
[capture: content-1440-tile-05.png, content-1440-scroll-50.png]

## Verification

Independently verified on 2026-09-03 (19:00Z) against the captures. Eleven required images were viewed plus
`index-1440-tile-08.png` and `content-375-tile-05.png`, which two claims needed. **31 confirmed, 21
qualified, 1 refuted, 3 added.**

Refuted and removed:

- **F1** — `content-1440-tile-01.png` does not show the three-step hierarchy it describes: `$2,320`
  is larger and heavier than the h1, and "By Randall Vanadisson" is bold near-black, not grey. F6, by
  the same viewer on the same capture, says the opposite. F6 now carries that screen alone.

Qualified and rewritten:

- **F2** — "About This Project" carries no pictogram, the glyphs differ, and the DOM outline also
  lists eight timeline labels as `h2`.
- **F4** — "reads fourth, behind two buttons" is a reading order a still capture cannot settle;
  narrowed to relative visual weight.
- **F6** — the h1 *is* the research question, so it cannot also "read fourth"; rewritten as the title
  losing to the money, with nothing methodological on the first screen.
- **F9** — the two columns are not row-aligned and their item labels differ; "best-structured"
  softened accordingly.
- **F10** — twelve avatars are rendered, not thirteen; "a full screen band" overstates the height.
- **F11** — not the home page's only numeric element: `$59,130` and `$51,470` are set legibly in the
  grant carousel. The low-contrast observation survives, narrowed to the statistics band.
- **F12** — the gap is a hairline rule plus about 150–170 px, roughly a sixth of a 900 px viewport,
  not "a third of a screen"; the rule was missing from the description.
- **F21** — the funding progress bar is also a data graphic, so "the only data graphic" was narrowed
  to the body of the record.
- **F22** — the diagram does *not* communicate duration: dot pitch is uniform while the intervals are
  16, 19, 25 and 31 days. It encodes order only.
- **F23** — twelve backer avatars, not thirteen.
- **F24** — the teal button is the largest saturated element above the fold, not the only one; the
  `Psychology` and `Social Science` chips are saturated too.
- **F25** — where the inline links go cannot be checked from a capture; the observable property is
  that they are anchored on the claim phrase.
- **F26** — the dots are not identical marks: they step through a decorative green-to-teal gradient
  and the collapsed trailing dot is grey. The gradient tracks position, not status, so the finding
  holds and only the wording changed.
- **F29** — ethics approval *is* surfaced, as the dated timeline row "AUG 05 2026 IRB Approval".
- **F30** — the backers band is money, not engagement; the metadata rows count both.
- **F34** — the blank right column is a layout consequence (F36), not an empty field, so it was
  dropped from the evidence; the hidden-event count was added from the DOM outline.
- **F35** — twelve cartoon heads under a heading reading `13 Backers`; the mismatch is now part of
  the finding.
- **F40 / B1** — borrow the value-and-justification pairing only with a row-binding correction; as
  built the block lets a prose figure contradict its own itemization (V1).
- **F41 / B2** — same narrowing as F25: links anchored on the claim phrase, destinations unverified.
- **F43 / B4** — "sections it lacks simply do not appear" is not observable from a capture; only "no
  placeholder lines anywhere" survives.
- **F44 / A1** — the mark differs by a gradient step, and the uniform spacing is a second, separate
  defect worth naming.

The Phase 2 verdict is unchanged — not-named, and it should stay unassigned. Its one positive
argument was amended rather than withdrawn: the Budget block remains a candidate secondary influence
for structured data blocks, but only with the row-binding correction that V1 makes necessary.
