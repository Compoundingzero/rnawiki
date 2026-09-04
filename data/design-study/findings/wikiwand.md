# wikiwand.com — Track A1 visual findings (verification of Felix's own reading)

Eight captures supplied by Felix from his own browser on 2026-09-04 (no fetch, no legal gate, no
terms question). Every one was viewed. All eight are **816 × 1398 raster px**; the manifest records
`home-2.png` as `167772160 × 536870912`, which is a corrupt dimension pair — `sips` reports the file
as 816 × 1398 like the others. Three surfaces are covered: the marketing home page (`home-1`,
`home-2`, `home-3`, consecutive scroll positions of one page), the About page (`about-4`), and one
article, *The Lion-man's Ice Age Mysteries* (`article-5`, `article-6`, `article-7` — a continuous
scroll of one page — and `article-8`, its foot). The nav renders a full desktop bar (Upgrade, About,
Timelines, Top Qs, Fact Checks, Start free, avatar) with a ~70 px page gutter and a 646 px card
band, so these are almost certainly downscaled renders of a wider window (a ~1200 px container at
~0.57 scale fits every measurement). **All pixel figures below are raster px at the supplied 816 px
width**; ratios are scale-free and are the safer thing to build from.

Felix's twelve structural claims are verified in §10. Nothing in this file is inferred from the
site's own marketing copy: `imagesViewed` is the whole evidence base.

## 1. The question block — the governing structure

**F1.** An article body is a flat run of numbered questions. There are no section headings, no
`##`-style topic titles and no prose between blocks. Seven blocks, Q1 through Q7, numbered
continuously with no gaps, no restart and no pagination or "load more" at the end.
[article-5.png, article-6.png, article-7.png]

**F2 — exact anatomy of one block (measured on Q5, `article-7.png`).** In reading order:

- **Badge.** A filled rounded square, **21 × 22 px**, fill ≈ `rgb(29, 31, 244)` (a saturated
  indigo-blue), white sans label `Q5` at about 7 px cap height. Corners are rounded, not pill — the
  corner pixel is background, the pixel one in is fill. It occupies **x 213–233**, entirely in the
  left margin, with a **10 px** clear gutter to the text column at x 243. Its top edge (y 122) sits
  4 px above the heading's cap line (y 126), so it optically aligns with the first heading line.
- **Heading.** Serif, bold, dark. Glyph band 13 px per line, line pitch **18 px**, wrapped to the
  full measure. One to three lines observed (Q5 and Q6 two, Q4 three, Q7 two).
- **Rule.** A **1 px** hairline at `rgb(227, 227, 227)`, spanning **x 243–586 = 344 px** — exactly
  the text measure, not the badge column and not the page. It sits **18 px below** the last heading
  line and **21 px above** the first body line. One rule per block, under the heading only.
- **Paragraphs.** Sans, dark grey, glyph band 10 px, line pitch **16 px** (leading ≈ 1.6). Every
  complete question in the captures carries **exactly two** paragraphs — Q1, Q3, Q5, Q6, Q7 all two;
  Q2 shows at least two. Never one, never three.
- **Anchor.** An inline `#` glyph followed by an underlined italic section name, e.g. `#Interpretation`.

**F3 — the badge is sticky.** In `article-5.png` the `Q2` badge sits beside the Q2 heading at
y ≈ 1181. In `article-6.png`, a later scroll position of the same page, the `Q2` badge is at the very
top of the viewport (y ≈ 18) beside a *continuation* paragraph, hundreds of pixels below where the
heading was. The badge pins in the left margin for the life of its block. Felix did not record this
and it is the single most transferable mechanic here: it tells a scrolling reader which question they
are inside without any contents rail. [article-5.png, article-6.png]

**F4.** Question headings are written as complete natural-language questions ending in `?`, 8 to 20
words, and several are compound — a fact clause plus a dispute clause joined by an em-dash: "Does the
figurine represent a male, a female, a lion, or a human–lion hybrid—and why is this still debated?"
(Q4); "Why do the seven carved grooves on its left arm matter to archaeologists?" (Q7). The compound
form lets one block carry a value and its contest without a second block.
[article-6.png, article-7.png]

**F5.** Every answer's first sentence answers the question directly by restating its terms: "The
Lion-man is considered one of the oldest known artworks because radiocarbon dating places…" (Q1);
"The seven parallel transverse grooves on the Lion-man's left arm matter because they are deliberate
carved marks, not accidental damage." (Q7). No throat-clearing, no context sentence first.
[article-5.png, article-7.png]

**F6.** Uncertainty is written in ordinary words inside the paragraph, not as a label or a badge:
"remains unresolved" (Q4), "cannot by itself establish the figurine's exact purpose" (Q5), "may
support that interpretation, but it cannot prove it" (Q6), "Their precise meaning remains unknown"
(Q7). The hedge sits in the same face and colour as the assertion. [article-6.png, article-7.png]

**F7.** Bold is used twice in seven questions: "about 35,000–41,000 years old" (Q1) and "311 mm
(31.1 cm)" (Q3). Both are a value inside a running sentence; no whole sentence is bolded anywhere.
Note that the first bold span is a hedged phrase, not a bare figure — the hedge is bolded with the
number. Bold is rare, roughly one span per three or four blocks. [article-5.png, article-6.png]

**F8.** Inline entity links in the body are underlined and set in the same dark body colour, not
blue: `Aurignacian`, `Museum Ulm`, `World War II`, `Joachim Hahn`, `Elisabeth Schmid`, `shamanism`,
`Hohle Fels`, `burins`, `therianthropic`. On the whole article surface only two things carry colour:
the Qn badge and the `~` glyph. [article-5.png, article-6.png, article-7.png]

## 2. Provenance and freshness

**F9.** Provenance is attached to the **paragraph**, not to the answer and not to the page. Of the
eleven paragraphs fully visible across the three article captures, **seven carry an anchor and four
do not** — Q3 p2, Q5 p2, Q6 p2 and Q7 p1 end with no anchor at all, and the page does not read as
broken. The unanchored paragraphs are the interpretive ones; the anchored ones carry the sourced
values. [article-5.png, article-6.png, article-7.png]

**F10 — the anchor's exact wording and placement.** Three forms occur:

1. Trailing, bare: the paragraph's last sentence ends, then `#History` or `#Manufacture` —
   Q1 p1 `…with flint tools. #History`; Q1 p2 `…remains on display at the Museum Ulm. #Manufacture`;
   Q2 `…a major investment of time. #Manufacture` (wrapping onto its own line); Q3 p1 `…clarified its
   feline character. #History`; Q4 `…remains open to interpretation. #Interpretation`; Q5 p1 `…a
   place for ritual activity. #Interpretation`.
2. In prose, mid-sentence: Q6 p1 `…a striking example of a therianthropic, or human-animal hybrid,
   image. See #Interpretation.` — the anchor is the object of a sentence and the full stop follows it.
3. Paired: Q7 p2 `…such intentional details are important evidence for the symbolic and artistic
   capacities of Aurignacian people. See #Manufacture and #Interpretation.`

The glyph is always a literal `#`; the target is underlined italic; the target is always a **section
of the same Wikipedia article**, never an external citation, a reference number or a snapshot.
[article-5.png, article-6.png, article-7.png]

**F11 — what the header line literally says.** In `article-5.png`, directly under the title, centred:
a small `W` monogram, then the underlined link text `Lion-man`, then a clock glyph, then `9/2/2026`.
Nothing else — no author, no reading time, no revision id, no "last verified". Glyph band 9 px, a
notch smaller than body text. [article-5.png]

**F12.** The related cards repeat the same source+date line — `W Orion Nebula 🕐 29/03/2026`,
`W Far side of the Moon 🕐 11/04/2026`, `W PayPal 🕐 14/03/2026`, `W Corleck Head 🕐 18/03/2026`,
`W Islamic State – Somalia Province 🕐 14/03/2026`, `W Henry Darger 🕐 12/04/2026` — but in a
**different date format** from the article header. `9/2/2026` on the article is ambiguous (M/D or
D/M); the cards use unambiguous `DD/MM/YYYY`. One site, two formats, on pages that link to each
other. [article-5.png, article-8.png]

**F13.** No date appears anywhere inside a question block. Freshness is a property of the page (and
of a card), never of an answer or a value. [article-5.png, article-6.png, article-7.png]

## 3. How the page opens, and how it ends

**F14 — what precedes Q1.** Three things, in this order, and none of them is editorial:

1. A **header card**: white, rounded, 1 px bordered, x 171–629 (458 px wide) × ~125 px tall, floating
   on the page ground. Inside it, *above* the title, two small outlined pill buttons — `More top Qs`
   with a magnifier glyph and `Share` with an arrow glyph — then the serif title *The Lion-man's Ice
   Age Mysteries* (single line, glyph band 24 px, ~2.4× body), then the source+date line of F11. The
   same "two buttons above the thing you came for" pattern Felix flagged on the home page recurs here
   above the article title.
2. A **promotional strip**: a pale lavender rounded bar spanning x 155–647, reading "Wikiwand built
   these questions from Wikipedia in seconds. Make your own, free." with a black pill button
   `Make your own, free` at its right end.
3. Q1.

There is **no lede, no abstract, no summary, no key-facts panel and no table of contents** between
the title and the first question. The first editorial sentence on the page is the first sentence of
Q1's answer. [article-5.png]

**F15 — what the article does at the end.** After Q7's last paragraph: a centred indigo `~` glyph
(13 px wide, `rgb(55, 62, 169)`), then a small-caps grey eyebrow `MORE TOP QUESTIONS` at the far left
of the *wide* band (x 77, not the 243 of the reading column), then the six-card grid, then a hairline
rule broken by a centred Wikiwand logo mark, then a serif headline "Get more from every article".
The article terminates in **conversion**, not in the record: no reference list, no source list, no
revision history, no "last verified", no edit or correction route. [article-7.png, article-8.png]

## 4. Navigation, and what is absent

**F16.** The article offers **no contents rail, no in-page jump list, no sticky section nav, no
progress indicator and no left sidebar**. The only navigation on the whole surface is: the top site
nav (chrome), the `More top Qs` pill in the header card, the `#Section` anchors that leave for
Wikipedia sections, the inline entity links, and the card grid at the foot. The multi-panel reader UI
with a left contents list visible in the home-page product video (`home-1.png`) does **not** appear in
any real article capture. [article-5.png, article-6.png, article-7.png, article-8.png]

**F17.** Seven questions is the whole article. At two paragraphs and roughly 90–140 words each, the
body is about 700–1,000 words. The absence of a contents rail is affordable at that length; it is a
different decision at RNAWiki's density. [article-5.png, article-6.png, article-7.png]

## 5. Images in the column

**F18.** Both article images sit inline between paragraphs, **left-aligned to the measure's left edge
(x 243) and narrower than the measure — 307 px against 344**, so they are inset ~37 px from the right
and are not full-bleed and not centred in the column. Each is a tall portrait raster on a dark ground.
The caption ("Lion-man figurine"; "Side view showing the transverse gouges on the left arm") is small
italic grey, glyph band 9 px, and is **centred on the image**, not on the column — its centre falls at
x ≈ 397, the image's centre, not the measure's 414. [article-5.png, article-6.png]

## 6. The related-content band

**F19.** Six cards in a **2 × 3 grid** spanning x 77–722 (**646 px**), which is 1.9× the article's own
reading measure — the band deliberately breaks the column. Each card is white, rounded, 1 px bordered,
and contains, in order: a small **centred rounded-square thumbnail** (roughly 80 × 80 px, not a
full-width or gradient image), a **centred serif bold title** on one or two lines, the source+date
line of F12, then **exactly two preview questions**. Each preview is a `Qn` badge on **its own line,
left-aligned above the question text** — not in a margin, as on the article — followed by the question
in small sans grey. The second preview truncates with an ellipsis when it overruns ("…attitudes toward
children and…"). The card shows a reader the actual questions, not a description of the page.
[article-8.png]

## 7. Shell, bands and rhythm (home and about)

**F20.** Serif for every heading and headline; sans for every body paragraph, caption, label and
button. Consistent across all three surfaces. [home-1.png, about-4.png, article-5.png]

**F21.** Full-bleed alternating bands on the home page, white `rgb(254,254,254)` against a very light
grey `rgb(247,247,247)`; the band edges run the full 816 px while content stays in the centre column.
[home-1.png, home-3.png]

**F22.** The band rhythm is: small-caps eyebrow → serif headline of at most three lines → one short
sans paragraph → at most one button. But the eyebrow is **not reliably coloured**: `AI THAT WORKS ONLY
FROM WIKIPEDIA` is indigo (sampled ≈ `rgb(83,99,153)` on stroke), `READING PAST ONE LANGUAGE'S BIAS`
is rose (darkest sample `rgb(159,110,129)`), while `MADE WITH WIKIWAND` is grey `rgb(130,130,130)` and
`SET IT UP ONCE` is grey `rgb(126,126,126)`. Two of four sampled eyebrows are neutral. The first home
band ("General AI chatbots give you an answer.") has no eyebrow at all and no button.
[home-1.png, home-2.png, home-3.png]

**F23.** Emphasis at headline scale is carried by **colour, not weight**: "General AI chatbots give
you an answer." is set in black and "Wikiwand helps you understand it." in indigo `rgb(68,102,188)`,
one headline, two clauses, two colours. It is the headline-scale analogue of the bolded figure in the
body. [home-1.png]

**F24.** Feature lists are wrapped checkmark pills, not bullets: five outlined rounded pills — `10
themes`, `Serif or sans`, `Adjustable width & text size`, `Keyboard navigation`, `Bookmarks & side
panels` — four on one row and the fifth centred on a second row. Each carries a tick glyph before its
label. [home-3.png]

**F25.** The four capability panels are a 2 × 2 grid of tinted rounded cards (lavender and pale blue)
with a small line icon top-left, a serif bold title, and a two-to-three-line sans description. The
icon's colour keys the card's tint. [home-2.png]

**F26.** The explore grid is 4 × 4 dark-gradient image tiles with the subject name in white serif at
the foot and, under it, a small dark pill badge naming the **type** of page — `W ARTICLE`, `TOP QS`,
`TIMELINE`. A type badge, not a category. [home-2.png]

**F27.** A claims panel pairs left-hand prose plus a black pill button with a right-hand outlined card
whose heading is preceded by a small coloured dot — `● Checked against sources`, with a two-line
explanation of what is checked against what. [home-3.png]

**F28.** Social proof is three quote cards (sans quote, then avatar + name + handle) followed by a row
of five monochrome press wordmarks under a small-caps `FEATURED IN`. [home-3.png]

**F29.** The `~` glyph is the site's only ornament and marks a major block boundary on both a marketing
page and an article: between "Using AI" and "Our Team" on About, and between Q7 and MORE TOP QUESTIONS
on the article. Centred, indigo, ~13 px wide. [about-4.png, article-7.png]

**F30.** The About page reuses the article's narrow measure for a non-question page: a centred serif
`About` h1, then left-aligned sans body at the same measure, left-aligned serif h2 subheads
("Supporting Wikipedia", "Using AI"), one image inset in the column, the `~`, then `Our Team` — five
headshots in a row with name (serif bold), role (grey sans) and `LinkedIn / X` links. The narrow
column is the site's default, not an article special case. [about-4.png]

**F31.** On the home page the first screen's largest object is a **product video with a play button**,
not type: the hero is headline → paragraph → two buttons → micro proof line → search field → video.
The search field is a bordered rounded input reading `Search Wikiwand` with a `⌘+K` chip at its right
end, spanning x 213–587 — the same 374 px slot the article's reading column occupies. [home-1.png]

## 8. Measurements

| Thing | Raster px @ 816 wide | Notes |
| --- | --- | --- |
| Article reading measure | **344** (x 243–586) | 42% of viewport; equals the rule width exactly |
| Qn badge | 21 × 22, rounded square | fill ≈ `rgb(29,31,244)`, white label |
| Badge → text gutter | 10 | badge fully outside the measure |
| Rule under heading | 1 px tall, 344 wide, `rgb(227,227,227)` | 18 px below heading, 21 px above body |
| Heading glyph band / pitch | 13 / 18 | |
| Body glyph band / pitch | 10 / 16 | leading ≈ 1.6× |
| Heading : body size ratio | **≈ 1.3 : 1** | the block heading is only slightly larger than its answer |
| Article title glyph band | 24 | ≈ 2.4× body |
| Caption / meta / eyebrow glyph band | 9 / 9 / 7 | |
| Article image | 307 wide | narrower than the measure, left-aligned |
| Header card | 458 × ~125 | |
| Promo strip | 493 wide (x 155–647) | |
| Related-card band | **646** (x 77–722) | 1.9× the reading measure |
| Page gutter | ~70 each side | |
| Band colours | `rgb(254,254,254)` / `rgb(247,247,247)` | |

Derived, and flagged as derived: if these are ~0.57-scale renders of a ~1440 px window with a
~1200 px container, the true figures are a reading measure near **600 css px**, body near 17–18 px on
28 px leading, block heading near 23 px, article title near 42 px. Build to the **ratios**, not to the
raster numbers.

## 9. Limits — what no capture shows

- **No mobile or narrow-viewport evidence exists.** All eight files are 816 × 1398 and every one
  renders the full desktop nav. No responsive claim about Wikiwand can be made from this set.
- No hover, focus or keyboard state is observable in a static capture; the hover-preview behaviour the
  site's own copy describes is asserted in text on `home-2.png` and never shown.
- Timelines, Top Qs (as a surface) and Fact Checks are named in the nav and never captured.
- Only one article is captured, so "seven questions" and "always two paragraphs" are properties of
  *this* article; they are consistent within it, not proven site-wide.
- The manifest's `home-2.png` dimensions are corrupt and should be corrected to 816 × 1398.

## 10. Verdict on Felix's claims

**Confirmed (11)**

1. Article pages are numbered questions, not sections, with Qn badges in the left margin — F1, F2.
2. Serif question heading — F2.
3. Hairline rule — F2; and it is exactly 1 px, `rgb(227,227,227)`, the exact width of the measure,
   sitting *below* the heading.
4. Header carries source link **and** date — F11.
5. Serif headings / sans body — F20.
6. Alternating white/grey full-bleed bands — F21.
7. Feature lists as wrapped checkmark pills, not bullets — F24.
8. Card grids with dark-gradient images and a small type badge — F26.
9. `~` glyph between major blocks — F29.
10. DO NOT COPY — two buttons above the search field — F31; and the same pattern recurs above the
    article title in the header card (F14), so it is a site habit, not a home-page accident.
11. LIMIT — Wikiwand is thin per page — F17: seven questions, ~700–1,000 words total.

**Qualified (9)**

1. *"1–2 sans paragraphs"* — sans confirmed, but the count is not variable: **every complete question
   carries exactly two paragraphs** (Q1, Q3, Q5, Q6, Q7; Q2 at least two). Never one. F2.
2. *"Each answer ends with an italic anchor to its source section"* — **not each**. Anchors attach to
   individual paragraphs, and **4 of 11 visible paragraphs carry none**. F9.
3. *"Provenance per claim, not per page"* — per **paragraph**, and the target is a **section of the
   same Wikipedia article**, not a source record. A section is not a citation. F9, F10.
4. *"Freshness attached to the claim"* — the date is attached to the **page header** (and to each
   related card). **No date appears inside any question block.** F11, F13.
5. *"Bold marks the decisive figure, never a whole sentence"* — the negative half holds exactly; the
   positive half is rarer than implied (two spans in seven questions) and one of the two bolds a
   hedged phrase, "about 35,000–41,000 years old", not a bare number. F7.
6. *"Images inline with small italic grey captions"* — true, but images are **narrower than the
   measure and left-aligned**, and the caption is centred on the **image**, not the column. F18.
7. *"Related content as 2-col cards … two preview questions with badges"* — true, with three
   differences: the thumbnail is a small **centred square**, not a full-width or gradient image; the
   preview badges sit **above their text on their own line**, not in a margin; and the band is 646 px,
   **1.9× the article's own measure**. F19.
8. *"One narrow centred column"* — there are **two** measures: a 344 px reading column and a 646 px
   card band, plus a near-full-width hero video on home. The narrow column governs reading, not the
   page. F19, F31.
9. *"Coloured small-caps eyebrow"* — small-caps confirmed; **coloured is not the rule**. Two of four
   sampled eyebrows are grey, one indigo, one rose, and one band has no eyebrow and no button at all.
   F22.

**Not seen (3)** — no capture in this set can settle these:

1. Any mobile or narrow-viewport rendering — all eight files are 816 × 1398 desktop.
2. Hover preview behaviour (asserted in the site's own copy on `home-2.png`, never depicted).
3. The Timelines, Top Qs and Fact Checks surfaces named in the nav.

**Added (20)** — F3 (sticky badge), F4 (compound question wording), F5 (answer restates the question),
F6 (uncertainty in ordinary words), F8 (links underlined dark, only two coloured things on the page),
F10 (three anchor forms and their exact wording), F12 (two date formats on one site), F13 (no date
inside a block), F14 (header card with two pills above the title; promo strip; no lede or contents
before Q1), F15 (the article ends in conversion, not in the record), F16 (no contents rail anywhere),
F17 (the length that makes that affordable), F19 (badge-above-text in cards; band breaks the measure),
F23 (two-colour headline as headline-scale emphasis), F25 (icon-keyed tinted capability panels), F27
(dot-headed "checked against" card), F28 (quote cards + press row), F30 (About reuses the same
measure), F31 (video is the largest first-screen object; search slot equals the reading measure), plus
the corrected `home-2.png` manifest dimensions in §9.

## 11. For RNAWiki

Wikiwand governs the dossier page structure. The borrow list below is written to be built from.

**Borrow**

- **B1 — The dossier body is a flat run of numbered question blocks, not sections.** Fixed block
  shape, repeated: `Qn` badge in the left margin (rounded square, ~21 px at this scale, single accent
  fill, white label, 10 px clear of the measure) → serif question heading, 8–20 words, ending in `?`,
  wrapping to at most three lines → a 1 px hairline the **exact width of the measure**, 18 px under
  the heading → body. Numbering continuous from Q1, no gaps, no restart. (F1, F2)
- **B2 — Exactly two paragraphs per block.** Wikiwand's blocks never vary, and that invariance is what
  makes 344 px of column read as a structure rather than a list. Cap our derived blocks at two; if a
  question needs three, it is two questions. (F2)
- **B3 — Sticky question badge.** Pin the `Qn` badge in the left margin for the life of its block so a
  scrolling reader always knows which question they are inside. At RNAWiki's density this is the
  cheapest usable substitute for the contents rail Wikiwand does not have. (F3)
- **B4 — Per-paragraph provenance anchor, in the running text, at the end of the paragraph.** Adopt
  the placement and the three forms (trailing bare; `See <target>.` mid-sentence; `See <a> and <b>.`).
  Change the target: ours must name the **exact saved source snapshot** and carry the supports /
  qualifies / contradicts verb the copy rules require, never a section of our own page. (F10)
- **B5 — Not every paragraph gets an anchor.** Four of eleven carry none and the page does not look
  broken. Rule: anchor the paragraph that states a sourced value; leave an interpretation paragraph
  unanchored (and marked as interpretation) rather than manufacturing a citation for it. This is the
  presentational form of "absent data renders nothing". (F9)
- **B6 — At most one bold span per block, a value inside a sentence, never a whole sentence.** Roughly
  one span per three blocks is the observed density. If a block has no decisive measured value, it has
  no bold. (F7)
- **B7 — Header line = source + date, in that order, each preceded by a small glyph, directly under
  the title.** Ours carries the source register and the last-verified date. **One date format across
  the entire site** — Wikiwand's `9/2/2026` on the article against `29/03/2026` on its own cards is
  the failure to avoid. (F11, F12)
- **B8 — Freshness must go further down than Wikiwand takes it.** They date the page; R9 requires a
  per-field source date and a last-verified date. Put the date pair on the block or on the anchored
  value, not only in the header. (F13)
- **B9 — Compound question wording as the compression device.** "…—and why is this still debated?"
  lets one block carry a value and its dispute together. Feed this pattern into the R7 derivation
  rules; it is how one block absorbs a `MIXED` or `CONTRADICTED` state without a second block. (F4)
- **B10 — Answer opens by restating the question's terms and answers in sentence one.** No lede, no
  abstract, no key-facts panel before Q1; the first editorial sentence on the page is the first
  sentence of the first answer. (F5, F14)
- **B11 — Uncertainty in ordinary words, in the body, in the same face and colour as the assertion**
  ("may support that interpretation, but it cannot prove it"). That is how `UNKNOWN`, `MIXED`,
  `NOT_MEASURED` and `CONTRADICTED` should read to a reader while the enum itself stays in the
  labelled technical disclosure. (F6)
- **B12 — Images left-aligned to the measure's left edge, narrower than the measure, with a small
  italic grey caption centred on the image.** No full-bleed figures in the reading column. (F18)
- **B13 — Related content as a card band that breaks the measure (≈1.9×), two columns:** thumbnail,
  centred serif title, source+date line, then **two preview questions each with its own `Qn` badge
  above the text**. Showing the actual questions rather than a description is the browse unit R12
  needs, and it reuses the dossier's own vocabulary. (F19)
- **B14 — Restraint budget, measurable.** One accent colour on the reading surface, used only for the
  badge and the block-boundary `~`; body links underlined in the body colour, never blue; heading only
  ~1.3× body; leading 1.6×; one 1 px hairline per block. Everything else is space. (F2, F8, F29)

**Avoid**

- **V1 — Two buttons above the search field.** Wikiwand does it on home *and* above its article title;
  the RNAWiki home search bar is frozen and nothing goes above it. (F31, F14)
- **V2 — No contents rail.** Affordable at 7 questions and ~900 words; at RNAWiki's density it is a
  defect. Ship B3 (sticky badge) *and* a real contents affordance, per the closed contents-rail
  decision. (F16, F17)
- **V3 — Ending the page in conversion.** Wikiwand's article ends `~` → related cards → logo rule →
  "Get more from every article", with no reference list, no source list and no revision history. The
  dossier must end in the record: sources, review history, last verified, correction route. (F15)
- **V4 — A promotional strip between the header and the first question.** (F14)
- **V5 — Anchors that point into the same document's own sections while reading as provenance.** A
  section is not a source; this is exactly the "never imply a linked source proves a conclusion"
  boundary. (F10)
- **V6 — Mixed date formats.** (F12)
- **V7 — A single page-level date presented as the freshness of every statement on it.** (F13)
- **V8 — Product/AI language in eyebrows and headlines** ("An AI that reads Wikipedia…", "Wikiwand's
  AI organizes and connects it") — barred by our copy rules regardless of the layout it sits in.
  (home-1.png, home-3.png)
- **V9 — Deriving anything from the multi-panel reader UI in the home-page product video.** It is
  marketing footage; no captured article renders it. (F16)
