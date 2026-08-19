import { REACH_POSITIONS, stageToReachIndex, reachSentence } from '@/lib/evidence-view'
import type { ProofBoundaryStage } from '@/lib/evidence'

/**
 * How far the direct evidence has progressed. It does not say whether anyone should use the
 * treatment, and it is never a score.
 *
 * The list is an <ol> with the reached item marked in its own text, so the meaning survives with
 * CSS disabled, in print, and in a screen reader. The sentence below is not decorative — four
 * canonical stages share the "People" position and only the sentence separates them.
 *
 * `showCaption` defaults to true and NO CALLER CURRENTLY TURNS IT OFF. It was off inside the
 * Evidence Record on the argument that the identical sentence sits "about one screen above" on the
 * claim itself; measured at 390px that distance is about 1,700px with five section headings in it,
 * which is not one screen and not a duplication a reader can see. An axis with no sentence cannot
 * tell an uncontrolled two-person pilot from a replicated controlled trial, and that distinction is
 * the most consequential thing this site prints. Turn it off only where the same sentence is
 * visible in the same viewport, and say in the call site how you measured that.
 */

/* --------------------------------------------------------------------------
   WHY THIS IS DRAWN IN SVG AND CARRIES ITS OWN STYLESHEET

   1. PRINT. The axis used to be drawn entirely with CSS pseudo-element backgrounds. Browsers
      print with "background graphics" OFF by default, so on paper the whole drawing vanished and
      the reader was left with five words in a column. Inline SVG is foreground content: its
      strokes and fills print whatever the background-graphics setting is. Nothing here is drawn
      with a CSS background, deliberately.

   2. ALIGNMENT, BY ARITHMETIC RATHER THAN BY EYE. Both layouts put the tick and its label at the
      same fraction of the same box, so they cannot drift:
        - horizontal: the <ol> is a five-column grid of equal 1fr columns with no gap, so column i
          spans [i/5, (i+1)/5] of the figure and its centred text sits at (2i+1)/10 — 10%, 30%,
          50%, 70%, 90%. The SVG is 100% of that same box with no viewBox, so `cx="30%"` resolves
          against the identical width and lands on the identical pixel at every width. This is the
          defect that put the marker 38px from its word at 1440: the dot was centred in a cell
          whose label was left-aligned, so the two agreed only when the label happened to fill the
          cell.
        - vertical (<= 30rem): every row is a FIXED 44px and labels are `white-space: nowrap`, so
          row i's centre is exactly 22 + 44i and the SVG puts tick i at exactly 22 + 44i. Fixed
          rows are what makes the vertical geometry computable at all; a row that could wrap would
          desynchronise the drawing from the words, which is the defect that left the marker
          floating between two rungs on a phone.

   3. IT IS A POSITION, NOT A SCORE, and every drawn decision defends that:
        - Monochrome. The reached run is the page's own ink (--text), never --action and never a
          hue that ramps. There is no red-to-green anything to read a verdict off.
        - Colour is never the only difference. Reached ticks are FILLED, unreached ticks are
          HOLLOW, the reached run is 2px and the rail 1px, and the marked label is 600 weight. A
          greyscale printout and a reader with no colour vision see the same thing.
        - The unreached rail is a continuous hairline with ticks on it, not an empty trough
          waiting to be filled. It has no rounded "fill" cap and no track.
        - AND IT IS ACTUALLY VISIBLE, which it was not. --reach-hair was --border (#d2d2d7),
          which measures 1.51:1 on a white panel and 1.38:1 on the recessed --ground band
          inside an evidence record. Worse, the horizontal rail is a 1px stroke drawn on the
          integer y=12, so it straddled two device rows at half coverage each and RENDERED at
          about 1.13:1 — the number a reader actually gets. At that contrast the unreached run
          disappears and the axis reads as having no unreached positions at all: a bar with a
          head on it, which is the single reading this graphic exists to prevent. It is a
          graphical object required to understand the content, so WCAG 1.4.11 asks 3:1 of it.
          It is now --border-control (#8a8a8f), the token this site already keeps for exactly
          this — 3.44:1 on #ffffff and 3.16:1 on #f5f5f7, so it passes on both grounds a
          reach axis is ever drawn on. The rails also carry shape-rendering="crispEdges" so the
          colour that is specified is the colour that lands: a hairline that antialiases across
          two rows delivers half the contrast it declares, which is how a token that measured
          1.38:1 rendered at 1.13:1.
          THE REACHED/UNREACHED DISTINCTION IS STILL NOT CARRIED BY COLOUR. The reached run is
          --text at 2px, the unreached rail is a mid grey at 1px, reached ticks are FILLED and
          unreached ticks are HOLLOW, and the marked label is 600 weight. Raising the rail
          makes the unreached half legible; it does not make the two halves harder to tell
          apart, because three non-colour signals separate them.
        - An unreached tick is drawn in --text-soft, the same ink as the word under it, so every
          one of the five positions is legibly a POSITION. Drawn in the hairline grey they faded
          to about 1.4:1 and the axis read as "one dot on a line" — the thing that must not
          happen is a reader seeing a bar with a head rather than five labelled places.
        - The rail terminates exactly on the outer ticks rather than running to the edge of the
          figure, so the axis reads as bounded rather than as something that continues off-screen
          toward a better answer.
        - The marker is a different KIND of thing from the ticks, not merely a bigger one: it is
          knocked out of the rail and it drops a stem onto its own word. Position five is
          regulatory review, which is not a verdict that a treatment is good, so nothing here may
          say "further right is better".

   4. THE KNOCKOUT DISC IS PAINTED IN --surface, NOT --bg. Hard-coded to --bg it drew a white halo
      on the anchored claim's --bg-soft card — the anchored claim being the primary mobile entry
      path, arrived at from search. Any container that gives itself a ground redefines --surface
      with it, so the disc follows its card. See the --surface comment in app/globals.css.

   5. THE STYLESHEET LIVES HERE, hoisted by React 19 (`href` + `precedence`), because this
      component owns its own drawing and app/globals.css is edited by other work in parallel.
      Class names are `reach-axis__*`; the root keeps `.reach`, which tests/e2e/embed.spec.ts
      counts to assert the embed honours stagePositionApplies(). The older `.reach__steps` /
      `.reach__step` rules in app/globals.css are no longer produced by this component.

   6. THREE PAINT TOKENS, declared on the figure so both drawings inherit them and one
      forced-colors block can restate all three: --reach-hair (the unreached rail),
      --reach-tick (an unreached tick's outline) and --reach-ground (the knockout disc). They are
      aliases over the existing palette, not new colours.

   7. NO MOTION AT ALL. Nothing here transitions, so there is nothing for
      `prefers-reduced-motion: reduce` to neutralise; the blanket rule in app/globals.css still
      covers it if anyone adds one later.

   8. MEASURED, NOT EYEBALLED. Verified in headless Chromium over 15 viewport widths from 240 to
      1920, in three grounds (a standalone page, inside .er__body, and on the anchored claim's
      --bg-soft card) and at all five reach positions: the marker's centre and its own label's
      centre differ by at most 0.01px horizontally and 0.00px vertically, no label overflows its
      column, and no width produces horizontal page scroll. Re-measure the same way after any
      change to the geometry constants below.
   -------------------------------------------------------------------------- */

/** Geometry, shared by the drawing and the stylesheet. Change one, change both. */
const N = REACH_POSITIONS.length

/** Horizontal: column i's centre as a percentage of the figure. 10 / 30 / 50 / 70 / 90. */
const columnCentre = (i: number) => `${((2 * i + 1) * 100) / (2 * N)}%`

const H_HEIGHT = 34 // room for the rail, the marker's knockout disc and the stem
const H_RAIL_Y = 12
const V_ROW = 44 // fixed row height; the vertical geometry depends on it
const V_RAIL_X = 10
const V_HEIGHT = V_ROW * N
/** Vertical: row i's centre. */
const rowCentre = (i: number) => V_ROW / 2 + V_ROW * i

const TICK_R = 3.5
const MARK_R = 5.5
const KNOCKOUT_R = 7.5

const CSS = `
.reach-axis {
  margin: 0;
  position: relative;
  --reach-hair: var(--border-control);
  --reach-tick: var(--text-soft);
  --reach-ground: var(--surface);
}

/* currentColor is the reached ink for both drawings, so the marker and the run cannot drift
   apart from each other or from the marked label. */
.reach-axis__draw { display: block; color: var(--text); }
.reach-axis__draw--h { width: 100%; height: ${H_HEIGHT}px; }

/* The vertical drawing is wrapped so it can carry the 'hidden' ATTRIBUTE. 'hidden' is a UA
   stylesheet rule, so it is the one switch that still holds when author CSS is off entirely —
   with no stylesheet the reader gets one axis and the <ol>, not two axes. SVG elements do not
   accept 'hidden' in React's typings, hence the span. */
.reach-axis__vwrap { display: none; }

/* The <ol> is the meaning; the drawing above is aria-hidden decoration of it. list-style is
   removed, so role="list" keeps the list semantics Safari drops when it is. */
.reach-axis__list {
  display: grid;
  grid-template-columns: repeat(${N}, 1fr);
  margin: 0;
  padding: 0;
  list-style: none;
}
/* NO 'gap'. A gap would make each column narrower than 1/${N} of the figure while the SVG still
   divides the full width, and the tick would drift off its word by half a gap per column. */
.reach-axis__item {
  min-width: 0;
  padding-inline: 2px;
  text-align: center;
  font-size: 0.8125rem;
  line-height: 1.3;
  color: var(--text-soft);
  overflow-wrap: break-word;
}
.reach-axis__item[data-here='true'] { color: var(--text); font-weight: 600; }

/* No font-size of its own: the sentence is body text and must match whatever body text is in the
   surface it lands on — 17px on a standalone page, 16px inside .er__body. */
.reach-axis__caption { margin-top: var(--s4); }

@media (max-width: 30rem) {
  .reach-axis__draw--h { display: none; }
  /* An author rule always beats the UA rule behind the 'hidden' attribute, whatever the
     specificity, so this is what turns the vertical axis back on. */
  .reach-axis__vwrap {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 20px;
    height: ${V_HEIGHT}px;
  }
  .reach-axis__list { display: block; padding-left: 30px; }
  /* Fixed height + nowrap: see note 2 above. Both are load-bearing, not cosmetic. */
  .reach-axis__item {
    height: ${V_ROW}px;
    display: flex;
    align-items: center;
    padding-inline: 0;
    text-align: left;
    white-space: nowrap;
    font-size: 0.9375rem;
  }
}

/* Windows high contrast replaces text and background colours but leaves SVG paint alone, so the
   hairline and the knockout disc would keep their light-theme values on a black canvas. */
@media (forced-colors: active) {
  .reach-axis { --reach-hair: GrayText; --reach-tick: CanvasText; --reach-ground: Canvas; }
  .reach-axis__draw { color: CanvasText; }
}
`

export function EvidenceReach({
  stage,
  showCaption = true,
}: {
  stage: ProofBoundaryStage
  showCaption?: boolean
}) {
  const here = stageToReachIndex(stage)

  /* Paint order matters and is the same in both drawings: rail, then the plain ticks, then the
     knockout disc that clears the rail behind the marker, then the stem, then the marker itself
     on top. */
  const horizontal = (
    <svg
      className="reach-axis__draw reach-axis__draw--h"
      width="100%"
      height={H_HEIGHT}
      aria-hidden="true"
      focusable="false"
    >
      <line
        x1={columnCentre(0)}
        x2={columnCentre(N - 1)}
        y1={H_RAIL_Y}
        y2={H_RAIL_Y}
        stroke="var(--reach-hair)"
        strokeWidth="1"
        shapeRendering="crispEdges"
      />
      {here > 0 && (
        <line
          x1={columnCentre(0)}
          x2={columnCentre(here)}
          y1={H_RAIL_Y}
          y2={H_RAIL_Y}
          stroke="currentColor"
          strokeWidth="2"
        />
      )}
      {REACH_POSITIONS.map((label, i) =>
        i === here ? null : (
          <circle
            key={label}
            cx={columnCentre(i)}
            cy={H_RAIL_Y}
            r={TICK_R}
            fill={i < here ? 'currentColor' : 'var(--reach-ground)'}
            stroke={i < here ? 'none' : 'var(--reach-tick)'}
            strokeWidth="1"
          />
        )
      )}
      <circle cx={columnCentre(here)} cy={H_RAIL_Y} r={KNOCKOUT_R} fill="var(--reach-ground)" />
      {/* The stem is the thing that makes the marker unambiguous: it lands on the top of the
          label's own line box, so "which word is marked" is answered by a drawn line rather than
          by the reader estimating which centre is nearest. */}
      <line
        x1={columnCentre(here)}
        x2={columnCentre(here)}
        y1={H_RAIL_Y + MARK_R}
        y2={H_HEIGHT}
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx={columnCentre(here)} cy={H_RAIL_Y} r={MARK_R} fill="currentColor" />
    </svg>
  )

  const vertical = (
    <span className="reach-axis__vwrap" hidden>
      <svg
        className="reach-axis__draw reach-axis__draw--v"
        width="20"
        height={V_HEIGHT}
        aria-hidden="true"
        focusable="false"
      >
        <line
          x1={V_RAIL_X}
          x2={V_RAIL_X}
          y1={rowCentre(0)}
          y2={rowCentre(N - 1)}
          stroke="var(--reach-hair)"
          strokeWidth="1"
          shapeRendering="crispEdges"
        />
        {here > 0 && (
          <line
            x1={V_RAIL_X}
            x2={V_RAIL_X}
            y1={rowCentre(0)}
            y2={rowCentre(here)}
            stroke="currentColor"
            strokeWidth="2"
          />
        )}
        {REACH_POSITIONS.map((label, i) =>
          i === here ? null : (
            <circle
              key={label}
              cx={V_RAIL_X}
              cy={rowCentre(i)}
              r={TICK_R}
              fill={i < here ? 'currentColor' : 'var(--reach-ground)'}
              stroke={i < here ? 'none' : 'var(--reach-tick)'}
              strokeWidth="1"
            />
          )
        )}
        <circle cx={V_RAIL_X} cy={rowCentre(here)} r={KNOCKOUT_R} fill="var(--reach-ground)" />
        {/* No stem on the vertical axis: the marker already shares a row with its label, and a
            horizontal stub pointing at the word would read as a list bullet. */}
        <circle cx={V_RAIL_X} cy={rowCentre(here)} r={MARK_R} fill="currentColor" />
      </svg>
    </span>
  )

  return (
    <figure className="reach reach-axis">
      <style href="rnawiki-evidence-reach" precedence="component">
        {CSS}
      </style>
      {horizontal}
      {vertical}
      <ol className="reach-axis__list" role="list">
        {REACH_POSITIONS.map((label, i) => (
          <li
            key={label}
            className="reach-axis__item"
            data-here={i === here ? 'true' : 'false'}
          >
            {label}
            {i === here && <span className="skip-link">— testing has reached this point</span>}
          </li>
        ))}
      </ol>
      {showCaption && <figcaption className="reach-axis__caption">{reachSentence(stage)}</figcaption>}
    </figure>
  )
}
