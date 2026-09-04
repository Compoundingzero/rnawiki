# longecity.org — Track A2 viewing notes (information design of a community site)

LongeCity is a long-running public discussion board — masthead "LongeCity / Advocacy & Research for
Unlimited Lifespans", footer "Community Forum Software by IP.Board / Licensed to: ImmInst.org" —
whose categories are the intervention space RNAWiki covers: AgingResearch (Aging Theories,
Supercentenarians, Biomarkers & Genes, Telomeres), Medicine & Diseases, Supplements (Regimens,
Resveratrol, C60Oil, NAD+, Senolytics), Brain Health, Lifestyle (Nutrition, Calorie Restriction).
It is longevity-relevant, not an off-topic site. Two URLs were captured: the forum index
`https://www.longecity.org/forum/` at 1440x900 and 375x812, and the intended content page
`https://www.longecity.org/forum/forum/3-supplements/` at both viewports. **The content URL did not
serve content.** It returned the board's error page — h1 "Sorry, we couldn't find that!", body "We
could not find the forum you were attempting to view.", reference "[#10333]" — which the manifest
corroborates (`domEvidence.title` "Error - LONGECITY", `headingOutline` of three headings only,
`innerTextLength` 758). So no topic list, no post, no reply or view count, and no per-post metadata
were observed, and nothing below is a description of a LongeCity discussion page. Everything about
record structure comes from the index. `content-1440-tile-02.png` does not exist and is not in the
manifest — the error page is exactly one viewport tall — so that file from the required list could
not be read. `domEvidence.textToHtmlRatio` of 0.0044 was measured on that error page and is not a
usable figure for this site's content pages; it is not compared with the Phase 1 corpus here.

**Banners standing.** `bannerActions` records the consent container closed via its "x" on both index
passes (`#anonymous_element_4`), but **left standing on both content passes** — "no permitted refusal
control in `#user_navigation` (controls: Log In with Google, Sign In, Create Account)". A sign-in
container therefore overlaps every content capture. It cannot be isolated visually, because the dark
top strip carrying "Sign In / Create Account / ENHANCED BY Google" appears in the index captures too,
where consent was dismissed; that strip is not read as evidence of design below. Separately, the
green "Sponsor: CrackAging.com" panel pinned at the top-right corner appears in **every** capture
including the index ones where the consent element was closed, so it is an advertisement the site
serves, not a captured banner, and it is judged as design.

## 1. Visual hierarchy

F1. Hierarchy is carried almost entirely by one device: a full-width saturated blue band with white
text. "Community", "Science & Health" and "Round Table Discussion" are the only large filled colour
areas in the reading column, so they read first — but they read at identical strength, so the page
has a first level and then nothing that separates one section from another. Type size does not
reinforce the band, it runs against it: the band labels are set *smaller* than the forum names
inside them, and "Immortality Institute" is set larger than every other forum name in the list.
[capture: index-1440-tile-01.png, index-1440-full.png]

F2. Second and third levels are colour and indent, not weight or space. A forum name (LongeCity, News
& Resources, AgingResearch, Supplements) is mid-blue link text; its sub-forums sit one indent below
behind a small elbow glyph in the same blue at a smaller size; the last-post cell on the right sets
its post title as a smaller blue underlined link with author and date beneath it in grey. Three
steps, all inside a row about 83 px tall (measured AgingResearch to Lifestyle in
`index-1440-tile-01.png`). [capture: index-1440-tile-01.png]

F3. The masthead ("LongeCity" in serif white, subtitle "Advocacy & Research for Unlimited Lifespans",
then a bar of .org / Districts / Media / SupportUs / Collaborate / Contact / Search / Join) is the
strongest identity mark on the site, and it is persistent chrome rather than the top of the index
document: it is absent from the top of `index-1440-tile-01.png` and is painted at about y=900 of
`index-1440-full.png`, ghosted over the Cycloastragenol row — under the manifest caveat, how a fixed
or sticky element renders in a full-page capture. `content-1440-tile-01.png` shows the same masthead
sitting normally at that page's document top. **Inferred**, and with no DOM support: `domEvidence`
was collected only on the content error page, so its single class-less fixed `div` at top 0 of
height 900 describes that page and says nothing about the index. [capture: index-1440-tile-01.png,
index-1440-full.png, index-1440-tile-02.png, content-1440-tile-01.png]

F4. The error page has the cleanest hierarchy on the site: one large light-grey h1, a hairline-bordered
box holding one sentence, then a "Need Help?" sub-head over three links. Three levels, plenty of
space, nothing competing. It is better organised than the index it belongs to. [capture:
content-1440-tile-01.png]

## 2. Where the eye lands first

F5. Desktop first screen: the eye lands on chrome, and specifically on money. The three highest-contrast
objects are the green sponsor panel overhanging the top-right corner, the yellow-green "Create
Account" button in the dark strip, and the right rail's "Featured Donation Goals" block with a
yellow progress bar, a pre-filled "5.00" field and a black "Donate" button. The forum list — the
actual content — is blue-on-white and quieter than all three. [capture: index-1440-tile-01.png]

F6. Mobile first screen: worse. The sponsor panel overlaps the dark header band, so the first object on
the page is an advertisement drawn on top of the site's own chrome. It does not, however, cover the
navigation: the "Menu" button sits at the far left of that band, roughly 200 px clear of the panel.
[capture: index-375-tile-01.png]

F7. On the content capture the eye lands on the h1 error line, which is correct — but that page has no
content to compete with, so it says nothing about how this site ranks content against chrome.
[capture: content-1440-tile-01.png, content-375-tile-01.png]

## 3. Information density

F8. The index puts fourteen forum rows and five right-rail widgets into roughly the first 1,800 px of a
3,522 px page. Thirteen of the fourteen rows are one line of record: an icon, the forum name, a
comma-separated list of sub-forums, and a right-hand cell holding the newest post as a small avatar
plus truncated title + `|author` + date ("PAI-1 Impacts Telomere Leng... | Michael Lustgarten / 30
Aug 2026"). That is the site's entire record schema at this level: avatar, title, author, date. No
reply count, no view count, no score. Two edge cases matter: the fourteenth row, "Immortality
Institute", carries no newest-post cell at all, and in the LongeCity row the title slot is taken by
the access status "Protected Forum" instead of a post title. [capture: index-1440-tile-01.png,
index-1440-tile-02.png, index-1440-full.png]

F9. The densest object on the page is the poll widget, and it is also the best-structured: a stated
denominator in the header ("199 member(s) have cast votes"), then seven options each carrying an
absolute count, a percentage and a bar — "immortality (22 votes [11.06%])", "(indefinite) life
extension (45 votes [22.61%])", "rejuvenation (34 votes [17.09%])", "anti-aging (35 votes
[17.59%])", "other (10 votes [5.03%])". Count, share and denominator all visible together.
[capture: index-1440-tile-01.png]

F10. Lists are handled as bordered rows in a panel; there are no tables anywhere in the captures, and no
sortable or filterable list. Grouping is by three panels only, and the grouping is editorial-topic
grouping, not evidence grouping. [capture: index-1440-full.png, index-1440-tile-02.png]

## 4. Whitespace

F11. Inside the content, whitespace is uniform and therefore silent: roughly the same padding above a
section band, inside a forum row and between rail widgets, so space never signals that one thing
matters more than another. [capture: index-1440-tile-01.png]

F12. The page's whitespace is spent in the wrong place — on a void. `index-1440-tile-03.png` is an
entirely blank white tile, about 900 px of nothing. In `index-1440-full.png` the main column ends
with the "Discover more" block at about y=1,765 and the rail ends with the Facebook widget at about
y=1,525, and then **nothing is drawn in either column** until "Refer a Friend" at about y=2,875,
after which Popular Tags runs down to the footer. So roughly 1,100 px of a 3,522 px page is
full-width blank. [capture: index-1440-tile-03.png, index-1440-tile-04.png, index-1440-full.png]

F13. The same void appears at mobile: `index-375-full.png` shows both columns empty from below the
forum panels to about y=2,765, where "Refer a Friend" and Popular Tags resume near the footer.
`index-375-tile-04.png` is 812 px of blank — but only because that tile crops the leftmost 375 px of
an 879 px page and the rail's remaining widgets sit outside the crop, so it evidences the clipping
of F33 as much as the void. [capture: index-375-tile-04.png, index-375-full.png]

## 5. Long scroll

F14. The long scroll cannot be judged on the content page and the manifest says why: the error page is
exactly one viewport tall, so `content-1440-scroll-00/-50/-90` are the same page state and the three
mobile scroll captures share one sha256 (`4456a053...`). The three *desktop* sha256s do differ, and
the reason is worth recording: the green "Sponsor: CrackAging.com" panel is in a different animation
position in each frame — fully drawn at scroll-00, slid left and part-cut at scroll-50 and again at
scroll-90 — while every other pixel is identical. On a page whose entire content is an error
message, the advertisement is the only moving element. No persistence, no progress indicator and no
sticky rail behaviour was observable. Judged instead from the index tiles, with the fixed-element
caveat applied. [capture: content-1440-scroll-00.png, content-1440-scroll-50.png,
content-1440-scroll-90.png, content-375-scroll-50.png]

F15. The index's rhythm — banded panel, rows, banded panel — breaks twice, both times for advertising,
and both times *inside* a panel rather than between panels. The sponsor strip ("Visit Sponsor:
CrackAging.com" over a "Cycloastragenol purity 98%" product image) is the **last row of the Science
& Health panel**, directly beneath the Supplements row and within the same border; the "Discover
more" block with "Schedule Urgent Care" and "Try Science Kits" chevron rows is the **last row of the
Round Table Discussion panel**. Each occupies a forum row's slot. [capture: index-1440-full.png,
index-1440-tile-02.png]

F16. The end of the page is a stack of small facts and links rather than a designed close: a live
presence line ("3656 users are online (in the past 15 minutes) / 0 members, 3656 guests, 0
anonymous users (See full list)"), a crawler line ("Google, Bing, Facebook"), a right-aligned "site
rules", then a footer of Change Theme / Mark Community Read / Help / advertisers and two sponsor
credits including "crackaging.com - telomerase activation supplements". [capture:
index-1440-tile-04.png]

F17. "Change Theme" in that footer is the only theme control anywhere in the captures, and nothing in
evidence shows the site responding to an operating-system colour preference:
`domEvidence.prefersColorScheme` reports `found: false` across 47 stylesheets and
`htmlAttributes.dataTheme` is null. But that snapshot was taken on the **content error page**, not
the index, and the switch's own mechanism was never observed — so no claim is made here about how it
works. [capture: index-1440-tile-04.png]

F18. No keyboard-shortcut affordance and no copy control is visible in any of the sixteen images. On the
content error page's DOM snapshot `kbdTexts` and `ariaKeyshortcuts` are both empty, so despite
`scriptTokens.metaKey` and `keyCode` being true there is no evidence for a shortcut palette and none
is claimed; the single `copyControls` hit is a false positive — its label is "Menu's powered by
ProMenu Plus Copyright (c) 2013, Michael S", a copyright string. Those keys describe the error page
only. [capture: index-1440-tile-01.png]

## 6. Imagery

F19. Images decorate; none carry data. What is visible across the captures is one generic category glyph
per forum (DNA helix, caduceus, pill capsules, brain profile, human figure), small avatars beside
last posts, and advertising art — and not a single vector diagram or drawn chart. Remove them and no
information is lost. Note that `imgCount` 66, `imgLazyCount` 0, `svgCount` 0 and `canvasCount` 0
were measured on the **content error page**, not the index, so they corroborate nothing here; this
claim rests on the images. [capture: index-1440-tile-01.png, index-1440-tile-02.png]

F20. The one exception is the poll's bars, and they barely function: flat blue rectangles a few pixels
high sitting under wrapped text, so comparing 22 votes against 45 is done by reading the numbers,
not by seeing the bars. The numbers do the work; the graphic is ornament. [capture:
index-1440-tile-01.png]

F21. Avatars do carry one real signal: a contributor with a photograph is visibly distinguished from the
default grey silhouette, which is the site's only persistent visual difference between one
participant and another. [capture: index-1440-tile-01.png, index-1440-tile-02.png]

## 7. Defers or competes

F22. It competes, and the competitor is commerce. The desktop first screen carries two commercial
surfaces — the corner sponsor panel, and the rail's "Featured Donation Goals" block with its yellow
progress bar, pre-filled "5.00" field, black "Donate" button and "planning a fundraiser? get
certified!" line. A third, the inline Cycloastragenol row, begins just below the fold, and two
credits close the page ("Hosted since 2002 by canaca.com", "Global Forum Sponsor 2015/16:
crackaging.com — telomerase activation supplements"). The site states the arrangement in its own
copy: "some adverts help to support the work of this non-profit organisation. ->options for
advertisers --- to avoid ads join as a Member". [capture: index-1440-tile-01.png,
index-1440-tile-02.png, index-1440-full.png, index-1440-tile-04.png]

F23. The most serious instance for our purposes: the inline advertisement is for a supplement
("Cycloastragenol purity 98%") placed directly above the forum list whose sub-forums are
Resveratrol, C60Oil, NAD+ and Senolytics, and the global footer sponsor is "crackaging.com -
telomerase activation supplements". A vendor of the class of product under discussion is placed
inside the discussion's own frame. [capture: index-1440-full.png, index-1440-tile-02.png,
index-1440-tile-04.png]

F24. The "Discover more" block inverts the usual signal: it wears the site's own panel chrome — a
tinted title bar in the house style, then full-width rows with right chevrons — so it reads as
site navigation, but its rows are "Schedule Urgent Care" and "Try Science Kits". The element
dressed as editorial is the paid one. [capture: index-1440-tile-02.png]

V1. **Added by verification.** Both advertisements sit in a forum-row slot, and they share their
left-column glyph with the members-only section. A small grey speech bubble — visibly different from
the large square forum icons, and used nowhere else on the page — stands in the icon column of
exactly three rows: "Immortality Institute — Members only section" in the Community panel, the
Cycloastragenol sponsor row closing Science & Health, and the "Discover more" block closing Round
Table Discussion. All three also drop the newest-post cell every real forum row carries. So the
site's one "this row is not an ordinary forum" mark covers a paywalled record and two paid
placements with the same symbol. For RNAWiki: a glyph that marks a row as exceptional must encode
exactly one kind of exception, and a restricted record must never share a mark with a placed one.
[capture: index-1440-full.png, index-1440-tile-01.png, index-1440-tile-02.png]

## 8. Information design of data-heavy, uncertain, community-sourced material

F25. **Scope limit, stated plainly.** The page that would have answered this question — a Supplements
topic list — was never served. What follows is drawn from the index's rail widgets and row schema
only, and no claim is made about how a LongeCity thread or post presents data. [capture:
content-1440-tile-01.png, content-1440-full.png]

F26. The closest thing to a structured community dataset on the captured pages is the "Stacks" widget:
five named personal regimens — "Codex Executor" by codexexecutorz (03 May 2025), "Happy and
healthy" by Snozzberry Scientist (27 Apr 2019), "Beta Tryptase" by tennisfann88 (15 Apr 2019),
"Kitchen Sink, aging/brain improvement" by netvillage (04 Jan 2019), "Longevity/Neuroprotection
Stack" by Gayle63 (10 Oct 2017). Each record is exactly three fields: name, author handle, date.
No compound list, no dose, no duration, no outcome, no n, no evidence tier. [capture:
index-1440-tile-02.png]

F27. Those dates are the only uncertainty signal the widget offers, and they are presented without
framing — four of five are six to eight years old, shown in the same grey as everything else, with
no "last updated", no "inactive", no distinction between a regimen someone still follows and one
abandoned in 2017. A date rendered as neutral metadata does not tell a reader that a record is
stale. [capture: index-1440-tile-02.png]

F28. **The site has no visual vocabulary for evidence quality or uncertainty.** Across all fifteen images
viewed there is no verified mark, no reviewed or peer-status badge, no sample count, no replication
indicator, no provenance line, no "self-reported" label, no confidence marker, no citation, no DOI,
no identifier of any kind attached to a claim, and no version. The nearest thing to an identifier
anywhere is the error page's "[#10333]". [capture: index-1440-tile-01.png, index-1440-tile-02.png,
index-1440-tile-04.png, content-1440-tile-01.png]

F29. The badge slot that does exist encodes **access, not evidence**: "Protected Forum" set in italic
underline where a post title would be, "Immortality Institute — Members only section. Click here to
join us as a Member", and a grey disabled bar reading "Guests cannot vote" under the poll. The site
has taught itself to mark permission and never to mark reliability. [capture: index-1440-tile-01.png]

F30. Nothing distinguishes editorial from user-contributed material. "News & Resources" and
"AgingResearch" sit in the identical row template as "Other Conversations / Townhall, Archive";
there is no staff mark, no moderator flag, no sourced-item styling. Combined with F24, the only
block on the page that looks editorial is an advertisement. [capture: index-1440-tile-01.png,
index-1440-tile-02.png]

F31. The "Popular Tags" cloud is the page's other quantitative graphic, and it shows the hazard. Around
fifty tags, varying in both type size and grey tint, put compounds (rapamycin, resveratrol, nad+,
nmn, piracetam, modafinil, c60, oxiracetam, phenibut, alcar), conditions (depression, anxiety,
ADHD, brain fog, anhedonia) and pure forum noise ("intro", "Hello", "new", "07-04-2015",
"01-04-2015", "----") into one weighting system. No number, legend or count appears anywhere in the
widget, so the quantity behind the weight is never named and the reader is left to read importance
into it. [capture: index-1440-tile-04.png]

F32. What a reader gets here that a trial registry cannot: named people attached to regimens across
years (Stacks — a handle you can follow); a folk taxonomy of what people actually take, with
senolytics, c60, nmn and piracetam adjacent in a way no registry taxonomy places them (Popular
Tags); a live measure of attention ("3656 users are online... 0 members, 3656 guests"); and
self-reported preference data with a stated denominator — 199 votes on what the field should even
be called, split across immortality, (indefinite) life extension, curing aging, rejuvenation and
anti-aging. That last one is genuinely unavailable from any registry. All of it is delivered with
no marks that would let a reader weigh any of it. [capture: index-1440-tile-01.png,
index-1440-tile-02.png, index-1440-tile-04.png]

F33. Mobile is not a reflow, it is a clip. `index-375-full.png` is 879 px wide for a 375 px viewport, and
`index-375-tile-01.png` cuts the last-post column mid-record and loses the right rail entirely.
Even the error page's single sentence is severed mid-word at 375 px — "We could not find the forum
you were attempting t...". Every data field this site shows is at risk of being the field that
falls off the right edge. [capture: index-375-full.png, index-375-tile-01.png,
content-375-tile-01.png, content-375-scroll-50.png]

V2. **Added by verification.** The Stacks widget swaps its own field roles between records. Four
entries set the regimen name as the blue link over a grey "handle — date" line: "Happy and healthy"
/ "Snozzberry Scientist - 27 Apr 2019"; "Beta Tryptase" / "tennisfann88 - 15 Apr 2019"; "Kitchen
Sink, aging/brain improvement" / "netvillage - 04 Jan 2019"; "Longevity/Neuroprotection Stack" /
"Gayle63 - 10 Oct 2017". The first entry inverts it — the blue link reads "codexexecutorz" over the
grey line "Codex Executor - 03 May 2025". Nothing labels either slot, so which line is the record
and which is the person is guessed from the words. For RNAWiki's structured data blocks: field role
must be carried by a label or a fixed slot, never by which line happens to be the link. [capture:
index-1440-tile-02.png]

## 9. Absence handling

F34. For a record that does not exist, the site does the right thing and renders a full, honest page: a
plain-language h1 ("Sorry, we couldn't find that!"), one sentence naming exactly what failed ("We
could not find the forum you were attempting to view."), a small right-aligned machine reference
"[#10333]" kept out of the reading line, and three concrete routes forward (log in / help
documentation / contact the community administrator). It invents nothing and it does not pretend
the record is empty rather than absent. [capture: content-1440-tile-01.png, content-375-tile-01.png]

F35. For an empty field inside a record, it renders a placeholder: the default grey silhouette stands
wherever a contributor has no avatar, in the last-post cells and in the Stacks list. [capture:
index-1440-tile-01.png, index-1440-tile-02.png]

F36. For an empty region, it renders a titled void. "Recent Facebook Activity" is drawn as a full
section header with a collapse control over an essentially empty body. [capture:
index-1440-tile-02.png]

F37. The worst absence behaviour is structural rather than textual: when **both** columns run out of
content, the layout keeps scrolling anyway — about 1,100 px of full-width blank at desktop between
the last panel and the rail's "Refer a Friend" widget, and a comparable band at mobile — so "nothing
left to say" is rendered as a large empty room the reader must cross to reach the footer. [capture:
index-1440-tile-03.png, index-1440-full.png, index-375-full.png]

V3. **Added by verification.** The content page's heading outline is not the page a reader sees. The
recorded outline is three headings — h3 "Google Sign in options", h1 "Sorry, we couldn't find
that!", h3 "Ad Notice". Neither h3 text appears anywhere in the 1440 or the 375 capture, and the one
visible sub-head, "Need Help?" above the three recovery links, is not in the outline at all. The
structure offered to a screen reader is therefore led by a sign-in prompt and an ad notice while
omitting the page's only real section. For RNAWiki's logical-heading-order rule: the outline must be
the visible outline, and no consent, sign-in or notice element may inject a heading above the
record's own h1. [capture: content-1440-tile-01.png, content-375-tile-01.png]

## For RNAWiki

### Borrow

B1. **The record-absent pattern, for the dossier reading column and structured data blocks.** When a
programme or revision genuinely does not exist, `content-1440-tile-01.png` is the shape: one plain
sentence saying what was not found, a small dimmed reference id set outside the reading line, and
two or three concrete next actions. Note the distinction from our uniqueness rule — that rule says
an absent *field inside* a rendered page renders nothing at all; this pattern governs a *record
that does not exist*, which is a different case and still needs a page. [capture:
content-1440-tile-01.png]

B2. **Attribution as handle + date on every community record, for the dossier structured data blocks.**
The Stacks widget and the last-post cells both carry author and date with no exceptions
(`index-1440-tile-02.png`). That is the floor. RNAWiki should sit above it — a contributed item
should carry contributor, date and its review state — but never below it.

B3. **State a permission where the control is, not elsewhere.** "Guests cannot vote" printed on the
disabled control and "Members only section. Click here to join us as a Member" printed under the
heading tell a signed-out reader why in the place they were stopped. Applies to every RNAWiki
control a signed-out or unqualified reader cannot use — contribution, review, challenge. [capture:
index-1440-tile-01.png]

B4. **A count always carries its denominator in the same line, for structured data blocks.** The poll
does this correctly: header "199 member(s) have cast votes", then "45 votes [22.61%]" per option.
Every count RNAWiki renders — reviewers, sources, trials, participants — should be readable as a
share of a stated whole without leaving the line. [capture: index-1440-tile-01.png]

### Avoid

A1. **Any commercial surface near evidence, on every surface.** A supplement advertisement inline in the
list of supplement forums, and a "telomerase activation supplements" vendor as the site-wide
footer sponsor. This is the shared constraint's "no vendor links, no supplement retailers, no
affiliate anything" shown as a lived failure: a reader cannot tell where the community's judgement
ends and the sponsor's interest begins. [capture: index-1440-tile-02.png, index-1440-tile-04.png]

A2. **A non-editorial block wearing editorial chrome.** The "Discover more" panel uses the house title
bar and chevron rows and is an ad unit. No RNAWiki block that is not a reviewed record may use the
dossier's section styling. [capture: index-1440-tile-02.png]

A3. **A popularity-weighted tag cloud as a browse mechanism — browse/filter surface.** Weight encodes
traffic, and compounds sit at the same visual level as "Hello" and "07-04-2015". This
*strengthens* the Phase 2 assignment of awwwards.com to browse/filter: a structured filter grid
whose facets are declared is the right answer, and the tag cloud is the concrete counter-example.
[capture: index-1440-tile-04.png]

A4. **A document that scrolls past its own content — dossier contents rail and previews.** In
`index-1440-full.png` both columns are finished by about y=1,765 of a 3,522 px page, yet roughly
1,100 px of blank follows before the rail's last two widgets resume near the footer;
`index-375-full.png` has the same shape. Note what this is *not*: the rail does not outlive the main
column, it is empty through the same band. This is the surface Phase 2 left **unassigned** pending a
decision, and LongeCity contributes a hard negative rule to it: the document's scroll length must
end at the last piece of content in either column, and a contents rail must never extend it.
[capture: index-1440-tile-03.png, index-1440-full.png, index-375-full.png]

A5. **Layout that clips instead of reflowing.** 879 px of page in a 375 px viewport, with data columns
and the entire rail cut off, and an error sentence severed mid-word. RNAWiki's "no horizontal
overflow at 320 px" rule has its illustration here. [capture: index-375-full.png,
index-375-tile-01.png, content-375-tile-01.png]

A6. **Hierarchy by saturated full-width colour band.** Every section shouts at the same volume, so
nothing is genuinely first, and there is no headroom left to mark a row that actually matters.
[capture: index-1440-tile-01.png]

A7. **Letting access marks occupy the badge slot.** "Protected Forum", "Members only", "Guests cannot
vote" are this site's entire badge vocabulary, so a reader learns who may enter and never how good
anything is. RNAWiki's badge slot belongs to the evidence states — UNKNOWN, NOT_MEASURED,
CONTRADICTED, MIXED, CONFIRMED — and permission notices must live in a visibly different register.
[capture: index-1440-tile-01.png]

A8. **A date presented as neutral metadata on a record that may be stale.** Four of five Stacks entries
are 2017–2019, styled identically to the 2025 one. If RNAWiki shows a source or review date, the
staleness must be legible without arithmetic. [capture: index-1440-tile-02.png]

### Phase 2 verdict

**not-named.** longecity.org appears in this worklog only in the legal gate table (row: allowed /
allowed, no terms document located, "capture"); it holds no surface in the Phase 2 table, which
assigns only the ten Track A reference sites. Nothing observed argues for giving it one. The page
that would have had to earn a surface was never served; the layout clips at mobile; hierarchy rests
on a single coloured band; and the site has no vocabulary at all for evidence quality or
uncertainty (F28), which is the exact capability the A2 pass exists to find. It should stay
unassigned.

It does, however, sharpen two existing rows without changing them. It **strengthens** awwwards.com
on browse/filter, by showing what the alternative — a popularity-weighted tag cloud over unvetted
labels — actually looks like (A3). And it supplies the first concrete behavioural rule for the
**unassigned** "dossier contents rail and previews" row: the document's scroll length must end at
the last piece of content in either column (A4). That is a constraint on whatever eventually governs
that surface, not a candidate to govern it. On the frozen home search bar it argues only by contrast: LongeCity's first screen offers no
search field in the content area at all (the only search is a third-party Google box in the top
strip and a "Search" dropdown in the masthead; `domEvidence.searchAffordances` count 0 is consistent
but was measured on the error page, so the captures carry this point, not the DOM), and the result is a
directory the reader must read rather than query. Nothing here belongs above or beside our search
bar.

## Verification

Verified 2026-09-04 against all sixteen images on disk (`content-1440-tile-02.png` genuinely does
not exist, as the viewer recorded). **33 confirmed, 16 qualified, 0 refuted, 3 added (V1–V3).**
Nothing was removed; sixteen claims were narrowed to what the captures actually carry.

- **F1** — qualified. The bands are the loudest device, but type size runs *against* them: band
  labels are smaller than the forum names inside them, and "Immortality Institute" is larger than
  its peers, so "size does no work" was inverted.
- **F2** — qualified. Row pitch measures about 83 px, not 60; and the last-post cell's title is a
  blue underlined link, not grey — only the author and date are grey.
- **F3** — qualified. The visual observation is right and is strengthened by the content page, where
  the masthead sits at the document top. But `domEvidence` was collected on the error page only, so
  `stickyOrFixed` bears on that page, not the index; the DOM key was removed.
- **F6** — qualified. The sponsor panel overlaps the header band, but the "Menu" button is ~200 px
  clear at the far left and is not beneath it.
- **F8** — qualified. Four fields, not three (the avatar is one); the Immortality Institute row has
  no newest-post cell at all; and "Protected Forum" can occupy the title slot.
- **F12, F13, F37, A4/F47** — qualified, one shared cause. The blank band is not the rail outliving
  the main column: the main column ends about y=1,765 and the *rail* ends about y=1,525, with
  nothing drawn in either until y≈2,875. The reading column does not end at ~1,000 px, and
  `index-375-tile-04.png` is blank partly because a 375 px tile crops an 879 px page. The negative
  rule for the unassigned contents-rail surface was rewritten accordingly: the document must not
  scroll past the last content in either column.
- **F14** — qualified. The three desktop scroll captures are *not* one identical frame; their
  sha256s differ because the sponsor advertisement is in a different animation position in each —
  the only moving element on a page that has no content.
- **F15** — qualified, and sharpened: both ads are rows *inside* the panels, not breaks between
  them, which makes F24 and A2 stronger than the viewer stated.
- **F17, F18, F19** — qualified, one shared cause. `domEvidence.collectedFrom` is the content error
  page, so `prefersColorScheme`, `kbdTexts`, `ariaKeyshortcuts`, `copyControls`, `imgCount`,
  `svgCount` and `canvasCount` all describe that page and not the index. The viewer flagged this for
  `textToHtmlRatio` alone. Each claim now says which half the captures carry and which half the DOM
  cannot support.
- **F22** — qualified. Two commercial surfaces on the desktop first screen, not three; the
  Cycloastragenol row begins below the fold.
- **F31** — qualified. About fifty tags, varying in size *and* tint; and no number or legend appears
  anywhere, so "the weight is traffic" is the conventional reading rather than something the page
  states — which is the sharper version of the hazard.

"Guests cannot vote" (F29, B3) was not visible in `index-1440-tile-01.png`, whose crop cuts the
poll's tail, and was confirmed in `index-1440-full.png` before F29 was kept.
